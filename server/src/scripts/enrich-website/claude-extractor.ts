import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { stripHtml } from './html-stripper.js'
import { validateAndClean } from './result-validator.js'
import type { ExtractedChurchData } from './types.js'

const execFileAsync = promisify(execFile)
const CLAUDE_TIMEOUT_MS = 60_000

const EXTRACTION_PROMPT = `You are extracting structured church information from website text. Analyze the text and return ONLY valid JSON (no markdown fences, no explanation) with this exact schema:

{
  "pastorName": "string or null",
  "denomination": "string or null",
  "denominationFamily": "string or null - one of: Catholic, Orthodox, Anglican/Episcopal, Lutheran, Presbyterian/Reformed, Methodist, Baptist, Pentecostal, Restoration Movement, Adventist, Holiness, Latter-day Saints, Non-denominational, Evangelical, or null",
  "yearEstablished": "number or null",
  "services": [
    {
      "dayOfWeek": "number 0-6 where 0=Sunday",
      "startTime": "HH:MM in 24-hour format",
      "endTime": "HH:MM or null",
      "serviceType": "string like 'Traditional', 'Contemporary', 'Service', 'Bible Study', 'Youth'",
      "language": "string like 'English' or 'Spanish'"
    }
  ],
  "confidence": "number 0.0-1.0 representing your confidence in the extracted data"
}

Rules:
- If a field cannot be determined from the text, set it to null
- Do not guess or hallucinate information
- For service times, only include regularly scheduled services, not one-time events
- Convert all times to 24-hour HH:MM format
- If multiple services exist on the same day, include all of them as separate entries

Church website text:
`

/**
 * Strip markdown code fences that Claude sometimes wraps JSON in.
 */
function stripCodeFences(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
  return fenceMatch ? fenceMatch[1].trim() : text.trim()
}

/**
 * Extract church data from HTML by shelling out to the Claude CLI.
 * Uses `claude -p` so it runs under the user's existing Claude Code subscription.
 */
export async function extractWithClaude(html: string): Promise<ExtractedChurchData | null> {
  const strippedText = stripHtml(html)

  if (strippedText.length < 50) {
    // Too little text to extract anything useful
    return null
  }

  const fullPrompt = EXTRACTION_PROMPT + strippedText

  try {
    const { stdout } = await execFileAsync('claude', ['-p', fullPrompt, '--output-format', 'json'], {
      timeout: CLAUDE_TIMEOUT_MS,
      maxBuffer: 1024 * 1024, // 1 MB
    })

    // Claude with --output-format json returns a JSON object with a "result" field
    let rawJson: string = stdout.trim()

    // Handle --output-format json envelope: { "result": "..." }
    try {
      const envelope = JSON.parse(rawJson) as Record<string, unknown>
      if (typeof envelope.result === 'string') {
        rawJson = envelope.result
      }
    } catch {
      // Not a JSON envelope — treat stdout as raw text
    }

    rawJson = stripCodeFences(rawJson)

    const parsed: unknown = JSON.parse(rawJson)
    return validateAndClean(parsed, 'claude-ai')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    // Try to give a more specific error message
    if (message.includes('ETIMEDOUT') || message.includes('killed')) {
      throw new Error(`Claude CLI timed out after ${CLAUDE_TIMEOUT_MS}ms`)
    }
    if (message.includes('ENOENT')) {
      throw new Error('Claude CLI not found on PATH — is Claude Code installed?')
    }

    throw new Error(`Claude CLI extraction failed: ${message}`)
  }
}
