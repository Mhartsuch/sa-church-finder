export interface IMonthlyReviewTrend {
  month: string;
  count: number;
  avgRating: number;
}

export interface IMonthlySaveTrend {
  month: string;
  count: number;
}

export interface IChurchAnalytics {
  churchId: string;
  churchName: string;
  reviewCount: number;
  avgRating: number;
  saveCount: number;
  totalReviews: number;
  respondedReviews: number;
  responseRate: number;
  avgWelcomeRating: number | null;
  avgWorshipRating: number | null;
  avgSermonRating: number | null;
  avgFacilitiesRating: number | null;
  reviewTrend: IMonthlyReviewTrend[];
  saveTrend: IMonthlySaveTrend[];
  recentReviewCount: number;
  recentSaveCount: number;
}
