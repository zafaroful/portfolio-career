import { cn } from "@/lib/utils";

type AuthLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-muted/30 p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
