import { BarChart3, Heart, MessageSquare, Star, TrendingUp } from 'lucide-react';

import { IChurchAnalytics } from '@/types/analytics';

const RatingBar = ({ label, value, max = 5 }: { label: string; value: number; max?: number }) => {
  const percent = (value / max) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-[#0f766e]"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-medium text-foreground">{value.toFixed(1)}</span>
    </div>
  );
};

const TrendChart = ({
  data,
  valueKey,
  color,
}: {
  data: Array<{ month: string; count: number }>;
  valueKey: 'count';
  color: string;
}) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d[valueKey]), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="flex items-end gap-1" style={{ height: 64 }}>
      {data.map((point) => {
        const height = (point[valueKey] / maxValue) * 100;
        const monthLabel = point.month.slice(5);

        return (
          <div
            key={point.month}
            className="flex flex-col items-center"
            style={{ width: `${barWidth}%` }}
          >
            <span className="mb-1 text-[10px] font-medium text-muted-foreground">
              {point[valueKey] > 0 ? point[valueKey] : ''}
            </span>
            <div
              className="w-full max-w-[28px] rounded-t"
              style={{
                height: `${Math.max(height, 4)}%`,
                backgroundColor: point[valueKey] > 0 ? color : '#e5e7eb',
                minHeight: 3,
              }}
            />
            <span className="mt-1 text-[10px] text-muted-foreground">{monthLabel}</span>
          </div>
        );
      })}
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
}) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <div className="flex items-center gap-2">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
    <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
  </div>
);

export const AnalyticsDashboard = ({ analytics }: { analytics: IChurchAnalytics }) => {
  const hasSubRatings =
    analytics.avgWelcomeRating !== null ||
    analytics.avgWorshipRating !== null ||
    analytics.avgSermonRating !== null ||
    analytics.avgFacilitiesRating !== null;

  return (
    <div className="mt-4 rounded-[24px] border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Analytics</h3>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Star}
          label="Avg rating"
          value={analytics.avgRating > 0 ? analytics.avgRating.toFixed(1) : '--'}
          subtitle={`${analytics.reviewCount} total reviews`}
          color="#f59e0b"
        />
        <StatCard
          icon={Heart}
          label="Saves"
          value={analytics.saveCount.toString()}
          subtitle={
            analytics.recentSaveCount > 0
              ? `+${analytics.recentSaveCount} this month`
              : 'All time'
          }
          color="#ef4444"
        />
        <StatCard
          icon={MessageSquare}
          label="Response rate"
          value={analytics.totalReviews > 0 ? `${Math.round(analytics.responseRate)}%` : '--'}
          subtitle={`${analytics.respondedReviews}/${analytics.totalReviews} responded`}
          color="#0f766e"
        />
        <StatCard
          icon={TrendingUp}
          label="Recent reviews"
          value={analytics.recentReviewCount.toString()}
          subtitle="Last 30 days"
          color="#2563eb"
        />
      </div>

      {hasSubRatings ? (
        <div className="mt-4 rounded-xl border border-border bg-background p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rating breakdown
          </p>
          <div className="space-y-2.5">
            {analytics.avgWelcomeRating !== null ? (
              <RatingBar label="Welcome" value={analytics.avgWelcomeRating} />
            ) : null}
            {analytics.avgWorshipRating !== null ? (
              <RatingBar label="Worship" value={analytics.avgWorshipRating} />
            ) : null}
            {analytics.avgSermonRating !== null ? (
              <RatingBar label="Sermon" value={analytics.avgSermonRating} />
            ) : null}
            {analytics.avgFacilitiesRating !== null ? (
              <RatingBar label="Facilities" value={analytics.avgFacilitiesRating} />
            ) : null}
          </div>
        </div>
      ) : null}

      {analytics.reviewTrend.length > 0 || analytics.saveTrend.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {analytics.reviewTrend.length > 0 ? (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reviews (6 months)
              </p>
              <TrendChart data={analytics.reviewTrend} valueKey="count" color="#f59e0b" />
            </div>
          ) : null}
          {analytics.saveTrend.length > 0 ? (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Saves (6 months)
              </p>
              <TrendChart data={analytics.saveTrend} valueKey="count" color="#ef4444" />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
