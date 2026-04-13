/**
 * Website fetcher for the church event discovery pipeline.
 *
 * Fetches church website HTML, finds event-related pages, and
 * extracts clean text content for LLM processing.
 */

import type { WebsiteContent } from './types.js'

const USER_AGENT = 'SAChurchFinder/1.0 (Church Event Discovery; +https://sachurchfinder.com)'

const FETCH_TIMEOUT_MS = 15_000

/** URL path segments that typically indicate event/calendar pages */
const EVENT_PATH_PATTERNS = [
  /\/events?\b/i,
  /\/calendar\b/i,
  /\/upcoming\b/i,
  /\/whats-?happening\b/i,
  /\/activities\b/i,
  /\/schedule\b/i,
  /\/ministries\b/i,
]

/** Href patterns to exclude (social media, external, assets, etc.) */
const EXCLUDED_HREF_PATTERNS = [
  /^mailto:/i,
  /^tel:/i,
  /^#/,
  /\.(pdf|jpg|jpeg|png|gif|svg|mp3|mp4|doc|docx|zip)$/i,
  /facebook\.com/i,
  /twitter\.com/i,
  /instagram\.com/i,
  /youtube\.com/i,
  /tiktok\.com/i,
]

/**
 * Strip HTML tags that contain non-content data (scripts, styles, etc.)
 * and extract readable text.
 */
export function extractTextFromHtml(html: string): string {
  let cleaned = html

  // Remove script, style, svg, and noscript blocks entirely
  cleaned = cleaned.replace(/<(script|style|svg|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '')

  // Replace <br>, <p>, <div>, <li>, <h*>, <tr> with newlines for readability
  cleaned = cleaned.replace(/<\/?(?:br|p|div|li|h[1-6]|tr|section|article)[^>]*>/gi, '\n')

  // Remove all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ')

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/&\w+;/g, ' ')

  // Collapse whitespace
  cleaned = cleaned.replace(/[ \t]+/g, ' ')
  cleaned = cleaned.replace(/\n[ \t]+/g, '\n')
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')

  return cleaned.trim()
}

/**
 * Extract links from HTML that look like they lead to event/calendar pages.
 * Returns absolute URLs.
 */
export function findEventPageUrls(html: string, baseUrl: string): string[] {
  const hrefRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi
  const urls = new Set<string>()

  let match: RegExpExecArray | null = hrefRegex.exec(html)
  while (match) {
    const href = match[1]
    match = hrefRegex.exec(html)

    // Skip excluded patterns
    if (EXCLUDED_HREF_PATTERNS.some((pattern) => pattern.test(href))) continue

    // Check if the href matches an event-related path
    if (!EVENT_PATH_PATTERNS.some((pattern) => pattern.test(href))) continue

    try {
      const absoluteUrl = new URL(href, baseUrl).href
      // Only keep URLs on the same domain
      const base = new URL(baseUrl)
      const target = new URL(absoluteUrl)
      if (target.hostname === base.hostname) {
        urls.add(absoluteUrl)
      }
    } catch {
      // Invalid URL — skip
    }
  }

  return [...urls]
}

/**
 * Fetch a URL and return the HTML body. Returns null on failure.
 */
async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) return null

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return null
    }

    return await response.text()
  } catch {
    return null
  }
}

/**
 * Fetch a church website, discover event pages, and return combined content.
 *
 * 1. Fetches the homepage
 * 2. Finds links to event/calendar pages
 * 3. Fetches up to 3 event pages
 * 4. Returns combined text content
 */
export async function fetchChurchWebsite(
  websiteUrl: string,
  rateLimitDelay: () => Promise<void>,
): Promise<WebsiteContent | null> {
  // Normalize the URL
  let normalizedUrl = websiteUrl.trim()
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`
  }

  await rateLimitDelay()
  const homepageHtml = await fetchPage(normalizedUrl)
  if (!homepageHtml) return null

  const homepageText = extractTextFromHtml(homepageHtml)
  const eventPageUrls = findEventPageUrls(homepageHtml, normalizedUrl)

  // Fetch up to 3 event pages
  const MAX_EVENT_PAGES = 3
  const eventPageTexts: string[] = []

  for (const eventUrl of eventPageUrls.slice(0, MAX_EVENT_PAGES)) {
    await rateLimitDelay()
    const pageHtml = await fetchPage(eventUrl)
    if (pageHtml) {
      eventPageTexts.push(extractTextFromHtml(pageHtml))
    }
  }

  // Combine all text content
  const allText = [homepageText, ...eventPageTexts].join('\n\n---PAGE BREAK---\n\n')

  // Truncate to ~50k chars to stay within Claude's practical limits
  const MAX_CONTENT_LENGTH = 50_000
  const truncatedText =
    allText.length > MAX_CONTENT_LENGTH ? allText.slice(0, MAX_CONTENT_LENGTH) : allText

  return {
    url: normalizedUrl,
    textContent: truncatedText,
    eventPageUrls,
  }
}
