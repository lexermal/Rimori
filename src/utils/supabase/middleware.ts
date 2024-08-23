import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(
  request: NextRequest,
  response: NextResponse
) {
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

  const { data: { user } } = await supabase.auth.getUser();

  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
  const loginPath = `/${locale}/auth/login`;

  if (!user && !request.nextUrl.pathname.startsWith(loginPath)) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  } else if (user && request.nextUrl.pathname.startsWith(loginPath)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}