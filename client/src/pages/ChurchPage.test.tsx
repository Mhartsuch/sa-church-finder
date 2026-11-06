import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ChurchPage from '@/pages/ChurchPage';
import { makeChurch, renderWithProviders } from '@/test-utils';

// A plain function (not vi.fn) so rejected promises aren't re-tracked by the spy.
let churchResponse: () => Promise<unknown> = () => Promise.resolve(null);
const requestedSlugs: string[] = [];

vi.mock('@/api/auth', () => ({ fetchCurrentUser: () => Promise.resolve(null) }));
vi.mock('@/api/churches', () => ({
  fetchChurch: (slug: string) => {
    requestedSlugs.push(slug);
    return churchResponse();
  },
  toggleSaved: vi.fn(),
}));
vi.mock('@/api/reviews', () => ({
  fetchChurchReviews: () =>
    Promise.resolve({
      data: [],
      meta: { page: 1, pageSize: 6, total: 0, totalPages: 0, sort: 'recent' },
      currentUserReview: null,
    }),
}));

const route = { route: '/churches/grace-community-church', path: '/churches/:slug' };

describe('ChurchPage', () => {
  beforeEach(() => {
    requestedSlugs.length = 0;
  });

  it('renders the profile with photos, services, offerings, and visit actions', async () => {
    const church = {
      ...makeChurch({ amenities: ['Free parking', 'Nursery'] }),
      pastorName: 'Rev. Ana Ruiz',
      yearEstablished: 1952,
      googleMapsUrl: null,
    };
    churchResponse = () => Promise.resolve(church);
    renderWithProviders(<ChurchPage />, route);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Grace Community Church' }),
    ).toBeInTheDocument();
    expect(requestedSlugs).toContain('grace-community-church');
    expect(screen.getByText(/Led by Rev. Ana Ruiz · Est. 1952/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show all 2 photos/i })).toBeInTheDocument();
    expect(screen.getAllByText('Sunday').length).toBeGreaterThan(0);
    expect(screen.getAllByText('9 AM').length).toBeGreaterThan(0);
    expect(screen.getByText('Free parking')).toBeInTheDocument();
    expect(screen.getByText('Great for kids')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /visit website/i })).toHaveAttribute(
      'href',
      'https://grace.example.org',
    );
    expect(screen.getAllByRole('link', { name: /directions/i })[0]).toHaveAttribute(
      'href',
      expect.stringContaining('google.com/maps/dir'),
    );
    expect(document.title).toBe('Grace Community Church · SA Church Finder');
    expect(
      document.head.querySelector('script[type="application/ld+json"]')?.textContent,
    ).toContain('"@type":"Church"');
  });

  it('shows a friendly message for unknown churches', async () => {
    churchResponse = () => Promise.reject(new Error('Not found'));
    renderWithProviders(<ChurchPage />, route);
    expect(await screen.findByText('We can’t find that church')).toBeInTheDocument();
  });
});
