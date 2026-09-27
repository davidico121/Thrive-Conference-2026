import { NextResponse } from 'next/server';
import { readForm, text, emailField, phoneField, appendRow, formFailure } from '../../../lib/publicForms.js';

export async function POST(request) {
  try {
    const body = await readForm(request, 'form-volunteer');
    const name = text(body.name, { label: 'Name', max: 120, required: true });
    const email = emailField(body.email);
    const phone = phoneField(body.phone);
    const role = text(body.role, { label: 'Role', max: 200, required: true });
    const availability = text(body.availability, { label: 'Availability', max: 300, required: true });
    const experience = text(body.experience, { label: 'Experience', max: 2000 });

    await appendRow('Volunteers!A:F', [new Date().toISOString(), name, email, phone, role, availability, experience]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return formFailure(err, 'Volunteer error:', 'Failed to save volunteer application.');
  }
}
