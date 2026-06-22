import { AppSidebar } from "./app-sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-[var(--spacing-page)]">{children}</div>
      </main>
    </div>
  );
}
