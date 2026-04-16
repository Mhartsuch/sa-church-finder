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
const useFilterOptionsMock = vi.fn();

vi.mock('@/hooks/useEvents', () => ({
  useEventsFeed: (...args: unknown[]) => useEventsFeedMock(...args),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: () => useAuthSessionMock(),
}));

vi.mock('@/hooks/useChurches', () => ({
  useFilterOptions: () => useFilterOptionsMock(),
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
    neighborhood: 'Downtown',
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
    useFilterOptionsMock.mockReset();
    useFilterOptionsMock.mockReturnValue({
      data: {
        denominations: [],
        languages: [],
        amenities: [],
        neighborhoods: ['Alamo Heights', 'Downtown', 'Southtown'],
        serviceTypes: [],
      },
    });
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

  it('renders the This Sunday preset chip and syncs the upcoming Sunday into the URL on click', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    // Freeze time on a Wednesday so the upcoming-Sunday calculation is
    // deterministic regardless of when the suite runs. 2026-04-15 is a
    // Wednesday; the upcoming Sunday is 2026-04-19.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 10, 30));

    try {
      const { getSearch } = renderPage();

      const presetGroup = screen.getByRole('group', { name: 'Quick date ranges' });
      const sundayButton = within(presetGroup).getByRole('button', { name: 'This Sunday' });

      expect(sundayButton).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(sundayButton);

      const search = new URLSearchParams(getSearch());
      expect(search.get('from')).toBe('2026-04-19');
      expect(search.get('to')).toBe('2026-04-19');

      expect(
        within(screen.getByRole('group', { name: 'Quick date ranges' })).getByRole('button', {
          name: 'This Sunday',
        }),
      ).toHaveAttribute('aria-pressed', 'true');
    } finally {
      vi.useRealTimers();
    }
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

  it('populates the neighborhood select with options from the filter-options endpoint', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage();

    const select = screen.getByLabelText('Filter events by neighborhood') as HTMLSelectElement;
    const optionLabels = Array.from(select.options).map((option) => option.textContent);

    expect(optionLabels).toEqual(['All neighborhoods', 'Alamo Heights', 'Downtown', 'Southtown']);
  });

  it('writes the selected neighborhood to the URL and to the feed filters', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    const { getSearch } = renderPage();

    const select = screen.getByLabelText('Filter events by neighborhood');
    fireEvent.change(select, { target: { value: 'Downtown' } });

    expect(getSearch()).toContain('neighborhood=Downtown');

    // React Query reruns the feed hook with the new filter applied.
    const calls = useEventsFeedMock.mock.calls;
    const lastCallArgs = calls[calls.length - 1]?.[0];
    expect(lastCallArgs).toMatchObject({ neighborhood: 'Downtown' });

    // Active-filter chip renders so the user can see + remove the selection.
    expect(screen.getByText('Neighborhood: Downtown')).toBeInTheDocument();
  });

  it('removes the neighborhood from the URL when its chip is cleared', () => {
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    const { getSearch } = renderPage('/events?neighborhood=Southtown');

    // Chip is visible on mount and clicking it clears the filter.
    const chip = screen.getByRole('button', { name: /Neighborhood: Southtown/ });
    fireEvent.click(chip);

    expect(getSearch()).not.toContain('neighborhood=');
  });

  it('preserves a URL-supplied neighborhood even when it is missing from the options list', () => {
    useFilterOptionsMock.mockReturnValue({
      data: {
        denominations: [],
        languages: [],
        amenities: [],
        neighborhoods: ['Downtown'],
        serviceTypes: [],
      },
    });
    useEventsFeedMock.mockReturnValue({
      data: buildResponse([]),
      isLoading: false,
      isFetching: false,
      error: null,
    });

    renderPage('/events?neighborhood=Stone%20Oak');

    const select = screen.getByLabelText('Filter events by neighborhood') as HTMLSelectElement;
    // The URL-supplied value is still the selected option even though it's
    // not in the filter-options cache, so users can see and clear it.
    expect(select.value).toBe('Stone Oak');
    expect(screen.getByText('Neighborhood: Stone Oak')).toBeInTheDocument();
  });

  describe('denomination filter', () => {
    const denominationOptionsResponse = {
      data: {
        denominations: [
          { value: 'Catholic', count: 24 },
          { value: 'Baptist', count: 18 },
          { value: 'Methodist', count: 9 },
        ],
        languages: [],
        amenities: [],
        neighborhoods: ['Alamo Heights', 'Downtown', 'Southtown'],
        serviceTypes: [],
      },
    };

    it('renders a chip for each available denomination family', () => {
      useFilterOptionsMock.mockReturnValue(denominationOptionsResponse);
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage();

      const group = screen.getByRole('group', { name: 'Denomination' });
      expect(within(group).getByRole('button', { name: 'Catholic' })).toBeInTheDocument();
      expect(within(group).getByRole('button', { name: 'Baptist' })).toBeInTheDocument();
      expect(within(group).getByRole('button', { name: 'Methodist' })).toBeInTheDocument();
    });

    it('hides the denomination row entirely when no families are available', () => {
      // Default mock in beforeEach returns no denominations.
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage();

      expect(screen.queryByRole('group', { name: 'Denomination' })).not.toBeInTheDocument();
    });

    it('toggles the URL and feed filter when a denomination chip is clicked', () => {
      useFilterOptionsMock.mockReturnValue(denominationOptionsResponse);
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      const { getSearch } = renderPage();

      const baptistChip = screen.getByRole('button', { name: 'Baptist' });
      fireEvent.click(baptistChip);

      expect(getSearch()).toContain('denomination=Baptist');

      const calls = useEventsFeedMock.mock.calls;
      const lastCallArgs = calls[calls.length - 1]?.[0];
      expect(lastCallArgs).toMatchObject({ denomination: ['Baptist'] });

      // Active-filter chip surfaces in the chip rail so the user can clear it.
      expect(screen.getByText('Denomination: Baptist')).toBeInTheDocument();
    });

    it('supports selecting multiple denomination families and serializes them with commas', () => {
      useFilterOptionsMock.mockReturnValue(denominationOptionsResponse);
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      const { getSearch } = renderPage();

      fireEvent.click(screen.getByRole('button', { name: 'Baptist' }));
      fireEvent.click(screen.getByRole('button', { name: 'Methodist' }));

      // Order matches the click order so the URL is stable across re-renders.
      expect(getSearch()).toContain('denomination=Baptist%2CMethodist');

      const calls = useEventsFeedMock.mock.calls;
      const lastCallArgs = calls[calls.length - 1]?.[0];
      expect(lastCallArgs).toMatchObject({ denomination: ['Baptist', 'Methodist'] });
    });

    it('removes a single denomination via the chip without clearing the others', () => {
      useFilterOptionsMock.mockReturnValue(denominationOptionsResponse);
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      const { getSearch } = renderPage('/events?denomination=Baptist,Methodist');

      // Both chips render initially.
      expect(screen.getByText('Denomination: Baptist')).toBeInTheDocument();
      expect(screen.getByText('Denomination: Methodist')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Denomination: Baptist/ }));

      // Methodist remains; URL drops Baptist.
      expect(getSearch()).toContain('denomination=Methodist');
      expect(getSearch()).not.toContain('Baptist');
      expect(screen.getByText('Denomination: Methodist')).toBeInTheDocument();
    });

    it('keeps a URL-supplied denomination clickable even when it is missing from the options list', () => {
      useFilterOptionsMock.mockReturnValue({
        data: {
          denominations: [{ value: 'Baptist', count: 18 }],
          languages: [],
          amenities: [],
          neighborhoods: [],
          serviceTypes: [],
        },
      });
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage('/events?denomination=Pentecostal');

      // The unknown family pins to the front of the chip row so it can still
      // be toggled off.
      const group = screen.getByRole('group', { name: 'Denomination' });
      const pentecostalChip = within(group).getByRole('button', { name: 'Pentecostal' });
      expect(pentecostalChip).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('Denomination: Pentecostal')).toBeInTheDocument();
    });
  });

  describe('wheelchair-accessible filter', () => {
    it('renders the accessibility toggle chip regardless of auth state', () => {
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage();

      const chip = screen.getByRole('button', { name: /wheelchair-accessible/i });
      expect(chip).toHaveAttribute('aria-pressed', 'false');
    });

    it('writes accessible=1 to the URL and passes accessibleOnly to the feed filters', () => {
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      const { getSearch } = renderPage();

      const chip = screen.getByRole('button', { name: /wheelchair-accessible/i });
      fireEvent.click(chip);

      expect(getSearch()).toContain('accessible=1');

      const calls = useEventsFeedMock.mock.calls;
      const lastCallArgs = calls[calls.length - 1]?.[0];
      expect(lastCallArgs).toMatchObject({ accessibleOnly: true });

      // Two instances of the label appear once the filter is on: the toggle
      // chip above the form (now in its active state) and the applied-chip in
      // the chip rail below.
      expect(screen.getAllByText('Wheelchair accessible')).toHaveLength(2);
    });

    it('reflects the active state on the toggle when seeded from the URL', () => {
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage('/events?accessible=1');

      const chip = screen.getByRole('button', {
        name: /wheelchair-accessible/i,
      });
      expect(chip).toHaveAttribute('aria-pressed', 'true');
    });

    it('removes accessible=1 from the URL when the filter chip is cleared', () => {
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      const { getSearch } = renderPage('/events?accessible=1');

      const filterChips = screen.getAllByText('Wheelchair accessible');
      // The second occurrence lives in the applied-chips rail (the first is on
      // the toggle chip above the form). Both let the user clear the filter,
      // but the chip-rail instance matches the shared clear-chip flow.
      const clearChip = filterChips[filterChips.length - 1]!.closest('button');
      expect(clearChip).not.toBeNull();
      fireEvent.click(clearChip!);

      expect(getSearch()).not.toContain('accessible=');
    });
  });

  describe('subscribe-to-calendar button', () => {
    // The subscribe button's label and feed URL reflect the active `type`
    // chips so visitors can subscribe to a calendar scoped to exactly the
    // selection they have made on the discovery page.
    it('points at the city feed and uses the generic label when no types are selected', () => {
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage();

      const trigger = screen.getByRole('button', { name: /Subscribe to the city events feed/ });
      fireEvent.click(trigger);

      // The Apple Calendar item swaps the https:// scheme for webcal://, so
      // asserting against that href is the cleanest way to read back the
      // feed URL the button was rendered with.
      const apple = screen.getByRole('menuitem', { name: /Apple Calendar/ });
      expect(apple.getAttribute('href')).toMatch(/\/api\/v1\/events\.ics$/);
    });

    it('names the single active type in the label and feed URL', () => {
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage('/events?type=service');

      const trigger = screen.getByRole('button', { name: /Subscribe to Service events/ });
      fireEvent.click(trigger);

      const apple = screen.getByRole('menuitem', { name: /Apple Calendar/ });
      expect(apple.getAttribute('href')).toMatch(/events\.ics\?type=service$/);
    });

    it('encodes every selected type into the feed URL and counts them in the label', () => {
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage('/events?type=service,community');

      const trigger = screen.getByRole('button', { name: /Subscribe to 2 event-type feeds/ });
      fireEvent.click(trigger);

      const apple = screen.getByRole('menuitem', { name: /Apple Calendar/ });
      // URL-encoded comma (%2C) — the server normalizes this back into a
      // deduped `ChurchEventType[]` via the shared `eventTypesQueryParam`
      // schema, so visitors subscribe to a calendar scoped to both chips.
      expect(apple.getAttribute('href')).toMatch(/events\.ics\?type=service%2Ccommunity$/);
    });
  });

  describe('sort control', () => {
    it('defaults to soonest ordering, keeps the URL clean, and omits sort from filters', () => {
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([makeEvent()]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      const { getSearch } = renderPage();

      // Caption reflects the default chronological ordering.
      expect(screen.getByText('Sorted by soonest start')).toBeInTheDocument();

      // "Soonest" is the active pill in the segmented control.
      const sortGroup = screen.getByRole('group', { name: 'Sort events' });
      expect(within(sortGroup).getByRole('button', { name: 'Soonest' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(within(sortGroup).getByRole('button', { name: 'Recently announced' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );

      // The default is implicit — neither URL nor filter arg should carry it.
      expect(getSearch()).not.toContain('sort=');
      const filterArgs = useEventsFeedMock.mock.calls[0]?.[0];
      expect(filterArgs.sort).toBeUndefined();
    });

    it('writes sort=recent to the URL and forwards it to the feed hook', () => {
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([makeEvent()]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      const { getSearch } = renderPage();

      const sortGroup = screen.getByRole('group', { name: 'Sort events' });
      fireEvent.click(within(sortGroup).getByRole('button', { name: 'Recently announced' }));

      expect(getSearch()).toContain('sort=recent');

      const calls = useEventsFeedMock.mock.calls;
      const lastCallArgs = calls[calls.length - 1]?.[0];
      expect(lastCallArgs).toMatchObject({ sort: 'recent' });

      expect(screen.getByText('Sorted by recently announced')).toBeInTheDocument();
    });

    it('reads sort=recent from the URL and reflects the active state on mount', () => {
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([makeEvent()]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage('/events?sort=recent');

      const sortGroup = screen.getByRole('group', { name: 'Sort events' });
      expect(within(sortGroup).getByRole('button', { name: 'Recently announced' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      const filterArgs = useEventsFeedMock.mock.calls[0]?.[0];
      expect(filterArgs).toMatchObject({ sort: 'recent' });
    });

    it('ignores unknown sort values and falls back to the default', () => {
      useEventsFeedMock.mockReturnValue({
        data: buildResponse([makeEvent()]),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage('/events?sort=alphabetical');

      const sortGroup = screen.getByRole('group', { name: 'Sort events' });
      expect(within(sortGroup).getByRole('button', { name: 'Soonest' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('renders a flat grid without day headers when sorted by recently announced', () => {
      const fresh = makeEvent({
        occurrenceId: 'event-fresh',
        title: 'Just-Announced Food Drive',
        startTime: '2026-04-20T15:00:00.000Z',
      });
      const older = makeEvent({
        occurrenceId: 'event-older',
        title: 'Long-running Service',
        startTime: '2026-04-17T15:00:00.000Z',
      });

      useEventsFeedMock.mockReturnValue({
        data: buildResponse([fresh, older], { total: 2, totalPages: 1 }),
        isLoading: false,
        isFetching: false,
        error: null,
      });

      renderPage('/events?sort=recent');

      // Day-group headings (Today / Tomorrow / weekday labels rendered as
      // <h3> section headers) should not appear under the recency sort —
      // grouping events by day of occurrence doesn't make sense when the
      // feed is ordered by announcement date. The "Today" chip in the
      // date-preset rail is a <button>, not a heading, so restricting the
      // query to the heading role is unambiguous.
      expect(screen.queryByRole('heading', { name: 'Today' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Tomorrow' })).not.toBeInTheDocument();

      expect(
        screen.getByRole('heading', { name: 'Just-Announced Food Drive' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Long-running Service' })).toBeInTheDocument();
    });
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
