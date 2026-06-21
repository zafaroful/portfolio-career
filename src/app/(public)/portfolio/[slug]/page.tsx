import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/services/portfolio";
import { PortfolioView } from "@/components/portfolio/portfolio-view";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await getPortfolioData(slug);
  if (!portfolio) return { title: "Portfolio not found" };

  const title = `${portfolio.name} — Portfolio`;
  const description =
    portfolio.bio ?? `Professional portfolio of ${portfolio.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: portfolio.photoUrl ? [portfolio.photoUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: publicData.name,
    description: publicData.bio,
    image: publicData.photoUrl,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/portfolio/${slug}`,
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
