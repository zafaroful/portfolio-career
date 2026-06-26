import { prisma } from "@/lib/prisma";
import { computeOnboardingState, formatActivityDescription } from "@/lib/onboarding";
import type { SmartSearchFilters } from "@/lib/validators/ai";

export async function getPortfolioData(slug: string) {
  const user = await prisma.user.findFirst({
    where: { portfolioSlug: slug, isPublic: true },
    include: {
      skills: { orderBy: { category: "asc" } },
      certifications: { orderBy: { issueDate: "desc" } },
      achievements: { orderBy: { date: "desc" } },
      projects: {
        where: {
          isPublic: true,
          status: { in: ["ACTIVE", "COMPLETED"] },
        },
        orderBy: { startDate: "desc" },
      },
    },
  });
  return user;
}

export async function getOwnerData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: { orderBy: { category: "asc" } },
      certifications: { orderBy: { issueDate: "desc" } },
      achievements: { orderBy: { date: "desc" } },
      projects: { orderBy: { startDate: "desc" } },
      resumes: { orderBy: { generatedAt: "desc" } },
    },
  });
}

async function resolveRecordName(tableName: string, recordId: string) {
  switch (tableName) {
    case "skills": {
      const r = await prisma.skill.findUnique({ where: { id: recordId }, select: { name: true } });
      return r?.name ?? null;
    }
    case "certifications": {
      const r = await prisma.certification.findUnique({
        where: { id: recordId },
        select: { title: true },
      });
      return r?.title ?? null;
    }
    case "achievements": {
      const r = await prisma.achievement.findUnique({
        where: { id: recordId },
        select: { title: true },
      });
      return r?.title ?? null;
    }
    case "projects": {
      const r = await prisma.project.findUnique({
        where: { id: recordId },
        select: { title: true },
      });
      return r?.title ?? null;
    }
    case "resumes": {
      const r = await prisma.resume.findUnique({
        where: { id: recordId },
        select: { versionName: true },
      });
      return r?.versionName ?? null;
    }
    default:
      return null;
  }
}

async function enrichActivityLogs(
  logs: Array<{
    id: string;
    action: string;
    tableName: string;
    recordId: string;
    timestamp: Date;
    metadata: unknown;
  }>,
) {
  return Promise.all(
    logs.map(async (log) => {
      const metadata = log.metadata as Record<string, unknown> | null;
      const recordName =
        (typeof metadata?.recordName === "string" ? metadata.recordName : null) ??
        (await resolveRecordName(log.tableName, log.recordId));

      return {
        id: log.id,
        action: log.action,
        tableName: log.tableName,
        recordId: log.recordId,
        timestamp: log.timestamp.toISOString(),
        recordName,
        description: formatActivityDescription(log.action, log.tableName, recordName),
      };
    }),
  );
}

async function getMonthlyTrend(userId: string, model: "skill" | "certification" | "achievement" | "project" | "resume") {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let addedThisMonth = 0;
  switch (model) {
    case "skill":
      addedThisMonth = await prisma.skill.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      });
      break;
    case "certification":
      addedThisMonth = await prisma.certification.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      });
      break;
    case "achievement":
      addedThisMonth = await prisma.achievement.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      });
      break;
    case "project":
      addedThisMonth = await prisma.project.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      });
      break;
    case "resume":
      addedThisMonth = await prisma.resume.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      });
      break;
  }

  return addedThisMonth > 0
    ? { value: `+${addedThisMonth} this month`, positive: true }
    : undefined;
}

