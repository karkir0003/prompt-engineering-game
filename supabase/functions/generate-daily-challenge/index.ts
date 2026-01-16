// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

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
    const clipServiceUrl = Deno.env.get('HUGGINGFACE_SPACE_URL') ?? ''
    
    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }
    if (!unsplashKey) {
      throw new Error('Missing UNSPLASH_ACCESS_KEY')
    }
    if (!clipServiceUrl) {
      throw new Error('Missing HUGGINGFACE_SPACE_URL')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get today's date in UTC
    const today = new Date()
    const dateString = today.toISOString().split('T')[0] // Format: YYYY-MM-DD

    console.log('Checking for challenge on date (UTC):', dateString)

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
      `https://api.unsplash.com/photos/random`,
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

    // Trigger download tracking
    await fetch(photo.links.download_location, {
      headers: {
        Authorization: `Client-ID ${unsplashKey}`,
      },
    })

    // Generate CLIP embedding using your Hugging Face Space
    console.log('Generating CLIP embedding using clip-embedding-service...')
    
    let embeddingArray: number[] | null = null
    
    try {
      const embeddingResponse = await fetch(clipServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: photo.urls.regular,
        }),
      })

      if (!embeddingResponse.ok) {
        const errorText = await embeddingResponse.text()
        console.error('CLIP service error:', errorText)
        throw new Error(`CLIP service error: ${embeddingResponse.status}`)
      }

      const embeddingResult = await embeddingResponse.json()
      
      if (embeddingResult.embedding && Array.isArray(embeddingResult.embedding)) {
        embeddingArray = embeddingResult.embedding
        console.log(`Embedding generated successfully: ${embeddingArray.length} dimensions`)
      } else {
        console.warn('Unexpected embedding response format:', embeddingResult)
        embeddingArray = null
      }
    } catch (error) {
      console.log('Could not pre-generate embedding, will compute on-demand:', error)
      embeddingArray = null
    }

    // Insert into Database
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        date: dateString, 
        image_url: photo.urls.regular,
        unsplash_id: photo.id,
        photographer_name: photo.user.name,
        photographer_profile_url: photo.user.links.html,
        embedding: embeddingArray
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
