import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_ZOOM, SA_CENTER } from '@/constants';
import { useSearchStore } from '@/stores/search-store';

import { CategoryFilter } from './CategoryFilter';

const serverCategories = [
  { id: '1', label: 'Historic', icon: '🏛️', slug: 'historic', filterType: 'QUERY', filterValue: 'Historic', position: 0, isVisible: true, source: 'MANUAL', isPinned: true },
  { id: '2', label: 'Contemporary', icon: '🎵', slug: 'contemporary', filterType: 'QUERY', filterValue: 'Contemporary', position: 1, isVisible: true, source: 'MANUAL', isPinned: true },
  { id: '3', label: 'Traditional', icon: '🏠', slug: 'traditional', filterType: 'QUERY', filterValue: 'Traditional', position: 2, isVisible: true, source: 'MANUAL', isPinned: true },
  { id: '4', label: 'Community', icon: '💜', slug: 'community', filterType: 'QUERY', filterValue: 'Community', position: 3, isVisible: true, source: 'MANUAL', isPinned: true },
  { id: '5', label: 'Baptist', icon: '💧', slug: 'denom-baptist', filterType: 'DENOMINATION', filterValue: 'Baptist', position: 6, isVisible: true, source: 'AUTO', isPinned: false },
  { id: '6', label: 'Catholic', icon: '✝️', slug: 'denom-catholic', filterType: 'DENOMINATION', filterValue: 'Catholic', position: 7, isVisible: true, source: 'AUTO', isPinned: false },
];

const mockUseRibbonCategories = vi.fn();

vi.mock('@/hooks/useRibbonCategories', () => ({
  useRibbonCategories: () => mockUseRibbonCategories(),
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
    mockUseRibbonCategories.mockReturnValue({ data: { data: serverCategories } });
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

  it('sets query when a QUERY-type chip is tapped', () => {
    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    fireEvent.click(screen.getByText('Historic'));

    expect(useSearchStore.getState().query).toBe('Historic');
  });

  it('toggles query off when the same QUERY-type chip is tapped again', () => {
    useSearchStore.setState((state) => ({
      ...state,
      query: 'Historic',
    }));

    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    fireEvent.click(screen.getByText('Historic'));

    expect(useSearchStore.getState().query).toBe('');
  });

  it('renders server-provided chips when the API returns categories', () => {
    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    // Denomination chips only exist in the server payload…
    expect(screen.getByText('Baptist')).toBeInTheDocument();
    expect(screen.getByText('Catholic')).toBeInTheDocument();
    // …and default-only chips must not leak in alongside server data.
    expect(screen.queryByText('Megachurch')).not.toBeInTheDocument();
    expect(screen.queryByText('Missions')).not.toBeInTheDocument();
  });

  it('falls back to the default chips when the API errors', () => {
    mockUseRibbonCategories.mockReturnValue({
      data: undefined,
      error: new Error('Network error'),
    });

    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    expect(screen.getByText('All')).toBeInTheDocument();
    for (const label of ['Historic', 'Contemporary', 'Traditional', 'Community', 'Missions', 'Megachurch']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('falls back to the default chips when the API returns an empty list', () => {
    mockUseRibbonCategories.mockReturnValue({ data: { data: [] } });

    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    expect(screen.getByText('All')).toBeInTheDocument();
    for (const label of ['Historic', 'Contemporary', 'Traditional', 'Community', 'Missions', 'Megachurch']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('applies a default chip filter when tapped in fallback mode', () => {
    mockUseRibbonCategories.mockReturnValue({ data: { data: [] } });

    render(<CategoryFilter onOpenFilters={vi.fn()} />);

    fireEvent.click(screen.getByText('Megachurch'));

    expect(useSearchStore.getState().query).toBe('Megachurch');
  });
});
