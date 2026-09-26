import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db.js';
import { getPortalUser } from '../../../../lib/portalSession.js';
import { parseCodeList } from '../../../../lib/studentCodes.js';
import { TOTAL_SESSIONS } from '../../../../lib/portalConfig.js';

// Records attendance as present or absent for the tutor's own class only. The class
// comes from the tutor's database record, never from the request, so a tutor can't
// touch another class no matter what is sent. Codes from other classes are reported as
// "not in your class" without revealing who they belong to.
//
// Marking again with the other status corrects a mistake (present -> absent or back).
export async function POST(request) {
  const user = await getPortalUser();
  if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  if (user.role !== 'tutor') {
    return NextResponse.json({ error: 'Tutors only.' }, { status: 403 });
  }
  if (user.must_change_password) {
    return NextResponse.json({ error: 'Please change your password first.' }, { status: 403 });
  }

  const { session, codes, action } = await request.json().catch(() => ({}));
  if (action !== 'present' && action !== 'absent') {
    return NextResponse.json({ error: 'Choose mark present or mark absent.' }, { status: 400 });
  }
  const sessionNumber = Number(session);
  if (!Number.isInteger(sessionNumber) || sessionNumber < 1 || sessionNumber > TOTAL_SESSIONS) {
    return NextResponse.json({ error: `Choose a class from 1 to ${TOTAL_SESSIONS}.` }, { status: 400 });
  }
  const list = parseCodeList(codes);
  if (!list.length) return NextResponse.json({ error: 'Enter at least one Thrive Number.' }, { status: 400 });
  if (list.length > 100) return NextResponse.json({ error: 'Please enter 100 Thrive Numbers or fewer at a time.' }, { status: 400 });

  const q = sql();
  const results = [];

  for (const code of list) {
    const [student] = await q`SELECT id, full_name FROM students WHERE student_code = ${code} AND class_id = ${user.class_id}`;
    if (!student) {
      results.push({ code, status: 'not_in_class' });
      continue;
    }

    const [existing] = await q`SELECT status FROM attendance WHERE student_id = ${student.id} AND session_number = ${sessionNumber}`;
    let outcome;
    if (!existing) {
      await q`INSERT INTO attendance (student_id, class_id, session_number, marked_by_tutor_id, status)
              VALUES (${student.id}, ${user.class_id}, ${sessionNumber}, ${user.id}, ${action})
              ON CONFLICT (student_id, session_number) DO UPDATE SET status = EXCLUDED.status, marked_by_tutor_id = EXCLUDED.marked_by_tutor_id, marked_at = now()`;
      outcome = action === 'present' ? 'marked_present' : 'marked_absent';
    } else if (existing.status === action) {
      outcome = action === 'present' ? 'already_present' : 'already_absent';
    } else {
      await q`UPDATE attendance SET status = ${action}, marked_by_tutor_id = ${user.id}, marked_at = now()
              WHERE student_id = ${student.id} AND session_number = ${sessionNumber}`;
      outcome = action === 'present' ? 'changed_to_present' : 'changed_to_absent';
    }
    results.push({ code, name: student.full_name, status: outcome });
  }

  return NextResponse.json({ session: sessionNumber, results });
}
