import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IAggregatedEvent, IEventsFeedResponse } from '@/types/event';

import EventsDiscoveryPage from './EventsDiscoveryPage';

const useEventsFeedMock = vi.fn();

vi.mock('@/hooks/useEvents', () => ({
  useEventsFeed: (...args: unknown[]) => useEventsFeedMock(...args),
}));

const makeEvent = (overrides: Partial<IAggregatedEvent> = {}): IAggregatedEvent => ({
  id: 'event-1',
  churchId: 'church-1',
  title: 'Easter Sunrise Service',
  description: 'Outdoor service at dawn',
  eventType: 'service',
  startTime: '2026-04-12T11:30:00.000Z',
  endTime: '2026-04-12T13:00:00.000Z',
  locationOverride: null,
  isRecurring: false,
  recurrenceRule: null,
  createdById: 'user-1',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
  church: {
    id: 'church-1',
    slug: 'san-fernando-cathedral',
    name: 'San Fernando Cathedral',
    city: 'San Antonio',
    denomination: 'Catholic',
    coverImageUrl: null,
  },
  ...overrides,
});

const buildResponse = (
  events: IAggregatedEvent[],
  meta: Partial<IEventsFeedResponse['meta']> = {},
): IEventsFeedResponse => ({
  data: events,
  meta: {
    total: events.length,
    page: 1,
    pageSize: 12,
    totalPages: events.length > 0 ? 1 : 0,
    filters: { from: new Date().toISOString() },
    ...meta,
  },
});

const LocationSpy = ({ onLocation }: { onLocation: (search: string) => void }) => {
  const location = useLocation();
  onLocation(location.search);
  return null;
};

const renderPage = (initialEntry = '/events') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  let latestSearch = '';

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/events"
            element={
              <>
                <LocationSpy
                  onLocation={(search) => {
                    latestSearch = search;
                  }}
                />
                {children}
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  const utils = render(<EventsDiscoveryPage />, { wrapper });
  return { ...utils, getSearch: () => latestSearch };
};

describe('EventsDiscoveryPage', () => {
  beforeEach(() => {
    useEventsFeedMock.mockReset();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  it('renders aggregated events with the church name linking to the church profile', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([makeEvent()]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Upcoming community events' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 upcoming event')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Easter Sunrise Service' })).toBeInTheDocument();

    const churchLink = screen.getByRole('link', { name: 'San Fernando Cathedral' });
    expect(churchLink).toHaveAttribute('href', '/churches/san-fernando-cathedral');
  });

  it('shows a friendly empty state when no events match the filters', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([], { total: 0, totalPages: 0 }),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage();

    expect(screen.getByText('No events match those filters yet.')).toBeInTheDocument();
  });

  it('reads initial filters from the URL and passes them to the hook', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage('/events?type=youth&q=easter&from=2026-04-01&to=2026-04-30&page=2');

    const filterArgs = useEventsFeedMock.mock.calls[0]?.[0];
    expect(filterArgs).toMatchObject({
      type: 'youth',
      q: 'easter',
      from: '2026-04-01T00:00:00.000Z',
      to: '2026-04-30T23:59:59.999Z',
      page: 2,
      pageSize: 12,
    });

    // Active filter chips rendered
    expect(screen.getByText('Type: Youth')).toBeInTheDocument();
    expect(screen.getByText('Search: "easter"')).toBeInTheDocument();
  });

  it('updates the URL query string when the user applies filters', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    const { getSearch } = renderPage();

    const typeSelect = screen.getByLabelText('Event type');
    fireEvent.change(typeSelect, { target: { value: 'community' } });

    const applyButton = screen.getByRole('button', { name: 'Apply filters' });
    fireEvent.click(applyButton);

    expect(getSearch()).toContain('type=community');
  });

  it('renders pagination and advances to the next page', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([makeEvent()], { total: 36, totalPages: 3, page: 1, pageSize: 12 }),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    const { getSearch } = renderPage();

    const pagination = screen.getByRole('navigation', { name: 'Events pagination' });
    expect(within(pagination).getByText(/Page 1 of 3/)).toBeInTheDocument();

    const nextButton = within(pagination).getByRole('button', { name: /Next/ });
    fireEvent.click(nextButton);

    expect(getSearch()).toContain('page=2');
  });
});
