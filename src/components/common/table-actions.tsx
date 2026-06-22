import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";

type TableActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
  isDeleting?: boolean;
};

export function TableActions({
  onEdit,
  onDelete,
  deleteLabel = "Delete",
  isDeleting = false,
}: TableActionsProps) {
  return (
    <div className="flex gap-1">
      {onEdit ? (
        <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Edit">
          <Pencil className="size-4" />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={deleteLabel}
        >
          <Trash2 className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
