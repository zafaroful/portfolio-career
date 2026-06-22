"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { dashboardNavItems } from "@/lib/nav-config";
import { Button } from "@/components/ui/button";
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

export function AppSidebar() {
  const pathname = usePathname();
  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<UserSettings>("/settings"),
  });

  const user = settingsData?.data;
  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Portfolio Career
        </Link>
        <ThemeToggle />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {dashboardNavItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
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
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator className="bg-sidebar-border" />
      {user && (
        <>
          <div className="flex items-center gap-3 p-3">
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
          <Separator className="bg-sidebar-border" />
        </>
      )}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
