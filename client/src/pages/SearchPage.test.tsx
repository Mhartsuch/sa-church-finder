import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_ZOOM, SA_CENTER } from '@/constants';
import { useCompareStore } from '@/stores/compare-store';
import { useSearchStore } from '@/stores/search-store';

import { SearchPage } from './SearchPage';

vi.mock('@/components/church/ChurchList', () => ({
  ChurchList: () => <div>Church list</div>,
}));

vi.mock('@/components/map/MapContainer', () => ({
  MapContainer: () => <div>Map container</div>,
}));

vi.mock('@/components/search/CategoryFilter', () => ({
  CategoryFilter: ({
    compareCount = 0,
    onCompare,
  }: {
    compareCount?: number;
    onCompare?: () => void;
  }) => (
    <button type="button" onClick={onCompare}>
      Compare {compareCount}
    </button>
  ),
}));

vi.mock('@/components/search/NearMeButton', () => ({
  NearMeButton: () => <button type="button">Near me</button>,
}));

vi.mock('@/hooks/useChurches', () => ({
  useChurchSearchParams: () => ({}),
  useChurches: () => ({
    data: {
      data: [],
      meta: {
        total: 0,
      },
    },
    error: null,
    isLoading: false,
  }),
  useFilterOptions: () => ({
    data: { denominations: [], languages: [], amenities: [] },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useURLSearchState', () => ({
  useURLSearchState: () => undefined,
}));

describe('SearchPage', () => {
  beforeEach(() => {
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
    useCompareStore.setState({
      selectedChurches: [],
    });
  });

  it('opens the filters dialog when navigation state requests it', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/search', state: { openFilters: true } }]}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
  });

  it('keeps the filters dialog closed without the navigation hint', () => {
    render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument();
  });

  it('exposes "Best match" as the first sort option and defaults to it', () => {
    render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const sortSelect = screen.getByRole('combobox') as HTMLSelectElement;

    // Best match is the first option and the selected one on a cold start so
    // users land on the multi-factor relevance ranking instead of raw distance.
    expect(sortSelect.value).toBe('relevance');
    expect(sortSelect.options[0]?.value).toBe('relevance');
    expect(sortSelect.options[0]?.textContent).toBe('Best match');
    // Distance sort is still available, now labeled truthfully as "Nearest".
    const distanceOption = Array.from(sortSelect.options).find((opt) => opt.value === 'distance');
    expect(distanceOption?.textContent).toBe('Nearest');
  });

  it('updates the store when the user picks a different sort option', () => {
    render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'rating' } });

    expect(useSearchStore.getState().sort).toBe('rating');
  });

  it('toggles map mode from the desktop map button', () => {
    render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const mapButton = screen.getByRole('button', { name: 'Show map' });

    expect(screen.queryByText('Map container')).not.toBeInTheDocument();

    fireEvent.click(mapButton);

    expect(screen.getByRole('button', { name: 'Hide map' })).toBeInTheDocument();
    expect(screen.getByText('Map container')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Hide map' }));

    expect(screen.getByRole('button', { name: 'Show map' })).toBeInTheDocument();
    expect(screen.queryByText('Map container')).not.toBeInTheDocument();
  });
});
