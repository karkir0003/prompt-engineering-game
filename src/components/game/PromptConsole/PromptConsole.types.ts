import type { GameResult } from "@/types/game.types";

export interface PromptConsoleProps {
  challengeId: string;
  maxAttempts?: number;
  maxPromptLength?: number;
  initialAttemptsCount?: number;
  onSubmit?: (result: GameResult) => void;
  onReset?: () => void;
}

export interface ResultViewProps {
  result: GameResult;
  onReset: () => void;
  attemptsRemaining: number;
}

export interface InputViewProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  maxPromptLength: number;
  attemptsRemaining: number;
}