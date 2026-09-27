import { NextResponse } from 'next/server';
import { FormError, readForm, text, emailField, oneOf, appendRow, formFailure } from '../../../lib/publicForms.js';

export async function POST(request) {
  try {
    const body = await readForm(request, 'form-feedback');
    const name = text(body.name, { label: 'Name', max: 120, required: true });
    const email = emailField(body.email);
    const session = text(body.session, { label: 'Session', max: 300, required: true });
    const feedback = text(body.feedback, { label: 'Feedback', max: 3000 });
    const improve = text(body.improve, { label: 'Improvements', max: 3000 });
    const interested2027 = oneOf(body.interested2027, ['Yes', 'No'], 'Your answer about 2027', { required: false });

    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new FormError('Please give a rating from 1 to 5.');

    const hearAbout = text(body.hearAbout, { label: 'How you heard about us', max: 100 });
    const hearAboutOther = text(body.hearAboutOther, { label: 'How you heard about us', max: 300 });
    const hearAboutFinal = hearAbout === 'Other' ? (hearAboutOther || 'Other') : hearAbout;

    await appendRow('Feedback!A:I', [
      new Date().toISOString(), name, email, rating, session, feedback, improve, hearAboutFinal, interested2027,
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return formFailure(err, 'Feedback submission error:', 'Failed to save feedback.');
  }
}
