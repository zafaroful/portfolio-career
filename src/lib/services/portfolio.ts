import { prisma } from "@/lib/prisma";

export async function getPortfolioData(slug: string) {
  const user = await prisma.user.findFirst({
    where: { portfolioSlug: slug, isPublic: true },
    include: {
      skills: { orderBy: { category: "asc" } },
      certifications: { orderBy: { issueDate: "desc" } },
      achievements: { orderBy: { date: "desc" } },
      projects: {
        where: { isPublic: true },
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

export async function getDashboardStats(userId: string) {
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

  const recentActivity = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
    take: 10,
  });

  const categorizeExpiry = (expiryDate: Date | null) => {
    if (!expiryDate) return "none";
    if (expiryDate < now) return "expired";
    if (expiryDate <= in30) return "30";
    if (expiryDate <= in60) return "60";
    if (expiryDate <= in90) return "90";
    return "valid";
  };

  return {
    counts: { skills, certifications, achievements, projects, resumes },
    expiringCerts: expiringCerts.map((c) => ({
      ...c,
      expiryStatus: categorizeExpiry(c.expiryDate),
    })),
    recentActivity,
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
