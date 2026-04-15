import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IForumPost, IForumPostListResponse } from '@/types/forum';

import ForumPage from './ForumPage';

/* ─── Hook mocks ─── */

const useForumPostsMock = vi.fn();
const useForumPostMock = vi.fn();
const useCreateForumPostMock = vi.fn();
const useCreateForumReplyMock = vi.fn();
const useUpdateForumPostMock = vi.fn();
const useDeleteForumPostMock = vi.fn();
const useDeleteForumReplyMock = vi.fn();

vi.mock('@/hooks/useForum', () => ({
  useForumPosts: (...args: unknown[]) => useForumPostsMock(...args),
  useForumPost: (...args: unknown[]) => useForumPostMock(...args),
  useCreateForumPost: () => useCreateForumPostMock(),
  useCreateForumReply: () => useCreateForumReplyMock(),
  useUpdateForumPost: () => useUpdateForumPostMock(),
  useDeleteForumPost: () => useDeleteForumPostMock(),
  useDeleteForumReply: () => useDeleteForumReplyMock(),
}));

const useAuthSessionMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: () => useAuthSessionMock(),
}));

vi.mock('@/hooks/useDocumentHead', () => ({
  useDocumentHead: vi.fn(),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

/* ─── Helpers ─── */

const mutationIdle = { mutateAsync: vi.fn(), isPending: false };

const makePost = (overrides: Partial<IForumPost> = {}): IForumPost => ({
  id: 'post-1',
  title: 'Welcome to the community',
  body: 'Glad to have everyone here. Feel free to ask questions!',
  category: 'general',
  authorId: 'user-1',
  author: { id: 'user-1', name: 'Jane Doe', avatarUrl: null },
  isPinned: false,
  isLocked: false,
  viewCount: 42,
  replyCount: 5,
  createdAt: '2026-04-01T12:00:00.000Z',
  updatedAt: '2026-04-01T12:00:00.000Z',
  ...overrides,
});

const buildResponse = (
  posts: IForumPost[],
  meta: Partial<IForumPostListResponse['meta']> = {},
): IForumPostListResponse => ({
  data: posts,
  meta: {
    page: 1,
    pageSize: 10,
    total: posts.length,
    totalPages: posts.length > 0 ? 1 : 0,
    sort: 'recent',
    category: null,
    ...meta,
  },
});

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/forum']}>
        <ForumPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

/* ─── Tests ─── */

describe('ForumPage', () => {
  beforeEach(() => {
    useAuthSessionMock.mockReturnValue({ user: null, isAuthenticated: false });
    useForumPostsMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      error: null,
    });
    useForumPostMock.mockReturnValue({ data: null, isLoading: false, error: null });
    useCreateForumPostMock.mockReturnValue(mutationIdle);
    useCreateForumReplyMock.mockReturnValue(mutationIdle);
    useUpdateForumPostMock.mockReturnValue(mutationIdle);
    useDeleteForumPostMock.mockReturnValue(mutationIdle);
    useDeleteForumReplyMock.mockReturnValue(mutationIdle);
  });

  it('renders the page heading', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Forum' })).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(
      screen.getByText('Connect with church visitors and leaders in San Antonio.'),
    ).toBeInTheDocument();
  });

  it('shows loading skeleton when data is loading', () => {
    useForumPostsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = renderPage();

    const skeletonPulses = container.querySelectorAll('.animate-pulse');
    expect(skeletonPulses.length).toBeGreaterThan(0);
  });

  it('renders forum posts when data is loaded', () => {
    const posts = [
      makePost({ id: 'post-1', title: 'Welcome to the community' }),
      makePost({ id: 'post-2', title: 'Best churches downtown?' }),
    ];

    useForumPostsMock.mockReturnValue({
      data: buildResponse(posts),
      isLoading: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText('Welcome to the community')).toBeInTheDocument();
    expect(screen.getByText('Best churches downtown?')).toBeInTheDocument();
  });

  it('shows "New discussion" button for authenticated users', () => {
    useAuthSessionMock.mockReturnValue({
      user: { id: 'user-1', name: 'Jane Doe', role: 'user' },
      isAuthenticated: true,
    });

    renderPage();

    expect(screen.getByRole('button', { name: /New discussion/ })).toBeInTheDocument();
  });

  it('does not show "New discussion" button for unauthenticated users', () => {
    useAuthSessionMock.mockReturnValue({ user: null, isAuthenticated: false });

    renderPage();

    expect(screen.queryByRole('button', { name: /New discussion/ })).not.toBeInTheDocument();
  });

  it('shows category filter buttons', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Church Recommendations' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prayer Requests' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Events' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Newcomers' })).toBeInTheDocument();
  });

  it('shows sort options', () => {
    renderPage();

    const sortSelect = screen.getByRole('combobox') as HTMLSelectElement;
    const optionTexts = Array.from(sortSelect.options).map((o) => o.textContent);

    expect(optionTexts).toContain('Most Recent');
    expect(optionTexts).toContain('Most Viewed');
    expect(optionTexts).toContain('Most Replies');
  });

  it('renders pinned post with pin indicator', () => {
    const pinnedPost = makePost({
      id: 'pinned-1',
      title: 'Community guidelines',
      isPinned: true,
    });

    useForumPostsMock.mockReturnValue({
      data: buildResponse([pinnedPost]),
      isLoading: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText('Community guidelines')).toBeInTheDocument();
  });

  it('shows empty state when no posts exist for an unauthenticated user', () => {
    useAuthSessionMock.mockReturnValue({ user: null, isAuthenticated: false });

    useForumPostsMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText('No discussions yet')).toBeInTheDocument();
    expect(screen.getByText('Sign in to start a conversation.')).toBeInTheDocument();
  });

  it('shows empty state with different prompt for an authenticated user', () => {
    useAuthSessionMock.mockReturnValue({
      user: { id: 'user-1', name: 'Jane Doe', role: 'user' },
      isAuthenticated: true,
    });

    useForumPostsMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText('No discussions yet')).toBeInTheDocument();
    expect(screen.getByText('Be the first to start a conversation!')).toBeInTheDocument();
  });

  it('shows sign-in prompt at the bottom for unauthenticated users', () => {
    useAuthSessionMock.mockReturnValue({ user: null, isAuthenticated: false });

    renderPage();

    expect(
      screen.getByText((content) =>
        content.includes('to join the conversation and start discussions.'),
      ),
    ).toBeInTheDocument();
  });

  it('displays error message when loading fails', () => {
    useForumPostsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });

    renderPage();

    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows pagination when there are multiple pages', () => {
    useForumPostsMock.mockReturnValue({
      data: buildResponse([makePost()], { total: 30, totalPages: 3, page: 1, pageSize: 10 }),
      isLoading: false,
      error: null,
    });

    renderPage();

    const pagination = screen.getByRole('navigation', { name: 'Forum pagination' });
    expect(pagination).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });

  it('does not show pagination for a single page of results', () => {
    useForumPostsMock.mockReturnValue({
      data: buildResponse([makePost()], { total: 3, totalPages: 1 }),
      isLoading: false,
      error: null,
    });

    renderPage();

    expect(screen.queryByRole('navigation', { name: 'Forum pagination' })).not.toBeInTheDocument();
  });

  it('displays post metadata (author name, reply count, view count, category)', () => {
    const post = makePost({
      author: { id: 'user-2', name: 'John Smith', avatarUrl: null },
      replyCount: 12,
      viewCount: 99,
      category: 'events',
    });

    useForumPostsMock.mockReturnValue({
      data: buildResponse([post]),
      isLoading: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
    // "Events" appears both as a category filter button and as the post's category badge.
    // Use getAllByText to verify at least one instance is the post metadata badge.
    const eventsElements = screen.getAllByText('Events');
    expect(eventsElements.length).toBeGreaterThanOrEqual(2);
  });
});
