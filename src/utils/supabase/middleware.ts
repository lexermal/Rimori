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

  // const { searchParams, origin } = new URL(request.url);
  // const code = searchParams.get('code');
  // const next = searchParams.get('next') ?? '/';


  // if (code) {

  //   const { error, data: { session } } = await supabase.auth.exchangeCodeForSession(code);

  //   if (!error) {
  //     console.log('setting session')
  //     await supabase.auth.setSession(session!)
  //     // return NextResponse.redirect(new URL('/', request.url));
  //   }
  // }

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