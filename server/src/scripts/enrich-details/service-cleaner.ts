/**
 * Service Cleaner
 *
 * Auto-imported service rows include artifacts that are not worship services:
 * office opening/closing times stored as generic "Service" rows, the end time
 * of one service stored as the start of another, and times no congregation
 * meets at. Showing them as service times is wrong information, so this
 * module identifies the rows to delete.
 *
 * Only generic rows are ever candidates — a row typed "Mass", "Bible Study",
 * "Traditional" etc. came from a page that described it and is left alone.
 */

export interface ServiceRow {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string | null
  serviceType: string
  language: string
  description: string | null
}

export type ServiceArtifactReason =
  | 'implausible_hour'
  | 'end_time_of_another_service'
  | 'office_hours'
  | 'generic_beside_mass_schedule'
  | 'duplicate'

const EARLIEST_PLAUSIBLE = '05:30'
const LATEST_PLAUSIBLE = '21:30'
const OFFICE_HOURS_MIN_WEEKDAYS = 3
const EVENING = '17:00'
const SATURDAY_VIGIL = '16:00'

const isGeneric = (row: ServiceRow): boolean =>
  row.serviceType.trim().toLowerCase() === 'service' && !row.description?.trim()

const isWeekday = (row: ServiceRow): boolean => row.dayOfWeek >= 1 && row.dayOfWeek <= 5

const isMass = (row: ServiceRow): boolean => /\bmass\b|\bmisa\b/i.test(row.serviceType)

/**
 * Returns the rows that are import artifacts rather than worship services,
 * keyed by row id.
 */
export function findServiceArtifacts(rows: ServiceRow[]): Map<string, ServiceArtifactReason> {
  const artifacts = new Map<string, ServiceArtifactReason>()
  const flag = (row: ServiceRow, reason: ServiceArtifactReason): void => {
    if (!artifacts.has(row.id)) artifacts.set(row.id, reason)
  }
  const generic = rows.filter(isGeneric)

  // 1. Hours no congregation meets at (closing times, timezone slips).
  for (const row of generic) {
    if (row.startTime < EARLIEST_PLAUSIBLE || row.startTime > LATEST_PLAUSIBLE) {
      flag(row, 'implausible_hour')
    }
  }

  // 2. A generic row starting exactly when another service that day ends.
  for (const row of generic) {
    const endsHere = rows.some(
      (other) =>
        other.id !== row.id && other.dayOfWeek === row.dayOfWeek && other.endTime === row.startTime,
    )
    if (endsHere) flag(row, 'end_time_of_another_service')
  }

  // 3. Office hours: the same generic time on three or more weekdays. Once a
  // church shows that pattern, every generic weekday row before the evening
  // (early Friday closing, lunch breaks) is office hours too, and so is a
  // generic Saturday daytime row (Saturday office hours). Sunday is left
  // alone: a Sunday time is far more likely to be worship.
  const weekdayTimes = new Map<string, number>()
  for (const row of generic.filter(isWeekday)) {
    weekdayTimes.set(row.startTime, (weekdayTimes.get(row.startTime) ?? 0) + 1)
  }
  const officeTimes = new Set(
    [...weekdayTimes].filter(([, n]) => n >= OFFICE_HOURS_MIN_WEEKDAYS).map(([time]) => time),
  )
  if (officeTimes.size > 0) {
    for (const row of generic) {
      if (row.dayOfWeek === 0) continue
      if (row.dayOfWeek === 6) {
        if (row.startTime < SATURDAY_VIGIL) flag(row, 'office_hours')
      } else if (officeTimes.has(row.startTime) || row.startTime < EVENING) {
        flag(row, 'office_hours')
      }
    }
  }

  // 4. A parish with a typed Mass schedule: its generic rows are opening
  // hours, confession windows and the like — never an untyped extra Mass.
  if (rows.some(isMass)) {
    for (const row of generic) flag(row, 'generic_beside_mass_schedule')
  }

  // 5. Exact duplicates (same day, time, type and language): keep the first.
  const seen = new Set<string>()
  for (const row of rows) {
    if (artifacts.has(row.id)) continue
    const key = [row.dayOfWeek, row.startTime, row.serviceType.toLowerCase(), row.language].join(
      '|',
    )
    if (seen.has(key)) flag(row, 'duplicate')
    else seen.add(key)
  }

  return artifacts
}
