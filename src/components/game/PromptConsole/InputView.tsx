"use client";

import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InputViewProps } from "./PromptConsole.types";

export function InputView({
  prompt,
  onPromptChange,
  onSubmit,
  loading,
  maxPromptLength,
  attemptsRemaining,
}: InputViewProps) {
  return (
    <div className="flex flex-col h-full justify-center max-w-xl mx-auto w-full space-y-8">
      <p>Karthik</p>
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 justify-center sm:justify-start">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Promptle
        </h1>
        <p className="text-muted-foreground">
          Describe the image on the left.{" "}
          <span className="font-bold text-primary">
            {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""}{" "}
            remaining.
          </span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <Input
            value={prompt}
            onChange={(e) =>
              onPromptChange(e.target.value.slice(0, maxPromptLength))
            }
            placeholder="A futuristic city..."
            className="pr-24 py-6 text-lg shadow-sm"
            disabled={loading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
            {prompt.length}/{maxPromptLength}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold"
          disabled={loading || !prompt}
        >
          {loading ? (
            "Dreaming..."
          ) : (
            <span className="flex items-center gap-2">
              Generate <Send className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
