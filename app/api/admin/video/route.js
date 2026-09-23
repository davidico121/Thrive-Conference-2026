import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '../../../../lib/adminAuth';

// Private Blob content must be streamed through an authenticated route —
// see https://vercel.com/docs/vercel-blob/private-storage. Middleware
// already gates /api/admin/*, but we re-check here per Vercel's own
// recommendation to verify auth right next to the get() call.
//
// The client's Range header is forwarded to Blob so the <video> element can
// start playing and seek without downloading the whole 40-80MB file first.
export async function GET(request) {
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await verifyAdminSession(sessionToken, process.env.ADMIN_SESSION_SECRET);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pathname = request.nextUrl.searchParams.get('pathname');
  if (!pathname || !pathname.startsWith('skills-training-videos/')) {
    return NextResponse.json({ error: 'Missing or invalid pathname' }, { status: 400 });
  }

  // On Vercel the connected store authenticates via OIDC automatically, so no
  // token is passed. BLOB_READ_WRITE_TOKEN is only used for local `next dev`,
  // where OIDC isn't available. Stray wrapping quotes are stripped in case an
  // env var was saved with literal quote characters.
  let blobToken = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
  if (blobToken.startsWith('"') && blobToken.endsWith('"')) {
    blobToken = blobToken.slice(1, -1);
  }

  const range = request.headers.get('range');

  let result;
  try {
    result = await get(pathname, {
      access: 'private',
      ...(blobToken ? { token: blobToken } : {}),
      ...(range ? { headers: { Range: range } } : {}),
    });
  } catch (err) {
    console.error('admin/video get() failed:', err);
    return new NextResponse('Not found', { status: 404 });
  }

  if (!result || result.statusCode !== 200) {
    return new NextResponse('Not found', { status: 404 });
  }

  const headers = {
    'Content-Type': result.blob.contentType || 'video/mp4',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'private, no-cache',
    'Accept-Ranges': 'bytes',
  };
  const contentRange = result.headers?.get('content-range');
  const contentLength = result.headers?.get('content-length');
  if (contentRange) headers['Content-Range'] = contentRange;
  if (contentLength) headers['Content-Length'] = contentLength;

  return new NextResponse(result.stream, {
    status: contentRange ? 206 : 200,
    headers,
  });
}
