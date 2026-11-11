/**
 * Discover relevant subpages from a church website's homepage HTML.
 *
 * We prefer pages likely to contain pastor/staff info, service times,
 * mission statements, and denomination. Noisy or low-signal pages (blog,
 * shop, privacy policy) are skipped.
 */

// Ordered by priority: if we only have budget for N subpages, these are the
// kinds of page we want first. Each kind is recognized by its URL path or by
// the link's visible text ("Mass Times", "Plan Your Visit", "Horarios"),
// because many sites use opaque paths like /im-new or /page-3.
//
// Service times come first: they are the single most useful fact on a
// profile and the one most often missing from the homepage.
const SUBPAGE_KINDS: { path: RegExp; text: RegExp }[] = [
  {
    path: /\/(?:mass(?:-|_)?(?:times|schedule)|service(?:-|_)?times|services|worship(?:-|_)?(?:times|services|schedule)?|schedule|times|gatherings?|sundays?|horarios?|servicios|misas?)\/?$/i,
    text: /\b(?:mass(?:es)?(?: times| schedule)?|service times?|worship (?:times|services|schedule)|sunday (?:services?|worship|mornings?)|times? (?:&|and) (?:locations?|directions)|when we meet|gatherings?|horarios?|servicios|misas?)\b/i,
  },
  {
    path: /\/(?:visit|plan(?:-|_)?(?:your|a)(?:-|_)?visit|new(?:-|_)?here|im(?:-|_)?new|i-am-new|first(?:-|_)?time|what(?:-|_)?to(?:-|_)?expect|welcome|guests?|visitors?)\/?$/i,
    text: /\b(?:plan (?:your|a) visit|visit(?: us)?|new here|i['’]?m new|first[- ]time|what to expect|guests?|visitors?)\b/i,
  },
  {
    path: /\/(?:about(?:-[\w-]+)?|who-we-are|our-church|our-story|nosotros|quienes-somos)\/?$/i,
    text: /^(?:about(?: [\w ]{1,24})?|who we are|our (?:church|story)|nosotros)$/i,
  },
  {
    path: /\/(?:staff|leadership|pastors?|team|clergy|our-team|our-staff)\/?$/i,
    text: /^(?:(?:our )?(?:staff|leadership|pastors?|team|clergy))$/i,
  },
  {
    path: /\/(?:what-we-believe|beliefs|our-beliefs|statement-of-faith)\/?$/i,
    text: /^(?:what we believe|(?:our )?beliefs|statement of faith)$/i,
  },
  { path: /\/contact(?:-us)?\/?$/i, text: /^contact(?: us)?$/i },
  { path: /\/ministries\/?$/i, text: /^ministries$/i },
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

const bareHost = (url: URL): string => url.hostname.toLowerCase().replace(/^www\./, '')

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
  // Sites freely mix "www." and bare hostnames (and http/https) in their own
  // links, so "same site" means the same host ignoring a leading "www.".
  let siteHost: string
  try {
    siteHost = bareHost(new URL(homepageUrl))
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
      if (!/^https?:$/.test(u.protocol) || bareHost(u) !== siteHost) continue
      u.hash = ''
      u.search = ''
      normalized = u.toString()
    } catch {
      continue
    }

    if (seen.has(normalized)) continue
    seen.add(normalized)

    if (normalized.replace(/\/$/, '') === homepageUrl.replace(/\/$/, '')) continue
    if (DENY_PATTERNS.some((p) => p.test(normalized))) continue

    const path = new URL(normalized).pathname
    // Deep paths are articles and event pages, not the site's standing pages.
    if (path.split('/').filter(Boolean).length > 3) continue

    const priority = SUBPAGE_KINDS.findIndex((kind) => kind.path.test(path) || kind.text.test(text))
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
