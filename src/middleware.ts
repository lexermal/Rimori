import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware';

const i18nMiddleware = createMiddleware({
  locales: ['en', 'se'],
  defaultLocale: 'en',
});

export async function middleware(request: NextRequest) {
  const response = i18nMiddleware(request);

  return await updateSession(request, response);
}

export const config = {
  matcher: ['/', '/(se|en)/:path*', '/auth/login'],
};
