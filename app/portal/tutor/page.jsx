import { redirect } from 'next/navigation';
import { getPortalUser } from '../../../lib/portalSession.js';
import { sql } from '../../../lib/db.js';
import { TOTAL_SESSIONS } from '../../../lib/portalConfig.js';
import PortalShell from '../../../components/portal/PortalShell';
import TutorAttendance from '../../../components/portal/TutorAttendance';
import { headingStyle } from '../../../components/portal/theme';

export const dynamic = 'force-dynamic';

export default async function TutorHome() {
  const user = await getPortalUser();
  if (!user) redirect('/portal/login');
  if (user.role !== 'tutor') redirect('/portal');
  if (user.must_change_password) redirect('/portal/change-password');

  const q = sql();
  // Only this tutor's own class, taken from their database record.
  const [students, marks] = await Promise.all([
    q`SELECT id, student_code, full_name, email FROM students WHERE class_id = ${user.class_id} ORDER BY student_code`,
    q`SELECT student_id, session_number, status FROM attendance WHERE class_id = ${user.class_id}`,
  ]);

  const attendance = {};
  for (const m of marks) (attendance[m.student_id] ||= {})[m.session_number] = m.status;

  return (
    <PortalShell who={`${user.full_name} · Tutor`} sub={user.class_name}>
      <h1 style={{ ...headingStyle, fontSize: 30, marginBottom: 24 }}>{user.class_name}</h1>
      <TutorAttendance students={students} attendance={attendance} totalSessions={TOTAL_SESSIONS} />
    </PortalShell>
  );
}
