import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IAggregatedEvent, IEventsFeedResponse } from '@/types/event';

import { ToastProvider } from '@/hooks/ToastProvider';

import EventsDiscoveryPage from './EventsDiscoveryPage';

const useEventsFeedMock = vi.fn();
const useAuthSessionMock = vi.fn();

vi.mock('@/hooks/useEvents', () => ({
  useEventsFeed: (...args: unknown[]) => useEventsFeedMock(...args),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: () => useAuthSessionMock(),
}));

const makeEvent = (overrides: Partial<IAggregatedEvent> = {}): IAggregatedEvent => ({
  id: 'event-1',
  occurrenceId: 'event-1',
  churchId: 'church-1',
  title: 'Easter Sunrise Service',
  description: 'Outdoor service at dawn',
  eventType: 'service',
  startTime: '2026-04-12T11:30:00.000Z',
  endTime: '2026-04-12T13:00:00.000Z',
  seriesStartTime: '2026-04-12T11:30:00.000Z',
  locationOverride: null,
  isRecurring: false,
  recurrenceRule: null,
  isOccurrence: false,
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
    filters: { from: new Date().toISOString(), to: new Date().toISOString() },
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
      <ToastProvider>
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
      </ToastProvider>
    </QueryClientProvider>
  );

  const utils = render(<EventsDiscoveryPage />, { wrapper });
  return { ...utils, getSearch: () => latestSearch };
};

