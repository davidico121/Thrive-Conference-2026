import { sql } from './db.js';
import { MAX_FAILURES_PER_IP, IP_WINDOW_MINUTES } from './portalConfig.js';

// On Vercel these headers are set by the platform from the real connection, not by the client.
export function clientIp(request) {
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

const windowSeconds = IP_WINDOW_MINUTES * 60;

// Returns minutes until the block lifts, or 0 if this address may still try.
export async function ipBlockedFor(scope, ip) {
  const q = sql();
  const [row] = await q`SELECT failures, window_start FROM ip_attempts
                        WHERE scope = ${scope} AND ip = ${ip}
                          AND window_start = to_timestamp(floor(extract(epoch from now()) / ${windowSeconds}) * ${windowSeconds})`;
  if (!row || row.failures < MAX_FAILURES_PER_IP) return 0;
  const endsAt = new Date(row.window_start).getTime() + windowSeconds * 1000;
  return Math.max(1, Math.ceil((endsAt - Date.now()) / 60000));
}

export async function recordIpFailure(scope, ip) {
  const q = sql();
  await q`INSERT INTO ip_attempts (scope, ip, window_start, failures)
          VALUES (${scope}, ${ip}, to_timestamp(floor(extract(epoch from now()) / ${windowSeconds}) * ${windowSeconds}), 1)
          ON CONFLICT (scope, ip, window_start) DO UPDATE SET failures = ip_attempts.failures + 1`;
  // Housekeeping so attacker-supplied values can't grow these tables forever.
  await q`DELETE FROM ip_attempts WHERE window_start < now() - interval '1 day'`;
  await q`DELETE FROM login_attempts WHERE last_failure_at < now() - interval '1 day'`;
}
