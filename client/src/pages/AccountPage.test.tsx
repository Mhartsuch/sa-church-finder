import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import AccountPage from './AccountPage';

const mockUser = {
  id: 'user-1',
  name: 'Matthew Hart',
  email: 'matt@example.com',
  avatarUrl: null,
  role: 'user',
  emailVerified: true,
  createdAt: '2026-01-15T00:00:00.000Z',
};

const mockSavedChurches = [
  {
    id: 'church-1',
    name: 'Grace Baptist Church',
    slug: 'grace-baptist-church',
    denomination: 'Baptist',
    denominationFamily: 'Baptist',
    description: null,
    address: '123 Main St',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78201',
    neighborhood: 'Downtown',
    latitude: 29.42,
    longitude: -98.49,
    phone: null,
    email: null,
    website: null,
    avgRating: 4.5,
    reviewCount: 10,
    googleRating: null,
    googleReviewCount: null,
    isClaimed: true,
    isSaved: true,
    languages: ['English'],
    amenities: ['Parking'],
    coverImageUrl: null,
    businessStatus: null,
    goodForChildren: null,
    goodForGroups: null,
    wheelchairAccessible: null,
    services: [],
    savedAt: '2026-04-01T00:00:00.000Z',
  },
];

const mockUserReviews = [
  {
    id: 'review-1',
    churchId: 'church-1',
    userId: 'user-1',
    rating: 5,
    body: 'Great church!',
    welcomeRating: null,
    worshipRating: null,
    sermonRating: null,
    facilitiesRating: null,
    helpfulCount: 2,
    viewerHasVotedHelpful: false,
    responseBody: null,
    respondedAt: null,
    createdAt: '2026-04-05T00:00:00.000Z',
    updatedAt: '2026-04-05T00:00:00.000Z',
    user: { id: 'user-1', name: 'Matthew Hart', avatarUrl: null },
    church: {
      id: 'church-1',
      name: 'Grace Baptist Church',
      slug: 'grace-baptist-church',
      denomination: 'Baptist',
      city: 'San Antonio',
      state: 'TX',
      neighborhood: 'Downtown',
    },
  },
];

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: () => ({ user: mockUser, isLoading: false }),
  useLogout: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useRequestEmailVerification: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useChurches', () => ({
  useSavedChurches: () => ({
    data: mockSavedChurches,
    isLoading: false,
    error: null,
  }),
  useToggleSavedChurch: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useReviews', () => ({
  useUserReviews: () => ({
    data: mockUserReviews,
    isLoading: false,
    error: null,
  }),
  useDeleteReview: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useFlaggedReviews: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
  useResolveFlaggedReview: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useChurchClaims', () => ({
  useUserChurchClaims: () => ({
    data: { data: [], meta: { total: 0 } },
    isLoading: false,
    error: null,
  }),
  useAdminChurchClaims: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
  useResolveChurchClaim: () => ({
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

vi.mock('@/components/auth/AccountSettings', () => ({
  AccountSettings: () => <div data-testid="account-settings">Account Settings</div>,
}));

const renderAccountPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/account']}>
        <AccountPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('AccountPage', () => {
  it('renders the page heading with the user first name', () => {
    renderAccountPage();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Matthew');
  });

  it('shows the user full name and role', () => {
    renderAccountPage();

    expect(screen.getByText('Matthew Hart')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('displays the saved churches section', () => {
    renderAccountPage();

    expect(screen.getByText('Saved churches')).toBeInTheDocument();
    // Church name appears multiple times (in saved list and possibly in reviews)
    expect(screen.getAllByText('Grace Baptist Church').length).toBeGreaterThanOrEqual(1);
  });

  it('displays the reviews section', () => {
    renderAccountPage();

    expect(screen.getByText('Your reviews')).toBeInTheDocument();
    expect(screen.getByText('Great church!')).toBeInTheDocument();
  });

  it('shows the dashboard summary text', () => {
    renderAccountPage();

    // The summary mentions saved churches and reviews
    const summaryMatches = screen.getAllByText(/saved church/);
    expect(summaryMatches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the account settings component', () => {
    renderAccountPage();

    expect(screen.getByTestId('account-settings')).toBeInTheDocument();
  });

  it('shows the your account section with member since and email', () => {
    renderAccountPage();

    expect(screen.getByText('Your account')).toBeInTheDocument();
    expect(screen.getByText('matt@example.com')).toBeInTheDocument();
  });

  it('shows the next steps section', () => {
    renderAccountPage();

    expect(screen.getByText('Next steps')).toBeInTheDocument();
  });

  it('renders the sign out button', () => {
    renderAccountPage();

    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('links saved churches to their profile pages', () => {
    renderAccountPage();

    // The church name appears as a link to the profile page
    const churchLinks = screen.getAllByRole('link', { name: /Grace Baptist Church/i });
    const profileLink = churchLinks.find((link) =>
      link.getAttribute('href')?.includes('/churches/grace-baptist-church'),
    );
    expect(profileLink).toBeTruthy();
  });
});
