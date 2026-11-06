import { List, Map as MapIcon, SearchX } from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ChurchCard, ChurchCardSkeleton } from '@/components/church/ChurchCard';
import { CategoryBar } from '@/components/search/CategoryBar';
import { FiltersModal } from '@/components/search/FiltersModal';
import { useChurchSearch } from '@/hooks/useChurches';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useFilters } from '@/hooks/useFilters';
import { churchCount } from '@/lib/format';
import { countActiveFilters, EMPTY_FILTERS } from '@/lib/search-params';
import { cn } from '@/lib/utils';

const ChurchMap = lazy(() =>
  import('@/components/map/ChurchMap').then((module) => ({ default: module.ChurchMap })),
);

const BrowsePage = () => {
  const { filters, setFilters } = useFilters();
  const [searchParams, setSearchParams] = useSearchParams();
  const showMap = searchParams.get('view') === 'map';
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bounds, setBounds] = useState<string>();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const slowLoad = useSlowFlag();

  useDocumentTitle(
    undefined,
    'Find a church home in San Antonio. Browse photos, service times, and reviews from local churches.',
  );

  // Map bounds only apply while the map is open, and reset when filters change.
  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    setBounds(undefined);
  }, [filterKey, showMap]);

  const search = useChurchSearch(filters, showMap ? bounds : undefined);
  const churches = useMemo(
    () => search.data?.pages.flatMap((page) => page.data) ?? [],
    [search.data],
  );
  const total = search.data?.pages[0]?.meta.total ?? 0;
  const hasFilters = countActiveFilters(filters) > 0 || Boolean(filters.q);

  const toggleView = () => {
    const next = new URLSearchParams(searchParams);
    if (showMap) next.delete('view');
    else next.set('view', 'map');
    setSearchParams(next);
    window.scrollTo({ top: 0 });
  };

  const results = (
    <>
      {search.isPending ? (
        <Grid compact={showMap}>
          {Array.from({ length: 12 }, (_, i) => (
            <ChurchCardSkeleton key={i} />
          ))}
          {slowLoad && (
            <p className="col-span-full text-center text-sm text-gray-500">
              Waking up the server — this can take a few seconds…
            </p>
          )}
        </Grid>
      ) : search.isError ? (
        <EmptyState
          title="We couldn’t load churches"
          body="Please check your connection and try again."
          action={{ label: 'Try again', onClick: () => void search.refetch() }}
        />
      ) : churches.length === 0 ? (
        <EmptyState
          title="No exact matches"
          body={
            bounds
              ? 'Try zooming out or moving the map to see more churches.'
              : 'Try removing a filter or searching for something else.'
          }
          action={
            hasFilters
              ? { label: 'Clear all filters', onClick: () => setFilters(EMPTY_FILTERS) }
              : undefined
          }
        />
      ) : (
        <>
          {(showMap || hasFilters) && (
            <p className="mb-6 text-sm font-semibold">
              {churchCount(total)}
              {bounds ? ' in this area' : ' in San Antonio'}
            </p>
          )}
          <Grid compact={showMap}>
            {churches.map((church, i) => (
              <ChurchCard
                key={church.id}
                church={church}
                eager={i < 4}
                highlighted={showMap && hoveredId === church.id}
                onHover={showMap ? setHoveredId : undefined}
              />
            ))}
          </Grid>
          {search.hasNextPage && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-lg font-semibold">Continue exploring churches</p>
              <button
                type="button"
                onClick={() => void search.fetchNextPage()}
                disabled={search.isFetchingNextPage}
                className="rounded-lg bg-gray-900 px-6 py-3.5 font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                {search.isFetchingNextPage ? 'Loading…' : 'Show more'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <div className="sticky top-20 z-30 bg-white px-6 shadow-[0_1px_0_rgba(0,0,0,0.06)] xl:px-20">
        <CategoryBar
          filters={filters}
          onChange={setFilters}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      </div>

      {showMap ? (
        <div className="flex">
          <section
            className={cn(
              'w-full px-6 pb-28 pt-6 lg:w-[58%] xl:pl-20',
              // On phones the map takes over the whole screen.
              'hidden lg:block',
            )}
          >
            {results}
          </section>
          <div className="sticky top-40 h-[calc(100vh-10rem)] w-full lg:w-[42%]">
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-stone-100" />}>
              <ChurchMap churches={churches} highlightedId={hoveredId} onBoundsChange={setBounds} />
            </Suspense>
          </div>
        </div>
      ) : (
        <section
          className={cn(
            'px-6 pb-28 pt-6 xl:px-20',
            search.isFetching && !search.isPending && 'opacity-70',
          )}
        >
          {results}
        </section>
      )}

      <button
        type="button"
        onClick={toggleView}
        className="fixed bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
      >
        {showMap ? (
          <>
            Show list <List className="h-4 w-4" />
          </>
        ) : (
          <>
            Show map <MapIcon className="h-4 w-4" />
          </>
        )}
      </button>

      <FiltersModal
        open={filtersOpen}
        filters={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
        }}
      />
    </>
  );
};

const Grid = ({ compact, children }: { compact: boolean; children: React.ReactNode }) => (
  <div
    className={cn(
      'grid gap-x-6 gap-y-10',
      compact
        ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    )}
  >
    {children}
  </div>
);

const EmptyState = ({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}) => (
  <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
    <SearchX className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
    <h2 className="mt-4 text-[22px] font-semibold">{title}</h2>
    <p className="mt-2 text-gray-500">{body}</p>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="mt-6 rounded-lg border border-gray-900 px-5 py-3 font-semibold hover:bg-gray-50"
      >
        {action.label}
      </button>
    )}
  </div>
);

/** Flips to true if the first load takes long enough to suggest a cold-starting API. */
const useSlowFlag = (delay = 3500) => {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);
  return slow;
};

export default BrowsePage;
