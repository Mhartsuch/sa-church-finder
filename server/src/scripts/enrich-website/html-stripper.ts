const MAX_TEXT_LENGTH = 8_000

/**
 * Strip HTML to clean text suitable for the Claude CLI prompt.
 * Uses regex-based stripping — no DOM parser needed.
 */
export function stripHtml(html: string): string {
  let text = html

  // Try to isolate <main> or <article> content first
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

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '')

  // Convert block-level tags to newlines for readability
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<\/(?:p|div|li|h[1-6]|tr|section|blockquote)>/gi, '\n')
  text = text.replace(/<(?:p|div|li|h[1-6]|tr|section|blockquote)[^>]*>/gi, '\n')

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '')

  // Decode common HTML entities
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

  // Collapse whitespace
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n\s*\n/g, '\n')
  text = text.trim()

  // Truncate
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH) + '\n[truncated]'
  }

  return text
}
