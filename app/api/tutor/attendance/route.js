import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db.js';
import { getPortalUser } from '../../../../lib/portalSession.js';
import { parseCodeList } from '../../../../lib/studentCodes.js';
import { TOTAL_SESSIONS } from '../../../../lib/portalConfig.js';

// Marks (or un-marks) attendance for the tutor's own class only. The class comes from
// the tutor's database record, never from the request, so a tutor can't touch another
// class no matter what is sent. Codes from other classes are reported as "not in your
// class" without revealing who they belong to.
export async function POST(request) {
  const user = await getPortalUser();
  if (!user || user.role !== 'tutor') {
    return NextResponse.json({ error: 'Tutors only.' }, { status: 403 });
  }
  if (user.must_change_password) {
    return NextResponse.json({ error: 'Please change your password first.' }, { status: 403 });
  }

  const { session, codes, action } = await request.json().catch(() => ({}));
  const sessionNumber = Number(session);
  if (!Number.isInteger(sessionNumber) || sessionNumber < 1 || sessionNumber > TOTAL_SESSIONS) {
    return NextResponse.json({ error: `Choose a class from 1 to ${TOTAL_SESSIONS}.` }, { status: 400 });
  }
  const list = parseCodeList(codes);
  if (!list.length) return NextResponse.json({ error: 'Enter at least one student code.' }, { status: 400 });
  if (list.length > 100) return NextResponse.json({ error: 'Please enter 100 codes or fewer at a time.' }, { status: 400 });

  const q = sql();
  const unmark = action === 'unmark';
  const results = [];

  for (const code of list) {
    const [student] = await q`SELECT id, full_name FROM students WHERE student_code = ${code} AND class_id = ${user.class_id}`;
    if (!student) {
      results.push({ code, status: 'not_in_class' });
      continue;
    }
    if (unmark) {
      const removed = await q`DELETE FROM attendance WHERE student_id = ${student.id} AND session_number = ${sessionNumber} RETURNING id`;
      results.push({ code, name: student.full_name, status: removed.length ? 'unmarked' : 'was_not_marked' });
    } else {
      const inserted = await q`INSERT INTO attendance (student_id, class_id, session_number, marked_by_tutor_id)
                               VALUES (${student.id}, ${user.class_id}, ${sessionNumber}, ${user.id})
                               ON CONFLICT (student_id, session_number) DO NOTHING RETURNING id`;
      results.push({ code, name: student.full_name, status: inserted.length ? 'marked' : 'already_marked' });
    }
  }

  return NextResponse.json({ session: sessionNumber, results });
}
