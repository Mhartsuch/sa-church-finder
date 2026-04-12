import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import HomePage from './HomePage';

vi.mock('@/components/search/SearchBar', () => ({
  SearchBar: () => <div data-testid="search-bar">Search bar</div>,
}));

vi.mock('@/components/community/Testimonials', () => ({
  Testimonials: () => <div data-testid="testimonials">Testimonials</div>,
}));

vi.mock('@/components/community/Newsletter', () => ({
  Newsletter: () => <div data-testid="newsletter">Newsletter</div>,
}));

vi.mock('@/hooks/useFeaturedChurches', () => ({
  useFeaturedChurches: () => ({
    data: {
      data: [
        {
          id: '1',
          name: 'Test Church',
          slug: 'test-church',
          denomination: 'Baptist',
          address: '123 Main St',
          city: 'San Antonio',
          state: 'TX',
          zipCode: '78201',
          latitude: 29.42,
          longitude: -98.49,
          avgRating: 4.9,
          reviewCount: 15,
          isClaimed: false,
          isSaved: false,
          languages: [],
          amenities: [],
          coverImageUrl: 'https://example.com/photo.jpg',
          distance: 2.1,
          services: [],
          photos: [
            { id: 'p1', url: 'https://example.com/photo.jpg', altText: null, displayOrder: 0 },
          ],
        },
      ],
      meta: { page: 1, pageSize: 8, total: 42, totalPages: 6 },
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useChurches', () => ({
  useFilterOptions: () => ({
    data: {
      denominations: [
        { value: 'Baptist', count: 6 },
        { value: 'Catholic', count: 8 },
      ],
      languages: ['English', 'Spanish'],
      amenities: ['Parking'],
      neighborhoods: ['Downtown'],
      serviceTypes: ['Sunday Service'],
    },
    isLoading: false,
  }),
}));

const renderHomePage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('HomePage', () => {
  it('renders the hero headline', () => {
    renderHomePage();

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/find your/i);
    expect(heading).toHaveTextContent(/spiritual home/i);
  });

  it('embeds the search bar in the hero', () => {
    renderHomePage();

    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('shows quick stats in the hero', () => {
    renderHomePage();

    // Uses the total count from the featured query (42+)
    expect(screen.getAllByText('42+').length).toBeGreaterThanOrEqual(1);
  });

  it('renders featured church cards', () => {
    renderHomePage();

    expect(screen.getByText('Top-rated churches')).toBeInTheDocument();
    expect(screen.getByText('Test Church')).toBeInTheDocument();
  });

  it('renders neighborhood exploration section', () => {
    renderHomePage();

    expect(screen.getByText('Explore by neighborhood')).toBeInTheDocument();
    expect(screen.getByText('Downtown')).toBeInTheDocument();
    expect(screen.getByText('Stone Oak')).toBeInTheDocument();
  });

  it('renders the how-it-works section', () => {
    renderHomePage();

    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(screen.getByText('Search & filter')).toBeInTheDocument();
    expect(screen.getByText('Compare & save')).toBeInTheDocument();
    expect(screen.getByText('Visit & connect')).toBeInTheDocument();
  });

  it('renders the church leaders CTA', () => {
    renderHomePage();

    expect(screen.getByText('Are you a church leader?')).toBeInTheDocument();
    expect(screen.getByText(/list your church/i)).toBeInTheDocument();
  });

  it('includes testimonials and newsletter sections', () => {
    renderHomePage();

    expect(screen.getByTestId('testimonials')).toBeInTheDocument();
    expect(screen.getByTestId('newsletter')).toBeInTheDocument();
  });

  it('links featured church cards to their profile pages', () => {
    renderHomePage();

    const churchLink = screen.getByRole('link', { name: /test church/i });
    expect(churchLink).toHaveAttribute('href', '/churches/test-church');
  });
});
