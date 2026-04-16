import type {
  ExtractedChurchData,
  ExtractedEvent,
  ExtractedService,
  ExtractedSocialLinks,
  ExtractedStaffMember,
} from './types.js'
import { emptyExtracted } from './types.js'

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

function parseSchemaDayAbbrev(abbrev: string): number | null {
  return DAY_MAP[abbrev.toLowerCase()] ?? null
}

// ────────────────────────────────────────────────────────────────
// JSON-LD
// ────────────────────────────────────────────────────────────────

interface JsonLdObject {
  '@type'?: string | string[]
  name?: string
  description?: string
  email?: string
  telephone?: string
  foundingDate?: string
  openingHours?: string | string[]
  founder?: string | { name?: string }
  employee?: unknown
  address?: unknown
  sameAs?: string | string[]
  [key: string]: unknown
}

const CHURCH_TYPES = ['church', 'placeofworship', 'civicstructure', 'organization', 'localbusiness']

function matchesChurchType(typeField: string | string[] | undefined): boolean {
  if (!typeField) return false
  const types = Array.isArray(typeField) ? typeField : [typeField]
  return types.some((t) => CHURCH_TYPES.includes(t.toLowerCase()))
}

function parseOpeningHours(openingHours: string | string[]): ExtractedService[] {
  const entries = Array.isArray(openingHours) ? openingHours : [openingHours]
  const services: ExtractedService[] = []

  for (const entry of entries) {
    const match = entry.match(/^(\w{2})(?:-(\w{2}))?\s+(\d{2}:\d{2})(?:-(\d{2}:\d{2}))?$/)
    if (!match) continue

    const startDay = parseSchemaDayAbbrev(match[1])
    const endDay = match[2] ? parseSchemaDayAbbrev(match[2]) : null
    const startTime = match[3]
    const endTime = match[4] ?? null

    if (startDay === null) continue

    if (endDay !== null) {
      let day = startDay
      while (day !== (endDay + 1) % 7) {
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

function extractEmployees(raw: unknown): ExtractedStaffMember[] {
  if (!raw) return []
  const list = Array.isArray(raw) ? raw : [raw]
  const staff: ExtractedStaffMember[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const obj = item as { name?: unknown; jobTitle?: unknown }
    const name = typeof obj.name === 'string' ? obj.name.trim() : null
    if (!name) continue
    const role = typeof obj.jobTitle === 'string' ? obj.jobTitle.trim() : null
    staff.push({ name, role })
  }
  return staff
}

function extractPastorFromStaff(staff: ExtractedStaffMember[]): string | null {
  for (const s of staff) {
    if (s.role && /pastor|priest|reverend|minister|father|rector/i.test(s.role)) {
      return s.name
    }
  }
  return null
}

function parseSameAs(raw: unknown): ExtractedSocialLinks {
  const urls: string[] = []
  if (typeof raw === 'string') urls.push(raw)
  else if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string') urls.push(item)
    }
  }

  const result: ExtractedSocialLinks = {
    facebook: null,
    instagram: null,
    twitter: null,
    youtube: null,
  }
  for (const u of urls) {
    if (/facebook\.com/i.test(u)) result.facebook ??= u
    else if (/instagram\.com/i.test(u)) result.instagram ??= u
    else if (/(?:twitter|x)\.com/i.test(u)) result.twitter ??= u
    else if (/youtube\.com/i.test(u)) result.youtube ??= u
  }
  return result
}

function matchesEventType(typeField: string | string[] | undefined): boolean {
  if (!typeField) return false
  const types = Array.isArray(typeField) ? typeField : [typeField]
  return types.some((t) => /event/i.test(t))
}

function parseJsonLdEvent(obj: JsonLdObject): ExtractedEvent | null {
  const name = typeof obj.name === 'string' ? obj.name.trim() : null
  const startDate = typeof obj['startDate'] === 'string' ? (obj['startDate'] as string) : null
  if (!name || !startDate) return null

  // Validate + normalize to ISO 8601
  const startIso = new Date(startDate).toISOString()
  if (isNaN(new Date(startDate).getTime())) return null

  // Skip events in the past
  if (new Date(startDate).getTime() < Date.now() - 24 * 60 * 60 * 1000) return null

  const endRaw = typeof obj['endDate'] === 'string' ? (obj['endDate'] as string) : null
  const endIso =
    endRaw && !isNaN(new Date(endRaw).getTime()) ? new Date(endRaw).toISOString() : null

  const description =
    typeof obj['description'] === 'string' ? (obj['description'] as string).slice(0, 2000) : null
  const url = typeof obj['url'] === 'string' ? (obj['url'] as string) : null

  let locationOverride: string | null = null
  const loc = obj['location']
  if (loc && typeof loc === 'object' && !Array.isArray(loc)) {
    const locName = (loc as Record<string, unknown>).name
    if (typeof locName === 'string') locationOverride = locName.slice(0, 200)
  } else if (typeof loc === 'string') {
    locationOverride = loc.slice(0, 200)
  }

  return {
    title: name.slice(0, 200),
    description,
    eventType: 'other',
    startTime: startIso,
    endTime: endIso,
    locationOverride,
    sourceUrl: url,
  }
}

function tryJsonLd(html: string): Partial<ExtractedChurchData> | null {
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
      // skip malformed JSON
    }
  }

  // Harvest any Event-typed JSON-LD objects across the page
  const events: ExtractedEvent[] = []
  for (const obj of results) {
    if (matchesEventType(obj['@type'])) {
      const ev = parseJsonLdEvent(obj)
      if (ev) events.push(ev)
    }
  }

  const churchObj = results.find((obj) => matchesChurchType(obj['@type']))

  // If we found events but no church object, still return what we have.
  if (!churchObj) {
    return events.length > 0 ? { events } : null
  }

  const services = churchObj.openingHours ? parseOpeningHours(churchObj.openingHours) : []
  const staff = extractEmployees(churchObj.employee)
  const pastorName =
    typeof churchObj.founder === 'string'
      ? churchObj.founder
      : churchObj.founder && typeof churchObj.founder === 'object' && 'name' in churchObj.founder
        ? (churchObj.founder.name ?? null)
        : extractPastorFromStaff(staff)

  let yearEstablished: number | null = null
  if (typeof churchObj.foundingDate === 'string') {
    const yearMatch = churchObj.foundingDate.match(/^(\d{4})/)
    if (yearMatch) yearEstablished = parseInt(yearMatch[1], 10)
  }

  return {
    pastorName,
    description:
      typeof churchObj.description === 'string' ? churchObj.description.slice(0, 2000) : null,
    email: typeof churchObj.email === 'string' ? churchObj.email : null,
    phone: typeof churchObj.telephone === 'string' ? churchObj.telephone : null,
    yearEstablished,
    services,
    staff,
    socialLinks: parseSameAs(churchObj.sameAs),
    events,
  }
}

