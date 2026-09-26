import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from './lib/adminAuth';
import { PORTAL_COOKIE, verifyPortalSession } from './lib/portalAuth';

const PORTAL_PUBLIC = ['/portal/login', '/api/portal/login'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Student / tutor portal: any valid portal session may pass here. Which pages
  // and data a person may see is decided in the pages and routes, from the database.
  if (pathname.startsWith('/portal') || pathname.startsWith('/api/portal') || pathname.startsWith('/api/tutor')) {
    if (PORTAL_PUBLIC.includes(pathname)) return NextResponse.next();
    const session = await verifyPortalSession(request.cookies.get(PORTAL_COOKIE)?.value, process.env.ADMIN_SESSION_SECRET);
    if (session) return NextResponse.next();
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/portal/login', request.url));
  }

  // Master admin pages.
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
  matcher: ['/admin/:path*', '/api/admin/:path*', '/portal/:path*', '/api/portal/:path*', '/api/tutor/:path*'],
};
