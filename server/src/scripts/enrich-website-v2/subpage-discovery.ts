/**
 * Discover relevant subpages from a church website's homepage HTML.
 *
 * We prefer pages likely to contain pastor/staff info, service times,
 * mission statements, and denomination. Noisy or low-signal pages (blog,
 * shop, privacy policy) are skipped.
 */

// Ordered by priority: if we only have budget for N subpages, these are
// the patterns we want to match first.
const SUBPAGE_PATTERNS: RegExp[] = [
  /\/about(?:-us)?\/?$/i,
  /\/who-we-are\/?$/i,
  /\/our-church\/?$/i,
  /\/what-we-believe\/?$/i,
  /\/beliefs\/?$/i,
  /\/(?:staff|leadership|pastors?|team|clergy)\/?$/i,
  /\/(?:services|service-times|worship|mass-times)\/?$/i,
  /\/ministries\/?$/i,
  /\/contact(?:-us)?\/?$/i,
  /\/visit\/?$/i,
  /\/events\/?$/i,
  /\/calendar\/?$/i,
]

// Pages we explicitly do NOT want to crawl.
const DENY_PATTERNS: RegExp[] = [
  /\/(?:blog|news|sermons?|podcast|media|gallery|photos?|videos?)(?:\/|$)/i,
  /\/(?:shop|store|donate|giving|give|tithe)(?:\/|$)/i,
  /\/(?:privacy|terms|cookies|accessibility-statement)(?:\/|$)/i,
  /\/(?:login|signin|signup|register|account)(?:\/|$)/i,
  /\.(?:pdf|jpg|jpeg|png|gif|mp3|mp4|mov|zip|doc|docx)(?:\?|$)/i,
  /#/,
]

export interface DiscoveredLink {
  url: string
  priority: number
  anchorText: string
}

/**
 * Extract href + anchor text from an `<a>` tag.
 */
function extractLinks(html: string): Array<{ href: string; text: string }> {
  const out: Array<{ href: string; text: string }> = []
  const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match: RegExpExecArray | null = null
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1].trim()
    const text = match[2]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (href) out.push({ href, text })
  }
  return out
}

/**
 * Discover subpages from homepage HTML. Returns up to `maxPages` absolute URLs
 * in priority order, on the same origin as `homepageUrl`.
 */
export function discoverSubpages(
  html: string,
  homepageUrl: string,
  maxPages = 5,
): DiscoveredLink[] {
  let origin: string
  try {
    origin = new URL(homepageUrl).origin
  } catch {
    return []
  }

  const rawLinks = extractLinks(html)
  const seen = new Set<string>()
  const candidates: DiscoveredLink[] = []

  for (const { href, text } of rawLinks) {
    let absolute: string
    try {
      absolute = new URL(href, homepageUrl).toString()
    } catch {
      continue
    }

    // Strip fragments/queries for dedup and matching
    let normalized: string
    try {
      const u = new URL(absolute)
      if (u.origin !== origin) continue
      u.hash = ''
      u.search = ''
      normalized = u.toString()
    } catch {
      continue
    }

    if (seen.has(normalized)) continue
    seen.add(normalized)

    if (normalized === homepageUrl) continue
    if (DENY_PATTERNS.some((p) => p.test(normalized))) continue

    const path = new URL(normalized).pathname

    const priority = SUBPAGE_PATTERNS.findIndex((p) => p.test(path))
    if (priority === -1) continue

    candidates.push({ url: normalized, priority, anchorText: text })
  }

  candidates.sort((a, b) => a.priority - b.priority)

  // Dedup so we don't pick two URLs hitting the same priority bucket
  // unless they add coverage.
  const picked: DiscoveredLink[] = []
  const usedPriorities = new Set<number>()
  for (const c of candidates) {
    if (picked.length >= maxPages) break
    if (usedPriorities.has(c.priority) && picked.length >= maxPages / 2) continue
    picked.push(c)
    usedPriorities.add(c.priority)
  }

  return picked.slice(0, maxPages)
}
