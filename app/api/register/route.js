import { NextResponse } from 'next/server';
import { FormError, readForm, text, emailField, phoneField, appendRow, formFailure } from '../../../lib/publicForms.js';

export async function POST(request) {
  try {
    const body = await readForm(request, 'form-conference');
    const name = text(body.name, { label: 'Name', max: 120, required: true });
    const email = emailField(body.email);
    const phone = phoneField(body.phone);
    const status = text(body.status, { label: 'Status', max: 100 });
    const occupation = text(body.occupation, { label: 'Occupation', max: 200 });
    const inTech = text(body.inTech, { label: 'Answer', max: 100 });
    const aiKnowledge = text(body.aiKnowledge, { label: 'Answer', max: 100 });
    const marketingSalesKnowledge = text(body.marketingSalesKnowledge, { label: 'Answer', max: 100 });

    let techAreas = '';
    if (body.techAreas !== undefined && body.techAreas !== null) {
      if (!Array.isArray(body.techAreas) || body.techAreas.length > 30) throw new FormError('Tech areas isn’t valid.');
      techAreas = body.techAreas.map(a => text(a, { label: 'Tech area', max: 80 })).filter(Boolean).join(', ');
    }

    await appendRow('Registrations!A:J', [
      new Date().toISOString(), name, email, phone, status, occupation, inTech, techAreas, aiKnowledge, marketingSalesKnowledge,
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return formFailure(err, 'Registration error:', 'Failed to save registration.');
  }
}
