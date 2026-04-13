/**
 * Event extractor using Claude API.
 *
 * Sends cleaned website text to Claude and parses structured event data
 * from the response. Uses raw fetch against the Anthropic Messages API
 * to avoid adding an SDK dependency.
 */

import type { ExtractedEvent } from './types.js'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 4096

const SYSTEM_PROMPT = `You are an expert at extracting structured event data from church website content.

Given the text content of a church website, extract all upcoming events, activities, classes, and gatherings. Focus on specific scheduled events — not general descriptions of ministries or ongoing services (unless they have specific upcoming dates).

For each event, determine:
- title: The event name
- description: A brief description (1-2 sentences), or null if not available
- eventType: One of: "service", "community", "volunteer", "study", "youth", "other"
  - "service" = worship services, masses, Sunday services
  - "community" = social gatherings, potlucks, concerts, festivals
  - "volunteer" = service projects, mission trips, outreach
  - "study" = Bible studies, small groups, classes, workshops
  - "youth" = youth group, VBS, children's programs, teen events
  - "other" = anything that doesn't fit the above
- startDate: ISO date string (YYYY-MM-DD). Use the current year if not specified.
- startTime: Time in HH:MM format (24-hour), or null if not specified
- endDate: ISO date string, or null
- endTime: Time in HH:MM format, or null
- location: Specific location if different from the church itself, or null
- isRecurring: true if the event repeats on a schedule
- recurrenceDescription: Human-readable description like "Every Wednesday" or "First Sunday of each month", or null

Rules:
- Only extract events with reasonably specific dates or schedules
- Skip vague references like "we meet regularly" without schedule details
- Skip past events if you can determine they already happened
- If a date says "this Sunday" or "next Friday", compute the actual date relative to today
- Return an empty array if no events are found
- Do NOT invent or hallucinate events — only extract what's actually on the page`

const USER_PROMPT_TEMPLATE = `Today's date is {TODAY}.
Church name: {CHURCH_NAME}

Extract all upcoming church events from the following website content. Return ONLY a JSON array of events, no other text.

Website content:
---
{CONTENT}
---

Return a JSON array of event objects. If no events are found, return an empty array [].`

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AnthropicResponse {
  content: Array<{
    type: 'text'
    text: string
  }>
}

/**
 * Call the Anthropic Messages API directly via fetch.
 */
async function callClaudeApi(
  apiKey: string,
  messages: AnthropicMessage[],
  systemPrompt: string,
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Anthropic API error (${response.status}): ${errorBody}`)
  }

  const data = (await response.json()) as AnthropicResponse
  const textBlock = data.content.find((block) => block.type === 'text')
  if (!textBlock) {
    throw new Error('No text content in Anthropic API response')
  }

  return textBlock.text
}

/**
 * Parse Claude's response text into an array of ExtractedEvent objects.
 * Handles cases where Claude wraps JSON in markdown code blocks.
 */
function parseEventsFromResponse(responseText: string): ExtractedEvent[] {
  let jsonText = responseText.trim()

  // Strip markdown code block wrapper if present
  const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim()
  }

  const parsed: unknown = JSON.parse(jsonText)

  if (!Array.isArray(parsed)) {
    return []
  }

  const validEventTypes = new Set(['service', 'community', 'volunteer', 'study', 'youth', 'other'])

  return parsed.filter((item: Record<string, unknown>) => {
    if (typeof item !== 'object' || item === null) return false
    if (typeof item.title !== 'string' || !item.title.trim()) return false
    if (typeof item.startDate !== 'string') return false
    if (typeof item.eventType !== 'string' || !validEventTypes.has(item.eventType)) return false
    return true
  }) as ExtractedEvent[]
}

/**
 * Extract events from church website content using Claude API.
 *
 * @param apiKey - Anthropic API key
 * @param websiteContent - Cleaned text content from the church website
 * @param churchName - Name of the church (for context)
 * @returns Array of extracted events, or empty array if none found
 */
export async function extractEventsFromContent(
  apiKey: string,
  websiteContent: string,
  churchName: string,
): Promise<ExtractedEvent[]> {
  const today = new Date().toISOString().split('T')[0]

  const userPrompt = USER_PROMPT_TEMPLATE.replace('{TODAY}', today)
    .replace('{CHURCH_NAME}', churchName)
    .replace('{CONTENT}', websiteContent)

  const messages: AnthropicMessage[] = [{ role: 'user', content: userPrompt }]

  const responseText = await callClaudeApi(apiKey, messages, SYSTEM_PROMPT)

  return parseEventsFromResponse(responseText)
}

/** Exported for testing */
export { parseEventsFromResponse }
