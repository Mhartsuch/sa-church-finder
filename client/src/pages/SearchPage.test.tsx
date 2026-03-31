import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_ZOOM, SA_CENTER } from '@/constants';
import { useSearchStore } from '@/stores/search-store';

import { SearchPage } from './SearchPage';

vi.mock('@/components/church/ChurchList', () => ({
  ChurchList: () => <div>Church list</div>,
}));

vi.mock('@/components/map/MapContainer', () => ({
  MapContainer: () => <div>Map container</div>,
}));

vi.mock('@/components/search/CategoryFilter', () => ({
  CategoryFilter: () => <div>Category filter</div>,
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
}));

vi.mock('@/hooks/useURLSearchState', () => ({
  useURLSearchState: () => undefined,
}));

describe('SearchPage', () => {
  beforeEach(() => {
    useSearchStore.setState({
      query: '',
      filters: {},
      sort: 'distance',
      page: 1,
      hoveredChurchId: null,
      selectedChurchId: null,
      mapCenter: SA_CENTER,
      mapZoom: DEFAULT_ZOOM,
      mapBounds: null,
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
});
