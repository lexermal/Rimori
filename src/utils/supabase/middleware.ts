import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/utils/constants';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(
  request: NextRequest,
  response: NextResponse
) {

  const supabase = createServerClient(
    NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
  const loginPath = `/${locale}/auth/login`;
  const nextUrl = searchParams.get('next') ?? '/';

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !request.nextUrl.pathname.startsWith(loginPath)) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  } else if (user && request.nextUrl.pathname.startsWith(loginPath)) {
    return NextResponse.redirect(new URL(nextUrl, request.url));
  }

  return response;
}
