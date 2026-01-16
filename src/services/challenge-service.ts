import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getTodaysChallenge() {
  const supabase = await createClient();

  // Get today's date in UTC
  const today = new Date();
  const dateString = today.toISOString().split("T")[0]; // 'YYYY-MM-DD'

  // Fetch today's challenge
  const { data: challenge, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("date", dateString)
    .single();

  if (error) {
    console.error("Error fetching challenge:", error);
    return null;
  }

  return challenge;
}

// Generates a new challenge by calling the edge function
export async function generateChallenge() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase credentials for challenge generation");
    return null;
  }

  try {
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-daily-challenge`;

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error generating challenge:", errorData);
      return null;
    }

    const result = await response.json();
    return result.challenge;
  } catch (error) {
    console.error("Failed to generate challenge:", error);
    return null;
  }
}

export async function ensureTodaysChallengeExists() {
  // Try to get today's challenge
  let challenge = await getTodaysChallenge();

  // If no challenge exists, generate one
  if (!challenge) {
    console.log("No challenge found for today, generating...");
    challenge = await generateChallenge();

    // If generation succeeded, fetch the challenge from DB to get complete data
    if (challenge) {
      challenge = await getTodaysChallenge();
    }
  }

  return challenge;
}