/** Types for the church event discovery pipeline */

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
