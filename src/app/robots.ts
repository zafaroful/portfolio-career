import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/portfolio/", "/"],
        disallow: [
          "/dashboard",
          "/skills",
          "/certifications",
          "/achievements",
          "/projects",
          "/resumes",
          "/settings",
          "/login",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
