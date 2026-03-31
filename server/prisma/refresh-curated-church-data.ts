import { Prisma, PrismaClient } from '@prisma/client'

import { curatedChurches } from './curated-seed-churches'

const prisma = new PrismaClient()

const APPLY_FLAG = '--confirm-reset'
const DRY_RUN_FLAG = '--dry-run'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function main() {
  const shouldApply = process.argv.includes(APPLY_FLAG)
  const isDryRun = process.argv.includes(DRY_RUN_FLAG)
  const curatedSlugs = curatedChurches.map((church) => generateSlug(church.name))

  console.log('Refreshing curated church data...')
  console.log(`Curated profiles: ${curatedChurches.length}`)
  console.log(`Target slugs: ${curatedSlugs.join(', ')}`)
  console.log('This preserves users, sessions, and auth tokens.')
  console.log(
    'This removes church records, services, photos, reviews, events, claims, and saved churches.',
  )

  if (isDryRun) {
    console.log('\nDry run only. No database writes were made.')
    return
  }

  if (!shouldApply) {
    console.error(`\nPass ${APPLY_FLAG} to apply this reset.`)
    process.exitCode = 1
    return
  }

  const result = await prisma.$transaction(async (tx) => {
    const deletedSavedChurches = await tx.userSavedChurch.deleteMany()
    const deletedReviewVotes = await tx.reviewVote.deleteMany()
    const deletedReviews = await tx.review.deleteMany()
    const deletedEvents = await tx.event.deleteMany()
    const deletedPhotos = await tx.churchPhoto.deleteMany()
    const deletedServices = await tx.churchService.deleteMany()
    const deletedClaims = await tx.churchClaim.deleteMany()
    const deletedChurches = await tx.church.deleteMany()

    let createdChurchCount = 0
    let createdServiceCount = 0
    let createdPhotoCount = 0

    for (const churchData of curatedChurches) {
      const church = await tx.church.create({
        data: {
          name: churchData.name,
          slug: generateSlug(churchData.name),
          denomination: churchData.denomination,
          denominationFamily: churchData.denominationFamily,
          address: churchData.address,
          zipCode: churchData.zipCode,
          neighborhood: churchData.neighborhood,
          latitude: new Prisma.Decimal(churchData.latitude),
          longitude: new Prisma.Decimal(churchData.longitude),
          phone: churchData.phone,
          email: churchData.email,
          website: churchData.website,
          pastorName: churchData.pastorName,
          yearEstablished: churchData.yearEstablished,
          description: churchData.description,
          avgRating: new Prisma.Decimal('0'),
          reviewCount: 0,
          isClaimed: false,
          amenities: churchData.amenities || [],
          languages: churchData.languages || ['English'],
          coverImageUrl: churchData.coverImageUrl,
          services: {
            create: churchData.services.map((service) => ({
              dayOfWeek: service.dayOfWeek,
              startTime: service.startTime,
              endTime: service.endTime,
              serviceType: service.serviceType,
              language: service.language || 'English',
            })),
          },
        },
      })

      createdChurchCount += 1
      createdServiceCount += churchData.services.length

      if (churchData.coverImageUrl) {
        await tx.churchPhoto.create({
          data: {
            churchId: church.id,
            url: churchData.coverImageUrl,
            altText: churchData.coverImageAltText || `${churchData.name} cover image`,
          },
        })
        createdPhotoCount += 1
      }

      console.log(`  created ${churchData.name}`)
    }

    return {
      deletedSavedChurches: deletedSavedChurches.count,
      deletedReviewVotes: deletedReviewVotes.count,
      deletedReviews: deletedReviews.count,
      deletedEvents: deletedEvents.count,
      deletedPhotos: deletedPhotos.count,
      deletedServices: deletedServices.count,
      deletedClaims: deletedClaims.count,
      deletedChurches: deletedChurches.count,
      createdChurchCount,
      createdServiceCount,
      createdPhotoCount,
    }
  })

  console.log('\nRefresh complete.')
  console.log(`Deleted saved churches: ${result.deletedSavedChurches}`)
  console.log(`Deleted review votes: ${result.deletedReviewVotes}`)
  console.log(`Deleted reviews: ${result.deletedReviews}`)
  console.log(`Deleted events: ${result.deletedEvents}`)
  console.log(`Deleted church photos: ${result.deletedPhotos}`)
  console.log(`Deleted church services: ${result.deletedServices}`)
  console.log(`Deleted church claims: ${result.deletedClaims}`)
  console.log(`Deleted churches: ${result.deletedChurches}`)
  console.log(`Created churches: ${result.createdChurchCount}`)
  console.log(`Created services: ${result.createdServiceCount}`)
  console.log(`Created photos: ${result.createdPhotoCount}`)
}

main()
  .catch((error) => {
    console.error('Curated church refresh failed.')
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
