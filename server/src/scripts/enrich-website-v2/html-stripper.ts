/** Budget for one page, and for all pages combined, in characters. */
const MAX_TEXT_LENGTH = 16_000
const MAX_COMBINED_LENGTH = 28_000
const MIN_PAGE_BUDGET = 4_000

export interface StripOptions {
  /** Prepend an optional section header like "=== ABOUT PAGE ===". */
  header?: string
  /** Maximum characters to keep (default 16,000). */
  maxLength?: number
}

/**
 * Strip HTML to clean text. Preserves mailto:/tel: anchor contents, meta
 * og:description content, and emits anchor-harvested hints on separate lines
 * like `[email: x@y.com]` so the LLM can still see them.
 */
export function stripHtml(html: string, options: StripOptions = {}): string {
  let text = html

  // Harvest structured hints BEFORE we strip tags
  const harvested: string[] = []

  // og:description / description meta tags
  const ogDescMatch = text.match(
    /<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']+)["']/i,
  )
  if (ogDescMatch) harvested.push(`[meta-description] ${ogDescMatch[1]}`)

  const ogLocaleMatch = text.match(
    /<meta[^>]+property=["']og:locale["'][^>]+content=["']([^"']+)["']/i,
  )
  if (ogLocaleMatch) harvested.push(`[meta-locale] ${ogLocaleMatch[1]}`)

  const htmlLangMatch = text.match(/<html[^>]+lang=["']([^"']+)["']/i)
  if (htmlLangMatch) harvested.push(`[html-lang] ${htmlLangMatch[1]}`)

  // mailto: and tel: anchors
  const mailtoRegex = /href=["']mailto:([^"'?]+)/gi
  let m: RegExpExecArray | null = null
  const mailtos = new Set<string>()
  while ((m = mailtoRegex.exec(text)) !== null) {
    mailtos.add(m[1].trim())
  }
  for (const email of mailtos) harvested.push(`[email] ${email}`)

  const telRegex = /href=["']tel:([^"']+)/gi
  const tels = new Set<string>()
  while ((m = telRegex.exec(text)) !== null) {
    tels.add(m[1].trim())
  }
  for (const tel of tels) harvested.push(`[phone] ${tel}`)

  // Social links
  const socialPatterns: Array<{ platform: string; re: RegExp }> = [
    { platform: 'facebook', re: /href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'?#]+)/i },
    { platform: 'instagram', re: /href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'?#]+)/i },
    { platform: 'twitter', re: /href=["'](https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"'?#]+)/i },
    { platform: 'youtube', re: /href=["'](https?:\/\/(?:www\.)?youtube\.com\/[^"'?#]+)/i },
  ]
  for (const { platform, re } of socialPatterns) {
    const hit = text.match(re)
    if (hit) harvested.push(`[social-${platform}] ${hit[1]}`)
  }

  // Remove tags whose content is not useful
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
  // <footer> is kept on purpose: churches routinely put their service times
  // and address there and nowhere else.
  text = text.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
  text = text.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
  text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
  text = text.replace(/<!--[\s\S]*?-->/g, '')

  // Block-level tags → newlines
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<\/(?:p|div|li|h[1-6]|tr|section|blockquote)>/gi, '\n')
  text = text.replace(/<(?:p|div|li|h[1-6]|tr|section|blockquote)[^>]*>/gi, '\n')
  text = text.replace(/<[^>]+>/g, '')

  // Entity decode
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&apos;/g, "'")

  // Whitespace collapse
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n\s*\n/g, '\n')
  text = text.trim()

  const header = options.header ? `=== ${options.header} ===\n` : ''
  const hintsBlock = harvested.length > 0 ? harvested.join('\n') + '\n' : ''
  const combined = header + hintsBlock + text

  const maxLength = options.maxLength ?? MAX_TEXT_LENGTH
  return combined.length > maxLength ? combined.slice(0, maxLength) + '\n[truncated]' : combined
}

/**
 * Strip multiple pages into a single combined text block for extraction.
 * Every page gets a share of the budget, so a long homepage cannot crowd out
 * the service-times page behind it.
 */
export function stripPages(pages: Array<{ url: string; html: string; label?: string }>): string {
  const pageBudget = Math.max(
    MIN_PAGE_BUDGET,
    Math.floor(MAX_COMBINED_LENGTH / Math.max(pages.length, 1)),
  )
  const blocks = pages.map((p) =>
    stripHtml(p.html, {
      header: p.label ?? deriveLabel(p.url),
      maxLength: pageBudget,
    }),
  )

  const combined = blocks.join('\n\n')
  return combined.length > MAX_COMBINED_LENGTH
    ? combined.slice(0, MAX_COMBINED_LENGTH) + '\n[truncated]'
    : combined
}

function deriveLabel(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/\/$/, '')
    if (!path || path === '/') return 'HOMEPAGE'
    return path.toUpperCase().replace(/\//g, ' / ').trim()
  } catch {
    return 'PAGE'
  }
}
