import { NextFunction, Request, RequestHandler, Response } from 'express'

export interface RateLimitOptions {
  /** Length of the fixed window in milliseconds. */
  windowMs: number
  /** Maximum number of requests allowed per key within one window. */
  max: number
  /** Human-readable label used in the 429 message (e.g. "authentication attempts"). */
  name?: string
  /**
   * Force the limiter on or off. Defaults to off under Jest so route tests
   * can exercise endpoints freely, and on everywhere else.
   */
  enabled?: boolean
}

interface WindowState {
  count: number
  resetAt: number
}

/**
 * Sweep the tracking map opportunistically once it grows past this size so a
 * scan of many distinct IPs cannot grow memory without bound.
 */
const SWEEP_THRESHOLD = 10_000

/**
 * Minimal fixed-window, per-IP, in-memory rate limiter.
 *
 * Built in-house (no new dependency) and scoped per process: counters reset
 * on restart and are not shared across instances, which matches the current
 * single-instance Render deployment. `trust proxy` is already set in
 * production so `req.ip` reflects the real client behind Render's proxy.
 */
export function createRateLimiter(options: RateLimitOptions): RequestHandler {
  const { windowMs, max, name = 'requests' } = options
  const enabled =
    options.enabled ?? (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID)
  const windows = new Map<string, WindowState>()

  const sweepExpired = (now: number): void => {
    for (const [key, state] of windows) {
      if (state.resetAt <= now) windows.delete(key)
    }
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!enabled) {
      next()
      return
    }

    const now = Date.now()
    const key = req.ip ?? 'unknown'

    let state = windows.get(key)
    if (!state || state.resetAt <= now) {
      if (windows.size >= SWEEP_THRESHOLD) sweepExpired(now)
      state = { count: 0, resetAt: now + windowMs }
      windows.set(key, state)
    }

    state.count += 1

    const remaining = Math.max(0, max - state.count)
    const resetSeconds = Math.max(1, Math.ceil((state.resetAt - now) / 1000))

    res.setHeader('RateLimit-Limit', String(max))
    res.setHeader('RateLimit-Remaining', String(remaining))
    res.setHeader('RateLimit-Reset', String(resetSeconds))

    if (state.count > max) {
      res.setHeader('Retry-After', String(resetSeconds))
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: `Too many ${name}. Try again in ${resetSeconds} seconds.`,
        },
      })
      return
    }

    next()
  }
}
