import { create } from 'zustand'
import { SA_CENTER, DEFAULT_ZOOM } from '@/constants'

export interface SearchFilters {
  denomination?: string
  day?: number
  time?: string
  language?: string
  amenities?: string
}

export interface MapState {
  lat: number
  lng: number
  zoom: number
}

export interface MapBounds {
  swLat: number
  swLng: number
  neLat: number
  neLng: number
}

interface SearchStore {
  query: string
  filters: SearchFilters
  sort: 'distance' | 'rating' | 'name'
  page: number
  hoveredChurchId: string | null
  selectedChurchId: string | null
  mapCenter: { lat: number; lng: number }
  mapZoom: number
  mapBounds: MapBounds | null

  // Actions
  setQuery: (query: string) => void
  setFilter: (key: keyof SearchFilters, value: string | number | undefined) => void
  clearFilters: () => void
  setSort: (sort: 'distance' | 'rating' | 'name') => void
  setPage: (page: number) => void
  setHoveredChurch: (id: string | null) => void
  setSelectedChurch: (id: string | null) => void
  setMapCenter: (lat: number, lng: number) => void
  setMapZoom: (zoom: number) => void
  setMapBounds: (bounds: MapBounds | null) => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  filters: {},
  sort: 'distance',
  page: 1,
  hoveredChurchId: null,
  selectedChurchId: null,
  mapCenter: SA_CENTER,
  mapZoom: DEFAULT_ZOOM,
  mapBounds: null,

  setQuery: (query: string) => set({ query, page: 1 }),

  setFilter: (key: keyof SearchFilters, value: string | number | undefined) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value
      },
      page: 1
    })),

  clearFilters: () =>
    set({
      filters: {},
      query: '',
      page: 1
    }),

  setSort: (sort: 'distance' | 'rating' | 'name') => set({ sort, page: 1 }),

  setPage: (page: number) => set({ page }),

  setHoveredChurch: (id: string | null) => set({ hoveredChurchId: id }),

  setSelectedChurch: (id: string | null) => set({ selectedChurchId: id }),

  setMapCenter: (lat: number, lng: number) => set({ mapCenter: { lat, lng } }),

  setMapZoom: (zoom: number) => set({ mapZoom: zoom }),

  setMapBounds: (bounds: MapBounds | null) => set({ mapBounds: bounds, page: 1 })
}))
