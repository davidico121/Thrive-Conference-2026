import { NextResponse } from 'next/server';
import { sql } from '../../../../lib/db.js';
import { getPortalUser } from '../../../../lib/portalSession.js';
import { FormError, formFailure } from '../../../../lib/publicForms.js';
import { assignmentFields } from '../../../../lib/assignments.js';

const MAX_ASSIGNMENTS_PER_CLASS = 200;

// Create, edit or delete an assignment for the tutor's own class. The class comes from
// the tutor's database record; an assignment id from another class is treated as missing.
export async function POST(request) {
  try {
    const user = await getPortalUser();
    if (!user) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
    if (user.role !== 'tutor') return NextResponse.json({ error: 'Tutors only.' }, { status: 403 });
    if (user.must_change_password) return NextResponse.json({ error: 'Please change your password first.' }, { status: 403 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new FormError('That request could not be read.');
    const q = sql();

    if (body.action === 'create') {
      const f = assignmentFields(body);
      const [{ n }] = await q`SELECT COUNT(*)::int AS n FROM assignments WHERE class_id = ${user.class_id}`;
      if (n >= MAX_ASSIGNMENTS_PER_CLASS) throw new FormError('This class has reached the assignment limit.');
      const [row] = await q`INSERT INTO assignments (class_id, created_by_tutor_id, title, instructions, resource_link, due_at, max_score)
                            VALUES (${user.class_id}, ${user.id}, ${f.title}, ${f.instructions}, ${f.resourceLink}, ${f.dueAt}, ${f.maxScore})
                            RETURNING id`;
      return NextResponse.json({ success: true, id: row.id });
    }

    const id = Number(body.id);
    if (!Number.isInteger(id)) throw new FormError('Choose an assignment.');
    const [own] = await q`SELECT id FROM assignments WHERE id = ${id} AND class_id = ${user.class_id}`;
    if (!own) throw new FormError('That assignment wasn’t found.', 404);

    if (body.action === 'update') {
      const f = assignmentFields(body);
      const [{ top }] = await q`SELECT COALESCE(MAX(score), 0)::int AS top FROM submissions WHERE assignment_id = ${id}`;
      if (f.maxScore < top) throw new FormError(`Total marks can’t be lower than a score already given (${top}).`);
      await q`UPDATE assignments SET title = ${f.title}, instructions = ${f.instructions}, resource_link = ${f.resourceLink}, due_at = ${f.dueAt}, max_score = ${f.maxScore}
              WHERE id = ${id} AND class_id = ${user.class_id}`;
      // Late flags follow the new due time.
      await q`UPDATE submissions SET is_late = (${f.dueAt}::timestamptz IS NOT NULL AND submitted_at > ${f.dueAt}::timestamptz)
              WHERE assignment_id = ${id}`;
      return NextResponse.json({ success: true });
    }
    if (body.action === 'delete') {
      await q`DELETE FROM assignments WHERE id = ${id} AND class_id = ${user.class_id}`;
      return NextResponse.json({ success: true });
    }
    throw new FormError('Unknown action.');
  } catch (err) {
    return formFailure(err, 'Assignment error:', 'Something went wrong. Please try again.');
  }
}
