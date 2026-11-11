/**
 * Church Details Enrichment Pipeline
 *
 * Fills in fields that the Google Places API doesn't provide by using
 * heuristics derived from each church's name, zip code, and existing data:
 *
 *  1. Listing quality — hides non-churches (offices, schools, cemeteries)
 *     and duplicate listings; never un-hides a manually hidden listing
 *  2. Denomination & denomination family — name, website and stored label
 *  3. Neighborhood — zip code lookup against an SA metro mapping
 *  4. Languages — inferred from name, denomination, and zip demographics
 *  5. Cover image — first photo from the ChurchPhoto table (by displayOrder)
 *  6. Service times — deletes auto-imported rows that are office hours or
 *     other import artifacts (hand-entered rows are never touched)
 *
 * This script is safe to run multiple times. By default it only fills in
 * fields that are currently null/empty.
 *
 * Usage:
 *   npx tsx src/scripts/enrich-details/index.ts [flags]
 *
 * Flags:
 *   --dry-run                    Show what would change without writing
 *   --overwrite                  Re-derive all fields,
 *                                overwriting existing values
 *   --remap-neighborhoods        Re-derive ONLY the neighborhood (use after
 *                                neighborhood map changes)
 *   --reclassify-denominations   Re-derive ONLY denomination fields (use
 *                                after classifier rule changes). Also clears
 *                                labels the classifier no longer supports.
 *   --limit N                    Only process the first N churches
 *   --verbose                    Print per-church details even when nothing changed
 *
 * No external API calls required — runs entirely against the local database.
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

import { resolveDenomination } from './denomination-classifier.js'
import { inferLanguages } from './language-inferrer.js'
import { detectNonChurch, findDuplicates, isJunkDescription } from './listing-quality.js'
import { getNeighborhood } from './neighborhood-mapper.js'
import { isPlausiblePersonName } from '../enrich-website-v2/service-evidence.js'
import { findServiceArtifacts } from './service-cleaner.js'

dotenv.config()

interface EnrichOptions {
  dryRun: boolean
  overwrite: boolean
  reclassifyDenominations: boolean
  remapNeighborhoods: boolean
  limit: number | null
  verbose: boolean
}

interface EnrichStats {
  totalProcessed: number
  hiddenSet: number
  denominationSet: number
  neighborhoodSet: number
  languagesSet: number
  coverImageSet: number
  serviceRowsRemoved: number
  skippedNoChange: number
  errors: number
}

function parseArgs(): EnrichOptions {
  const args = process.argv.slice(2)
  const limitIndex = args.indexOf('--limit')

  return {
    dryRun: args.includes('--dry-run'),
    overwrite: args.includes('--overwrite'),
    reclassifyDenominations: args.includes('--reclassify-denominations'),
    remapNeighborhoods: args.includes('--remap-neighborhoods'),
    limit: limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null,
    verbose: args.includes('--verbose'),
  }
}

function createEmptyStats(): EnrichStats {
  return {
    totalProcessed: 0,
    hiddenSet: 0,
    denominationSet: 0,
    neighborhoodSet: 0,
    languagesSet: 0,
    coverImageSet: 0,
    serviceRowsRemoved: 0,
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
        city: true,
        website: true,
        phone: true,
        description: true,
        pastorName: true,
        latitude: true,
        longitude: true,
        googleReviewCount: true,
        isHidden: true,
        hiddenReason: true,
        _count: { select: { photos: true, services: true } },
        services: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            serviceType: true,
            language: true,
            description: true,
            isAutoImported: true,
          },
        },
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

    // Duplicates are judged across the whole table, so compute them up front.
    // Listings already hidden for another reason can't be the record we keep.
    const duplicateOf = findDuplicates(
      churches
        .filter((c) => !c.isHidden || c.hiddenReason === 'duplicate')
        .filter((c) => !detectNonChurch(c.name))
        .map((c) => ({
          id: c.id,
          name: c.name,
          latitude: Number(c.latitude),
          longitude: Number(c.longitude),
          completeness:
            c._count.photos * 2 +
            c._count.services * 3 +
            (c.description ? 5 : 0) +
            (c.website ? 5 : 0) +
            (c.phone ? 3 : 0) +
            Math.min(c.googleReviewCount ?? 0, 50) / 10,
        })),
    )

    for (const church of churches) {
      stats.totalProcessed++

      try {
        const updates: Record<string, unknown> = {}

        const allowOverwrite = options.overwrite
        const allowReclassify = options.overwrite || options.reclassifyDenominations

        // ── 1. Listing quality ──
        // A manual hide is a human decision; the pipeline never reverses it.
        if (church.hiddenReason !== 'manual') {
          const hiddenReason =
            detectNonChurch(church.name) ?? (duplicateOf.has(church.id) ? 'duplicate' : null)
          if ((hiddenReason !== null) !== church.isHidden) updates.isHidden = hiddenReason !== null
          if (hiddenReason !== church.hiddenReason) updates.hiddenReason = hiddenReason
        }

        // A description that is only a page title or a social-media placeholder
        // is worse than none: the profile shows it as "About this church".
        if (church.description && isJunkDescription(church.description, church.name)) {
          updates.description = null
        }

        // "Led by and of the Son": a scraped phrase is not a pastor's name.
        if (church.pastorName && !isPlausiblePersonName(church.pastorName)) {
          updates.pastorName = null
        }

        // ── 2. Denomination ──
        const shouldSetDenom =
          allowReclassify || (!church.denomination && !church.denominationFamily)
        if (shouldSetDenom) {
          const result = resolveDenomination(church)
          // Only a reclassify may clear a label; a fill-in run never removes one.
          if (result || allowReclassify) {
            const denomination = result?.denomination ?? null
            const denominationFamily = result?.denominationFamily ?? null
            if (denomination !== church.denomination) updates.denomination = denomination
            if (denominationFamily !== church.denominationFamily) {
              updates.denominationFamily = denominationFamily
            }
          }
        }

        // ── 3. Neighborhood ──
        const shouldSetNeighborhood =
          allowOverwrite || options.remapNeighborhoods || !church.neighborhood
        if (shouldSetNeighborhood && church.zipCode) {
          const neighborhood = getNeighborhood(church.zipCode, church.city)
          if (neighborhood && neighborhood !== church.neighborhood) {
            updates.neighborhood = neighborhood
          }
        }

        // ── 4. Languages ──
        const shouldSetLanguages =
          allowOverwrite || !church.languages || church.languages.length === 0
        if (shouldSetLanguages) {
          // Use the denomination we just derived (or existing one)
          const denom =
            'denomination' in updates
              ? (updates.denomination as string | null)
              : church.denomination
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

        // ── 5. Cover image ──
        const shouldSetCoverImage = allowOverwrite || !church.coverImageUrl
        if (shouldSetCoverImage && church.photos.length > 0) {
          const firstPhoto = church.photos[0].url
          if (firstPhoto !== church.coverImageUrl) {
            updates.coverImageUrl = firstPhoto
          }
        }

        // ── 6. Service-time artifacts ──
        // Judged against the full schedule, but only auto-imported rows are
        // ever deleted.
        const artifacts = findServiceArtifacts(church.services)
        const artifactIds = church.services
          .filter((service) => service.isAutoImported && artifacts.has(service.id))
          .map((service) => service.id)
        if (artifactIds.length > 0) {
          stats.serviceRowsRemoved += artifactIds.length
          if (options.dryRun) {
            console.log(
              `  [would remove] ${church.name} → ${artifactIds.length} service artifact(s)`,
            )
          } else {
            await prisma.churchService.deleteMany({ where: { id: { in: artifactIds } } })
            console.log(`  [removed] ${church.name} → ${artifactIds.length} service artifact(s)`)
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
        if ('isHidden' in updates || 'hiddenReason' in updates) stats.hiddenSet++
        if ('denomination' in updates || 'denominationFamily' in updates) stats.denominationSet++
        if (updates.neighborhood) stats.neighborhoodSet++
        if (updates.languages) stats.languagesSet++
        if (updates.coverImageUrl) stats.coverImageSet++

        const changeList = changeKeys.join(', ')

        if (options.dryRun) {
          console.log(`  [would update] ${church.name} → ${changeList}`)
          if ('hiddenReason' in updates) {
            console.log(`    hidden: ${updates.hiddenReason ?? 'no (restored)'}`)
          }
          if ('denomination' in updates || 'denominationFamily' in updates) {
            const denom = 'denomination' in updates ? updates.denomination : church.denomination
            const family =
              'denominationFamily' in updates
                ? updates.denominationFamily
                : church.denominationFamily
            console.log(
              `    denomination: ${church.denomination ?? '—'} (${church.denominationFamily ?? '—'}) → ${denom ?? '—'} (${family ?? '—'})`,
            )
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
  console.log(`Hidden flag ${verb} changed: ${stats.hiddenSet}`)
  console.log(`Denomination ${verb} set:  ${stats.denominationSet}`)
  console.log(`Neighborhood ${verb} set:  ${stats.neighborhoodSet}`)
  console.log(`Languages ${verb} set:     ${stats.languagesSet}`)
  console.log(`Cover image ${verb} set:   ${stats.coverImageSet}`)
  console.log(`Service artifacts ${verb} removed: ${stats.serviceRowsRemoved}`)
  console.log(`Skipped (no change):      ${stats.skippedNoChange}`)
  console.log(`Errors:                   ${stats.errors}`)
}

main().catch((error) => {
  console.error('Enrichment pipeline failed:', error)
  process.exitCode = 1
})
