import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  description?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
};

export function FormField({
  label,
  htmlFor,
  description,
  error,
  children,
  className,
  action,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {action}
      </div>
      {children}
      {description && !error ? (
        typeof description === "string" ? (
          <p className="text-caption">{description}</p>
        ) : (
          description
        )
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
