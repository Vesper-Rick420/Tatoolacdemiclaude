/**
 * Cliente de Prisma (patrón singleton).
 *
 * En Prisma 7 el cliente se conecta mediante un "driver adapter".
 * Usamos PrismaPg (PostgreSQL) con la URL "pooled" de Supabase
 * (process.env.DATABASE_URL).
 *
 * El singleton evita abrir múltiples conexiones en desarrollo, donde
 * Next.js recarga los módulos en cada cambio (hot reload). En producción
 * se crea una sola instancia por proceso.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
