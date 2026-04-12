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

export interface IUpdateChurchInput {
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  pastorName?: string | null;
  yearEstablished?: number | null;
  languages?: string[];
  amenities?: string[];
  goodForChildren?: boolean | null;
  goodForGroups?: boolean | null;
  wheelchairAccessible?: boolean | null;
}

export interface ISearchParams {
  lat?: number;
  lng?: number;
  radius?: number;
  q?: string;
  /**
   * Denomination filter. Multi-select: an array is OR-combined on the
   * backend ("Baptist OR Methodist"). Serialised to the `denomination` wire
   * param as a comma-separated list, which the backend splits and ORs —
   * a one-element array behaves identically to the legacy single-value
   * filter, so old callers keep working.
   */
  denomination?: string[];
  day?: number;
  time?: string;
  /**
   * Service language filter. Multi-select: an array is OR-combined on the
   * backend ("English OR Spanish"). A single-element array is equivalent to
   * the legacy single-value filter.
   */
  languages?: string[];
  amenities?: string[];
  wheelchairAccessible?: boolean;
  goodForChildren?: boolean;
  goodForGroups?: boolean;
  minRating?: number;
  neighborhood?: string;
  serviceType?: string;
  hasPhotos?: boolean;
  isClaimed?: boolean;
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

/**
 * One denomination family option returned by `/filter-options`. The
 * `count` is the number of operational churches in that family (closed-
 * permanently churches are excluded on the backend) and is used by the
 * UI to sort and label the chips as "Baptist · 42".
 */
export interface IDenominationOption {
  value: string;
  count: number;
}

export interface IFilterOptions {
  denominations: IDenominationOption[];
  languages: string[];
  amenities: string[];
  neighborhoods: string[];
  serviceTypes: string[];
}
