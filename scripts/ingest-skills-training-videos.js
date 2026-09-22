#!/usr/bin/env node
/**
 * Downloads each registrant's submitted Google Drive video and re-hosts it
 * on Vercel Blob, so the admin review page doesn't depend on each
 * submitter's individual Drive sharing settings staying correct.
 *
 * Writes results back into the SkillsTraining sheet (columns H-L):
 *   Hosted Video URL | Ingest Status | Ingest Note | Last Ingested Link | Review Status
 *
 * Safe to re-run: rows whose video link hasn't changed since the last
 * successful ingest are skipped. If a link changes after a prior
 * Approve/Reject, the review status is reset to Pending.
 *
 * Usage:
 *   node scripts/ingest-skills-training-videos.js --dry-run
 *   node scripts/ingest-skills-training-videos.js --run
 *   node scripts/ingest-skills-training-videos.js --run --limit=5
 */

const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^([^=#]+)=(.*)$/);
    if (m) {
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[m[1].trim()] = val;
    }
  }
}
loadEnvLocal();

const { google } = require('googleapis');
const { put } = require('@vercel/blob');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isRun = args.includes('--run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

if (!isDryRun && !isRun) {
  console.error('Specify --dry-run (preview only) or --run (actually ingest videos)');
  process.exit(1);
}

const MAX_BYTES = 300 * 1024 * 1024; // 300MB safety cap
const SHEET_NAME = 'SkillsTraining';
const DATA_RANGE = `${SHEET_NAME}!A2:L`;

function extractDriveFileId(link) {
  if (!link) return null;
  let m = link.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  m = link.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  return null;
}

function colToLetter(rowNumber) {
  return rowNumber; // not used, kept for clarity of intent below
}

async function getSheetsAndDrive() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });
  return { sheets, drive };
}

async function getLatestRowsPerEmail(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: DATA_RANGE,
  });
  const rows = res.data.values || [];

  const byEmail = new Map();
  rows.forEach((row, i) => {
    const rowNumber = i + 2; // sheet row number (1-indexed, +1 for header)
    const [
      timestamp, name, email, phone, track, experience, videoLink,
      hostedVideoUrl, ingestStatus, ingestNote, lastIngestedLink, reviewStatus,
    ] = row;
    if (!email) return;
    byEmail.set(email.trim().toLowerCase(), {
      rowNumber, timestamp, name: (name || '').trim(), email: email.trim(),
      phone: phone || '', track: track || '', experience: experience || '',
      videoLink: (videoLink || '').trim(),
      hostedVideoUrl: hostedVideoUrl || '',
      ingestStatus: ingestStatus || '',
      ingestNote: ingestNote || '',
      lastIngestedLink: lastIngestedLink || '',
      reviewStatus: reviewStatus || '',
    });
  });
  return Array.from(byEmail.values());
}

async function downloadAndHost(drive, fileId, fallbackName) {
  const meta = await drive.files.get({
    fileId,
    fields: 'id,name,mimeType,size',
  });

  const { mimeType, size, name } = meta.data;
  if (!mimeType || !mimeType.startsWith('video/')) {
    throw Object.assign(new Error(`File is ${mimeType || 'unknown type'}, not a video`), { code: 'INVALID_TYPE' });
  }
  if (size && Number(size) > MAX_BYTES) {
    const mb = (Number(size) / (1024 * 1024)).toFixed(0);
    throw Object.assign(new Error(`File is ${mb}MB, exceeds the ${MAX_BYTES / (1024 * 1024)}MB limit`), { code: 'TOO_LARGE' });
  }

  const stream = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  const safeName = (name || fallbackName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const blob = await put(`skills-training-videos/${fileId}-${safeName}`, stream.data, {
    access: 'private',
    contentType: mimeType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
  });

  return blob.pathname;
}

async function main() {
  const { sheets, drive } = await getSheetsAndDrive();
  const participants = await getLatestRowsPerEmail(sheets);
  console.log(`Found ${participants.length} unique registered participant(s).`);

  const toProcess = participants.filter(p => {
    if (!p.videoLink) return false;
    const unchanged = p.videoLink === p.lastIngestedLink && p.ingestStatus === 'OK';
    return !unchanged;
  }).slice(0, limit);

  console.log(`${toProcess.length} need (re-)ingesting (others already ingested & unchanged, or have no link).`);

  if (isDryRun) {
    toProcess.forEach(p => console.log(` - ${p.name} <${p.email}> :: ${p.videoLink || '(no link)'}`));
    console.log('\nDry run only — nothing downloaded or written.');
    return;
  }

  let ok = 0, failed = 0, invalid = 0;

  for (const p of toProcess) {
    const linkChanged = p.videoLink !== p.lastIngestedLink;
    const resetReview = linkChanged && (p.reviewStatus === 'Approved' || p.reviewStatus === 'Rejected');
    const nextReviewStatus = resetReview ? 'Pending' : (p.reviewStatus || 'Pending');

    const fileId = extractDriveFileId(p.videoLink);
    let result;

    if (!fileId) {
      invalid++;
      result = {
        hostedVideoUrl: '',
        ingestStatus: 'Invalid Link',
        ingestNote: 'Link is not a recognizable Google Drive file URL',
      };
      console.log(`⚠ ${p.email}: invalid link (${p.videoLink})`);
    } else {
      try {
        const url = await downloadAndHost(drive, fileId, p.email);
        ok++;
        result = { hostedVideoUrl: url, ingestStatus: 'OK', ingestNote: '' };
        console.log(`✓ ${p.email}: ingested`);
      } catch (err) {
        failed++;
        result = { hostedVideoUrl: '', ingestStatus: err.code || 'Failed', ingestNote: err.message };
        console.log(`✗ ${p.email}: ${err.message}`);
      }
    }

    // Write immediately after each participant (not batched at the end) so
    // progress survives if the process is interrupted partway through a
    // long run — a re-run then skips everything already completed.
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${SHEET_NAME}!H${p.rowNumber}:L${p.rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          result.hostedVideoUrl,
          result.ingestStatus,
          result.ingestNote,
          p.videoLink,
          nextReviewStatus,
        ]],
      },
    });
  }

  console.log(`\nDone. OK: ${ok}, Failed: ${failed}, Invalid link: ${invalid}`);
}

main().catch(err => {
  console.error('Ingestion failed:', err.message);
  process.exit(1);
});
