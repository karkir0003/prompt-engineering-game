"use client";

import { useActionState } from "react";
import { resetPassword } from "@/actions/auth-actions";
import Link from "next/link";

export default function ForgotPassword() {
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>

        {state?.success ? (
          <div className="p-4 bg-green-50 text-green-700 rounded">
            {state.message}
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 text-center">
              Enter your email address and we&apos;ll send you a link to reset your
              password.
            </p>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="border p-2 rounded"
            />
            <button
              disabled={isPending}
              className="bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
