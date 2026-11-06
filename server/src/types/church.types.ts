/**
 * Church domain types
 */

export interface IChurchService {
  id: string
  churchId: string
  dayOfWeek: number
  startTime: string
  endTime: string | null
  serviceType: string
  language: string
  description: string | null
}

export interface IChurchPhoto {
  id: string
  url: string
  altText: string | null
  displayOrder: number
}

/** Card-sized church payload used by search and saved churches. */
export interface IChurchSummary {
  id: string
  name: string
  slug: string
  denomination: string | null
  denominationFamily: string | null
  description: string | null
  address: string
  city: string
  state: string
  zipCode: string
  neighborhood: string | null
  latitude: number
  longitude: number
  phone: string | null
  website: string | null
  avgRating: number
  reviewCount: number
  googleRating: number | null
  googleReviewCount: number | null
  languages: string[]
  amenities: string[]
  coverImageUrl: string | null
  businessStatus: string | null
  goodForChildren: boolean | null
  goodForGroups: boolean | null
  wheelchairAccessible: boolean | null
  isSaved: boolean
  /** Miles from the search center (search results only). */
  distance?: number
  /** First few photos, ordered by displayOrder. */
  photos: IChurchPhoto[]
  services: IChurchService[]
}

/** Full church profile payload — all photos. */
export interface IChurch extends IChurchSummary {
  email: string | null
  pastorName: string | null
  yearEstablished: number | null
  googleMapsUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ISavedChurch extends IChurchSummary {
  savedAt: Date
}

export type ChurchSort = 'relevance' | 'distance' | 'rating' | 'name'

export interface ISearchParams {
  lat?: number
  lng?: number
  radius?: number
  q?: string
  /** Denomination family; comma-separated values are OR-combined. */
  denomination?: string
  day?: number
  time?: 'morning' | 'afternoon' | 'evening'
  /** Comma-separated values are OR-combined. */
  language?: string
  /** Comma-separated values are AND-combined. */
  amenities?: string
  wheelchairAccessible?: boolean
  goodForChildren?: boolean
  goodForGroups?: boolean
  /** Minimum effective rating (local avgRating, else googleRating). 0–5. */
  minRating?: number
  neighborhood?: string
  hasPhotos?: boolean
  sort?: ChurchSort
  page?: number
  pageSize?: number
  /** "swLat,swLng,neLat,neLng" */
  bounds?: string
}

export interface ISearchResponse {
  data: IChurchSummary[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    center: { lat: number; lng: number }
  }
}

export interface IFilterOptions {
  denominations: { value: string; count: number }[]
  languages: string[]
  amenities: string[]
  neighborhoods: string[]
}
