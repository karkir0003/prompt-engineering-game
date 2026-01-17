import "server-only";

/**
 * Calculates CLIP similarity score by calling the scoring edge function
 * Throws an error if the score cannot be calculated
 */
export async function calculateSimilarityScore(
  challengeImageUrl: string,
  userPrompt: string,
  challengeId: string,
): Promise<{ score: number }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error("Missing Supabase credentials");
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/scoring`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: challengeImageUrl,
        textPrompt: userPrompt,
        challengeId: challengeId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Scoring function error: ${response.status}\n Message: ${errorText}`,
      );
    }

    const result = await response.json();

    if (result.success) {
      return { score: result.score };
    } else {
      throw new Error(result.error || "Scoring failed");
    }
  } catch (error) {
    console.error("Error calculating similarity:", error);
    throw new Error("Failed to calculate similarity score. Please try again.");
  }
}
