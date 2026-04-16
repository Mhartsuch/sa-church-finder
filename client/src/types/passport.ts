export interface IChurchVisit {
  id: string;
  userId: string;
  churchId: string;
  visitedAt: string;
  notes: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
  church?: IVisitChurch;
}

export interface IVisitChurch {
  id: string;
  name: string;
  slug: string;
  denomination: string | null;
  denominationFamily: string | null;
  neighborhood: string | null;
  coverImageUrl: string | null;
  address: string;
  city: string;
}

export interface IAward {
  awardType: string;
  earnedAt: string;
}

export interface IPassport {
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    createdAt: string;
  };
  stats: {
    totalVisits: number;
    uniqueChurches: number;
    denominationsVisited: number;
    neighborhoodsVisited: number;
    collectionsCount: number;
    reviewCount: number;
  };
  awards: IAward[];
  recentVisits: Array<{
    id: string;
    visitedAt: string;
    rating: number | null;
    notes: string | null;
    church: IVisitChurch;
  }>;
}

export interface IChurchCollection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  slug: string;
  isPublic: boolean;
  churchCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICollectionChurch {
  id: string;
  name: string;
  slug: string;
  denomination: string | null;
  denominationFamily: string | null;
  address: string;
  city: string;
  neighborhood: string | null;
  coverImageUrl: string | null;
  avgRating: number;
  reviewCount: number;
  notes: string | null;
  addedAt: string;
}

export interface ICollectionWithChurches extends IChurchCollection {
  churches: ICollectionChurch[];
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface ICreateVisitInput {
  visitedAt: string;
  notes?: string;
  rating?: number;
}

export interface IUpdateVisitInput {
  notes?: string;
  rating?: number | null;
}

export interface ICreateCollectionInput {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface IUpdateCollectionInput {
  name?: string;
  description?: string | null;
  isPublic?: boolean;
}

export interface IVisitsResponse {
  data: IChurchVisit[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const AWARD_METADATA: Record<string, { name: string; description: string; icon: string }> = {
  FIRST_VISIT: {
    name: 'First Steps',
    description: 'Logged your first church visit',
    icon: '👣',
  },
  EXPLORER_5: {
    name: 'Explorer',
    description: 'Visited 5 different churches',
    icon: '🧭',
  },
  DEVOTED_10: {
    name: 'Devoted',
    description: 'Visited 10 different churches',
    icon: '🙏',
  },
  PILGRIM_25: {
    name: 'Pilgrim',
    description: 'Visited 25 different churches',
    icon: '🕊️',
  },
  DENOMINATION_DIVERSITY: {
    name: 'Open Doors',
    description: 'Visited 3+ different denominations',
    icon: '🚪',
  },
  NEIGHBORHOOD_EXPLORER: {
    name: 'Neighborhood Explorer',
    description: 'Visited churches in 3+ neighborhoods',
    icon: '🗺️',
  },
  REGULAR: {
    name: 'Regular',
    description: 'Visited the same church 3+ times',
    icon: '⭐',
  },
  REVIEWER: {
    name: 'Reviewer',
    description: 'Wrote your first church review',
    icon: '✍️',
  },
};
