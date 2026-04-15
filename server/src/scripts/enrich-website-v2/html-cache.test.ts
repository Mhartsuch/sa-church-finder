import { rm } from 'node:fs/promises'
import { join } from 'node:path'

import { readHtmlCache, writeHtmlCache } from './html-cache.js'

const TEST_CHURCH_ID = '__test_cache_church'
const TEST_URL = 'https://example.church/test-page'
const CACHE_ROOT = join(process.cwd(), '.enrichment-cache', 'v2', TEST_CHURCH_ID)

describe('html-cache', () => {
  afterAll(async () => {
    await rm(CACHE_ROOT, { recursive: true, force: true })
  })

  it('writes and reads HTML by churchId + url', async () => {
    await writeHtmlCache(TEST_CHURCH_ID, TEST_URL, '<html>ok</html>')
    const result = await readHtmlCache(TEST_CHURCH_ID, TEST_URL)
    expect(result).toBe('<html>ok</html>')
  })

  it('returns null for unknown url', async () => {
    const result = await readHtmlCache(TEST_CHURCH_ID, 'https://other.example/nope')
    expect(result).toBeNull()
  })

  it('respects max age (0 ms ⇒ always stale)', async () => {
    await writeHtmlCache(TEST_CHURCH_ID, TEST_URL, '<html>fresh</html>')
    const result = await readHtmlCache(TEST_CHURCH_ID, TEST_URL, 0)
    expect(result).toBeNull()
  })
})
