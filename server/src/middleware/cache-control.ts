import { NextFunction, Request, Response } from 'express'

/**
 * Cache-Control middleware for the REST API.
 *
 * - Authenticated/session-sensitive routes (auth/*) are marked `no-store` so
 *   browsers never cache login state.
 * - Filter options (slow-changing, non-personalised) get a short `private`
 *   cache window.
 * - Every other GET is `private, no-cache`: the browser revalidates with the
 *   ETag Express already generates, so unchanged payloads still come back as
 *   cheap 304s but a mutation is visible on the very next read.
 * - Mutating verbs (POST/PUT/PATCH/DELETE) are always `no-store`.
 *
 * Route handlers can override any of this by setting `Cache-Control`
 * themselves — this middleware only sets the header when it's absent.
 */

const isShortCacheable = (path: string): boolean => {
  const apiPath = path.startsWith('/api/v1') ? path.slice('/api/v1'.length) : path
  return apiPath === '/churches/filter-options'
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
