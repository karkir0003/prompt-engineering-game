"use client";

import { useState } from "react";
import { GAME_CONFIG } from "@/constants/game";
import { submitGuess } from "@/actions/game-actions";
import type { GameResult } from "@/types/game.types";
import type { PromptConsoleProps } from "./PromptConsole.types";
import { ResultView } from "./ResultView";
import { InputView } from "./InputView";

export function PromptConsole({
  challengeId,
  maxAttempts = GAME_CONFIG.DEFAULT_MAX_ATTEMPTS,
  maxPromptLength = GAME_CONFIG.DEFAULT_MAX_PROMPT_LENGTH,
  initialAttemptsCount = 0,
  onSubmit: onResultSubmit,
  onReset: onExternalReset,
}: PromptConsoleProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(
    maxAttempts - initialAttemptsCount,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || loading || !challengeId) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("prompt", prompt);

    try {
      const data = await submitGuess(challengeId, formData);
      setResult(data);

      if (data.attemptsLeft !== undefined) {
        setAttemptsRemaining(data.attemptsLeft);
      }

      if (onResultSubmit) {
        onResultSubmit(data);
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
      setResult({
        success: false,
        imageUrl: null,
        score: 0,
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setPrompt("");

    if (onExternalReset) {
      onExternalReset();
    }
  };

  // Show result view after submission
  if (result) {
    return (
      <ResultView
        result={result}
        onReset={handleReset}
        attemptsRemaining={attemptsRemaining}
      />
    );
  }

  // Show input view
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
