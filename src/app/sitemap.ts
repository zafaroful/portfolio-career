import type { MetadataRoute } from "next";
import { getPublicPortfolioSlugs } from "@/lib/services/portfolio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portfolios = await getPublicPortfolioSlugs();

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
