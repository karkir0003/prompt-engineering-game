"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { GameResult } from "@/types/game.types";
import {
  validatePrompt,
  getUserAttemptCount,
  getChallengeById,
  saveGuess,
  getUserAttemptsForChallenge,
  getUserBestScore,
} from "@/services/game-service";
import { calculateSimilarityScore } from "@/services/scoring-service";
import { generateImage } from "@/services/image-generation-service";

// Formats the attempt message based on remaining attempts
function formatAttemptMessage(attemptsLeft: number): string {
  if (attemptsLeft > 0) {
    return `Great attempt! You have ${attemptsLeft} ${
      attemptsLeft === 1 ? "attempt" : "attempts"
    } left.`;
  }
  return "That was your last attempt! Check back tomorrow for a new challenge.";
}

export async function submitGuess(
  challengeId: string,
  formData: FormData,
): Promise<GameResult> {
  const supabase = await createClient();

  // Get the current authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      imageUrl: null,
      score: 0,
      message: "You must be logged in to submit a guess",
    };
  }

  const prompt = formData.get("prompt") as string;

  // Validate prompt length
  const validation = validatePrompt(prompt);
  if (!validation.valid) {
    return {
      success: false,
      imageUrl: null,
      score: 0,
      message: validation.error!,
    };
  }

  // Check how many attempts the user has made for this challenge
  const attemptData = await getUserAttemptCount(user.id, challengeId);
  if (attemptData.error) {
    return {
      success: false,
      imageUrl: null,
      score: 0,
      message: `${attemptData.error}. Please try again.`,
    };
  }

  const { nextAttemptNumber } = attemptData;

  if (nextAttemptNumber > 3) {
    return {
      success: false,
      imageUrl: null,
      score: 0,
      message: "You've used all 3 attempts for today's challenge!",
      attemptsLeft: 0,
    };
  }

  // Get the target challenge image to compare against
  const { challenge, error: challengeError } =
    await getChallengeById(challengeId);

  if (challengeError || !challenge) {
    return {
      success: false,
      imageUrl: null,
      score: 0,
      message: `${challengeError}. Please try again.`,
    };
  }

  // Generate the image using Fal.ai first 
  let generatedImageUrl: string;
  try {
    // Create a temporary guess ID for the edge function to update
    const tempGuessId = crypto.randomUUID();
    const imageResult = await generateImage(prompt, tempGuessId);
    generatedImageUrl = imageResult.imageUrl;
  } catch (error) {
    console.error("Image generation failed:", error);
    return {
      success: false,
      imageUrl: null,
      score: 0,
      message: "Failed to generate image. Please try again.",
    };
  }

  // Step 2: Calculate CLIP similarity score between target and generated image
  let score: number;
  try {
    const result = await calculateSimilarityScore(
      challenge.image_url,
      generatedImageUrl,
      challengeId,
    );
    score = result.score;
  } catch (error) {
    console.error("Score calculation failed:", error);
    return {
      success: false,
      imageUrl: generatedImageUrl,
      score: 0,
      message: "Unable to calculate score. Please try again.",
    };
  }

  // Aave the guess with all data (image url and the score)
  const { guess, error: saveError } = await saveGuess({
    userId: user.id,
    challengeId,
    prompt,
    imageUrl: generatedImageUrl,
    score,
    attemptNumber: nextAttemptNumber,
  });

  if (saveError || !guess) {
    return {
      success: false,
      imageUrl: generatedImageUrl,
      score: 0,
      message: `${saveError}. Please try again.`,
    };
  }

  revalidatePath("/daily-challenge");

  const attemptsLeft = 3 - nextAttemptNumber;

  return {
    success: true,
    imageUrl: generatedImageUrl,
    score: score,
    message: formatAttemptMessage(attemptsLeft),
    attemptsLeft: attemptsLeft,
  };
}

// Helper function to get user's attempts for a challenge
export async function getUserAttempts(challengeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return getUserAttemptsForChallenge(user.id, challengeId);
}

// Helper function to get user's best score for a challenge
export async function getBestScore(challengeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return getUserBestScore(user.id, challengeId);
}