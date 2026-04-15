/* eslint-disable no-console */
/**
 * Church Website Enrichment Pipeline — v2
 *
 * Designed to run against the full church table, make incremental progress,
 * and survive interruptions (Ctrl-C, Claude CLI usage-limit errors, SSH drop).
 *
 * Improvements over v1:
 *  - Persistent per-church state in `enrichment_states` so a re-run resumes.
 *  - Disk HTML cache at `server/.enrichment-cache/v2/<churchId>/` so a resume
 *    does not re-fetch pages already seen.
 *  - Multi-page crawl: homepage + up to 5 discovered subpages (/about,
 *    /staff, /ministries, /contact, …).
 *  - Expanded extraction: description, email, phone, languages, amenities,
 *    staff list, social links — in addition to v1's pastor/denomination/
 *    year/services.
 *  - Rate-limit detection: if `claude -p` reports a usage/rate limit, state
 *    is saved and the run exits 0 so the next run resumes cleanly.
 *  - Graceful SIGINT/SIGTERM: in-flight church is marked `pending` and Prisma
 *    disconnects before exit.
 *
 * Usage:
 *   npx tsx src/scripts/enrich-website-v2/index.ts [flags]
 *
 * Flags:
 *   --dry-run              No DB writes
 *   --limit N              Only process the first N eligible churches
 *   --verbose              Log every church, not just changes
 *   --skip-ai              Only Pass 1 (no Claude calls)
 *   --ai-only              Skip Pass 1; run Claude on every page set
 *   --overwrite            Re-write DB fields even if already set
 *                          (hand-curated services are still preserved)
 *   --force-low-confidence Apply results with confidence < 0.5
 *   --retry-failed         Re-process churches whose last attempt failed
 *   --force-refetch        Ignore disk cache; fetch pages fresh
 *   --max-subpages N       Cap discovered subpages per church (default 5)
 *   --max-attempts N       Max retry attempts per church before giving up (default 3)
 *
 * Requires:
 *   - Network access to fetch church websites
 *   - `claude` CLI on PATH for Pass 2 (unless --skip-ai)
 */

import { PrismaClient } from '@prisma/client'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import dotenv from 'dotenv'

import { applyExtraction, type ChurchRow } from './applier.js'
import { extractWithClaude, RateLimitError } from './claude-extractor.js'
import { parsePages, hasAnyData, mergeData } from './html-parser.js'
import { stripPages } from './html-stripper.js'
import { discoverSubpages } from './subpage-discovery.js'
import {
  createEmptyStats,
  emptyExtracted,
  type EnrichV2Stats,
  type EnrichWebsiteV2Options,
  type ExtractedChurchData,
  type FetchedPage,
  type PageRecord,
} from './types.js'
import { fetchPage } from './website-fetcher.js'

dotenv.config()

const execFileAsync = promisify(execFile)

// ── CLI arg parsing ───────────────────────────────────────────────

function parseArgs(): EnrichWebsiteV2Options {
  const args = process.argv.slice(2)
  const limitIdx = args.indexOf('--limit')
  const maxSubpagesIdx = args.indexOf('--max-subpages')
  const maxAttemptsIdx = args.indexOf('--max-attempts')

  return {
    dryRun: args.includes('--dry-run'),
    limit: limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : null,
    verbose: args.includes('--verbose'),
    skipAi: args.includes('--skip-ai'),
    aiOnly: args.includes('--ai-only'),
    overwrite: args.includes('--overwrite'),
    forceLowConfidence: args.includes('--force-low-confidence'),
    retryFailed: args.includes('--retry-failed'),
    forceRefetch: args.includes('--force-refetch'),
    maxSubpages: maxSubpagesIdx !== -1 ? parseInt(args[maxSubpagesIdx + 1], 10) : 5,
    maxAttempts: maxAttemptsIdx !== -1 ? parseInt(args[maxAttemptsIdx + 1], 10) : 3,
  }
}

// ── Claude CLI availability ───────────────────────────────────────

