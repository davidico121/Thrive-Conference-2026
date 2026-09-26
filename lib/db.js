import { neon } from '@neondatabase/serverless';

let client;

// Returns Neon's tagged-template query function: const rows = await sql()`SELECT ...`
// Values interpolated into the template are sent as bound parameters, never concatenated.
export function sql() {
  if (!client) {
    let url = (process.env.DATABASE_URL || '').trim();
    if (url.startsWith('"') && url.endsWith('"')) url = url.slice(1, -1);
    if (!url) throw new Error('DATABASE_URL is not set');
    client = neon(url);
  }
  return client;
}
