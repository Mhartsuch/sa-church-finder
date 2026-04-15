/**
 * Church Website Enrichment Pipeline
 *
 * Fetches church websites and extracts structured data (service times,
 * pastor names, denomination) using a two-pass approach:
 *
 *  Pass 1 (no AI): Parse schema.org JSON-LD, microdata, and HTML patterns.
 *  Pass 2 (Claude CLI): For churches where Pass 1 found nothing, strip the
 *                        HTML to text and pipe it to `claude -p` for extraction.
 *
 * Service times are upserted with `isAutoImported: true`, preserving any
 * hand-curated services added via the Leaders Portal.
 *
 * Usage:
 *   npx tsx src/scripts/enrich-website/index.ts [flags]
 *
 * Flags:
 *   --dry-run              Show what would change without writing to the DB
 *   --limit N              Only process the first N churches
 *   --verbose              Print details for every church, even when unchanged
 *   --skip-ai              Only run Pass 1 (no Claude CLI calls)
 *   --ai-only              Only run Pass 2 on churches lacking enriched data
 *   --overwrite            Re-derive fields even if already set
 *                          (hand-curated services via Leaders Portal are preserved)
 *   --force-low-confidence Apply results even when confidence < 0.5
 *
 * Requires:
 *   - Network access to fetch church websites
 *   - `claude` CLI on PATH for Pass 2 (unless --skip-ai)
 */

import { PrismaClient } from '@prisma/client'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import dotenv from 'dotenv'

import { extractWithClaude } from './claude-extractor.js'
import { parseStructuredData } from './html-parser.js'
import type { EnrichStats, EnrichWebsiteOptions, ExtractedChurchData } from './types.js'
import { createEmptyStats } from './types.js'
import { fetchChurchWebsite } from './website-fetcher.js'

dotenv.config()

const execFileAsync = promisify(execFile)

// ── CLI arg parsing ──────────────────────────────────────────────

function parseArgs(): EnrichWebsiteOptions {
  const args = process.argv.slice(2)
  const limitIndex = args.indexOf('--limit')

  return {
    dryRun: args.includes('--dry-run'),
    limit: limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null,
    verbose: args.includes('--verbose'),
    skipAi: args.includes('--skip-ai'),
    aiOnly: args.includes('--ai-only'),
    overwrite: args.includes('--overwrite'),
    forceLowConfidence: args.includes('--force-low-confidence'),
  }
}

// ── Claude CLI availability check ────────────────────────────────

