"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

type CoachResult = {
  overallScore: number;
  categories: Array<{
    name: string;
    score: number;
    status: "good" | "needs_work" | "missing";
    feedback: string;
    actionUrl: string;
  }>;
  topActions: Array<{
    priority: number;
    message: string;
    href: string;
  }>;
};

function statusVariant(status: CoachResult["categories"][0]["status"]) {
  if (status === "good") return "default" as const;
  if (status === "needs_work") return "secondary" as const;
  return "outline" as const;
}

export function AiCoachCard() {
  const coachMutation = useMutation({
    mutationFn: () => api.aiPortfolioCoach<CoachResult>(),
    onError: (e: Error) => toast.error(e.message),
  });

  const result = coachMutation.data?.data;

  return (
    <Card className="shadow-elevation-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">AI Portfolio Coach</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => coachMutation.mutate()}
          disabled={coachMutation.isPending}
        >
          {coachMutation.isPending ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <Sparkles className="mr-1.5 size-3.5" />
          )}
          Analyze portfolio
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && !coachMutation.isPending && (
          <p className="text-sm text-muted-foreground">
            Get AI feedback on portfolio completeness and actionable next steps.
          </p>
        )}
        {result && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-full border-4 border-primary/20 text-lg font-semibold">
                {result.overallScore}
              </div>
              <div>
                <p className="font-medium">Overall score</p>
                <p className="text-sm text-muted-foreground">Out of 100</p>
              </div>
            </div>
            <div className="space-y-2">
              {result.topActions.slice(0, 3).map((action) => (
                <div key={action.priority} className="flex items-start justify-between gap-2 text-sm">
                  <span>{action.message}</span>
                  <Link href={action.href} className="shrink-0 text-primary underline">
                    Go
                  </Link>
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {result.categories.map((category) => (
                <div key={category.name} className="rounded-md border p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-medium">{category.name}</span>
                    <Badge variant={statusVariant(category.status)}>{category.score}</Badge>
                  </div>
                  <p className="text-muted-foreground">{category.feedback}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
