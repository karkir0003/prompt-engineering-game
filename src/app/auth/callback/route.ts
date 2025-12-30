import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_AUTH_REDIRECT } from "@/constants/routes";

/**
 * Callback for sign in with google: https://supabase.com/docs/guides/auth/social-login/auth-google?queryGroups=environment&environment=server#application-code
 * @param request Request data for callback to complete OAuth with Google
 * @returns No return, but user is redirected to next URL based on auth result
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Default to daily-challenge if no 'next' param is provided
  const next = searchParams.get("next") ?? "/daily-challenge";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Security Check: Ensure we only redirect to relative paths or our own domain
      const forwardedHost = request.headers.get("x-forwarded-host"); 
      const isLocalEnv = process.env.NODE_ENV === "development";
      
      const sanitizedNext = next.startsWith("/") && !next.startsWith("//") 
        ? next 
        : DEFAULT_AUTH_REDIRECT;

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${sanitizedNext}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${sanitizedNext}`);
      } else {
        return NextResponse.redirect(`${origin}${sanitizedNext}`);
      }
    }
  }

  // If something went wrong, send them back to login with an error
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}