// ────────────────────────────────────────────────────────────────
// Anchor-harvested hints (mailto:/tel:/social)
// ────────────────────────────────────────────────────────────────

/**
 * Scan anchor hrefs + text for common church nav links and return the first
 * absolute URL for each category, if any.
 */
function harvestNamedLinks(html: string, baseUrl?: string): Partial<ExtractedChurchData> {
  const anchorRe = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  const result: Partial<ExtractedChurchData> = {}
  let m: RegExpExecArray | null = null

  const resolve = (href: string): string | null => {
    try {
      return baseUrl ? new URL(href, baseUrl).toString() : href
    } catch {
      return null
    }
  }

  while ((m = anchorRe.exec(html)) !== null) {
    const href = m[1].trim()
    const text = m[2]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue
    }
    const abs = resolve(href)
    if (!abs) continue

    if (!result.sermonUrl && /(sermons?|messages|podcast|watch)/i.test(text + ' ' + href)) {
      result.sermonUrl = abs
    }
    if (
      !result.livestreamUrl &&
      /(live\s*stream|watch\s*live|livestream)/i.test(text + ' ' + href)
    ) {
      result.livestreamUrl = abs
    }
    if (
      !result.statementOfFaithUrl &&
      /(what\s*we\s*believe|statement\s*of\s*faith|beliefs)/i.test(text + ' ' + href)
    ) {
      result.statementOfFaithUrl = abs
    }
    if (!result.givingUrl && /\b(give|donate|tithe|giving)\b/i.test(text + ' ' + href)) {
      result.givingUrl = abs
    }
    if (
      !result.newVisitorUrl &&
      /(plan\s*your\s*visit|new\s*here|first\s*time|connect\s*card|visit\s*us)/i.test(
        text + ' ' + href,
      )
    ) {
      result.newVisitorUrl = abs
    }
  }

  return result
}

