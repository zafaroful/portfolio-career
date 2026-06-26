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

function getPrismaClient(): PrismaClient {
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
  return globalForPrisma.prisma;
}

/** Lazy client so importing modules during `next build` does not require DATABASE_URL. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
