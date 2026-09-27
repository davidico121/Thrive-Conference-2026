import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { clientIp, ipBlockedFor, recordIpHit } from './rateLimit.js';

// Shared handling for the public sign-up forms. Anyone on the internet can call these, so
// every value is checked for type and length before it goes near the sheet, submissions are
// limited per network address, and rows are written as plain text (RAW) so that something
// typed like =IMPORTDATA("https://...") is stored as text and never runs as a spreadsheet formula.

export const TRACKS = [
  'AI & AI Automation',
  'Video Editing & AI Video Content',
  'Copywriting & Content Writing',
  'Graphic Designing',
  'UI/UX Designing',
  'Social Media Management',
];

const SUBMISSIONS_PER_WINDOW = 15; // per network address per 15 minutes; generous for shared connections

export class FormError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// Reads the JSON body after applying the per-address limit. Throws FormError to refuse.
export async function readForm(request, scope) {
  const ip = clientIp(request);
  try {
    const minutes = await ipBlockedFor(scope, ip, SUBMISSIONS_PER_WINDOW);
    if (minutes) throw new FormError(`Too many submissions from your network. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`, 429);
    await recordIpHit(scope, ip);
  } catch (err) {
    if (err instanceof FormError) throw err;
    console.error('sign-up limiter unavailable, allowing the request:', err); // don't block real sign-ups if the counter is down
  }

  let body;
  try { body = await request.json(); } catch { throw new FormError('That request could not be read.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new FormError('That request could not be read.');
  return body;
}

// A trimmed string with control characters removed, or '' when empty. Rejects non-strings and
// anything over `max` characters rather than silently cutting it.
export function text(value, { label, max = 200, required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new FormError(`${label} is required.`);
    return '';
  }
  if (typeof value !== 'string') throw new FormError(`${label} isn’t valid.`);
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (required && !cleaned) throw new FormError(`${label} is required.`);
  if (cleaned.length > max) throw new FormError(`${label} is too long (most ${max} characters).`);
  return cleaned;
}

export function emailField(value) {
  const email = text(value, { label: 'Email', max: 254, required: true });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new FormError('Please enter a valid email address.');
  return email;
}

export function phoneField(value) {
  const phone = text(value, { label: 'Phone', max: 40, required: true });
  if (phone.replace(/\D/g, '').length < 6) throw new FormError('Please enter a valid phone number.');
  return phone;
}

export function oneOf(value, allowed, label, { required = true } = {}) {
  const v = text(value, { label, max: 200, required });
  if (v && !allowed.includes(v)) throw new FormError(`${label} isn’t valid.`);
  return v;
}

export function webLink(value, label) {
  const link = text(value, { label, max: 500, required: true });
  let url;
  try { url = new URL(link); } catch { throw new FormError(`${label} must be a full link starting with https://`); }
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || !url.hostname.includes('.')) {
    throw new FormError(`${label} must be a full link starting with https://`);
  }
  return link;
}

export function sheetsClient(scopes = ['https://www.googleapis.com/auth/spreadsheets']) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes,
  });
  return google.sheets({ version: 'v4', auth });
}

export async function appendRow(range, values) {
  await sheetsClient().spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });
}

// Turns a thrown FormError into the JSON response; anything else is logged and hidden.
export function formFailure(err, logLabel, genericMessage) {
  if (err instanceof FormError) return NextResponse.json({ error: err.message }, { status: err.status });
  console.error(logLabel, err);
  return NextResponse.json({ error: genericMessage }, { status: 500 });
}
