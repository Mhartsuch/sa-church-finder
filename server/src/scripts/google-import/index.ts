/**
 * Google Maps Church Import Pipeline
 *
 * Imports churches from the Google Places API (New) into the SA Church Finder database.
 * Downloads photos and uploads them to Supabase Storage.
 *
 * Usage:
 *   npx tsx src/scripts/google-import/index.ts [flags]
 *
 * Flags:
 *   --dry-run         Search Google but don't write to the database
 *   --skip-photos     Import church data only, skip photo downloads
 *   --limit N         Only process the first N unique churches
 *   --max-photos N    Max photos per church (default: 5)
 *   --enrich-only     Skip grid search; re-fetch details for all existing
 *                     churches with a googlePlaceId to back-fill new fields
 *
 * Required environment variables:
 *   GOOGLE_PLACES_API_KEY or MAPS_API_KEY
 *   SUPABASE_URL          (for photo uploads)
 *   SUPABASE_SERVICE_ROLE_KEY (for photo uploads)
 */

/* eslint-disable no-console */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

import {
  deriveAmenities,
  deriveServiceTimes,
  mapPlaceToCreateData,
  mapPlaceToUpdateData,
  mergeAmenities,
} from './church-mapper.js'
import { GooglePlacesClient } from './google-places-client.js'
import { generateSAMetroGrid, SEARCH_RADIUS_METERS } from './grid-generator.js'
import { processPhotosForChurch } from './photo-pipeline.js'
import { SupabaseStorageClient } from './supabase-storage-client.js'
import { createEmptyStats } from './types.js'
import type { GooglePlaceResult, ImportOptions } from './types.js'

