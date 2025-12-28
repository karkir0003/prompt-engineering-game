"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import type { ResultViewProps } from "./PromptConsole.types";

export function ResultView({ result, onReset }: ResultViewProps) {
  return (
    <div className="flex flex-col h-full justify-center max-w-xl mx-auto w-full space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Generation Complete!</h2>
        <p className="text-muted-foreground">Here is the AI result:</p>
      </div>
      <Card className="p-4 border-2 border-primary/20 overflow-hidden space-y-4">
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
          <Image
            src={result.imageUrl}
            alt="AI Generation"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            Similarity Score
          </div>
          <div className="text-2xl font-bold text-green-600">
            {(result.score * 100).toFixed(0)}%
          </div>
        </div>
      </Card>
      <Button variant="outline" onClick={onReset} className="w-full">
        Try Again
      </Button>
    </div>
  );
}
