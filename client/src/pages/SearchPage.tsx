import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, List, Map, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ChurchList } from '@/components/church/ChurchList';
import { MapContainer } from '@/components/map/MapContainer';
import { CategoryFilter } from '@/components/search/CategoryFilter';
import { FilterPanel } from '@/components/search/FilterPanel';
import { useChurchSearchParams, useChurches } from '@/hooks/useChurches';
import { useURLSearchState } from '@/hooks/useURLSearchState';
import { getActiveSearchTokens } from '@/lib/search-state';
import { useCompareStore } from '@/stores/compare-store';
import { SearchFilters, useSearchStore } from '@/stores/search-store';

const MOBILE_BREAKPOINT = 1024;

const SORT_OPTIONS = [
  { value: 'distance', label: 'Recommended' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'name', label: 'Name (A-Z)' },
] as const;

interface SearchPageLocationState {
  openFilters?: boolean;
  [key: string]: unknown;
}

const getSearchPageLocationState = (state: unknown): SearchPageLocationState | null => {
  if (typeof state !== 'object' || state === null) {
    return null;
  }

  return state as SearchPageLocationState;
};

const stripOpenFiltersFlag = (state: unknown): SearchPageLocationState | null => {
  const locationState = getSearchPageLocationState(state);

  if (!locationState) {
    return null;
  }

  const rest = { ...locationState };

  delete rest.openFilters;

  return Object.keys(rest).length > 0 ? rest : null;
};

