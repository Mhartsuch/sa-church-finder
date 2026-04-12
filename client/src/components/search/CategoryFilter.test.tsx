import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_ZOOM, SA_CENTER } from '@/constants';
import { useSearchStore } from '@/stores/search-store';

import { CategoryFilter } from './CategoryFilter';

vi.mock('@/hooks/useChurches', () => ({
  useFilterOptions: () => ({
    data: {
      // `denominations` is the new `{value, count}` shape, already sorted by
      // count descending to match what the backend emits. The CategoryFilter
      // derives its chip rail directly from this list.
      denominations: [
        { value: 'Baptist', count: 20 },
        { value: 'Catholic', count: 15 },
        { value: 'Methodist', count: 10 },
        { value: 'Non-denominational', count: 6 },
      ],
      languages: [],
      amenities: [],
      neighborhoods: [],
      serviceTypes: [],
    },
  }),
}));

const resetStore = () => {
  useSearchStore.setState({
    query: '',
    filters: {},
    sort: 'relevance',
    page: 1,
    hoveredChurchId: null,
    selectedChurchId: null,
    mapCenter: SA_CENTER,
    mapZoom: DEFAULT_ZOOM,
    mapBounds: null,
    userLocation: null,
  });
};

// Both the mobile (<lg) and desktop (lg+) Filters buttons render in JSDOM
// since responsive CSS classes don't hide elements. Grab all matches and
// use the first one — they share the same onClick handler and badge logic.
const getFiltersButton = () => screen.getAllByRole('button', { name: /filters/i })[0];

describe('CategoryFilter', () => {
  beforeEach(() => {
    resetStore();
  });

  it('omits the filter badge when no filters are active', () => {
    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    // Only "Filters" — no count suffix on the label.
    expect(getFiltersButton()).toHaveTextContent(/^Filters$/);
  });

  it('counts every amenity individually so the badge matches the results header', () => {
    useSearchStore.setState((state) => ({
      ...state,
      filters: { amenities: ['Parking', 'Nursery', 'Wifi'] },
    }));

    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    expect(getFiltersButton()).toHaveTextContent('Filters3');
  });

  it('ignores an empty multi-select array that the store may temporarily hold', () => {
    // Previously the naive activeFilterCount treated `[]` as "present",
    // inflating the badge to `1` for a cleared amenities array. The shared
    // countActiveFilters helper excludes empties — regression guard for that.
    useSearchStore.setState((state) => ({
      ...state,
      filters: { amenities: [] as string[], denomination: ['Baptist'] },
    }));

    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    expect(getFiltersButton()).toHaveTextContent('Filters1');
  });

  it('sums multi-selects and boolean flags together', () => {
    useSearchStore.setState((state) => ({
      ...state,
      filters: {
        denomination: ['Baptist', 'Methodist'],
        wheelchairAccessible: true,
        minRating: 4,
      },
    }));

    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    // 2 denominations + wheelchair + minRating = 4
    expect(getFiltersButton()).toHaveTextContent('Filters4');
  });

  it('opens the filter modal when the filters button is clicked', () => {
    const onOpenFilters = vi.fn();
    render(<CategoryFilter onOpenFilters={onOpenFilters} />);

    fireEvent.click(getFiltersButton());

    expect(onOpenFilters).toHaveBeenCalledTimes(1);
  });

  it('toggles a denomination into the multi-select when its category chip is tapped', () => {
    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    // Category chips wrap the label inside a child span alongside an emoji,
    // so fire the click on the label text rather than trying to match the
    // combined button name which includes the emoji.
    fireEvent.click(screen.getByText('Catholic'));

    expect(useSearchStore.getState().filters.denomination).toEqual(['Catholic']);
  });

  it('clears text query and filters when the "All" chip is tapped', () => {
    useSearchStore.setState((state) => ({
      ...state,
      query: 'community',
      filters: { denomination: ['Baptist'], wheelchairAccessible: true },
    }));

    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    fireEvent.click(screen.getByText('All'));

    const { query, filters } = useSearchStore.getState();
    expect(query).toBe('');
    expect(filters).toEqual({});
  });
});
