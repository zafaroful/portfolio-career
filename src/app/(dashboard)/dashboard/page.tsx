"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  LoadingState,
  PageContainer,
  PageHeader,
  StatCard,
} from "@/components/common";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { formatDate } from "@/lib/utils";
import type { OnboardingState } from "@/lib/onboarding";
import { useState } from "react";
import {
  AlertTriangle,
  Award,
  BadgeCheck,
  FileText,
  FolderKanban,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Pencil,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DashboardData = {
  counts: {
    skills: number;
    certifications: number;
    achievements: number;
    projects: number;
    resumes: number;
  };
  trends: {
    skills?: { value: string; positive?: boolean };
    certifications?: { value: string; positive?: boolean };
    achievements?: { value: string; positive?: boolean };
    projects?: { value: string; positive?: boolean };
    resumes?: { value: string; positive?: boolean };
  };
  expiringCerts: Array<{
    id: string;
    title: string;
    issuer: string;
    expiryDate: string | null;
    expiryStatus: string;
  }>;
  certAlertCount: number;
  recentActivity: Array<{
    id: string;
    action: string;
    tableName: string;
    recordId: string;
    timestamp: string;
    recordName: string | null;
    description: string;
  }>;
  onboarding: OnboardingState;
};

type SearchResults = {
  skills: Array<{ id: string; name: string; category: string }>;
  certifications: Array<{ id: string; title: string }>;
  achievements: Array<{ id: string; title: string }>;
  projects: Array<{ id: string; title: string }>;
};

function getActivityIcon(action: string) {
  switch (action) {
    case "CREATE":
      return Plus;
    case "UPDATE":
      return Pencil;
    case "DELETE":
      return Trash2;
    default:
      return FileText;
  }
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/dashboard"),
  });

  const { data: searchData } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => api.get<SearchResults>(`/search?q=${encodeURIComponent(searchQuery)}`),
    enabled: searchQuery.length >= 2,
  });

  const stats = data?.data;
  const chartData = stats
    ? [
        { name: "Skills", count: stats.counts.skills },
        { name: "Certs", count: stats.counts.certifications },
        { name: "Achievements", count: stats.counts.achievements },
        { name: "Projects", count: stats.counts.projects },
        { name: "Resumes", count: stats.counts.resumes },
      ]
    : [];

  const expiredCerts = stats?.expiringCerts.filter((c) => c.expiryStatus === "expired") ?? [];
  const expiringSoon =
    stats?.expiringCerts.filter((c) => ["30", "60", "90"].includes(c.expiryStatus)) ?? [];
  const hasCertAlerts = expiredCerts.length > 0 || expiringSoon.length > 0;

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your career portfolio and alerts."
      />

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search skills, certs, projects..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searchQuery.length >= 2 && searchData?.data && (
        <Card className="shadow-elevation-sm">
          <CardHeader>
            <CardTitle className="text-base">Search results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {searchData.data.skills.map((s) => (
              <div key={s.id}>
                Skill: {s.name} ({s.category})
              </div>
            ))}
            {searchData.data.certifications.map((c) => (
              <div key={c.id}>Cert: {c.title}</div>
            ))}
            {searchData.data.achievements.map((a) => (
              <div key={a.id}>Achievement: {a.title}</div>
            ))}
            {searchData.data.projects.map((p) => (
              <div key={p.id}>Project: {p.title}</div>
            ))}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <LoadingState variant="cards" />
      ) : (
        <>
          {stats?.onboarding && !stats.onboarding.onboardingCompleted && (
            <Card className="border-primary/30 bg-primary/5 shadow-elevation-sm">
              <CardHeader>
                <CardTitle>Welcome to Portfolio Career</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Get started by completing these steps to build your professional portfolio.
                </p>
              </CardHeader>
              <CardContent>
                <OnboardingChecklist onboarding={stats.onboarding} variant="embedded" />
              </CardContent>
            </Card>
          )}

          {hasCertAlerts && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Certification alerts</AlertTitle>
              <AlertDescription className="space-y-2">
                {expiredCerts.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center gap-2">
                    <Badge variant="destructive">Expired</Badge>
                    <span>
                      {c.title} — {c.issuer}
                    </span>
                    <Link
                      href={`/certifications?edit=${c.id}`}
                      className="text-sm underline"
                    >
                      Renew
                    </Link>
                  </div>
                ))}
                {expiringSoon.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={c.expiryStatus === "30" ? "destructive" : "outline"}
                    >
                      Expiring in {c.expiryStatus} days
                    </Badge>
                    <span>
                      {c.title} — expires {formatDate(c.expiryDate)}
                    </span>
                    <Link
                      href={`/certifications?edit=${c.id}`}
                      className="text-sm underline"
                    >
                      Renew
                    </Link>
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Skills"
              value={stats?.counts.skills ?? 0}
              icon={Sparkles}
              trend={stats?.trends.skills}
              href="/skills"
              tooltip="View and manage skills"
            />
            <StatCard
              label="Certifications"
              value={stats?.counts.certifications ?? 0}
              icon={BadgeCheck}
              trend={stats?.trends.certifications}
              href="/certifications"
              tooltip="View certifications and expiry alerts"
            />
            <StatCard
              label="Achievements"
              value={stats?.counts.achievements ?? 0}
              icon={Award}
              trend={stats?.trends.achievements}
              href="/achievements"
              tooltip="View achievements"
            />
            <StatCard
              label="Projects"
              value={stats?.counts.projects ?? 0}
              icon={FolderKanban}
              trend={stats?.trends.projects}
              href="/projects"
              tooltip="View and manage projects"
            />
            <StatCard
              label="Resumes"
              value={stats?.counts.resumes ?? 0}
              icon={FileText}
              trend={stats?.trends.resumes}
              href="/resumes"
              tooltip="Generate or upload resumes"
            />
          </div>

          <Card className="shadow-elevation-sm">
            <CardHeader>
              <CardTitle className="text-base">Portfolio overview</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-elevation-sm">
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {stats?.recentActivity.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-muted-foreground">No recent activity yet.</p>
                  <Link
                    href="/skills"
                    className="mt-3 inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                  >
                    Add your first skill
                  </Link>
                </div>
              )}
              {stats?.recentActivity.map((log) => {
                const Icon = getActivityIcon(log.action);
                return (
                  <div key={log.id} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span>{log.description}</span>
                    </div>
                    <span className="shrink-0 text-muted-foreground">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  );
}
