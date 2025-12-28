import { TargetViewer } from "@/components/game/TargetViewer/TargetView";
import { PromptConsole } from "@/components/game/PromptConsole/PromptConsole";

export default function Home() {
  const mockTarget = {
    imageUrl: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1000&auto=format&fit=crop",
    photographer: "Karthik Subramanian"
  };

  return (
    <main className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-screen p-6 bg-muted/20 flex items-center justify-center border-r border-border">
        <div className="w-full max-w-md aspect-square">
          <TargetViewer imageUrl={mockTarget.imageUrl} photographer={mockTarget.photographer} />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col">
        <PromptConsole />
      </div>
    </main>
  );
}