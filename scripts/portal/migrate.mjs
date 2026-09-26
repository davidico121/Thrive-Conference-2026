// Creates the portal tables and seeds the six classes. Safe to re-run.
//   node scripts/portal/migrate.mjs
import './_env.mjs';
import { sql } from '../../lib/db.js';

const q = sql();

await q`CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  code_prefix TEXT UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL,
  next_number INT NOT NULL DEFAULT 1
)`;

await q`CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  student_code TEXT UNIQUE NOT NULL,
  class_id INT NOT NULL REFERENCES classes(id),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  role_tag TEXT,
  profile_pic_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

await q`ALTER TABLE students ADD COLUMN IF NOT EXISTS welcome_sent_at TIMESTAMPTZ`;

await q`CREATE TABLE IF NOT EXISTS tutors (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL REFERENCES classes(id),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  contact_info TEXT,
  profile_pic_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

await q`CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id INT NOT NULL REFERENCES classes(id),
  session_number INT NOT NULL,
  marked_by_tutor_id INT REFERENCES tutors(id),
  marked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, session_number)
)`;

await q`CREATE TABLE IF NOT EXISTS login_attempts (
  username TEXT PRIMARY KEY,
  failures INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ
)`;

// Bumped whenever a password changes or is reset; every login cookie carries the version
// it was issued at, so bumping it signs that person out everywhere else.
await q`ALTER TABLE students ADD COLUMN IF NOT EXISTS session_version INT NOT NULL DEFAULT 1`;
await q`ALTER TABLE tutors ADD COLUMN IF NOT EXISTS session_version INT NOT NULL DEFAULT 1`;

await q`ALTER TABLE login_attempts ADD COLUMN IF NOT EXISTS last_failure_at TIMESTAMPTZ NOT NULL DEFAULT now()`;

// Failed logins per network address in fixed 15-minute windows (scope = portal | admin).
await q`CREATE TABLE IF NOT EXISTS ip_attempts (
  scope TEXT NOT NULL,
  ip TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  failures INT NOT NULL DEFAULT 0,
  PRIMARY KEY (scope, ip, window_start)
)`;

await q`CREATE INDEX IF NOT EXISTS attendance_class_session_idx ON attendance (class_id, session_number)`;

const CLASSES = [
  ['AI', 'AI & AI Automation'],
  ['VE', 'Video Editing & AI Video Content'],
  ['CW', 'Copywriting & Content Writing'],
  ['GD', 'Graphic Designing'],
  ['UX', 'UI/UX Designing'],
  ['SM', 'Social Media Management'],
];
for (const [prefix, name] of CLASSES) {
  await q`INSERT INTO classes (code_prefix, name) VALUES (${prefix}, ${name}) ON CONFLICT (code_prefix) DO NOTHING`;
}

const rows = await q`SELECT id, code_prefix, name, next_number FROM classes ORDER BY id`;
console.log('Tables ready. Classes:');
rows.forEach(r => console.log(`  ${r.id}  ${r.code_prefix}  ${r.name}  (next number ${r.next_number})`));
process.exit(0);
