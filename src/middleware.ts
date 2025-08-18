import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';

const publicExact = [
  '/', 
  '/register', 
  '/login'
];
const protectedPrefixes = [
  '/dashboard', 
  '/profile', 
  '/settings', 
  '/superadmin', 
  '/qc', 
  '/list', 
  '/security',
  '/weighing',
  '/admin',
  '/superadmin'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log(`[middleware] path = ${pathname}`);

  if (publicExact.includes(pathname)) {
    return NextResponse.next();
  }

  const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix));
  if (!isProtected) {
    return NextResponse.next();
  }

  console.log(`[middleware] protected route hit: ${pathname}`);

  const response = NextResponse.next();
  const session = await getIronSession<IronSessionData>(request, response, sessionOptions);
  const user = session.user;

  if (!user) {
    console.log(`[middleware] no session, redirect to login from ${pathname}`);
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log(`[middleware] session ok for user ${user.id}, proceed: ${pathname}`);
  return response;
}

export const config = {
  matcher: [
    // Jalankan untuk semua path kecuali assets/internal
    '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ],
};