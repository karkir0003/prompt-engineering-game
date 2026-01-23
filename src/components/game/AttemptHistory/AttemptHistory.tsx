"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";

interface Attempt {
  id: string;
  prompt: string;
  score: number;
  attempt_number: number;
  created_at: string;
  generated_image_url: string | null; // Changed from image_url
}

interface AttemptHistoryProps {
  attempts: Attempt[];
}

export function AttemptHistory({ attempts }: AttemptHistoryProps) {
  if (attempts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Attempts</h3>
      <div className="space-y-2">
        {attempts.map((attempt) => (
          <Card key={attempt.id} className="p-4">
            <div className="flex gap-4">
              {/* Show generated image if available */}
              {attempt.generated_image_url && (
                <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                  <Image
                    src={attempt.generated_image_url}
                    alt={`Generated from: ${attempt.prompt}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">
                      Attempt #{attempt.attempt_number}
                    </div>
                    <div className="font-medium truncate">{attempt.prompt}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-primary">
                      {attempt.score.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(attempt.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}