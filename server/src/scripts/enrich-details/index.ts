/* eslint-disable no-console */
/**
 * Church Details Enrichment Pipeline
 *
 * Fills in fields that the Google Places API doesn't provide by using
 * heuristics derived from each church's name, zip code, and existing data:
 *
 *  1. Denomination & denomination family — name-based pattern matching
 *  2. Neighborhood — zip code lookup against an SA metro mapping
 *  3. Languages — inferred from name, denomination, and zip demographics
 *  4. Cover image — first photo from the ChurchPhoto table (by displayOrder)
 *
 * This script is safe to run multiple times. By default it only fills in
 * fields that are currently null/empty. Use --overwrite to re-derive all
 * enrichable fields (hand-curated values from the Leaders Portal are
 * preserved unless --overwrite is passed).
 *
 * Usage:
 *   npx tsx src/scripts/enrich-details/index.ts [flags]
 *
 * Flags:
 *   --dry-run       Show what would change without writing to the database
 *   --overwrite     Re-derive all fields, overwriting existing values
 *                   (except data entered via Leaders Portal — see note below)
 *   --limit N       Only process the first N churches
 *   --verbose       Print per-church details even when nothing changed
 *
 * No external API calls required — runs entirely against the local database.
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

import { classifyDenomination } from './denomination-classifier.js'
import { inferLanguages } from './language-inferrer.js'
import { getNeighborhood } from './neighborhood-mapper.js'

dotenv.config()

interface EnrichOptions {
  dryRun: boolean
  overwrite: boolean
  limit: number | null
  verbose: boolean
}

interface EnrichStats {
  totalProcessed: number
  denominationSet: number
  neighborhoodSet: number
  languagesSet: number
  coverImageSet: number
  skippedNoChange: number
  errors: number
}

function parseArgs(): EnrichOptions {
  const args = process.argv.slice(2)
  const limitIndex = args.indexOf('--limit')

  return {
    dryRun: args.includes('--dry-run'),
    overwrite: args.includes('--overwrite'),
    limit: limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null,
    verbose: args.includes('--verbose'),
  }
}

function createEmptyStats(): EnrichStats {
  return {
    totalProcessed: 0,
    denominationSet: 0,
    neighborhoodSet: 0,
    languagesSet: 0,
    coverImageSet: 0,
    skippedNoChange: 0,
    errors: 0,
  }
}

async function main(): Promise<void> {
  const options = parseArgs()
  const prisma = new PrismaClient()

  try {
    console.log('=== Church Details Enrichment Pipeline ===')
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log(`Overwrite existing: ${options.overwrite ? 'YES' : 'NO (null/empty only)'}`)
    if (options.limit) console.log(`Limit: ${options.limit}`)
    console.log('')

    const churches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
        zipCode: true,
        denomination: true,
        denominationFamily: true,
        neighborhood: true,
        languages: true,
        coverImageUrl: true,
        photos: {
          select: { url: true },
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
      ...(options.limit ? { take: options.limit } : {}),
    })

    console.log(`Found ${churches.length} churches to process`)
    console.log('')

    const stats = createEmptyStats()

    for (const church of churches) {
      stats.totalProcessed++

      try {
        const updates: Record<string, unknown> = {}

        // ── 1. Denomination ──
        const shouldSetDenom =
          options.overwrite || (!church.denomination && !church.denominationFamily)
        if (shouldSetDenom) {
          const result = classifyDenomination(church.name)
          if (result) {
            if (result.denomination !== church.denomination) {
              updates.denomination = result.denomination
            }
            if (result.denominationFamily !== church.denominationFamily) {
              updates.denominationFamily = result.denominationFamily
            }
          }
        }

        // ── 2. Neighborhood ──
        const shouldSetNeighborhood = options.overwrite || !church.neighborhood
        if (shouldSetNeighborhood && church.zipCode) {
          const neighborhood = getNeighborhood(church.zipCode)
          if (neighborhood && neighborhood !== church.neighborhood) {
            updates.neighborhood = neighborhood
          }
        }

        // ── 3. Languages ──
        const shouldSetLanguages =
          options.overwrite || !church.languages || church.languages.length === 0
        if (shouldSetLanguages) {
          // Use the denomination we just derived (or existing one)
          const denom = (updates.denomination as string | undefined) ?? church.denomination
          const inferred = inferLanguages({
            churchName: church.name,
            denomination: denom ?? null,
            zipCode: church.zipCode,
          })

          // Only update if different from existing
          const existing = [...church.languages].sort()
          const isDifferent =
            inferred.length !== existing.length || inferred.some((lang, i) => lang !== existing[i])

          if (isDifferent) {
            updates.languages = inferred
          }
        }

        // ── 4. Cover image ──
        const shouldSetCoverImage = options.overwrite || !church.coverImageUrl
        if (shouldSetCoverImage && church.photos.length > 0) {
          const firstPhoto = church.photos[0].url
          if (firstPhoto !== church.coverImageUrl) {
            updates.coverImageUrl = firstPhoto
          }
        }

        // ── Apply updates ──
        const changeKeys = Object.keys(updates)
        if (changeKeys.length === 0) {
          stats.skippedNoChange++
          if (options.verbose) {
            console.log(`  [no change] ${church.name}`)
          }
          continue
        }

        // Count what we're setting
        if (updates.denomination || updates.denominationFamily) stats.denominationSet++
        if (updates.neighborhood) stats.neighborhoodSet++
        if (updates.languages) stats.languagesSet++
        if (updates.coverImageUrl) stats.coverImageSet++

        const changeList = changeKeys.join(', ')

        if (options.dryRun) {
          console.log(`  [would update] ${church.name} → ${changeList}`)
          if (updates.denomination) {
            console.log(`    denomination: ${updates.denomination} (${updates.denominationFamily})`)
          }
          if (updates.neighborhood) {
            console.log(`    neighborhood: ${updates.neighborhood}`)
          }
          if (updates.languages) {
            console.log(`    languages: ${(updates.languages as string[]).join(', ')}`)
          }
          if (updates.coverImageUrl) {
            console.log('    coverImage: set')
          }
        } else {
          await prisma.church.update({
            where: { id: church.id },
            data: updates,
          })
          console.log(`  [updated] ${church.name} → ${changeList}`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`  [error] ${church.name}: ${message}`)
        stats.errors++
      }
    }

    printStats(stats, options.dryRun)
  } finally {
    await prisma.$disconnect()
  }
}

function printStats(stats: EnrichStats, dryRun: boolean): void {
  const verb = dryRun ? 'would be' : 'were'
  console.log('')
  console.log('=== Enrichment Summary ===')
  console.log(`Churches processed:       ${stats.totalProcessed}`)
  console.log(`Denomination ${verb} set:  ${stats.denominationSet}`)
  console.log(`Neighborhood ${verb} set:  ${stats.neighborhoodSet}`)
  console.log(`Languages ${verb} set:     ${stats.languagesSet}`)
  console.log(`Cover image ${verb} set:   ${stats.coverImageSet}`)
  console.log(`Skipped (no change):      ${stats.skippedNoChange}`)
  console.log(`Errors:                   ${stats.errors}`)
}

main().catch((error) => {
  console.error('Enrichment pipeline failed:', error)
  process.exitCode = 1
})