async function isClaudeAvailable(): Promise<boolean> {
  try {
    await execFileAsync('claude', ['--version'], { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

// ── Determine if a church needs enrichment ───────────────────────

interface ChurchRow {
  id: string
  name: string
  website: string | null
  pastorName: string | null
  denomination: string | null
  denominationFamily: string | null
  yearEstablished: number | null
  services: { id: string; isAutoImported: boolean }[]
}

function needsEnrichment(church: ChurchRow, overwrite: boolean): boolean {
  if (overwrite) return true
  // Consider enriched if it has a pastor name or auto-imported services
  const hasAutoServices = church.services.some((s) => s.isAutoImported)
  return !church.pastorName && !hasAutoServices
}

// ── Apply extracted data to the database ─────────────────────────

async function applyExtraction(
  prisma: PrismaClient,
  church: ChurchRow,
  extracted: ExtractedChurchData,
  options: EnrichWebsiteOptions,
  stats: EnrichStats,
): Promise<string[]> {
  const changes: string[] = []

  // ── Church field updates ──
  const updates: Record<string, unknown> = {}

  if ((options.overwrite || !church.pastorName) && extracted.pastorName) {
    updates.pastorName = extracted.pastorName
    changes.push(`pastorName="${extracted.pastorName}"`)
  }
  if ((options.overwrite || !church.denomination) && extracted.denomination) {
    updates.denomination = extracted.denomination
    if (extracted.denominationFamily) {
      updates.denominationFamily = extracted.denominationFamily
    }
    changes.push(`denomination="${extracted.denomination}"`)
  }
  if ((options.overwrite || !church.yearEstablished) && extracted.yearEstablished) {
    updates.yearEstablished = extracted.yearEstablished
    changes.push(`yearEstablished=${extracted.yearEstablished}`)
  }

  if (Object.keys(updates).length > 0) {
    if (!options.dryRun) {
      await prisma.church.update({
        where: { id: church.id },
        data: updates,
      })
    }
    stats.fieldsUpdated += Object.keys(updates).length
  }

  // ── Service time upsert ──
  if (extracted.services.length > 0) {
    if (!options.dryRun) {
      // Delete old auto-imported services
      await prisma.churchService.deleteMany({
        where: { churchId: church.id, isAutoImported: true },
      })

      // Create new ones
      await prisma.churchService.createMany({
        data: extracted.services.map((s) => ({
          churchId: church.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          serviceType: s.serviceType,
          language: s.language,
          isAutoImported: true,
        })),
      })
    }

    stats.servicesCreated += extracted.services.length
    changes.push(`${extracted.services.length} service(s)`)
  }

  return changes
}

// ── Main pipeline ────────────────────────────────────────────────

interface FlaggedChurch {
  name: string
  confidence: number
  source: string
  servicesFound: number
}

async function main(): Promise<void> {
  const options = parseArgs()
  const prisma = new PrismaClient()

  try {
    console.log('=== Church Website Enrichment Pipeline ===')
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log(
      `Passes: ${options.skipAi ? 'Pass 1 only (no AI)' : options.aiOnly ? 'Pass 2 only (AI)' : 'Pass 1 + Pass 2'}`,
    )
    console.log(`Overwrite existing: ${options.overwrite ? 'YES' : 'NO (null/empty only)'}`)
    if (options.limit) console.log(`Limit: ${options.limit}`)
    console.log('')

    // Check Claude CLI availability if we'll need it
    if (!options.skipAi) {
      const claudeOk = await isClaudeAvailable()
      if (!claudeOk) {
        console.error('Error: Claude CLI not found on PATH. Install Claude Code or use --skip-ai.')
        process.exitCode = 1
        return
      }
      console.log('Claude CLI: available')
      console.log('')
    }

    // Query churches with websites
    const churches = await prisma.church.findMany({
      where: { website: { not: null } },
      select: {
        id: true,
        name: true,
        website: true,
        pastorName: true,
        denomination: true,
        denominationFamily: true,
        yearEstablished: true,
        services: {
          select: { id: true, isAutoImported: true },
        },
      },
      orderBy: { name: 'asc' },
      ...(options.limit ? { take: options.limit } : {}),
    })

    console.log(`Found ${churches.length} churches with websites`)
    console.log('')

    const stats = createEmptyStats()
    const flaggedChurches: FlaggedChurch[] = []

    for (let i = 0; i < churches.length; i++) {
      const church = churches[i] as ChurchRow
      stats.totalProcessed++

      try {
        if (!church.website) {
          stats.skippedNoWebsite++
          continue
        }

        // Check if enrichment is needed
        if (!needsEnrichment(church, options.overwrite)) {
          stats.skippedNoChange++
          if (options.verbose) {
            console.log(`  [skip] ${church.name} — already enriched`)
          }
          continue
        }

        // ── Fetch website ──
        const fetchResult = await fetchChurchWebsite(church.website)

        if (!fetchResult.ok) {
          stats.websitesFailed++
          if (options.verbose) {
            console.log(`  [fetch failed] ${church.name}: ${fetchResult.error}`)
          }
          continue
        }

        stats.websitesFetched++

        let extracted: ExtractedChurchData | null = null

        // ── Pass 1: Structured data ──
        if (!options.aiOnly) {
          extracted = parseStructuredData(fetchResult.html)
          if (extracted) {
            stats.pass1Extracted++
          }
        }

        // ── Pass 2: Claude CLI ──
        if (!extracted && !options.skipAi) {
          try {
            extracted = await extractWithClaude(fetchResult.html)
            if (extracted) {
              stats.pass2Extracted++
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            console.log(`  [ai error] ${church.name}: ${message}`)
            stats.errors++
            continue
          }
        }

        if (!extracted) {
          if (options.verbose) {
            console.log(`  [no data] ${church.name}`)
          }
          continue
        }

        // ── Confidence check ──
        if (extracted.confidenceLevel === 'low' && !options.forceLowConfidence) {
          stats.lowConfidenceFlagged++
          flaggedChurches.push({
            name: church.name,
            confidence: extracted.confidence,
            source: extracted.source,
            servicesFound: extracted.services.length,
          })
          console.log(
            `  [low confidence] ${church.name} — ${extracted.confidence.toFixed(2)} via ${extracted.source} (skipped)`,
          )
          continue
        }

        // ── Apply ──
        const changes = await applyExtraction(prisma, church, extracted, options, stats)

        if (changes.length > 0) {
          const verb = options.dryRun ? 'would update' : 'updated'
          console.log(
            `  [${verb}] ${church.name} — ${changes.join(', ')} (${extracted.source}, ${extracted.confidence.toFixed(2)})`,
          )
        } else if (options.verbose) {
          console.log(`  [no change] ${church.name}`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`  [error] ${church.name}: ${message}`)
        stats.errors++
      }

      // Progress update every 25 churches
      if ((i + 1) % 25 === 0) {
        console.log(`  --- Progress: ${i + 1}/${churches.length} ---`)
      }
    }

    printStats(stats, options.dryRun)

    if (flaggedChurches.length > 0) {
      printFlagged(flaggedChurches)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// ── Output helpers ───────────────────────────────────────────────

function printStats(stats: EnrichStats, dryRun: boolean): void {
  const verb = dryRun ? 'would be' : 'were'
  console.log('')
  console.log('=== Enrichment Summary ===')
  console.log(`Churches processed:          ${stats.totalProcessed}`)
  console.log(`Websites fetched:            ${stats.websitesFetched}`)
  console.log(`Websites failed:             ${stats.websitesFailed}`)
  console.log(`Pass 1 (structured) hits:    ${stats.pass1Extracted}`)
  console.log(`Pass 2 (Claude AI) hits:     ${stats.pass2Extracted}`)
  console.log(`Services ${verb} created:    ${stats.servicesCreated}`)
  console.log(`Fields ${verb} updated:      ${stats.fieldsUpdated}`)
  console.log(`Low confidence (flagged):    ${stats.lowConfidenceFlagged}`)
  console.log(`Skipped (no website):        ${stats.skippedNoWebsite}`)
  console.log(`Skipped (already enriched):  ${stats.skippedNoChange}`)
  console.log(`Errors:                      ${stats.errors}`)
}

function printFlagged(churches: FlaggedChurch[]): void {
  console.log('')
  console.log('=== Low Confidence — Needs Human Review ===')
  for (const c of churches) {
    console.log(
      `  ${c.name} — confidence ${c.confidence.toFixed(2)}, source: ${c.source}, services: ${c.servicesFound}`,
    )
  }
  console.log('')
  console.log('Re-run with --force-low-confidence to apply these results anyway.')
}

main().catch((error) => {
  console.error('Website enrichment pipeline failed:', error)
  process.exitCode = 1
})
