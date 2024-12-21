import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { REGION_LOCALE_MAP } from '@/src/config/constants';

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = req.nextauth?.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth/');
    const isPublicPath = [
      '/',
      '/auth/signin',
      '/auth/signup',
      '/auth/error',
      '/auth/reset-password',
    ].includes(req.nextUrl.pathname);

    // Handle callback URL for authentication
    const callbackUrl = req.nextUrl.searchParams.get('callbackUrl');
    if (callbackUrl) {
      req.nextUrl.searchParams.set('callbackUrl', decodeURIComponent(callbackUrl));
    }

    // Handle public paths
    if (isPublicPath) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/england/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // If not authenticated and not on an auth page, redirect to sign in with callback
    if (!isAuth && !isAuthPage) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', encodeURIComponent(req.nextUrl.pathname));
      return NextResponse.redirect(signInUrl);
    }

    // Handle API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Handle static files
    if (req.nextUrl.pathname.match(/\.(jpg|png|gif|css|js|svg|ico)$/)) {
      return NextResponse.next();
    }

    // Handle region and language
    const pathname = req.nextUrl.pathname;
    const searchParams = req.nextUrl.searchParams;
    
    // Extract region from URL (first path segment)
    const urlRegion = pathname.split('/')[1];
    const isValidRegion = Object.keys(REGION_LOCALE_MAP).includes(urlRegion);

    // If no valid region and not root page, redirect to default region
    if (!isValidRegion && pathname !== '/') {
      const defaultPath = isAuth ? '/england/dashboard' : '/auth/signin';
      return NextResponse.redirect(new URL(defaultPath, req.url));
    }

    // Get language preference
    const lang = searchParams.get('lang');
    const region = urlRegion || 'england';
    const supportedLocales = REGION_LOCALE_MAP[region as keyof typeof REGION_LOCALE_MAP];
    const defaultLocale = Array.isArray(supportedLocales) ? supportedLocales[0] : supportedLocales;

    // Set language in headers for server components
    const response = NextResponse.next();
    response.headers.set('x-language', lang || defaultLocale);
    response.headers.set('x-region', region);
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
  }
);

export const config = {
  matcher: [
    '/england/:path*',
    '/wales/:path*',
    '/scotland/:path*',
    '/ireland/:path*',
    '/northern-ireland/:path*',
    '/dashboard/:path*',
    '/settings/:path*'
  ],
};
