import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const databaseUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || ''
const authToken = process.env.TURSO_AUTH_TOKEN || ''
const isLibsql = databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('turso://') || !!process.env.TURSO_AUTH_TOKEN

function createPrismaClient() {
  if (isLibsql && databaseUrl && databaseUrl.startsWith('libsql://')) {
    const adapter = new PrismaLibSql({
      url: databaseUrl,
      authToken: authToken || undefined,
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
