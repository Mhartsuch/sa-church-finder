/**
 * Minimal iCal RRULE parser and occurrence expander.
 *
 * Supports the subset of RFC 5545 that real church event patterns actually use:
 *   FREQ=DAILY|WEEKLY|MONTHLY
 *   INTERVAL=<positive integer>
 *   BYDAY=SU,MO,TU,WE,TH,FR,SA (honored only when FREQ=WEEKLY)
 *   COUNT=<positive integer>
 *   UNTIL=<YYYYMMDDTHHMMSSZ | ISO 8601 string>
 *
 * The input string is the RRULE *body* only (no `RRULE:` prefix and no
 * separate DTSTART line). DTSTART is always provided alongside the rule as
 * a JavaScript Date, and all date math is performed in UTC to match the
 * Postgres `timestamptz` representation.
 */

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export type RecurrenceWeekday = 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA'

export interface IParsedRRule {
  freq: RecurrenceFrequency
  interval: number
  byDay?: RecurrenceWeekday[]
  count?: number
  until?: Date
}

export interface IExpandOccurrencesOptions {
  dtstart: Date
  rule: IParsedRRule
  windowStart: Date
  windowEnd: Date
  maxOccurrences?: number
}

export class RecurrenceRuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RecurrenceRuleError'
    Object.setPrototypeOf(this, RecurrenceRuleError.prototype)
  }
}

const DEFAULT_MAX_OCCURRENCES = 366

const SUPPORTED_FREQUENCIES: readonly RecurrenceFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY']

const WEEKDAY_ORDER: RecurrenceWeekday[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

const WEEKDAY_TO_INDEX: Record<RecurrenceWeekday, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
}

const DAY_MS = 24 * 60 * 60 * 1000

const addDaysUTC = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * DAY_MS)

const addWeeksUTC = (date: Date, weeks: number): Date => addDaysUTC(date, weeks * 7)

/**
 * Add `months` calendar months to `date` in UTC while preserving the
 * hour/minute/second/millisecond components. Returns `null` when the
 * original day-of-month does not exist in the target month (eg. adding
 * one month to Jan 31 targets Feb 31 and is skipped per RFC 5545).
 */
const addMonthsUTC = (date: Date, months: number): Date | null => {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = date.getUTCSeconds()
  const ms = date.getUTCMilliseconds()

  const targetTotalMonths = month + months
  const targetYear = year + Math.floor(targetTotalMonths / 12)
  const targetMonth = ((targetTotalMonths % 12) + 12) % 12

  const candidate = new Date(
    Date.UTC(targetYear, targetMonth, day, hours, minutes, seconds, ms),
  )

  // If JS normalized the day (eg. Feb 30 -> Mar 2), the target day of month
  // did not exist and the occurrence should be skipped.
  if (candidate.getUTCMonth() !== targetMonth || candidate.getUTCDate() !== day) {
    return null
  }

  return candidate
}

const parsePositiveInteger = (raw: string, key: string): number => {
  if (!/^\d+$/.test(raw)) {
    throw new RecurrenceRuleError(`Invalid ${key} value "${raw}" (expected positive integer)`)
  }

  const parsed = Number.parseInt(raw, 10)

  if (parsed <= 0) {
    throw new RecurrenceRuleError(`Invalid ${key} value "${raw}" (must be greater than zero)`)
  }

  return parsed
}

const parseByDay = (raw: string): RecurrenceWeekday[] => {
  const days = raw
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean)

  if (days.length === 0) {
    throw new RecurrenceRuleError('BYDAY must list at least one weekday')
  }

  const result: RecurrenceWeekday[] = []

  for (const day of days) {
    if (!WEEKDAY_ORDER.includes(day as RecurrenceWeekday)) {
      throw new RecurrenceRuleError(`Invalid BYDAY value "${day}"`)
    }

    const weekday = day as RecurrenceWeekday
    if (!result.includes(weekday)) {
      result.push(weekday)
    }
  }

  // Keep a stable iteration order that matches the week.
  result.sort((a, b) => WEEKDAY_TO_INDEX[a] - WEEKDAY_TO_INDEX[b])
  return result
}

