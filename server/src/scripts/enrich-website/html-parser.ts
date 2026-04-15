import type { ExtractedChurchData, ExtractedService } from './types.js'

/**
 * Day name to dayOfWeek number mapping.
 * 0=Sunday, 1=Monday, ..., 6=Saturday
 */
const DAY_MAP: Record<string, number> = {
  su: 0,
  sun: 0,
  sunday: 0,
  mo: 1,
  mon: 1,
  monday: 1,
  tu: 2,
  tue: 2,
  tuesday: 2,
  we: 3,
  wed: 3,
  wednesday: 3,
  th: 4,
  thu: 4,
  thursday: 4,
  fr: 5,
  fri: 5,
  friday: 5,
  sa: 6,
  sat: 6,
  saturday: 6,
}

/**
 * Convert 12-hour time string to 24-hour HH:MM.
 */
function to24Hour(time: string): string | null {
  const match = time.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = match[2] ?? '00'
  const meridiem = match[3]?.toLowerCase()

  if (meridiem === 'pm' && hours < 12) hours += 12
  if (meridiem === 'am' && hours === 12) hours = 0

  if (hours < 0 || hours > 23) return null

  return `${String(hours).padStart(2, '0')}:${minutes}`
}

/**
 * Parse day abbreviation from schema.org openingHours format (e.g., "Su", "Mo").
 */
function parseSchemaDayAbbrev(abbrev: string): number | null {
  return DAY_MAP[abbrev.toLowerCase()] ?? null
}

// ────────────────────────────────────────────────────────────────
// Strategy 1: JSON-LD
// ────────────────────────────────────────────────────────────────

interface JsonLdObject {
  '@type'?: string | string[]
  name?: string
  openingHours?: string | string[]
  founder?: string | { name?: string }
  employee?: Array<{ name?: string; jobTitle?: string }> | { name?: string; jobTitle?: string }
  [key: string]: unknown
}

const CHURCH_TYPES = ['church', 'placeofworship', 'civicstructure', 'organization', 'localbusiness']

function matchesChurchType(typeField: string | string[] | undefined): boolean {
  if (!typeField) return false
  const types = Array.isArray(typeField) ? typeField : [typeField]
  return types.some((t) => CHURCH_TYPES.includes(t.toLowerCase()))
}

function parseJsonLdServices(openingHours: string | string[]): ExtractedService[] {
  // Schema.org format: "Su 09:00-12:00" or ["Su 09:00-12:00", "We 19:00-21:00"]
  const entries = Array.isArray(openingHours) ? openingHours : [openingHours]
  const services: ExtractedService[] = []

  for (const entry of entries) {
    // Match patterns like "Su 09:00-12:00" or "Mo-Fr 09:00-17:00"
    const match = entry.match(/^(\w{2})(?:-(\w{2}))?\s+(\d{2}:\d{2})(?:-(\d{2}:\d{2}))?$/)
    if (!match) continue

    const startDay = parseSchemaDayAbbrev(match[1])
    const endDay = match[2] ? parseSchemaDayAbbrev(match[2]) : null
    const startTime = match[3]
    const endTime = match[4] ?? null

    if (startDay === null) continue

    if (endDay !== null) {
      // Range of days (e.g., Mo-Fr)
      let day = startDay
      while (day !== ((endDay + 1) % 7)) {
        services.push({
          dayOfWeek: day,
          startTime,
          endTime,
          serviceType: 'Service',
          language: 'English',
        })
        day = (day + 1) % 7
      }
    } else {
      services.push({
        dayOfWeek: startDay,
        startTime,
        endTime,
        serviceType: 'Service',
        language: 'English',
      })
    }
  }

  return services
}

function extractPastorFromJsonLd(obj: JsonLdObject): string | null {
  // Check "founder" field
  if (typeof obj.founder === 'string') return obj.founder
  if (obj.founder && typeof obj.founder === 'object' && 'name' in obj.founder) {
    return obj.founder.name ?? null
  }

  // Check "employee" for someone with a pastor-like title
  const employees = Array.isArray(obj.employee) ? obj.employee : obj.employee ? [obj.employee] : []
  for (const emp of employees) {
    if (emp.jobTitle && /pastor|priest|reverend|minister|father/i.test(emp.jobTitle)) {
      return emp.name ?? null
    }
  }

  return null
}

