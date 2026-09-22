import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '../../../../lib/adminAuth';

// Private Blob content must be streamed through an authenticated route —
// see https://vercel.com/docs/vercel-blob/private-storage. Middleware
// already gates /api/admin/*, but we re-check here per Vercel's own
// recommendation to verify auth right next to the get() call.
export async function GET(request) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await verifyAdminSession(token, process.env.ADMIN_SESSION_SECRET);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pathname = request.nextUrl.searchParams.get('pathname');
  if (!pathname || !pathname.startsWith('skills-training-videos/')) {
    return NextResponse.json({ error: 'Missing or invalid pathname' }, { status: 400 });
  }

  const result = await get(pathname, {
    access: 'private',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  if (!result || result.statusCode !== 200) {
    return new NextResponse('Not found', { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType || 'video/mp4',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-cache',
    },
  });
}
