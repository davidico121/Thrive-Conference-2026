// Turns everyone marked "Approved" on the review page into a portal student:
// assigns their Thrive Number (initials + running number, e.g. DO12), creates their login
// with a temporary password, emails them, and writes the number back to the sheet (column N).
//
//   node scripts/portal/issue-student-codes.mjs --dry-run           # preview only
//   node scripts/portal/issue-student-codes.mjs --send              # create + email everyone new
//   node scripts/portal/issue-student-codes.mjs --send --only=a@b.c # just one person
//   node scripts/portal/issue-student-codes.mjs --reset=DO12        # new temp password, re-email
//
// Safe to re-run: anyone who already has a student record is skipped.
import './_env.mjs';
import { google } from 'googleapis';
import { sql } from '../../lib/db.js';
import { hashPassword, generateTempPassword } from '../../lib/password.js';
import { makeThriveNumber, normalizeCode } from '../../lib/studentCodes.js';
import { sendEmail } from '../../lib/email.js';
import { welcomeEmail } from '../../lib/emailTemplates.js';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isSend = args.includes('--send');
const onlyArg = args.find(a => a.startsWith('--only='));
const only = onlyArg ? onlyArg.slice('--only='.length).trim().toLowerCase() : null;
const resetArg = args.find(a => a.startsWith('--reset='));
const resetCode = resetArg ? normalizeCode(resetArg.slice('--reset='.length)) : null;

if (!isDryRun && !isSend && !resetCode) {
  console.error('Specify one of: --dry-run, --send, or --reset=CODE');
  process.exit(1);
}

const q = sql();
const SHEET = 'SkillsTraining';

async function sheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function resetPassword(code) {
  const [student] = await q`SELECT s.id, s.full_name, s.email, s.student_code, c.name AS class_name
                            FROM students s JOIN classes c ON c.id = s.class_id WHERE s.student_code = ${code}`;
  if (!student) {
    console.error(`No student with code ${code}`);
    process.exit(1);
  }
  const tempPassword = generateTempPassword();
  await q`UPDATE students SET password_hash = ${await hashPassword(tempPassword)}, must_change_password = TRUE, session_version = session_version + 1 WHERE id = ${student.id}`;
  const { subject, html } = welcomeEmail({ fullName: student.full_name, className: student.class_name, code: student.student_code, tempPassword });
  await sendEmail({ to: { address: student.email, name: student.full_name }, subject, html });
  await q`UPDATE students SET welcome_sent_at = now() WHERE id = ${student.id}`;
  console.log(`✓ New temporary password emailed to ${student.full_name} <${student.email}> (${student.student_code})`);
}

async function main() {
  if (resetCode) return resetPassword(resetCode);

  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEET_ID, range: `${SHEET}!A2:M` });
  const byEmail = new Map();
  (res.data.values || []).forEach((r, i) => {
    const email = (r[2] || '').trim().toLowerCase();
    if (!email) return;
    byEmail.set(email, { row: i + 2, name: (r[1] || '').trim(), email, track: (r[4] || '').trim(), review: (r[11] || '').trim() });
  });

  const approved = [...byEmail.values()].filter(p => p.review === 'Approved' && (!only || p.email === only));
  const classes = await q`SELECT id, code_prefix, name FROM classes`;
  const classByName = new Map(classes.map(c => [c.name, c]));
  const existing = new Set((await q`SELECT email FROM students`).map(r => r.email));

  const todo = approved.filter(p => !existing.has(p.email));
  console.log(`${approved.length} approved, ${approved.length - todo.length} already have a code, ${todo.length} new.`);

  if (isDryRun) {
    todo.forEach(p => console.log(` - ${p.name} <${p.email}> -> ${classByName.get(p.track)?.name || `UNKNOWN TRACK "${p.track}"`}`));
    console.log('\nDry run only — nothing created or emailed.');
    return;
  }

  let sent = 0, failed = 0;
  for (const p of todo) {
    const cls = classByName.get(p.track);
    if (!cls) { console.log(`✗ ${p.email}: track "${p.track}" doesn't match a class, skipped`); failed++; continue; }

    const [{ n }] = await q`SELECT nextval('thrive_number_seq') AS n`;
    const code = makeThriveNumber(p.name, n);
    const tempPassword = generateTempPassword();
    await q`INSERT INTO students (student_code, class_id, full_name, email, password_hash)
            VALUES (${code}, ${cls.id}, ${p.name}, ${p.email}, ${await hashPassword(tempPassword)})`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID, range: `${SHEET}!N${p.row}`, valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[code]] },
    });

    try {
      const { subject, html } = welcomeEmail({ fullName: p.name, className: cls.name, code, tempPassword });
      await sendEmail({ to: { address: p.email, name: p.name }, subject, html });
      await q`UPDATE students SET welcome_sent_at = now() WHERE student_code = ${code}`;
      console.log(`✓ ${code}  ${p.name} <${p.email}> — account created, welcome email sent`);
      sent++;
    } catch (err) {
      console.log(`✗ ${code}  ${p.name}: account created but email failed (${err.message.slice(0, 80)}). Re-send with --reset=${code}`);
      failed++;
    }
  }
  console.log(`\nDone. Emailed: ${sent}, problems: ${failed}`);
}

main().then(() => process.exit(0)).catch(err => { console.error('Failed:', err.message); process.exit(1); });
