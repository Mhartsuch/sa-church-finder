/**
 * Cleanup script — removes demo/seed churches that were not imported from Google Places.
 *
 * Identifies churches by the absence of a googlePlaceId. Related rows
 * (services, photos, reviews, events, claims, saved entries) are deleted
 * first to respect foreign-key constraints.
 *
 * Usage:
 *   npx tsx src/scripts/cleanup-demo-churches.ts
 *   npm run db:cleanup-demo
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const demoChurches = await prisma.church.findMany({
    where: { googlePlaceId: null },
    select: { id: true, name: true },
  })

  if (demoChurches.length === 0) {
    console.log('No demo churches found — nothing to remove.')
    return
  }

  console.log(`Found ${demoChurches.length} demo churches (no googlePlaceId):\n`)
  for (const c of demoChurches) {
    console.log(`  • ${c.name}`)
  }

  const ids = demoChurches.map((c) => c.id)

  console.log('\nDeleting related data...')

  const savedDeleted = await prisma.userSavedChurch.deleteMany({ where: { churchId: { in: ids } } })
  console.log(`  Saved entries:  ${savedDeleted.count}`)

  const votesDeleted = await prisma.reviewVote.deleteMany({
    where: { review: { churchId: { in: ids } } },
  })
  console.log(`  Review votes:   ${votesDeleted.count}`)

  const reviewsDeleted = await prisma.review.deleteMany({ where: { churchId: { in: ids } } })
  console.log(`  Reviews:        ${reviewsDeleted.count}`)

  const eventsDeleted = await prisma.event.deleteMany({ where: { churchId: { in: ids } } })
  console.log(`  Events:         ${eventsDeleted.count}`)

  const photosDeleted = await prisma.churchPhoto.deleteMany({ where: { churchId: { in: ids } } })
  console.log(`  Photos:         ${photosDeleted.count}`)

  const servicesDeleted = await prisma.churchService.deleteMany({
    where: { churchId: { in: ids } },
  })
  console.log(`  Services:       ${servicesDeleted.count}`)

  const claimsDeleted = await prisma.churchClaim.deleteMany({ where: { churchId: { in: ids } } })
  console.log(`  Claims:         ${claimsDeleted.count}`)

  const churchesDeleted = await prisma.church.deleteMany({ where: { id: { in: ids } } })
  console.log(`\nRemoved ${churchesDeleted.count} demo churches.`)

  const remaining = await prisma.church.count()
  console.log(`${remaining} churches remain in the database.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Cleanup failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
