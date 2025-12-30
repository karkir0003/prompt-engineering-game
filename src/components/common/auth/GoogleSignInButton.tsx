"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { signInWithGoogle } from "@/actions/auth-actions";

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle();

    if (result?.error) {
      setIsLoading(false);
      toast.error(result.error);
      return;
    }

    if (result && "url" in result) {
      window.location.href = result.url;
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      type="button"
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
    >
      <FcGoogle className="h-5 w-5" />
      {isLoading ? "Signing in..." : "Sign in with Google"}
    </button>
  );
}
