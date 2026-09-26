import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { ADMIN_SESSION_COOKIE, signAdminSession } from '../../../../lib/adminAuth';
import { clientIp, ipBlockedFor, recordIpFailure } from '../../../../lib/rateLimit.js';

// Compares SHA-256 digests so the check takes the same time however many leading
// characters of a guess are right (a plain !== can leak that).
function passcodeMatches(guess, actual) {
  if (!actual) return false;
  const a = createHash('sha256').update(String(guess)).digest();
  const b = createHash('sha256').update(String(actual)).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));
  const ip = clientIp(request);

  // If the attempt counter is unreachable, let the owner in rather than lock them out.
  try {
    const blockedMinutes = await ipBlockedFor('admin', ip);
    if (blockedMinutes) {
      return NextResponse.json({ error: `Too many wrong attempts. Try again in ${blockedMinutes} minute${blockedMinutes === 1 ? '' : 's'}.` }, { status: 429 });
    }
  } catch (err) {
    console.error('admin login: rate-limit check failed', err);
  }

  if (!password || !passcodeMatches(password, process.env.ADMIN_PASSWORD)) {
    try { await recordIpFailure('admin', ip); } catch (err) { console.error('admin login: could not record failure', err); }
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const token = await signAdminSession(process.env.ADMIN_SESSION_SECRET);
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
