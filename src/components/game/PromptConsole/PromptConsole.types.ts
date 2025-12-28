import type { GameResult } from "@/types/game.types";

export interface PromptConsoleProps {
  maxAttempts?: number;
  maxPromptLength?: number;
  onSubmit?: (result: GameResult) => void;
  onReset?: () => void;
}

export interface ResultViewProps {
  result: GameResult;
  onReset: () => void;
}

export interface InputViewProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  maxPromptLength: number;
  attemptsRemaining: number;
}
