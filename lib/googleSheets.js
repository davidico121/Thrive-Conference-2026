import { google } from 'googleapis';

const SHEET_NAME = 'SkillsTraining';
const DATA_RANGE = `${SHEET_NAME}!A2:L`;

function getAuth(scopes) {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes,
  });
}

export function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuth(['https://www.googleapis.com/auth/spreadsheets']) });
}

export async function getLatestSkillsTrainingParticipants() {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: DATA_RANGE,
  });
  const rows = res.data.values || [];

  const byEmail = new Map();
  rows.forEach((row, i) => {
    const rowNumber = i + 2;
    const [
      timestamp, name, email, phone, track, experience, videoLink,
      hostedVideoUrl, ingestStatus, ingestNote, lastIngestedLink, reviewStatus,
    ] = row;
    if (!email) return;
    byEmail.set(email.trim().toLowerCase(), {
      rowNumber,
      timestamp: timestamp || '',
      name: (name || '').trim(),
      email: email.trim(),
      phone: phone || '',
      track: track || '',
      experience: experience || '',
      videoLink: videoLink || '',
      hostedVideoUrl: hostedVideoUrl || '',
      ingestStatus: ingestStatus || '',
      ingestNote: ingestNote || '',
      reviewStatus: reviewStatus || 'Pending',
    });
  });

  return Array.from(byEmail.values()).sort((a, b) => b.rowNumber - a.rowNumber);
}

export async function setReviewStatus(email, status) {
  const participants = await getLatestSkillsTrainingParticipants();
  const match = participants.find(p => p.email.toLowerCase() === email.toLowerCase());
  if (!match) throw new Error('Participant not found.');

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${SHEET_NAME}!L${match.rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[status]] },
  });
}
