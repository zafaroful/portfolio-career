import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type DataTableProps = {
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingRows?: number;
  children: React.ReactNode;
  className?: string;
};

export function DataTable({
  isLoading = false,
  isEmpty = false,
  emptyIcon,
  emptyTitle = "No items yet",
  emptyDescription = "Get started by adding your first item.",
  loadingRows = 5,
  children,
  className,
}: DataTableProps) {
  if (isLoading) {
    return <LoadingState variant="table" rows={loadingRows} className={className} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return <div className={cn("rounded-lg border shadow-elevation-sm", className)}>{children}</div>;
}