dotenv.config()

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2)

  const limitIndex = args.indexOf('--limit')
  const maxPhotosIndex = args.indexOf('--max-photos')

  return {
    dryRun: args.includes('--dry-run'),
    skipPhotos: args.includes('--skip-photos'),
    enrichOnly: args.includes('--enrich-only'),
    limit: limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null,
    maxPhotosPerChurch: maxPhotosIndex !== -1 ? parseInt(args[maxPhotosIndex + 1], 10) : 5,
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

/**
 * Upsert auto-imported service times for a church.
 * Deletes existing auto-imported services, then creates new ones from Google hours.
 * Hand-curated services (isAutoImported=false) are preserved.
 */
async function upsertAutoImportedServices(
  prisma: PrismaClient,
  churchId: string,
  place: GooglePlaceResult,
  stats: ReturnType<typeof createEmptyStats>,
): Promise<void> {
  const derivedServices = deriveServiceTimes(place)
  if (derivedServices.length === 0) return

  // Delete old auto-imported services for this church
  await prisma.churchService.deleteMany({
    where: { churchId, isAutoImported: true },
  })

  // Create new ones
  await prisma.churchService.createMany({
    data: derivedServices.map((s) => ({
      churchId,
      ...s,
    })),
  })

  stats.servicesCreated += derivedServices.length
}

async function runEnrichOnly(
  prisma: PrismaClient,
  placesClient: GooglePlacesClient,
  storageClient: SupabaseStorageClient | null,
  options: ImportOptions,
): Promise<void> {
  const stats = createEmptyStats()

  // Find all churches with a googlePlaceId
  const churches = await prisma.church.findMany({
    where: { googlePlaceId: { not: null } },
    select: {
      id: true,
      googlePlaceId: true,
      name: true,
      description: true,
      amenities: true,
    },
    take: options.limit ?? undefined,
    orderBy: { name: 'asc' },
  })

  console.log(`Found ${churches.length} churches with Google Place IDs to enrich`)

  for (let i = 0; i < churches.length; i++) {
    const church = churches[i]
    const placeId = church.googlePlaceId as string

    try {
      const place = await placesClient.getPlaceDetails(placeId)
      if (!place) {
        console.log(`  [not found] ${church.name} (${placeId})`)
        stats.errors++
        continue
      }

      // Build update data, preserving existing description if set
      const updateData = mapPlaceToUpdateData(place)

      // Merge amenities (union of existing + derived)
      const derivedAmenities = deriveAmenities(place)
      const mergedAmenities = mergeAmenities(church.amenities, derivedAmenities)

      // Only set description if current one is null/empty
      const descriptionUpdate =
        !church.description && place.editorialSummary?.text
          ? { description: place.editorialSummary.text }
          : {}

      await prisma.church.update({
        where: { id: church.id },
        data: {
          ...updateData,
          ...descriptionUpdate,
          amenities: mergedAmenities,
        },
      })

      // Upsert auto-imported services
      await upsertAutoImportedServices(prisma, church.id, place, stats)

      // Photos
      if (!options.skipPhotos && storageClient) {
        await processPhotosForChurch(
          prisma,
          placesClient,
          storageClient,
          church.id,
          place,
          options.maxPhotosPerChurch,
          stats,
        )
      }

      stats.churchesUpdated++
      console.log(`  [enriched] ${church.name}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`  [error] ${church.name}: ${message}`)
      stats.errors++
    }

    if ((i + 1) % 25 === 0) {
      console.log(`  --- Progress: ${i + 1}/${churches.length} ---`)
    }
  }

  printStats(stats)
}

async function main(): Promise<void> {
  const options = parseArgs()
  const prisma = new PrismaClient()

  try {
    console.log('=== Google Maps Church Import Pipeline ===')
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : options.enrichOnly ? 'ENRICH ONLY' : 'LIVE'}`)
    console.log(
      `Photos: ${options.skipPhotos ? 'SKIPPED' : `up to ${options.maxPhotosPerChurch} per church`}`,
    )
    if (options.limit) console.log(`Limit: ${options.limit} churches`)
    console.log('')

    // Validate env vars
    const apiKey = getRequiredEnv('GOOGLE_PLACES_API_KEY', 'MAPS_API_KEY')
    const placesClient = new GooglePlacesClient(apiKey)

    let storageClient: SupabaseStorageClient | null = null
    if (!options.skipPhotos) {
      const supabaseUrl = getRequiredEnv('SUPABASE_URL')
      const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
      storageClient = new SupabaseStorageClient(supabaseUrl, serviceRoleKey)
    }

    // Enrich-only mode: skip grid search, re-fetch details for existing churches
    if (options.enrichOnly) {
      await runEnrichOnly(prisma, placesClient, storageClient, options)
      return
    }

    // Phase 1: Grid search
    const grid = generateSAMetroGrid()
    console.log(`Grid: ${grid.length} search cells covering San Antonio metro`)

    const allPlaces = new Map<string, GooglePlaceResult>()
    const stats = createEmptyStats()

    for (let i = 0; i < grid.length; i++) {
      const point = grid[i]
      stats.gridCellsSearched++

      try {
        const results = await placesClient.searchNearbyChurches(
          point.latitude,
          point.longitude,
          SEARCH_RADIUS_METERS,
        )

        for (const place of results) {
          if (!allPlaces.has(place.id)) {
            allPlaces.set(place.id, place)
          }
          stats.totalPlacesFound++
        }

        // Progress update every 10 cells
        if ((i + 1) % 10 === 0 || i === grid.length - 1) {
          console.log(
            `  Searched ${i + 1}/${grid.length} cells — ${allPlaces.size} unique churches found`,
          )
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(
          `  Error searching cell ${i + 1} (${point.latitude}, ${point.longitude}): ${message}`,
        )
        stats.errors++
      }
    }

    stats.uniquePlaces = allPlaces.size
    console.log('')
    console.log(
      `Search complete: ${stats.uniquePlaces} unique churches found across ${stats.gridCellsSearched} grid cells`,
    )
    console.log(`(${stats.totalPlacesFound} total results before deduplication)`)
    console.log('')

    if (options.dryRun) {
      console.log('=== DRY RUN — No database writes ===')
      const sorted = [...allPlaces.values()].sort((a, b) =>
        a.displayName.text.localeCompare(b.displayName.text),
      )
      const toShow = options.limit ? sorted.slice(0, options.limit) : sorted
      for (const place of toShow) {
        const status = place.businessStatus ?? 'unknown'
        console.log(`  ${place.displayName.text} — ${place.formattedAddress} [${status}]`)
      }
      printStats(stats)
      return
    }

    // Phase 2: Upsert churches
    const places = [...allPlaces.values()].sort((a, b) =>
      a.displayName.text.localeCompare(b.displayName.text),
    )
    const toProcess = options.limit ? places.slice(0, options.limit) : places

    console.log(`Processing ${toProcess.length} churches...`)

    for (let i = 0; i < toProcess.length; i++) {
      const place = toProcess[i]

      // Skip permanently closed churches on create
      if (place.businessStatus === 'CLOSED_PERMANENTLY') {
        console.log(`  [skipped] ${place.displayName.text} — permanently closed`)
        stats.churchesSkipped++
        continue
      }

      try {
        const existing = await prisma.church.findFirst({
          where: { googlePlaceId: place.id },
          select: { id: true, description: true, amenities: true },
        })

        let churchId: string

        if (existing) {
          // Update — only Google-sourced fields, preserve curated data
          const updateData = mapPlaceToUpdateData(place)

          // Merge amenities
          const derivedAmenities = deriveAmenities(place)
          const mergedAmenities = mergeAmenities(existing.amenities, derivedAmenities)

          // Only set description if current one is null/empty
          const descriptionUpdate =
            !existing.description && place.editorialSummary?.text
              ? { description: place.editorialSummary.text }
              : {}

          await prisma.church.update({
            where: { id: existing.id },
            data: {
              ...updateData,
              ...descriptionUpdate,
              amenities: mergedAmenities,
            },
          })
          churchId = existing.id
          stats.churchesUpdated++
          console.log(`  [updated] ${place.displayName.text}`)
        } else {
          // Create new church
          const createData = await mapPlaceToCreateData(prisma, place)
          const church = await prisma.church.create({ data: createData })
          churchId = church.id
          stats.churchesCreated++
          console.log(`  [created] ${place.displayName.text}`)
        }

        // Upsert auto-imported services
        await upsertAutoImportedServices(prisma, churchId, place, stats)

        // Phase 3: Photos
        if (!options.skipPhotos && storageClient) {
          await processPhotosForChurch(
            prisma,
            placesClient,
            storageClient,
            churchId,
            place,
            options.maxPhotosPerChurch,
            stats,
          )
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`  [error] ${place.displayName.text}: ${message}`)
        stats.errors++
      }

      // Progress update every 25 churches
      if ((i + 1) % 25 === 0) {
        console.log(`  --- Progress: ${i + 1}/${toProcess.length} ---`)
      }
    }

    printStats(stats)
  } finally {
    await prisma.$disconnect()
  }
}

function printStats(stats: ReturnType<typeof createEmptyStats>): void {
  console.log('')
  console.log('=== Import Summary ===')
  console.log(`Grid cells searched:  ${stats.gridCellsSearched}`)
  console.log(`Total results:        ${stats.totalPlacesFound}`)
  console.log(`Unique churches:      ${stats.uniquePlaces}`)
  console.log(`Churches created:     ${stats.churchesCreated}`)
  console.log(`Churches updated:     ${stats.churchesUpdated}`)
  console.log(`Churches skipped:     ${stats.churchesSkipped}`)
  console.log(`Services created:     ${stats.servicesCreated}`)
  console.log(`Photos uploaded:      ${stats.photosUploaded}`)
  console.log(`Photos skipped:       ${stats.photosSkipped}`)
  console.log(`Errors:               ${stats.errors}`)
}

main().catch((error) => {
  console.error('Import pipeline failed:', error)
  process.exitCode = 1
})
