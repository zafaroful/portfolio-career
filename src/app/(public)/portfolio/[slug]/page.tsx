import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/services/portfolio";
import { PortfolioView } from "@/components/portfolio/portfolio-view";

export const revalidate = 60;

function buildDescription(
  name: string,
  bio: string | null,
  skills: Array<{ name: string }>,
) {
  if (bio && bio.length >= 50) return bio;
  const skillNames = skills.slice(0, 5).map((s) => s.name).join(", ");
  if (bio && skillNames) return `${bio} Skills: ${skillNames}.`;
  if (skillNames) return `Professional portfolio of ${name}. Skills: ${skillNames}.`;
  return bio ?? `Professional portfolio of ${name}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await getPortfolioData(slug);
  if (!portfolio) return { title: "Portfolio not found" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const canonicalUrl = `${baseUrl}/portfolio/${slug}`;
  const ogImageUrl = `${baseUrl}/api/og/${slug}`;
  const title = `${portfolio.name} — Portfolio`;
  const description = buildDescription(portfolio.name, portfolio.bio, portfolio.skills);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "profile",
      url: canonicalUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portfolio = await getPortfolioData(slug);
  if (!portfolio) notFound();

  const { passwordHash: _passwordHash, ...publicData } = portfolio;
  void _passwordHash;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: publicData.name,
    description: publicData.bio,
    image: publicData.photoUrl,
    url: `${baseUrl}/portfolio/${slug}`,
    jobTitle: publicData.bio?.split(".")[0] ?? undefined,
    knowsAbout: publicData.skills.map((s) => s.name),
    hasCredential: publicData.certifications.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.title,
      credentialCategory: c.issuer,
      dateCreated: c.issueDate.toISOString().split("T")[0],
    })),
    sameAs: publicData.linkedinUrl ? [publicData.linkedinUrl] : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioView portfolio={publicData} />
    </>
  );
}
