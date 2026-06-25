"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Circle, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import type { OnboardingState } from "@/lib/onboarding";
import { toast } from "sonner";

type OnboardingChecklistProps = {
  onboarding: OnboardingState;
  variant?: "card" | "embedded";
  showDismiss?: boolean;
};

export function OnboardingChecklist({
  onboarding,
  variant = "card",
  showDismiss = true,
}: OnboardingChecklistProps) {
  const queryClient = useQueryClient();

  const dismissMutation = useMutation({
    mutationFn: () => api.patch("/onboarding", { dismiss: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Onboarding checklist dismissed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (onboarding.onboardingCompleted) return null;

  const content = (
    <>
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {onboarding.completedCount} of {onboarding.totalSteps} complete
          </span>
          <span className="font-medium">{onboarding.progressPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${onboarding.progressPercent}%` }}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {onboarding.steps.map((step, index) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                step.completed && "border-primary/30 bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
                  step.completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {step.completed ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{step.label}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {!step.completed && <Circle className="mt-1 size-4 shrink-0 text-muted-foreground" />}
            </Link>
          </li>
        ))}
      </ul>

      {onboarding.steps.every((s) => s.completed) && onboarding.portfolioSlug && (
        <div className="mt-4 rounded-lg border border-dashed p-4 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            All steps complete! View your public portfolio.
          </p>
          <Link
            href={`/portfolio/${onboarding.portfolioSlug}`}
            target="_blank"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs hover:bg-muted"
          >
            View portfolio
            <ExternalLink className="size-4" />
          </Link>
        </div>
      )}

      {showDismiss && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dismissMutation.mutate()}
            disabled={dismissMutation.isPending}
          >
            <X className="mr-1 size-4" />
            Dismiss checklist
          </Button>
        </div>
      )}
    </>
  );

  if (variant === "embedded") {
    return <div>{content}</div>;
  }

  return (
    <Card className="border-primary/20 shadow-elevation-sm">
      <CardHeader>
        <CardTitle className="text-base">Getting started</CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete these steps to build your portfolio career profile.
        </p>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
