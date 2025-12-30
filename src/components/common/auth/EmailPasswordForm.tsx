"use client";

import { useActionState } from "react";
import { signInWithPassword, signUpWithPassword } from "@/actions/auth-actions";
import { Loader2 } from "lucide-react";

export function EmailPasswordForm() {
  const [loginState, loginAction, isLoginPending] = useActionState(
    signInWithPassword,
    null,
  );
  const [signupState, signupAction, isSignupPending] = useActionState(
    signUpWithPassword,
    null,
  );

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          className="flex h-10 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="flex h-10 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
        />
      </div>

      {/* Error / Success Messages */}
      {(loginState?.error || signupState?.error) && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
          {loginState?.error || signupState?.error}
        </div>
      )}
      {signupState?.message && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          {signupState.message}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          formAction={loginAction}
          disabled={isLoginPending || isSignupPending}
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900/90 disabled:opacity-50"
        >
          {isLoginPending ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            "Log In"
          )}
        </button>

        <button
          formAction={signupAction}
          disabled={isLoginPending || isSignupPending}
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50"
        >
          {isSignupPending ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            "Sign Up"
          )}
        </button>
      </div>
    </form>
  );
}
