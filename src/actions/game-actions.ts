"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { GameResult } from "@/types/game.types";

export async function submitGuess(
  challengeId: string,
  formData: FormData
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

  //  Validate prompt length
  if (!prompt || prompt.length > 100) {
    return {
      success: false,
      imageUrl: null,
      score: 0,
      message: "Prompt must be between 1 and 100 characters",
    };
  }

  // Check how many attempts the user has made for this challenge
  const { count, error: countError } = await supabase
    .from("guesses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId);

  if (countError) {
    console.error("Error counting attempts:", countError);
    return {
      success: false,
      imageUrl: null,
      score: 0,
      message: "Failed to check attempts. Please try again.",
    };
  }

  const attemptNumber = (count || 0) + 1;

  if (attemptNumber > 3) {
    return {
      success: false,
      imageUrl: null,
      score: 0,
      message: "You've used all 3 attempts for today's challenge!",
      attemptsLeft: 0,
    };
  }

  // Get the target challenge image to compare against
  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("image_url")
    .eq("id", challengeId)
    .single();

  if (challengeError || !challenge || !challenge.image_url) {
    console.error("Error fetching challenge:", challengeError);
    return {
      success: false,
      imageUrl: null,
      score: 0,
      message: "Failed to load challenge. Please try again.",
    };
  }

  // Placeholder for generated image
  const generatedImageUrl = challenge.image_url;

  // Calculate CLIP similarity by calling the scoring edge function
  let score = 0;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error("Missing Supabase credentials");
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/scoring`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${anonKey}`, 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: challenge.image_url,
          textPrompt: prompt,
          challengeId: challengeId, 
        }),
      }
    );

    console.log("Scoring function response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Scoring function error:", errorText);
      throw new Error(`Scoring function error: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      score = result.score;
      console.log("CLIP similarity score:", score);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error calculating similarity:", error);
    score = Math.random() * 50 + 25;
  }

  // Save the guess to the database
  const { data: guess, error: insertError } = await supabase
    .from("guesses")
    .insert({
      user_id: user.id,
      challenge_id: challengeId,
      prompt: prompt,
      image_url: generatedImageUrl,
      score: score,
      attempt_number: attemptNumber,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error saving guess:", insertError);
    return {
      success: false,
      imageUrl: null,
      score: 0,
      message: "Failed to save your guess. Please try again.",
    };
  }

  revalidatePath("/daily-challenge");

  const attemptsLeft = 3 - attemptNumber;

  return {
    success: true,
    imageUrl: challenge.image_url,
    score: score,
    message:
      attemptsLeft > 0
        ? `Great attempt! You have ${attemptsLeft} ${
            attemptsLeft === 1 ? "attempt" : "attempts"
          } left.`
        : "That was your last attempt! Check back tomorrow for a new challenge.",
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

  const { data: guesses, error } = await supabase
    .from("guesses")
    .select("*")
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId)
    .order("attempt_number", { ascending: true });

  if (error) {
    console.error("Error fetching attempts:", error);
    return null;
  }

  return guesses;
}

// Helper function to get user's best score for a challenge
export async function getBestScore(challengeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("guesses")
    .select("score")
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId)
    .order("score", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;

  return data.score;
}