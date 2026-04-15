import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { validateAndClean } from './result-validator.js'
import type { ExtractedChurchData } from './types.js'

const execFileAsync = promisify(execFile)
const CLAUDE_TIMEOUT_MS = 90_000

/**
 * Substrings that indicate the Claude CLI has hit a usage or rate limit.
 * When we see any of these, the caller should stop the run gracefully so
 * the user can resume later once their quota resets.
 */
const RATE_LIMIT_MARKERS = [
  'usage limit',
  'rate limit',
  'rate_limit',
  'quota exceeded',
  'too many requests',
  'please try again',
  'reset at',
  'upgrade to',
  'credit balance is too low',
]

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitError'
  }
}

export function isRateLimitMessage(text: string): boolean {
  const lower = text.toLowerCase()
  return RATE_LIMIT_MARKERS.some((m) => lower.includes(m))
}

const EXTRACTION_PROMPT = `You are extracting structured church information from combined text pulled
from several pages of a church website (homepage, About, Staff, Events, etc).
Return ONLY valid JSON (no markdown fences, no commentary) with this exact schema:

{
  "pastorName": "string or null — senior/lead pastor if clear",
  "denomination": "string or null — e.g. 'Southern Baptist', 'Roman Catholic'",
  "denominationFamily": "string or null — one of: Catholic, Orthodox, Anglican/Episcopal, Lutheran, Presbyterian/Reformed, Methodist, Baptist, Pentecostal, Restoration Movement, Adventist, Holiness, Latter-day Saints, Non-denominational, Evangelical, or null",
  "yearEstablished": "integer or null",
  "description": "string or null — 1-3 sentence mission or about summary (max 500 chars)",
  "email": "string or null — primary contact email",
  "phone": "string or null — primary contact phone, digits + dashes OK",
  "languages": ["array of service languages, e.g. 'English', 'Spanish', 'Vietnamese'"],
  "amenities": {
    "goodForChildren": "boolean or null — has children's ministry / nursery / Sunday school",
    "goodForGroups": "boolean or null — runs small groups / life groups / community groups",
    "wheelchairAccessible": "boolean or null — wheelchair/ADA accessibility mentioned"
  },
  "staff": [
    { "name": "string", "role": "string or null" }
  ],
  "socialLinks": {
    "facebook": "URL or null",
    "instagram": "URL or null",
    "twitter": "URL or null",
    "youtube": "URL or null"
  },
  "services": [
    {
      "dayOfWeek": "integer 0-6 where 0=Sunday",
      "startTime": "HH:MM in 24-hour format",
      "endTime": "HH:MM or null",
      "serviceType": "string like 'Traditional', 'Contemporary', 'Service', 'Bible Study', 'Youth', 'Mass'",
      "language": "string like 'English' or 'Spanish'"
    }
  ],
  "ministries": ["array of named ministries/programs, e.g. 'Youth Ministry', 'Celebrate Recovery', 'Men's Bible Study', 'MOPS', 'Missions'"],
  "affiliations": ["array of associations/networks, e.g. 'Southern Baptist Convention', 'PCA', 'LCMS', 'Vineyard USA'"],
  "serviceStyle": "string or null — 'Traditional', 'Contemporary', 'Blended', 'Liturgical', or a short phrase",
  "sermonUrl": "URL or null — page with sermons, messages, or podcast",
  "livestreamUrl": "URL or null — page with live video/livestream of services",
  "statementOfFaithUrl": "URL or null — 'What We Believe' or 'Statement of Faith' page",
  "givingUrl": "URL or null — 'Give', 'Donate', or 'Tithe' page",
  "newVisitorUrl": "URL or null — 'Plan Your Visit', 'New Here', or 'Connect Card' page",
  "parkingInfo": "string or null — brief description of parking (e.g. 'Free lot on Main St, overflow across the street')",
  "dressCode": "string or null — brief note on attire if explicitly mentioned (e.g. 'Come as you are', 'Business casual')",
  "events": [
    {
      "title": "string — event name",
      "description": "string or null — 1-2 sentence summary",
      "eventType": "string — 'worship' | 'study' | 'outreach' | 'community' | 'youth' | 'men' | 'women' | 'family' | 'concert' | 'retreat' | 'other'",
      "startTime": "ISO 8601 datetime with timezone — e.g. '2026-05-01T18:00:00-05:00'",
      "endTime": "ISO 8601 datetime or null",
      "locationOverride": "string or null — if hosted off-site",
      "sourceUrl": "URL or null — the specific event page if identifiable"
    }
  ],
  "confidence": "number 0.0-1.0 — your confidence in the extraction overall"
}

Rules:
- Use null for anything you cannot determine. Do NOT guess.
- Regular services only in "services" — skip one-time events, revivals.
- Put one-time or upcoming scheduled events in "events" instead. Assume America/Chicago timezone (Central) if unspecified.
- Do NOT include past events (anything before today's date).
- Convert service times to 24-hour HH:MM.
- Prefer explicit statements over inferences.
- staff: up to 10 named people, lead pastor first.
- ministries: use canonical names — 'Celebrate Recovery', 'AWANA', 'MOPS' should be used as-is when present.
- URLs must be fully qualified (start with http).

Church website text:
`

