import { useState } from 'react';
import {
  BarChart3,
  Bookmark,
  ChevronDown,
  MessageSquare,
  Star,
  TrendingUp,
} from 'lucide-react';

import { useMyChurchAnalytics } from '@/hooks/useAnalytics';
import { useAuthSession } from '@/hooks/useAuth';
import { useDocumentHead } from '@/hooks/useDocumentHead';
import type { IChurchAnalytics } from '@/types/analytics';

const formatRating = (value: number | null): string => {
  if (value === null || value === 0) return '—';
  return value.toFixed(1);
};

const formatPercent = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

const formatMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  detail,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  detail?: string;
  accent?: boolean;
}) => (
  <div className="rounded-2xl border border-border bg-card p-6">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${accent ? 'bg-[#fff0f3] text-[#FF385C]' : 'bg-muted text-muted-foreground'}`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
    {detail ? <p className="mt-1 text-sm text-muted-foreground">{detail}</p> : null}
  </div>
);

const BarChartSimple = ({
  data,
  label,
}: {
  data: Array<{ label: string; value: number }>;
  label: string;
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <p className="mb-4 text-sm font-semibold text-foreground">{label}</p>
      <div className="flex items-end gap-2" style={{ height: '160px' }}>
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {item.value > 0 ? item.value : ''}
            </span>
            <div
              className="w-full rounded-t-md bg-[#FF385C] transition-all"
              style={{
                height: `${Math.max((item.value / maxValue) * 120, item.value > 0 ? 4 : 0)}px`,
                opacity: item.value > 0 ? 1 : 0.15,
              }}
            />
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryBar = ({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number | null;
  maxValue: number;
}) => {
  const pct = value !== null ? (value / maxValue) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      <span className="w-24 text-right text-sm text-muted-foreground">{label}</span>
      <div className="flex-1">
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#FF385C] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="w-10 text-sm font-semibold text-foreground">{formatRating(value)}</span>
    </div>
  );
};

const ChurchAnalyticsDetail = ({ analytics }: { analytics: IChurchAnalytics }) => {
  const reviewData = (analytics.reviewTrend || []).slice(-6).map((t) => ({
    label: formatMonth(t.month),
    value: t.count,
  }));

  const saveData = (analytics.saveTrend || []).slice(-6).map((t) => ({
    label: formatMonth(t.month),
    value: t.count,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Reviews"
          value={String(analytics.reviewCount)}
          icon={MessageSquare}
          detail={
            analytics.recentReviewCount > 0
              ? `${analytics.recentReviewCount} in last 30 days`
              : undefined
          }
          accent
        />
        <StatCard
          label="Average Rating"
          value={formatRating(analytics.avgRating)}
          icon={Star}
          detail="out of 5.0"
        />
        <StatCard
          label="Total Saves"
          value={String(analytics.saveCount)}
          icon={Bookmark}
          detail={
            analytics.recentSaveCount > 0
              ? `${analytics.recentSaveCount} in last 30 days`
              : undefined
          }
        />
        <StatCard
          label="Response Rate"
          value={formatPercent(analytics.responseRate)}
          icon={TrendingUp}
          detail={`${analytics.respondedReviews} of ${analytics.totalReviews} reviews`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          {reviewData.length > 0 ? (
            <BarChartSimple data={reviewData} label="Reviews per Month" />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No review data yet
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          {saveData.length > 0 ? (
            <BarChartSimple data={saveData} label="Saves per Month" />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No save data yet
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="mb-6 text-sm font-semibold text-foreground">Category Ratings</p>
        <div className="space-y-4">
          <CategoryBar label="Welcome" value={analytics.avgWelcomeRating} maxValue={5} />
          <CategoryBar label="Worship" value={analytics.avgWorshipRating} maxValue={5} />
          <CategoryBar label="Sermon" value={analytics.avgSermonRating} maxValue={5} />
          <CategoryBar label="Facilities" value={analytics.avgFacilitiesRating} maxValue={5} />
        </div>
      </div>
    </div>
  );
};

const AnalyticsDashboardPage = () => {
  const { user } = useAuthSession();
  const { data: allAnalytics, isLoading, error } = useMyChurchAnalytics(Boolean(user));
  const [selectedIndex, setSelectedIndex] = useState(0);

  useDocumentHead({
    title: 'Analytics Dashboard',
    description: 'View analytics and performance metrics for your churches.',
    canonicalPath: '/analytics',
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded-lg bg-gray-200" />
            <div className="h-4 w-72 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-gray-200" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="h-56 rounded-2xl bg-gray-200" />
              <div className="h-56 rounded-2xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background py-20">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Unable to load analytics</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!allAnalytics || allAnalytics.length === 0) {
    return (
      <div className="flex flex-1 bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">
            Analytics
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Dashboard
          </h1>
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16">
            <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">No analytics yet</h2>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Claim a church through the Leaders Portal to start seeing analytics for your listings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selected = allAnalytics[selectedIndex] || allAnalytics[0];

  return (
    <div className="flex flex-1 bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">
              Analytics
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Dashboard
            </h1>
          </div>

          {allAnalytics.length > 1 ? (
            <div className="relative">
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="appearance-none rounded-xl border border-border bg-card px-4 py-2.5 pr-10 text-sm font-semibold text-foreground outline-none transition-colors hover:border-foreground focus:border-foreground"
              >
                {allAnalytics.map((a, i) => (
                  <option key={a.churchId} value={i}>
                    {a.churchName}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          ) : null}
        </div>

        <p className="mt-2 text-base text-muted-foreground">
          Performance overview for{' '}
          <span className="font-semibold text-foreground">{selected.churchName}</span>
        </p>

        <div className="mt-8">
          <ChurchAnalyticsDetail analytics={selected} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
