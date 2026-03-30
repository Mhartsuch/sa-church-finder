import { useEffect, useMemo, useState } from 'react';
import { List, Map, SlidersHorizontal, X } from 'lucide-react';

import { ChurchList } from '@/components/church/ChurchList';
import { MapContainer } from '@/components/map/MapContainer';
import { CategoryFilter } from '@/components/search/CategoryFilter';
import { FilterPanel } from '@/components/search/FilterPanel';
import { SearchBar } from '@/components/search/SearchBar';
import { useChurchSearchParams, useChurches } from '@/hooks/useChurches';
import { getActiveSearchTokens } from '@/lib/search-state';
import { useURLSearchState } from '@/hooks/useURLSearchState';
import { SearchFilters, useSearchStore } from '@/stores/search-store';

const MOBILE_BREAKPOINT = 1024;

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest first' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'name', label: 'Name (A-Z)' },
] as const;

export const SearchPage = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  );
  const [showMap, setShowMap] = useState(!isMobile);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const query = useSearchStore((state) => state.query);
  const filters = useSearchStore((state) => state.filters);
  const sort = useSearchStore((state) => state.sort);
  const mapBounds = useSearchStore((state) => state.mapBounds);
  const setFilter = useSearchStore((state) => state.setFilter);
  const setQuery = useSearchStore((state) => state.setQuery);
  const setSort = useSearchStore((state) => state.setSort);
  const clearFilters = useSearchStore((state) => state.clearFilters);

  useURLSearchState();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowMap(true);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isFiltersOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFiltersOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFiltersOpen]);

  const searchParams = useChurchSearchParams();
  const { data, error, isLoading } = useChurches(searchParams);
  const activeTokens = useMemo(() => getActiveSearchTokens(query, filters), [filters, query]);
  const totalResults = data?.meta.total ?? 0;
  const activeAdvancedFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== '',
  ).length;

  const resultsHeading = isLoading
    ? 'Finding churches that fit'
    : error
      ? 'Search results are temporarily unavailable'
      : totalResults === 1
        ? '1 church in view'
        : `${totalResults} churches in view`;

  const resultsDescription = error
    ? 'Your search state is still intact, but the directory request is currently failing.'
    : mapBounds
      ? 'The list is following the part of San Antonio that is visible on the map right now.'
      : 'Start broad, then use the rail, full filters, and map movement to tighten the list.';

  const removeToken = (tokenKey: 'query' | keyof SearchFilters) => {
    if (tokenKey === 'query') {
      setQuery('');
      return;
    }

    setFilter(tokenKey, undefined);
  };

  return (
    <>
      <div className="flex-1 bg-[#fffdfb]">
        <div className="sticky top-[88px] z-40 border-b border-[#ece4d7] bg-white/92 backdrop-blur-md">
          <div className="mx-auto max-w-[1760px]">
            <CategoryFilter showQuickFilters />
          </div>
        </div>

        <div className="mx-auto max-w-[1760px] px-4 pb-16 pt-6 sm:px-6 lg:px-10 xl:px-12">
          <section className="rounded-[32px] border border-[#e8dfd2] bg-white/92 p-5 shadow-airbnb-subtle backdrop-blur-sm sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8f80]">
                  Search workspace
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1d1d1b] sm:text-4xl">
                  {resultsHeading}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f5a55] sm:text-[15px]">
                  {query.trim() ? `Searching for "${query.trim()}". ` : ''}
                  {resultsDescription}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!isMobile ? (
                  <button
                    type="button"
                    onClick={() => setShowMap((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#ddd6ca] bg-white px-4 py-3 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef]"
                  >
                    {showMap ? (
                      <>
                        <List className="h-4 w-4" />
                        Focus on list
                      </>
                    ) : (
                      <>
                        <Map className="h-4 w-4" />
                        Bring back map
                      </>
                    )}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#222222] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeAdvancedFilterCount > 0
                    ? `All filters (${activeAdvancedFilterCount})`
                    : 'All filters'}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr),220px] xl:items-end">
              <SearchBar
                variant="compact"
                onSubmit={() => {
                  if (isMobile) {
                    setShowMap(false);
                  }
                }}
                onOpenFilters={() => setIsFiltersOpen(true)}
              />

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8f80]">
                  Sort by
                </span>
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as (typeof SORT_OPTIONS)[number]['value']);
                  }}
                  className="mt-2 w-full rounded-[18px] border border-[#d7d1c5] bg-white px-4 py-4 text-sm font-semibold text-[#222222] outline-none transition-colors focus:border-[#222222]"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {activeTokens.length > 0 ? (
                <>
                  {activeTokens.map((token) => (
                    <button
                      key={`${token.key}-${token.value}`}
                      type="button"
                      onClick={() => removeToken(token.key)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#ddd6ca] bg-[#fcfaf6] px-4 py-2 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef]"
                    >
                      <span>
                        {token.label}: {token.value}
                      </span>
                      <X className="h-3.5 w-3.5 text-[#8f8f8f]" />
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-[#5f5a55] underline decoration-[#d5cab9] underline-offset-4 transition-colors hover:text-[#222222]"
                  >
                    Clear everything
                  </button>
                </>
              ) : (
                <p className="text-sm leading-6 text-[#5f5a55]">
                  Use the category rail for fast narrowing, or open the full filter modal when you
                  want a more deliberate pass.
                </p>
              )}
            </div>
          </section>

          <section
            className={`mt-8 ${showMap && !isMobile ? 'lg:grid lg:grid-cols-[minmax(0,1fr),minmax(420px,46%)] lg:gap-6 xl:gap-8' : ''}`}
          >
            {(!isMobile || !showMap) && (
              <div className="min-w-0">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-[#222222]">
                      {error
                        ? 'Directory temporarily unavailable'
                        : totalResults === 1
                          ? '1 church matches right now'
                          : `${totalResults} churches match right now`}
                    </h2>
                    <p className="text-sm text-[#717171]">
                      {showMap && !isMobile
                        ? 'List and map stay in sync as you browse.'
                        : 'Scroll the listings first, then jump back to the map whenever you want geographic context.'}
                    </p>
                  </div>
                </div>

                <div className="rounded-[32px] border border-[#e8dfd2] bg-white p-4 shadow-airbnb-subtle sm:p-6">
                  <ChurchList variant={showMap && !isMobile ? 'sidebar' : 'grid'} />
                </div>
              </div>
            )}

            {showMap ? (
              <div className={`${isMobile ? 'mt-6' : 'sticky top-[166px]'} min-w-0`}>
                <div className="overflow-hidden rounded-[32px] border border-[#e8dfd2] bg-white shadow-airbnb-subtle">
                  <div
                    className={`${isMobile ? 'h-[70vh] min-h-[460px]' : 'h-[calc(100vh-208px)] min-h-[620px]'}`}
                  >
                    <MapContainer />
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        {isMobile ? (
          <button
            type="button"
            onClick={() => setShowMap((current) => !current)}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#222222] px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-all hover:scale-[1.04] hover:bg-black"
          >
            {showMap ? (
              <>
                Show list
                <List className="h-4 w-4" />
              </>
            ) : (
              <>
                Show map
                <Map className="h-4 w-4" />
              </>
            )}
          </button>
        ) : null}
      </div>

      {isFiltersOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={() => setIsFiltersOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Advanced filters"
            className="w-full max-w-[780px] overflow-hidden rounded-[32px] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <FilterPanel
              onClose={() => {
                setIsFiltersOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};
