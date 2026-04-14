import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { ChurchProfilePage } from './ChurchProfilePage';

const mockChurch = {
  id: 'church-1',
  name: 'Grace Baptist Church',
  slug: 'grace-baptist-church',
  denomination: 'Southern Baptist',
  denominationFamily: 'Baptist',
  description: 'A welcoming community of faith in the heart of San Antonio.',
  address: '123 Main St',
  city: 'San Antonio',
  state: 'TX',
  zipCode: '78201',
  neighborhood: 'Downtown',
  latitude: 29.42,
  longitude: -98.49,
  phone: '(210) 555-1234',
  email: 'info@gracebaptist.org',
  website: 'https://gracebaptist.org',
  pastorName: 'Pastor John Smith',
  yearEstablished: 1952,
  avgRating: 4.7,
  reviewCount: 23,
  googleRating: 4.5,
  googleReviewCount: 45,
  isClaimed: true,
  isSaved: false,
  claimedById: null,
  languages: ['English', 'Spanish'],
  amenities: ['Parking', 'Nursery', 'Wheelchair Accessible'],
  coverImageUrl: 'https://example.com/cover.jpg',
  businessStatus: null,
  googleMapsUrl: 'https://maps.google.com',
  primaryType: null,
  goodForChildren: true,
  goodForGroups: true,
  wheelchairAccessible: true,
  photos: [
    {
      id: 'p1',
      url: 'https://example.com/photo1.jpg',
      altText: 'Church exterior',
      displayOrder: 0,
    },
    { id: 'p2', url: 'https://example.com/photo2.jpg', altText: 'Sanctuary', displayOrder: 1 },
  ],
  viewerClaim: null,
  services: [
    {
      id: 's1',
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: '10:30',
      serviceType: 'Traditional Worship',
      language: 'English',
    },
    {
      id: 's2',
      dayOfWeek: 0,
      startTime: '11:00',
      endTime: '12:00',
      serviceType: 'Contemporary Worship',
      language: 'English',
    },
    {
      id: 's3',
      dayOfWeek: 3,
      startTime: '19:00',
      endTime: '20:00',
      serviceType: 'Bible Study',
      language: 'English',
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

const mockReviews = {
  data: [
    {
      id: 'review-1',
      churchId: 'church-1',
      userId: 'user-2',
      rating: 5,
      body: 'Wonderful church with a warm community!',
      welcomeRating: 5,
      worshipRating: 5,
      sermonRating: 4,
      facilitiesRating: 4,
      helpfulCount: 3,
      viewerHasVotedHelpful: false,
      responseBody: null,
      respondedAt: null,
      createdAt: '2026-03-15T00:00:00.000Z',
      updatedAt: '2026-03-15T00:00:00.000Z',
      user: { id: 'user-2', name: 'Jane Doe', avatarUrl: null },
    },
  ],
  meta: { page: 1, pageSize: 10, total: 1, totalPages: 1, sort: 'recent' as const },
  currentUserReview: null,
};

const mockEvents = {
  data: [],
  meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
};

vi.mock('@/hooks/useChurches', () => ({
  useChurch: vi.fn(() => ({
    data: mockChurch,
    isLoading: false,
    error: null,
  })),
  useToggleSavedChurch: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useReviews', () => ({
  useChurchReviews: () => ({
    data: mockReviews,
    isLoading: false,
    error: null,
  }),
  useAddHelpfulVote: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useRemoveHelpfulVote: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useFlagReview: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useEvents', () => ({
  useChurchEvents: () => ({
    data: mockEvents,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: () => ({
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@test.com',
      role: 'user',
      emailVerified: true,
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useChurchClaims', () => ({
  useSubmitChurchClaim: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/usePassport', () => ({
  useCreateVisit: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toasts: [],
    addToast: vi.fn(),
    dismissToast: vi.fn(),
  }),
}));

vi.mock('@/components/church/ChurchProfileHero', () => ({
  ChurchProfileHero: ({ name }: { name: string }) => (
    <div data-testid="church-hero">{name} Hero</div>
  ),
}));

vi.mock('@/components/layout/ConfirmDialog', () => ({
  ConfirmDialog: () => null,
}));

vi.mock('@/utils/awards', () => ({
  getAwardDisplayName: (key: string) => key,
}));

vi.mock('@/components/reviews/ReviewForm', () => ({
  default: () => <div data-testid="review-form">Review Form</div>,
}));

vi.mock('@/components/church/LogVisitModal', () => ({
  LogVisitModal: () => null,
}));

vi.mock('@/components/church/Lightbox', () => ({
  Lightbox: () => null,
}));

vi.mock('@/components/seo/JsonLd', () => ({
  ChurchJsonLd: () => null,
  BreadcrumbJsonLd: () => null,
}));

const renderChurchProfilePage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/churches/grace-baptist-church']}>
        <Routes>
          <Route path="/churches/:slug" element={<ChurchProfilePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('ChurchProfilePage', () => {
  it('renders the church name as the page heading', () => {
    renderChurchProfilePage();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Grace Baptist Church');
  });

  it('shows the church denomination', () => {
    renderChurchProfilePage();

    expect(screen.getByText('Southern Baptist')).toBeInTheDocument();
  });

  it('shows the church address', () => {
    renderChurchProfilePage();

    expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
  });

  it('renders the photos section', () => {
    renderChurchProfilePage();

    expect(screen.getByText('Photos')).toBeInTheDocument();
  });

  it('shows the description', () => {
    renderChurchProfilePage();

    expect(screen.getByText(/welcoming community of faith/)).toBeInTheDocument();
  });

  it('renders the service schedule section', () => {
    renderChurchProfilePage();

    expect(screen.getByText('Service schedule')).toBeInTheDocument();
    expect(screen.getByText('Sunday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
  });

  it('shows service types and times', () => {
    renderChurchProfilePage();

    expect(screen.getByText('Traditional Worship')).toBeInTheDocument();
    expect(screen.getByText('Contemporary Worship')).toBeInTheDocument();
    expect(screen.getByText('Bible Study')).toBeInTheDocument();
  });

  it('renders the visitor reviews section', () => {
    renderChurchProfilePage();

    expect(screen.getByText('Visitor reviews')).toBeInTheDocument();
    expect(screen.getByText('Wonderful church with a warm community!')).toBeInTheDocument();
  });

  it('shows the review author name', () => {
    renderChurchProfilePage();

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('displays the church rating', () => {
    renderChurchProfilePage();

    // Rating appears in the UI
    expect(screen.getAllByText('4.7').length).toBeGreaterThanOrEqual(1);
  });

  it('shows church contact information', () => {
    renderChurchProfilePage();

    expect(screen.getByText('(210) 555-1234')).toBeInTheDocument();
    expect(screen.getByText('info@gracebaptist.org')).toBeInTheDocument();
  });

  it('shows the languages spoken', () => {
    renderChurchProfilePage();

    // Languages appear multiple times (in services and church info)
    expect(screen.getAllByText(/English/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Spanish/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders the review form for authenticated users', () => {
    renderChurchProfilePage();

    expect(screen.getByTestId('review-form')).toBeInTheDocument();
  });

  it('shows the not-found state when church is missing', async () => {
    const { useChurch } = await import('@/hooks/useChurches');
    (useChurch as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: null,
    });

    renderChurchProfilePage();

    expect(screen.getByText('Church Not Found')).toBeInTheDocument();
  });

  it('does not render the "Online and ways to connect" section when no enrichment is present', () => {
    renderChurchProfilePage();
    expect(screen.queryByText('Online and ways to connect')).not.toBeInTheDocument();
  });

  it('renders enrichment resources, ministries, affiliations, and social links', async () => {
    const { useChurch } = await import('@/hooks/useChurches');
    (useChurch as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      data: {
        ...mockChurch,
        enrichment: {
          ministries: ['AWANA', 'Celebrate Recovery'],
          affiliations: ['Southern Baptist Convention'],
          serviceStyle: 'Blended',
          sermonUrl: 'https://example.com/sermons',
          livestreamUrl: 'https://example.com/live',
          statementOfFaithUrl: null,
          givingUrl: 'https://example.com/give',
          newVisitorUrl: 'https://example.com/new',
          parkingInfo: 'Large lot on the north side.',
          dressCode: 'Casual welcome.',
          socialLinks: {
            facebook: 'https://facebook.com/gracebaptist',
            instagram: null,
            twitter: null,
            youtube: 'https://youtube.com/@gracebaptist',
          },
          updatedAt: '2026-04-10T00:00:00.000Z',
        },
      },
      isLoading: false,
      error: null,
    });

    renderChurchProfilePage();

    expect(screen.getByText('Online and ways to connect')).toBeInTheDocument();
    expect(screen.getByText('New visitor info')).toBeInTheDocument();
    expect(screen.getByText('Sermons')).toBeInTheDocument();
    expect(screen.getByText('Livestream')).toBeInTheDocument();
    expect(screen.getByText('Give online')).toBeInTheDocument();
    expect(screen.queryByText('Statement of faith')).not.toBeInTheDocument();

    expect(screen.getByText('AWANA')).toBeInTheDocument();
    expect(screen.getByText('Celebrate Recovery')).toBeInTheDocument();
    expect(screen.getByText('Southern Baptist Convention')).toBeInTheDocument();
    expect(screen.getByText('Blended worship style')).toBeInTheDocument();

    expect(screen.getByText('Large lot on the north side.')).toBeInTheDocument();
    expect(screen.getByText('Casual welcome.')).toBeInTheDocument();

    const facebook = screen.getByRole('link', { name: 'Facebook' });
    expect(facebook).toHaveAttribute('href', 'https://facebook.com/gracebaptist');
    expect(facebook).toHaveAttribute('target', '_blank');
    const youtube = screen.getByRole('link', { name: 'YouTube' });
    expect(youtube).toHaveAttribute('href', 'https://youtube.com/@gracebaptist');
    expect(screen.queryByRole('link', { name: 'Instagram' })).not.toBeInTheDocument();
  });
});
