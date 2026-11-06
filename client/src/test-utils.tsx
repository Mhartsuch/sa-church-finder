import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { IChurchSummary } from '@/types/church';

/** Renders the current URL so tests can assert on navigation and query strings. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

export const renderWithProviders = (ui: ReactElement, { route = '/', path = '*' } = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

export const makeChurch = (overrides: Partial<IChurchSummary> = {}): IChurchSummary => ({
  id: 'church-1',
  name: 'Grace Community Church',
  slug: 'grace-community-church',
  denomination: 'Southern Baptist',
  denominationFamily: 'Baptist',
  description: 'A welcoming church in the heart of the city.',
  address: '100 Main St',
  city: 'San Antonio',
  state: 'TX',
  zipCode: '78205',
  neighborhood: 'Downtown',
  latitude: 29.42,
  longitude: -98.49,
  phone: '(210) 555-0100',
  website: 'https://grace.example.org',
  avgRating: 0,
  reviewCount: 0,
  googleRating: 4.8,
  googleReviewCount: 120,
  isSaved: false,
  languages: ['English'],
  amenities: ['Parking'],
  coverImageUrl: null,
  goodForChildren: true,
  goodForGroups: null,
  wheelchairAccessible: true,
  photos: [
    { id: 'p1', url: 'https://img.example/1.jpg', altText: 'Sanctuary', displayOrder: 0 },
    { id: 'p2', url: 'https://img.example/2.jpg', altText: null, displayOrder: 1 },
  ],
  services: [
    {
      id: 's1',
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: null,
      serviceType: 'Worship',
      language: 'English',
    },
  ],
  ...overrides,
});
