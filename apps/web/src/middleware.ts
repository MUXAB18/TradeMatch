import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  
  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isLandingPage = pathname === '/';
  const isAdminPage = pathname.startsWith('/admin');
  
  // Public routes that don't require authentication
  const isPublicRoute = isAuthPage || isLandingPage || isAdminPage;
  
  // If no session and trying to access a protected route, redirect to login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Protect all routes except _next, api, static files, and our design test
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|design-test|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
