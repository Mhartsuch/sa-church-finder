export interface IChurchAnalytics {
  churchId: string
  churchName: string
  // Summary
  reviewCount: number
  avgRating: number
  saveCount: number
  // Response rate
  totalReviews: number
  respondedReviews: number
  responseRate: number // 0-100 percentage
  // Sub-ratings (averages, null if no data)
  avgWelcomeRating: number | null
  avgWorshipRating: number | null
  avgSermonRating: number | null
  avgFacilitiesRating: number | null
  // Monthly trends (last 6 months, newest first)
  reviewTrend: Array<{ month: string; count: number; avgRating: number }>
  saveTrend: Array<{ month: string; count: number }>
  // Recent activity
  recentReviewCount: number // last 30 days
  recentSaveCount: number // last 30 days
}
