import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BrowsePage from '@/pages/BrowsePage';
import { makeChurch, renderWithProviders } from '@/test-utils';
import { ISearchRequest } from '@/types/church';

const fetchChurches = vi.fn();

vi.mock('@/api/auth', () => ({ fetchCurrentUser: () => Promise.resolve(null) }));
vi.mock('@/api/churches', () => ({
  fetchChurches: (request: ISearchRequest) => fetchChurches(request),
  fetchFilterOptions: () =>
    Promise.resolve({
      denominations: [{ value: 'Baptist', count: 3 }],
      languages: ['English'],
      amenities: [],
      neighborhoods: [],
    }),
  toggleSaved: vi.fn(),
}));

const page = (data = [makeChurch()], total = data.length) => ({
  data,
  meta: { page: 1, pageSize: 24, total, totalPages: 1 },
});

describe('BrowsePage', () => {
  beforeEach(() => fetchChurches.mockReset());

  it('renders church cards from the search API', async () => {
    fetchChurches.mockResolvedValue(
      page([makeChurch(), makeChurch({ id: 'c2', slug: 'st-marys', name: 'St. Mary’s' })]),
    );
    renderWithProviders(<BrowsePage />);

    expect(await screen.findByText('Grace Community Church')).toBeInTheDocument();
    expect(screen.getByText('St. Mary’s')).toBeInTheDocument();
    expect(fetchChurches).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 24, sort: 'relevance' }),
    );
  });

  it('applies a category as a URL filter', async () => {
    fetchChurches.mockResolvedValue(page());
    renderWithProviders(<BrowsePage />);
    await screen.findByText('Grace Community Church');

    fireEvent.click(screen.getByRole('button', { name: 'Catholic' }));

    expect(screen.getByTestId('location').textContent).toBe('/?denomination=Catholic');
    await vi.waitFor(() =>
      expect(fetchChurches).toHaveBeenLastCalledWith(
        expect.objectContaining({ denominations: ['Catholic'] }),
      ),
    );
    expect(screen.getByRole('button', { name: 'Catholic' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('offers to clear filters when nothing matches', async () => {
    fetchChurches.mockResolvedValue(page([], 0));
    renderWithProviders(<BrowsePage />, { route: '/?kids=1&day=6' });

    expect(await screen.findByText('No exact matches')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(screen.getByTestId('location').textContent).toBe('/');
  });

  it('shows a retry when the API fails', async () => {
    fetchChurches.mockRejectedValueOnce(new Error('down')).mockResolvedValue(page());
    renderWithProviders(<BrowsePage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Grace Community Church')).toBeInTheDocument();
  });

  it('toggles the map view in the URL', async () => {
    fetchChurches.mockResolvedValue(page());
    renderWithProviders(<BrowsePage />);
    await screen.findByText('Grace Community Church');

    fireEvent.click(screen.getByRole('button', { name: /show map/i }));
    expect(screen.getByTestId('location').textContent).toBe('/?view=map');
    expect(await screen.findByText('The map is unavailable right now.')).toBeInTheDocument();
  });
});
