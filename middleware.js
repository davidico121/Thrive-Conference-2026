import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from './lib/adminAuth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';
  if (isLoginPage || isLoginApi) return NextResponse.next();

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await verifyAdminSession(token, process.env.ADMIN_SESSION_SECRET);

  if (!valid) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
