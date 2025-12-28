"use client";

import { useState } from "react";
import { GAME_CONFIG } from "@/constants/game.constants";
import { submitGuess } from "@/actions/game-actions";
import type { GameResult } from "@/types/game.types";
import type { PromptConsoleProps } from "./PromptConsole.types";
import { ResultView } from "./ResultView";
import { InputView } from "./InputView";

export function PromptConsole({
  maxAttempts = GAME_CONFIG.DEFAULT_MAX_ATTEMPTS,
  maxPromptLength = GAME_CONFIG.DEFAULT_MAX_PROMPT_LENGTH,
  onSubmit: onResultSubmit,
  onReset: onExternalReset,
}: PromptConsoleProps = {}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(maxAttempts);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || loading) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("prompt", prompt);

    try {
      const data = await submitGuess(formData);
      setResult(data);
      setAttemptsRemaining((prev: number) => Math.max(0, prev - 1));

      if (onResultSubmit) {
        onResultSubmit(data);
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setPrompt("");
    setAttemptsRemaining(maxAttempts);

    if (onExternalReset) {
      onExternalReset();
    }
  };

  if (result) {
    return <ResultView result={result} onReset={handleReset} />;
  }

  return (
    <InputView
      prompt={prompt}
      onPromptChange={setPrompt}
      onSubmit={handleSubmit}
      loading={loading}
      maxPromptLength={maxPromptLength}
      attemptsRemaining={attemptsRemaining}
    />
  );
}
