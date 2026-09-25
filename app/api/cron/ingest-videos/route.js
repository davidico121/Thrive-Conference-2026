import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { put } from '@vercel/blob';

// Hobby-plan Vercel Cron runs this once a day (see vercel.json) to pull in
// anyone who registered since the last run, so new people show up on the
// admin review page with a playable video (or a clear reason it isn't one)
// without anyone needing to run the ingestion script by hand.
//
// Kept intentionally close to scripts/ingest-skills-training-videos.js (same
// classification rules), but self-contained here rather than sharing a module,
// and budgets its own time since Hobby functions are capped at 60s.
export const maxDuration = 60;
const TIME_BUDGET_MS = 50 * 1000;

const SHEET_NAME = 'SkillsTraining';
const MAX_BYTES = 300 * 1024 * 1024;
// Bigger files than this are left for the manual script, which has no time
// limit; trying them here would just get the function killed at 60s.
const DEFER_ABOVE_BYTES = 100 * 1024 * 1024;

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error('ran out of time'), { code: 'TIMEOUT' })), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function extractDriveFileId(link) {
  if (!link) return null;
  let m = link.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  m = link.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  return null;
}

function extractYouTubeId(link) {
  if (!link) return null;
  let m = link.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];
  m = link.match(/youtube\.com\/(?:watch\?v=|shorts\/|embed\/)([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];
  return null;
}

function extractTikTokLink(link) {
  if (!link) return null;
  const m = link.match(/^(https?:\/\/[^\s]*tiktok\.com[^\s]*)/i);
  return m ? m[1] : null;
}

async function resolveTikTokUrl(shortLink) {
  const res = await fetch(shortLink, { redirect: 'follow' });
  return res.url;
}

function classifyLink(link) {
  const driveId = extractDriveFileId(link);
  if (driveId) return { type: 'drive', id: driveId };
  const youtubeId = extractYouTubeId(link);
  if (youtubeId) return { type: 'youtube', id: youtubeId };
  const tiktokLink = extractTikTokLink(link);
  if (tiktokLink) return { type: 'tiktok', link: tiktokLink };
  return { type: 'none' };
}

async function downloadAndHost(drive, fileId, fallbackName) {
  let meta;
  try {
    meta = await drive.files.get({ fileId, fields: 'id,name,mimeType,size' });
  } catch (err) {
    if (err.message && err.message.includes('File not found')) {
      throw Object.assign(
        new Error("The submitter hasn't shared this video with \"Anyone with the link\" (or the file was moved/deleted). Ask them to fix Drive sharing and resubmit."),
        { code: 'Access Denied' }
      );
    }
    throw err;
  }

  const { mimeType, size, name } = meta.data;
  if (!mimeType || !mimeType.startsWith('video/')) {
    throw Object.assign(new Error(`File is ${mimeType || 'unknown type'}, not a video`), { code: 'INVALID_TYPE' });
  }
  if (size && Number(size) > MAX_BYTES) {
    const mb = (Number(size) / (1024 * 1024)).toFixed(0);
    throw Object.assign(new Error(`File is ${mb}MB, exceeds the ${MAX_BYTES / (1024 * 1024)}MB limit`), { code: 'TOO_LARGE' });
  }

  if (size && Number(size) > DEFER_ABOVE_BYTES) {
    throw Object.assign(new Error('too large for the automatic run'), { code: 'DEFER' });
  }

  const stream = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  const safeName = (name || fallbackName).replace(/[^a-zA-Z0-9._-]/g, '_');

  let blobToken = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
  if (blobToken.startsWith('"') && blobToken.endsWith('"')) blobToken = blobToken.slice(1, -1);

  const blob = await put(`skills-training-videos/${fileId}-${safeName}`, stream.data, {
    access: 'private',
    contentType: mimeType,
    ...(blobToken ? { token: blobToken } : {}),
    addRandomSuffix: false,
  });
  return blob.pathname;
}

export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const started = Date.now();
  const timeLeft = () => TIME_BUDGET_MS - (Date.now() - started);

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

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${SHEET_NAME}!A2:L`,
  });
  const rows = res.data.values || [];

  const byEmail = new Map();
  rows.forEach((row, i) => {
    const [, name, email, , , , videoLink, , ingestStatus] = row;
    if (!email) return;
    byEmail.set(email.trim().toLowerCase(), {
      rowNumber: i + 2,
      name: (name || '').trim(),
      videoLink: (videoLink || '').trim(),
      ingestStatus: ingestStatus || '',
    });
  });

  // Only rows never touched by ingestion — the full reconciliation of
  // changed/failed links is left to the manual script, which has no time limit.
  const brandNew = Array.from(byEmail.values()).filter(p => p.videoLink && !p.ingestStatus);

  const results = { processed: [], deferred: [] };

  for (const p of brandNew) {
    if (timeLeft() < 8000) break; // leave headroom; remaining rows wait for tomorrow's run

    const classified = classifyLink(p.videoLink);
    let outcome;

    if (classified.type === 'drive') {
      try {
        const pathname = await withTimeout(
          downloadAndHost(drive, classified.id, p.name || 'video'),
          Math.max(timeLeft() - 3000, 1000)
        );
        outcome = { hostedVideoUrl: pathname, ingestStatus: 'OK', ingestNote: '' };
      } catch (err) {
        if (err.code === 'DEFER' || err.code === 'TIMEOUT') {
          // Leave the row untouched so it is retried next run (or by the manual script).
          results.deferred.push({ name: p.name, reason: err.code });
          continue;
        }
        outcome = { hostedVideoUrl: '', ingestStatus: err.code || 'Failed', ingestNote: err.message };
      }
    } else if (classified.type === 'youtube') {
      outcome = { hostedVideoUrl: classified.id, ingestStatus: 'Embed:YouTube', ingestNote: '' };
    } else if (classified.type === 'tiktok') {
      try {
        const resolvedUrl = await resolveTikTokUrl(classified.link);
        outcome = { hostedVideoUrl: resolvedUrl, ingestStatus: 'Embed:TikTok', ingestNote: '' };
      } catch (err) {
        outcome = { hostedVideoUrl: '', ingestStatus: 'Failed', ingestNote: `Could not resolve TikTok link: ${err.message}` };
      }
    } else {
      outcome = {
        hostedVideoUrl: '',
        ingestStatus: 'No Video',
        ingestNote: 'Submitted link is not a recognizable video (search result, profile page, folder, etc.)',
      };
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${SHEET_NAME}!H${p.rowNumber}:L${p.rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[outcome.hostedVideoUrl, outcome.ingestStatus, outcome.ingestNote, p.videoLink, 'Pending']] },
    });

    results.processed.push({ name: p.name, status: outcome.ingestStatus });
  }

  results.remainingForNextRun = brandNew.length - results.processed.length;
  return NextResponse.json(results);
}
