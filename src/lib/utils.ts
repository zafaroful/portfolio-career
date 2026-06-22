import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | Date | null | undefined,
  pattern = "PP",
): string {
  if (!date) return "N/A";
  return format(new Date(date), pattern);
}

export function getInitials(name: string, maxLength = 2): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxLength)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function getFileExtension(filename: string): string | null {
  const match = filename.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export function getVersionNameFromFilename(filename: string): string {
  const baseName = filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return baseName || "Uploaded resume";
}

const RESUME_EXTENSIONS = new Set(["pdf", "doc", "docx"]);

export function isAllowedResumeFile(file: { name: string; type: string }): boolean {
  const ext = getFileExtension(file.name);
  if (ext && RESUME_EXTENSIONS.has(ext)) return true;
  return [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ].includes(file.type);
}

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";

export function getBadgeVariant(status: string): BadgeVariant {
  const normalized = status.toLowerCase();

  if (
    ["expired", "error", "failed", "invalid", "critical"].some((s) =>
      normalized.includes(s),
    )
  ) {
    return "destructive";
  }

  if (
    ["expiring", "warning", "pending", "soon"].some((s) =>
      normalized.includes(s),
    )
  ) {
    return "outline";
  }

  if (
    ["valid", "success", "active", "completed", "expert", "advanced"].some(
      (s) => normalized.includes(s),
    )
  ) {
    return "default";
  }

  if (
    ["beginner", "intermediate", "draft", "inactive"].some((s) =>
      normalized.includes(s),
    )
  ) {
    return "secondary";
  }

  return "secondary";
}

export function getProficiencyLevel(proficiency: string): number {
  const levels: Record<string, number> = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    EXPERT: 4,
  };
  return levels[proficiency.toUpperCase()] ?? 0;
}

export function normalizeExternalUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
