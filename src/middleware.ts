// middleware.ts (at the root of your project or inside /src)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession, IronSessionData } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session'; // Adjust path if needed

// Define which paths should be protected
const protectedPaths = ['/dashboard', '/profile', '/settings','/superadmin','/list/*']; // Add your protected routes
const publicPaths = ['/', '/register', '/api/auth/login']; // Paths accessible without login

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the path is public (no session check needed)
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if the path requires authentication
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected) {
    console.log(`Checking session for protected route: ${pathname}`);
    // Use getIronSession directly with request/response objects in middleware
    const response = NextResponse.next(); // Prepare response object
    const session = await getIronSession<IronSessionData>(request, response, sessionOptions);

    const user = session.user;

    if (!user) {
      console.log(`No session found, redirecting to login from ${pathname}`);
      // Redirect to login page if no user session exists
      const loginUrl = new URL('/', request.url);
      // Optionally add a callback URL
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log(`Session valid for user ${user.id}, allowing access to ${pathname}`);
    // If user is logged in, proceed and attach session cookie to response if modified
    return response;
  }

  // If the path is neither explicitly public nor protected, allow access
  return NextResponse.next();
}

// Configure the middleware matcher
export const config = {
  // Match all request paths except for static files and internal Next.js paths
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ],
};
