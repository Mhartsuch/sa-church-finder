/**
 * Listing Quality
 *
 * Google's `church` place type sweeps in things that are not places to
 * worship: parish offices, schools, cemeteries, food pantries, gyms, building
 * entrances. Showing them as churches is wrong information, so the pipeline
 * flags them and the API hides them.
 *
 * Detection is deliberately conservative: a name has to say what the place
 * is. A congregation that also runs a school ("St. Andrew's Church & School")
 * is still a church.
 */

export type NonChurchReason =
  | 'office'
  | 'school'
  | 'cemetery'
  | 'charity'
  | 'facility'
  | 'residence'
  | 'business'
  | 'not_a_congregation'

interface NonChurchRule {
  reason: NonChurchReason
  pattern: RegExp
}

/** A name that also says "church", "chapel", etc. keeps its listing for school/facility rules. */
const WORSHIP_WORDS =
  /\b(church|iglesia|chapel|capilla|parish|cathedral|basilica|shrine|congregation|fellowship|temple|templo|worship)\b/i

const ALWAYS_NON_CHURCH: NonChurchRule[] = [
  {
    reason: 'office',
    pattern:
      /\b(parish|church|mission|diocese|diocesan|corporation|district|conference)\s+offices?\b|\boffices?$|\bdiocese[- ]/i,
  },
  { reason: 'cemetery', pattern: /\b(cemetery|cementerio|mausoleum|columbarium|funeral)\b/i },
  { reason: 'business', pattern: /\b(monuments?|thrift|bookstore|gift\sshop)\b/i },
  {
    reason: 'charity',
    pattern:
      /\b(food\s(pantry|distribution|bank)|st\.?\svincent\sde\spaul\s(society|ministry)|assistance\sministry|healthcare\sministries|community\sdev(elopment)?\scent(er|re))\b/i,
  },
  {
    reason: 'facility',
    pattern:
      /\b(gym|gymnasium|entrance|parking|pavill?ion|scout\slodge|bldg|cultural\scenter|scottish\srite)\b/i,
  },
  { reason: 'residence', pattern: /\b(convent|residence|rectory|retirement)\b/i },
  {
    reason: 'not_a_congregation',
    pattern: /\b(best\spractices|student\sministries|weekly\sbible\sstudy)\b/i,
  },
]

/** Applied only when the name has no worship word of its own. */
const NON_CHURCH_WITHOUT_WORSHIP_WORD: NonChurchRule[] = [
  { reason: 'facility', pattern: /\bhall$/i },
  {
    reason: 'school',
    pattern:
      /\b(school|preschool|pre-school|academy|montessori|learning\scenter|day\s?care|child\scare|early\slearning|seminary|university|college)\b/i,
  },
]

/**
 * Schools named after the church they belong to ("St. George Episcopal
 * School") have no worship word once the denomination is set aside.
 */
const TRAILING_SCHOOL =
  /\b(day\sschool|montessori\sschool|early\slearning\scenter|catholic\sschool|episcopal\sschool|lutheran\sschool|christian\sschool|christian\sacademy)$/i

/**
 * Listings in the San Antonio data that are street names, businesses or
 * online-only ministries. Keys are lowercased names.
 */
const KNOWN_NON_CHURCHES = new Set([
  'rua jacinto pinto',
  'w.w.white road',
  'villa coronado',
  's3',
  'tru2dagam3',
  'mission',
  'crc',
  'la casa bonita',
  'latinas woman of faith',
  'hesch family ministry',
  'bythel hagee life center',
])

const KINGDOM_HALL = /\bkingdom\shall\b/i

/**
 * Returns why a listing is not a place of worship, or null when it is (or
 * may be) one.
 */
export function detectNonChurch(name: string): NonChurchReason | null {
  const trimmed = name.trim().replace(/\s+/g, ' ')
  if (!trimmed) return 'not_a_congregation'
  // "Kingdom Hall" is a place of worship despite the trailing "Hall" rule.
  if (KINGDOM_HALL.test(trimmed)) return null

  for (const { reason, pattern } of ALWAYS_NON_CHURCH) {
    if (pattern.test(trimmed)) return reason
  }
  if (KNOWN_NON_CHURCHES.has(trimmed.toLowerCase())) return 'not_a_congregation'
  if (TRAILING_SCHOOL.test(trimmed) && !/\bchurch\b/i.test(trimmed)) return 'school'
  if (!WORSHIP_WORDS.test(trimmed)) {
    for (const { reason, pattern } of NON_CHURCH_WITHOUT_WORSHIP_WORD) {
      if (pattern.test(trimmed)) return reason
    }
  }
  return null
}

// ── Duplicate detection ──

export interface DuplicateCandidate {
  id: string
  name: string
  latitude: number
  longitude: number
  /** Higher is the better record to keep. */
  completeness: number
}

const NAME_NOISE =
  /\b(the|of|de|la|el|church|iglesia|catholic|parish|san|antonio|tx|texas|sa|campus|inc)\b/g

/** Name reduced to its distinguishing words, for duplicate comparison. */
export function normalizeNameForMatch(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\bsaint\b/g, 'st')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(NAME_NOISE, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const EARTH_RADIUS_M = 6371000

export function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const toRad = (deg: number): number => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

const DUPLICATE_RADIUS_M = 150

/**
 * Finds listings that are the same congregation entered twice: the same
 * distinguishing name within 150 m. Returns a map of duplicate id → id of the
 * record to keep (the most complete one; ties keep the first seen).
 */
export function findDuplicates(candidates: DuplicateCandidate[]): Map<string, string> {
  const byName = new Map<string, DuplicateCandidate[]>()
  for (const candidate of candidates) {
    const key = normalizeNameForMatch(candidate.name)
    if (!key) continue
    const group = byName.get(key)
    if (group) group.push(candidate)
    else byName.set(key, [candidate])
  }

  const duplicates = new Map<string, string>()
  for (const group of byName.values()) {
    if (group.length < 2) continue
    const ranked = [...group].sort((a, b) => b.completeness - a.completeness)
    const kept: DuplicateCandidate[] = []
    for (const candidate of ranked) {
      const original = kept.find((k) => distanceMeters(k, candidate) <= DUPLICATE_RADIUS_M)
      if (original) duplicates.set(candidate.id, original.id)
      else kept.push(candidate)
    }
  }
  return duplicates
}