function tryJsonLd(html: string): ExtractedChurchData | null {
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null = null
  const results: JsonLdObject[] = []

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]) as unknown
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'object' && item !== null) results.push(item as JsonLdObject)
        }
      } else if (typeof parsed === 'object' && parsed !== null) {
        results.push(parsed as JsonLdObject)
      }
    } catch {
      // Invalid JSON — skip
    }
  }

  // Find a church-typed JSON-LD object
  const churchObj = results.find((obj) => matchesChurchType(obj['@type']))
  if (!churchObj) return null

  const services = churchObj.openingHours ? parseJsonLdServices(churchObj.openingHours) : []
  const pastorName = extractPastorFromJsonLd(churchObj)

  // Only return if we found something useful
  if (services.length === 0 && !pastorName) return null

  return {
    pastorName,
    denomination: null,
    denominationFamily: null,
    yearEstablished: null,
    services,
    confidence: 0.9,
    confidenceLevel: 'high',
    source: 'json-ld',
  }
}

// ────────────────────────────────────────────────────────────────
// Strategy 2: Microdata (itemprop attributes)
// ────────────────────────────────────────────────────────────────

function tryMicrodata(html: string): ExtractedChurchData | null {
  const services: ExtractedService[] = []

  // Look for itemprop="openingHours" content="Su 09:00-12:00"
  const openingHoursRegex = /itemprop=["']openingHours["']\s+content=["']([^"']+)["']/gi
  let ohMatch: RegExpExecArray | null = null
  const hoursEntries: string[] = []

  while ((ohMatch = openingHoursRegex.exec(html)) !== null) {
    hoursEntries.push(ohMatch[1])
  }

  if (hoursEntries.length > 0) {
    services.push(...parseJsonLdServices(hoursEntries))
  }

  // Look for itemprop="founder" or itemprop="employee"
  let pastorName: string | null = null
  const founderMatch = html.match(/itemprop=["']founder["'][^>]*>([^<]+)/i)
  if (founderMatch) {
    pastorName = founderMatch[1].trim()
  }

  if (services.length === 0 && !pastorName) return null

  return {
    pastorName,
    denomination: null,
    denominationFamily: null,
    yearEstablished: null,
    services,
    confidence: 0.75,
    confidenceLevel: 'medium',
    source: 'microdata',
  }
}

// ────────────────────────────────────────────────────────────────
// Strategy 3: HTML pattern matching (best-effort)
// ────────────────────────────────────────────────────────────────

function tryHtmlPatterns(html: string): ExtractedChurchData | null {
  const services: ExtractedService[] = []

  // Look for day + time patterns in the full HTML text
  // Matches: "Sunday: 9:00am", "Sunday 9:00 AM & 11:00 AM", "Sundays at 10:30am"
  const dayTimeRegex =
    /\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)s?\b[:\s\-–—at]*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/gi

  let dtMatch: RegExpExecArray | null = null
  const seen = new Set<string>()

  while ((dtMatch = dayTimeRegex.exec(html)) !== null) {
    const dayName = dtMatch[1].toLowerCase()
    const dayOfWeek = DAY_MAP[dayName]
    if (dayOfWeek === undefined) continue

    const startTime = to24Hour(dtMatch[2].trim())
    if (!startTime) continue

    const key = `${dayOfWeek}-${startTime}`
    if (seen.has(key)) continue
    seen.add(key)

    services.push({
      dayOfWeek,
      startTime,
      endTime: null,
      serviceType: 'Service',
      language: 'English',
    })
  }

  // Look for pastor name patterns
  let pastorName: string | null = null
  const pastorPatterns = [
    /(?:senior\s+)?pastor[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
    /(?:rev(?:erend)?|father|fr\.|minister)[.\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  ]
  for (const pattern of pastorPatterns) {
    const pMatch = html.match(pattern)
    if (pMatch) {
      pastorName = pMatch[1].trim()
      break
    }
  }

  if (services.length === 0 && !pastorName) return null

  return {
    pastorName,
    denomination: null,
    denominationFamily: null,
    yearEstablished: null,
    services,
    confidence: 0.6,
    confidenceLevel: 'medium',
    source: 'html-pattern',
  }
}

// ────────────────────────────────────────────────────────────────
// Main entry point — try strategies in order of reliability
// ────────────────────────────────────────────────────────────────

/**
 * Attempt to extract church data from raw HTML using deterministic
 * parsing (no AI). Tries JSON-LD, microdata, then HTML patterns.
 */
export function parseStructuredData(html: string): ExtractedChurchData | null {
  return tryJsonLd(html) ?? tryMicrodata(html) ?? tryHtmlPatterns(html)
}
