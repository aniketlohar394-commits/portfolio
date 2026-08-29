import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const isLibsql = process.env.DATABASE_URL?.startsWith('libsql://') || process.env.DATABASE_URL?.startsWith('turso://')

function createPrismaClient() {
  if (isLibsql) {
    const adapter = new PrismaLibSql({
      url: process.env.DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    return new PrismaClient({ adapter })
  }
  return new PrismaClient()
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
