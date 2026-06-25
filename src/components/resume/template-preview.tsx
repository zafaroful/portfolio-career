"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type ResumeTemplateId = "modern" | "classic" | "minimal";

type TemplateInfo = {
  id: ResumeTemplateId;
  name: string;
  description: string;
  sections: string[];
  bestFor: string;
};

export const RESUME_TEMPLATES: TemplateInfo[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean layout with grouped skills, projects, certifications, and achievements.",
    sections: ["Skills", "Projects", "Certifications", "Achievements"],
    bestFor: "General professional use",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional serif layout focused on skills and project experience.",
    sections: ["Skills", "Projects"],
    bestFor: "Conservative industries",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Single-column ATS-friendly layout with plain text formatting.",
    sections: ["Skills", "Projects", "Certifications", "Achievements"],
    bestFor: "Applicant tracking systems (ATS)",
  },
];

type TemplatePreviewProps = {
  selected: ResumeTemplateId;
  onSelect: (id: ResumeTemplateId) => void;
};

export function TemplatePreview({ selected, onSelect }: TemplatePreviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {RESUME_TEMPLATES.map((template) => {
        const isSelected = selected === template.id;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={cn(
              "relative rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
              isSelected && "border-primary ring-2 ring-primary/20",
            )}
          >
            {isSelected && (
              <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
            )}
            <div className="mb-3 h-24 rounded-md border bg-muted/30 p-2">
              <div className="mb-1 h-2 w-2/3 rounded bg-foreground/20" />
              <div className="mb-2 h-1.5 w-1/2 rounded bg-foreground/10" />
              <div className="space-y-1">
                <div className="h-1 w-full rounded bg-foreground/10" />
                <div className="h-1 w-4/5 rounded bg-foreground/10" />
                <div className="h-1 w-3/5 rounded bg-foreground/10" />
              </div>
            </div>
            <h3 className="font-medium">{template.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
            <p className="mt-2 text-xs">
              <span className="font-medium">Includes:</span>{" "}
              {template.sections.join(", ")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Best for: {template.bestFor}</p>
          </button>
        );
      })}
    </div>
  );
}
