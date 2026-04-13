import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/hooks/ToastProvider';
import { ICollectionWithChurches } from '@/types/passport';

import CollectionPage from './CollectionPage';

/* ------------------------------------------------------------------ */
/*  Mock wiring                                                        */
/* ------------------------------------------------------------------ */

const useAuthSessionMock = vi.fn();
const useCollectionMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: () => useAuthSessionMock(),
}));

vi.mock('@/hooks/usePassport', () => ({
  useCollection: (id: string | null) => useCollectionMock(id),
  useUpdateCollection: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteCollection: () => ({ mutate: vi.fn(), isPending: false }),
  useRemoveChurchFromCollection: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

/* ------------------------------------------------------------------ */
/*  Fixtures                                                           */
/* ------------------------------------------------------------------ */

const MOCK_USER = {
  id: 'user-1',
  name: 'Jordan Lee',
  role: 'user',
};

const MOCK_COLLECTION: ICollectionWithChurches = {
  id: 'col-1',
  userId: 'user-1',
  name: 'Sunday Morning Favorites',
  description: 'Churches with great music and preaching.',
  slug: 'sunday-morning-favorites',
  isPublic: true,
  churchCount: 2,
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
  user: { id: 'user-1', name: 'Jordan Lee', avatarUrl: null },
  churches: [
    {
      id: 'church-1',
      name: 'Grace Community Church',
      slug: 'grace-community-church',
      denomination: 'Non-denominational',
      denominationFamily: null,
      address: '100 Grace Dr',
      city: 'San Antonio',
      neighborhood: 'Alamo Heights',
      coverImageUrl: 'https://example.com/grace.jpg',
      avgRating: 4.8,
      reviewCount: 12,
      notes: 'Loved the worship team',
      addedAt: '2026-03-10T00:00:00.000Z',
    },
    {
      id: 'church-2',
      name: 'Hope Fellowship',
      slug: 'hope-fellowship',
      denomination: 'Baptist',
      denominationFamily: 'Baptist',
      address: '200 Hope Blvd',
      city: 'San Antonio',
      neighborhood: 'Stone Oak',
      coverImageUrl: null,
      avgRating: 4.5,
      reviewCount: 8,
      notes: null,
      addedAt: '2026-03-15T00:00:00.000Z',
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const renderCollectionPage = (collectionId = 'col-1'): ReturnType<typeof render> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[`/collections/${collectionId}`]}>
          <Routes>
            <Route path="/collections/:id" element={children} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );

  return render(<CollectionPage />, { wrapper });
};

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('CollectionPage', () => {
  it('renders the collection name as page heading', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: MOCK_COLLECTION,
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Sunday Morning Favorites' }),
    ).toBeInTheDocument();
  });

  it('shows loading skeleton while data is being fetched', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = renderCollectionPage();

    // The loading state renders pulse-animated placeholder blocks
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders churches within the collection', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: MOCK_COLLECTION,
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByText('Grace Community Church')).toBeInTheDocument();
    expect(screen.getByText('Hope Fellowship')).toBeInTheDocument();

    // Denomination labels
    expect(screen.getByText('Non-denominational')).toBeInTheDocument();
    expect(screen.getByText('Baptist')).toBeInTheDocument();
  });

  it('links church cards to their profile pages', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: MOCK_COLLECTION,
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    const graceLinks = screen.getAllByRole('link', { name: /Grace Community Church/i });
    expect(graceLinks[0]).toHaveAttribute('href', '/churches/grace-community-church');

    const hopeLinks = screen.getAllByRole('link', { name: /Hope Fellowship/i });
    expect(hopeLinks[0]).toHaveAttribute('href', '/churches/hope-fellowship');
  });

  it('shows empty state when collection has no churches', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: { ...MOCK_COLLECTION, churches: [], churchCount: 0 },
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByText('No churches yet')).toBeInTheDocument();
    expect(
      screen.getByText('Start exploring and add churches to this collection.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse churches/i })).toHaveAttribute(
      'href',
      '/search',
    );
  });

  it('displays Public visibility badge for a public collection', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: { ...MOCK_COLLECTION, isPublic: true },
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('displays Private visibility badge for a private collection', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: { ...MOCK_COLLECTION, isPublic: false },
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('shows collection not found when there is an error', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    renderCollectionPage();

    expect(screen.getByText('Collection not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Passport/i })).toHaveAttribute(
      'href',
      '/passport',
    );
  });

  it('shows church count badge', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: MOCK_COLLECTION,
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByText('2 churches')).toBeInTheDocument();
  });

  it('uses singular "church" label when count is 1', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: {
        ...MOCK_COLLECTION,
        churchCount: 1,
        churches: [MOCK_COLLECTION.churches[0]],
      },
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByText('1 church')).toBeInTheDocument();
  });

  it('shows the collection creator name', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: MOCK_COLLECTION,
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByText('by Jordan Lee')).toBeInTheDocument();
  });

  it('shows the collection description', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: MOCK_COLLECTION,
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByText('Churches with great music and preaching.')).toBeInTheDocument();
  });

  it('renders church notes when present', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: MOCK_COLLECTION,
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    // Notes are rendered with surrounding quotes via &ldquo; / &rdquo;
    expect(screen.getByText(/Loved the worship team/)).toBeInTheDocument();
  });

  it('renders rating and review count for churches with reviews', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: MOCK_COLLECTION,
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(8)')).toBeInTheDocument();
  });

  it('shows owner actions (visibility toggle, delete) when user is the owner', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: { ...MOCK_COLLECTION, isPublic: true },
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByTitle('Make private')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('hides owner actions when user is not the owner', () => {
    useAuthSessionMock.mockReturnValue({
      user: { id: 'other-user', name: 'Other Person', role: 'user' },
    });
    useCollectionMock.mockReturnValue({
      data: MOCK_COLLECTION,
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Make private')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Make public')).not.toBeInTheDocument();
  });

  it('shows "Make public" toggle when collection is private and user is owner', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: { ...MOCK_COLLECTION, isPublic: false },
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByTitle('Make public')).toBeInTheDocument();
  });

  it('provides a back link to the passport page', () => {
    useAuthSessionMock.mockReturnValue({ user: MOCK_USER });
    useCollectionMock.mockReturnValue({
      data: MOCK_COLLECTION,
      isLoading: false,
      error: null,
    });

    renderCollectionPage();

    expect(screen.getByRole('link', { name: /Back to Passport/i })).toHaveAttribute(
      'href',
      '/passport',
    );
  });
});
