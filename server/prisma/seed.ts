import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Idempotent development seed. Churches are not seeded — import them with
 * `npm run import:google-churches` (see docs/engineering/DATA_PIPELINE.md).
 */
async function main(): Promise<void> {
  try {
    const [{ postgis_version }] = await prisma.$queryRaw<Array<{ postgis_version: string }>>`
      SELECT PostGIS_version() AS postgis_version
    `
    console.log(`PostGIS version: ${postgis_version}`)
  } catch {
    console.warn('PostGIS extension not available — run: CREATE EXTENSION IF NOT EXISTS "postgis";')
  }

  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      name: 'Test User',
      emailVerified: true,
    },
  })

  console.log(`Seeded user: ${testUser.email}`)
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
