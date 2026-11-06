export interface IChurchPhoto {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
}

export interface IChurchService {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string | null;
  serviceType: string;
  language: string;
}

export interface IChurchSummary {
  id: string;
  name: string;
  slug: string;
  denomination: string | null;
  denominationFamily: string | null;
  description: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  avgRating: number;
  reviewCount: number;
  googleRating: number | null;
  googleReviewCount: number | null;
  isSaved: boolean;
  languages: string[];
  amenities: string[];
  coverImageUrl: string | null;
  goodForChildren: boolean | null;
  goodForGroups: boolean | null;
  wheelchairAccessible: boolean | null;
  distance?: number;
  photos?: IChurchPhoto[];
  services: IChurchService[];
}

export interface IChurch extends IChurchSummary {
  email: string | null;
  pastorName: string | null;
  yearEstablished: number | null;
  googleMapsUrl: string | null;
}

export interface ISavedChurch extends IChurchSummary {
  savedAt: string;
}

export type SortOption = 'relevance' | 'rating' | 'distance' | 'name';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

/** Filter state for browsing. Mirrors the URL query string. */
export interface IChurchFilters {
  q?: string;
  denominations: string[];
  day?: number;
  time?: TimeOfDay;
  languages: string[];
  neighborhood?: string;
  wheelchairAccessible: boolean;
  goodForChildren: boolean;
  goodForGroups: boolean;
  minRating?: number;
  sort: SortOption;
}

export interface ISearchRequest extends IChurchFilters {
  page?: number;
  pageSize?: number;
  bounds?: string;
}

export interface IPageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ISearchResponse {
  data: IChurchSummary[];
  meta: IPageMeta;
}

export interface IFilterOptions {
  denominations: { value: string; count: number }[];
  languages: string[];
  amenities: string[];
  neighborhoods: string[];
}
