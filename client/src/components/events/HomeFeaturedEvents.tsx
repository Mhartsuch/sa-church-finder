import { useMemo } from 'react';
import { ArrowRight, CalendarDays, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useEventsFeed } from '@/hooks/useEvents';
import { ChurchEventType, IAggregatedEvent } from '@/types/event';

const FEATURED_EVENT_LIMIT = 3;
const FEATURED_LOOKAHEAD_DAYS = 7;

const EVENT_TYPE_LABELS: Record<ChurchEventType, string> = {
  service: 'Service',
  community: 'Community',
  volunteer: 'Volunteer',
  study: 'Study',
  youth: 'Youth',
  other: 'Other',
};

const EVENT_TYPE_BADGE_COLORS: Record<ChurchEventType, string> = {
  service: 'bg-green-100 text-green-900',
  community: 'bg-blue-100 text-blue-900',
  volunteer: 'bg-amber-100 text-amber-900',
  study: 'bg-purple-100 text-purple-900',
  youth: 'bg-yellow-100 text-yellow-900',
  other: 'bg-gray-100 text-gray-900',
};

const formatStart = (iso: string): { day: number; month: string; time: string } => {
  const date = new Date(iso);
  return {
    day: date.getDate(),
    month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
    time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date),
  };
};

interface HomeFeaturedEventCardProps {
  event: IAggregatedEvent;
}

const HomeFeaturedEventCard = ({ event }: HomeFeaturedEventCardProps) => {
  const { day, month, time } = formatStart(event.startTime);

  return (
    <article className="flex overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-airbnb">
      <div
        className="flex w-[88px] flex-shrink-0 flex-col items-center justify-center px-2 py-4 text-white"
        style={{ background: 'linear-gradient(to bottom right, #E61E4D, #D70466)' }}
      >
        <div className="text-[28px] font-bold leading-none">{day}</div>
        <div className="mt-1 text-[12px] font-semibold uppercase tracking-wide">{month}</div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-foreground">
            {event.title}
          </h3>
          <span
            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${EVENT_TYPE_BADGE_COLORS[event.eventType]}`}
          >
            {EVENT_TYPE_LABELS[event.eventType]}
          </span>
        </div>

        <Link
          to={`/churches/${event.church.slug}`}
          className="mt-0.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#FF385C] hover:underline"
        >
          {event.church.name}
        </Link>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-[12.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {time}
          </span>
          {event.church.city ? <span>{event.church.city}</span> : null}
        </div>
      </div>
    </article>
  );
};

const Skeleton = () => (
  <div className="flex overflow-hidden rounded-2xl border border-border bg-card">
    <div className="h-[96px] w-[88px] flex-shrink-0 animate-pulse bg-muted" />
    <div className="flex-1 space-y-2 p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
    </div>
  </div>
);

/**
 * Homepage module that surfaces upcoming events for the next week.
 *
 * Deliberately minimal: fetches a handful of events via the public feed,
 * renders small cards that deep-link into the church profile, and hides
 * itself when no events are available (rather than showing an empty block).
 */
export const HomeFeaturedEvents = () => {
  const { from, to } = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getTime());
    end.setDate(end.getDate() + FEATURED_LOOKAHEAD_DAYS);
    return {
      from: now.toISOString(),
      to: end.toISOString(),
    };
  }, []);

  const { data, isLoading, error } = useEventsFeed({
    from,
    to,
    page: 1,
    pageSize: FEATURED_EVENT_LIMIT,
  });

  // Suppress the section on error — the homepage should never look broken
  // just because the events API is temporarily unavailable.
  if (error) return null;

  const events = data?.data ?? [];

  // Nothing upcoming and we're not loading → hide the whole section.
  if (!isLoading && events.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1760px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-[#FF385C]" />
            This week around San Antonio
          </div>
          <h2 className="mt-1 text-[22px] font-bold">Upcoming church events</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Services, community gatherings, and volunteer opportunities happening soon
          </p>
        </div>
        <Link
          to="/events"
          className="hidden items-center gap-1.5 text-[14px] font-semibold text-foreground transition-colors hover:text-muted-foreground sm:inline-flex"
        >
          View all events
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: FEATURED_EVENT_LIMIT }).map((_, index) => <Skeleton key={index} />)
          : events.map((event) => <HomeFeaturedEventCard key={event.occurrenceId} event={event} />)}
      </div>
      <div className="mt-6 text-center sm:hidden">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-foreground"
        >
          View all events
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};
