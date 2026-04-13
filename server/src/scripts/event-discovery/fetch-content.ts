/**
 * Fetch church website content for event discovery.
 *
 * Queries churches with websites from the database, fetches their
 * homepage and event pages, and outputs cleaned text content as JSON
 * to stdout. Designed to be consumed by the Claude Code slash command
 * `/project:discover-events`.
 *
 * Usage:
 *   npx tsx src/scripts/event-discovery/fetch-content.ts [flags]
 *
 * Flags:
 *   --limit N       Only process the first N churches (default: 5)
 *   --church SLUG   Process a single church by slug
 *
 * Output (JSON to stdout):
 *   [{ church: { id, name, slug }, content: string, sourceUrl: string }]
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

import { fetchChurchWebsite } from './website-fetcher.js'

dotenv.config()

interface FetchOptions {
  limit: number
  churchSlug: string | null
}

function parseArgs(): FetchOptions {
  const args = process.argv.slice(2)
  const limitIndex = args.indexOf('--limit')
  const churchIndex = args.indexOf('--church')

  return {
    limit: limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 5,
    churchSlug: churchIndex !== -1 ? args[churchIndex + 1] : null,
  }
}

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

interface FetchResult {
  church: { id: string; name: string; slug: string }
  content: string
  sourceUrl: string
}

async function main(): Promise<void> {
  const options = parseArgs()
  const prisma = new PrismaClient()

  try {
    const whereClause = options.churchSlug
      ? { slug: options.churchSlug, website: { not: null } }
      : { website: { not: null } }

    const churches = await prisma.church.findMany({
      where: whereClause,
      select: { id: true, name: true, slug: true, website: true },
      take: options.limit,
      orderBy: { name: 'asc' },
    })

    if (churches.length === 0) {
      console.error('No churches with websites found.')
      console.log(JSON.stringify([]))
      return
    }

    console.error(`Fetching websites for ${churches.length} church(es)...`)

    const rateLimiter = createRateLimiter(1000)
    const results: FetchResult[] = []

    for (const church of churches) {
      const website = church.website as string
      console.error(`  Fetching: ${church.name} (${website})`)

      const content = await fetchChurchWebsite(website, rateLimiter)
      if (!content) {
        console.error('    -> Could not fetch website')
        continue
      }

      if (content.eventPageUrls.length > 0) {
        console.error(`    -> Found ${content.eventPageUrls.length} event page(s)`)
      }

      results.push({
        church: { id: church.id, name: church.name, slug: church.slug },
        content: content.textContent,
        sourceUrl: content.url,
      })
    }

    console.error(`\nFetched ${results.length}/${churches.length} websites successfully.`)

    // Output results as JSON to stdout (progress messages go to stderr)
    console.log(JSON.stringify(results, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('fetch-content failed:', error)
  process.exitCode = 1
})
