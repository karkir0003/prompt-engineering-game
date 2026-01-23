import "server-only";

interface GenerateImageResponse {
  success: boolean;
  imageUrl: string;
  width?: number;
  height?: number;
  seed?: number;
  inferenceTime?: number;
  error?: string;
}

/**
 * Generates an image using Fal.ai and saves it to the guess
 */
export async function generateImage(
  prompt: string,
  guessId: string,
): Promise<GenerateImageResponse> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase credentials");
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          guessId,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Image generation error: ${response.status}\n Message: ${errorText}`,
      );
    }

    const result: GenerateImageResponse = await response.json();

    if (result.success) {
      return result;
    } else {
      throw new Error(result.error || "Image generation failed");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
}