import { TargetViewer } from "@/components/game/TargetViewer/TargetView";
import { PromptConsole } from "@/components/game/PromptConsole/PromptConsole";
import { AttemptHistory } from "@/components/game/AttemptHistory/AttemptHistory";
import { Header } from "@/components/common/Header";
import { requireAuth } from "@/lib/supabase/auth";
import { getUserAttempts } from "@/actions/game-actions";
import { ensureTodaysChallengeExists } from "@/services/challenge-service";

export default async function DailyChallengePage() {
  // Ensure user is authenticated, redirect to /login if not (Future Update: allow non-authenticated users to play the game, and make signing up optional)
  await requireAuth();

  // Get today's challenge (will generate if needed)
  const challenge = await ensureTodaysChallengeExists();

  // If still no challenge, show error state
  if (!challenge) {
    // TODO: make a challenge error component that shows up for convenience to nicely separate the concerns
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
  const attempts = (await getUserAttempts(challenge.id)) || [];

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header title="Daily Challenge" showLogout={true} />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Panel: Unsplash target image */}
        <div className="w-full md:w-1/2 h-[40vh] md:h-[calc(100vh-73px)] p-6 bg-muted/20 flex items-center justify-center border-r border-border">
          <div className="w-full max-w-md aspect-square">
            <TargetViewer
              imageUrl={challenge.image_url}
              photographer={challenge.photographer_name}
              photographerUrl={challenge.photographer_profile_url}
            />
          </div>
        </div>

        {/* Right Panel: Prompt console with attempt history */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col space-y-8 overflow-y-auto">
          <PromptConsole 
            challengeId={challenge.id} 
            maxAttempts={3}
            initialAttemptsCount={attempts.length}
          />

          {/* Show attempt history below if user has made attempts */}
          {attempts.length > 0 && <AttemptHistory attempts={attempts} />}
        </div>
      </div>
    </main>
  );
}

// Revalidate every hour to check for new challenges
export const revalidate = 3600;