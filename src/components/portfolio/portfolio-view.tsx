"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillBadge } from "@/components/features/skills/skill-badge";
import { cn, formatDate } from "@/lib/utils";
import type {
  Skill,
  Certification,
  Achievement,
  Project,
} from "@prisma/client";

type PortfolioData = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  photoUrl: string | null;
  portfolioSlug: string | null;
  isPublic: boolean;
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
  projects: Project[];
};

export function PortfolioView({ portfolio }: { portfolio: PortfolioData }) {
  const [techFilter, setTechFilter] = useState<string | null>(null);
  const [groupByCategory, setGroupByCategory] = useState(false);

  const allTech = useMemo(
    () =>
      [
        ...new Set(
          portfolio.projects.flatMap((p) => (p.techStack as string[]) ?? []),
        ),
      ].sort(),
    [portfolio.projects],
  );

  const filteredProjects = useMemo(() => {
    if (!techFilter) return portfolio.projects;
    return portfolio.projects.filter((p) =>
      (p.techStack as string[]).includes(techFilter),
    );
  }, [portfolio.projects, techFilter]);

  const projectsByCategory = useMemo(() => {
    if (!groupByCategory) return null;
    return filteredProjects.reduce<Record<string, Project[]>>((acc, project) => {
      const cat = (project as Project & { category?: string | null }).category ?? "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(project);
      return acc;
    }, {});
  }, [filteredProjects, groupByCategory]);

  const skillsByCategory = portfolio.skills.reduce<Record<string, Skill[]>>(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {portfolio.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portfolio.photoUrl}
                alt={portfolio.name}
                className="h-24 w-24 rounded-full object-cover ring-2 ring-border"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{portfolio.name}</h1>
              {portfolio.bio && (
                <p className="mt-2 max-w-2xl text-muted-foreground">{portfolio.bio}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-6 py-10">
        {portfolio.skills.length > 0 && (
          <section aria-labelledby="skills-heading">
            <h2 id="skills-heading" className="mb-4 text-xl font-semibold">Skills</h2>
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <Card key={category} className="shadow-elevation-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <SkillBadge
                        key={skill.id}
                        name={skill.name}
                        proficiency={skill.proficiency}
                      />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {portfolio.projects.length > 0 && (
          <section aria-labelledby="projects-heading">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="projects-heading" className="text-xl font-semibold">Projects</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGroupByCategory((v) => !v)}
              >
                {groupByCategory ? "Flat list" : "Group by category"}
              </Button>
            </div>
            {allTech.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTechFilter(null)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition-colors",
                    !techFilter && "border-primary bg-primary/10",
                  )}
                >
                  All
                </button>
                {allTech.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setTechFilter(tech === techFilter ? null : tech)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted",
                      techFilter === tech && "border-primary bg-primary/10",
                    )}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            )}
            {groupByCategory && projectsByCategory ? (
              <div className="space-y-8">
                {Object.entries(projectsByCategory).map(([category, projects]) => (
                  <div key={category}>
                    <h3 className="mb-3 text-lg font-medium">{category}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>
        )}

        {portfolio.certifications.length > 0 && (
          <section aria-labelledby="certs-heading">
            <h2 id="certs-heading" className="mb-4 text-xl font-semibold">Certifications</h2>
            <div className="space-y-3">
              {portfolio.certifications.map((cert) => (
                <Card key={cert.id} className="shadow-elevation-sm">
                  <CardContent className="flex justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium">{cert.title}</p>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(cert.issueDate)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {portfolio.achievements.length > 0 && (
          <section aria-labelledby="achievements-heading">
            <h2 id="achievements-heading" className="mb-4 text-xl font-semibold">Achievements</h2>
            <div className="space-y-3">
              {portfolio.achievements.map((achievement) => (
                <Card key={achievement.id} className="shadow-elevation-sm">
                  <CardContent className="py-4">
                    <div className="flex justify-between gap-4">
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(achievement.date)}
                      </p>
                    </div>
                    {achievement.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const category = (project as Project & { category?: string | null }).category;

  return (
    <Card className="shadow-elevation-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{project.title}</CardTitle>
          {category && <Badge variant="secondary">{category}</Badge>}
        </div>
        {project.role && (
          <p className="text-sm text-muted-foreground">{project.role}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {project.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl}
            alt={project.title}
            className="h-32 w-full rounded-md object-cover"
          />
        )}
        {project.description && <p className="text-sm">{project.description}</p>}
        <div className="flex flex-wrap gap-1">
          {(project.techStack as string[]).map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
        {(project.links as Array<{ label: string; url: string }>).map((link) => (
          <a
            key={link.url}
            href={link.url}
            className="text-sm text-primary underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            {link.label}
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
