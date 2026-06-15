import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, status, occupation, inTech, techAreas, aiKnowledge, marketingSalesKnowledge } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required.' }, { status: 400 });
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
      range: 'Registrations!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
          name,
          email,
          phone,
          status,
          occupation || '',
          inTech,
          Array.isArray(techAreas) ? techAreas.join(', ') : '',
          aiKnowledge,
          marketingSalesKnowledge,
        ]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Failed to save registration.' }, { status: 500 });
  }
}