/**
 * Common church ministry names we can detect without the LLM. Extendable.
 */
const MINISTRY_KEYWORDS: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /celebrate\s+recovery/i, canonical: 'Celebrate Recovery' },
  { pattern: /\bawana\b/i, canonical: 'AWANA' },
  { pattern: /\bmops\b/i, canonical: 'MOPS' },
  { pattern: /youth\s+(?:ministry|group)/i, canonical: 'Youth Ministry' },
  { pattern: /children'?s?\s+(?:ministry|church)/i, canonical: "Children's Ministry" },
  { pattern: /women'?s?\s+(?:ministry|bible\s+study|group)/i, canonical: "Women's Ministry" },
  { pattern: /men'?s?\s+(?:ministry|bible\s+study|group)/i, canonical: "Men's Ministry" },
  { pattern: /young\s+adults?/i, canonical: 'Young Adults' },
  { pattern: /(?:life|small|community|home)\s+groups?/i, canonical: 'Small Groups' },
  {
    pattern: /marriage\s+ministry|couples'?\s+(?:ministry|group)/i,
    canonical: 'Marriage Ministry',
  },
  { pattern: /grief\s+(?:share|support)/i, canonical: 'GriefShare' },
  { pattern: /divorce\s*care/i, canonical: 'DivorceCare' },
  { pattern: /missions?\s+(?:ministry|program)/i, canonical: 'Missions' },
  { pattern: /worship\s+(?:ministry|team|band)/i, canonical: 'Worship Ministry' },
  { pattern: /prayer\s+(?:ministry|team|group)/i, canonical: 'Prayer Ministry' },
  { pattern: /recovery\s+ministry/i, canonical: 'Recovery Ministry' },
  { pattern: /esl\b|english\s+as\s+a\s+second\s+language/i, canonical: 'ESL' },
  { pattern: /food\s+(?:pantry|bank)/i, canonical: 'Food Pantry' },
]

function harvestMinistries(html: string): string[] {
  const found = new Set<string>()
  for (const { pattern, canonical } of MINISTRY_KEYWORDS) {
    if (pattern.test(html)) found.add(canonical)
  }
  return Array.from(found)
}

/**
 * Pattern-match common denomination affiliations in free text.
 */
const AFFILIATION_PATTERNS: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /southern\s+baptist\s+convention|\bsbc\b/i, canonical: 'Southern Baptist Convention' },
  {
    pattern: /presbyterian\s+church\s+in\s+america|\bpca\b/i,
    canonical: 'Presbyterian Church in America',
  },
  {
    pattern: /lutheran\s+church\s+missouri\s+synod|\blcms\b/i,
    canonical: 'Lutheran Church—Missouri Synod',
  },
  {
    pattern: /evangelical\s+lutheran\s+church\s+in\s+america|\belca\b/i,
    canonical: 'Evangelical Lutheran Church in America',
  },
  { pattern: /united\s+methodist\s+church|\bumc\b/i, canonical: 'United Methodist Church' },
  { pattern: /global\s+methodist\s+church|\bgmc\b/i, canonical: 'Global Methodist Church' },
  { pattern: /assemblies\s+of\s+god/i, canonical: 'Assemblies of God' },
  { pattern: /vineyard\s+usa/i, canonical: 'Vineyard USA' },
  {
    pattern: /christian\s+and\s+missionary\s+alliance|\bc&ma\b/i,
    canonical: 'Christian and Missionary Alliance',
  },
  {
    pattern: /evangelical\s+free\s+church|\befca\b/i,
    canonical: 'Evangelical Free Church of America',
  },
  { pattern: /church\s+of\s+the\s+nazarene/i, canonical: 'Church of the Nazarene' },
  { pattern: /roman\s+catholic/i, canonical: 'Roman Catholic Church' },
]

function harvestAffiliations(html: string): string[] {
  const found = new Set<string>()
  for (const { pattern, canonical } of AFFILIATION_PATTERNS) {
    if (pattern.test(html)) found.add(canonical)
  }
  return Array.from(found)
}

