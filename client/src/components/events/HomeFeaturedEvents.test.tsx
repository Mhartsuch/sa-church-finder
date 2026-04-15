import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IEventsFeedResponse } from '@/types/event';

import { HomeFeaturedEvents } from './HomeFeaturedEvents';

const mockUseEventsFeed = vi.fn();

vi.mock('@/hooks/useEvents', () => ({
  useEventsFeed: (params: unknown) => mockUseEventsFeed(params),
}));

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomeFeaturedEvents />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const buildEvent = (overrides: Partial<IEventsFeedResponse['data'][number]> = {}) => ({
  id: 'event-1',
  occurrenceId: 'event-1',
  churchId: 'church-1',
  title: 'Sunday Worship',
  description: 'Weekly gathering',
  eventType: 'service' as const,
  startTime: '2026-04-19T15:00:00.000Z',
  endTime: '2026-04-19T16:00:00.000Z',
  seriesStartTime: '2026-04-19T15:00:00.000Z',
  locationOverride: null,
  isRecurring: false,
  recurrenceRule: null,
  isOccurrence: false,
  createdById: null,
  createdAt: '2026-04-10T00:00:00.000Z',
  updatedAt: '2026-04-10T00:00:00.000Z',
  church: {
    id: 'church-1',
    slug: 'grace-church',
    name: 'Grace Church',
    city: 'San Antonio',
    denomination: 'Baptist',
    coverImageUrl: null,
  },
  ...overrides,
});

describe('HomeFeaturedEvents', () => {
  beforeEach(() => {
    mockUseEventsFeed.mockReset();
  });

  it('renders upcoming events and links to the discovery page', () => {
    mockUseEventsFeed.mockReturnValue({
      data: {
        data: [
          buildEvent(),
          buildEvent({
            id: 'event-2',
            occurrenceId: 'event-2',
            title: 'Food Pantry',
            eventType: 'volunteer',
            church: {
              id: 'church-2',
              slug: 'hope-baptist',
              name: 'Hope Baptist',
              city: 'San Antonio',
              denomination: 'Baptist',
              coverImageUrl: null,
            },
          }),
        ],
        meta: { total: 2, page: 1, pageSize: 3, totalPages: 1, filters: { from: '' } },
      },
      isLoading: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByText('Upcoming church events')).toBeInTheDocument();
    expect(screen.getByText('Sunday Worship')).toBeInTheDocument();
    expect(screen.getByText('Food Pantry')).toBeInTheDocument();

    const viewAll = screen.getAllByRole('link', { name: /view all events/i })[0];
    expect(viewAll).toHaveAttribute('href', '/events');
  });

  it('hides itself when there are no upcoming events', () => {
    mockUseEventsFeed.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, pageSize: 3, totalPages: 0, filters: {} } },
      isLoading: false,
      error: null,
    });

    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('hides itself when the events API errors out', () => {
    mockUseEventsFeed.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
    });

    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('renders skeletons while loading', () => {
    mockUseEventsFeed.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderComponent();
    expect(screen.getByText('Upcoming church events')).toBeInTheDocument();
    // Event titles should not appear while loading
    expect(screen.queryByText('Sunday Worship')).not.toBeInTheDocument();
  });

  it('passes a one-week window to the feed hook', () => {
    mockUseEventsFeed.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, pageSize: 3, totalPages: 0, filters: {} } },
      isLoading: false,
      error: null,
    });

    renderComponent();

    expect(mockUseEventsFeed).toHaveBeenCalledTimes(1);
    const params = mockUseEventsFeed.mock.calls[0][0] as {
      from: string;
      to: string;
      page: number;
      pageSize: number;
    };
    expect(params.page).toBe(1);
    expect(params.pageSize).toBe(3);
    const fromMs = new Date(params.from).getTime();
    const toMs = new Date(params.to).getTime();
    const diffDays = (toMs - fromMs) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(6.9);
    expect(diffDays).toBeLessThanOrEqual(7.1);
  });
});