async function isClaudeAvailable(): Promise<boolean> {
  try {
    await execFileAsync('claude', ['--version'], { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────

interface ShutdownContext {
  prisma: PrismaClient
  currentChurchId: string | null
  stopRequested: boolean
  reason: string | null
}

function installShutdownHandlers(ctx: ShutdownContext): void {
  const handler = (signal: NodeJS.Signals): void => {
    if (ctx.stopRequested) {
      console.log(`\n${signal} received again — forcing exit`)
      process.exit(130)
    }
    console.log(`\n${signal} received — will stop after current church (ctrl-c again to force)`)
    ctx.stopRequested = true
    ctx.reason = `stopped by ${signal}`
  }
  process.on('SIGINT', handler)
  process.on('SIGTERM', handler)
}

// ── State helpers ─────────────────────────────────────────────────

type StateStatus =
  | 'pending'
  | 'fetched'
  | 'extracted'
  | 'applied'
  | 'skipped_no_data'
  | 'failed'
  | 'rate_limited'

interface StatePatch {
  status?: StateStatus
  pagesFetched?: PageRecord[]
  extractedData?: ExtractedChurchData | null
  confidence?: number | null
  source?: string | null
  lastError?: string | null
  incrementAttempts?: boolean
  completed?: boolean
}

async function upsertState(
  prisma: PrismaClient,
  churchId: string,
  patch: StatePatch,
  options: EnrichWebsiteV2Options,
): Promise<void> {
  if (options.dryRun) return

  const data: Record<string, unknown> = {}
  if (patch.status) data.status = patch.status
  if (patch.pagesFetched) data.pagesFetched = patch.pagesFetched as unknown as object
  if (patch.extractedData !== undefined) {
    data.extractedData = patch.extractedData as unknown as object | null
  }
  if (patch.confidence !== undefined) data.confidence = patch.confidence
  if (patch.source !== undefined) data.source = patch.source
  if (patch.lastError !== undefined) data.lastError = patch.lastError
  if (patch.completed) data.completedAt = new Date()

  await prisma.enrichmentState.upsert({
    where: { churchId },
    create: {
      churchId,
      version: 'v2',
      status: patch.status ?? 'pending',
      attempts: patch.incrementAttempts ? 1 : 0,
      ...data,
    },
    update: {
      ...data,
      ...(patch.incrementAttempts ? { attempts: { increment: 1 } } : {}),
    },
  })
}

// ── Determine eligibility ─────────────────────────────────────────

function isEligible(
  state: { status: string; attempts: number } | null,
  options: EnrichWebsiteV2Options,
): boolean {
  if (!state) return true
  if (state.status === 'applied' || state.status === 'skipped_no_data') {
    return options.overwrite
  }
  if (state.status === 'failed') {
    return options.retryFailed && state.attempts < options.maxAttempts
  }
  // pending / fetched / extracted / rate_limited: always resume
  return true
}

// ── Process one church ────────────────────────────────────────────

interface ProcessResult {
  kind: 'applied' | 'no-data' | 'low-confidence' | 'failed' | 'skipped' | 'rate-limited'
  changes?: string[]
  error?: string
  extracted?: ExtractedChurchData
}

async function processChurch(
  prisma: PrismaClient,
  church: ChurchRow,
  options: EnrichWebsiteV2Options,
  stats: EnrichV2Stats,
  ctx: ShutdownContext,
): Promise<ProcessResult> {
  ctx.currentChurchId = church.id

  if (!church.website) {
    stats.skippedNoWebsite++
    return { kind: 'skipped' }
  }

  await upsertState(
    prisma,
    church.id,
    { status: 'pending', incrementAttempts: true, lastError: null },
    options,
  )

  // ── Fetch homepage ──
  const homepageResult = await fetchPage({
    churchId: church.id,
    url: church.website,
    useCache: !options.forceRefetch,
  })

  if (!homepageResult.ok) {
    stats.websitesFailed++
    await upsertState(
      prisma,
      church.id,
      { status: 'failed', lastError: `homepage: ${homepageResult.error}`, completed: true },
      options,
    )
    return { kind: 'failed', error: homepageResult.error }
  }

  stats.websitesFetched++
  const pages: FetchedPage[] = [homepageResult.page]

  // ── Discover and fetch subpages ──
  const subpageLinks = discoverSubpages(
    homepageResult.page.html,
    church.website,
    options.maxSubpages,
  )
  for (const link of subpageLinks) {
    if (ctx.stopRequested) break
    const result = await fetchPage({
      churchId: church.id,
      url: link.url,
      useCache: !options.forceRefetch,
    })
    if (result.ok) {
      pages.push(result.page)
      stats.subpagesFetched++
    }
  }

  const pageRecords: PageRecord[] = pages.map((p) => ({
    url: p.url,
    statusCode: p.statusCode,
    bytes: p.bytes,
    fetchedAt: p.fetchedAt,
    fromCache: p.fromCache,
  }))

  await upsertState(prisma, church.id, { status: 'fetched', pagesFetched: pageRecords }, options)

  // ── Pass 1: deterministic parse across all pages ──
  let extracted: ExtractedChurchData = emptyExtracted()
  if (!options.aiOnly) {
    const parsed = parsePages(pages.map((p) => ({ url: p.url, html: p.html })))
    if (hasAnyData(parsed)) {
      extracted = parsed
      stats.pass1Extracted++
    }
  }

  // ── Pass 2: Claude CLI unless Pass 1 already produced the full picture ──
  // We run Claude whenever Pass 1 is missing any of the high-value fields so
  // that description, ministries, events, etc. get populated even on sites
  // with good JSON-LD.
  const pass1Complete =
    extracted.pastorName !== null &&
    extracted.description !== null &&
    extracted.services.length > 0 &&
    extracted.staff.length > 0
  const shouldUseAi = !options.skipAi && !pass1Complete && pages.length > 0

  if (shouldUseAi) {
    const combinedText = stripPages(pages.map((p) => ({ url: p.url, html: p.html })))
    try {
      const aiResult = await extractWithClaude(combinedText)
      if (aiResult) {
        // Union-merge with Pass 1 — AI tends to win scalars via mergeData's
        // "first wins" semantics, but Pass 1's arrays (events, services,
        // ministries) survive even if AI missed them.
        let merged: ExtractedChurchData = { ...aiResult, source: 'claude-ai' }
        merged = mergeData(merged, extracted)
        merged.source = 'claude-ai'
        merged.confidence = Math.max(aiResult.confidence, extracted.confidence)
        merged.confidenceLevel =
          merged.confidence >= 0.8 ? 'high' : merged.confidence >= 0.5 ? 'medium' : 'low'
        extracted = merged
        stats.pass2Extracted++
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        stats.rateLimited = true
        ctx.stopRequested = true
        ctx.reason = 'Claude CLI rate/usage limit'
        await upsertState(
          prisma,
          church.id,
          {
            status: 'rate_limited',
            lastError: error.message,
          },
          options,
        )
        return { kind: 'rate-limited', error: error.message }
      }
      const message = error instanceof Error ? error.message : String(error)
      stats.errors++
      await upsertState(
        prisma,
        church.id,
        { status: 'failed', lastError: `ai: ${message}`, completed: true },
        options,
      )
      return { kind: 'failed', error: message }
    }
  }

  // ── Anything worth applying? ──
  if (!hasAnyData(extracted)) {
    await upsertState(prisma, church.id, { status: 'skipped_no_data', completed: true }, options)
    stats.skippedNoData++
    return { kind: 'no-data' }
  }

  await upsertState(
    prisma,
    church.id,
    {
      status: 'extracted',
      extractedData: extracted,
      confidence: extracted.confidence,
      source: extracted.source,
    },
    options,
  )

  // ── Confidence gate ──
  if (extracted.confidenceLevel === 'low' && !options.forceLowConfidence) {
    stats.lowConfidenceFlagged++
    await upsertState(
      prisma,
      church.id,
      {
        status: 'failed',
        lastError: `low confidence ${extracted.confidence.toFixed(2)}`,
        completed: true,
      },
      options,
    )
    return { kind: 'low-confidence', extracted }
  }

  // ── Apply ──
  const changes = await applyExtraction(prisma, church, extracted, options, stats)

  await upsertState(
    prisma,
    church.id,
    { status: 'applied', completed: true, lastError: null },
    options,
  )

  return { kind: 'applied', changes, extracted }
}

// ── Main ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const options = parseArgs()
  const prisma = new PrismaClient()
  const ctx: ShutdownContext = {
    prisma,
    currentChurchId: null,
    stopRequested: false,
    reason: null,
  }
  installShutdownHandlers(ctx)

  try {
    console.log('=== Church Website Enrichment Pipeline v2 ===')
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log(
      `Passes: ${options.skipAi ? 'Pass 1 only (no AI)' : options.aiOnly ? 'Pass 2 only (AI)' : 'Pass 1 + Pass 2'}`,
    )
    console.log(`Max subpages per church: ${options.maxSubpages}`)
    console.log(`Overwrite existing fields: ${options.overwrite ? 'YES' : 'NO (null only)'}`)
    console.log(`Retry previously-failed: ${options.retryFailed ? 'YES' : 'NO'}`)
    console.log(`Force refetch (skip cache): ${options.forceRefetch ? 'YES' : 'NO'}`)
    if (options.limit) console.log(`Limit: ${options.limit}`)
    console.log('')

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

    // Pull all churches with websites, plus their current enrichment state
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
        description: true,
        email: true,
        phone: true,
        languages: true,
        goodForChildren: true,
        goodForGroups: true,
        wheelchairAccessible: true,
        services: { select: { id: true, isAutoImported: true } },
        enrichmentState: {
          select: { status: true, attempts: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    const stats = createEmptyStats()
    stats.totalConsidered = churches.length

    // Filter to eligible churches (respects --limit)
    const eligible: ChurchRow[] = []
    for (const c of churches) {
      if (!isEligible(c.enrichmentState, options)) {
        stats.skippedAlreadyDone++
        continue
      }
      eligible.push({
        id: c.id,
        name: c.name,
        website: c.website,
        pastorName: c.pastorName,
        denomination: c.denomination,
        denominationFamily: c.denominationFamily,
        yearEstablished: c.yearEstablished,
        description: c.description,
        email: c.email,
        phone: c.phone,
        languages: c.languages,
        goodForChildren: c.goodForChildren,
        goodForGroups: c.goodForGroups,
        wheelchairAccessible: c.wheelchairAccessible,
        services: c.services,
      })
      if (options.limit && eligible.length >= options.limit) break
    }

    console.log(
      `${churches.length} church(es) with websites; ${eligible.length} eligible, ${stats.skippedAlreadyDone} already done`,
    )
    console.log('')

    for (let i = 0; i < eligible.length; i++) {
      if (ctx.stopRequested) break
      const church = eligible[i]
      stats.processed++

      try {
        const result = await processChurch(prisma, church, options, stats, ctx)

        switch (result.kind) {
          case 'applied': {
            const verb = options.dryRun ? 'would update' : 'updated'
            const src = result.extracted?.source ?? '?'
            const conf = result.extracted?.confidence.toFixed(2) ?? '?'
            console.log(
              `  [${verb}] ${church.name} — ${(result.changes ?? []).join(', ')} (${src}, ${conf})`,
            )
            break
          }
          case 'low-confidence':
            console.log(
              `  [low confidence] ${church.name} — ${result.extracted?.confidence.toFixed(2)} (flagged, skipped)`,
            )
            break
          case 'no-data':
            if (options.verbose) console.log(`  [no data] ${church.name}`)
            break
          case 'failed':
            if (options.verbose) {
              console.log(`  [failed] ${church.name}: ${result.error}`)
            }
            break
          case 'rate-limited':
            console.log(`  [rate-limited] ${church.name}: ${result.error}`)
            break
          case 'skipped':
            if (options.verbose) console.log(`  [skipped] ${church.name}`)
            break
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`  [error] ${church.name}: ${message}`)
        stats.errors++
        await upsertState(
          prisma,
          church.id,
          { status: 'failed', lastError: message, completed: true },
          options,
        )
      }

      ctx.currentChurchId = null

      // Progress update every 25 churches
      if ((i + 1) % 25 === 0) {
        console.log(`  --- Progress: ${i + 1}/${eligible.length} ---`)
      }
    }

    printStats(stats, options.dryRun)

    if (ctx.stopRequested) {
      console.log('')
      console.log(`Stopped early: ${ctx.reason ?? 'unknown'}`)
      console.log('Re-run to pick up from where we left off.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

function printStats(stats: EnrichV2Stats, dryRun: boolean): void {
  const verb = dryRun ? 'would be' : 'were'
  console.log('')
  console.log('=== Enrichment v2 Summary ===')
  console.log(`Churches considered:         ${stats.totalConsidered}`)
  console.log(`Skipped (already done):      ${stats.skippedAlreadyDone}`)
  console.log(`Churches processed:          ${stats.processed}`)
  console.log(`Homepages fetched:           ${stats.websitesFetched}`)
  console.log(`Subpages fetched:            ${stats.subpagesFetched}`)
  console.log(`Websites failed:             ${stats.websitesFailed}`)
  console.log(`Pass 1 (structured) hits:    ${stats.pass1Extracted}`)
  console.log(`Pass 2 (Claude AI) hits:     ${stats.pass2Extracted}`)
  console.log(`Services ${verb} created:    ${stats.servicesCreated}`)
  console.log(`Events ${verb} created:      ${stats.eventsCreated}`)
  console.log(`Fields ${verb} updated:      ${stats.fieldsUpdated}`)
  console.log(`Low confidence (flagged):    ${stats.lowConfidenceFlagged}`)
  console.log(`Skipped (no website):        ${stats.skippedNoWebsite}`)
  console.log(`Skipped (no useful data):    ${stats.skippedNoData}`)
  console.log(`Errors:                      ${stats.errors}`)
  if (stats.rateLimited) {
    console.log('Rate-limited by Claude CLI — run again once quota resets.')
  }
}

main().catch((error) => {
  console.error('Website enrichment v2 pipeline failed:', error)
  process.exitCode = 1
})
