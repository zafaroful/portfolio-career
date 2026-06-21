"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Search } from "lucide-react";
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
  const expiringSoon = stats?.expiringCerts.filter((c) =>
    ["30", "60", "90"].includes(c.expiryStatus),
  ) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your career portfolio and alerts.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search skills, certs, projects..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searchQuery.length >= 2 && searchData?.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {searchData.data.skills.map((s) => (
              <div key={s.id}>Skill: {s.name} ({s.category})</div>
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
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {chartData.map((item) => (
              <Card key={item.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{item.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
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
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {(expiredCerts.length > 0 || expiringSoon.length > 0) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
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
                    {c.title} — expires{" "}
                    {c.expiryDate ? format(new Date(c.expiryDate), "PP") : "N/A"}
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <Card>
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
                    {format(new Date(log.timestamp), "PP p")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
