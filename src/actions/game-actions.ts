"use server";

import type { GameResult } from "@/types/game.types";

// This is a "Server Action" - it runs entirely on the backend.
// Later, we will connect this to Fal.ai and Supabase.
// For now, it just pretends to work so we can test the UI.

export async function submitGuess(formData: FormData): Promise<GameResult> {
  // 1. Simulate a 2-second delay (like waiting for AI)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const prompt = formData.get("prompt") as string;
  console.log("SERVER: Received prompt:", prompt);

  // 2. Return a "Mock" result
  return {
    success: true,
    // A random Unsplash image to pretend the AI generated it
    imageUrl:
      "https://images.unsplash.com/photo-1739525257989-14a852654359?w=800&auto=format&fit=crop&q=60",
    score: 0.88, // 88% Match
    message: "Great attempt!",
  };
}
