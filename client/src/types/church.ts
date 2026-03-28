export interface IChurch {
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
  email: string | null
  website: string | null
  pastorName: string | null
  yearEstablished: number | null
  avgRating: number
  reviewCount: number
  isClaimed: boolean
  languages: string[]
  amenities: string[]
  coverImageUrl: string | null
  services: IChurchService[]
}

export interface IChurchService {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string | null
  serviceType: string
  language: string
}

export interface IChurchSummary extends IChurch {
  distance: number
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
  }
}
