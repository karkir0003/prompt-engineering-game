"use client";

import { useActionState } from "react";
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from "@/actions/auth-actions";
import { Loader2, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  // hook: [state, actionFunction, isPending]
  const [loginState, loginAction, isLoginPending] = useActionState(
    signInWithPassword,
    null,
  );
  const [signupState, signupAction, isSignupPending] = useActionState(
    signUpWithPassword,
    null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-zinc-100 p-3">
            <Lock className="h-6 w-6 text-zinc-600" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500">Enter your email to continue</p>
        </div>

        {/* Form */}
        <form className="space-y-4">
        {/* Google Button */}
          <div className="flex flex-col gap-2">
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50"
              onClick={() => signInWithGoogle()}
              type="button"
            >
              <FcGoogle className="h-5 w-5" />
              Sign in with Google
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-zinc-200"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-zinc-500">
                OR
              </span>
              <div className="flex-grow border-t border-zinc-200"></div>
            </div>
          </div>
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
            <label
              className="text-sm font-medium leading-none"
              htmlFor="password"
            >
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
      </div>
    </div>
  );
}
