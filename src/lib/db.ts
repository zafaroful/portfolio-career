import pg from "pg";

export function isSupabaseConnection(connectionString: string): boolean {
  return (
    connectionString.includes("supabase.com") ||
    connectionString.includes("supabase.co")
  );
}

/** Runtime uses pooled DATABASE_URL; migrations/seeds use DIRECT_URL when set. */
export function getDatabaseUrl(forDirect = false): string {
  const url = forDirect
    ? process.env.DIRECT_URL ?? process.env.DATABASE_URL
    : process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      forDirect
        ? "DIRECT_URL or DATABASE_URL must be set"
        : "DATABASE_URL must be set",
    );
  }

  return url;
}

export function createPgPool(forDirect = false): pg.Pool {
  const connectionString = getDatabaseUrl(forDirect);
  const config: pg.PoolConfig = { connectionString };

  if (isSupabaseConnection(connectionString)) {
    config.ssl = { rejectUnauthorized: false };
  }

  // Supabase transaction pooler (port 6543) works best with a single connection.
  if (connectionString.includes("pgbouncer=true")) {
    config.max = 1;
  }

  return new pg.Pool(config);
}