const parseUntil = (raw: string): Date => {
  // iCal form: 20260401T140000Z
  const icalMatch = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(raw)
  if (icalMatch) {
    const [, yyyy, mm, dd, hh, min, ss] = icalMatch
    const parsed = new Date(
      Date.UTC(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd),
        Number(hh),
        Number(min),
        Number(ss),
      ),
    )
    if (Number.isNaN(parsed.getTime())) {
      throw new RecurrenceRuleError(`Invalid UNTIL value "${raw}"`)
    }
    return parsed
  }

  // iCal date-only form: 20260401
  const icalDateMatch = /^(\d{4})(\d{2})(\d{2})$/.exec(raw)
  if (icalDateMatch) {
    const [, yyyy, mm, dd] = icalDateMatch
    const parsed = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)))
    if (Number.isNaN(parsed.getTime())) {
      throw new RecurrenceRuleError(`Invalid UNTIL value "${raw}"`)
    }
    return parsed
  }

  // Fall back to ISO 8601 parsing. Anything Date.parse accepts is fine.
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    throw new RecurrenceRuleError(`Invalid UNTIL value "${raw}"`)
  }

  return parsed
}

/**
 * Parse an iCal RRULE body (no `RRULE:` prefix) into a normalized rule.
 * Throws {@link RecurrenceRuleError} when the rule is malformed or uses
 * an unsupported feature.
 */
export const parseRRule = (input: string): IParsedRRule => {
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new RecurrenceRuleError('Recurrence rule is empty')
  }

  const body = input.trim().replace(/^RRULE:/i, '')

  const rule: Partial<IParsedRRule> = {
    interval: 1,
  }

  for (const segment of body.split(';')) {
    const trimmed = segment.trim()
    if (!trimmed) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      throw new RecurrenceRuleError(`Malformed RRULE segment "${segment}"`)
    }

    const key = trimmed.slice(0, separatorIndex).toUpperCase()
    const value = trimmed.slice(separatorIndex + 1)

    switch (key) {
      case 'FREQ': {
        const upper = value.toUpperCase() as RecurrenceFrequency
        if (!SUPPORTED_FREQUENCIES.includes(upper)) {
          throw new RecurrenceRuleError(
            `Unsupported FREQ "${value}" (supported: ${SUPPORTED_FREQUENCIES.join(', ')})`,
          )
        }
        rule.freq = upper
        break
      }
      case 'INTERVAL':
        rule.interval = parsePositiveInteger(value, 'INTERVAL')
        break
      case 'COUNT':
        rule.count = parsePositiveInteger(value, 'COUNT')
        break
      case 'UNTIL':
        rule.until = parseUntil(value)
        break
      case 'BYDAY':
        rule.byDay = parseByDay(value)
        break
      case 'WKST':
        // Accepted for compatibility but not honored — we always iterate
        // occurrences relative to DTSTART, which is equivalent for the
        // BYDAY patterns we support.
        break
      default:
        throw new RecurrenceRuleError(`Unsupported RRULE part "${key}"`)
    }
  }

  if (!rule.freq) {
    throw new RecurrenceRuleError('Recurrence rule is missing FREQ')
  }

  if (rule.count !== undefined && rule.until !== undefined) {
    throw new RecurrenceRuleError('Recurrence rule must not combine COUNT and UNTIL')
  }

  if (rule.byDay && rule.freq !== 'WEEKLY') {
    throw new RecurrenceRuleError('BYDAY is only supported when FREQ=WEEKLY')
  }

  return {
    freq: rule.freq,
    interval: rule.interval ?? 1,
    byDay: rule.byDay,
    count: rule.count,
    until: rule.until,
  }
}

/**
 * Parse and re-serialize an RRULE into a canonical form so persisted strings
 * are consistent. Returns the same string the parser emits when printing the
 * provided rule.
 */
export const validateAndNormalizeRRule = (input: string): string => {
  const parsed = parseRRule(input)
  const parts: string[] = [`FREQ=${parsed.freq}`]

  if (parsed.interval && parsed.interval !== 1) {
    parts.push(`INTERVAL=${parsed.interval}`)
  }

  if (parsed.byDay && parsed.byDay.length > 0) {
    parts.push(`BYDAY=${parsed.byDay.join(',')}`)
  }

  if (parsed.count !== undefined) {
    parts.push(`COUNT=${parsed.count}`)
  }

  if (parsed.until !== undefined) {
    parts.push(`UNTIL=${parsed.until.toISOString()}`)
  }

  return parts.join(';')
}

type OccurrenceEmitter = (candidate: Date) => boolean

