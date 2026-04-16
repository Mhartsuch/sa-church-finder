export interface EnrichWebsiteOptions {
  dryRun: boolean
  limit: number | null
  verbose: boolean
  skipAi: boolean
  aiOnly: boolean
  overwrite: boolean
  forceLowConfidence: boolean
}

export interface EnrichStats {
  totalProcessed: number
  websitesFetched: number
  websitesFailed: number
  pass1Extracted: number
  pass2Extracted: number
  servicesCreated: number
  fieldsUpdated: number
  lowConfidenceFlagged: number
  skippedNoWebsite: number
  skippedNoChange: number
  errors: number
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type ExtractionSource = 'json-ld' | 'microdata' | 'html-pattern' | 'claude-ai'

export interface ExtractedService {
  dayOfWeek: number
  startTime: string // HH:MM 24-hour format
  endTime: string | null // HH:MM 24-hour format
  serviceType: string
  language: string
}

export interface ExtractedChurchData {
  pastorName: string | null
  denomination: string | null
  denominationFamily: string | null
  yearEstablished: number | null
  services: ExtractedService[]
  confidence: number
  confidenceLevel: ConfidenceLevel
  source: ExtractionSource
}

export function createEmptyStats(): EnrichStats {
  return {
    totalProcessed: 0,
    websitesFetched: 0,
    websitesFailed: 0,
    pass1Extracted: 0,
    pass2Extracted: 0,
    servicesCreated: 0,
    fieldsUpdated: 0,
    lowConfidenceFlagged: 0,
    skippedNoWebsite: 0,
    skippedNoChange: 0,
    errors: 0,
  }
}
