/**
 * Church Data Pipeline Orchestrator
 *
 * Runs the four ingestion/enrichment stages in the correct order with one
 * command, then cleans up stale auto-imported events:
 *
 *   1. google-import      — discover churches via Google Places grid search
 *   2. google-enrich      — refresh googleRating / googleReviewCount
 *   3. enrich-website-v2  — crawl church websites, extract details
 *   4. enrich-details     — denomination/neighborhood/language heuristics
 *   5. cleanup            — delete auto-imported events that ended > 1 day ago
 *
 * Each stage is its own process, so a crash in one stage can't corrupt
 * another and every stage keeps its own resumability semantics
 * (enrich-website-v2 resumes from enrichment_states automatically).
 *
 * Usage:
 *   npx tsx src/scripts/pipeline/run.ts [flags]
 *
 * Flags:
 *   --dry-run        Pass --dry-run to every stage; cleanup is skipped
 *   --limit N        Pass --limit N to every stage
 *   --stale-days N   Refresh website enrichment older than N days (default 90)
 *   --skip-import    Skip stage 1 (no Google Places quota spent on discovery)
 *   --skip-ratings   Skip stage 2
 *   --skip-websites  Skip stage 3 (no Claude CLI required)
 *   --skip-details   Skip stage 4
 *   --continue       Keep going when a stage exits non-zero (default: stop)
 *
 * Stage-specific behavior:
 *   - Stage 2 runs with --all so existing ratings refresh, not just NULLs.
 *   - Stage 3 runs with --retry-failed and --stale-days so failed and stale
 *     churches get another pass. Low-confidence extractions park as
 *     needs_review in enrichment_states for human inspection.
 *   - Stage 4 runs in default fill-null mode (claimed churches are never
 *     overwritten by any stage).
 */

import { PrismaClient } from '@prisma/client'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config()

const SCRIPTS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

interface PipelineOptions {
  dryRun: boolean
  limit: number | null
  staleDays: number
  skipImport: boolean
  skipRatings: boolean
  skipWebsites: boolean
  skipDetails: boolean
  continueOnError: boolean
}

function parseArgs(): PipelineOptions {
  const args = process.argv.slice(2)
  const limitIdx = args.indexOf('--limit')
  const staleDaysIdx = args.indexOf('--stale-days')

  return {
    dryRun: args.includes('--dry-run'),
    limit: limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : null,
    staleDays: staleDaysIdx !== -1 ? parseInt(args[staleDaysIdx + 1], 10) : 90,
    skipImport: args.includes('--skip-import'),
    skipRatings: args.includes('--skip-ratings'),
    skipWebsites: args.includes('--skip-websites'),
    skipDetails: args.includes('--skip-details'),
    continueOnError: args.includes('--continue'),
  }
}

interface Stage {
  name: string
  script: string
  extraArgs: string[]
  skipped: boolean
}

interface StageResult {
  name: string
  status: 'ok' | 'failed' | 'skipped'
  durationMs: number
}

function runStage(stage: Stage, options: PipelineOptions): StageResult {
  if (stage.skipped) {
    console.log(`\n━━━ ${stage.name} — SKIPPED ━━━`)
    return { name: stage.name, status: 'skipped', durationMs: 0 }
  }

  const args = ['tsx', path.join(SCRIPTS_ROOT, stage.script), ...stage.extraArgs]
  if (options.dryRun) args.push('--dry-run')
  if (options.limit !== null) args.push('--limit', String(options.limit))

  console.log(`\n━━━ ${stage.name} ━━━`)
  console.log(`$ npx ${args.join(' ')}`)

  const started = Date.now()
  const result = spawnSync('npx', args, { stdio: 'inherit', shell: false })
  const durationMs = Date.now() - started

  const ok = result.status === 0
  console.log(
    `━━━ ${stage.name} ${ok ? 'completed' : `FAILED (exit ${result.status ?? 'signal'})`} in ${Math.round(durationMs / 1000)}s ━━━`,
  )
  return { name: stage.name, status: ok ? 'ok' : 'failed', durationMs }
}

/**
 * Auto-imported events are replaced when their church is re-enriched, but a
 * church that never re-qualifies keeps accumulating past events. Curated
 * (non-auto-imported) events are never touched.
 */
async function cleanupStaleAutoImportedEvents(): Promise<number> {
  const prisma = new PrismaClient()
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    // Recurring series keep generating future occurrences from a past
    // startTime, so only one-off events are eligible.
    const result = await prisma.event.deleteMany({
      where: { isAutoImported: true, isRecurring: false, startTime: { lt: cutoff } },
    })
    return result.count
  } finally {
    await prisma.$disconnect()
  }
}

async function main(): Promise<void> {
  const options = parseArgs()

  console.log('=== Church Data Pipeline ===')
  console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`Website enrichment stale threshold: ${options.staleDays} days`)
  if (options.limit) console.log(`Limit per stage: ${options.limit}`)

  const stages: Stage[] = [
    {
      name: 'Stage 1/4: Google Places import',
      script: 'google-import/index.ts',
      extraArgs: [],
      skipped: options.skipImport,
    },
    {
      name: 'Stage 2/4: Google ratings refresh',
      script: 'google-enrich/index.ts',
      extraArgs: ['--all'],
      skipped: options.skipRatings,
    },
    {
      name: 'Stage 3/4: Website enrichment (v2)',
      script: 'enrich-website-v2/index.ts',
      extraArgs: ['--retry-failed', '--stale-days', String(options.staleDays)],
      skipped: options.skipWebsites,
    },
    {
      name: 'Stage 4/4: Detail heuristics',
      script: 'enrich-details/index.ts',
      extraArgs: [],
      skipped: options.skipDetails,
    },
  ]

  const results: StageResult[] = []
  for (const stage of stages) {
    const result = runStage(stage, options)
    results.push(result)
    if (result.status === 'failed' && !options.continueOnError) {
      console.error('\nStopping: stage failed (pass --continue to run remaining stages anyway).')
      break
    }
  }

  if (!options.dryRun) {
    console.log('\n━━━ Cleanup: stale auto-imported events ━━━')
    try {
      const deleted = await cleanupStaleAutoImportedEvents()
      console.log(`Deleted ${deleted} past auto-imported event(s)`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`Cleanup failed: ${message}`)
    }
  }

  console.log('\n=== Pipeline Summary ===')
  for (const r of results) {
    const duration = r.status === 'skipped' ? '' : ` (${Math.round(r.durationMs / 1000)}s)`
    console.log(`  ${r.status.toUpperCase().padEnd(7)} ${r.name}${duration}`)
  }

  if (results.some((r) => r.status === 'failed')) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('Pipeline orchestrator failed:', error)
  process.exitCode = 1
})
