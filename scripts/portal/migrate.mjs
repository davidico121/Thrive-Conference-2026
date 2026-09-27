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

// Each attendance record is either present or explicitly absent. "Not marked" is the
// absence of a record, so a tutor who hasn't taken attendance yet is distinguishable
// from a student they recorded as absent. Existing records were all presence.
await q`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'present'`;

// One running count for every student's Thrive Number (DO12, VA13, ...).
await q`CREATE SEQUENCE IF NOT EXISTS thrive_number_seq START 1`;

await q`CREATE INDEX IF NOT EXISTS attendance_class_session_idx ON attendance (class_id, session_number)`;

// Assignments are set by a tutor for their own class; each student has at most one
// submission per assignment (resubmitting replaces it, and is_late records if it came after the due time).
await q`CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL REFERENCES classes(id),
  created_by_tutor_id INT REFERENCES tutors(id),
  title TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  resource_link TEXT,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;
await q`CREATE INDEX IF NOT EXISTS assignments_class_idx ON assignments (class_id, created_at DESC)`;

await q`CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL DEFAULT '',
  link TEXT,
  is_late BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id)
)`;

// Marking: each assignment is out of max_score; a tutor gives each submission a score and optional feedback.
await q`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS max_score INT NOT NULL DEFAULT 100`;
await q`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS score INT`;
await q`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS feedback TEXT NOT NULL DEFAULT ''`;
await q`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ`;
await q`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS graded_by_tutor_id INT REFERENCES tutors(id)`;

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