export async function getDashboardStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      onboardingCompleted: true,
      onboardingStep: true,
      isPublic: true,
      portfolioSlug: true,
    },
  });

  const [skills, certifications, achievements, projects, resumes] =
    await Promise.all([
      prisma.skill.count({ where: { userId } }),
      prisma.certification.count({ where: { userId } }),
      prisma.achievement.count({ where: { userId } }),
      prisma.project.count({ where: { userId } }),
      prisma.resume.count({ where: { userId } }),
    ]);

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const expiringCerts = await prisma.certification.findMany({
    where: {
      userId,
      expiryDate: { not: null, lte: in90 },
    },
    orderBy: { expiryDate: "asc" },
  });

  const recentActivityRaw = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
    take: 5,
  });

  const recentActivity = await enrichActivityLogs(recentActivityRaw);

  const categorizeExpiry = (expiryDate: Date | null) => {
    if (!expiryDate) return "none";
    if (expiryDate < now) return "expired";
    if (expiryDate <= in30) return "30";
    if (expiryDate <= in60) return "60";
    if (expiryDate <= in90) return "90";
    return "valid";
  };

  const counts = { skills, certifications, achievements, projects, resumes };

  const onboarding = computeOnboardingState({
    counts,
    isPublic: user?.isPublic ?? false,
    portfolioSlug: user?.portfolioSlug ?? null,
    onboardingCompleted: user?.onboardingCompleted ?? false,
    onboardingStep: user?.onboardingStep ?? 0,
  });

  // Auto-update onboarding progress when all steps complete
  if (user && onboarding.completedCount === onboarding.totalSteps && !user.onboardingCompleted) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
        onboardingStep: onboarding.totalSteps,
      },
    });
    onboarding.onboardingCompleted = true;
  } else if (user && onboarding.completedCount !== user.onboardingStep) {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingStep: onboarding.completedCount },
    });
  }

  const [skillsTrend, certsTrend, achievementsTrend, projectsTrend, resumesTrend] =
    await Promise.all([
      getMonthlyTrend(userId, "skill"),
      getMonthlyTrend(userId, "certification"),
      getMonthlyTrend(userId, "achievement"),
      getMonthlyTrend(userId, "project"),
      getMonthlyTrend(userId, "resume"),
    ]);

  const certAlertCount = expiringCerts.filter((c) => {
    const status = categorizeExpiry(c.expiryDate);
    return status === "expired" || ["30", "60", "90"].includes(status);
  }).length;

  return {
    counts,
    trends: {
      skills: skillsTrend,
      certifications: certsTrend,
      achievements: achievementsTrend,
      projects: projectsTrend,
      resumes: resumesTrend,
    },
    expiringCerts: expiringCerts.map((c) => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      expiryDate: c.expiryDate?.toISOString() ?? null,
      expiryStatus: categorizeExpiry(c.expiryDate),
    })),
    certAlertCount,
    recentActivity,
    onboarding,
  };
}

export async function searchAll(userId: string, query: string) {
  const q = query.trim();
  if (!q) return { skills: [], certifications: [], achievements: [], projects: [] };

  const [skills, certifications, achievements, projects] = await Promise.all([
    prisma.skill.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
    }),
    prisma.certification.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { issuer: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
    }),
    prisma.achievement.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
    }),
    prisma.project.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
    }),
  ]);

  return { skills, certifications, achievements, projects };
}

function parseDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function smartSearch(
  userId: string,
  filters: SmartSearchFilters,
  fallbackQuery?: string,
) {
  const entityTypes = filters.entityTypes ?? [
    "skills",
    "certifications",
    "achievements",
    "projects",
  ];

  const keywordWhere = (fields: string[]) => {
    if (!filters.keywords?.length) return undefined;
    return {
      OR: filters.keywords.flatMap((keyword) =>
        fields.map((field) => ({
          [field]: { contains: keyword, mode: "insensitive" as const },
        })),
      ),
    };
  };

  const dateFilter = (field: string) => {
    if (!filters.dateRange || filters.dateRange.field !== field) return {};
    const from = parseDate(filters.dateRange.from);
    const to = parseDate(filters.dateRange.to);
    const clause: Record<string, unknown> = {};
    if (from) clause.gte = from;
    if (to) clause.lte = to;
    return Object.keys(clause).length ? { [field]: clause } : {};
  };

  const now = new Date();
  const expiringBefore = filters.expiringWithinDays
    ? new Date(now.getTime() + filters.expiringWithinDays * 86400000)
    : undefined;

  const [skills, certifications, achievements, projects] = await Promise.all([
    entityTypes.includes("skills")
      ? prisma.skill.findMany({
          where: {
            userId,
            ...keywordWhere(["name", "category"]),
          },
          take: 20,
        })
      : Promise.resolve([]),
    entityTypes.includes("certifications")
      ? prisma.certification.findMany({
          where: {
            userId,
            ...(expiringBefore
              ? { expiryDate: { lte: expiringBefore, gte: now } }
              : {}),
            ...keywordWhere(["title", "issuer"]),
            ...dateFilter("expiryDate"),
            ...dateFilter("issueDate"),
          },
          take: 20,
        })
      : Promise.resolve([]),
    entityTypes.includes("achievements")
      ? prisma.achievement.findMany({
          where: {
            userId,
            ...keywordWhere(["title", "description"]),
            ...dateFilter("date"),
          },
          take: 20,
        })
      : Promise.resolve([]),
    entityTypes.includes("projects")
      ? prisma.project.findMany({
          where: {
            userId,
            ...(filters.status ? { status: filters.status as "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED" } : {}),
            ...keywordWhere(["title", "description", "category"]),
            ...dateFilter("startDate"),
            ...dateFilter("endDate"),
          },
          take: 20,
        })
      : Promise.resolve([]),
  ]);

  const hasResults =
    skills.length + certifications.length + achievements.length + projects.length > 0;

  if (!hasResults && fallbackQuery) {
    return searchAll(userId, fallbackQuery);
  }

  return { skills, certifications, achievements, projects };
}

export async function getPublicPortfolioSlugs() {
  const users = await prisma.user.findMany({
    where: { isPublic: true, portfolioSlug: { not: null } },
    select: { portfolioSlug: true, updatedAt: true },
  });
  return users.filter((u): u is { portfolioSlug: string; updatedAt: Date } => !!u.portfolioSlug);
}
