import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface RequestBody {
  imageUrl: string;
  textPrompt: string;
  challengeId?: string;
}

Deno.serve(async (req) => {
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
    const hfSpaceUrl = Deno.env.get("HUGGINGFACE_SPACE_URL") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!hfSpaceUrl) {
      throw new Error("Missing HUGGINGFACE_SPACE_URL");
    }

    const { imageUrl, textPrompt, challengeId }: RequestBody = await req.json();

    if (!imageUrl || !textPrompt) {
      return new Response(
        JSON.stringify({ error: "imageUrl and textPrompt are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Calculating CLIP similarity:", { imageUrl, textPrompt, challengeId });

    // Check for cached embedding
    let imageEmbedding: number[] | null = null;
    let shouldCache = false;

    if (challengeId && supabaseUrl && supabaseServiceKey) {
      console.log("Checking for cached embedding...");
      const { createClient } = await import("jsr:@supabase/supabase-js@2");
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data } = await supabase
        .from("challenges")
        .select("embedding")
        .eq("id", challengeId)
        .single();

      if (data?.embedding && Array.isArray(data.embedding)) {
        console.log("Using cached image embedding");
        imageEmbedding = data.embedding;
      } else {
        console.log("Will cache embedding after generation");
        shouldCache = true;
      }
    }

    // Generate image embedding if not cached
    if (!imageEmbedding) {
      console.log("Calling HF Space for image embedding...");
      
      const imgResponse = await fetch(`${hfSpaceUrl}/api/image-embedding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl
        }),
      });

      if (!imgResponse.ok) {
        const errorText = await imgResponse.text();
        console.error("HF Space error:", imgResponse.status, errorText);
        throw new Error(`HF Space error: ${imgResponse.status} - ${errorText}`);
      }

      const imgData = await imgResponse.json();
      console.log("HF Space image response keys:", Object.keys(imgData));
      console.log("Image embedding type:", typeof imgData.embedding);
      
      if (!imgData.embedding || !Array.isArray(imgData.embedding)) {
        throw new Error(`Invalid image embedding format: ${JSON.stringify(imgData)}`);
      }

      imageEmbedding = imgData.embedding;
      console.log("Image embedding received, length:", imageEmbedding.length);

      // Cache it
      if (shouldCache && challengeId && supabaseUrl && supabaseServiceKey) {
        try {
          console.log("Caching image embedding...");
          const { createClient } = await import("jsr:@supabase/supabase-js@2");
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          await supabase
            .from("challenges")
            .update({ embedding: imageEmbedding })
            .eq("id", challengeId);
          
          console.log("Image embedding cached");
        } catch (cacheError) {
          console.error("Error caching embedding:", cacheError);
        }
      }
    }

    // Generate text embedding
    console.log("Calling HF Space for text embedding...");
    const txtResponse = await fetch(`${hfSpaceUrl}/api/text-embedding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: textPrompt
      }),
    });

    if (!txtResponse.ok) {
      const errorText = await txtResponse.text();
      console.error("HF Space text error:", txtResponse.status, errorText);
      throw new Error(`HF Space text error: ${txtResponse.status}`);
    }

    const txtData = await txtResponse.json();
    console.log("HF Space text response keys:", Object.keys(txtData));
    console.log("Text embedding type:", typeof txtData.embedding);
    
    if (!txtData.embedding || !Array.isArray(txtData.embedding)) {
      throw new Error(`Invalid text embedding format: ${JSON.stringify(txtData)}`);
    }

    const textEmbedding = txtData.embedding;
    console.log("Text embedding received, length:", textEmbedding.length);

    // Validate embeddings before similarity calculation
    if (!imageEmbedding || !Array.isArray(imageEmbedding) || imageEmbedding.length === 0) {
      throw new Error("Invalid image embedding");
    }
    if (!textEmbedding || !Array.isArray(textEmbedding) || textEmbedding.length === 0) {
      throw new Error("Invalid text embedding");
    }

    // Cosine similarity
    const similarity = cosineSimilarity(imageEmbedding, textEmbedding);

    const score = Math.round(((similarity + 1) / 2) * 100);

    console.log("Raw similarity:", similarity, "Score:", score);

    return new Response(
      JSON.stringify({
        success: true,
        score,
        rawSimilarity: similarity,
        cached: !!imageEmbedding && !shouldCache,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error calculating similarity:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
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

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}