import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db.js';
import { getPortalUser } from '../../../../lib/portalSession.js';
import { hashPassword, verifyPassword } from '../../../../lib/password.js';
import { passwordProblem } from '../../../../lib/passwordRules.js';
import { PORTAL_COOKIE, signPortalSession } from '../../../../lib/portalAuth.js';

export async function POST(request) {
  const user = await getPortalUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

  const { currentPassword, newPassword } = await request.json().catch(() => ({}));
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Fill in both fields.' }, { status: 400 });
  }

  const username = user.role === 'student' ? user.student_code : user.username;
  const problem = passwordProblem(newPassword, { username, fullName: user.full_name });
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  if (String(newPassword) === String(currentPassword)) {
    return NextResponse.json({ error: 'Choose a password different from your current one.' }, { status: 400 });
  }

  const q = sql();
  const [row] = user.role === 'student'
    ? await q`SELECT password_hash FROM students WHERE id = ${user.id}`
    : await q`SELECT password_hash FROM tutors WHERE id = ${user.id}`;
  if (!row || !(await verifyPassword(String(currentPassword), row.password_hash))) {
    return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 401 });
  }

  // Bumping session_version signs this person out on every other device or browser
  // (including anyone who had copied their old login). We hand this device a fresh cookie below.
  const newHash = await hashPassword(String(newPassword));
  const [updated] = user.role === 'student'
    ? await q`UPDATE students SET password_hash = ${newHash}, must_change_password = FALSE, session_version = session_version + 1
              WHERE id = ${user.id} RETURNING session_version`
    : await q`UPDATE tutors SET password_hash = ${newHash}, must_change_password = FALSE, session_version = session_version + 1
              WHERE id = ${user.id} RETURNING session_version`;

  const token = await signPortalSession({ role: user.role, id: user.id, v: updated.session_version }, process.env.ADMIN_SESSION_SECRET);
  const res = NextResponse.json({ success: true });
  res.cookies.set(PORTAL_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
