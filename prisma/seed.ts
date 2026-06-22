import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { createPgPool } from "../src/lib/db";

const pool = createPgPool(true);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const name = process.env.ADMIN_NAME ?? "Portfolio Admin";
  const portfolioSlug = process.env.ADMIN_PORTFOLIO_SLUG ?? "admin";

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, portfolioSlug },
    create: {
      email,
      name,
      passwordHash,
      portfolioSlug,
      role: "ADMIN",
      isPublic: true,
      bio: "Personal portfolio and career management system owner.",
    },
  });

  console.log(`Seeded admin user: ${user.email} (slug: ${user.portfolioSlug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
