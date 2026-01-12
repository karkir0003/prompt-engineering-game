import { TargetViewer } from "@/components/game/TargetViewer/TargetView";
import { PromptConsole } from "@/components/game/PromptConsole/PromptConsole";
import { AttemptHistory } from "@/components/game/AttemptHistory/AttemptHistory";
import { Header } from "@/components/common/Header";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getUserAttempts } from "@/actions/game-actions";

async function getTodaysChallenge() {
  const supabase = await createClient();
  
  // Get today's date in PST
  const today = new Date();
  const pstDate = new Date(today.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const dateString = pstDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  console.log('Getting today\'s challenge for date:', dateString);

  // Fetch today's challenge
  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('date', dateString)
    .single();

  if (error) {
    console.error('Error fetching challenge:', error);
    return null;
  }

  console.log('Challenge found:', challenge);
  return challenge;
}

async function generateChallengeIfNeeded() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Supabase URL:', supabaseUrl);
  console.log('Has service role key:', !!serviceRoleKey);

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials for challenge generation');
    return null;
  }

  try {
    // Call the deployed edge function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-daily-challenge`;
    
    console.log('Calling edge function at:', edgeFunctionUrl);

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Edge function response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error generating challenge:', errorData);
      return null;
    }

    const result = await response.json();
    console.log('Challenge generated successfully:', result);
    return result.challenge;
  } catch (error) {
    console.error('Failed to generate challenge:', error);
    return null;
  }
}

export default async function DailyChallengePage() {
  // Ensure user is authenticated, redirect to /login if not
  await requireAuth();

  // Try to get today's challenge
  let challenge = await getTodaysChallenge();

  // If no challenge exists, try to generate one
  if (!challenge) {
    console.log('No challenge found for today, generating...');
    challenge = await generateChallengeIfNeeded();
    
    // If generation succeeded, fetch the challenge from DB
    if (challenge) {
      // Re-fetch to ensure we have the complete data
      challenge = await getTodaysChallenge();
    }
  }

  // If still no challenge, show error state
  if (!challenge) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Header title="Daily Challenge" showLogout={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">No Challenge Available</h2>
            <p className="text-muted-foreground">
              We couldn't load today's challenge. Please try again later.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Get user's attempts for this challenge
  const attempts = await getUserAttempts(challenge.id) || [];

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header title="Daily Challenge" showLogout={true} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Panel - Target Image */}
        <div className="w-full md:w-1/2 h-[40vh] md:h-[calc(100vh-73px)] p-6 bg-muted/20 flex items-center justify-center border-r border-border">
          <div className="w-full max-w-md aspect-square">
            <TargetViewer
              imageUrl={challenge.image_url}
              photographer={challenge.photographer_name}
              photographerUrl={challenge.photographer_profile_url}
            />
          </div>
        </div>

        {/* Right Panel - Prompt Console + History */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col space-y-8 overflow-y-auto">
          {/* Prompt console */}
          <PromptConsole challengeId={challenge.id} maxAttempts={3} />
          
          {/* Show attempt history below if user has made attempts */}
          {attempts.length > 0 && (
            <AttemptHistory attempts={attempts} />
          )}
        </div>
      </div>
    </main>
  );
}

// Revalidate every hour to check for new challenges
export const revalidate = 3600;