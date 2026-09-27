import { FormError, text } from './publicForms.js';

// Assignment times are typed and shown in West African Time (UTC+1, no daylight saving).
export const TIME_ZONE = 'Africa/Lagos';

// "2026-10-03T18:00" (from a datetime-local box, meaning WAT) -> a Date, or null when empty.
export function parseDueAt(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new FormError('Due date isn’t valid.');
  const d = new Date(`${value}:00+01:00`);
  if (Number.isNaN(d.getTime())) throw new FormError('Due date isn’t valid.');
  return d;
}

// An optional http(s) link. Anything else (javascript:, data:, ...) is refused.
export function optionalLink(value, label) {
  const link = text(value, { label, max: 500 });
  if (!link) return null;
  let url;
  try { url = new URL(link); } catch { throw new FormError(`${label} must be a full link starting with https://`); }
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || !url.hostname.includes('.')) {
    throw new FormError(`${label} must be a full link starting with https://`);
  }
  return link;
}

export function maxScoreField(value) {
  if (value === undefined || value === null || value === '') return 100;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new FormError('Total marks must be a whole number from 1 to 1000.');
  return n;
}

export function assignmentFields(body) {
  return {
    title: text(body.title, { label: 'Title', max: 150, required: true }),
    instructions: text(body.instructions, { label: 'Instructions', max: 5000 }),
    resourceLink: optionalLink(body.resourceLink, 'Resource link'),
    dueAt: parseDueAt(body.dueAt),
    maxScore: maxScoreField(body.maxScore),
  };
}
