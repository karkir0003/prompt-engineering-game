"use client";

import { useEffect } from "react";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import {
  GoogleSignInButton,
  EmailPasswordForm,
  AuthDivider,
} from "@/components/common/auth";

function LoginHeader() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="rounded-full bg-zinc-100 p-3">
        <Lock className="h-6 w-6 text-zinc-600" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="text-sm text-zinc-500">Enter your email to continue</p>
    </div>
  );
}

export default function LoginPage() {
  // Handle OAuth errors from callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      toast.error("Log in failed");
      // Clean up URL
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <LoginHeader />
        <GoogleSignInButton />
        <AuthDivider />
        <EmailPasswordForm />
      </div>
    </div>
  );
}
