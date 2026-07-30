import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var __filasHpsPrisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__filasHpsPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__filasHpsPrisma = prisma;
}
