import { parse } from 'cookie';
import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'se'],
  defaultLocale: 'en',
});

export async function middleware(request: NextRequest) {
  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const jwtUser = cookies.auth_user;

    if (request.nextUrl.pathname === '/auth/login') {
      if (jwtUser !== undefined) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
    }

    if (jwtUser !== undefined) {
      return intlMiddleware(request);
    } else {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/', '/(de|en)/:path*', '/auth/login'],
};
