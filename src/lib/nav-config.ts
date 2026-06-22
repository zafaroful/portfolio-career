import {
  LayoutDashboard,
  Award,
  BadgeCheck,
  FolderKanban,
  FileText,
  Settings,
  Sparkles,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/certifications", label: "Certifications", icon: BadgeCheck },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/design-system", label: "Design System", icon: Palette },
];

export const protectedRoutes = dashboardNavItems.map((item) => item.href);
