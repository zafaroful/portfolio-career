"use client";

import { useQuery } from "@tanstack/react-query";
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
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import {
  AlertTriangle,
  Award,
  BadgeCheck,
  FileText,
  FolderKanban,
  Search,
  Sparkles,
} from "lucide-react";
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
  expiringCerts: Array<{
    id: string;
    title: string;
    issuer: string;
    expiryDate: string | null;
    expiryStatus: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    tableName: string;
    recordId: string;
    timestamp: string;
  }>;
};

type SearchResults = {
  skills: Array<{ id: string; name: string; category: string }>;
  certifications: Array<{ id: string; title: string }>;
  achievements: Array<{ id: string; title: string }>;
  projects: Array<{ id: string; title: string }>;
};

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Skills" value={stats?.counts.skills ?? 0} icon={Sparkles} />
            <StatCard
              label="Certifications"
              value={stats?.counts.certifications ?? 0}
              icon={BadgeCheck}
            />
            <StatCard
              label="Achievements"
              value={stats?.counts.achievements ?? 0}
              icon={Award}
            />
            <StatCard
              label="Projects"
              value={stats?.counts.projects ?? 0}
              icon={FolderKanban}
            />
            <StatCard label="Resumes" value={stats?.counts.resumes ?? 0} icon={FileText} />
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

          {(expiredCerts.length > 0 || expiringSoon.length > 0) && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Certification alerts</AlertTitle>
              <AlertDescription className="space-y-1">
                {expiredCerts.map((c) => (
                  <div key={c.id}>
                    <Badge variant="destructive">Expired</Badge> {c.title} — {c.issuer}
                  </div>
                ))}
                {expiringSoon.map((c) => (
                  <div key={c.id}>
                    <Badge variant="outline">Expiring in {c.expiryStatus} days</Badge>{" "}
                    {c.title} — expires {formatDate(c.expiryDate)}
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <Card className="shadow-elevation-sm">
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {stats?.recentActivity.length === 0 && (
                <p className="text-muted-foreground">No recent activity.</p>
              )}
              {stats?.recentActivity.map((log) => (
                <div key={log.id} className="flex justify-between gap-4">
                  <span>
                    {log.action} on {log.tableName}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDate(log.timestamp, "PP p")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  );
}
