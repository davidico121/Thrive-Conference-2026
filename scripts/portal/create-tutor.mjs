// Creates a tutor login for one class.
//   node scripts/portal/create-tutor.mjs --name="Steward David" --username=david --class=AI --email=tutor@example.com
//   node scripts/portal/create-tutor.mjs --reset=david         # new temporary password (emailed, or printed if no email)
// Optional: --contact="WhatsApp 0801..." (shown to students).
// Class codes: AI, VE, CW, GD, UX, SM.
import './_env.mjs';
import { sql } from '../../lib/db.js';
import { hashPassword, generateTempPassword } from '../../lib/password.js';
import { sendEmail } from '../../lib/email.js';
import { tutorWelcomeEmail } from '../../lib/emailTemplates.js';

const arg = name => {
  const hit = process.argv.slice(2).find(a => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3).trim() : null;
};

const q = sql();

async function deliver(tutor, className, tempPassword) {
  if (tutor.email) {
    const { subject, html } = tutorWelcomeEmail({ fullName: tutor.full_name, className, username: tutor.username, tempPassword });
    await sendEmail({ to: { address: tutor.email, name: tutor.full_name }, subject, html });
    console.log(`✓ Login details emailed to ${tutor.email}`);
  } else {
    console.log(`No email on file. Give them these details:\n  Username: ${tutor.username}\n  Temporary password: ${tempPassword}`);
  }
}

const resetName = arg('reset');
if (resetName) {
  const [tutor] = await q`SELECT t.id, t.username, t.full_name, t.email, c.name AS class_name
                          FROM tutors t JOIN classes c ON c.id = t.class_id WHERE lower(t.username) = ${resetName.toLowerCase()}`;
  if (!tutor) { console.error(`No tutor with username ${resetName}`); process.exit(1); }
  const tempPassword = generateTempPassword();
  await q`UPDATE tutors SET password_hash = ${await hashPassword(tempPassword)}, must_change_password = TRUE WHERE id = ${tutor.id}`;
  await deliver(tutor, tutor.class_name, tempPassword);
  process.exit(0);
}

const fullName = arg('name');
const username = (arg('username') || '').toLowerCase();
const classPrefix = (arg('class') || '').toUpperCase();
const email = arg('email');
const contact = arg('contact');

if (!fullName || !username || !classPrefix) {
  console.error('Required: --name="..." --username=... --class=AI|VE|CW|GD|UX|SM   (optional: --email, --contact)');
  process.exit(1);
}
if (!/^[a-z0-9]{3,20}$/.test(username)) {
  console.error('Username must be 3-20 letters/digits with no spaces or symbols.');
  process.exit(1);
}
// Students log in with codes like AI07; a tutor username shaped like that would collide.
if (/^[a-z]{2}\d+$/.test(username)) {
  console.error('That username looks like a student code. Pick something else (e.g. a first name).');
  process.exit(1);
}

const [cls] = await q`SELECT id, name FROM classes WHERE code_prefix = ${classPrefix}`;
if (!cls) { console.error(`Unknown class "${classPrefix}"`); process.exit(1); }
const [taken] = await q`SELECT 1 FROM tutors WHERE lower(username) = ${username}`;
if (taken) { console.error(`Username "${username}" is already taken.`); process.exit(1); }

const tempPassword = generateTempPassword();
await q`INSERT INTO tutors (class_id, username, full_name, email, password_hash, contact_info)
        VALUES (${cls.id}, ${username}, ${fullName}, ${email}, ${await hashPassword(tempPassword)}, ${contact})`;
console.log(`✓ Tutor created: ${fullName} (${username}) for ${cls.name}`);
await deliver({ username, full_name: fullName, email }, cls.name, tempPassword);
process.exit(0);
