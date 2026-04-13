/** Types for the church event discovery pipeline */

export interface DiscoveryOptions {
  dryRun: boolean
  limit: number | null
  churchSlug: string | null
}

export interface DiscoveryStats {
  churchesProcessed: number
  churchesSkipped: number
  eventsDiscovered: number
  eventsCreated: number
  eventsDeduplicated: number
  errors: number
}

export function createEmptyStats(): DiscoveryStats {
  return {
    churchesProcessed: 0,
    churchesSkipped: 0,
    eventsDiscovered: 0,
    eventsCreated: 0,
    eventsDeduplicated: 0,
    errors: 0,
  }
}

/** Raw event data extracted by Claude from website HTML */
export interface ExtractedEvent {
  title: string
  description: string | null
  eventType: 'service' | 'community' | 'volunteer' | 'study' | 'youth' | 'other'
  startDate: string
  startTime: string | null
  endDate: string | null
  endTime: string | null
  location: string | null
  isRecurring: boolean
  recurrenceDescription: string | null
}

/** Church record as queried for the pipeline */
export interface ChurchForDiscovery {
  id: string
  name: string
  slug: string
  website: string
}

/** Result of fetching a church website */
export interface WebsiteContent {
  /** The URL that was actually fetched (may differ from input after redirects) */
  url: string
  /** Cleaned text content from the page */
  textContent: string
  /** Event-related URLs found on the page */
  eventPageUrls: string[]
}
