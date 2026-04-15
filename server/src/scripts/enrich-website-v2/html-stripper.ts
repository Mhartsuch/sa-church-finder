const MAX_TEXT_LENGTH = 16_000

export interface StripOptions {
  /** Prepend an optional section header like "=== ABOUT PAGE ===". */
  header?: string
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

  // Isolate <main> or <article> content when present
  const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  if (mainMatch) {
    text = mainMatch[1]
  } else if (articleMatch) {
    text = articleMatch[1]
  }

  // Remove tags whose content is not useful
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
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

  return combined.length > MAX_TEXT_LENGTH
    ? combined.slice(0, MAX_TEXT_LENGTH) + '\n[truncated]'
    : combined
}

/**
 * Strip multiple pages into a single combined text block for extraction.
 */
export function stripPages(pages: Array<{ url: string; html: string; label?: string }>): string {
  const blocks = pages.map((p) =>
    stripHtml(p.html, {
      header: p.label ?? deriveLabel(p.url),
    }),
  )

  const combined = blocks.join('\n\n')
  return combined.length > MAX_TEXT_LENGTH
    ? combined.slice(0, MAX_TEXT_LENGTH) + '\n[truncated]'
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
