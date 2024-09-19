import { env } from '@/utils/constants';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(
  request: NextRequest,
  response: NextResponse
) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
  const loginPath = `/${locale}/auth/login`;
  const nextUrl = searchParams.get('next') ?? '/';
  const waitlistPath = `/${locale}/waitlist`;

  if (request.nextUrl.pathname.startsWith(waitlistPath)) {
    return response;
  }

  const supabase = createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
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


  if (request.nextUrl.pathname.startsWith(waitlistPath)) {
    return response;
  }

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
  }

  const { data: { user } } = await supabase.auth.getUser();

  // const allowedDomains = env.ALLOWED_DOMAINS;

  // if (user) {
  //   const emailDomain = user.email?.split('@')[1];

  //   if (allowedDomains && !allowedDomains.includes(emailDomain as string)) {
  //     const userEmail = user.email;
  //     await supabase.auth.signOut();
  //     return NextResponse.redirect(new URL(`/${locale}/waitlist?email=${encodeURIComponent(userEmail as string)}`, request.url));
  //   }
  // }

  if (!user && !request.nextUrl.pathname.startsWith(loginPath)) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  } else if (user && request.nextUrl.pathname.startsWith(loginPath)) {
    return NextResponse.redirect(new URL(nextUrl, request.url));
  }

  return response;
}
