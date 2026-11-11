/**
 * Normalizers for values taken verbatim from Google Places.
 *
 * Listing owners type names in ALL CAPS and paste websites with tracking
 * parameters; both are cleaned before they reach the database.
 */

const SMALL_WORDS = new Set([
  'a',
  'and',
  'at',
  'de',
  'del',
  'el',
  'en',
  'in',
  'la',
  'las',
  'los',
  'of',
  'on',
  'por',
  'the',
  'y',
])

const ACRONYMS = new Set([
  'AG',
  'AME',
  'CF',
  'CME',
  'COGIC',
  'ELCA',
  'IAFCJ',
  'II',
  'III',
  'IV',
  'LCMS',
  'LDS',
  'PCA',
  'RCCG',
  'SA',
  'SDA',
  'TX',
  'UMC',
  'UPCI',
  'USA',
])

const letters = (value: string): string => value.replace(/[^\p{L}]/gu, '')

const titleWord = (word: string, isFirst: boolean): string => {
  const upper = word.toUpperCase()
  if (ACRONYMS.has(upper)) return upper
  const lower = word.toLowerCase()
  if (!isFirst && SMALL_WORDS.has(lower)) return lower
  // Capitalize the first letter, and the letter after an apostrophe-free
  // hyphen ("Spirit-Filled"); leave the rest lowercase.
  return lower.replace(
    /(^|-)(\p{L})/gu,
    (_match, sep: string, ch: string) => sep + ch.toUpperCase(),
  )
}

/**
 * Tidy a church name for display. Names typed entirely in upper or lower case
 * are title-cased; mixed-case names are the owner's deliberate styling and
 * are only trimmed.
 */
export function normalizeChurchName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ')
  const alpha = letters(trimmed)
  // A lone all-caps word is almost always an acronym ("SABA", "CRC").
  if (alpha.length < 4 || !/\s/.test(trimmed)) return trimmed
  const isShouting = alpha === alpha.toUpperCase()
  const isWhisper = alpha === alpha.toLowerCase()
  if (!isShouting && !isWhisper) return trimmed

  let index = 0
  return trimmed.replace(/[\p{L}\p{N}'’-]+/gu, (word) => titleWord(word, index++ === 0))
}

const TRACKING_PARAMS = /^(utm_\w+|fbclid|gclid|y_source|tsid|source|ref|mibextid|igshid)$/i

/**
 * Remove tracking parameters from a website URL. Returns null for anything
 * that is not an http(s) URL — a profile must never link to `javascript:`.
 */
export function cleanWebsiteUrl(website: string | null | undefined): string | null {
  if (!website) return null
  let url: URL
  try {
    url = new URL(website.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.test(key)) url.searchParams.delete(key)
  }
  url.hash = ''
  return url.toString()
}
