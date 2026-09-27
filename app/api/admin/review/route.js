import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '../../../../lib/adminAuth';
import { setReviewStatus } from '../../../../lib/googleSheets';

const VALID_STATUSES = ['Pending', 'Approved', 'Rejected'];

export async function POST(request) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !(await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, secret))) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }
  try {
    const { email, status } = await request.json();
    if (!email || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid email or status.' }, { status: 400 });
    }
    await setReviewStatus(email, status);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Review update error:', err);
    return NextResponse.json({ error: 'Failed to update review status.' }, { status: 500 });
  }
}
