"use client";

import { useState, useEffect } from "react";
import { GAME_CONFIG } from "@/constants/game";
import { submitGuess, getUserAttempts } from "@/actions/game-actions";
import type { GameResult } from "@/types/game.types";
import type { PromptConsoleProps } from "./PromptConsole.types";
import { ResultView } from "./ResultView";
import { InputView } from "./InputView";

export function PromptConsole({
  challengeId,
  maxAttempts = 3, 
  maxPromptLength = GAME_CONFIG.DEFAULT_MAX_PROMPT_LENGTH,
  onSubmit: onResultSubmit,
  onReset: onExternalReset,
}: PromptConsoleProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(maxAttempts);
  const [initializing, setInitializing] = useState(true);

  // Load user's existing attempts when component mounts
  useEffect(() => {
    async function loadAttempts() {
      if (!challengeId) return;
      
      try {
        const attempts = await getUserAttempts(challengeId);
        if (attempts) {
          const usedAttempts = attempts.length;
          setAttemptsRemaining(maxAttempts - usedAttempts);
        }
      } catch (error) {
        console.error("Failed to load attempts:", error);
      } finally {
        setInitializing(false);
      }
    }

    loadAttempts();
  }, [challengeId, maxAttempts]);

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

  // Show loading state while fetching initial attempts
  if (initializing) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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