import {
  ArrowRight,
  Building2,
  CalendarRange,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthSession } from '@/hooks/useAuth';
import { IManagedChurchPortal, useLeaderPortal } from '@/hooks/useLeaderPortal';
import { IChurchClaim } from '@/types/church-claim';
import { ChurchEventType } from '@/types/event';

const formatShortDate = (date: string): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

const formatEventDate = (date: string): string =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));

const formatEventTimeRange = (startTime: string, endTime?: string | null): string => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const startLabel = formatter.format(new Date(startTime));
  if (!endTime) {
    return startLabel;
  }

  return `${startLabel} - ${formatter.format(new Date(endTime))}`;
};

const formatEventTypeLabel = (eventType: ChurchEventType): string => {
  switch (eventType) {
    case 'service':
      return 'Service';
    case 'community':
      return 'Community';
    case 'volunteer':
      return 'Volunteer';
    case 'study':
      return 'Study';
    case 'youth':
      return 'Youth';
    default:
      return 'Other';
  }
};

const getListingChecks = (
  portalChurch: IManagedChurchPortal,
): Array<{ label: string; complete: boolean }> => {
  const church = portalChurch.church;

  return [
    {
      label: 'Description published',
      complete: Boolean(church?.description?.trim()),
    },
    {
      label: 'Contact info visible',
      complete: Boolean(church?.email || church?.phone || church?.website),
    },
    {
      label: 'Service times listed',
      complete: (church?.services.length ?? 0) > 0,
    },
    {
      label: 'Photos added',
      complete: (church?.photos?.length ?? 0) > 0,
    },
    {
      label: 'Upcoming event scheduled',
      complete: portalChurch.upcomingEvents.length > 0,
    },
  ];
};

const getClaimStatusCopy = (claim: IChurchClaim): string => {
  switch (claim.status) {
    case 'approved':
      return `Approved ${claim.reviewedAt ? formatShortDate(claim.reviewedAt) : formatShortDate(claim.createdAt)}`;
    case 'rejected':
      return `Not approved ${claim.reviewedAt ? formatShortDate(claim.reviewedAt) : formatShortDate(claim.createdAt)}`;
    case 'pending':
    default:
      return `Submitted ${formatShortDate(claim.createdAt)}`;
  }
};

const getChurchProgress = (portalChurch: IManagedChurchPortal) => {
  const checks = getListingChecks(portalChurch);
  const completed = checks.filter((check) => check.complete).length;

  return {
    checks,
    completed,
    percent: Math.round((completed / checks.length) * 100),
  };
};

const LoadingState = () => (
  <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
    <section className="animate-pulse rounded-[32px] border border-border bg-card p-6 shadow-airbnb-subtle sm:p-8">
      <div className="h-4 w-40 rounded bg-muted" />
      <div className="mt-4 h-10 w-3/4 rounded bg-muted" />
      <div className="mt-4 h-5 w-full rounded bg-muted" />
      <div className="mt-2 h-5 w-5/6 rounded bg-muted" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 rounded-[28px] bg-muted" />
        ))}
      </div>
      <div className="mt-8 h-72 rounded-[28px] bg-muted" />
    </section>
    <aside className="animate-pulse rounded-[32px] bg-[#1f4d45] p-6 sm:p-8">
      <div className="h-12 w-12 rounded-2xl bg-white/10" />
      <div className="mt-6 h-8 w-2/3 rounded bg-white/10" />
      <div className="mt-3 h-4 w-full rounded bg-white/10" />
      <div className="mt-2 h-4 w-5/6 rounded bg-white/10" />
      <div className="mt-6 h-52 rounded-[28px] bg-white/10" />
    </aside>
  </div>
);

