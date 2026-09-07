import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, rating, session, feedback, improve, hearAbout, hearAboutOther, interested2027 } = body;

    if (!name || !email || !rating || !session) {
      return NextResponse.json({ error: 'Name, email, rating, and favorite session are required.' }, { status: 400 });
    }

    const hearAboutFinal = hearAbout === 'Other' ? (hearAboutOther || 'Other') : (hearAbout || '');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Feedback!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
          name,
          email,
          rating,
          session,
          feedback || '',
          improve || '',
          hearAboutFinal,
          interested2027 || '',
        ]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Feedback submission error:', err);
    return NextResponse.json({ error: 'Failed to save feedback.' }, { status: 500 });
  }
}
