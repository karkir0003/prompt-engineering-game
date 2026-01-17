"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ResultViewProps } from "./PromptConsole.types";
import { ImageDisplay } from "@/components/common/image/ImageDisplay";

export function ResultView({
  result,
  onReset,
  attemptsRemaining,
}: ResultViewProps) {
  return (
    <div className="flex flex-col h-full justify-center max-w-xl mx-auto w-full space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          {result.success ? "Generation Complete!" : "Oops!"}
        </h2>
      </div>

      {/* Only show card with image if generation was successful */}
      {result.success && result.imageUrl && (
        <>
          <Card className="p-4 border-2 border-primary/20 overflow-hidden space-y-4">
            <ImageDisplay src={result.imageUrl} alt="AI Generation" />
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                Similarity Score
              </div>
              <div className="text-2xl font-bold text-green-600">
                {result.score.toFixed(0)}%
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Show error message prominently if failed */}
      {!result.success && (
        <Card className="p-6 border-2 border-destructive/20 bg-destructive/5">
          <p className="text-center text-destructive font-medium">
            {result.message}
          </p>
        </Card>
      )}

      {/* Show attempts remaining */}
      <p className="text-center text-sm text-muted-foreground">
        Attempts remaining:{" "}
        <span className="font-bold">{attemptsRemaining}</span>
      </p>

      {/* Only show Try Again if user has attempts left */}
      {attemptsRemaining > 0 ? (
        <Button variant="outline" onClick={onReset} className="w-full">
          Try Again
        </Button>
      ) : (
        <Button variant="outline" disabled className="w-full">
          No Attempts Remaining
        </Button>
      )}
    </div>
  );
}
