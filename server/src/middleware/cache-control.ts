import { NextFunction, Request, Response } from 'express'

/**
 * Cache-Control middleware for the REST API.
 *
 * - Authenticated/session-sensitive routes (auth/*) are marked `no-store` so
 *   browsers never cache login state.
 * - Safe GET reads (churches, reviews, collections, etc.) get a short
 *   `private` cache window. `private` prevents shared caches (CDNs, proxies)
 *   from serving one user's personalised payload (e.g. `isSaved`) to another.
 * - Mutating verbs (POST/PUT/PATCH/DELETE) are always `no-store`.
 *
 * Route handlers can override any of this by setting `Cache-Control`
 * themselves — this middleware only sets the header when it's absent.
 */
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

  // Short browser-side cache with SWR so rapid back/forward navigation and
  // repeated renders within the same session reuse the payload. `private`
  // keeps it out of shared CDN caches because responses often embed
  // user-specific fields like `isSaved`.
  applyIfUnset('private, max-age=30, stale-while-revalidate=120')
  next()
}
