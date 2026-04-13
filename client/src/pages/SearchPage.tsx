import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, LayoutGrid, Map as MapIcon, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ChurchList } from '@/components/church/ChurchList';
import { RecentlyViewed } from '@/components/church/RecentlyViewed';
import { DenominationGuide } from '@/components/community/DenominationGuide';
import { EventsCalendar } from '@/components/community/EventsCalendar';
import { FirstVisitGuide } from '@/components/community/FirstVisitGuide';
import { Newsletter } from '@/components/community/Newsletter';
import { Testimonials } from '@/components/community/Testimonials';
import { MapContainer } from '@/components/map/MapContainer';
import { CategoryFilter } from '@/components/search/CategoryFilter';
import { FilterPanel } from '@/components/search/FilterPanel';
import { NearMeButton } from '@/components/search/NearMeButton';
import { useDocumentHead } from '@/hooks/useDocumentHead';
import { useChurchSearchParams, useChurches } from '@/hooks/useChurches';
import { useURLSearchState } from '@/hooks/useURLSearchState';
import {
  ActiveSearchTokenKey,
  countActiveFilters,
  getActiveSearchTokens,
} from '@/lib/search-state';
import { useCompareStore } from '@/stores/compare-store';
import { useSearchStore } from '@/stores/search-store';

