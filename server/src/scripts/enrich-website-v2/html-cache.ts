import { createHash } from 'node:crypto'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const CACHE_ROOT = join(process.cwd(), '.enrichment-cache', 'v2')
const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Disk cache for fetched HTML. Keyed by church id + url hash so that
 * resuming a run does not re-fetch pages we already have on disk.
 *
 * Files live at `.enrichment-cache/v2/<churchId>/<urlHash>.html` (gitignored).
 */

function churchDir(churchId: string): string {
  return join(CACHE_ROOT, churchId)
}

function urlKey(url: string): string {
  return createHash('sha1').update(url).digest('hex').slice(0, 16)
}

function cachePath(churchId: string, url: string): string {
  return join(churchDir(churchId), `${urlKey(url)}.html`)
}

export async function readHtmlCache(
  churchId: string,
  url: string,
  maxAgeMs: number = DEFAULT_MAX_AGE_MS,
): Promise<string | null> {
  const path = cachePath(churchId, url)
  try {
    const info = await stat(path)
    const age = Date.now() - info.mtimeMs
    if (age > maxAgeMs) return null
    return await readFile(path, 'utf8')
  } catch {
    return null
  }
}

export async function writeHtmlCache(churchId: string, url: string, html: string): Promise<void> {
  const dir = churchDir(churchId)
  await mkdir(dir, { recursive: true })
  await writeFile(cachePath(churchId, url), html, 'utf8')
}