describe('EventsDiscoveryPage', () => {
  beforeEach(() => {
    useEventsFeedMock.mockReset();
    useAuthSessionMock.mockReset();
    useAuthSessionMock.mockReturnValue({ user: null, isAuthenticated: false });
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

    expect(screen.getByRole('heading', { name: 'Upcoming community events' })).toBeInTheDocument();
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
      type: ['youth'],
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

  it('writes the selected event type to the URL when its chip is toggled on', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    const { getSearch } = renderPage();

    const typeGroup = screen.getByRole('group', { name: 'Event type' });
    fireEvent.click(within(typeGroup).getByRole('button', { name: 'Community' }));

    expect(getSearch()).toContain('type=community');
  });

  it('supports selecting multiple event types as a comma-separated list', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    const { getSearch } = renderPage();

    const typeGroup = screen.getByRole('group', { name: 'Event type' });
    fireEvent.click(within(typeGroup).getByRole('button', { name: 'Service' }));
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Event type' })).getByRole('button', {
        name: 'Community',
      }),
    );

    // URL captures both selections in click order.
    const search = getSearch();
    expect(search).toContain('type=service%2Ccommunity');

    // Both chips show up in the active filter strip.
    expect(screen.getByText('Type: Service')).toBeInTheDocument();
    expect(screen.getByText('Type: Community')).toBeInTheDocument();

    // Both chip buttons reflect aria-pressed=true.
    expect(
      within(screen.getByRole('group', { name: 'Event type' })).getByRole('button', {
        name: 'Service',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(screen.getByRole('group', { name: 'Event type' })).getByRole('button', {
        name: 'Community',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('parses a comma-separated `type` URL param into a multi-select filter', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage('/events?type=service,community');

    const filterArgs = useEventsFeedMock.mock.calls[0]?.[0];
    expect(filterArgs).toMatchObject({ type: ['service', 'community'] });

    // Two separate chips so each type can be removed independently.
    expect(screen.getByText('Type: Service')).toBeInTheDocument();
    expect(screen.getByText('Type: Community')).toBeInTheDocument();
  });

  it('removes a single event type from the URL when its chip is cleared', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    const { getSearch } = renderPage('/events?type=service,community');

    // Click the "Type: Service" active-filter chip to remove just `service`.
    const chip = screen.getByRole('button', { name: /Type: Service/ });
    fireEvent.click(chip);

    const search = getSearch();
    expect(search).toContain('type=community');
    expect(search).not.toContain('service');
  });

  it('ignores unknown event types in the URL', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage('/events?type=service,not-a-type');

    const filterArgs = useEventsFeedMock.mock.calls[0]?.[0];
    expect(filterArgs).toMatchObject({ type: ['service'] });
  });

  it('applies a date preset to the URL when clicked, and toggles it off on second click', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    const { getSearch } = renderPage();

    const presetGroup = screen.getByRole('group', { name: 'Quick date ranges' });
    const todayButton = within(presetGroup).getByRole('button', { name: 'Today' });

    expect(todayButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(todayButton);

    const search = getSearch();
    expect(search).toContain('from=');
    expect(search).toContain('to=');

    // Button reflects active state
    expect(
      within(screen.getByRole('group', { name: 'Quick date ranges' })).getByRole('button', {
        name: 'Today',
      }),
    ).toHaveAttribute('aria-pressed', 'true');

    // Clicking the same preset again clears the range
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Quick date ranges' })).getByRole('button', {
        name: 'Today',
      }),
    );

    const cleared = getSearch();
    expect(cleared).not.toContain('from=');
    expect(cleared).not.toContain('to=');
  });

  it('hides the "From saved churches" toggle for signed-out visitors', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage();

    expect(screen.queryByRole('button', { name: /From saved churches/i })).not.toBeInTheDocument();
  });

  it('shows the saved-only toggle for signed-in users and reflects it in the URL when pressed', () => {
    useAuthSessionMock.mockReturnValue({
      user: { id: 'user-1' },
      isAuthenticated: true,
    });
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    const { getSearch } = renderPage();

    const presetGroup = screen.getByRole('group', { name: 'Quick date ranges' });
    const toggle = within(presetGroup).getByRole('button', { name: /From saved churches/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);

    expect(getSearch()).toContain('saved=1');
    expect(
      within(screen.getByRole('group', { name: 'Quick date ranges' })).getByRole('button', {
        name: /From saved churches/i,
      }),
    ).toHaveAttribute('aria-pressed', 'true');

    // Both the toggle and the active-filter chip now exist
    const matches = screen.getAllByRole('button', { name: /From saved churches/i });
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('passes savedOnly=true to the feed hook when the URL carries saved=1 and the user is signed in', () => {
    useAuthSessionMock.mockReturnValue({
      user: { id: 'user-1' },
      isAuthenticated: true,
    });
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage('/events?saved=1');

    const filterArgs = useEventsFeedMock.mock.calls[0]?.[0];
    expect(filterArgs).toMatchObject({ savedOnly: true });
  });

  it('does not forward savedOnly when the visitor is signed out, even if saved=1 is in the URL', () => {
    useAuthSessionMock.mockReturnValue({ user: null, isAuthenticated: false });
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage('/events?saved=1');

    const filterArgs = useEventsFeedMock.mock.calls[0]?.[0];
    expect(filterArgs.savedOnly).toBeUndefined();
  });

  it('shows a saved-churches-specific empty state copy when the filter is active but no events come back', () => {
    useAuthSessionMock.mockReturnValue({
      user: { id: 'user-1' },
      isAuthenticated: true,
    });
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([], { total: 0, totalPages: 0 }),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage('/events?saved=1');

    expect(
      screen.getByText('None of your saved churches have upcoming events yet.'),
    ).toBeInTheDocument();
  });

  it('reads timeOfDay from the URL and forwards it to the feed hook', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage('/events?timeOfDay=morning');

    const filterArgs = useEventsFeedMock.mock.calls[0]?.[0];
    expect(filterArgs).toMatchObject({ timeOfDay: 'morning' });

    expect(screen.getByText('Time of day: Morning')).toBeInTheDocument();

    const timeGroup = screen.getByRole('group', { name: 'Time of day' });
    expect(within(timeGroup).getByRole('button', { name: 'Morning' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('toggles a time-of-day chip into the URL when clicked, and clears it on second click', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    const { getSearch } = renderPage();

    const timeGroup = screen.getByRole('group', { name: 'Time of day' });
    const eveningButton = within(timeGroup).getByRole('button', { name: 'Evening' });
    fireEvent.click(eveningButton);

    expect(getSearch()).toContain('timeOfDay=evening');

    fireEvent.click(
      within(screen.getByRole('group', { name: 'Time of day' })).getByRole('button', {
        name: 'Evening',
      }),
    );

    expect(getSearch()).not.toContain('timeOfDay=');
  });

  it('ignores unknown timeOfDay values from the URL', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage('/events?timeOfDay=midnight');

    const filterArgs = useEventsFeedMock.mock.calls[0]?.[0];
    expect(filterArgs.timeOfDay).toBeUndefined();
    expect(screen.queryByText(/Time of day:/)).not.toBeInTheDocument();
  });

  it('groups events by local day with a header above each day section', () => {
    // Pin "now" so day labels are deterministic regardless of the host clock
    // and timezone. Using noon local time keeps the computed "Today"/"Tomorrow"
    // keys clear of midnight regardless of DST.
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(2026, 3, 15, 12, 0, 0));

      // Build event timestamps from local-time Date objects (rather than UTC
      // strings) so the local-day keys match the fixed "now" irrespective of
      // the host's zone.
      const dayOneMorning = makeEvent({
        id: 'ev-a',
        occurrenceId: 'ev-a',
        title: 'Morning Prayer',
        startTime: new Date(2026, 3, 15, 8, 0).toISOString(),
        endTime: new Date(2026, 3, 15, 9, 0).toISOString(),
      });
      const dayOneEvening = makeEvent({
        id: 'ev-b',
        occurrenceId: 'ev-b',
        title: 'Evening Bible Study',
        startTime: new Date(2026, 3, 15, 19, 0).toISOString(),
        endTime: new Date(2026, 3, 15, 20, 30).toISOString(),
      });
      const dayTwoDinner = makeEvent({
        id: 'ev-c',
        occurrenceId: 'ev-c',
        title: 'Community Dinner',
        startTime: new Date(2026, 3, 17, 18, 0).toISOString(),
        endTime: new Date(2026, 3, 17, 20, 0).toISOString(),
      });

      useEventsFeedMock.mockReturnValue({
        data: buildResponse([dayOneMorning, dayOneEvening, dayTwoDinner], {
          total: 3,
          totalPages: 1,
        }),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage();

      // Same-day events collapse under a single "Today" header...
      const todaySection = screen.getByRole('region', { name: 'Today' });
      expect(within(todaySection).getByText('2 events')).toBeInTheDocument();
      expect(
        within(todaySection).getByRole('heading', { name: 'Morning Prayer' }),
      ).toBeInTheDocument();
      expect(
        within(todaySection).getByRole('heading', { name: 'Evening Bible Study' }),
      ).toBeInTheDocument();

      // ...and a later day gets its own header with a day-of-week label.
      const laterSection = screen.getByRole('region', { name: 'Friday, April 17' });
      expect(within(laterSection).getByText('1 event')).toBeInTheDocument();
      expect(
        within(laterSection).getByRole('heading', { name: 'Community Dinner' }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
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
