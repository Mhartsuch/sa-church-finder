/**
 * iCalendar (RFC 5545) feed builder.
 *
 * Used by the public calendar-subscription endpoints. Unlike the single-event
 * "Add to calendar" links generated on the client, these feeds are meant to be
 * subscribed to inside a calendar app. We therefore pass stored `RRULE`
 * metadata straight through so calendar clients can expand recurrences
 * natively (Apple Calendar, Google Calendar, and Outlook all handle it).
 */

import type { ChurchEventType } from '../types/event.types.js'

export interface ICalendarEventInput {
  /** Stable identifier used as the VEVENT UID. */
  id: string
  title: string
  description?: string | null
  eventType?: ChurchEventType
  /** DTSTART of the stored series (non-occurrence). */
  startTime: Date
  /** DTEND of the series, if known. */
  endTime?: Date | null
  /** Human-readable location for the VEVENT. */
  location?: string | null
  /** Absolute URL to link from the calendar entry. */
  url?: string | null
  /** When true, emit the stored RRULE alongside DTSTART. */
  isRecurring?: boolean
  /** RRULE body only — no `RRULE:` prefix. */
  recurrenceRule?: string | null
  /** UTC timestamp of when the event row was last updated. Falls back to now. */
  updatedAt?: Date | null
}

export interface IBuildCalendarFeedInput {
  /** Human-readable name for X-WR-CALNAME. */
  calendarName: string
  /** Optional description for X-WR-CALDESC. */
  calendarDescription?: string
  events: ICalendarEventInput[]
  /** DTSTAMP for the feed — used in every VEVENT when `updatedAt` is missing. */
  now?: Date
}

const DEFAULT_DURATION_MINUTES = 60
/**
 * RFC 5545 §3.1 requires lines to be folded at 75 octets. We fold at 73
 * characters to leave room for the CRLF + leading space that introduces the
 * continuation line. Using characters instead of bytes is an acceptable
 * approximation for the ASCII text we emit (titles/descriptions that exceed
 * 73 ASCII chars are the realistic case; non-ASCII is rare in this product).
 */
const MAX_LINE_LENGTH = 73

const pad = (value: number): string => value.toString().padStart(2, '0')

/**
 * Format a Date as a UTC basic-format timestamp: YYYYMMDDTHHMMSSZ.
 */
export const formatUtcBasic = (date: Date): string =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
  `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`

/** Escape a string for an ICS TEXT field per RFC 5545 §3.3.11. */
export const escapeIcsText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')

const sanitizeText = (value: string | null | undefined): string =>
  (value ?? '').replace(/\s+/g, ' ').trim()

/** Fold a single content line longer than MAX_LINE_LENGTH per RFC 5545 §3.1. */
export const foldIcsLine = (line: string): string => {
  if (line.length <= MAX_LINE_LENGTH) return line
  const parts: string[] = []
  let remaining = line
  let first = true
  while (remaining.length > MAX_LINE_LENGTH) {
    parts.push((first ? '' : ' ') + remaining.slice(0, MAX_LINE_LENGTH))
    remaining = remaining.slice(MAX_LINE_LENGTH)
    first = false
  }
  parts.push(' ' + remaining)
  return parts.join('\r\n')
}

const resolveEnd = (event: ICalendarEventInput): Date => {
  if (event.endTime && !Number.isNaN(event.endTime.getTime())) {
    if (event.endTime.getTime() > event.startTime.getTime()) {
      return event.endTime
    }
  }
  return new Date(event.startTime.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000)
}

const normalizeRRule = (raw: string | null | undefined): string | null => {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  // Accept either "FREQ=WEEKLY;..." body or a leading "RRULE:" token, strip it.
  const withoutPrefix = trimmed.replace(/^RRULE:/i, '').trim()
  return withoutPrefix || null
}

const buildVEventLines = (event: ICalendarEventInput, now: Date): string[] => {
  if (Number.isNaN(event.startTime.getTime())) {
    throw new Error(`ics: invalid startTime for event ${event.id}`)
  }

  const dtStamp = formatUtcBasic(event.updatedAt ?? now)
  const end = resolveEnd(event)

  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(event.id)}@sachurchfinder.com`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${formatUtcBasic(event.startTime)}`,
    `DTEND:${formatUtcBasic(end)}`,
    `SUMMARY:${escapeIcsText(sanitizeText(event.title) || 'Event')}`,
  ]

  const description = sanitizeText(event.description)
  if (description) lines.push(`DESCRIPTION:${escapeIcsText(description)}`)

  const location = sanitizeText(event.location)
  if (location) lines.push(`LOCATION:${escapeIcsText(location)}`)

  if (event.url) lines.push(`URL:${escapeIcsText(event.url)}`)

  if (event.eventType) {
    lines.push(`CATEGORIES:${escapeIcsText(event.eventType.toUpperCase())}`)
  }

  if (event.isRecurring) {
    const rule = normalizeRRule(event.recurrenceRule)
    if (rule) {
      lines.push(`RRULE:${rule}`)
    }
  }

  lines.push('END:VEVENT')
  return lines
}

/**
 * Build a full ICS document for a collection of events. Lines are CRLF-joined
 * and folded per RFC 5545. The result is safe to serve as
 * `Content-Type: text/calendar; charset=utf-8`.
 */
export const buildCalendarFeed = (input: IBuildCalendarFeedInput): string => {
  const now = input.now ?? new Date()

  const headerLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SA Church Finder//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(sanitizeText(input.calendarName) || 'SA Church Finder')}`,
  ]

  const description = sanitizeText(input.calendarDescription)
  if (description) {
    headerLines.push(`X-WR-CALDESC:${escapeIcsText(description)}`)
  }

  const bodyLines = input.events.flatMap((event) => buildVEventLines(event, now))

  const footerLines = ['END:VCALENDAR']

  const allLines = [...headerLines, ...bodyLines, ...footerLines].map(foldIcsLine)

  return `${allLines.join('\r\n')}\r\n`
}
