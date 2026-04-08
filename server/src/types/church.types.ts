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
  distance?: number
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
  language?: string
  amenities?: string
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
