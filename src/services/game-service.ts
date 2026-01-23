import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Challenge, Guess } from "@/types/game.types";

// Validates that a prompt is within acceptable length constraints
export function validatePrompt(prompt: string): {
  valid: boolean;
  error?: string;
} {
  if (!prompt || prompt.length === 0) {
    return { valid: false, error: "Prompt cannot be empty" };
  }

  if (prompt.length > 100) {
    return {
      valid: false,
      error: "Prompt must be between 1 and 100 characters",
    };
  }

  return { valid: true };
}

/**
 * Checks how many attempts a user has made for a specific challenge
 * Returns the attempt count and the next attempt number
 */
export async function getUserAttemptCount(
  userId: string,
  challengeId: string,
): Promise<{ count: number; nextAttemptNumber: number; error?: string }> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("guesses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("challenge_id", challengeId);

  if (error) {
    console.error("Error counting attempts:", error);
    return {
      count: 0,
      nextAttemptNumber: 1,
      error: "Failed to check attempts",
    };
  }

  const attemptCount = count || 0;
  return {
    count: attemptCount,
    nextAttemptNumber: attemptCount + 1,
    error: undefined,
  };
}

export async function getChallengeById(
  challengeId: string,
): Promise<{ challenge: Challenge | null; error?: string }> {
  const supabase = await createClient();

  const { data: challenge, error } = await supabase
    .from("challenges")
    .select("id, image_url")
    .eq("id", challengeId)
    .single();

  if (error || !challenge || !challenge.image_url) {
    console.error("Error fetching challenge:", error);
    return {
      challenge: null,
      error: "Failed to load challenge",
    };
  }

  return { challenge, error: undefined };
}

export async function saveGuess(guessData: {
  userId: string;
  challengeId: string;
  prompt: string;
  imageUrl: string | null;
  score: number;
  attemptNumber: number;
}): Promise<{ guess: Guess | null; error?: string }> {
  const supabase = await createClient();

  const { data: guess, error } = await supabase
    .from("guesses")
    .insert({
      user_id: guessData.userId,
      challenge_id: guessData.challengeId,
      prompt: guessData.prompt,
      generated_image_url: guessData.imageUrl,
      score: guessData.score,
      attempt_number: guessData.attemptNumber,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving guess:", error);
    return {
      guess: null,
      error: "Failed to save your guess",
    };
  }

  return { guess, error: undefined };
}

export async function getUserAttemptsForChallenge(
  userId: string,
  challengeId: string,
) {
  const supabase = await createClient();

  const { data: guesses, error } = await supabase
    .from("guesses")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .order("attempt_number", { ascending: true });

  if (error) {
    console.error("Error fetching attempts:", error);
    return null;
  }

  return guesses;
}

export async function getUserBestScore(
  userId: string,
  challengeId: string,
): Promise<number | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guesses")
    .select("score")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .order("score", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;

  return data.score;
}