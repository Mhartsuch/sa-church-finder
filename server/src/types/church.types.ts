/**
 * Church domain types and interfaces
 */

export interface IChurchService {
  id: string
  churchId: string
  dayOfWeek: number
  startTime: string
  endTime?: string
  serviceType: string
  language: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface IChurch {
  id: string
  name: string
  slug: string
  denomination?: string
  denominationFamily?: string
  description?: string
  address: string
  city: string
  state: string
  zipCode: string
  neighborhood?: string
  latitude: number
  longitude: number
  phone?: string
  email?: string
  website?: string
  pastorName?: string
  yearEstablished?: number
  avgRating: number
  reviewCount: number
  isClaimed: boolean
  claimedById?: string
  languages: string[]
  amenities: string[]
  coverImageUrl?: string
  createdAt: Date
  updatedAt: Date
  services: IChurchService[]
}

export interface IChurchSummary {
  id: string
  name: string
  slug: string
  denomination?: string
  denominationFamily?: string
  description?: string
  address: string
  city: string
  state: string
  zipCode: string
  neighborhood?: string
  latitude: number
  longitude: number
  phone?: string
  email?: string
  website?: string
  avgRating: number
  reviewCount: number
  isClaimed: boolean
  languages: string[]
  amenities: string[]
  coverImageUrl?: string
  distance?: number
  services: IChurchService[]
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
  sort?: 'distance' | 'rating' | 'name'
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
