// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { HfInference } from "@huggingface/inference";

//import { pipeline, env } from '@huggingface/transformers';

// env.useBrowserCache = false;
// env.allowLocalModels = false;

// env.backends.onnx.wasm = {
//   wasmPaths: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/', 
//   numThreads: 1, 
// };

// Types for Unsplash Response
interface UnsplashPhoto {
  id: string
  slug: string
  description: string | null
  alt_description: string | null
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  links: {
    self: string
    html: string
    download: string
    download_location: string
  }
  user: {
    id: string
    username: string
    name: string
    links: {
      html: string
    }
  }
}

Deno.serve(async (req) => {
  try {
    // 1. Init Supabase Client
    // Uses Service Role Key to bypass RLS (since we are writing to a public table as admin)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const unsplashKey = Deno.env.get('UNSPLASH_ACCESS_KEY') ?? ''
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN') ?? ''
    
    if (!unsplashKey) {
      throw new Error('Missing UNSPLASH_ACCESS_KEY')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Fetch Random Photo from Unsplash
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/photos/random?orientation=landscape&query=nature,architecture,travel`,
      {
        headers: {
          Authorization: `Client-ID ${unsplashKey}`,
        },
      }
    )

    if (!unsplashResponse.ok) {
      const errorText = await unsplashResponse.text()
      throw new Error(`Unsplash API Error: ${errorText}`)
    }

    const photo: UnsplashPhoto = await unsplashResponse.json()

    // 3. COMPLIANCE: Trigger the "Download" event
    // This hits the specific URL Unsplash provided to count the download and attribute it to your App ID.
    await fetch(photo.links.download_location, {
      headers: {
        Authorization: `Client-ID ${unsplashKey}`,
      },
    })

    // 4. Generate CLIP Embedding for target image
    // Using ONNX weights for Transformer.js compatibility
    // Documentation: https://huggingface.co/Xenova/clip-vit-base-patch32
    const photoResponse = await fetch(photo.urls.regular);
    if (!photoResponse.ok) throw new Error('Failed to fetch photo content from Unsplash');
    const photoBlob = await photoResponse.blob();

    const hf = new HfInference(hfToken); 
    const embedding = await hf.featureExtraction({
      model: "sentence-transformers/clip-ViT-B-32",
      inputs: photoBlob,
    });

    // const clip = await pipeline(
    //   'feature-extraction', 
    //   'Xenova/clip-vit-base-patch32', 
    //   { 
    //     quantized: true,
    //   }
    // );
    // const embedding = await clip(photo.urls.regular);

    console.log('CLIP Embedding:', embedding);


    // 4. Insert into Database
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        date: new Date().toISOString().split('T')[0], // Returns 'YYYY-MM-DD'
        image_url: photo.urls.regular,
        unsplash_id: photo.id,
        photographer_name: photo.user.name,
        photographer_profile_url: photo.user.links.html,
        embedding: null // Placeholder for future vector search logic
      })
      .select()
      .single()

    if (error) throw error

    // 5. Success Response
    return new Response(
      JSON.stringify({ success: true, challenge: data }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error("Function Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-daily-challenge' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Potato"}'

*/
