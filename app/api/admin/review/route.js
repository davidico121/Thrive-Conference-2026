import { NextResponse } from 'next/server';
import { setReviewStatus } from '../../../../lib/googleSheets';

const VALID_STATUSES = ['Pending', 'Approved', 'Rejected'];

export async function POST(request) {
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
