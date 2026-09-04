import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, track, experience, videoLink } = body;

    if (!name || !email || !phone || !track || !experience || !videoLink) {
      return NextResponse.json({ error: 'Name, email, phone, track, experience, and video link are required.' }, { status: 400 });
    }

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
      range: 'SkillsTraining!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
          name,
          email,
          phone,
          track,
          experience,
          videoLink,
        ]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Skills training registration error:', err);
    return NextResponse.json({ error: 'Failed to save registration.' }, { status: 500 });
  }
}
