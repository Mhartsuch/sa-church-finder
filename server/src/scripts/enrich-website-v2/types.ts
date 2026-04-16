export interface EnrichWebsiteV2Options {
  dryRun: boolean
  limit: number | null
  verbose: boolean
  skipAi: boolean
  aiOnly: boolean
  overwrite: boolean
  forceLowConfidence: boolean
  retryFailed: boolean
  forceRefetch: boolean
  maxSubpages: number
  maxAttempts: number
}

export interface EnrichV2Stats {
  totalConsidered: number
  skippedAlreadyDone: number
  processed: number
  websitesFetched: number
  subpagesFetched: number
  websitesFailed: number
  pass1Extracted: number
  pass2Extracted: number
  servicesCreated: number
  eventsCreated: number
  fieldsUpdated: number
  lowConfidenceFlagged: number
  skippedNoWebsite: number
  skippedNoData: number
  errors: number
  rateLimited: boolean
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type ExtractionSource = 'json-ld' | 'microdata' | 'html-pattern' | 'claude-ai' | 'merged'

export interface ExtractedService {
  dayOfWeek: number
  startTime: string // HH:MM 24-hour format
  endTime: string | null
  serviceType: string
  language: string
}

export interface ExtractedEvent {
  title: string
  description: string | null
  eventType: string
  startTime: string // ISO 8601
  endTime: string | null // ISO 8601 or null
  locationOverride: string | null
  sourceUrl: string | null
}

export interface ExtractedStaffMember {
  name: string
  role: string | null
}

export interface ExtractedSocialLinks {
  facebook: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
}

export interface ExtractedAmenities {
  goodForChildren: boolean | null
  goodForGroups: boolean | null
  wheelchairAccessible: boolean | null
}

export interface ExtractedChurchData {
  pastorName: string | null
  denomination: string | null
  denominationFamily: string | null
  yearEstablished: number | null
  description: string | null
  email: string | null
  phone: string | null
  languages: string[]
  amenities: ExtractedAmenities
  staff: ExtractedStaffMember[]
  socialLinks: ExtractedSocialLinks
  services: ExtractedService[]
  // Extended fields (stored in EnrichmentState.extractedData JSON; no dedicated
  // Church columns yet — consumers can read them from the enrichment_states
  // snapshot if/when the UI wants to surface them).
  ministries: string[]
  affiliations: string[]
  serviceStyle: string | null // 'Traditional' | 'Contemporary' | 'Blended' | 'Liturgical' | other
  sermonUrl: string | null
  livestreamUrl: string | null
  statementOfFaithUrl: string | null
  givingUrl: string | null
  newVisitorUrl: string | null
  parkingInfo: string | null
  dressCode: string | null
  events: ExtractedEvent[]
  confidence: number
  confidenceLevel: ConfidenceLevel
  source: ExtractionSource
}

export interface FetchedPage {
  url: string
  finalUrl: string
  statusCode: number
  bytes: number
  fetchedAt: string // ISO
  fromCache: boolean
  html: string
}

export interface PageRecord {
  url: string
  statusCode: number
  bytes: number
  fetchedAt: string
  fromCache: boolean
}

export function createEmptyStats(): EnrichV2Stats {
  return {
    totalConsidered: 0,
    skippedAlreadyDone: 0,
    processed: 0,
    websitesFetched: 0,
    subpagesFetched: 0,
    websitesFailed: 0,
    pass1Extracted: 0,
    pass2Extracted: 0,
    servicesCreated: 0,
    eventsCreated: 0,
    fieldsUpdated: 0,
    lowConfidenceFlagged: 0,
    skippedNoWebsite: 0,
    skippedNoData: 0,
    errors: 0,
    rateLimited: false,
  }
}

export function emptyExtracted(): ExtractedChurchData {
  return {
    pastorName: null,
    denomination: null,
    denominationFamily: null,
    yearEstablished: null,
    description: null,
    email: null,
    phone: null,
    languages: [],
    amenities: {
      goodForChildren: null,
      goodForGroups: null,
      wheelchairAccessible: null,
    },
    staff: [],
    socialLinks: {
      facebook: null,
      instagram: null,
      twitter: null,
      youtube: null,
    },
    services: [],
    ministries: [],
    affiliations: [],
    serviceStyle: null,
    sermonUrl: null,
    livestreamUrl: null,
    statementOfFaithUrl: null,
    givingUrl: null,
    newVisitorUrl: null,
    parkingInfo: null,
    dressCode: null,
    events: [],
    confidence: 0,
    confidenceLevel: 'low',
    source: 'html-pattern',
  }
}
