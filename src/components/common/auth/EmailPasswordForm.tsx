"use client";

import { useActionState } from "react";
import { signInWithPassword, signUpWithPassword } from "@/actions/auth-actions";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            className="text-sm font-medium leading-none"
            htmlFor="password"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-zinc-500 hover:text-zinc-900 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input id="password" name="password" type="password" required />
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
        <Button
          formAction={loginAction}
          disabled={isLoginPending || isSignupPending}
          size="lg"
          className="w-full"
        >
          {isLoginPending ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            "Log In"
          )}
        </Button>

        <Button
          formAction={signupAction}
          disabled={isLoginPending || isSignupPending}
          variant="outline"
          size="lg"
          className="w-full"
        >
          {isSignupPending ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            "Sign Up"
          )}
        </Button>
      </div>
    </form>
  );
}
