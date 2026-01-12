"use client";

import { Card } from "@/components/ui/card";

interface Attempt {
  id: string;
  prompt: string;
  score: number;
  attempt_number: number;
  created_at: string;
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
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">
                  Attempt #{attempt.attempt_number}
                </div>
                <div className="font-medium">{attempt.prompt}</div>
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
          </Card>
        ))}
      </div>
    </div>
  );
}