const LeadersPortalPage = () => {
  const { user } = useAuthSession();
  const {
    claimsQuery,
    eventWindow,
    managedChurches,
    pendingClaims,
    rejectedClaims,
    isManagedChurchesLoading,
  } = useLeaderPortal(user?.id ?? null);

  if (!user) {
    return null;
  }

  const upcomingEventsTotal = managedChurches.reduce(
    (total, portalChurch) => total + portalChurch.upcomingEvents.length,
    0,
  );
  const healthyListingsCount = managedChurches.reduce((total, portalChurch) => {
    const progress = getChurchProgress(portalChurch);
    return total + (progress.completed >= 4 ? 1 : 0);
  }, 0);
  const followUpCount = managedChurches.reduce((total, portalChurch) => {
    const progress = getChurchProgress(portalChurch);
    return total + (progress.checks.length - progress.completed);
  }, 0);
  const nextEvent =
    managedChurches
      .flatMap((portalChurch) =>
        portalChurch.upcomingEvents.map((event) => ({
          event,
          churchName: portalChurch.church?.name ?? portalChurch.claim.church.name,
        })),
      )
      .sort((left, right) => left.event.startTime.localeCompare(right.event.startTime))[0] ?? null;

  const introCopy =
    managedChurches.length > 0
      ? 'Review what guests see today, spot listing gaps quickly, and keep your next 30 days of ministry on the calendar in one place.'
      : pendingClaims.length > 0
        ? 'Your claim requests are in motion. While you wait, this portal shows where each request stands and what details you will want ready once access is approved.'
        : 'This is where church representatives will manage public listing quality and event readiness after a claim is approved.';

  if (claimsQuery.isLoading) {
    return (
      <div className="flex flex-1 bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">
            Church leaders portal
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {managedChurches.length > 0
              ? 'Lead with a clearer public presence.'
              : 'Prepare your church access.'}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">{introCopy}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
          <section className="rounded-[32px] border border-border bg-card p-6 shadow-airbnb-subtle sm:p-8">
            {claimsQuery.error ? (
              <div className="rounded-[28px] border border-[#ffc2cc] bg-[#fff0f3] p-5 text-sm text-[#a8083a]">
                {claimsQuery.error.message}
              </div>
            ) : null}

            {managedChurches.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[28px] bg-[#fff5f0] p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-[#FF385C] shadow-airbnb-subtle">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Churches managed
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {managedChurches.length}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Approved church listings connected to this account.
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-[#f5faf7] p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-[#1f4d45] shadow-airbnb-subtle">
                      <CalendarRange className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Upcoming events
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{upcomingEventsTotal}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Scheduled between {formatShortDate(eventWindow.from)} and{' '}
                      {formatShortDate(eventWindow.to)}.
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-[#f5f9ff] p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-[#2563eb] shadow-airbnb-subtle">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Open follow-ups
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{followUpCount}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Small listing gaps still worth tightening before the next visitor lands.
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {managedChurches.map((portalChurch) => {
                    const church = portalChurch.church;
                    const progress = getChurchProgress(portalChurch);

                    if (!church) {
                      return (
                        <div
                          key={portalChurch.claim.id}
                          className="rounded-[28px] border border-[#ffc2cc] bg-[#fff8f8] p-5"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-[#a8083a] shadow-airbnb-subtle">
                              <CircleAlert className="h-5 w-5" />
                            </div>
                            <div>
                              <h2 className="text-lg font-semibold text-foreground">
                                {portalChurch.claim.church.name}
                              </h2>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                We confirmed your claim, but the public listing data could not be
                                loaded right now.
                              </p>
                              {portalChurch.churchError ? (
                                <p className="mt-3 text-sm text-[#a8083a]">
                                  {portalChurch.churchError.message}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <article
                        key={portalChurch.claim.id}
                        className="rounded-[28px] border border-border bg-background p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                {church.name}
                              </h2>
                              <span className="rounded-full bg-[#effaf3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#166534]">
                                Claimed
                              </span>
                              <span className="rounded-full bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                {progress.percent}% ready
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {church.neighborhood || church.city}, {church.state}
                              </span>
                              {church.denomination ? <span>{church.denomination}</span> : null}
                              <span>{getClaimStatusCopy(portalChurch.claim)}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/churches/${church.slug}`}
                              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                            >
                              Review public listing
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                              to="/account"
                              className="inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-4 py-2 text-sm font-semibold text-[#1d4ed8] transition-colors hover:bg-[#dbeafe]"
                            >
                              Open member dashboard
                            </Link>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
                          <div className="rounded-[24px] border border-border bg-card p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h3 className="text-base font-semibold text-foreground">
                                  Listing readiness
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {progress.completed} of {progress.checks.length} essentials are in
                                  place.
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                {progress.percent}%
                              </span>
                            </div>

                            <div className="mt-4 h-2 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-[#1f4d45]"
                                style={{ width: `${progress.percent}%` }}
                              />
                            </div>

                            <div className="mt-4 space-y-2">
                              {progress.checks.map((check) => (
                                <div key={check.label} className="flex items-center gap-3 text-sm">
                                  <CheckCircle2
                                    className={`h-4 w-4 ${
                                      check.complete ? 'text-[#166534]' : 'text-muted-foreground'
                                    }`}
                                  />
                                  <span
                                    className={
                                      check.complete ? 'text-foreground' : 'text-muted-foreground'
                                    }
                                  >
                                    {check.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-border bg-card p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h3 className="text-base font-semibold text-foreground">
                                  Calendar snapshot
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Next 30 days of public-facing events.
                                </p>
                              </div>
                              <span className="rounded-full bg-[#fff5f0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#FF385C]">
                                {portalChurch.upcomingEvents.length} planned
                              </span>
                            </div>

                            {portalChurch.isEventsLoading || isManagedChurchesLoading ? (
                              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                Loading upcoming events...
                              </p>
                            ) : portalChurch.eventsError ? (
                              <p className="mt-4 text-sm leading-6 text-[#a8083a]">
                                {portalChurch.eventsError.message}
                              </p>
                            ) : portalChurch.upcomingEvents.length === 0 ? (
                              <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-background p-4">
                                <p className="text-sm leading-6 text-muted-foreground">
                                  No public events are scheduled yet in the next 30 days. Once event
                                  publishing tools land, this is where gaps will be easiest to spot.
                                </p>
                              </div>
                            ) : (
                              <div className="mt-4 space-y-3">
                                {portalChurch.upcomingEvents.slice(0, 3).map((event) => (
                                  <div
                                    key={event.id}
                                    className="rounded-2xl border border-border bg-background p-4"
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-semibold text-foreground">
                                        {event.title}
                                      </p>
                                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                        {formatEventTypeLabel(event.eventType)}
                                      </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                      <span className="inline-flex items-center gap-1">
                                        <CalendarRange className="h-4 w-4" />
                                        {formatEventDate(event.startTime)}
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <Clock3 className="h-4 w-4" />
                                        {formatEventTimeRange(event.startTime, event.endTime)}
                                      </span>
                                    </div>
                                    {event.description ? (
                                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        {event.description}
                                      </p>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {church.phone ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-4 w-4" />
                              {church.phone}
                            </span>
                          ) : null}
                          {church.email ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Mail className="h-4 w-4" />
                              {church.email}
                            </span>
                          ) : null}
                          {church.website ? (
                            <a
                              href={
                                church.website.startsWith('http')
                                  ? church.website
                                  : `https://${church.website}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 font-medium text-[#1d4ed8] hover:underline"
                            >
                              <Globe className="h-4 w-4" />
                              {church.website}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="rounded-[28px] border border-dashed border-gray-300 bg-background p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-[#1f4d45] shadow-airbnb-subtle">
                  <Building2 className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  No approved church access yet
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Claim a church from its profile page with a staff or ministry email that matches
                  the church&apos;s public website. Once a claim is approved, this portal becomes
                  your quick audit surface for listing quality and upcoming events.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/search"
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
                  >
                    Find your church
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/account"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Open account dashboard
                  </Link>
                </div>

                {pendingClaims.length > 0 || rejectedClaims.length > 0 ? (
                  <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    {[...pendingClaims, ...rejectedClaims].map((claim) => (
                      <div key={claim.id} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {claim.church.name}
                          </p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                              claim.status === 'pending'
                                ? 'bg-[#eff6ff] text-[#1d4ed8]'
                                : 'bg-[#fff0f3] text-[#a8083a]'
                            }`}
                          >
                            {claim.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {claim.roleTitle} using {claim.verificationEmail}
                        </p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {getClaimStatusCopy(claim)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <aside className="rounded-[32px] bg-[#1f4d45] p-6 text-white shadow-airbnb sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles className="h-6 w-6" />
            </div>

            <h2 className="mt-6 text-2xl font-bold tracking-tight">Leader rhythm</h2>
            <p className="mt-3 text-sm leading-7 text-white/85">
              This first portal slice is focused on visibility: what visitors see, which claim
              requests are moving, and where your next public-facing update is likely to matter
              most.
            </p>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                At a glance
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-white/90">
                <p>{healthyListingsCount} managed listings already look guest-ready.</p>
                <p>{followUpCount} small follow-ups are still visible from this account.</p>
                <p>
                  {nextEvent
                    ? `The nearest upcoming event is ${nextEvent.event.title} at ${nextEvent.churchName} on ${formatEventDate(nextEvent.event.startTime)}.`
                    : 'No upcoming event is scheduled yet across your managed churches.'}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                What comes next
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-white/90">
                <p>Listing-edit and event-publishing controls are still the next backend slice.</p>
                <p>
                  Until then, use this page to audit gaps before a visitor or site admin spots them
                  first.
                </p>
                <p>Claim approvals and moderation tools still live on your member dashboard.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/account"
                className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-[#1f4d45] transition-colors hover:bg-[#f4f4f4]"
              >
                Open account dashboard
              </Link>
              <Link
                to="/search"
                className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse public listings
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LeadersPortalPage;