function detectServiceStyle(html: string): string | null {
  const lower = html.toLowerCase()
  const hasTrad = /\btraditional\s+(?:worship|service)/i.test(lower)
  const hasContemp = /\bcontemporary\s+(?:worship|service)/i.test(lower)
  if (hasTrad && hasContemp) return 'Blended'
  if (hasTrad) return 'Traditional'
  if (hasContemp) return 'Contemporary'
  if (/\bliturgical\b/i.test(lower)) return 'Liturgical'
  if (/\bblended\s+(?:worship|service)/i.test(lower)) return 'Blended'
  return null
}

function harvestContactHints(html: string): Partial<ExtractedChurchData> {
  const out: Partial<ExtractedChurchData> = {}

  const mailto = html.match(/href=["']mailto:([^"'?]+)/i)
  if (mailto) out.email = mailto[1].trim()

  const tel = html.match(/href=["']tel:([^"']+)/i)
  if (tel) out.phone = tel[1].trim()

  const ogDesc = html.match(
    /<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']+)["']/i,
  )
  if (ogDesc) out.description = ogDesc[1].slice(0, 2000)

  const socialLinks: ExtractedSocialLinks = {
    facebook: null,
    instagram: null,
    twitter: null,
    youtube: null,
  }
  const fb = html.match(/href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'?#]+)/i)
  if (fb) socialLinks.facebook = fb[1]
  const ig = html.match(/href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'?#]+)/i)
  if (ig) socialLinks.instagram = ig[1]
  const tw = html.match(/href=["'](https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"'?#]+)/i)
  if (tw) socialLinks.twitter = tw[1]
  const yt = html.match(/href=["'](https?:\/\/(?:www\.)?youtube\.com\/[^"'?#]+)/i)
  if (yt) socialLinks.youtube = yt[1]
  if (socialLinks.facebook || socialLinks.instagram || socialLinks.twitter || socialLinks.youtube) {
    out.socialLinks = socialLinks
  }

  return out
}

// ────────────────────────────────────────────────────────────────
// HTML text patterns (day + time, pastor line)
// ────────────────────────────────────────────────────────────────

function tryHtmlPatterns(html: string): Partial<ExtractedChurchData> {
  // Decode a handful of common HTML entities so pattern matching works on
  // pages that encode accented characters.
  const decoded = html
    .replace(/&amp;/g, '&')
    .replace(/&ntilde;/gi, 'ñ')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&#241;/g, 'ñ')
    .replace(/&#xf1;/gi, 'ñ')
    .replace(/&nbsp;/g, ' ')

  const services: ExtractedService[] = []
  const seen = new Set<string>()

  // For each day-name occurrence, look ahead up to ~120 chars for time
  // expressions and associate them with that day. This catches both
  // "Sunday at 9am" and "Sunday services at 9am and 11am".
  const dayRegex = /\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)s?\b/gi
  const timeRegex = /(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/gi
  let dm: RegExpExecArray | null = null
  while ((dm = dayRegex.exec(decoded)) !== null) {
    const dayOfWeek = DAY_MAP[dm[1].toLowerCase()]
    if (dayOfWeek === undefined) continue
    const windowStart = dm.index + dm[0].length
    const window = decoded.slice(windowStart, windowStart + 120)
    let tm: RegExpExecArray | null = null
    timeRegex.lastIndex = 0
    while ((tm = timeRegex.exec(window)) !== null) {
      const startTime = to24Hour(tm[1].trim())
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
  }

  let pastorName: string | null = null
  const pastorPatterns = [
    /(?:senior\s+|lead\s+)?pastor[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
    /(?:rev(?:erend)?|father|fr\.|minister|rector)[.\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  ]
  for (const pattern of pastorPatterns) {
    const m = decoded.match(pattern)
    if (m) {
      pastorName = m[1].trim()
      break
    }
  }

  // Spanish language hints
  const languages = new Set<string>()
  if (
    /en\s+espa[ñn]ol|spanish\s+service|servicio\s+en\s+espa[ñn]ol|misa\s+en\s+espa[ñn]ol/i.test(
      decoded,
    )
  ) {
    languages.add('Spanish')
  }
  if (/\s(in\s+english|english\s+service)\b/i.test(decoded) || languages.size > 0) {
    languages.add('English')
  }

  // Amenity hints
  const amenities = {
    goodForChildren:
      /children'?s\s+(?:ministry|church|program)|sunday\s+school|nursery|kids\s+(?:ministry|church)/i.test(
        decoded,
      ) || null,
    goodForGroups: /small\s+groups?|life\s+groups?|community\s+groups?/i.test(decoded) || null,
    wheelchairAccessible:
      /wheelchair\s+accessible|ada\s+accessible|handicap\s+accessible/i.test(decoded) || null,
  }

  // Year established
  let yearEstablished: number | null = null
  const yearMatch = decoded.match(/(?:founded|established|since)\s+(?:in\s+)?(\d{4})/i)
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10)
    const currentYear = new Date().getFullYear()
    if (year >= 1500 && year <= currentYear) yearEstablished = year
  }

  return {
    pastorName,
    services,
    yearEstablished,
    languages: Array.from(languages),
    amenities: {
      goodForChildren: amenities.goodForChildren === true ? true : null,
      goodForGroups: amenities.goodForGroups === true ? true : null,
      wheelchairAccessible: amenities.wheelchairAccessible === true ? true : null,
    },
  }
}

// ────────────────────────────────────────────────────────────────
// Merge helpers
// ────────────────────────────────────────────────────────────────

function mergeData(
  base: ExtractedChurchData,
  patch: Partial<ExtractedChurchData>,
): ExtractedChurchData {
  const out: ExtractedChurchData = { ...base }

  if (patch.pastorName && !out.pastorName) out.pastorName = patch.pastorName
  if (patch.denomination && !out.denomination) out.denomination = patch.denomination
  if (patch.denominationFamily && !out.denominationFamily)
    out.denominationFamily = patch.denominationFamily
  if (patch.yearEstablished && !out.yearEstablished) out.yearEstablished = patch.yearEstablished
  if (patch.description && !out.description) out.description = patch.description
  if (patch.email && !out.email) out.email = patch.email
  if (patch.phone && !out.phone) out.phone = patch.phone

  if (patch.languages && patch.languages.length > 0) {
    const set = new Set([...out.languages, ...patch.languages])
    out.languages = Array.from(set)
  }

  if (patch.amenities) {
    out.amenities = {
      goodForChildren: out.amenities.goodForChildren ?? patch.amenities.goodForChildren,
      goodForGroups: out.amenities.goodForGroups ?? patch.amenities.goodForGroups,
      wheelchairAccessible:
        out.amenities.wheelchairAccessible ?? patch.amenities.wheelchairAccessible,
    }
  }

  if (patch.socialLinks) {
    out.socialLinks = {
      facebook: out.socialLinks.facebook ?? patch.socialLinks.facebook,
      instagram: out.socialLinks.instagram ?? patch.socialLinks.instagram,
      twitter: out.socialLinks.twitter ?? patch.socialLinks.twitter,
      youtube: out.socialLinks.youtube ?? patch.socialLinks.youtube,
    }
  }

  if (patch.staff && patch.staff.length > 0) {
    const seen = new Set(out.staff.map((s) => s.name.toLowerCase()))
    for (const s of patch.staff) {
      if (!seen.has(s.name.toLowerCase())) {
        out.staff.push(s)
        seen.add(s.name.toLowerCase())
      }
    }
  }

  if (patch.services && patch.services.length > 0) {
    const seen = new Set(out.services.map((s) => `${s.dayOfWeek}-${s.startTime}`))
    for (const s of patch.services) {
      const key = `${s.dayOfWeek}-${s.startTime}`
      if (!seen.has(key)) {
        out.services.push(s)
        seen.add(key)
      }
    }
  }

  if (patch.ministries && patch.ministries.length > 0) {
    const set = new Set([...out.ministries, ...patch.ministries])
    out.ministries = Array.from(set)
  }
  if (patch.affiliations && patch.affiliations.length > 0) {
    const set = new Set([...out.affiliations, ...patch.affiliations])
    out.affiliations = Array.from(set)
  }

  if (patch.serviceStyle && !out.serviceStyle) out.serviceStyle = patch.serviceStyle
  if (patch.sermonUrl && !out.sermonUrl) out.sermonUrl = patch.sermonUrl
  if (patch.livestreamUrl && !out.livestreamUrl) out.livestreamUrl = patch.livestreamUrl
  if (patch.statementOfFaithUrl && !out.statementOfFaithUrl)
    out.statementOfFaithUrl = patch.statementOfFaithUrl
  if (patch.givingUrl && !out.givingUrl) out.givingUrl = patch.givingUrl
  if (patch.newVisitorUrl && !out.newVisitorUrl) out.newVisitorUrl = patch.newVisitorUrl
  if (patch.parkingInfo && !out.parkingInfo) out.parkingInfo = patch.parkingInfo
  if (patch.dressCode && !out.dressCode) out.dressCode = patch.dressCode

  if (patch.events && patch.events.length > 0) {
    const seen = new Set(out.events.map((e) => `${e.title.toLowerCase()}-${e.startTime}`))
    for (const e of patch.events) {
      const key = `${e.title.toLowerCase()}-${e.startTime}`
      if (!seen.has(key)) {
        out.events.push(e)
        seen.add(key)
      }
    }
  }

  return out
}

/**
 * Deterministically parse one HTML page and return any structured data found.
 * Unlike v1, this always returns a value — individual strategies merge into
 * a single object rather than winner-takes-all.
 */
export function parsePage(html: string, pageUrl?: string): ExtractedChurchData {
  let data = emptyExtracted()
  let hits = 0

  const jsonLd = tryJsonLd(html)
  if (jsonLd) {
    data = mergeData(data, jsonLd)
    hits++
  }

  const hints = harvestContactHints(html)
  if (Object.keys(hints).length > 0) {
    data = mergeData(data, hints)
    hits++
  }

  const patterns = tryHtmlPatterns(html)
  const patternHasData =
    !!patterns.services?.length ||
    !!patterns.pastorName ||
    !!patterns.yearEstablished ||
    !!patterns.languages?.length ||
    (patterns.amenities && Object.values(patterns.amenities).some((v) => v !== null))
  if (patternHasData) {
    data = mergeData(data, patterns)
    hits++
  }

  const namedLinks = harvestNamedLinks(html, pageUrl)
  if (Object.keys(namedLinks).length > 0) {
    data = mergeData(data, namedLinks)
  }

  const ministries = harvestMinistries(html)
  if (ministries.length > 0) {
    data = mergeData(data, { ministries })
  }

  const affiliations = harvestAffiliations(html)
  if (affiliations.length > 0) {
    data = mergeData(data, { affiliations })
  }

  const style = detectServiceStyle(html)
  if (style) {
    data = mergeData(data, { serviceStyle: style })
  }

  // Confidence: JSON-LD = high, hints + patterns = medium
  if (jsonLd && (jsonLd.services?.length || jsonLd.pastorName)) {
    data.confidence = 0.9
    data.source = 'json-ld'
  } else if (hits >= 2) {
    data.confidence = 0.7
    data.source = 'merged'
  } else if (hits === 1) {
    data.confidence = 0.6
    data.source = 'html-pattern'
  } else {
    data.confidence = 0
  }
  data.confidenceLevel = data.confidence >= 0.8 ? 'high' : data.confidence >= 0.5 ? 'medium' : 'low'

  return data
}

/**
 * Parse multiple pages and merge their extracted data into a single object.
 */
export function parsePages(pages: Array<{ url: string; html: string }>): ExtractedChurchData {
  let merged = emptyExtracted()
  let best = 0
  let bestSource: ExtractedChurchData['source'] = 'html-pattern'

  for (const page of pages) {
    const parsed = parsePage(page.html, page.url)
    if (parsed.confidence > best) {
      best = parsed.confidence
      bestSource = parsed.source
    }
    merged = mergeData(merged, parsed)
  }

  merged.confidence = best
  merged.source = bestSource
  merged.confidenceLevel = best >= 0.8 ? 'high' : best >= 0.5 ? 'medium' : 'low'
  return merged
}

/**
 * Does this extraction have anything worth applying?
 */
export function hasAnyData(data: ExtractedChurchData): boolean {
  return (
    data.pastorName !== null ||
    data.denomination !== null ||
    data.yearEstablished !== null ||
    data.description !== null ||
    data.email !== null ||
    data.phone !== null ||
    data.languages.length > 0 ||
    data.staff.length > 0 ||
    data.services.length > 0 ||
    data.events.length > 0 ||
    data.ministries.length > 0 ||
    data.affiliations.length > 0 ||
    data.serviceStyle !== null ||
    data.sermonUrl !== null ||
    data.livestreamUrl !== null ||
    data.statementOfFaithUrl !== null ||
    data.givingUrl !== null ||
    data.newVisitorUrl !== null ||
    data.parkingInfo !== null ||
    data.dressCode !== null ||
    Object.values(data.amenities).some((v) => v !== null) ||
    Object.values(data.socialLinks).some((v) => v !== null)
  )
}

export { mergeData }
