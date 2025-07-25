import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, auth routes, and public paths
  const publicPaths = [
    '/_next/',
    '/api/_next/',
    '/api/auth/',
    '/auth/',
    '/',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/images/',
    '/icons/',
  ];

  const isPublicPath =
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.includes('.') ||
    pathname === '/';

  if (isPublicPath) {
    return NextResponse.next();
  }

  console.log('🛡️ Middleware: Checking auth for:', pathname);

  try {
    // Only check token for dashboard routes
    if (!pathname.startsWith('/dashboard')) {
      return NextResponse.next();
    }

    // Get the token from the request with proper secret
    const token = await getToken({
      req: request,
      secret:
        process.env.NEXTAUTH_SECRET ||
        'dev-secret-key-at-least-32-characters-long-for-development',
    });

    console.log('🎫 Middleware token check:', {
      path: pathname,
      hasToken: !!token,
      userId: token?.sub,
      role: token?.role,
    });

    // If no token, redirect to login for dashboard routes
    if (!token) {
      console.log('❌ No token for protected route, redirecting to login');
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check for admin routes
    if (
      pathname.startsWith('/dashboard/admin') ||
      pathname.startsWith('/api/admin')
    ) {
      if (!token || token.role !== 'ADMIN') {
        console.log('❌ Admin access denied, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Add security headers
    const response = NextResponse.next();

    // Enhanced security headers for production
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    // Add cache control for authenticated routes
    if (token && pathname.startsWith('/dashboard')) {
      response.headers.set('Cache-Control', 'no-store, must-revalidate');
    }

    console.log('✅ Middleware: Access granted for:', pathname);
    return response;
  } catch (error) {
    console.error('🚨 Middleware error:', error);

    // On error, redirect to login for safety
    if (pathname.startsWith('/dashboard')) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
