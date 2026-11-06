import { act, fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReviewSection } from '@/components/reviews/ReviewSection';
import { makeChurch, renderWithProviders } from '@/test-utils';
import { IChurch } from '@/types/church';

const fetchCurrentUser = vi.fn();
const fetchChurchReviews = vi.fn();
const createReview = vi.fn();

vi.mock('@/api/auth', () => ({ fetchCurrentUser: () => fetchCurrentUser() }));
vi.mock('@/api/reviews', () => ({
  fetchChurchReviews: (...args: unknown[]) => fetchChurchReviews(...args),
  createReview: (...args: unknown[]) => createReview(...args),
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
  fetchUserReviews: vi.fn(),
}));

const church: IChurch = {
  ...makeChurch({ avgRating: 4.5, reviewCount: 1 }),
  pastorName: null,
  yearEstablished: null,
  googleMapsUrl: null,
  email: null,
};

const review = {
  id: 'r1',
  churchId: church.id,
  userId: 'u2',
  rating: 5,
  body: 'Warm welcome and beautiful worship.',
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
  user: { id: 'u2', name: 'Maria', avatarUrl: null },
};

const response = (currentUserReview = null) => ({
  data: [review],
  meta: { page: 1, pageSize: 6, total: 1, totalPages: 1, sort: 'recent' },
  currentUserReview,
});

describe('ReviewSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchChurchReviews.mockResolvedValue(response());
  });

  it('lists reviews and asks anonymous visitors to log in', async () => {
    fetchCurrentUser.mockResolvedValue(null);
    renderWithProviders(<ReviewSection church={church} />, {
      route: '/churches/grace-community-church',
    });

    expect(await screen.findByText('Warm welcome and beautiful worship.')).toBeInTheDocument();
    expect(screen.getByText('4.5 · 1 review')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in to write a review' })).toHaveAttribute(
      'href',
      '/login?returnTo=%2Fchurches%2Fgrace-community-church%23reviews',
    );
  });

  it('lets a signed-in member post a review', async () => {
    fetchCurrentUser.mockResolvedValue({
      id: 'u1',
      name: 'Ana',
      email: 'a@x.co',
      avatarUrl: null,
      emailVerified: true,
      createdAt: '',
    });
    createReview.mockResolvedValue({ ...review, id: 'r2', userId: 'u1' });
    renderWithProviders(<ReviewSection church={church} />);

    const submit = await screen.findByRole('button', { name: 'Post review' });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '4 stars' }));
    fireEvent.change(screen.getByPlaceholderText(/how was the welcome/i), {
      target: { value: 'Friendly people and great kids ministry.' },
    });
    await act(async () => {
      fireEvent.click(submit);
    });

    expect(createReview).toHaveBeenCalledWith(church.id, {
      rating: 4,
      body: 'Friendly people and great kids ministry.',
    });
  });
});
