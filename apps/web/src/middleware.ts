import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  
  const pathname = request.nextUrl.pathname;
  
  // Strip locale prefix to check auth rules correctly
  const pathnameIsMissingLocale = routing.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  
  const pathnameWithoutLocale = pathnameIsMissingLocale 
    ? pathname
    : pathname.replace(new RegExp(`^/(${routing.locales.join('|')})/?`), '/') || '/';
    
  const isAuthPage = pathnameWithoutLocale.startsWith('/login') || pathnameWithoutLocale.startsWith('/signup');
  const isLandingPage = pathnameWithoutLocale === '/';
  const isAdminPage = pathnameWithoutLocale.startsWith('/admin');
  
  const isPublicRoute = isAuthPage || isLandingPage || isAdminPage;
  
  if (!session && !isPublicRoute) {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
  
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames, while ignoring static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|design-test|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
