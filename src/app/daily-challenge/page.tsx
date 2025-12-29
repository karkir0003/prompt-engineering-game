import { TargetViewer } from "@/components/game/TargetViewer/TargetView";
import { PromptConsole } from "@/components/game/PromptConsole/PromptConsole";
import { Header } from "@/components/common/Header";
import { requireAuth } from "@/lib/supabase/auth";

export default async function DailyChallengePage() {
  // Ensure user is authenticated, redirect to /login if not
  await requireAuth();

  const mockTarget = {
    imageUrl: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1000&auto=format&fit=crop",
    photographer: "Karthik Subramanian"
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header title="Daily Challenge" showLogout={true} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 h-[40vh] md:h-[calc(100vh-73px)] p-6 bg-muted/20 flex items-center justify-center border-r border-border">
          <div className="w-full max-w-md aspect-square">
            <TargetViewer imageUrl={mockTarget.imageUrl} photographer={mockTarget.photographer} />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col">
          <PromptConsole />
        </div>
      </div>
    </main>
  );
}
