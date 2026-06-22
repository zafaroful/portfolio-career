import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  variant?: "page" | "table" | "cards" | "form";
  rows?: number;
  className?: string;
};

export function LoadingState({
  variant = "page",
  rows = 5,
  className,
}: LoadingStateProps) {
  if (variant === "cards") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
