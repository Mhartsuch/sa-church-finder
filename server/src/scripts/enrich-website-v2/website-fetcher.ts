import { RateLimiter } from '../google-import/rate-limiter.js'
import { readHtmlCache, writeHtmlCache } from './html-cache.js'
import type { FetchedPage } from './types.js'

const USER_AGENT = 'SAChurchFinder/2.0 (church directory; contact@sachurchfinder.com)'
const FETCH_TIMEOUT_MS = 10_000
const MAX_BYTES = 2 * 1024 * 1024 // 2 MB cap per page

export interface FetchSuccess {
  ok: true
  page: FetchedPage
}

export interface FetchFailure {
  ok: false
  url: string
  error: string
}

export type FetchResult = FetchSuccess | FetchFailure

const rateLimiter = new RateLimiter(2) // 2 requests per second, global

export interface FetchOptions {
  churchId: string
  url: string
  useCache: boolean
}

/**
 * Fetch a page, optionally serving from the disk cache. Writes successful
 * responses to the cache for later runs.
 */
export async function fetchPage({ churchId, url, useCache }: FetchOptions): Promise<FetchResult> {
  if (useCache) {
    const cached = await readHtmlCache(churchId, url)
    if (cached !== null) {
      return {
        ok: true,
        page: {
          url,
          finalUrl: url,
          statusCode: 200,
          bytes: Buffer.byteLength(cached),
          fetchedAt: new Date().toISOString(),
          fromCache: true,
          html: cached,
        },
      }
    }
  }

  await rateLimiter.wait()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    if (!response.ok) {
      return {
        ok: false,
        url,
        error: `HTTP ${response.status}`,
      }
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('html')) {
      return {
        ok: false,
        url,
        error: `non-HTML content (${contentType || 'unknown'})`,
      }
    }

    const html = await response.text()

    if (Buffer.byteLength(html) > MAX_BYTES) {
      return {
        ok: false,
        url,
        error: `response too large (${Buffer.byteLength(html)} bytes)`,
      }
    }

    await writeHtmlCache(churchId, url, html)

    return {
      ok: true,
      page: {
        url,
        finalUrl: response.url,
        statusCode: response.status,
        bytes: Buffer.byteLength(html),
        fetchedAt: new Date().toISOString(),
        fromCache: false,
        html,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const shortError = message.includes('abort')
      ? `timeout after ${FETCH_TIMEOUT_MS}ms`
      : message.replace(/^TypeError: /, '')

    return {
      ok: false,
      url,
      error: shortError,
    }
  } finally {
    clearTimeout(timeout)
  }
}
