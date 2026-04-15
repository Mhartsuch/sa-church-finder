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
  await prisma.ribbonCategory.deleteMany()
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

  // ── Seed ribbon categories ──
  console.log('\nSeeding ribbon categories...')
  const ribbonCategories = [
    { label: 'Historic', icon: '🏛️', slug: 'historic', filterType: 'QUERY' as const, filterValue: 'Historic', position: 0 },
    { label: 'Contemporary', icon: '🎵', slug: 'contemporary', filterType: 'QUERY' as const, filterValue: 'Contemporary', position: 1 },
    { label: 'Traditional', icon: '🏠', slug: 'traditional', filterType: 'QUERY' as const, filterValue: 'Traditional', position: 2 },
    { label: 'Community', icon: '💜', slug: 'community', filterType: 'QUERY' as const, filterValue: 'Community', position: 3 },
    { label: 'Missions', icon: '🏛️', slug: 'missions', filterType: 'QUERY' as const, filterValue: 'Mission', position: 4 },
    { label: 'Megachurch', icon: '🏢', slug: 'megachurch', filterType: 'QUERY' as const, filterValue: 'Megachurch', position: 5 },
  ]

  for (const cat of ribbonCategories) {
    await prisma.ribbonCategory.upsert({
      where: { slug: cat.slug },
      update: { label: cat.label, icon: cat.icon, filterType: cat.filterType, filterValue: cat.filterValue, position: cat.position },
      create: { ...cat, source: 'MANUAL', isVisible: true, isPinned: true },
    })
  }
  console.log(`Seeded ${ribbonCategories.length} ribbon categories`)

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
