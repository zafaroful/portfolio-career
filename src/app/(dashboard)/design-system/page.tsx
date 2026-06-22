"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  FormField,
  LoadingState,
  PageContainer,
  PageHeader,
  StatCard,
  Timeline,
} from "@/components/common";
import { SkillBadge } from "@/components/features/skills/skill-badge";
import { ThemeToggle } from "@/components/common/theme-toggle";
import {
  brandColors,
  semanticColors,
  spacingScale,
  typographyScale,
} from "@/lib/design-tokens";
import {
  componentPatterns,
  interactionPatterns,
  layoutPatterns,
} from "@/lib/design-patterns";
import {
  Award,
  FolderKanban,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const sampleTimeline = [
  {
    id: "1",
    title: "AWS Solutions Architect",
    subtitle: "Professional certification earned",
    date: "Jan 2026",
    badge: "Valid",
  },
  {
    id: "2",
    title: "Team Lead Promotion",
    subtitle: "Engineering department",
    date: "Nov 2025",
    badge: "Achievement",
  },
];

export default function DesignSystemPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Design System"
        description="Portfolio Career UI tokens, components, and usage guidelines."
        actions={<ThemeToggle />}
      />

      <Tabs defaultValue="tokens">
        <TabsList>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="section-stack pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Color palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {semanticColors.map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div
                      className="h-16 rounded-lg border shadow-elevation-sm"
                      style={{ backgroundColor: `var(${color.token})` }}
                    />
                    <div>
                      <p className="text-sm font-medium">{color.name}</p>
                      <p className="text-caption">{color.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="grid gap-3 sm:grid-cols-3">
                {Object.entries(brandColors).slice(0, 6).map(([name, value]) => (
                  <div key={name} className="flex items-center gap-3">
                    <div
                      className="size-8 rounded-md border"
                      style={{ backgroundColor: value }}
                    />
                    <code className="text-xs">{name}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spacing scale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {spacingScale.map((space) => (
                <div key={space.name} className="flex items-center gap-4">
                  <span className="w-12 text-caption">{space.name}</span>
                  <div
                    className="h-4 rounded bg-primary/60"
                    style={{ width: space.value }}
                  />
                  <code className="text-xs text-muted-foreground">
                    {space.value} (p-{space.tailwind})
                  </code>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="section-stack pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Type scale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {typographyScale.map((type) => (
                <div key={type.name} className="space-y-1 border-b pb-4 last:border-0">
                  <p className="text-caption">{type.name}</p>
                  <p className={type.className}>{type.sample}</p>
                  <code className="text-xs text-muted-foreground">{type.className}</code>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="section-stack pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges & skill indicators</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <SkillBadge proficiency="EXPERT" showLevel />
              <SkillBadge proficiency="INTERMEDIATE" showLevel />
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Skills" value={24} icon={Sparkles} trend={{ value: "+3 this month", positive: true }} />
            <StatCard label="Projects" value={8} icon={FolderKanban} />
            <StatCard label="Achievements" value={12} icon={Award} />
            <StatCard label="Growth" value="18%" icon={TrendingUp} trend={{ value: "YoY increase", positive: true }} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Form field</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField label="Email" htmlFor="demo-email" description="Used for login and notifications.">
                <Input id="demo-email" placeholder="you@example.com" />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline items={sampleTimeline} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Empty & loading states</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              <EmptyState
                icon={Sparkles}
                title="No skills yet"
                description="Add your first skill to populate your portfolio."
                action={{ label: "Add skill" }}
              />
              <LoadingState variant="table" rows={3} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="section-stack pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Component patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {componentPatterns.propNaming.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Layout patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {Object.entries(layoutPatterns).map(([key, value]) => (
                <p key={key}>
                  <span className="font-medium capitalize">{key}:</span>{" "}
                  <span className="text-muted-foreground">{value}</span>
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interaction patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {Object.entries(interactionPatterns).map(([key, value]) => (
                <p key={key}>
                  <span className="font-medium capitalize">{key}:</span>{" "}
                  <span className="text-muted-foreground">{value}</span>
                </p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
