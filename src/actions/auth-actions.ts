"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Define the shape of the state we return to the client
export type AuthState = {
  success: boolean;
  error?: string;
  message?: string;
} | null;

/**
 * Sign in with email and password
 */
export async function signInWithPassword(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/daily-challenge");
}

/**
 * Sign up with email and password
 */
export async function signUpWithPassword(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  console.log("[signUpWithPassword] email", email);
  console.log("[signUpWithPassword] password", password);

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  console.log("[signUpWithPassword] error", error);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Check your email to confirm your account",
  };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
