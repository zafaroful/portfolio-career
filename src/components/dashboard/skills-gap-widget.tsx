"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/common";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

type GapResult = {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: Array<{
    skill: string;
    priority: "high" | "medium" | "low";
    suggestion: string;
  }>;
  relevantProjects: Array<{ projectId: string; reason: string }>;
  certSuggestions: string[];
};

function priorityVariant(priority: string) {
  if (priority === "high") return "destructive" as const;
  if (priority === "medium") return "default" as const;
  return "secondary" as const;
}

export function SkillsGapWidget() {
  const [jobPosting, setJobPosting] = useState("");
  const [targetRole, setTargetRole] = useState("");

  const gapMutation = useMutation({
    mutationFn: () =>
      api.aiSkillsGap<GapResult>({
        jobPosting,
        targetRole: targetRole || undefined,
      }),
    onError: (e: Error) => toast.error(e.message),
  });

  const result = gapMutation.data?.data;

  return (
    <Card className="shadow-elevation-sm">
      <CardHeader>
        <CardTitle className="text-base">Skills Gap Analyzer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="Job posting" description="Paste a job description to compare against your portfolio.">
          <Textarea
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            placeholder="Paste job posting here..."
            rows={4}
          />
        </FormField>
        <FormField label="Target role (optional)">
          <input
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Frontend Developer"
          />
        </FormField>
        <Button
          onClick={() => gapMutation.mutate()}
          disabled={gapMutation.isPending || jobPosting.trim().length < 10}
        >
          {gapMutation.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          Analyze gaps
        </Button>
        {result && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold">{result.matchScore}%</span>
              <span className="text-sm text-muted-foreground">match score</span>
            </div>
            {result.matchedSkills.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium">Matched skills</p>
                <div className="flex flex-wrap gap-1">
                  {result.matchedSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {result.missingSkills.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Missing skills</p>
                {result.missingSkills.map((item) => (
                  <div key={item.skill} className="rounded-md border p-3 text-sm">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">{item.skill}</span>
                      <Badge variant={priorityVariant(item.priority)}>{item.priority}</Badge>
                    </div>
                    <p className="text-muted-foreground">{item.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
            {result.certSuggestions.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium">Suggested certifications</p>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  {result.certSuggestions.map((cert) => (
                    <li key={cert}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
