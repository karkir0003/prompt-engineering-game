"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import type { GameResult } from "@/types/game.types";

interface ResultViewProps {
  result: GameResult;
  onReset: () => void;
  attemptsRemaining: number;
}

export function ResultView({ result, onReset, attemptsRemaining }: ResultViewProps) {
  console.log("Result score:", result.score, "Type:", typeof result.score);
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Score Display */}
      <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Your Score</p>
          <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
            {result.score.toFixed(0)}%
          </div>
          <p className="text-lg font-medium">{result.message}</p>
        </div>
      </Card>

      {/* Generated Image */}
      {result.imageUrl && (
        <Card className="p-4 overflow-hidden">
          <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
            <Image
              src={result.imageUrl}
              alt="Generated image"
              fill
              className="object-cover"
              priority
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Your generated image</p>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {attemptsRemaining > 0 ? (
          <Button
            onClick={onReset}
            size="lg"
            className="flex-1"
          >
            Try Again ({attemptsRemaining} left)
          </Button>
        ) : (
          <Button
            disabled
            size="lg"
            className="flex-1"
            variant="outline"
          >
            No Attempts Left
          </Button>
        )}
      </div>

      {/* Attempt info */}
      {attemptsRemaining === 0 && (
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            Come back tomorrow for a new daily challenge!
          </p>
        </Card>
      )}
    </div>
  );
}