/**
 * Iterate the series generated by `rule` starting at `dtstart` and invoke
 * `emit` on each candidate. When `emit` returns `false` iteration stops.
 */
const iterateOccurrences = (
  dtstart: Date,
  rule: IParsedRRule,
  emit: OccurrenceEmitter,
): void => {
  const maxCount = rule.count ?? Infinity
  let produced = 0

  if (rule.freq === 'DAILY') {
    let i = 0
    while (produced < maxCount) {
      const candidate = addDaysUTC(dtstart, i * rule.interval)
      if (rule.until && candidate.getTime() > rule.until.getTime()) return
      produced += 1
      if (!emit(candidate)) return
      i += 1
    }
    return
  }

  if (rule.freq === 'WEEKLY') {
    if (rule.byDay && rule.byDay.length > 0) {
      // Anchor the iteration to the Sunday that starts the week containing
      // dtstart so every day in byDay gets a stable offset. Occurrences
      // before dtstart are skipped (they're outside the series).
      const dtstartDow = dtstart.getUTCDay()
      const weekAnchor = addDaysUTC(dtstart, -dtstartDow)

      let weekIndex = 0
      while (produced < maxCount) {
        const weekStart = addWeeksUTC(weekAnchor, weekIndex * rule.interval)
        for (const weekday of rule.byDay) {
          const candidate = addDaysUTC(weekStart, WEEKDAY_TO_INDEX[weekday])
          if (candidate.getTime() < dtstart.getTime()) continue
          if (rule.until && candidate.getTime() > rule.until.getTime()) return
          if (produced >= maxCount) return
          produced += 1
          if (!emit(candidate)) return
        }
        weekIndex += 1
      }
      return
    }

    let i = 0
    while (produced < maxCount) {
      const candidate = addWeeksUTC(dtstart, i * rule.interval)
      if (rule.until && candidate.getTime() > rule.until.getTime()) return
      produced += 1
      if (!emit(candidate)) return
      i += 1
    }
    return
  }

  if (rule.freq === 'MONTHLY') {
    let i = 0
    while (produced < maxCount) {
      const candidate = addMonthsUTC(dtstart, i * rule.interval)
      // Skip months where dtstart's day doesn't exist (eg. Feb 30).
      if (candidate === null) {
        i += 1
        continue
      }
      if (rule.until && candidate.getTime() > rule.until.getTime()) return
      produced += 1
      if (!emit(candidate)) return
      i += 1
    }
    return
  }
}

/**
 * Expand a parsed recurrence rule into a concrete list of occurrences that
 * intersect the requested window. Occurrences equal to `windowEnd` are
 * included; occurrences equal to `windowStart` are included. The iteration
 * short-circuits once `maxOccurrences` is reached or once a candidate runs
 * past `windowEnd`.
 */
export const expandOccurrences = ({
  dtstart,
  rule,
  windowStart,
  windowEnd,
  maxOccurrences = DEFAULT_MAX_OCCURRENCES,
}: IExpandOccurrencesOptions): Date[] => {
  if (Number.isNaN(dtstart.getTime())) {
    throw new RecurrenceRuleError('dtstart is not a valid date')
  }

  if (Number.isNaN(windowStart.getTime()) || Number.isNaN(windowEnd.getTime())) {
    throw new RecurrenceRuleError('window bounds must be valid dates')
  }

  if (windowEnd.getTime() < windowStart.getTime()) {
    return []
  }

  const results: Date[] = []
  const effectiveCap = Math.max(1, maxOccurrences)

  iterateOccurrences(dtstart, rule, (candidate) => {
    if (candidate.getTime() > windowEnd.getTime()) {
      return false
    }

    if (candidate.getTime() >= windowStart.getTime()) {
      results.push(candidate)
      if (results.length >= effectiveCap) {
        return false
      }
    }

    return true
  })

  return results
}

/**
 * Return the first occurrence of the series that is on or after `from`,
 * or `null` when no such occurrence exists (eg. COUNT/UNTIL exhausted).
 */
export const nextOccurrence = (
  dtstart: Date,
  rule: IParsedRRule,
  from: Date,
): Date | null => {
  let result: Date | null = null

  iterateOccurrences(dtstart, rule, (candidate) => {
    if (candidate.getTime() >= from.getTime()) {
      result = candidate
      return false
    }
    return true
  })

  return result
}
