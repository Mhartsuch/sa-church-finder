import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, Star, Trash2 } from 'lucide-react';

import { useCompareStore } from '@/stores/compare-store';
import { formatDistance, formatRating, getNextService } from '@/utils/format';

const fallbackValue = 'Not listed';

const ComparePage = () => {
  const selectedChurches = useCompareStore((state) => state.selectedChurches);
  const clearChurches = useCompareStore((state) => state.clearChurches);
  const removeChurch = useCompareStore((state) => state.removeChurch);

  if (selectedChurches.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background px-4 py-16 sm:px-6 lg:px-10 xl:px-12">
        <div className="w-full max-w-[560px] rounded-[28px] border border-border bg-card px-8 py-12 text-center shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-foreground">
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-foreground">No churches selected yet</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Add churches from the search results to compare their details side by side.
          </p>
          <Link
            to="/search"
            className="mt-8 inline-flex items-center gap-2 rounded-[12px] border border-foreground bg-foreground px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse churches
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background px-4 py-10 sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1760px]">
        <div className="flex flex-col gap-4 rounded-[24px] border border-border bg-card p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to search
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">Compare churches</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedChurches.length} selected church
              {selectedChurches.length === 1 ? '' : 'es'} ready to review side by side.
            </p>
          </div>

          <button
            type="button"
            onClick={clearChurches}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          {selectedChurches.map((church) => {
            const nextService = getNextService(church.services);

            return (
              <section
                key={church.id}
                className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
              >
                <div className="aspect-[16/9] bg-muted">
                  {church.coverImageUrl ? (
                    <img
                      src={church.coverImageUrl}
                      alt={church.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-sm font-medium text-muted-foreground">
                      Church photo unavailable
                    </div>
                  )}
                </div>

                <div className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/churches/${church.slug}`}
                        className="text-xl font-semibold text-foreground transition-colors hover:text-[#FF385C]"
                      >
                        {church.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[church.neighborhood, church.city].filter(Boolean).join(', ') ||
                          'San Antonio'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeChurch(church.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground hover:bg-muted"
                      aria-label={`Remove ${church.name} from comparison`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <dl className="grid gap-4 text-sm text-foreground sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Denomination
                      </dt>
                      <dd className="mt-1 font-medium">{church.denomination || fallbackValue}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Distance
                      </dt>
                      <dd className="mt-1 font-medium">{formatDistance(church.distance)} away</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Rating
                      </dt>
                      <dd className="mt-1 flex items-center gap-2 font-medium">
                        {church.avgRating > 0 ? (
                          <>
                            <Star className="h-4 w-4 fill-[#fbbf24] text-[#fbbf24]" />
                            {formatRating(church.avgRating)} ({church.reviewCount} reviews)
                          </>
                        ) : (
                          fallbackValue
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Next service
                      </dt>
                      <dd className="mt-1 font-medium">{nextService || fallbackValue}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Languages
                      </dt>
                      <dd className="mt-1 font-medium">
                        {church.languages.length > 0 ? church.languages.join(', ') : fallbackValue}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Amenities
                      </dt>
                      <dd className="mt-1 font-medium">
                        {church.amenities.length > 0 ? church.amenities.join(', ') : fallbackValue}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default ComparePage;
