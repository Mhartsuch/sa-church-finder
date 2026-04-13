/**
 * Save discovered events to the database.
 *
 * Reads a JSON file of extracted events, deduplicates by content hash,
 * and inserts new events with source=WEBSITE_SCRAPE, status=PENDING.
 * Designed to be consumed by the Claude Code slash command
 * `/project:discover-events`.
 *
 * Usage:
 *   npx tsx src/scripts/event-discovery/save-events.ts <path-to-json> [flags]
 *
 * Flags:
 *   --dry-run   Show what would be inserted without writing to DB
 *
 * Input JSON format:
 *   [{ churchId, title, description?, eventType, startDate, startTime?,
 *      endTime?, location?, isRecurring?, sourceUrl? }]
 */

import crypto from 'node:crypto'
import fs from 'node:fs'

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

interface EventInput {
  churchId: string
  title: string
  description?: string | null
  eventType: string
  startDate: string
  startTime?: string | null
  endTime?: string | null
  location?: string | null
  isRecurring?: boolean
  sourceUrl?: string | null
}

const VALID_EVENT_TYPES = new Set(['service', 'community', 'volunteer', 'study', 'youth', 'other'])

function generateSourceHash(churchId: string, title: string, startDate: string): string {
  const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, ' ')
  const dateOnly = startDate.split('T')[0]
  const input = `${churchId}:${normalizedTitle}:${dateOnly}`
  return crypto.createHash('sha256').update(input).digest('hex')
}

function buildStartTime(startDate: string, startTime: string | null | undefined): Date {
  const timeStr = startTime ?? '09:00'
  return new Date(`${startDate}T${timeStr}:00`)
}

function buildEndTime(startDate: string, endTime: string | null | undefined): Date | null {
  if (!endTime) return null
  return new Date(`${startDate}T${endTime}:00`)
}

function validateEvent(event: EventInput, index: number): string | null {
  if (!event.churchId) return `Event ${index}: missing churchId`
  if (!event.title?.trim()) return `Event ${index}: missing title`
  if (!event.startDate) return `Event ${index}: missing startDate`
  if (!event.eventType || !VALID_EVENT_TYPES.has(event.eventType)) {
    return `Event ${index}: invalid eventType "${event.eventType}"`
  }
  const startTime = buildStartTime(event.startDate, event.startTime)
  if (Number.isNaN(startTime.getTime())) {
    return `Event ${index}: invalid date "${event.startDate} ${event.startTime ?? ''}"`
  }
  return null
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const filePath = args.find((a) => !a.startsWith('--'))
  const dryRun = args.includes('--dry-run')

  if (!filePath) {
    console.error('Usage: npx tsx save-events.ts <path-to-json> [--dry-run]')
    process.exitCode = 1
    return
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exitCode = 1
    return
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const events: EventInput[] = JSON.parse(raw)

  if (!Array.isArray(events) || events.length === 0) {
    console.log('No events to save.')
    return
  }

  console.log(`Processing ${events.length} event(s)${dryRun ? ' (dry run)' : ''}...`)

  const prisma = new PrismaClient()
  let created = 0
  let deduplicated = 0
  let skipped = 0

  try {
    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      const error = validateEvent(event, i)
      if (error) {
        console.log(`  [skipped] ${error}`)
        skipped++
        continue
      }

      const sourceHash = generateSourceHash(event.churchId, event.title, event.startDate)

      const existing = await prisma.event.findUnique({
        where: { sourceHash },
        select: { id: true },
      })

      if (existing) {
        console.log(`  [dedup] "${event.title}" — ${event.startDate}`)
        deduplicated++
        continue
      }

      const startTime = buildStartTime(event.startDate, event.startTime)
      const endTime = buildEndTime(event.startDate, event.endTime)

      if (dryRun) {
        const timeStr = event.startTime ? ` at ${event.startTime}` : ''
        console.log(`  [would create] "${event.title}" — ${event.startDate}${timeStr}`)
        created++
        continue
      }

      await prisma.event.create({
        data: {
          churchId: event.churchId,
          title: event.title.trim(),
          description: event.description?.trim() || null,
          eventType: event.eventType,
          startTime,
          endTime,
          locationOverride: event.location?.trim() || null,
          isRecurring: event.isRecurring ?? false,
          recurrenceRule: null,
          source: 'WEBSITE_SCRAPE',
          status: 'PENDING',
          sourceUrl: event.sourceUrl ?? null,
          sourceHash,
        },
      })

      const timeStr = event.startTime ? ` at ${event.startTime}` : ''
      console.log(`  [created] "${event.title}" — ${event.startDate}${timeStr}`)
      created++
    }

    console.log('')
    console.log('=== Save Summary ===')
    console.log(`Created:      ${created}`)
    console.log(`Deduplicated: ${deduplicated}`)
    console.log(`Skipped:      ${skipped}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('save-events failed:', error)
  process.exitCode = 1
})
