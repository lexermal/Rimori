import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware';
import { supabase } from '@/utils/supabase/client';
import { createServerClient } from '@supabase/ssr';
// import { createClient } from '@/utils/supabase/server';

const i18nMiddleware = createMiddleware({
  locales: ['en', 'se'],
  defaultLocale: 'en',
});

export async function middleware(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/en';
  let response = i18nMiddleware(request);

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          }
        }
      }
    );


    const { error, data: { session } } = await supabase.auth.exchangeCodeForSession(code);


    // if (!error) {
    //   return NextResponse.redirect(`${origin}${next}`);
    // }

    // return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // If no code is found or there's an error in exchanging the code, continue with other middleware
  response = await updateSession(request, response);

  return response;
}

export const config = {
  matcher: ['/', '/(se|en)/:path*', '/auth/login'],
};
