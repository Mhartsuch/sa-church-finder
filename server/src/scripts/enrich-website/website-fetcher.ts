import { RateLimiter } from '../google-import/rate-limiter.js'

const USER_AGENT = 'SAChurchFinder/1.0 (church directory; contact@sachurchfinder.com)'
const FETCH_TIMEOUT_MS = 10_000

export interface FetchSuccess {
  ok: true
  url: string
  finalUrl: string
  html: string
  statusCode: number
}

export interface FetchFailure {
  ok: false
  url: string
  error: string
}

export type FetchResult = FetchSuccess | FetchFailure

const rateLimiter = new RateLimiter(2) // 2 requests per second

export async function fetchChurchWebsite(url: string): Promise<FetchResult> {
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

    const html = await response.text()
    const finalUrl = response.url

    return {
      ok: true,
      url,
      finalUrl,
      html,
      statusCode: response.status,
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
