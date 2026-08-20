import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Tự động chuyển đổi cổng kết nối từ Session Mode (5432) sang Transaction Mode (6543) cho Supabase pooler
let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl.includes(".pooler.supabase.com:5432")) {
  dbUrl = dbUrl.replace(":5432", ":6543");
  if (!dbUrl.includes("pgbouncer=true")) {
    dbUrl += dbUrl.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 10000,
  });
}

const pool = globalForPrisma.pgPool;

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(pool);
  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma;

