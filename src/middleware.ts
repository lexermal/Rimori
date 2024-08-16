import { parse } from 'cookie';
import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

// Create locale middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'se'],
  defaultLocale: 'en',
});

export async function middleware(request: NextRequest) {
  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const jwtUser = cookies.auth_user;

    if (jwtUser !== undefined) {
      // Apply locale middleware
      return intlMiddleware(request);
    } else {
      // Redirect to the login page
      return NextResponse.redirect(new URL('/login?fromMiddleware', request.url));

    }
  } catch (error) {
    // Handle errors gracefully, potentially redirecting to login
    NextResponse.redirect(new URL('/login?fromMiddleware', request.url));
    return intlMiddleware(request);

  }
}

export const config = {
  matcher: ['/', '/(de|en)/:path*', '/en/login'], // Ensure login page is excluded from redirect loop
};
