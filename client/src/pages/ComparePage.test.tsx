import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ComparePage from './ComparePage';
import { IChurchSummary } from '@/types/church';

const mockRemoveChurch = vi.fn();
const mockClearChurches = vi.fn();

vi.mock('@/stores/compare-store', () => ({
  MAX_COMPARE: 4,
  useCompareStore: vi.fn(),
}));

vi.mock('@/hooks/useDocumentHead', () => ({
  useDocumentHead: vi.fn(),
}));

import { useCompareStore } from '@/stores/compare-store';

const mockChurch1: IChurchSummary = {
  id: 'church-1',
  name: 'Grace Baptist Church',
  slug: 'grace-baptist-church',
  denomination: 'Baptist',
  denominationFamily: 'Baptist',
  description: 'A welcoming church',
  address: '123 Main St',
  city: 'San Antonio',
  state: 'TX',
  zipCode: '78201',
  neighborhood: 'Downtown',
  latitude: 29.42,
  longitude: -98.49,
  phone: '(210) 555-1234',
  email: 'info@grace.org',
  website: 'https://grace.org',
  pastorName: null,
  yearEstablished: null,
  avgRating: 4.5,
  reviewCount: 12,
  googleRating: 4.3,
  googleReviewCount: 25,
  isClaimed: true,
  isSaved: false,
  languages: ['English', 'Spanish'],
  amenities: ['Parking', 'Nursery'],
  coverImageUrl: 'https://example.com/photo.jpg',
  businessStatus: null,
  googleMapsUrl: null,
  primaryType: null,
  goodForChildren: true,
  goodForGroups: true,
  wheelchairAccessible: true,
  distance: 2.5,
  photos: [],
  services: [
    {
      id: 's1',
      dayOfWeek: 0,
      startTime: '10:00',
      endTime: '11:30',
      serviceType: 'Sunday Worship',
      language: 'English',
    },
  ],
};

const mockChurch2: IChurchSummary = {
  id: 'church-2',
  name: 'St. Mary Catholic Church',
  slug: 'st-mary-catholic-church',
  denomination: 'Catholic',
  denominationFamily: 'Catholic',
  description: 'A historic parish',
  address: '456 Oak Ave',
  city: 'San Antonio',
  state: 'TX',
  zipCode: '78205',
  neighborhood: 'Alamo Heights',
  latitude: 29.46,
  longitude: -98.47,
  phone: '(210) 555-5678',
  email: 'office@stmary.org',
  website: 'https://stmary.org',
  pastorName: null,
  yearEstablished: null,
  avgRating: 4.8,
  reviewCount: 20,
  googleRating: 4.6,
  googleReviewCount: 40,
  isClaimed: false,
  isSaved: false,
  languages: ['English'],
  amenities: ['Parking'],
  coverImageUrl: null,
  businessStatus: null,
  googleMapsUrl: null,
  primaryType: null,
  goodForChildren: false,
  goodForGroups: true,
  wheelchairAccessible: false,
  distance: 5.3,
  photos: [],
  services: [
    {
      id: 's2',
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: '10:00',
      serviceType: 'Mass',
      language: 'English',
    },
  ],
};

const setupMockStore = (churches: IChurchSummary[]) => {
  vi.mocked(useCompareStore).mockImplementation((selector: unknown) => {
    const state = {
      selectedChurches: churches,
      removeChurch: mockRemoveChurch,
      clearChurches: mockClearChurches,
    };
    return (selector as (s: typeof state) => unknown)(state);
  });
};

const renderComparePage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/compare']}>
        <ComparePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('ComparePage', () => {
  beforeEach(() => {
    mockRemoveChurch.mockClear();
    mockClearChurches.mockClear();
  });

  it('renders the empty state when no churches are selected', () => {
    setupMockStore([]);
    renderComparePage();

    expect(screen.getByRole('heading', { name: /no churches selected yet/i })).toBeInTheDocument();
    expect(screen.getByText(/add up to 4 churches/i)).toBeInTheDocument();
  });

  it('shows the "Browse churches" link in empty state pointing to /search', () => {
    setupMockStore([]);
    renderComparePage();

    const browseLink = screen.getByRole('link', { name: /browse churches/i });
    expect(browseLink).toBeInTheDocument();
    expect(browseLink).toHaveAttribute('href', '/search');
  });

  it('renders the comparison table with church data when churches are selected', () => {
    setupMockStore([mockChurch1, mockChurch2]);
    renderComparePage();

    expect(screen.getByRole('heading', { name: /compare churches/i })).toBeInTheDocument();
    expect(screen.getAllByText('Grace Baptist Church').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('St. Mary Catholic Church').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2 of 4 slots used')).toBeInTheDocument();
  });

  it('shows church names as links to their profile pages', () => {
    setupMockStore([mockChurch1]);
    renderComparePage();

    const churchLinks = screen.getAllByRole('link', { name: /grace baptist church/i });
    expect(churchLinks.length).toBeGreaterThanOrEqual(1);
    expect(churchLinks[0]).toHaveAttribute('href', '/churches/grace-baptist-church');
  });

  it('shows the "Clear all" button when churches exist', () => {
    setupMockStore([mockChurch1]);
    renderComparePage();

    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('calls removeChurch when the remove button is clicked', () => {
    setupMockStore([mockChurch1]);
    renderComparePage();

    const removeButton = screen.getAllByRole('button', {
      name: `Remove ${mockChurch1.name}`,
    })[0];
    fireEvent.click(removeButton);

    expect(mockRemoveChurch).toHaveBeenCalledWith('church-1');
  });

  it('calls clearChurches when the clear all button is clicked', () => {
    setupMockStore([mockChurch1, mockChurch2]);
    renderComparePage();

    const clearButton = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearButton);

    expect(mockClearChurches).toHaveBeenCalledTimes(1);
  });

  it('shows the "Back to search" link when churches are present', () => {
    setupMockStore([mockChurch1]);
    renderComparePage();

    const backLink = screen.getByRole('link', { name: /back to search/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/search');
  });
});
