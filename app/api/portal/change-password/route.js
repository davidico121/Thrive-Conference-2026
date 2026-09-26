import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db.js';
import { getPortalUser } from '../../../../lib/portalSession.js';
import { hashPassword, verifyPassword } from '../../../../lib/password.js';
import { MIN_PASSWORD_LENGTH } from '../../../../lib/portalConfig.js';

export async function POST(request) {
  const user = await getPortalUser();
  if (!user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

  const { currentPassword, newPassword } = await request.json().catch(() => ({}));
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Fill in both fields.' }, { status: 400 });
  }
  if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
  }
  const username = user.role === 'student' ? user.student_code : user.username;
  if (String(newPassword).toLowerCase() === String(username).toLowerCase()) {
    return NextResponse.json({ error: 'Your password can’t be the same as your username.' }, { status: 400 });
  }

  const q = sql();
  const [row] = user.role === 'student'
    ? await q`SELECT password_hash FROM students WHERE id = ${user.id}`
    : await q`SELECT password_hash FROM tutors WHERE id = ${user.id}`;
  if (!row || !(await verifyPassword(String(currentPassword), row.password_hash))) {
    return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 401 });
  }

  const newHash = await hashPassword(String(newPassword));
  if (user.role === 'student') {
    await q`UPDATE students SET password_hash = ${newHash}, must_change_password = FALSE WHERE id = ${user.id}`;
  } else {
    await q`UPDATE tutors SET password_hash = ${newHash}, must_change_password = FALSE WHERE id = ${user.id}`;
  }
  return NextResponse.json({ success: true });
}
