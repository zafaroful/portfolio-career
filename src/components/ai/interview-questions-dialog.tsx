"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

type InterviewQuestionsResult = {
  questions: Array<{
    question: string;
    tip: string;
    difficulty: "easy" | "medium" | "hard";
  }>;
};

type InterviewQuestionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "project" | "skill" | "certification" | "achievement";
  entityId: string;
  entityName: string;
};

function difficultyVariant(difficulty: string) {
  if (difficulty === "hard") return "destructive" as const;
  if (difficulty === "medium") return "default" as const;
  return "secondary" as const;
}

export function InterviewQuestionsDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName,
}: InterviewQuestionsDialogProps) {
  const questionsMutation = useMutation({
    mutationFn: () =>
      api.aiInterviewQuestions<InterviewQuestionsResult>({ entityType, entityId }),
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (open && entityId) {
      questionsMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entityId, entityType]);

  const questions = questionsMutation.data?.data?.questions ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview prep: {entityName}</DialogTitle>
        </DialogHeader>
        {questionsMutation.isPending ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Generating questions...
          </div>
        ) : questionsMutation.isError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {questionsMutation.error.message}
          </div>
        ) : questions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No questions generated.
          </p>
        ) : (
          <div className="space-y-4">
            {questions.map((item, index) => (
              <div key={index} className="rounded-md border p-4 text-sm">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-medium">Q{index + 1}. {item.question}</span>
                  <Badge variant={difficultyVariant(item.difficulty)}>{item.difficulty}</Badge>
                </div>
                <p className="text-muted-foreground">{item.tip}</p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
