// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { HfInference } from "@huggingface/inference"

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
    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const unsplashKey = Deno.env.get('UNSPLASH_ACCESS_KEY') ?? ''
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN') ?? ''
    
    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }
    if (!unsplashKey) {
      throw new Error('Missing UNSPLASH_ACCESS_KEY')
    }
    if (!hfToken) {
      throw new Error('Missing HUGGING_FACE_ACCESS_TOKEN')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the date
    const today = new Date()
    const pstDate = new Date(today.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    const dateString = pstDate.toISOString().split('T')[0] // 'YYYY-MM-DD'

    // Check if challenge already exists for today
    const { data: existingChallenge } = await supabase
      .from('challenges')
      .select('*')
      .eq('date', dateString)
      .single()

    if (existingChallenge) {
      console.log('Challenge already exists for today:', dateString)
      return new Response(
        JSON.stringify({ 
          success: true, 
          challenge: existingChallenge,
          message: 'Challenge already exists for today'
        }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Fetch Random Photo from Unsplash
    console.log('Fetching random photo from Unsplash...')
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/photos/random?orientation=landscape&query=nature,architecture,travel,landscape,cityscape`,
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
    console.log('Photo fetched:', photo.id)

    await fetch(photo.links.download_location, {
      headers: {
        Authorization: `Client-ID ${unsplashKey}`,
      },
    })

    console.log('Downloading image for embedding generation...')
    const photoResponse = await fetch(photo.urls.regular)
    if (!photoResponse.ok) {
      throw new Error('Failed to fetch photo content from Unsplash')
    }
    const photoBlob = await photoResponse.blob()

    // Generate CLIP embedding for the image
    console.log('Generating CLIP embedding for image...')
    const hf = new HfInference(hfToken)
    
    let embeddingArray: number[] | null = null
    
    try {
      const result = await hf.zeroShotImageClassification({
        model: "openai/clip-vit-base-patch32",
        inputs: {
          image: photoBlob,
        },
        parameters: {
          candidate_labels: ["an image", "a photo"],
        },
      })
      
      console.log('Zero-shot classification successful')
      embeddingArray = null
    } catch (error) {
      console.log('Could not pre-generate embedding, will compute on-demand:', error)
      embeddingArray = null
    }

    console.log('Embedding status:', embeddingArray ? `Array of ${embeddingArray.length} dimensions` : 'Will generate on-demand')

    // Insert into Database
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        date: dateString,
        image_url: photo.urls.regular,
        unsplash_id: photo.id,
        photographer_name: photo.user.name,
        photographer_profile_url: photo.user.links.html,
        embedding: embeddingArray // Store as JSONB array
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Challenge created successfully:', data.id)

    // Success Response
    return new Response(
      JSON.stringify({ 
        success: true, 
        challenge: {
          id: data.id,
          date: data.date,
          image_url: data.image_url,
          photographer_name: data.photographer_name,
          photographer_profile_url: data.photographer_profile_url,
          unsplash_id: data.unsplash_id
        },
        message: 'Daily challenge created successfully'
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error("Function Error:", error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
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
    --header 'Content-Type: application/json'

  3. To test in production, set up a cron job or call it manually once per day
*/