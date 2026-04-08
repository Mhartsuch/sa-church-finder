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
      <main className="flex flex-1 items-center justify-center bg-[#faf8f5] px-4 py-16 sm:px-6 lg:px-10 xl:px-12">
        <div className="w-full max-w-[560px] rounded-[28px] border border-[#e8e4de] bg-white px-8 py-12 text-center shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f2ed] text-[#1a1a1a]">
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-[#1a1a1a]">No churches selected yet</h1>
          <p className="mt-3 text-sm leading-6 text-[#6b6560]">
            Add churches from the search results to compare their details side by side.
          </p>
          <Link
            to="/search"
            className="mt-8 inline-flex items-center gap-2 rounded-[12px] border border-[#1a1a1a] bg-[#1a1a1a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333333]"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse churches
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#faf8f5] px-4 py-10 sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1760px]">
        <div className="flex flex-col gap-4 rounded-[24px] border border-[#e8e4de] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6b6560] transition-colors hover:text-[#1a1a1a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to search
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-[#1a1a1a]">Compare churches</h1>
            <p className="mt-2 text-sm text-[#6b6560]">
              {selectedChurches.length} selected church
              {selectedChurches.length === 1 ? '' : 'es'} ready to review side by side.
            </p>
          </div>

          <button
            type="button"
            onClick={clearChurches}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#e0ddd8] bg-white px-4 py-3 text-sm font-semibold text-[#1a1a1a] transition-colors hover:border-[#1a1a1a]"
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
                className="overflow-hidden rounded-[24px] border border-[#e8e4de] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
              >
                <div className="aspect-[16/9] bg-[#f0ece6]">
                  {church.coverImageUrl ? (
                    <img
                      src={church.coverImageUrl}
                      alt={church.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#f0ece6] text-sm font-medium text-[#9a8f7f]">
                      Church photo unavailable
                    </div>
                  )}
                </div>

                <div className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/churches/${church.slug}`}
                        className="text-xl font-semibold text-[#1a1a1a] transition-colors hover:text-[#d90b45]"
                      >
                        {church.name}
                      </Link>
                      <p className="mt-1 text-sm text-[#6b6560]">
                        {[church.neighborhood, church.city].filter(Boolean).join(', ') || 'San Antonio'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeChurch(church.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e0ddd8] text-[#1a1a1a] transition-colors hover:border-[#1a1a1a] hover:bg-[#f5f2ed]"
                      aria-label={`Remove ${church.name} from comparison`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <dl className="grid gap-4 text-sm text-[#1a1a1a] sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a8f7f]">
                        Denomination
                      </dt>
                      <dd className="mt-1 font-medium">{church.denomination || fallbackValue}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a8f7f]">
                        Distance
                      </dt>
                      <dd className="mt-1 font-medium">{formatDistance(church.distance)} away</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a8f7f]">
                        Rating
                      </dt>
                      <dd className="mt-1 flex items-center gap-2 font-medium">
                        {church.avgRating > 0 ? (
                          <>
                            <Star className="h-4 w-4 fill-[#f5a623] text-[#f5a623]" />
                            {formatRating(church.avgRating)} ({church.reviewCount} reviews)
                          </>
                        ) : (
                          fallbackValue
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a8f7f]">
                        Next service
                      </dt>
                      <dd className="mt-1 font-medium">{nextService || fallbackValue}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a8f7f]">
                        Languages
                      </dt>
                      <dd className="mt-1 font-medium">
                        {church.languages.length > 0 ? church.languages.join(', ') : fallbackValue}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a8f7f]">
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
