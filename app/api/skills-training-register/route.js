import { NextResponse } from 'next/server';
import { FormError, TRACKS, readForm, text, emailField, phoneField, oneOf, webLink, appendRow, sheetsClient, formFailure } from '../../../lib/publicForms.js';

const EXPERIENCE = ['beginner', 'intermediate', 'advanced'];

export async function POST(request) {
  try {
    const body = await readForm(request, 'form-skills');
    const name = text(body.name, { label: 'Name', max: 120, required: true });
    const email = emailField(body.email);
    const phone = phoneField(body.phone);
    const track = oneOf(body.track, TRACKS, 'The skill you chose');
    const experience = oneOf(body.experience, EXPERIENCE, 'Experience level');
    const videoLink = webLink(body.videoLink, 'Video link');

    // The latest row for an email is the one that counts, so a fresh sign-up under an
    // already-approved person's email would silently reset them to pending. Refuse that.
    const existing = await sheetsClient().spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'SkillsTraining!C2:L',
    });
    const alreadyApproved = (existing.data.values || []).some(
      row => (row[0] || '').trim().toLowerCase() === email.toLowerCase() && (row[9] || '').trim() === 'Approved'
    );
    if (alreadyApproved) {
      throw new FormError('You’re already registered and approved for the training. If you need to change something, please contact the Thrive team.', 409);
    }

    await appendRow('SkillsTraining!A:G', [new Date().toISOString(), name, email, phone, track, experience, videoLink]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return formFailure(err, 'Skills training registration error:', 'Failed to save registration.');
  }
}
