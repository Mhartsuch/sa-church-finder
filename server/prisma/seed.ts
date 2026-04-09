import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function main() {
  console.log('Starting seed...\n')

  // ── Verify PostGIS is enabled ──
  try {
    const postgisVersion = await prisma.$queryRaw<Array<{ postgis_version: string }>>`
      SELECT PostGIS_version() AS postgis_version
    `
    console.log(`PostGIS version: ${postgisVersion[0].postgis_version}`)
  } catch {
    console.warn('⚠  PostGIS extension not available — spatial features will be limited.')
    console.warn('   Run: CREATE EXTENSION IF NOT EXISTS "postgis";')
  }

  // ── Clear existing data (respects FK order) ──
  console.log('Clearing existing data...')
  await prisma.userSavedChurch.deleteMany()
  await prisma.reviewVote.deleteMany()
  await prisma.review.deleteMany()
  await prisma.event.deleteMany()
  await prisma.churchPhoto.deleteMany()
  await prisma.churchService.deleteMany()
  await prisma.churchClaim.deleteMany()
  await prisma.emailVerificationToken.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.church.deleteMany()

  // ── Create test users ──
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: await hashPassword('password123'),
      name: 'Test User',
      role: 'USER',
      emailVerified: true,
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@sachurchfinder.com',
      passwordHash: await hashPassword('admin123'),
      name: 'Site Admin',
      role: 'SITE_ADMIN',
      emailVerified: true,
    },
  })

  console.log(`Created users: ${testUser.email}, ${adminUser.email}`)

  // ── No demo churches ──
  // Churches are imported from Google Places API via:
  //   npm run import:google-churches
  //   npm run enrich:google-ratings
  console.log('\nNo demo churches seeded — use import:google-churches to populate.')

  console.log('\n✅ Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
