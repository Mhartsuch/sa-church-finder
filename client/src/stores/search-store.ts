import { create } from 'zustand';
import { SA_CENTER, DEFAULT_ZOOM } from '@/constants';

export interface SearchFilters {
  denomination?: string;
  day?: number;
  time?: string;
  language?: string;
  amenities?: string;
  // Boolean community/accessibility filters — only ever stored as `true` or
  // `undefined`. Setting to `false` would show up in activeFilterCount even
  // though the user has nothing selected, so toggling these off clears them.
  wheelchairAccessible?: boolean;
  goodForChildren?: boolean;
  goodForGroups?: boolean;
}

export interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}

export interface MapBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export type SearchSort = 'relevance' | 'distance' | 'rating' | 'name';

interface SearchStore {
  query: string;
  filters: SearchFilters;
  sort: SearchSort;
  page: number;
  hoveredChurchId: string | null;
  selectedChurchId: string | null;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  mapBounds: MapBounds | null;
  userLocation: UserLocation | null;

  // Actions
  setQuery: (query: string) => void;
  setFilter: (key: keyof SearchFilters, value: string | number | boolean | undefined) => void;
  clearFilters: () => void;
  setSort: (sort: SearchSort) => void;
  setPage: (page: number) => void;
  setHoveredChurch: (id: string | null) => void;
  setSelectedChurch: (id: string | null) => void;
  setMapCenter: (lat: number, lng: number) => void;
  setMapZoom: (zoom: number) => void;
  setMapBounds: (bounds: MapBounds | null) => void;
  setUserLocation: (location: UserLocation | null) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  filters: {},
  // Default to the multi-factor relevance ranking computed by the backend — this
  // is a 127-point score that combines profile completeness, photos, services,
  // engagement, proximity, freshness, accessibility, and operational status.
  // "Near me" flips this to `distance` at activation time.
  sort: 'relevance',
  page: 1,
  hoveredChurchId: null,
  selectedChurchId: null,
  mapCenter: SA_CENTER,
  mapZoom: DEFAULT_ZOOM,
  mapBounds: null,
  userLocation: null,

  setQuery: (query: string) => set({ query, page: 1 }),

  setFilter: (key: keyof SearchFilters, value: string | number | boolean | undefined) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
      page: 1,
    })),

  clearFilters: () =>
    set({
      filters: {},
      query: '',
      page: 1,
    }),

  setSort: (sort: SearchSort) => set({ sort, page: 1 }),

  setPage: (page: number) => set({ page }),

  setHoveredChurch: (id: string | null) => set({ hoveredChurchId: id }),

  setSelectedChurch: (id: string | null) => set({ selectedChurchId: id }),

  setMapCenter: (lat: number, lng: number) => set({ mapCenter: { lat, lng } }),

  setMapZoom: (zoom: number) => set({ mapZoom: zoom }),

  setMapBounds: (bounds: MapBounds | null) => set({ mapBounds: bounds, page: 1 }),

  // Activating a user-provided location always drops any lingering map-bounds
  // filter so the radius search from the new center is honoured. Clearing it
  // (passing null) returns the default San Antonio center without touching map
  // state the user may still be inspecting.
  setUserLocation: (location: UserLocation | null) =>
    set((state) =>
      location
        ? {
            userLocation: location,
            mapBounds: null,
            mapCenter: { lat: location.lat, lng: location.lng },
            page: 1,
          }
        : {
            userLocation: null,
            // Reset map center back to SA only if the map was tracking the user
            mapCenter:
              state.userLocation &&
              state.mapCenter.lat === state.userLocation.lat &&
              state.mapCenter.lng === state.userLocation.lng
                ? SA_CENTER
                : state.mapCenter,
            page: 1,
          },
    ),
}));
