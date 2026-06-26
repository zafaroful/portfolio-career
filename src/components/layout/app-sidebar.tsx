"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { hasValidSession } from "@/lib/session";
import { dashboardNavItems } from "@/lib/nav-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

type UserSettings = {
  name: string;
  email: string;
  photoUrl: string | null;
};

type DashboardSummary = {
  certAlertCount: number;
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = hasValidSession(session);
  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<UserSettings>("/settings"),
    enabled: isLoggedIn,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardSummary>("/dashboard"),
    enabled: isLoggedIn,
  });

  const user = settingsData?.data;
  const certAlertCount = dashboardData?.data?.certAlertCount ?? 0;

  async function handleSignOut() {
    try {
      await signOut({ callbackUrl: "/login", redirect: true });
    } catch {
      router.push("/login");
    }
  }

  return (
    <aside className="relative z-10 flex h-full w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Portfolio Career
        </Link>
        <ThemeToggle />
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {dashboardNavItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const showCertBadge = item.href === "/certifications" && certAlertCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-elevation-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {showCertBadge && (
                <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                  {certAlertCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
      {user && (
        <>
          <Separator className="shrink-0 bg-sidebar-border" />
          <div className="flex shrink-0 items-center gap-3 p-3">
            <Avatar>
              {user.photoUrl ? (
                <AvatarImage src={user.photoUrl} alt={user.name} />
              ) : null}
              <AvatarFallback>
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {user.email}
              </p>
            </div>
          </div>
        </>
      )}
      <div className="shrink-0 border-t border-sidebar-border p-3 pb-4">
        {isLoggedIn ? (
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        ) : (
          <Link
            href="/login"
            className="inline-flex h-9 w-full items-center justify-start gap-2 rounded-md px-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
