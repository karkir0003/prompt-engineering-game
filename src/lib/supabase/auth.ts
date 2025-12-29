import { redirect } from "next/navigation";
import { createClient } from "./server";
import { DEFAULT_AUTH_REDIRECT, DEFAULT_UNAUTH_REDIRECT } from "@/constants/routes";
import type { User } from "@supabase/supabase-js";

/**
 * Internal helper to check authentication status and handle redirects
 */
async function checkAuth(options: {
  requireAuthenticated: boolean;
  redirectTo: string;
}): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If we require auth but user is not logged in, redirect to login
  if (options.requireAuthenticated && !user) {
    redirect(options.redirectTo);
  }

  // If we require guest (not authenticated) but user IS logged in, redirect away
  if (!options.requireAuthenticated && user) {
    redirect(options.redirectTo);
  }

  return user;
}

/**
 * Ensures the user is authenticated. If not, redirects to the login page.
 * Use this in authenticated routes like /daily-challenge.
 *
 * @param redirectTo - Where to redirect if not authenticated (defaults to DEFAULT_UNAUTH_REDIRECT)
 * @returns The authenticated user object
 *
 * @example
 * export default async function ProtectedPage() {
 *   await requireAuth();
 *   return <div>Protected content</div>
 * }
 */
export async function requireAuth(redirectTo = DEFAULT_UNAUTH_REDIRECT): Promise<User> {
  const user = await checkAuth({ requireAuthenticated: true, redirectTo });
  return user!; // TypeScript: user is guaranteed to exist or redirect happens
}

/**
 * Ensures the user is NOT authenticated. If they are, redirects to an authenticated route.
 * Use this on unauthenticated routes like /login or landing pages.
 *
 * @param redirectTo - Where to redirect if authenticated (defaults to DEFAULT_AUTH_REDIRECT)
 * @returns null (user is not authenticated)
 *
 * @example
 * export default async function LoginPage() {
 *   await requireGuest();
 *   return <div>Login form</div>
 * }
 */
export async function requireGuest(redirectTo = DEFAULT_AUTH_REDIRECT): Promise<null> {
  await checkAuth({ requireAuthenticated: false, redirectTo });
  return null; // TypeScript: user is guaranteed to not exist or redirect happens
}