function stripCodeFences(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
  return fenceMatch ? fenceMatch[1].trim() : text.trim()
}

/**
 * Run the Claude CLI to extract church data from combined stripped-page text.
 * Throws RateLimitError if the CLI indicates usage has been exhausted so the
 * caller can stop the pipeline and resume later.
 */
export async function extractWithClaude(combinedText: string): Promise<ExtractedChurchData | null> {
  if (combinedText.length < 50) return null

  const fullPrompt = EXTRACTION_PROMPT + combinedText

  let stdout = ''
  let stderr = ''

  try {
    const result = await execFileAsync('claude', ['-p', fullPrompt, '--output-format', 'json'], {
      timeout: CLAUDE_TIMEOUT_MS,
      maxBuffer: 2 * 1024 * 1024, // 2 MB
    })
    stdout = result.stdout
    stderr = result.stderr
  } catch (error) {
    const err = error as NodeJS.ErrnoException & {
      stdout?: string
      stderr?: string
      signal?: NodeJS.Signals
      killed?: boolean
    }
    stdout = err.stdout ?? ''
    stderr = err.stderr ?? ''
    const combined = `${stdout}\n${stderr}\n${err.message ?? ''}`

    if (isRateLimitMessage(combined)) {
      throw new RateLimitError(`Claude CLI hit a usage/rate limit: ${err.message ?? 'see stderr'}`)
    }
    if (err.code === 'ENOENT') {
      throw new Error('Claude CLI not found on PATH — is Claude Code installed?')
    }
    if (err.signal === 'SIGTERM' || err.killed) {
      throw new Error(`Claude CLI timed out after ${CLAUDE_TIMEOUT_MS}ms`)
    }
    throw new Error(`Claude CLI extraction failed: ${err.message}`)
  }

  // Even a zero-exit response can carry a rate-limit hint in the result body.
  let rawJson: string = stdout.trim()
  try {
    const envelope = JSON.parse(rawJson) as Record<string, unknown>
    if (typeof envelope.result === 'string') {
      if (isRateLimitMessage(envelope.result)) {
        throw new RateLimitError(
          `Claude CLI returned a rate-limit message: ${envelope.result.slice(0, 200)}`,
        )
      }
      rawJson = envelope.result
    }
    if (typeof envelope.error === 'string' && isRateLimitMessage(envelope.error)) {
      throw new RateLimitError(
        `Claude CLI reported rate-limit error: ${envelope.error.slice(0, 200)}`,
      )
    }
  } catch (error) {
    if (error instanceof RateLimitError) throw error
    // Envelope parse failure is fine — treat stdout as raw text.
  }

  rawJson = stripCodeFences(rawJson)

  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch {
    // Non-JSON output — might be a rate-limit explanation in prose.
    if (isRateLimitMessage(stdout) || isRateLimitMessage(stderr)) {
      throw new RateLimitError('Claude CLI returned a non-JSON rate-limit response')
    }
    return null
  }

  return validateAndClean(parsed, 'claude-ai')
}
