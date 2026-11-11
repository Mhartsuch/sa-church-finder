import type { ExtractedService } from './types.js'

/**
 * Service Evidence
 *
 * A service time is only kept when that time is written on the church's own
 * pages. This is a cheap, deterministic guard against a reading pass that
 * invents a plausible "Sunday 10:30" for a site that never states one.
 */

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Regex matching the ways a site might write a 24-hour "HH:MM" time:
 * "10:30", "10:30am", "10:30 a.m.", "10 AM" (on the hour), "noon", "18:30".
 */
export function timePattern(time: string): RegExp | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time)
  if (!match) return null
  const hour24 = parseInt(match[1], 10)
  const minutes = match[2]
  if (hour24 > 23) return null

  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  const meridiem = hour24 < 12 ? 'a' : 'p'
  const alternatives = [
    // 12-hour with minutes, meridiem optional: "10:30", "10:30 am", "10.30am"
    `(?<![\\d:])0?${hour12}[:.]${minutes}(?!\\d)`,
    // 24-hour: "18:30"
    hour24 >= 13 ? `(?<![\\d:])${hour24}[:.]${minutes}(?!\\d)` : null,
    // On the hour, meridiem required: "10 am", "10AM", "10 a.m."
    minutes === '00' ? `(?<![\\d:.])0?${hour12}\\s*${meridiem}\\.?\\s?m\\b` : null,
    time === '12:00' ? escapeRegex('noon') : null,
    time === '00:00' ? escapeRegex('midnight') : null,
  ].filter((alternative): alternative is string => alternative !== null)
  return new RegExp(alternatives.join('|'), 'i')
}

/** Whether the given time appears somewhere in the site text. */
export function timeAppearsInText(time: string, text: string): boolean {
  const pattern = timePattern(time)
  return pattern !== null && pattern.test(text)
}

/**
 * Splits extracted services into those whose start time is written on the
 * site and those with no supporting text.
 */
export function partitionByEvidence(
  services: ExtractedService[],
  siteText: string,
): { supported: ExtractedService[]; unsupported: ExtractedService[] } {
  const supported: ExtractedService[] = []
  const unsupported: ExtractedService[] = []
  for (const service of services) {
    if (timeAppearsInText(service.startTime, siteText)) supported.push(service)
    else unsupported.push(service)
  }
  return { supported, unsupported }
}

const NAME_STOPWORDS =
  /\b(?:the|and|of|our|church|ministr(?:y|ies)|staff|team|pastor|pastors|father|son|holy|spirit|god|jesus|christ|lord|welcome|welcomes|parish|office|leadership|search|updates?|letter|news|click|here|more|page|home|you|us)\b/i

/**
 * Whether a string looks like a person's name: two to four capitalized
 * words (titles and suffixes allowed) and no words that give away a scraped
 * phrase ("and the Son", "Our Pastors").
 */
export function isPlausiblePersonName(value: string): boolean {
  const name = value
    .trim()
    .replace(/^the\s+/i, '')
    .replace(
      /^(?:(?:rev(?:erend)?|fr|father|pastor|dr|bishop|deacon|msgr|monsignor|elder|apostle)\.?\s+)+/i,
      '',
    )
    .replace(/,?\s+(?:jr|sr|ii|iii|iv|ph\.?d|d\.?min|m\.?div)\.?$/i, '')
  // A couple who pastor together: "Eliezer and Dorcas Bonilla".
  const couple =
    /^(\p{Lu}[\p{L}'’.-]*)\s+(?:and|&|y)\s+(\p{Lu}[\p{L}'’.-]*\s+\p{Lu}[\p{L}'’.-]*)$/u.exec(name)
  if (couple) return !NAME_STOPWORDS.test(`${couple[1]} ${couple[2]}`)
  if (NAME_STOPWORDS.test(name)) return false
  return /^\p{Lu}[\p{L}'’.-]*(?:\s+(?:\p{Lu}[\p{L}'’.-]*|de|del|la|van|von)){1,3}$/u.test(name)
}
