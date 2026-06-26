import type { MetadataRoute } from "next";
import { getPublicPortfolioSlugs } from "@/lib/services/portfolio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let portfolios: Awaited<ReturnType<typeof getPublicPortfolioSlugs>> = [];

  if (process.env.DATABASE_URL) {
    try {
      portfolios = await getPublicPortfolioSlugs();
    } catch {
      // Database may be unavailable during CI/Vercel build; homepage entry still works.
    }
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...portfolios.map((p) => ({
      url: `${baseUrl}/portfolio/${p.portfolioSlug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
