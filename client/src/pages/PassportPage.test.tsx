import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/hooks/ToastProvider';
import { IChurchCollection, IPassport, IVisitsResponse } from '@/types/passport';

import PassportPage from './PassportPage';

const useAuthSessionMock = vi.fn();
const usePassportMock = vi.fn();
const useUserCollectionsMock = vi.fn();
const useUserVisitsMock = vi.fn();
const createCollectionMutateAsyncMock = vi.fn();
const updateVisitMutateAsyncMock = vi.fn();
const deleteVisitMutateAsyncMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: () => useAuthSessionMock(),
}));

vi.mock('@/hooks/usePassport', () => ({
  usePassport: (userId: string | null) => usePassportMock(userId),
  useUserCollections: (userId: string | null) => useUserCollectionsMock(userId),
  useUserVisits: (...args: [string | null, number?, number?]) => useUserVisitsMock(...args),
  useCreateCollection: () => ({
    mutateAsync: createCollectionMutateAsyncMock,
    isPending: false,
  }),
  useUpdateVisit: () => ({
    mutateAsync: updateVisitMutateAsyncMock,
    isPending: false,
  }),
  useDeleteVisit: () => ({
    mutateAsync: deleteVisitMutateAsyncMock,
    isPending: false,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  useUserVisitsMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
  });
});

const MOCK_USER = {
  id: 'user-1',
  name: 'Maria Garcia',
  email: 'maria@example.com',
};

const MOCK_PASSPORT: IPassport = {
  user: {
    id: 'user-1',
    name: 'Maria Garcia',
    avatarUrl: null,
    createdAt: '2024-06-15T00:00:00.000Z',
  },
  stats: {
    totalVisits: 12,
    uniqueChurches: 8,
    denominationsVisited: 4,
    neighborhoodsVisited: 3,
    collectionsCount: 2,
    reviewCount: 5,
  },
  awards: [
    { awardType: 'FIRST_VISIT', earnedAt: '2024-06-20T00:00:00.000Z' },
    { awardType: 'EXPLORER_5', earnedAt: '2024-08-10T00:00:00.000Z' },
  ],
  recentVisits: [
    {
      id: 'visit-1',
      visitedAt: '2025-01-15T10:00:00.000Z',
      rating: 5,
      notes: 'Beautiful service with wonderful music.',
      church: {
        id: 'church-1',
        name: 'San Fernando Cathedral',
        slug: 'san-fernando-cathedral',
        denomination: 'Catholic',
        denominationFamily: 'Catholic',
        neighborhood: 'Downtown',
        coverImageUrl: null,
        address: '115 Main Plaza',
        city: 'San Antonio',
      },
    },
    {
      id: 'visit-2',
      visitedAt: '2025-01-08T10:00:00.000Z',
      rating: 4,
      notes: null,
      church: {
        id: 'church-2',
        name: 'Community Bible Church',
        slug: 'community-bible-church',
        denomination: 'Non-Denominational',
        denominationFamily: null,
        neighborhood: 'Stone Oak',
        coverImageUrl: null,
        address: '2477 N Loop 1604 E',
        city: 'San Antonio',
      },
    },
  ],
};

const MOCK_COLLECTIONS: IChurchCollection[] = [
  {
    id: 'col-1',
    userId: 'user-1',
    name: 'My Favorites',
    description: 'Top picks',
    slug: 'my-favorites',
    isPublic: true,
    churchCount: 5,
    createdAt: '2024-07-01T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  },
  {
    id: 'col-2',
    userId: 'user-1',
    name: 'To Visit',
    description: null,
    slug: 'to-visit',
    isPublic: false,
    churchCount: 3,
    createdAt: '2024-08-01T00:00:00.000Z',
    updatedAt: '2025-01-05T00:00:00.000Z',
  },
];

const renderPassportPage = (route = '/passport'): ReturnType<typeof render> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/passport" element={children} />
            <Route path="/users/:id/passport" element={children} />
            <Route path="/collections/:id" element={<div data-testid="collection-route" />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );

  return render(<PassportPage />, { wrapper });
};

const setupAuthenticatedUser = () => {
  useAuthSessionMock.mockReturnValue({
    user: MOCK_USER,
    isAuthenticated: true,
    isLoading: false,
  });
};

const setupLoadedPassport = (passport: IPassport = MOCK_PASSPORT) => {
  usePassportMock.mockReturnValue({
    data: passport,
    isLoading: false,
    error: null,
  });
};

const setupLoadedCollections = (collections: IChurchCollection[] = MOCK_COLLECTIONS) => {
  useUserCollectionsMock.mockReturnValue({
    data: collections,
    isLoading: false,
  });
};

describe('PassportPage', () => {
  it('renders the user name as page heading', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Maria Garcia');
  });

  it('shows loading spinner while passport data is loading', () => {
    setupAuthenticatedUser();
    usePassportMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    setupLoadedCollections([]);

    renderPassportPage();

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText('Visit Stats')).not.toBeInTheDocument();
  });

  it('shows loading spinner while auth session is loading', () => {
    useAuthSessionMock.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
    usePassportMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    setupLoadedCollections([]);

    renderPassportPage();

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders visit statistics when data loads', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    expect(screen.getByText('Visit Stats')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Total Visits')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Unique Churches')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Denominations')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Neighborhoods')).toBeInTheDocument();
  });

  it('renders recent visits list with church names', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    expect(screen.getByText('Recent Visits')).toBeInTheDocument();
    expect(screen.getByText('San Fernando Cathedral')).toBeInTheDocument();
    expect(screen.getByText('Community Bible Church')).toBeInTheDocument();
  });

  it('links recent visits to their church profile pages', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    const cathedralLink = screen.getByRole('link', { name: 'San Fernando Cathedral' });
    expect(cathedralLink).toHaveAttribute('href', '/churches/san-fernando-cathedral');
  });

  it('renders visit notes in recent visits', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    expect(screen.getByText('Beautiful service with wonderful music.')).toBeInTheDocument();
  });

  it('renders the awards section with earned and unearned badges', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    expect(screen.getByText('Awards')).toBeInTheDocument();

    // Earned awards
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.getByText('Explorer')).toBeInTheDocument();

    // Unearned awards still displayed
    expect(screen.getByText('Devoted')).toBeInTheDocument();
    expect(screen.getByText('Pilgrim')).toBeInTheDocument();
    expect(screen.getByText('Open Doors')).toBeInTheDocument();
    expect(screen.getByText('Neighborhood Explorer')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('Reviewer')).toBeInTheDocument();
  });

  it('shows empty state when user has no visits', () => {
    setupAuthenticatedUser();
    setupLoadedPassport({
      ...MOCK_PASSPORT,
      stats: {
        totalVisits: 0,
        uniqueChurches: 0,
        denominationsVisited: 0,
        neighborhoodsVisited: 0,
        collectionsCount: 0,
        reviewCount: 0,
      },
      awards: [],
      recentVisits: [],
    });
    setupLoadedCollections([]);

    renderPassportPage();

    expect(
      screen.getByText('No visits yet. Start exploring churches in San Antonio!'),
    ).toBeInTheDocument();
    expect(screen.getByText('Find churches to visit')).toBeInTheDocument();
  });

  it('renders collections section with collection names', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    expect(screen.getByText('Collections')).toBeInTheDocument();
    expect(screen.getByText('My Favorites')).toBeInTheDocument();
    expect(screen.getByText('To Visit')).toBeInTheDocument();
  });

  it('shows church count for each collection', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    expect(screen.getByText('5 churches')).toBeInTheDocument();
    expect(screen.getByText('3 churches')).toBeInTheDocument();
  });

  it('shows public/private badges on collections', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('shows empty collections state when there are no collections', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections([]);

    renderPassportPage();

    expect(
      screen.getByText('No collections yet. Create one to group your favorite churches.'),
    ).toBeInTheDocument();
  });

  it('shows error state when passport fails to load', () => {
    setupAuthenticatedUser();
    usePassportMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('User not found'),
    });
    setupLoadedCollections([]);

    renderPassportPage();

    expect(screen.getByText('Passport not found')).toBeInTheDocument();
    expect(screen.getByText('User not found')).toBeInTheDocument();
    expect(screen.getByText('Go back home')).toBeInTheDocument();
  });

  it('shows "(you)" indicator on own passport', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    expect(screen.getByText('(you)')).toBeInTheDocument();
  });

  it('shows member since date', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    expect(screen.getByText(/Member since June 2024/)).toBeInTheDocument();
  });

  it('renders share button', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('shows "New Collection" link on own passport', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections();

    renderPassportPage();

    expect(screen.getByText('New Collection')).toBeInTheDocument();
  });

  it('hides "(you)" and "New Collection" when viewing another user passport', () => {
    setupAuthenticatedUser();
    setupLoadedPassport({
      ...MOCK_PASSPORT,
      user: {
        ...MOCK_PASSPORT.user,
        id: 'other-user',
        name: 'Other User',
      },
    });
    setupLoadedCollections([]);

    renderPassportPage('/users/other-user/passport');

    expect(screen.queryByText('(you)')).not.toBeInTheDocument();
    expect(screen.queryByText('New Collection')).not.toBeInTheDocument();
  });

  it('shows different empty visit message for other user passport', () => {
    setupAuthenticatedUser();
    setupLoadedPassport({
      ...MOCK_PASSPORT,
      user: {
        ...MOCK_PASSPORT.user,
        id: 'other-user',
        name: 'Other User',
      },
      recentVisits: [],
    });
    setupLoadedCollections([]);

    renderPassportPage('/users/other-user/passport');

    expect(screen.getByText('No visits recorded yet.')).toBeInTheDocument();
    expect(screen.queryByText('Find churches to visit')).not.toBeInTheDocument();
  });

  it('shows singular "church" for collection with one church', () => {
    setupAuthenticatedUser();
    setupLoadedPassport();
    setupLoadedCollections([
      {
        ...MOCK_COLLECTIONS[0],
        churchCount: 1,
      },
    ]);

    renderPassportPage();

    expect(screen.getByText('1 church')).toBeInTheDocument();
  });

  describe('create collection', () => {
    it('opens the create-collection modal from the New Collection button', () => {
      setupAuthenticatedUser();
      setupLoadedPassport();
      setupLoadedCollections();

      renderPassportPage();

      expect(screen.queryByText('Create collection')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /new collection/i }));

      expect(screen.getByRole('heading', { name: 'New collection' })).toBeInTheDocument();
      expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    });

    it('creates a collection and navigates to it', async () => {
      setupAuthenticatedUser();
      setupLoadedPassport();
      setupLoadedCollections();
      createCollectionMutateAsyncMock.mockResolvedValue({
        ...MOCK_COLLECTIONS[0],
        id: 'col-new',
        name: 'Historic Churches',
      });

      renderPassportPage();

      fireEvent.click(screen.getByRole('button', { name: /new collection/i }));
      fireEvent.change(screen.getByLabelText(/^name/i), {
        target: { value: 'Historic Churches' },
      });
      fireEvent.click(screen.getByRole('button', { name: /create collection/i }));

      await waitFor(() => {
        expect(createCollectionMutateAsyncMock).toHaveBeenCalledWith({
          name: 'Historic Churches',
          isPublic: true,
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('collection-route')).toBeInTheDocument();
      });
    });
  });

  describe('visit editing and deleting', () => {
    it('shows edit and delete controls on own visits', () => {
      setupAuthenticatedUser();
      setupLoadedPassport();
      setupLoadedCollections();

      renderPassportPage();

      expect(
        screen.getByRole('button', { name: 'Edit visit to San Fernando Cathedral' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Delete visit to San Fernando Cathedral' }),
      ).toBeInTheDocument();
    });

    it('hides edit and delete controls on another user passport', () => {
      setupAuthenticatedUser();
      setupLoadedPassport({
        ...MOCK_PASSPORT,
        user: { ...MOCK_PASSPORT.user, id: 'other-user', name: 'Other User' },
      });
      setupLoadedCollections([]);

      renderPassportPage('/users/other-user/passport');

      expect(screen.queryByRole('button', { name: /edit visit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete visit/i })).not.toBeInTheDocument();
    });

    it('opens the edit modal prefilled and submits updated notes and rating', async () => {
      setupAuthenticatedUser();
      setupLoadedPassport();
      setupLoadedCollections();
      updateVisitMutateAsyncMock.mockResolvedValue({});

      renderPassportPage();

      fireEvent.click(screen.getByRole('button', { name: 'Edit visit to San Fernando Cathedral' }));

      const notesField = screen.getByLabelText(/notes/i);
      expect(notesField).toHaveValue('Beautiful service with wonderful music.');

      fireEvent.change(notesField, { target: { value: 'A truly moving morning.' } });
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(updateVisitMutateAsyncMock).toHaveBeenCalledWith({
          visitId: 'visit-1',
          input: { notes: 'A truly moving morning.', rating: 5 },
        });
      });
    });

    it('deletes a visit after confirming', async () => {
      setupAuthenticatedUser();
      setupLoadedPassport();
      setupLoadedCollections();
      deleteVisitMutateAsyncMock.mockResolvedValue(undefined);

      renderPassportPage();

      fireEvent.click(
        screen.getByRole('button', { name: 'Delete visit to San Fernando Cathedral' }),
      );

      expect(screen.getByText('Remove this visit?')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Remove visit' }));

      await waitFor(() => {
        expect(deleteVisitMutateAsyncMock).toHaveBeenCalledWith('visit-1');
      });
    });

    it('does not delete when the confirmation is cancelled', () => {
      setupAuthenticatedUser();
      setupLoadedPassport();
      setupLoadedCollections();

      renderPassportPage();

      fireEvent.click(
        screen.getByRole('button', { name: 'Delete visit to San Fernando Cathedral' }),
      );
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(deleteVisitMutateAsyncMock).not.toHaveBeenCalled();
      expect(screen.queryByText('Remove this visit?')).not.toBeInTheDocument();
    });
  });

  describe('full visit timeline', () => {
    const MOCK_VISITS_RESPONSE: IVisitsResponse = {
      data: [
        {
          id: 'visit-10',
          userId: 'user-1',
          churchId: 'church-10',
          visitedAt: '2024-11-03T10:00:00.000Z',
          notes: 'Loved the choir.',
          rating: 4,
          createdAt: '2024-11-03T12:00:00.000Z',
          updatedAt: '2024-11-03T12:00:00.000Z',
          church: {
            id: 'church-10',
            name: 'St. Mark Episcopal',
            slug: 'st-mark-episcopal',
            denomination: 'Episcopal',
            denominationFamily: 'Anglican',
            neighborhood: 'Alamo Heights',
            coverImageUrl: null,
            address: '315 E Pecan St',
            city: 'San Antonio',
          },
        },
      ],
      meta: { page: 1, pageSize: 20, total: 12, totalPages: 2 },
    };

    it('shows a "View all" toggle when the user has visits', () => {
      setupAuthenticatedUser();
      setupLoadedPassport();
      setupLoadedCollections();

      renderPassportPage();

      expect(screen.getByRole('button', { name: 'View all 12 visits' })).toBeInTheDocument();
    });

    it('expands to the paginated timeline and pages through visits', () => {
      setupAuthenticatedUser();
      setupLoadedPassport();
      setupLoadedCollections();
      useUserVisitsMock.mockReturnValue({
        data: MOCK_VISITS_RESPONSE,
        isLoading: false,
        error: null,
      });

      renderPassportPage();

      fireEvent.click(screen.getByRole('button', { name: 'View all 12 visits' }));

      expect(screen.getByText('All Visits')).toBeInTheDocument();
      expect(screen.getByText('St. Mark Episcopal')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      expect(useUserVisitsMock).toHaveBeenLastCalledWith('user-1', 1);

      fireEvent.click(screen.getByRole('button', { name: 'Next' }));

      expect(useUserVisitsMock).toHaveBeenLastCalledWith('user-1', 2);
    });

    it('collapses back to recent visits', () => {
      setupAuthenticatedUser();
      setupLoadedPassport();
      setupLoadedCollections();
      useUserVisitsMock.mockReturnValue({
        data: MOCK_VISITS_RESPONSE,
        isLoading: false,
        error: null,
      });

      renderPassportPage();

      fireEvent.click(screen.getByRole('button', { name: 'View all 12 visits' }));
      fireEvent.click(screen.getByRole('button', { name: 'Show recent only' }));

      expect(screen.getByText('Recent Visits')).toBeInTheDocument();
      expect(screen.getByText('San Fernando Cathedral')).toBeInTheDocument();
    });
  });
});
