import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db.js';
import { getPortalUser } from '../../../../lib/portalSession.js';
import { FormError, formFailure, text } from '../../../../lib/publicForms.js';

// A tutor marks one student's submission. The assignment must belong to the tutor's own
// class (taken from their database record), and the submission must exist.
// An empty score removes the mark.
export async function POST(request) {
  try {
    const user = await getPortalUser();
    if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
    if (user.role !== 'tutor') return NextResponse.json({ error: 'Tutors only.' }, { status: 403 });
    if (user.must_change_password) return NextResponse.json({ error: 'Please change your password first.' }, { status: 403 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new FormError('That request could not be read.');
    const assignmentId = Number(body.assignmentId);
    const studentId = Number(body.studentId);
    if (!Number.isInteger(assignmentId) || !Number.isInteger(studentId)) throw new FormError('Choose a submission.');
    const feedback = text(body.feedback, { label: 'Feedback', max: 3000 });

    const q = sql();
    const [a] = await q`SELECT id, max_score FROM assignments WHERE id = ${assignmentId} AND class_id = ${user.class_id}`;
    if (!a) throw new FormError('That assignment wasn’t found.', 404);

    const blank = body.score === '' || body.score === null || body.score === undefined;
    let score = null;
    if (!blank) {
      score = Number(body.score);
      if (!Number.isInteger(score) || score < 0 || score > a.max_score) throw new FormError(`Score must be a whole number from 0 to ${a.max_score}.`);
    }

    const rows = score === null
      ? await q`UPDATE submissions SET score = NULL, feedback = ${feedback}, graded_at = NULL, graded_by_tutor_id = NULL
                WHERE assignment_id = ${assignmentId} AND student_id = ${studentId} RETURNING id`
      : await q`UPDATE submissions SET score = ${score}, feedback = ${feedback}, graded_at = now(), graded_by_tutor_id = ${user.id}
                WHERE assignment_id = ${assignmentId} AND student_id = ${studentId} RETURNING id`;
    if (!rows.length) throw new FormError('That submission wasn’t found.', 404);
    return NextResponse.json({ success: true });
  } catch (err) {
    return formFailure(err, 'Grading error:', 'Something went wrong. Please try again.');
  }
}
