"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AiAssistButtonProps = {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export function AiAssistButton({
  onClick,
  isLoading = false,
  disabled = false,
  label = "Improve with AI",
  className,
}: AiAssistButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn("gap-1.5", className)}
    >
      {isLoading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Sparkles className="size-3.5" />
      )}
      {isLoading ? "Generating..." : label}
    </Button>
  );
}
