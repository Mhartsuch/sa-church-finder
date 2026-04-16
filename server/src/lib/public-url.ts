/**
 * Resolve the canonical public site URL used when constructing absolute
 * links back to the frontend (email templates, calendar feed URLs, etc.).
 *
 * CLIENT_URL may be a comma-separated list of allowed origins; in that case we
 * use the first entry as the canonical public URL.
 */
const DEFAULT_PUBLIC_URL = 'https://sachurchfinder.com'

export const resolvePublicSiteUrl = (): string => {
  const raw = process.env.CLIENT_URL?.trim()
  if (!raw || raw === '*') return DEFAULT_PUBLIC_URL

  const first = raw
    .split(',')
    .map((value) => value.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)[0]

  if (!first) return DEFAULT_PUBLIC_URL

  return first.replace(/\/+$/, '')
}
