import { getOwnerData } from "@/lib/services/portfolio";

export async function buildPortfolioContext(userId: string) {
  const owner = await getOwnerData(userId);
  if (!owner) return null;

  return {
    user: {
      name: owner.name,
      bio: owner.bio,
      email: owner.email,
    },
    skills: owner.skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
      yearsExperience: s.yearsExperience,
    })),
    certifications: owner.certifications.map((c) => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      issueDate: c.issueDate?.toISOString() ?? null,
      expiryDate: c.expiryDate?.toISOString() ?? null,
    })),
    achievements: owner.achievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      date: a.date.toISOString(),
      category: a.category,
    })),
    projects: owner.projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      techStack: p.techStack,
      role: p.role,
      status: p.status,
      category: p.category,
      tags: p.tags,
      startDate: p.startDate?.toISOString() ?? null,
      endDate: p.endDate?.toISOString() ?? null,
    })),
  };
}

export type PortfolioContext = NonNullable<Awaited<ReturnType<typeof buildPortfolioContext>>>;

const METRIC_KEYWORDS =
  /\d+%|\d+\+|increased|decreased|reduced|improved|saved|delivered|users|revenue|performance/i;

export function computePortfolioStats(context: PortfolioContext) {
  const skillsWithProjects = new Set<string>();
  for (const project of context.projects) {
    const stack = (project.techStack as string[]) ?? [];
    for (const skill of context.skills) {
      const nameLower = skill.name.toLowerCase();
      if (
        stack.some((t) => t.toLowerCase().includes(nameLower)) ||
        project.description?.toLowerCase().includes(nameLower) ||
        project.title.toLowerCase().includes(nameLower)
      ) {
        skillsWithProjects.add(skill.id);
      }
    }
  }

  const projectsWithoutMetrics = context.projects.filter(
    (p) => !p.description || !METRIC_KEYWORDS.test(p.description),
  );

  const now = new Date();
  const in90Days = new Date(now);
  in90Days.setDate(in90Days.getDate() + 90);

  const expiringCerts = context.certifications.filter((c) => {
    if (!c.expiryDate) return false;
    const expiry = new Date(c.expiryDate);
    return expiry <= in90Days;
  });

  return {
    skillCount: context.skills.length,
    skillsWithoutProjects: context.skills.filter((s) => !skillsWithProjects.has(s.id)).length,
    projectCount: context.projects.length,
    projectsWithoutMetrics: projectsWithoutMetrics.length,
    certCount: context.certifications.length,
    expiringCertCount: expiringCerts.length,
    achievementCount: context.achievements.length,
    hasBio: !!(context.user.bio && context.user.bio.length >= 50),
    bioLength: context.user.bio?.length ?? 0,
  };
}
