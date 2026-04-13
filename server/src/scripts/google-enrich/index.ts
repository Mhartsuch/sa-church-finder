/* eslint-disable no-console */
/**
 * Google Places Enrich Script
 *
 * Fetches rating and review count from Google Places API for all existing
 * churches that have a googlePlaceId but are missing googleRating data.
 * Run this once after deploying the google rating schema migration.
 *
 * Usage:
 *   npx tsx src/scripts/google-enrich/index.ts [flags]
 *
 * Flags:
 *   --all        Re-fetch and overwrite googleRating for ALL churches with a placeId
 *   --dry-run    Fetch from Google but don't write to the database
 *   --limit N    Only process the first N churches
 *
 * Required environment variables:
 *   GOOGLE_PLACES_API_KEY or MAPS_API_KEY
 */

import { Prisma, PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

import { GooglePlacesClient } from '../google-import/google-places-client.js'

dotenv.config()

function parseArgs(): { all: boolean; dryRun: boolean; limit: number | null } {
  const args = process.argv.slice(2)
  const limitIndex = args.indexOf('--limit')
  return {
    all: args.includes('--all'),
    dryRun: args.includes('--dry-run'),
    limit: limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null,
  }
}

function getRequiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? (fallback ? process.env[fallback] : undefined)
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}${fallback ? ` (or ${fallback})` : ''}`,
    )
  }
  return value
}

async function main(): Promise<void> {
  const options = parseArgs()
  const prisma = new PrismaClient()

  try {
    console.log('=== Google Places Enrich Pipeline ===')
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log(`Scope: ${options.all ? 'ALL churches with placeId' : 'missing googleRating only'}`)
    if (options.limit) console.log(`Limit: ${options.limit}`)
    console.log('')

    const apiKey = getRequiredEnv('GOOGLE_PLACES_API_KEY', 'MAPS_API_KEY')
    const placesClient = new GooglePlacesClient(apiKey, 5)

    // Find churches to enrich
    const whereClause = options.all
      ? { googlePlaceId: { not: null } }
      : { googlePlaceId: { not: null }, googleRating: null }

    const churches = await prisma.church.findMany({
      where: whereClause,
      select: { id: true, name: true, googlePlaceId: true },
      orderBy: { name: 'asc' },
      ...(options.limit ? { take: options.limit } : {}),
    })

    console.log(`Found ${churches.length} churches to enrich`)
    console.log('')

    let updated = 0
    let noRating = 0
    let errors = 0

    for (let i = 0; i < churches.length; i++) {
      const church = churches[i]

      try {
        const place = await placesClient.getPlaceDetails(church.googlePlaceId!)

        if (!place) {
          console.log(`  [not found] ${church.name}`)
          errors++
          continue
        }

        if (place.rating == null) {
          console.log(`  [no rating] ${church.name}`)
          noRating++
          continue
        }

        const googleRating = new Prisma.Decimal(place.rating.toFixed(2))
        const googleReviewCount = place.userRatingCount ?? null

        console.log(
          `  [${options.dryRun ? 'dry' : 'updated'}] ${church.name} — ${place.rating}★ (${googleReviewCount ?? '?'} reviews)`,
        )

        if (!options.dryRun) {
          await prisma.church.update({
            where: { id: church.id },
            data: { googleRating, googleReviewCount },
          })
        }

        updated++
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`  [error] ${church.name}: ${message}`)
        errors++
      }

      // Progress every 25
      if ((i + 1) % 25 === 0) {
        console.log(`  --- Progress: ${i + 1}/${churches.length} ---`)
      }
    }

    console.log('')
    console.log('=== Enrich Summary ===')
    console.log(`Churches processed: ${churches.length}`)
    console.log(`Updated with rating: ${updated}`)
    console.log(`No Google rating:    ${noRating}`)
    console.log(`Errors:              ${errors}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Enrich pipeline failed:', error)
  process.exitCode = 1
})
