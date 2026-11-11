/**
 * Language Inferrer
 *
 * Infers likely worship languages for a church based on:
 *  1. Church name (Spanish-language names strongly signal Spanish services)
 *  2. Denomination (some denominations commonly offer bilingual services)
 *  3. Zip code / neighborhood (SA's West Side and South Side are
 *     predominantly Hispanic communities)
 *
 * This is a heuristic — it assigns *likely* languages, not confirmed ones.
 * Languages confirmed by the website stage always take precedence: this
 * module only fills an empty `languages` array.
 */

/**
 * Zip codes in predominantly Hispanic neighborhoods of San Antonio.
 * Source: US Census ACS 5-year demographic data for Bexar County.
 * A zip is included if the Hispanic population share is ≥ 65%.
 */
const HISPANIC_MAJORITY_ZIPS = new Set([
  '78201',
  '78202',
  '78203',
  '78204',
  '78207',
  '78210',
  '78211',
  '78214',
  '78221',
  '78224',
  '78225',
  '78226',
  '78227',
  '78228',
  '78237',
  '78242',
  '78264',
])

/**
 * Regex patterns that strongly indicate the church conducts services in Spanish.
 * Matches common Spanish-language church name prefixes and words.
 */
const SPANISH_NAME_PATTERNS = [
  /\biglesia\b/i,
  /\btemplo\b/i,
  /\bcapilla\b/i,
  /\bnuestra\b/i,
  /\bsagrado\b/i,
  /\bsanta\b/i,
  /\bsanto\b/i,
  // "San <saint>" — but never the city name, which is in hundreds of
  // English-speaking churches' names ("First Baptist Church of San Antonio").
  /\bsan\s(?!antonio\b(?!\sde\s))/i,
  /\bvida\b/i,
  /\bcasa\sde\b/i,
  /\bel\sseñor\b/i,
  /\bgracia\b/i,
  /\bcamino\b/i,
  /\bfuente\b/i,
  /\besp[ií]ritu\b/i,
  /\bcordero\b/i,
  /\bcristo\b/i,
  /\bmisión\b/i,
  /\bmision\b/i,
]

/**
 * Denominations whose parishes in predominantly Hispanic San Antonio zip
 * codes offer Spanish services almost without exception. Kept to Catholic:
 * for other traditions the zip code alone is a guess, not evidence.
 */
const COMMONLY_BILINGUAL_DENOMINATIONS = new Set(['Catholic', 'Eastern Catholic'])

interface LanguageInput {
  churchName: string
  denomination: string | null
  zipCode: string
}

/**
 * Infer likely worship languages for a church.
 *
 * Returns a de-duplicated, sorted array of language strings.
 * English is included for all churches since it's the majority language
 * in San Antonio. Spanish is added when signals are strong enough.
 */
export function inferLanguages(input: LanguageInput): string[] {
  const languages = new Set<string>()

  // Every church in SA offers English
  languages.add('English')

  // Signal 1: Spanish-language church name is the strongest signal
  const hasSpanishName = SPANISH_NAME_PATTERNS.some((pattern) => pattern.test(input.churchName))
  if (hasSpanishName) {
    languages.add('Spanish')
  }

  // Signal 2: Located in a predominantly Hispanic zip code AND in a
  // denomination that commonly offers bilingual services
  if (
    HISPANIC_MAJORITY_ZIPS.has(input.zipCode) &&
    input.denomination &&
    COMMONLY_BILINGUAL_DENOMINATIONS.has(input.denomination)
  ) {
    languages.add('Spanish')
  }

  // Signal 3: Spanish name in a Hispanic zip — very high confidence
  if (hasSpanishName && HISPANIC_MAJORITY_ZIPS.has(input.zipCode)) {
    // Already added above, but this reinforces the signal.
    // Could add more languages in the future (e.g., Vietnamese for
    // certain Catholic parishes).
    languages.add('Spanish')
  }

  return [...languages].sort()
}
