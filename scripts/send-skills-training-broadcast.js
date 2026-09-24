#!/usr/bin/env node
/**
 * Broadcasts the Saturday onboarding reminder email to everyone registered
 * in the SkillsTraining sheet, via ZeptoMail.
 *
 * Usage:
 *   node scripts/send-skills-training-broadcast.js --dry-run          # list recipients only, sends nothing
 *   node scripts/send-skills-training-broadcast.js --test=you@x.com   # send one test email to yourself
 *   node scripts/send-skills-training-broadcast.js --send             # actually broadcast to everyone
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

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isSend = args.includes('--send');
const testArg = args.find(a => a.startsWith('--test='));
const testEmail = testArg ? testArg.split('=')[1] : null;
// Add --reminder to any mode above to use the follow-up reminder email instead of the original.
const isReminder = args.includes('--reminder');

if (!isDryRun && !isSend && !testEmail) {
  console.error('Specify one of: --dry-run, --test=you@example.com, or --send');
  process.exit(1);
}

const SUBJECT = '🚨 Thrive Digital Skills Training Starts This Saturday!';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHtml(firstName) {
  const name = escapeHtml(firstName);
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1b1c1a;">
  <div style="background: #170f30; padding: 24px 32px; text-align: center;">
    <span style="font-family: Georgia, serif; font-weight: 800; font-size: 20px; color: #fbf9f6; letter-spacing: -0.01em;">THRIVE <span style="color: #fecb00;">SKILLS</span></span>
  </div>
  <div style="padding: 32px; background: #ffffff;">
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hello ${name},</p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      We're excited to remind you that the <strong>Thrive Digital Skills Training onboarding is happening this Saturday, September 26th.</strong>
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      As we get ready to begin, there are a few important things we'd like you to take care of:
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 8px;"><strong>1. Join the WhatsApp Group</strong></p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      If you haven't joined the official training group yet, please join using the link below. All important updates and information about the training will be shared there.
    </p>
    <p style="margin: 0 0 24px;">
      <a href="https://chat.whatsapp.com/GWM7FWJAbX3BQz36bsP35w?s=cl&p=i&mlu=4&ilr=4" style="display: inline-block; background: #fecb00; color: #17102e; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 4px;">Join the Thrive WhatsApp Group</a>
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 8px;"><strong>2. Know someone who would be interested?</strong></p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
      If you know someone who would benefit from the Thrive Digital Skills Training, you can still share the registration link with them:
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      <a href="https://thrive.crumglobal.org/skills-training" style="color: #c99400; font-weight: 600;">Thrive Digital Skills Training Registration</a>
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Feel free to share it with anyone you believe would benefit from the opportunity.
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 8px;"><strong>3. Please confirm that your 30-second video is accessible</strong></p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
      As part of your application, you were asked to submit a 30-second video. Our team will be reviewing these videos as part of the onboarding process.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
      Please take a moment to <strong>confirm that the video you submitted is accessible to us</strong>.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      If you're not sure how to check or update the access settings, visit the registration page below. You'll find a <strong>video guide</strong> that walks you through the process:
    </p>
    <p style="margin: 0 0 28px;">
      <a href="https://thrive.crumglobal.org/skills-training" style="display: inline-block; background: #17102e; color: #fecb00; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 4px;">Visit the Registration Page &amp; Video Guide</a>
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Please complete these steps before Saturday so we can have everything ready for your onboarding.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      We're looking forward to welcoming you to <strong>Thrive Digital Skills Training</strong>.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 4px;">See you on Saturday!</p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0;"><strong>The Thrive Team</strong></p>
  </div>
  <div style="background: #0c0620; padding: 20px 32px; text-align: center;">
    <p style="color: #6b628f; font-size: 12px; margin: 0;">© 2026 Thrive Initiatives · Christ Unfolding Ministries</p>
  </div>
</div>`.trim();
}

// Registrants sometimes type an email address, ALL CAPS, or all lowercase into the name field.
function displayFirstName(fullName) {
  const token = (fullName || '').trim().split(/\s+/)[0] || '';
  if (!token || token.includes('@')) return 'there';
  const isAllCaps = token.length > 1 && token === token.toUpperCase();
  const base = isAllCaps ? token.toLowerCase() : token;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const REMINDER_SUBJECT ='⏰ Reminder: two quick things before Saturday\'s Thrive Skills onboarding';

function buildReminderHtml(firstName) {
  const name = escapeHtml(firstName);
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1b1c1a;">
  <div style="background: #170f30; padding: 24px 32px; text-align: center;">
    <span style="font-family: Georgia, serif; font-weight: 800; font-size: 20px; color: #fbf9f6; letter-spacing: -0.01em;">THRIVE <span style="color: #fecb00;">SKILLS</span></span>
  </div>
  <div style="padding: 32px; background: #ffffff;">
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hello ${name},</p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      This is a quick reminder that the <strong>Thrive Digital Skills Training onboarding is this Saturday, September 26th.</strong>
      There are two things we still need from you before then:
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 8px;"><strong>1. Give us access to your 30-second video</strong></p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
      Our team reviews every video as part of onboarding, and we can only open videos that are shared as <strong>&ldquo;Anyone with the link.&rdquo;</strong>
      Sharing it with one person&rsquo;s email address isn&rsquo;t enough, so please check your sharing settings and make sure the link works.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
      If you submitted something that isn&rsquo;t a video link (for example a search result or a profile page), please register again with a proper link.
      If your video is already set up correctly, you can skip this step.
    </p>
    <p style="margin: 0 0 24px;">
      <a href="https://thrive.crumglobal.org/skills-training" style="display: inline-block; background: #17102e; color: #fecb00; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 4px;">Video guide &amp; registration page</a>
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 8px;"><strong>2. Join the general WhatsApp group</strong></p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
      All important updates about the training are shared in the group. If you haven&rsquo;t joined yet, please do it now.
    </p>
    <p style="margin: 0 0 28px;">
      <a href="https://chat.whatsapp.com/GWM7FWJAbX3BQz36bsP35w?s=cl&amp;p=i&amp;mlu=4&amp;ilr=4" style="display: inline-block; background: #fecb00; color: #17102e; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 4px;">Join the Thrive WhatsApp Group</a>
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Please take care of both before Saturday so we can have everything ready for your onboarding.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 4px;">See you on Saturday!</p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0;"><strong>The Thrive Team</strong></p>
  </div>
  <div style="background: #0c0620; padding: 20px 32px; text-align: center;">
    <p style="color: #6b628f; font-size: 12px; margin: 0;">&copy; 2026 Thrive Initiatives &middot; Christ Unfolding Ministries</p>
  </div>
</div>`.trim();
}

async function getParticipants() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'SkillsTraining!A2:G',
  });

  const rows = res.data.values || [];
  const byEmail = new Map();
  for (const row of rows) {
    const [, name, email] = row;
    if (!email) continue;
    const key = email.trim().toLowerCase();
    byEmail.set(key, { name: (name || '').trim(), email: email.trim() });
  }
  return Array.from(byEmail.values());
}

async function sendOne(recipient) {
  const firstName = displayFirstName(recipient.name);
  const res = await fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.ZEPTOMAIL_TOKEN,
    },
    body: JSON.stringify({
      from: { address: process.env.ZEPTOMAIL_FROM_EMAIL, name: process.env.ZEPTOMAIL_FROM_NAME },
      to: [{ email_address: { address: recipient.email, name: recipient.name || recipient.email } }],
      subject: isReminder ? REMINDER_SUBJECT : SUBJECT,
      htmlbody: isReminder ? buildReminderHtml(firstName) : buildHtml(firstName),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
}

async function main() {
  const participants = await getParticipants();
  console.log(`Found ${participants.length} unique registered participant(s).`);

  if (isDryRun) {
    participants.forEach(p => console.log(` - ${p.name} <${p.email}>`));
    console.log('\nDry run only — no emails sent.');
    return;
  }

  const targets = testEmail
    ? [{ name: 'Test', email: testEmail }]
    : participants;

  console.log(`Sending to ${targets.length} recipient(s)...`);
  let ok = 0;
  let failed = 0;
  for (const recipient of targets) {
    try {
      await sendOne(recipient);
      ok++;
      console.log(`✓ Sent to ${recipient.email}`);
    } catch (err) {
      failed++;
      console.error(`✗ Failed for ${recipient.email}: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone. Sent: ${ok}, Failed: ${failed}`);
}

main().catch(err => {
  console.error('Broadcast failed:', err.message);
  process.exit(1);
});
