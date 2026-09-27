import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db.js';
import { getPortalUser } from '../../../../lib/portalSession.js';
import { FormError, formFailure, text } from '../../../../lib/publicForms.js';
import { optionalLink } from '../../../../lib/assignments.js';

// A student submits (or replaces) their work for an assignment in their own class.
export async function POST(request) {
  try {
    const user = await getPortalUser();
    if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
    if (user.role !== 'student') return NextResponse.json({ error: 'Students only.' }, { status: 403 });
    if (user.must_change_password) return NextResponse.json({ error: 'Please change your password first.' }, { status: 403 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new FormError('That request could not be read.');

    const id = Number(body.assignmentId);
    if (!Number.isInteger(id)) throw new FormError('Choose an assignment.');
    const answer = text(body.answer, { label: 'Your answer', max: 10000 });
    const link = optionalLink(body.link, 'Link');
    if (!answer && !link) throw new FormError('Add your answer, a link to your work, or both.');

    const q = sql();
    const [a] = await q`SELECT id, due_at FROM assignments WHERE id = ${id} AND class_id = ${user.class_id}`;
    if (!a) throw new FormError('That assignment wasn’t found.', 404);

    const late = !!a.due_at && new Date() > new Date(a.due_at);
    await q`INSERT INTO submissions (assignment_id, student_id, answer_text, link, is_late)
            VALUES (${id}, ${user.id}, ${answer}, ${link}, ${late})
            ON CONFLICT (assignment_id, student_id)
            DO UPDATE SET answer_text = EXCLUDED.answer_text, link = EXCLUDED.link, is_late = EXCLUDED.is_late, submitted_at = now()`;
    return NextResponse.json({ success: true, late });
  } catch (err) {
    return formFailure(err, 'Submission error:', 'Something went wrong. Please try again.');
  }
}
