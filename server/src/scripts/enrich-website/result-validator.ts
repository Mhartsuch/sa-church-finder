import { z } from 'zod'

import type { ConfidenceLevel, ExtractedChurchData, ExtractionSource } from './types.js'

const CURRENT_YEAR = new Date().getFullYear()

const extractedServiceSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.union([z.string().regex(/^\d{2}:\d{2}$/), z.null()]),
  serviceType: z.string().min(1).max(100),
  language: z.string().min(1).max(50),
})

const extractedDataSchema = z.object({
  pastorName: z.string().max(150).nullable(),
  denomination: z.string().max(100).nullable(),
  denominationFamily: z.string().max(50).nullable(),
  yearEstablished: z.number().int().min(1500).max(CURRENT_YEAR).nullable(),
  services: z.array(extractedServiceSchema).max(20),
  confidence: z.number().min(0).max(1),
})

export function classifyConfidence(score: number): ConfidenceLevel {
  if (score >= 0.8) return 'high'
  if (score >= 0.5) return 'medium'
  return 'low'
}

/**
 * Validate and clean raw extracted data (e.g., from Claude CLI JSON output).
 * Returns null if the data fails validation entirely.
 */
export function validateAndClean(
  raw: unknown,
  source: ExtractionSource,
): ExtractedChurchData | null {
  const result = extractedDataSchema.safeParse(raw)
  if (!result.success) return null

  const data = result.data

  // Must have at least some useful data
  const hasServices = data.services.length > 0
  const hasPastor = data.pastorName !== null
  const hasDenomination = data.denomination !== null
  const hasYear = data.yearEstablished !== null

  if (!hasServices && !hasPastor && !hasDenomination && !hasYear) return null

  return {
    ...data,
    confidenceLevel: classifyConfidence(data.confidence),
    source,
  }
}
