import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface GenerateImageRequest {
  prompt: string;
  guessId?: string;
}

interface FalAIResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  timings: {
    inference: number;
  };
  seed: number;
  has_nsfw_concepts: boolean[];
  prompt: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    const falApiKey = Deno.env.get("FAL_API_KEY") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!falApiKey) {
      throw new Error("Missing FAL_API_KEY");
    }

    // Parse request body
    const { prompt, guessId }: GenerateImageRequest = await req.json();

    if (!prompt || prompt.length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }

    // Validate prompt length (max 100 chars as per game rules)
    if (prompt.length > 100) {
      return new Response(
        JSON.stringify({ error: "Prompt must be 100 characters or less" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }

    console.log("Generating image for prompt:", prompt);

    // Call Fal.ai Flux Dev model
    const response = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        Authorization: `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: "square_hd", // 1024x1024
        num_inference_steps: 28,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fal.ai API error:", response.status, errorText);
      throw new Error(`Fal.ai API error: ${response.status} - ${errorText}`);
    }

    const result: FalAIResponse = await response.json();

    console.log("Image generated successfully");
    console.log("Inference time:", result.timings.inference, "seconds");

    const imageUrl = result.images[0].url;

    // If guessId is provided, save the generated image to the guesses table
    if (guessId && supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { error: updateError } = await supabase
          .from("guesses")
          .update({ generated_image_url: imageUrl })
          .eq("id", guessId);

        if (updateError) {
          console.error("Error saving generated image to database:", updateError);
        } else {
          console.log("Generated image saved to guess:", guessId);
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    }

    // Return the generated image URL
    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        width: result.images[0].width,
        height: result.images[0].height,
        seed: result.seed,
        inferenceTime: result.timings.inference,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});