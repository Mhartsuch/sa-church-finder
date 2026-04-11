import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/hooks/useToast';

import LeadersPortalPage from './LeadersPortalPage';

const useAuthSessionMock = vi.fn();
const useLeaderPortalMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: () => useAuthSessionMock(),
}));

vi.mock('@/hooks/useLeaderPortal', () => ({
  useLeaderPortal: (userId: string | null) => useLeaderPortalMock(userId),
}));

const renderLeadersPortal = (): ReturnType<typeof render> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );

  return render(<LeadersPortalPage />, { wrapper });
};

describe('LeadersPortalPage', () => {
  it('renders managed churches with listing readiness and calendar context', () => {
    useAuthSessionMock.mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Jordan Lee',
        role: 'church_admin',
      },
    });
    useLeaderPortalMock.mockReturnValue({
      claimsQuery: {
        isLoading: false,
        error: null,
      },
      eventWindow: {
        from: '2026-04-08T00:00:00.000Z',
        to: '2026-05-08T00:00:00.000Z',
      },
      pendingClaims: [],
      rejectedClaims: [],
      isManagedChurchesLoading: false,
      managedChurches: [
        {
          claim: {
            id: 'claim-1',
            status: 'approved',
            createdAt: '2026-03-31T00:00:00.000Z',
            reviewedAt: '2026-04-02T00:00:00.000Z',
            church: {
              name: 'Grace Community Church',
            },
          },
          church: {
            id: 'church-1',
            slug: 'grace-community-church',
            name: 'Grace Community Church',
            neighborhood: 'Alamo Heights',
            city: 'San Antonio',
            state: 'TX',
            denomination: 'Non-denominational',
            description: 'A welcoming church home.',
            email: 'hello@grace.org',
            phone: '210-555-0101',
            website: 'grace.org',
            photos: [{ id: 'photo-1' }],
            services: [{ id: 'service-1' }],
          },
          upcomingEvents: [
            {
              id: 'event-1',
              occurrenceId: 'event-1',
              churchId: 'church-1',
              title: 'Neighborhood Prayer Night',
              eventType: 'community',
              startTime: '2026-04-10T18:30:00.000Z',
              endTime: '2026-04-10T20:00:00.000Z',
              seriesStartTime: '2026-04-10T18:30:00.000Z',
              description: 'Prayer and dinner with the neighborhood.',
              locationOverride: null,
              isRecurring: false,
              recurrenceRule: null,
              isOccurrence: false,
              createdById: 'user-1',
              createdAt: '2026-04-01T00:00:00.000Z',
              updatedAt: '2026-04-01T00:00:00.000Z',
            },
          ],
          isChurchLoading: false,
          isEventsLoading: false,
          churchError: null,
          eventsError: null,
        },
      ],
    });

    renderLeadersPortal();

    expect(screen.getByText('Church leaders portal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Grace Community Church' })).toBeInTheDocument();
    expect(screen.getByText('Listing readiness')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Upcoming events' })).toBeInTheDocument();
    expect(screen.getByText('Neighborhood Prayer Night')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add event' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Edit Neighborhood Prayer Night/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review public listing' })).toHaveAttribute(
      'href',
      '/churches/grace-community-church',
    );
  });

  it('shows claim tracking guidance before any church access is approved', () => {
    useAuthSessionMock.mockReturnValue({
      user: {
        id: 'user-2',
        name: 'Morgan Hall',
        role: 'user',
      },
    });
    useLeaderPortalMock.mockReturnValue({
      claimsQuery: {
        isLoading: false,
        error: null,
      },
      eventWindow: {
        from: '2026-04-08T00:00:00.000Z',
        to: '2026-05-08T00:00:00.000Z',
      },
      pendingClaims: [
        {
          id: 'claim-2',
          status: 'pending',
          createdAt: '2026-04-05T00:00:00.000Z',
          reviewedAt: null,
          roleTitle: 'Executive Pastor',
          verificationEmail: 'pastor@hope.org',
          church: {
            name: 'Hope Fellowship',
          },
        },
      ],
      rejectedClaims: [],
      isManagedChurchesLoading: false,
      managedChurches: [],
    });

    renderLeadersPortal();

    expect(screen.getByText('No approved church access yet')).toBeInTheDocument();
    expect(screen.getByText('Hope Fellowship')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find your church' })).toHaveAttribute(
      'href',
      '/search',
    );
  });
});
