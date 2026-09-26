import { NextResponse } from 'next/server';
import { PORTAL_COOKIE } from '../../../../lib/portalAuth.js';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(PORTAL_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
