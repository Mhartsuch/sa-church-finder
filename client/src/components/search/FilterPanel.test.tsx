import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_ZOOM, SA_CENTER } from '@/constants';
import { useSearchStore } from '@/stores/search-store';

import { FilterPanel } from './FilterPanel';

vi.mock('@/hooks/useChurches', () => ({
  useFilterOptions: () => ({
    data: {
      // `denominations` now returns `{value, count}` tuples. The order here
      // mirrors the count-desc sort the backend emits, so the DenominationFilterSection
      // renders Baptist (12) first, then Catholic (8), then Methodist (4).
      denominations: [
        { value: 'Baptist', count: 12 },
        { value: 'Catholic', count: 8 },
        { value: 'Methodist', count: 4 },
      ],
      languages: ['English', 'Spanish'],
      amenities: ['Parking', 'Nursery'],
      neighborhoods: ['Downtown', 'Alamo Heights'],
      serviceTypes: ['Traditional', 'Contemporary'],
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

describe('FilterPanel', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders the dynamic filter options returned by the API', () => {
    render(<FilterPanel resultCount={42} />);

    // Denomination chips now append the church count: "Baptist · 12".
    expect(screen.getByRole('button', { name: 'Baptist · 12' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Catholic · 8' })).toBeInTheDocument();
    // Other filters still render as plain labels.
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Parking' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Downtown' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Traditional' })).toBeInTheDocument();
  });

  it('renders the result count pluralised on the footer CTA', () => {
    render(<FilterPanel resultCount={42} />);
    expect(screen.getByRole('button', { name: 'Show 42 churches' })).toBeInTheDocument();
  });

  it('uses the singular label when exactly one result matches', () => {
    render(<FilterPanel resultCount={1} />);
    expect(screen.getByRole('button', { name: 'Show 1 church' })).toBeInTheDocument();
  });

  it('toggles a denomination into the multi-select when tapped', () => {
    render(<FilterPanel resultCount={0} />);

    fireEvent.click(screen.getByRole('button', { name: 'Baptist · 12' }));
    expect(useSearchStore.getState().filters.denomination).toEqual(['Baptist']);

    fireEvent.click(screen.getByRole('button', { name: 'Methodist · 4' }));
    expect(useSearchStore.getState().filters.denomination).toEqual(['Baptist', 'Methodist']);

    // Tapping again removes that specific value.
    fireEvent.click(screen.getByRole('button', { name: 'Baptist · 12' }));
    expect(useSearchStore.getState().filters.denomination).toEqual(['Methodist']);
  });

  it('toggles an amenity on and off and collapses to undefined when empty', () => {
    render(<FilterPanel resultCount={0} />);

    fireEvent.click(screen.getByRole('button', { name: 'Parking' }));
    expect(useSearchStore.getState().filters.amenities).toEqual(['Parking']);

    fireEvent.click(screen.getByRole('button', { name: 'Parking' }));
    // Deselecting the last amenity collapses the array so the filter count
    // stays clean — regression guard for the earlier empty-array bug.
    expect(useSearchStore.getState().filters.amenities).toBeUndefined();
  });

  it('activates a boolean filter via the accessibility switch', () => {
    render(<FilterPanel resultCount={0} />);

    const toggle = screen.getByRole('switch', { name: 'Wheelchair accessible' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(toggle);

    expect(useSearchStore.getState().filters.wheelchairAccessible).toBe(true);
    expect(screen.getByRole('switch', { name: 'Wheelchair accessible' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('treats distance as single-select and toggles off on re-tap', () => {
    render(<FilterPanel resultCount={0} />);

    fireEvent.click(screen.getByRole('button', { name: '5 miles' }));
    expect(useSearchStore.getState().filters.radius).toBe(5);

    fireEvent.click(screen.getByRole('button', { name: '5 miles' }));
    expect(useSearchStore.getState().filters.radius).toBeUndefined();
  });

  it('reports the active filter count in the footer summary pill', () => {
    useSearchStore.setState((state) => ({
      ...state,
      filters: {
        amenities: ['Parking', 'Nursery'],
        wheelchairAccessible: true,
      },
    }));

    render(<FilterPanel resultCount={3} />);

    // 2 amenities + 1 boolean = 3 filters selected
    expect(screen.getByText(/3 filters selected/i)).toBeInTheDocument();
  });

  it('wipes every filter and the query when "Clear all" is pressed', () => {
    useSearchStore.setState((state) => ({
      ...state,
      query: 'community',
      filters: { denomination: ['Baptist'], wheelchairAccessible: true },
    }));

    render(<FilterPanel resultCount={0} />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));

    const { query, filters } = useSearchStore.getState();
    expect(query).toBe('');
    expect(filters).toEqual({});
  });

  it('invokes onClose when the close button is pressed', () => {
    const onClose = vi.fn();
    render(<FilterPanel resultCount={0} onClose={onClose} />);

    // There are two close paths — the X in the header and the "Show N churches"
    // CTA in the footer. Both should dismiss the sheet.
    fireEvent.click(screen.getByRole('button', { name: 'Close filters' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Show 0 churches' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('uses the singular "filter" noun when exactly one filter is active', () => {
    useSearchStore.setState((state) => ({
      ...state,
      filters: { wheelchairAccessible: true },
    }));

    render(<FilterPanel resultCount={0} />);

    expect(screen.getByText(/^1 filter selected$/i)).toBeInTheDocument();
  });
});
