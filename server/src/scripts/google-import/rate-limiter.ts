/**
 * Simple token-bucket rate limiter using setTimeout.
 * No external dependencies required.
 */

export class RateLimiter {
  private lastCallTime = 0
  private readonly minIntervalMs: number

  constructor(requestsPerSecond: number) {
    this.minIntervalMs = Math.ceil(1000 / requestsPerSecond)
  }

  async wait(): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastCallTime
    const waitTime = this.minIntervalMs - elapsed

    if (waitTime > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, waitTime))
    }

    this.lastCallTime = Date.now()
  }
}
