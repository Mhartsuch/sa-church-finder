import { Request, Response, NextFunction } from 'express'

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitOptions = {
  windowMs: number
  maxRequests: number
  message?: string
}

/**
 * Simple in-memory rate limiter keyed by IP address.
 * Suitable for single-instance deployments.
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later' } = options
  const store = new Map<string, RateLimitEntry>()

  // Periodically clean up expired entries to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key)
      }
    }
  }, windowMs * 2)
  cleanupInterval.unref()

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown'
    const now = Date.now()
    const entry = store.get(key)

    if (!entry || now >= entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      next()
      return
    }

    entry.count++

    if (entry.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
      res.set('Retry-After', String(retryAfterSeconds))
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message,
        },
      })
      return
    }

    next()
  }
}

/** Strict limit for auth mutations (login, register, password reset) */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20,
  message: 'Too many authentication attempts, please try again in 15 minutes',
})

/** Moderate limit for general API endpoints */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Too many requests, please slow down',
})
