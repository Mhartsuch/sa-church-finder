import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/hooks/useToast';
import { IChurchEvent } from '@/types/event';

import { EventManager } from './EventManager';

const fetchMock = vi.fn();

const sampleEvent: IChurchEvent = {
  id: 'event-1',
  occurrenceId: 'event-1',
  churchId: 'church-1',
  title: 'Neighborhood Prayer Night',
  description: 'Prayer and dinner with the neighborhood.',
  eventType: 'community',
  startTime: '2026-05-10T18:30:00.000Z',
  endTime: '2026-05-10T20:00:00.000Z',
  seriesStartTime: '2026-05-10T18:30:00.000Z',
  locationOverride: null,
  isRecurring: false,
  recurrenceRule: null,
  isOccurrence: false,
  createdById: 'user-1',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

const renderWithProviders = (children: ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>,
  );
};

describe('EventManager', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('shows an empty state when no events exist', () => {
    renderWithProviders(
      <EventManager
        churchId="church-1"
        churchName="Grace Community Church"
        events={[]}
        isLoading={false}
      />,
    );

    expect(screen.getByText(/no public events scheduled yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add event' })).toBeInTheDocument();
  });

  it('lists upcoming events with edit and delete controls', () => {
    renderWithProviders(
      <EventManager
        churchId="church-1"
        churchName="Grace Community Church"
        events={[sampleEvent]}
        isLoading={false}
      />,
    );

    expect(screen.getByText('Neighborhood Prayer Night')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Edit Neighborhood Prayer Night/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Delete Neighborhood Prayer Night/i }),
    ).toBeInTheDocument();
  });

  it('opens the create form and submits a POST request', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      text: async () =>
        JSON.stringify({
          data: {
            ...sampleEvent,
            id: 'event-new',
            title: 'Easter Sunday Service',
            eventType: 'service',
          },
        }),
    } as Response);

    renderWithProviders(
      <EventManager
        churchId="church-1"
        churchName="Grace Community Church"
        events={[]}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add event' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Easter Sunday Service' },
    });
    fireEvent.change(screen.getByLabelText('Event type'), {
      target: { value: 'service' },
    });
    fireEvent.change(screen.getByLabelText('Start'), {
      target: { value: '2026-04-05T14:00' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publish event/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/churches/church-1/events');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body as string) as Record<string, unknown>;
    expect(body).toMatchObject({
      title: 'Easter Sunday Service',
      eventType: 'service',
    });
    expect(body).not.toHaveProperty('churchId');
  });

  it('opens the edit form pre-populated with existing event details', () => {
    renderWithProviders(
      <EventManager
        churchId="church-1"
        churchName="Grace Community Church"
        events={[sampleEvent]}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Edit Neighborhood Prayer Night/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Neighborhood Prayer Night');
  });

  it('asks for confirmation before deleting an event', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          data: { id: 'event-1', churchId: 'church-1', deleted: true },
        }),
    } as Response);

    renderWithProviders(
      <EventManager
        churchId="church-1"
        churchName="Grace Community Church"
        events={[sampleEvent]}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Delete Neighborhood Prayer Night/i }));

    expect(screen.getByText('Delete this event?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete event' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/events/event-1');
    expect(options.method).toBe('DELETE');
  });

  it('submits a weekly recurrence rule with the selected weekdays', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      text: async () =>
        JSON.stringify({
          data: {
            ...sampleEvent,
            id: 'event-new',
            title: 'Sunday Worship',
            eventType: 'service',
            isRecurring: true,
            recurrenceRule: 'FREQ=WEEKLY;BYDAY=SU,WE',
          },
        }),
    } as Response);

    renderWithProviders(
      <EventManager
        churchId="church-1"
        churchName="Grace Community Church"
        events={[]}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add event' }));

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Sunday Worship' },
    });
    fireEvent.change(screen.getByLabelText('Event type'), {
      target: { value: 'service' },
    });
    fireEvent.change(screen.getByLabelText('Start'), {
      target: { value: '2026-05-03T10:00' },
    });

    fireEvent.change(screen.getByLabelText('Pattern'), {
      target: { value: 'weekly' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sunday' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wednesday' }));

    fireEvent.click(screen.getByRole('button', { name: /Publish event/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string) as Record<string, unknown>;
    expect(body).toMatchObject({
      title: 'Sunday Worship',
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=SU,WE',
    });
  })

  it('shows a validation error when end time is not after start time', () => {
    renderWithProviders(
      <EventManager
        churchId="church-1"
        churchName="Grace Community Church"
        events={[]}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add event' }));

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Morning Gathering' },
    });
    fireEvent.change(screen.getByLabelText('Start'), {
      target: { value: '2026-05-01T10:00' },
    });
    fireEvent.change(screen.getByLabelText('End (optional)'), {
      target: { value: '2026-05-01T09:00' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publish event/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/end time must be after start time/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
