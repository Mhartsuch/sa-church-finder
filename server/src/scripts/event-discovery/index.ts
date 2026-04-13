/**
 * Church Event Discovery Pipeline
 *
 * Discovers real events from church websites using Claude API extraction.
 * Discovered events are inserted with source=WEBSITE_SCRAPE and status=PENDING
 * for admin review.
 *
 * Usage:
 *   npx tsx src/scripts/event-discovery/index.ts [flags]
 *
 * Flags:
 *   --dry-run       Extract events but don't write to the database
 *   --limit N       Only process the first N churches
 *   --church SLUG   Process a single church by slug
 *
 * Required environment variables:
 *   ANTHROPIC_API_KEY   Claude API key for event extraction
 *   DATABASE_URL        PostgreSQL connection string
 */

import crypto from 'node:crypto'

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

import { extractEventsFromContent } from './event-extractor.js'
import { createEmptyStats } from './types.js'
import type { ChurchForDiscovery, DiscoveryOptions, ExtractedEvent } from './types.js'
import { fetchChurchWebsite } from './website-fetcher.js'

dotenv.config()

function parseArgs(): DiscoveryOptions {
  const args = process.argv.slice(2)

  const limitIndex = args.indexOf('--limit')
  const churchIndex = args.indexOf('--church')

  return {
    dryRun: args.includes('--dry-run'),
    limit: limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null,
    churchSlug: churchIndex !== -1 ? args[churchIndex + 1] : null,
  }
}

/**
 * Generate a deduplication hash for an event.
 * Based on churchId + normalized title + start date (date only, no time).
 */
function generateSourceHash(churchId: string, title: string, startDate: string): string {
  const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, ' ')
  const dateOnly = startDate.split('T')[0]
  const input = `${churchId}:${normalizedTitle}:${dateOnly}`
  return crypto.createHash('sha256').update(input).digest('hex')
}

/**
 * Convert an ExtractedEvent into the start/end DateTime values
 * needed for the database.
 */
function buildEventTimes(event: ExtractedEvent): { startTime: Date; endTime: Date | null } {
  const startTimeStr = event.startTime ?? '09:00'
  const startDateTime = new Date(`${event.startDate}T${startTimeStr}:00`)

  let endDateTime: Date | null = null
  if (event.endDate && event.endTime) {
    endDateTime = new Date(`${event.endDate}T${event.endTime}:00`)
  } else if (event.endTime) {
    endDateTime = new Date(`${event.startDate}T${event.endTime}:00`)
  }

  return { startTime: startDateTime, endTime: endDateTime }
}

/**
 * Simple rate limiter: ensures at least `intervalMs` between calls.
 */
function createRateLimiter(intervalMs: number): () => Promise<void> {
  let lastCall = 0
  return async () => {
    const now = Date.now()
    const wait = intervalMs - (now - lastCall)
    if (wait > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, wait))
    }
    lastCall = Date.now()
  }
}

async function main(): Promise<void> {
  const options = parseArgs()
  const prisma = new PrismaClient()

  try {
    console.log('=== Church Event Discovery Pipeline ===')
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`)
    if (options.limit) console.log(`Limit: ${options.limit} churches`)
    if (options.churchSlug) console.log(`Church: ${options.churchSlug}`)
    console.log('')

    // Validate API key
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('Missing required environment variable: ANTHROPIC_API_KEY')
    }

    // Query churches with websites
    const whereClause = options.churchSlug
      ? { slug: options.churchSlug, website: { not: null } }
      : { website: { not: null } }

    const churches = (await prisma.church.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        website: true,
      },
      take: options.limit ?? undefined,
      orderBy: { name: 'asc' },
    })) as ChurchForDiscovery[]

    if (churches.length === 0) {
      console.log('No churches with websites found.')
      return
    }

    console.log(`Found ${churches.length} churches with websites`)
    console.log('')

    const stats = createEmptyStats()
    const websiteRateLimiter = createRateLimiter(1000)
    const apiRateLimiter = createRateLimiter(500)

    for (let i = 0; i < churches.length; i++) {
      const church = churches[i]
      console.log(`[${i + 1}/${churches.length}] ${church.name}`)
      console.log(`  Website: ${church.website}`)

      try {
        // Step 1: Fetch website content
        const content = await fetchChurchWebsite(church.website, websiteRateLimiter)

        if (!content) {
          console.log('  [skipped] Could not fetch website')
          stats.churchesSkipped++
          continue
        }

        if (content.eventPageUrls.length > 0) {
          console.log(`  Found ${content.eventPageUrls.length} event page(s)`)
        }

        // Step 2: Extract events via Claude API
        await apiRateLimiter()
        const extractedEvents = await extractEventsFromContent(
          apiKey,
          content.textContent,
          church.name,
        )

        if (extractedEvents.length === 0) {
          console.log('  [no events] No events found on website')
          stats.churchesProcessed++
          continue
        }

        console.log(`  Extracted ${extractedEvents.length} event(s)`)
        stats.eventsDiscovered += extractedEvents.length

        // Step 3: Deduplicate and insert
        for (const event of extractedEvents) {
          const sourceHash = generateSourceHash(church.id, event.title, event.startDate)

          // Check for existing event with same hash
          const existing = await prisma.event.findUnique({
            where: { sourceHash },
            select: { id: true },
          })

          if (existing) {
            console.log(`  [dedup] "${event.title}" — already exists`)
            stats.eventsDeduplicated++
            continue
          }

          if (options.dryRun) {
            const timeStr = event.startTime ? ` at ${event.startTime}` : ''
            console.log(`  [would create] "${event.title}" — ${event.startDate}${timeStr}`)
            stats.eventsCreated++
            continue
          }

          // Build start/end times
          const { startTime, endTime } = buildEventTimes(event)

          // Validate the date
          if (Number.isNaN(startTime.getTime())) {
            console.log(`  [skipped] "${event.title}" — invalid date: ${event.startDate}`)
            stats.errors++
            continue
          }

          await prisma.event.create({
            data: {
              churchId: church.id,
              title: event.title.trim(),
              description: event.description?.trim() || null,
              eventType: event.eventType,
              startTime,
              endTime,
              locationOverride: event.location?.trim() || null,
              isRecurring: false,
              recurrenceRule: null,
              source: 'WEBSITE_SCRAPE',
              status: 'PENDING',
              sourceUrl: content.url,
              sourceHash,
            },
          })

          const timeStr = event.startTime ? ` at ${event.startTime}` : ''
          console.log(`  [created] "${event.title}" — ${event.startDate}${timeStr}`)
          stats.eventsCreated++
        }

        stats.churchesProcessed++
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`  [error] ${message}`)
        stats.errors++
      }

      // Progress update every 10 churches
      if ((i + 1) % 10 === 0) {
        console.log(`  --- Progress: ${i + 1}/${churches.length} ---`)
      }

      console.log('')
    }

    printStats(stats)
  } finally {
    await prisma.$disconnect()
  }
}

function printStats(stats: ReturnType<typeof createEmptyStats>): void {
  console.log('=== Discovery Summary ===')
  console.log(`Churches processed:   ${stats.churchesProcessed}`)
  console.log(`Churches skipped:     ${stats.churchesSkipped}`)
  console.log(`Events discovered:    ${stats.eventsDiscovered}`)
  console.log(`Events created:       ${stats.eventsCreated}`)
  console.log(`Events deduplicated:  ${stats.eventsDeduplicated}`)
  console.log(`Errors:               ${stats.errors}`)
}

main().catch((error) => {
  console.error('Event discovery pipeline failed:', error)
  process.exitCode = 1
})