export const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  );
  const [showMap, setShowMap] = useState(false);
  const [filterModalState, setFilterModalState] = useState<'closed' | 'open' | 'closing'>('closed');
  const filterCloseTimer = useRef<ReturnType<typeof setTimeout>>();

  const openFilterModal = useCallback(() => setFilterModalState('open'), []);
  const closeFilterModal = useCallback(() => {
    setFilterModalState('closing');
    clearTimeout(filterCloseTimer.current);
    filterCloseTimer.current = setTimeout(() => setFilterModalState('closed'), 280);
  }, []);
  const [showHeroBanner, setShowHeroBanner] = useState(true);
  const query = useSearchStore((state) => state.query);
  const filters = useSearchStore((state) => state.filters);
  const sort = useSearchStore((state) => state.sort);
  const mapBounds = useSearchStore((state) => state.mapBounds);
  const setFilter = useSearchStore((state) => state.setFilter);
  const setQuery = useSearchStore((state) => state.setQuery);
  const setSort = useSearchStore((state) => state.setSort);
  const clearFilters = useSearchStore((state) => state.clearFilters);
  const locationState = getSearchPageLocationState(location.state);
  const compareCount = useCompareStore((state) => state.selectedChurches.length);

  useURLSearchState();

  useEffect(() => {
    if (locationState?.openFilters !== true) {
      return;
    }

    openFilterModal();
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
      },
      {
        replace: true,
        state: stripOpenFiltersFlag(location.state),
      },
    );
  }, [
    location.pathname,
    location.search,
    location.state,
    locationState?.openFilters,
    navigate,
    openFilterModal,
  ]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (filterModalState !== 'open') {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeFilterModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [filterModalState, closeFilterModal]);

  const searchParams = useChurchSearchParams();
  const { data, error, isLoading } = useChurches(searchParams);
  const activeTokens = useMemo(() => getActiveSearchTokens(query, filters), [filters, query]);
  const totalResults = data?.meta.total ?? 0;
  const churches = data?.data ?? [];
  const activeAdvancedFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== '',
  ).length;
  const photoBackedCount = churches.filter((church) => Boolean(church.coverImageUrl)).length;
  const denominationCount = new Set(churches.map((church) => church.denomination).filter(Boolean))
    .size;

  const resultsHeading = isLoading
    ? 'Finding churches in San Antonio'
    : error
      ? 'Search results are temporarily unavailable'
      : totalResults === 1
        ? '1 church in San Antonio'
        : `${totalResults} churches in San Antonio`;

  const resultsDescription = error
    ? 'The list is unavailable right now, but your search state is still preserved.'
    : filters.denomination
      ? `${filters.denomination} churches`
      : query.trim()
        ? `Matching "${query.trim()}"`
        : 'All denominations';

  const removeToken = (tokenKey: 'query' | keyof SearchFilters) => {
    if (tokenKey === 'query') {
      setQuery('');
      return;
    }

    setFilter(tokenKey, undefined);
  };

  return (
    <>
      <div className="flex-1 bg-white">
        <div className="sticky top-[80px] z-40 border-b border-[#e8e4de] bg-white/96 backdrop-blur-md">
          <div className="mx-auto max-w-[1760px]">
            <CategoryFilter
              compareCount={compareCount}
              onCompare={() => {
                navigate('/compare');
              }}
              onOpenFilters={() => {
                openFilterModal();
              }}
            />
          </div>
        </div>

        {showHeroBanner && !showMap && !isLoading && !error ? (
          <section className="reference-hero-shell">
            <div className="reference-hero-card">
              <div className="reference-hero-backdrop" />
              <button
                type="button"
                onClick={() => setShowHeroBanner(false)}
                className="reference-hero-dismiss"
                aria-label="Dismiss introduction banner"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="reference-hero-content">
                <h1 className="reference-hero-title">
                  Find your <span className="reference-hero-highlight">spiritual home</span> in San
                  Antonio
                </h1>
                <p className="reference-hero-copy">
                  Explore a curated set of real San Antonio churches with strong photography,
                  verified service details, and polished visit-planning profiles.
                </p>
                <button
                  type="button"
                  onClick={() => setShowHeroBanner(false)}
                  className="reference-hero-cta"
                >
                  Start exploring
                </button>
                <div className="reference-hero-stats">
                  <div>
                    <div className="reference-hero-stat-number">
                      {Math.max(totalResults, churches.length)}+
                    </div>
                    <div className="reference-hero-stat-label">Churches</div>
                  </div>
                  <div>
                    <div className="reference-hero-stat-number">
                      {Math.max(photoBackedCount, 0)}
                    </div>
                    <div className="reference-hero-stat-label">With photos</div>
                  </div>
                  <div>
                    <div className="reference-hero-stat-number">
                      {Math.max(denominationCount, 10)}+
                    </div>
                    <div className="reference-hero-stat-label">Denominations</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="reference-results-shell">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-[#1a1a1a]">{resultsHeading}</h2>
              <p className="mt-1 text-[14px] text-[#6b6560]">
                {resultsDescription}
                {activeAdvancedFilterCount > 0
                  ? `  /  ${activeAdvancedFilterCount} filter${activeAdvancedFilterCount === 1 ? '' : 's'} active`
                  : ''}
                {mapBounds ? '  /  Following the visible map area' : ''}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!isMobile ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowMap((current) => !current);
                  }}
                  className={`rounded-[10px] border px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                    showMap
                      ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                      : 'border-[#e0ddd8] bg-white text-[#1a1a1a] hover:border-[#1a1a1a]'
                  }`}
                >
                  {showMap ? 'Hide map' : 'Show map'}
                </button>
              ) : null}

              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as (typeof SORT_OPTIONS)[number]['value']);
                  }}
                  className="appearance-none rounded-[10px] border border-[#e0ddd8] bg-white px-4 py-2.5 pr-10 text-[13px] font-semibold text-[#1a1a1a] outline-none transition-colors hover:border-[#1a1a1a] focus:border-[#1a1a1a]"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6560]" />
              </div>
            </div>
          </div>

          {activeTokens.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeTokens.map((token) => (
                <button
                  key={`${token.key}-${token.value}`}
                  type="button"
                  onClick={() => removeToken(token.key)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e0ddd8] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#1a1a1a] transition-colors hover:border-[#1a1a1a]"
                >
                  <span>
                    {token.label}: {token.value}
                  </span>
                  <X className="h-3.5 w-3.5 text-[#9a8f7f]" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="text-[13px] font-semibold text-[#6b6560] underline underline-offset-4 transition-colors hover:text-[#1a1a1a]"
              >
                Clear everything
              </button>
            </div>
          ) : null}

          <div
            className={`mt-6 ${showMap && !isMobile ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr),minmax(420px,46%)] xl:gap-8' : ''}`}
          >
            {(!isMobile || !showMap) && (
              <div className="min-w-0">
                <ChurchList variant={showMap && !isMobile ? 'sidebar' : 'grid'} />
              </div>
            )}

            {showMap ? (
              <div className={`${isMobile ? 'mt-4' : 'sticky top-[156px]'} min-w-0`}>
                <div className="overflow-hidden rounded-[12px] border border-[#e8e4de] bg-white">
                  <div
                    className={`${isMobile ? 'h-[70vh] min-h-[460px]' : 'h-[calc(100vh-180px)] min-h-[620px]'}`}
                  >
                    <MapContainer />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {isMobile ? (
          <div className="reference-fab">
            <button
              type="button"
              onClick={() => setShowMap((current) => !current)}
              className="reference-fab-button"
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
          </div>
        ) : null}
      </div>

      {filterModalState !== 'closed' ? (
        <div
          className={`fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-6 ${
            filterModalState === 'closing'
              ? 'animate-[modal-overlay-in_0.25s_ease-in_reverse_forwards]'
              : 'animate-modal-overlay'
          }`}
          onClick={() => closeFilterModal()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className={`w-full max-w-[780px] overflow-hidden rounded-[24px] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.25)] ${
              filterModalState === 'closing'
                ? 'animate-[modal-slide-up_0.25s_ease-in_reverse_forwards]'
                : 'animate-modal-slide-up'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <FilterPanel
              resultCount={totalResults}
              onClose={() => {
                closeFilterModal();
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};
