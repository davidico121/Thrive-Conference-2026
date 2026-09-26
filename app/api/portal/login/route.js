import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db.js';
import { verifyPassword, hashPassword } from '../../../../lib/password.js';
import { PORTAL_COOKIE, signPortalSession } from '../../../../lib/portalAuth.js';
import { normalizeCode } from '../../../../lib/studentCodes.js';
import { MAX_FAILED_LOGINS, LOCKOUT_MINUTES } from '../../../../lib/portalConfig.js';

// Verified against when the username doesn't exist, so a wrong username and a wrong
// password take the same time and can't be told apart.
let dummyHash;

export async function POST(request) {
  const { username, password } = await request.json().catch(() => ({}));
  const raw = String(username || '').trim();
  if (!raw || !password) {
    return NextResponse.json({ error: 'Enter your username and password.' }, { status: 400 });
  }

  const q = sql();
  const key = normalizeCode(raw); // codes and tutor usernames are letters and digits only

  await q`UPDATE login_attempts SET failures = 0, locked_until = NULL WHERE username = ${key} AND locked_until IS NOT NULL AND locked_until < now()`;
  const [attempt] = await q`SELECT failures, locked_until FROM login_attempts WHERE username = ${key}`;
  if (attempt?.locked_until && new Date(attempt.locked_until) > new Date()) {
    const mins = Math.max(1, Math.ceil((new Date(attempt.locked_until) - Date.now()) / 60000));
    return NextResponse.json({ error: `Too many wrong attempts. Please try again in ${mins} minute${mins === 1 ? '' : 's'}.` }, { status: 429 });
  }

  let account = null;
  const [tutor] = await q`SELECT id, password_hash, must_change_password FROM tutors WHERE lower(username) = ${raw.toLowerCase()}`;
  if (tutor) {
    account = { role: 'tutor', ...tutor };
  } else {
    const [student] = await q`SELECT id, password_hash, must_change_password FROM students WHERE student_code = ${key}`;
    if (student) account = { role: 'student', ...student };
  }

  dummyHash ||= await hashPassword('not-a-real-password');
  const ok = await verifyPassword(String(password), account ? account.password_hash : dummyHash);

  if (!account || !ok) {
    await q`INSERT INTO login_attempts (username, failures) VALUES (${key}, 1)
            ON CONFLICT (username) DO UPDATE SET
              failures = login_attempts.failures + 1,
              locked_until = CASE WHEN login_attempts.failures + 1 >= ${MAX_FAILED_LOGINS}
                                  THEN now() + (${LOCKOUT_MINUTES}::int * interval '1 minute')
                                  ELSE login_attempts.locked_until END`;
    return NextResponse.json({ error: 'Incorrect username or password.' }, { status: 401 });
  }

  await q`DELETE FROM login_attempts WHERE username = ${key}`;
  const token = await signPortalSession({ role: account.role, id: account.id }, process.env.ADMIN_SESSION_SECRET);
  const res = NextResponse.json({ role: account.role, mustChangePassword: account.must_change_password });
  res.cookies.set(PORTAL_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
