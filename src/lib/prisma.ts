import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createPgPool } from "@/lib/db";

const PRISMA_CLIENT_VERSION = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaVersion?: number;
};

function createPrismaClient() {
  const pool = createPgPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

if (
  !globalForPrisma.prisma ||
  globalForPrisma.prismaVersion !== PRISMA_CLIENT_VERSION
) {
  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect();
  }
  globalForPrisma.prisma = createPrismaClient();
  globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
}

export const prisma = globalForPrisma.prisma;
