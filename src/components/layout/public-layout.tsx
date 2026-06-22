import { cn } from "@/lib/utils";

type PublicLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function PublicLayout({ children, className }: PublicLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
