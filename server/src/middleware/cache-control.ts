import { NextFunction, Request, Response } from 'express'

/**
 * Cache-Control middleware for the REST API.
 *
 * - Authenticated/session-sensitive routes (auth/*) are marked `no-store` so
 *   browsers never cache login state.
 * - A small allowlist of genuinely slow-changing, non-personalised reads
 *   (ribbon categories, filter options) gets a short `private` cache window.
 * - Every other GET is `private, no-cache`: the browser revalidates with the
 *   ETag Express already generates, so unchanged payloads still come back as
 *   cheap 304s but a mutation is visible on the very next read. (A blanket
 *   `max-age=30, stale-while-revalidate=120` here previously made forum
 *   posts, reviews, and saves invisible for up to ~150s after writing.)
 * - Mutating verbs (POST/PUT/PATCH/DELETE) are always `no-store`.
 *
 * Route handlers can override any of this by setting `Cache-Control`
 * themselves — this middleware only sets the header when it's absent.
 */

// GET endpoints that change rarely and never embed user-specific state.
const SHORT_CACHE_PATHS = ['/ribbon-categories', '/churches/filter-options']

const isShortCacheable = (path: string): boolean => {
  const apiPath = path.startsWith('/api/v1') ? path.slice('/api/v1'.length) : path
  return SHORT_CACHE_PATHS.some((prefix) => apiPath === prefix || apiPath.startsWith(`${prefix}/`))
}

export const cacheControl = (req: Request, res: Response, next: NextFunction): void => {
  const applyIfUnset = (value: string): void => {
    if (!res.getHeader('Cache-Control')) {
      res.setHeader('Cache-Control', value)
    }
  }

  // Never cache anything under /auth — session/identity reads must be fresh.
  if (req.path.startsWith('/auth') || req.path.startsWith('/api/v1/auth')) {
    applyIfUnset('no-store')
    return next()
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    applyIfUnset('no-store')
    return next()
  }

  if (isShortCacheable(req.path)) {
    // `private` keeps these out of shared CDN caches.
    applyIfUnset('private, max-age=30, stale-while-revalidate=120')
    return next()
  }

  // Freshness-first default: always revalidate, reuse via ETag 304s.
  applyIfUnset('private, no-cache')
  next()
}
