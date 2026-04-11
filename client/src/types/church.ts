import { IViewerChurchClaim } from '@/types/church-claim';

export interface IChurchPhoto {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
}

export interface IChurch {
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
  email: string | null;
  website: string | null;
  pastorName: string | null;
  yearEstablished: number | null;
  avgRating: number;
  reviewCount: number;
  googleRating: number | null;
  googleReviewCount: number | null;
  isClaimed: boolean;
  isSaved: boolean;
  languages: string[];
  amenities: string[];
  coverImageUrl: string | null;
  businessStatus: string | null;
  googleMapsUrl: string | null;
  primaryType: string | null;
  goodForChildren: boolean | null;
  goodForGroups: boolean | null;
  wheelchairAccessible: boolean | null;
  photos?: IChurchPhoto[];
  viewerClaim?: IViewerChurchClaim | null;
  services: IChurchService[];
}

export interface IChurchService {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string | null;
  serviceType: string;
  language: string;
  isAutoImported?: boolean;
}

export interface IChurchSummary extends IChurch {
  distance: number;
}

export interface ISavedChurch extends Omit<IChurchSummary, 'distance'> {
  distance?: number;
  savedAt: string;
}

export interface ISearchParams {
  lat?: number;
  lng?: number;
  radius?: number;
  q?: string;
  denomination?: string;
  day?: number;
  time?: string;
  language?: string;
  amenities?: string;
  sort?: 'relevance' | 'distance' | 'rating' | 'name';
  page?: number;
  pageSize?: number;
  bounds?: string;
}

export interface ISearchResponse {
  data: IChurchSummary[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface IFilterOptions {
  denominations: string[];
  languages: string[];
  amenities: string[];
}
