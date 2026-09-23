import { NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '../../../../lib/adminAuth';

function resolveBlobAuth() {
  // On Vercel, the connected Blob store authenticates via OIDC automatically
  // (no token needed). BLOB_READ_WRITE_TOKEN is only used for local `next dev`,
  // since OIDC isn't available for the local development environment. Stray
  // quote characters are stripped defensively in case an env var got saved
  // with literal quotes included.
  let blobToken = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
  if (blobToken.startsWith('"') && blobToken.endsWith('"')) {
    blobToken = blobToken.slice(1, -1);
  }
  return blobToken || process.env.VERCEL_OIDC_TOKEN || '';
}

// Private Blob content must be streamed through an authenticated route —
// see https://vercel.com/docs/vercel-blob/private-storage. Middleware
// already gates /api/admin/*, but we re-check here per Vercel's own
// recommendation to verify auth right next to the get() call.
//
// We forward the client's Range header directly to Blob's origin (rather
// than using the SDK's get(), which always fetches the whole object) so the
// <video> element can seek and start playback without downloading the
// entire 40-60MB file first.
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

  const authToken = resolveBlobAuth();

  let meta;
  try {
    meta = await head(pathname, authToken ? { token: authToken } : undefined);
  } catch (err) {
    console.error('admin/video head() failed:', err);
    return new NextResponse('Not found', { status: 404 });
  }

  const range = request.headers.get('range');
  const originRes = await fetch(meta.url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      ...(range ? { Range: range } : {}),
    },
  });

  if (!originRes.ok && originRes.status !== 206) {
    return new NextResponse('Not found', { status: 404 });
  }

  const headers = {
    'Content-Type': meta.contentType || 'video/mp4',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'private, no-cache',
    'Accept-Ranges': 'bytes',
  };
  const contentRange = originRes.headers.get('content-range');
  const contentLength = originRes.headers.get('content-length');
  if (contentRange) headers['Content-Range'] = contentRange;
  if (contentLength) headers['Content-Length'] = contentLength;

  return new NextResponse(originRes.body, {
    status: originRes.status,
    headers,
  });
}
