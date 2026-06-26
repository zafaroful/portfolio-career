"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, RefreshCw, X } from "lucide-react";

type AiResultPanelProps = {
  title?: string;
  content: string;
  onAccept: () => void;
  onRegenerate: () => void;
  onDiscard: () => void;
  isRegenerating?: boolean;
  children?: React.ReactNode;
};

export function AiResultPanel({
  title = "AI suggestion",
  content,
  onAccept,
  onRegenerate,
  onDiscard,
  isRegenerating = false,
  children,
}: AiResultPanelProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="whitespace-pre-wrap text-sm text-foreground">{content}</div>
        {children}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={onAccept}>
            <Check className="mr-1.5 size-3.5" />
            Accept
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className="mr-1.5 size-3.5" />
            Regenerate
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onDiscard}>
            <X className="mr-1.5 size-3.5" />
            Discard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