const MOBILE_BREAKPOINT = 1024;

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best match' },
  { value: 'distance', label: 'Nearest' },
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
  useDocumentHead({
    title: 'Search Churches',
    description:
      'Search and filter churches in San Antonio by denomination, neighborhood, service times, worship style, and more.',
    canonicalPath: '/search',
  });

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
  const userLocation = useSearchStore((state) => state.userLocation);
  const setFilter = useSearchStore((state) => state.setFilter);
  const setQuery = useSearchStore((state) => state.setQuery);
  const setSort = useSearchStore((state) => state.setSort);
  const setMapBounds = useSearchStore((state) => state.setMapBounds);
  const clearFilters = useSearchStore((state) => state.clearFilters);

  useDocumentHead({
    title: query ? `"${query}" — Church Search` : 'Find Churches in San Antonio',
    description: query
      ? `Search results for "${query}" — find churches in San Antonio, TX with reviews, service times, and directions.`
      : 'Search and filter churches across San Antonio by denomination, service times, neighborhood, amenities, and more.',
    canonicalPath: '/search',
  });

  const toggleMap = useCallback(() => {
    setShowMap((current) => {
      // Hiding the map should also drop the "visible map area" filter so the
      // list reverts to the city-wide search — otherwise a stale bounds filter
      // silently constrains results even though the map is gone.
      if (current) {
        setMapBounds(null);
      }
      return !current;
    });
  }, [setMapBounds]);
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
  const activeTokens = useMemo(() => {
    const tokens = getActiveSearchTokens(query, filters);
    // `mapBounds` lives outside SearchFilters, so it can't flow through the
    // generic token helper. Prepend a synthetic "Map area" chip whenever the
    // map-bounds filter is set so users have a consistent, dismissable
    // control — previously the only way out of a lingering bounds filter was
    // to hide the map entirely, which was discoverable by accident at best.
    if (mapBounds) {
      return [{ key: 'mapBounds' as const, label: 'Map area', value: 'visible area' }, ...tokens];
    }
    return tokens;
  }, [filters, mapBounds, query]);
  const totalResults = data?.meta.total ?? 0;
  const churches = data?.data ?? [];
  // Include `mapBounds` in the count so the "X filters active" subtitle lines
  // up with what the user can see in the chip row. Without this, a user who
  // only panned + clicked "Search this area" saw "0 filters active" even
  // though the map-area chip was visible.
  const activeAdvancedFilterCount = countActiveFilters(filters, mapBounds);
  const toggleAmenity = useSearchStore((state) => state.toggleAmenity);
  const toggleLanguage = useSearchStore((state) => state.toggleLanguage);
  const toggleDenomination = useSearchStore((state) => state.toggleDenomination);
  const denominationCount = new Set(churches.map((church) => church.denomination).filter(Boolean))
    .size;

  const locationLabel = userLocation ? 'near you' : 'in San Antonio';
  const resultsHeading = isLoading
    ? `Finding churches ${locationLabel}`
    : error
      ? 'Search results are temporarily unavailable'
      : totalResults === 1
        ? `1 church ${locationLabel}`
        : `${totalResults} churches ${locationLabel}`;

  // When exactly one tradition is selected we keep the legacy "<Name> churches"
  // subtitle; anything else falls back to "All denominations" and lets the chip
  // row carry the specifics. Keeps the subtitle short even with 4+ selections.
  const singleDenominationLabel =
    filters.denomination && filters.denomination.length === 1 ? filters.denomination[0] : null;

  const resultsDescription = error
    ? 'The list is unavailable right now, but your search state is still preserved.'
    : singleDenominationLabel
      ? `${singleDenominationLabel} churches`
      : query.trim()
        ? `Matching "${query.trim()}"`
        : 'All denominations';

  const removeToken = (tokenKey: ActiveSearchTokenKey, tokenValue: string) => {
    if (tokenKey === 'query') {
      setQuery('');
      return;
    }

    if (tokenKey === 'mapBounds') {
      setMapBounds(null);
      return;
    }

    // Multi-select filters — remove only the one chip the user clicked so the
    // remaining selections stay active.
    if (tokenKey === 'amenities') {
      toggleAmenity(tokenValue);
      return;
    }
    if (tokenKey === 'languages') {
      toggleLanguage(tokenValue);
      return;
    }
    if (tokenKey === 'denomination') {
      toggleDenomination(tokenValue);
      return;
    }

    setFilter(tokenKey, undefined);
  };

  return (
    <>
      <div className="flex-1 bg-background">
        <div className="sticky top-[80px] z-40 border-b border-border bg-background/96 backdrop-blur-md">
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
                  Discover {Math.max(totalResults, 30)} churches across every denomination, from
                  historic missions to modern worship centers. Read reviews, compare services, and
                  find the perfect fit.
                </p>
                <button
                  type="button"
                  onClick={() => setShowHeroBanner(false)}
                  className="reference-hero-cta"
                >
                  Start exploring 🔥
                </button>
                <div className="reference-hero-stats">
                  <div>
                    <div className="reference-hero-stat-number">{Math.max(totalResults, 30)}+</div>
                    <div className="reference-hero-stat-label">Churches</div>
                  </div>
                  <div>
                    <div className="reference-hero-stat-number">16,294+</div>
                    <div className="reference-hero-stat-label">Reviews</div>
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
              <h2 className="text-[14px] font-semibold text-foreground">{resultsHeading}</h2>
              <p className="mt-1 text-[14px] text-muted-foreground">
                {resultsDescription}
                {activeAdvancedFilterCount > 0
                  ? `  /  ${activeAdvancedFilterCount} filter${activeAdvancedFilterCount === 1 ? '' : 's'} active`
                  : ''}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NearMeButton />

              {!isMobile ? (
                <button
                  type="button"
                  onClick={toggleMap}
                  className={`rounded-[10px] border px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                    showMap
                      ? 'border-foreground bg-foreground text-white'
                      : 'border-border bg-card text-foreground hover:border-foreground'
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
                  className="appearance-none rounded-[10px] border border-border bg-card px-4 py-2.5 pr-10 text-[13px] font-semibold text-foreground outline-none transition-colors hover:border-foreground focus:border-foreground"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          {activeTokens.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeTokens.map((token) => (
                <button
                  key={`${token.key}-${token.value}`}
                  type="button"
                  onClick={() => removeToken(token.key, token.value)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-semibold text-foreground transition-colors hover:border-foreground"
                >
                  <span>
                    {token.label}: {token.value}
                  </span>
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="text-[13px] font-semibold text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
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
              <div className={`${isMobile ? 'mt-4' : 'sticky top-[156px] self-start'} min-w-0`}>
                <div className="overflow-hidden rounded-[12px] border border-border bg-card">
                  <div
                    className={`${isMobile ? 'h-[70vh] min-h-[460px]' : 'h-[calc(100vh-180px)] min-h-[620px]'}`}
                  >
                    <MapContainer churches={churches} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Community sections */}
        {!showMap && !isLoading && !error ? (
          <>
            <RecentlyViewed />
            <DenominationGuide />
            <FirstVisitGuide />
            <EventsCalendar />
            <Testimonials />
            <Newsletter />
          </>
        ) : null}

        {isMobile ? (
          <div role="group" aria-label="Toggle between list and map" className="mobile-map-toggle">
            <button
              type="button"
              onClick={() => {
                if (showMap) {
                  toggleMap();
                }
              }}
              aria-pressed={!showMap}
              className="mobile-map-toggle-option"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              List
            </button>
            <button
              type="button"
              onClick={() => {
                if (!showMap) {
                  toggleMap();
                }
              }}
              aria-pressed={showMap}
              className="mobile-map-toggle-option"
            >
              <MapIcon className="h-4 w-4" aria-hidden="true" />
              Map
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
            className={`w-full max-w-[780px] overflow-hidden rounded-[24px] bg-card shadow-[0_20px_80px_rgba(0,0,0,0.25)] ${
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
