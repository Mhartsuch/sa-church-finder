/**
 * Church domain types and interfaces
 */

export type ChurchClaimStatus = 'pending' | 'approved' | 'rejected'

export interface IViewerChurchClaim {
  id: string
  status: ChurchClaimStatus
  roleTitle: string
  verificationEmail: string
  createdAt: Date
  reviewedAt?: Date | null
}

export interface IChurchService {
  id: string
  churchId: string
  dayOfWeek: number
  startTime: string
  endTime?: string | null
  serviceType: string
  language: string
  description?: string | null
  isAutoImported?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IChurchPhoto {
  id: string
  url: string
  altText?: string | null
  displayOrder: number
}

export interface IChurch {
  id: string
  name: string
  slug: string
  denomination?: string | null
  denominationFamily?: string | null
  description?: string | null
  address: string
  city: string
  state: string
  zipCode: string
  neighborhood?: string | null
  latitude: number
  longitude: number
  phone?: string | null
  email?: string | null
  website?: string | null
  pastorName?: string | null
  yearEstablished?: number | null
  avgRating: number
  reviewCount: number
  googleRating?: number | null
  googleReviewCount?: number | null
  isClaimed: boolean
  isSaved?: boolean
  claimedById?: string | null
  languages: string[]
  amenities: string[]
  coverImageUrl?: string | null
  businessStatus?: string | null
  googleMapsUrl?: string | null
  primaryType?: string | null
  goodForChildren?: boolean | null
  goodForGroups?: boolean | null
  wheelchairAccessible?: boolean | null
  photos?: IChurchPhoto[]
  viewerClaim?: IViewerChurchClaim | null
  createdAt: Date
  updatedAt: Date
  services: IChurchService[]
}

export interface IChurchSummary {
  id: string
  name: string
  slug: string
  denomination?: string | null
  denominationFamily?: string | null
  description?: string | null
  address: string
  city: string
  state: string
  zipCode: string
  neighborhood?: string | null
  latitude: number
  longitude: number
  phone?: string | null
  email?: string | null
  website?: string | null
  avgRating: number
  reviewCount: number
  googleRating?: number | null
  googleReviewCount?: number | null
  isClaimed: boolean
  isSaved?: boolean
  languages: string[]
  amenities: string[]
  coverImageUrl?: string | null
  businessStatus?: string | null
  goodForChildren?: boolean | null
  goodForGroups?: boolean | null
  wheelchairAccessible?: boolean | null
  distance?: number
  photos?: IChurchPhoto[]
  services: IChurchService[]
}

export interface ISavedChurch extends IChurchSummary {
  savedAt: Date
}

export interface IBounds {
  swLat: number
  swLng: number
  neLat: number
  neLng: number
}

export interface ISearchParams {
  lat?: number
  lng?: number
  radius?: number
  q?: string
  denomination?: string
  day?: number
  time?: string
  /**
   * Service language filter. Accepts a single value or a comma-separated list;
   * multiple values are OR-combined ("English OR Spanish"). The backend splits
   * on `,` and trims whitespace, so `"English, Spanish"` and `"English,Spanish"`
   * behave identically.
   */
  language?: string
  amenities?: string
  wheelchairAccessible?: boolean
  goodForChildren?: boolean
  goodForGroups?: boolean
  /** Minimum effective rating (local avgRating, else googleRating). 0–5. */
  minRating?: number
  /** Case-insensitive exact match on `churches.neighborhood`. */
  neighborhood?: string
  /** Case-insensitive match on `church_services.serviceType` (EXISTS subquery). */
  serviceType?: string
  /** When `true`, only return churches that have at least one uploaded photo. */
  hasPhotos?: boolean
  /** When `true`, only return churches marked as claimed/verified. */
  isClaimed?: boolean
  sort?: 'relevance' | 'distance' | 'rating' | 'name'
  page?: number
  pageSize?: number
  bounds?: string
}

export interface ISearchResponse {
  data: IChurchSummary[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    center?: {
      lat: number
      lng: number
    }
  }
}
