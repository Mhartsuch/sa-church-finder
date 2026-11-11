import { RateLimiter } from '../google-import/rate-limiter.js'
import { readHtmlCache, writeHtmlCache } from './html-cache.js'
import type { FetchedPage } from './types.js'

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const USER_AGENT = 'SAChurchFinder/2.0 (church directory; contact@sachurchfinder.com)'
const FETCH_TIMEOUT_MS = 20_000
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
export async function fetchPage(options: FetchOptions): Promise<FetchResult> {
  // Listings often carry an http:// link to a site that has long since moved
  // to https. Try https first; fall back to the stored URL if that fails.
  if (/^http:\/\//i.test(options.url)) {
    const secure = await fetchOnce({ ...options, url: options.url.replace(/^http:/i, 'https:') })
    if (secure.ok) return secure
  }
  return fetchOnce(options)
}

async function fetchOnce({ churchId, url, useCache }: FetchOptions): Promise<FetchResult> {
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
    const request = (userAgent: string): Promise<Response> =>
      fetch(url, {
        headers: {
          'User-Agent': userAgent,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        },
        signal: controller.signal,
        redirect: 'follow',
      })

    let response = await request(USER_AGENT)
    // Some hosts refuse any client that does not look like a browser. One
    // retry of a public page with a browser user agent is what a visitor's
    // own browser would send.
    if ([403, 406, 429, 503].includes(response.status)) {
      response = await request(BROWSER_USER_AGENT)
    }

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
