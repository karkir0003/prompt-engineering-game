import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_ROUTES,
  PROTECTED_ROUTES,
  DEFAULT_AUTH_REDIRECT,
  DEFAULT_UNAUTH_REDIRECT,
} from "@/constants/routes";

/**
 * Middleware layer for authentication check via Supabase
 * Documentation: https://supabase.com/docs/guides/auth/server-side/creating-a-client#hook-up-proxy
 *
 */
export async function updateSession(request: NextRequest) {
  // 1. Create an initial response
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Setup the Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // This allows us to refresh the session cookie if needed
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 3. Check the user's status by validating auth token
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const pathname = request.nextUrl.pathname;

  // 4. Protect Routes
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isHomePage = pathname === "/";

  // If user IS logged in and tries to visit auth-only pages or home, redirect to protected area
  if (user && (isAuthRoute || isHomePage)) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTH_REDIRECT;
    return NextResponse.redirect(url);
  }

  // If user is NOT logged in and tries to visit a protected page, redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_UNAUTH_REDIRECT;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
