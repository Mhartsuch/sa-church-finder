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

const extractedStaffSchema = z.object({
  name: z.string().min(1).max(150),
  role: z.string().max(150).nullable(),
})

const extractedSocialSchema = z.object({
  facebook: z.string().url().nullable().catch(null),
  instagram: z.string().url().nullable().catch(null),
  twitter: z.string().url().nullable().catch(null),
  youtube: z.string().url().nullable().catch(null),
})

const extractedAmenitiesSchema = z.object({
  goodForChildren: z.boolean().nullable(),
  goodForGroups: z.boolean().nullable(),
  wheelchairAccessible: z.boolean().nullable(),
})

const extractedEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().catch(null),
  eventType: z.string().min(1).max(50),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }).nullable().catch(null),
  locationOverride: z.string().max(200).nullable().catch(null),
  sourceUrl: z.string().url().nullable().catch(null),
})

const extractedDataSchema = z.object({
  pastorName: z.string().max(150).nullable(),
  denomination: z.string().max(100).nullable(),
  denominationFamily: z.string().max(50).nullable(),
  yearEstablished: z.number().int().min(1500).max(CURRENT_YEAR).nullable(),
  description: z.string().max(2000).nullable().catch(null),
  email: z.string().max(254).nullable().catch(null),
  phone: z.string().max(30).nullable().catch(null),
  languages: z.array(z.string().min(1).max(50)).max(10).catch([]),
  amenities: extractedAmenitiesSchema.catch({
    goodForChildren: null,
    goodForGroups: null,
    wheelchairAccessible: null,
  }),
  staff: z.array(extractedStaffSchema).max(30).catch([]),
  socialLinks: extractedSocialSchema.catch({
    facebook: null,
    instagram: null,
    twitter: null,
    youtube: null,
  }),
  services: z.array(extractedServiceSchema).max(30),
  ministries: z.array(z.string().min(1).max(150)).max(40).catch([]),
  affiliations: z.array(z.string().min(1).max(100)).max(10).catch([]),
  serviceStyle: z.string().max(60).nullable().catch(null),
  sermonUrl: z.string().url().nullable().catch(null),
  livestreamUrl: z.string().url().nullable().catch(null),
  statementOfFaithUrl: z.string().url().nullable().catch(null),
  givingUrl: z.string().url().nullable().catch(null),
  newVisitorUrl: z.string().url().nullable().catch(null),
  parkingInfo: z.string().max(500).nullable().catch(null),
  dressCode: z.string().max(200).nullable().catch(null),
  events: z.array(extractedEventSchema).max(30).catch([]),
  confidence: z.number().min(0).max(1),
})

export function classifyConfidence(score: number): ConfidenceLevel {
  if (score >= 0.8) return 'high'
  if (score >= 0.5) return 'medium'
  return 'low'
}

/**
 * Validate raw extraction output against the v2 schema. Returns null if the
 * payload is totally unusable; otherwise coerces optional fields to safe
 * defaults via `.catch(...)`.
 */
export function validateAndClean(
  raw: unknown,
  source: ExtractionSource,
): ExtractedChurchData | null {
  const result = extractedDataSchema.safeParse(raw)
  if (!result.success) return null

  const data = result.data

  const anyUseful =
    data.services.length > 0 ||
    data.events.length > 0 ||
    data.pastorName !== null ||
    data.denomination !== null ||
    data.yearEstablished !== null ||
    data.description !== null ||
    data.email !== null ||
    data.phone !== null ||
    data.languages.length > 0 ||
    data.ministries.length > 0 ||
    data.affiliations.length > 0 ||
    data.serviceStyle !== null ||
    data.sermonUrl !== null ||
    data.livestreamUrl !== null ||
    data.statementOfFaithUrl !== null ||
    data.givingUrl !== null ||
    data.newVisitorUrl !== null ||
    data.parkingInfo !== null ||
    data.dressCode !== null ||
    data.staff.length > 0 ||
    data.socialLinks.facebook !== null ||
    data.socialLinks.instagram !== null ||
    data.socialLinks.twitter !== null ||
    data.socialLinks.youtube !== null ||
    data.amenities.goodForChildren !== null ||
    data.amenities.goodForGroups !== null ||
    data.amenities.wheelchairAccessible !== null

  if (!anyUseful) return null

  return {
    ...data,
    confidenceLevel: classifyConfidence(data.confidence),
    source,
  }
}
