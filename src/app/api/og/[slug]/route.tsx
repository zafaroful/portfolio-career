import { ImageResponse } from "next/og";
import { getPortfolioData } from "@/lib/services/portfolio";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const portfolio = await getPortfolioData(slug);

  if (!portfolio) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#fff",
            fontSize: 48,
          }}
        >
          Portfolio not found
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  const topSkills = portfolio.skills.slice(0, 3).map((s) => s.name);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 60,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f8fafc",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
          {portfolio.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portfolio.photoUrl}
              alt=""
              width={80}
              height={80}
              style={{ borderRadius: 40, objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                background: "#334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              {portfolio.name.charAt(0)}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 48, fontWeight: 700 }}>{portfolio.name}</div>
            <div style={{ fontSize: 24, color: "#94a3b8", marginTop: 8 }}>
              Portfolio Career
            </div>
          </div>
        </div>
        <div style={{ fontSize: 28, color: "#cbd5e1", lineHeight: 1.4, maxWidth: 900 }}>
          {portfolio.bio ?? `Professional portfolio of ${portfolio.name}`}
        </div>
        {topSkills.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
            {topSkills.map((skill) => (
              <div
                key={skill}
                style={{
                  padding: "8px 20px",
                  borderRadius: 20,
                  background: "#334155",
                  fontSize: 20,
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
