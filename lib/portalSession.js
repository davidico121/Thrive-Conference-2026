import { cookies } from 'next/headers';
import { PORTAL_COOKIE, verifyPortalSession } from './portalAuth.js';
import { sql } from './db.js';

// Server-side only. Reads the signed cookie, then loads the user fresh from the
// database, so class and permissions always come from the database and never from
// anything the browser holds. Returns null when not logged in (or the account is gone).
export async function getPortalUser() {
  const token = (await cookies()).get(PORTAL_COOKIE)?.value;
  const session = await verifyPortalSession(token, process.env.ADMIN_SESSION_SECRET);
  if (!session) return null;

  const q = sql();
  if (session.role === 'student') {
    const [s] = await q`SELECT s.id, s.student_code, s.full_name, s.email, s.must_change_password, s.session_version,
                               s.class_id, s.role_tag, c.name AS class_name
                        FROM students s JOIN classes c ON c.id = s.class_id WHERE s.id = ${session.id}`;
    // A cookie from before the last password change carries an older version and is refused.
    return s && s.session_version === session.v ? { role: 'student', ...s } : null;
  }

  const [t] = await q`SELECT t.id, t.username, t.full_name, t.email, t.must_change_password, t.contact_info, t.session_version,
                             t.class_id, c.name AS class_name
                      FROM tutors t JOIN classes c ON c.id = t.class_id WHERE t.id = ${session.id}`;
  return t && t.session_version === session.v ? { role: 'tutor', ...t } : null;
}
