import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  ExternalLink,
  Globe,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  Share,
  Star,
  ThumbsUp,
  Users,
} from 'lucide-react';

import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import ReviewForm from '@/components/reviews/ReviewForm';
import { useAuthSession } from '@/hooks/useAuth';
import { useSubmitChurchClaim } from '@/hooks/useChurchClaims';
import { useChurch, useToggleSavedChurch } from '@/hooks/useChurches';
import { useChurchEvents } from '@/hooks/useEvents';
import {
  useAddHelpfulVote,
  useChurchReviews,
  useFlagReview,
  useRemoveHelpfulVote,
} from '@/hooks/useReviews';
import { ChurchProfileHero } from '@/components/church/ChurchProfileHero';
import { useToast } from '@/hooks/useToast';
import { IChurchService } from '@/types/church';
import { ChurchEventType, IChurchEvent } from '@/types/event';
import { IReview, ReviewSort } from '@/types/review';
import { formatRating, formatServiceTime, getDayName } from '@/utils/format';

const DAY_ORDER = [0, 1, 2, 3, 4, 5, 6];
type EventTypeFilter = ChurchEventType | 'all';
type EventDateRange = 'this-week' | 'next-30-days' | 'all-upcoming';

const REVIEW_SORT_OPTIONS: Array<{ value: ReviewSort; label: string }> = [
  { value: 'recent', label: 'Most recent' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
  { value: 'helpful', label: 'Most helpful' },
];
const EVENT_TYPE_OPTIONS: Array<{ value: EventTypeFilter; label: string }> = [
  { value: 'all', label: 'All event types' },
  { value: 'service', label: 'Services' },
  { value: 'community', label: 'Community' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'study', label: 'Study groups' },
  { value: 'youth', label: 'Youth' },
  { value: 'other', label: 'Other' },
];
const EVENT_DATE_RANGE_OPTIONS: Array<{ value: EventDateRange; label: string }> = [
  { value: 'this-week', label: 'This week' },
  { value: 'next-30-days', label: 'Next 30 days' },
  { value: 'all-upcoming', label: 'All upcoming' },
];

const groupServicesByDay = (services: IChurchService[]) => {
  const grouped = new Map<number, IChurchService[]>();
  for (const service of services) {
    const existing = grouped.get(service.dayOfWeek) || [];
    existing.push(service);
    grouped.set(service.dayOfWeek, existing);
  }

  return DAY_ORDER.filter((day) => grouped.has(day)).map((day) => ({
    day,
    dayName: getDayName(day),
    services: grouped.get(day)!,
  }));
};

const formatReviewDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

const formatClaimDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

const formatHelpfulCount = (count: number): string => {
  if (count === 0) {
    return 'No one has marked this review as helpful yet.';
  }

  if (count === 1) {
    return '1 person found this review helpful.';
  }

  return `${count} people found this review helpful.`;
};

const getReviewSubratings = (review: IReview): Array<{ label: string; value: number }> => {
  return [
    { label: 'Welcome', value: review.welcomeRating ?? 0 },
    { label: 'Worship', value: review.worshipRating ?? 0 },
    { label: 'Sermon', value: review.sermonRating ?? 0 },
    { label: 'Facilities', value: review.facilitiesRating ?? 0 },
  ].filter((item) => item.value > 0);
};

const formatEventDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

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
      return 'Community life';
  }
};

const getClaimDomainHint = (website?: string | null, email?: string | null): string | null => {
  if (email?.includes('@')) {
    return email.split('@').pop() ?? null;
  }

  if (!website) {
    return null;
  }

  try {
    const withProtocol = website.startsWith('http') ? website : `https://${website}`;
    const hostname = new URL(withProtocol).hostname.replace(/^www\./, '');
    return hostname || null;
  } catch {
    return null;
  }
};

const buildEventDateWindow = (
  baseIso: string,
  range: EventDateRange,
): { from: string; to?: string } => {
  const fromDate = new Date(baseIso);

  if (range === 'all-upcoming') {
    return {
      from: fromDate.toISOString(),
    };
  }

  const toDate = new Date(fromDate);
  toDate.setDate(toDate.getDate() + (range === 'this-week' ? 7 : 30));

  return {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  };
};

const isEventWithinNextWeek = (event: IChurchEvent): boolean => {
  const now = Date.now();
  const nextWeek = now + 7 * 24 * 60 * 60 * 1000;
  const eventStart = new Date(event.startTime).getTime();

  return eventStart >= now && eventStart <= nextWeek;
};

export const ChurchProfilePage = () => {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const submitChurchClaimMutation = useSubmitChurchClaim();
  const toggleSavedChurchMutation = useToggleSavedChurch();
  const addHelpfulVoteMutation = useAddHelpfulVote();
  const flagReviewMutation = useFlagReview();
  const removeHelpfulVoteMutation = useRemoveHelpfulVote();
  const { data: church, isLoading, error } = useChurch(slug ?? '');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('all');
  const [eventDateRange, setEventDateRange] = useState<EventDateRange>('next-30-days');
  const [eventWindowBaseIso, setEventWindowBaseIso] = useState(() => new Date().toISOString());
  const [reviewSort, setReviewSort] = useState<ReviewSort>('recent');
  const [reviewPage, setReviewPage] = useState(1);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimNotice, setClaimNotice] = useState<string | null>(null);
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [claimRoleTitle, setClaimRoleTitle] = useState('');
  const [claimVerificationEmail, setClaimVerificationEmail] = useState('');
  const { addToast } = useToast();
  const [helpfulVoteError, setHelpfulVoteError] = useState<string | null>(null);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const [flagDialogReviewId, setFlagDialogReviewId] = useState<string | null>(null);
  const eventWindow = buildEventDateWindow(eventWindowBaseIso, eventDateRange);
  const {
    data: churchEventsResponse,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useChurchEvents(slug ?? '', {
    type: eventTypeFilter === 'all' ? undefined : eventTypeFilter,
    from: eventWindow.from,
    to: eventWindow.to,
  });
  const {
    data: churchReviews,
    isLoading: isReviewsLoading,
    error: reviewsError,
  } = useChurchReviews(church?.id ?? '', user?.id ?? null, {
    sort: reviewSort,
    page: reviewPage,
    pageSize: 10,
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !church) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <h2 className="mb-2 text-2xl font-bold text-[#1a1a1a]">Church Not Found</h2>
        <p className="mb-6 text-[#6b6560]">We couldn&apos;t find a church at this address.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-6 py-3 font-semibold text-white transition-colors hover:bg-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </button>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${church.address}, ${church.city}, ${church.state} ${church.zipCode}`,
  )}`;
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    `${church.address}, ${church.city}, ${church.state} ${church.zipCode}`,
  )}&z=15&output=embed`;

  const groupedServices = groupServicesByDay(church.services);
  const isSavePending =
    toggleSavedChurchMutation.isPending && toggleSavedChurchMutation.variables === church.id;
  const writtenReviews = churchReviews?.data ?? [];
  const currentUserReview = churchReviews?.currentUserReview ?? null;
  const writtenReviewCount = churchReviews?.meta.total ?? 0;
  const reviewTotalPages = churchReviews?.meta.totalPages ?? 1;
  const churchEvents = churchEventsResponse?.data ?? [];
  const upcomingThisWeekCount = churchEvents.filter(isEventWithinNextWeek).length;
  const nextUpcomingEvent = churchEvents[0] ?? null;
  const viewerClaim = church.viewerClaim ?? null;
  const claimDomainHint = getClaimDomainHint(church.website, church.email);
  const isSubmittingClaim =
    submitChurchClaimMutation.isPending &&
    submitChurchClaimMutation.variables?.churchId === church.id;
  const canSubmitClaim =
    !church.isClaimed && viewerClaim?.status !== 'pending' && viewerClaim?.status !== 'approved';
  const showClaimCard = !church.isClaimed || Boolean(viewerClaim);

  const navigateToLogin = () => {
    navigate('/login', {
      state: {
        from: {
          pathname: location.pathname,
          search: location.search,
        },
      },
    });
  };

  const handleToggleSave = async () => {
    setSaveError(null);

    if (!user) {
      navigateToLogin();
      return;
    }

    try {
      await toggleSavedChurchMutation.mutateAsync(church.id);
      addToast({
        message: church.isSaved ? 'Removed from your wishlist' : 'Saved to your wishlist',
        variant: 'success',
      });
    } catch (toggleError) {
      addToast({
        message:
          toggleError instanceof Error
            ? toggleError.message
            : 'Unable to update saved churches right now.',
        variant: 'error',
      });
    }
  };

  const handleHelpfulVote = async (review: IReview) => {
    setHelpfulVoteError(null);
    setReviewNotice(null);

    if (!user) {
      navigateToLogin();
      return;
    }

    try {
      if (review.viewerHasVotedHelpful) {
        await removeHelpfulVoteMutation.mutateAsync(review.id);
      } else {
        await addHelpfulVoteMutation.mutateAsync(review.id);
      }
    } catch (voteError) {
      setHelpfulVoteError(
        voteError instanceof Error
          ? voteError.message
          : 'Unable to update that helpful vote right now.',
      );
    }
  };

  const handleFlagReviewRequest = (review: IReview) => {
    setHelpfulVoteError(null);
    setReviewNotice(null);

    if (!user) {
      navigateToLogin();
      return;
    }

    setFlagDialogReviewId(review.id);
  };

  const handleFlagReviewConfirmed = async () => {
    if (!flagDialogReviewId) return;

    try {
      const result = await flagReviewMutation.mutateAsync(flagDialogReviewId);
      setFlagDialogReviewId(null);
      addToast({
        message:
          result.status === 'already-flagged'
            ? 'That review is already in the moderation queue'
            : 'Review reported for moderation',
        variant: result.status === 'already-flagged' ? 'info' : 'success',
      });
    } catch (flagError) {
      setFlagDialogReviewId(null);
      addToast({
        message:
          flagError instanceof Error
            ? flagError.message
            : 'Unable to report that review right now.',
        variant: 'error',
      });
    }
  };

  const handleEventDateRangeChange = (value: EventDateRange) => {
    setEventDateRange(value);
    setEventWindowBaseIso(new Date().toISOString());
  };

  const handleOpenClaimForm = () => {
    setClaimError(null);
    setClaimNotice(null);

    if (!user) {
      navigateToLogin();
      return;
    }

    setIsClaimFormOpen(true);
    if (!claimVerificationEmail) {
      setClaimVerificationEmail(user.email);
    }
  };

  const handleSubmitChurchClaim = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClaimError(null);
    setClaimNotice(null);

    if (!user) {
      navigateToLogin();
      return;
    }

    try {
      await submitChurchClaimMutation.mutateAsync({
        churchId: church.id,
        roleTitle: claimRoleTitle,
        verificationEmail: claimVerificationEmail,
      });
      addToast({ message: 'Claim request submitted for review', variant: 'success' });
      setIsClaimFormOpen(false);
    } catch (submissionError) {
      setClaimError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to submit that church claim right now.',
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#faf8f5]">
      <div className="mx-auto max-w-[1180px] px-6 pb-4 pt-6 lg:px-0">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#1a1a1a] hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <ChurchProfileHero church={church} directionsUrl={googleMapsUrl} />

      <div className="mx-auto max-w-[1180px] px-6 pb-16 lg:px-0">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-24">
          <div className="min-w-0 flex-1">
            <div className="border-b border-gray-200 pb-6">
              <h1 className="mb-1 text-[26px] font-bold text-[#1a1a1a]">{church.name}</h1>

              <div className="flex flex-wrap items-center gap-1.5 text-[14px]">
                {church.avgRating > 0 && (
                  <>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#1a1a1a] text-[#1a1a1a]" />
                      <span className="font-semibold">{formatRating(church.avgRating)}</span>
                    </div>
                    <span className="text-[#6b6560]">&middot;</span>
                    <a href="#reviews" className="font-semibold text-[#1a1a1a] underline">
                      {church.reviewCount} reviews
                    </a>
                    <span className="text-[#6b6560]">&middot;</span>
                  </>
                )}
                {church.isClaimed && (
                  <>
                    <span className="flex items-center gap-1 font-medium text-[#1a1a1a]">
                      <CheckCircle className="h-4 w-4" />
                      Claimed
                    </span>
                    <span className="text-[#6b6560]">&middot;</span>
                  </>
                )}
                {church.denomination && (
                  <>
                    <span className="font-semibold text-[#1a1a1a]">{church.denomination}</span>
                    <span className="text-[#6b6560]">&middot;</span>
                  </>
                )}
                <button className="font-semibold text-[#1a1a1a] underline">
                  {church.neighborhood || church.city}, {church.state}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a] underline hover:text-black">
                  <Share className="h-4 w-4" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleToggleSave();
                  }}
                  disabled={isSavePending}
                  className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a] underline hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Heart
                    className={`h-4 w-4 ${church.isSaved ? 'fill-[#d90b45] text-[#d90b45]' : ''}`}
                  />
                  {isSavePending
                    ? church.isSaved
                      ? 'Updating...'
                      : 'Saving...'
                    : church.isSaved
                      ? 'Saved'
                      : 'Save'}
                </button>
              </div>

              {saveError ? (
                <div className="mt-4 rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]">
                  {saveError}
                </div>
              ) : null}
            </div>

            {(church.description || church.pastorName || church.yearEstablished) && (
              <div className="border-b border-gray-200 py-8">
                <h2 className="mb-5 text-[22px] font-semibold text-[#1a1a1a]">About this church</h2>

                {church.description ? (
                  <p className="mb-6 text-[16px] leading-relaxed text-[#1a1a1a]">
                    {church.description}
                  </p>
                ) : null}

                <div className="flex flex-col gap-5">
                  {church.pastorName ? (
                    <div className="flex items-center gap-4">
                      <Users className="h-6 w-6 text-[#1a1a1a]" />
                      <div>
                        <p className="text-[14px] font-semibold text-[#1a1a1a]">Pastor</p>
                        <p className="text-[14px] text-[#6b6560]">{church.pastorName}</p>
                      </div>
                    </div>
                  ) : null}
                  {church.yearEstablished ? (
                    <div className="flex items-center gap-4">
                      <Calendar className="h-6 w-6 text-[#1a1a1a]" />
                      <div>
                        <p className="text-[14px] font-semibold text-[#1a1a1a]">Established</p>
                        <p className="text-[14px] text-[#6b6560]">{church.yearEstablished}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {groupedServices.length > 0 ? (
              <div className="border-b border-gray-200 py-8">
                <h2 className="mb-5 text-[22px] font-semibold text-[#1a1a1a]">Service schedule</h2>
                <div className="space-y-5">
                  {groupedServices.map(({ day, dayName, services }) => (
                    <div key={day}>
                      <h3 className="mb-2 text-[16px] font-semibold text-[#1a1a1a]">{dayName}</h3>
                      <div className="space-y-2">
                        {services.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center gap-3 text-[14px] text-[#6b6560]"
                          >
                            <Clock className="h-4 w-4 flex-shrink-0 text-[#6b6560]" />
                            <span className="font-medium text-[#1a1a1a]">
                              {formatServiceTime(service.startTime)}
                              {service.endTime ? ` - ${formatServiceTime(service.endTime)}` : ''}
                            </span>
                            <span className="text-[#b0b0b0]">&middot;</span>
                            <span>{service.serviceType}</span>
                            {service.language ? (
                              <>
                                <span className="text-[#b0b0b0]">&middot;</span>
                                <span>{service.language}</span>
                              </>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="border-b border-gray-200 py-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 className="text-[22px] font-semibold text-[#1a1a1a]">Events and community</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5c5650]">
                    See what is happening beyond Sunday morning, from studies and service days to
                    community nights that help you get a feel for the church.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8f7f]">
                      Event type
                    </span>
                    <select
                      value={eventTypeFilter}
                      onChange={(event) => {
                        setEventTypeFilter(event.target.value as EventTypeFilter);
                      }}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
                    >
                      {EVENT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8f7f]">
                      Date range
                    </span>
                    <select
                      value={eventDateRange}
                      onChange={(event) => {
                        handleEventDateRangeChange(event.target.value as EventDateRange);
                      }}
                      className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
                    >
                      {EVENT_DATE_RANGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[28px] border border-[#f0e7da] bg-[#f8f2e9] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c5b2e]">
                    Upcoming this week
                  </p>
                  <p className="mt-3 text-4xl font-semibold text-[#1a1a1a]">
                    {isEventsLoading ? '...' : upcomingThisWeekCount}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#6b5a46]">
                    {isEventsLoading
                      ? 'Checking what is coming up over the next seven days.'
                      : upcomingThisWeekCount > 0
                        ? `${upcomingThisWeekCount} ${upcomingThisWeekCount === 1 ? 'event is' : 'events are'} on the calendar this week.`
                        : 'Nothing is scheduled in the next seven days yet, but more upcoming gatherings may still be listed below.'}
                  </p>
                </div>

                <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-airbnb-subtle">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8f7f]">
                    Next gathering
                  </p>
                  {isEventsLoading ? (
                    <div className="mt-4 space-y-3">
                      <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                    </div>
                  ) : nextUpcomingEvent ? (
                    <div className="mt-4">
                      <p className="text-xl font-semibold text-[#1a1a1a]">
                        {nextUpcomingEvent.title}
                      </p>
                      <p className="mt-2 text-sm text-[#5c5650]">
                        {formatEventDate(nextUpcomingEvent.startTime)} at{' '}
                        {formatEventTimeRange(
                          nextUpcomingEvent.startTime,
                          nextUpcomingEvent.endTime,
                        )}
                      </p>
                      <p className="mt-1 text-sm text-[#6b6560]">
                        {nextUpcomingEvent.locationOverride || church.address}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-[#5c5650]">
                      No upcoming events match the current filters yet.
                    </p>
                  )}
                </div>
              </div>

              {eventsError ? (
                <div className="mt-6 rounded-[28px] border border-[#ffc2cc] bg-[#fff0f3] px-5 py-4 text-sm text-[#a8083a]">
                  {eventsError.message}
                </div>
              ) : isEventsLoading ? (
                <div className="mt-6 space-y-4">
                  {[0, 1].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-[28px] border border-gray-200 bg-white p-6 shadow-airbnb-subtle"
                    >
                      <div className="h-4 w-24 rounded bg-gray-200" />
                      <div className="mt-4 h-6 w-56 rounded bg-gray-200" />
                      <div className="mt-3 h-4 w-full rounded bg-gray-200" />
                      <div className="mt-2 h-4 w-4/5 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              ) : churchEvents.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {churchEvents.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-airbnb-subtle"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#f3ede3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8c5b2e]">
                              {formatEventTypeLabel(event.eventType)}
                            </span>
                            {event.isRecurring ? (
                              <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1d4ed8]">
                                Recurring
                              </span>
                            ) : null}
                          </div>
                          <h3 className="mt-4 text-xl font-semibold text-[#1a1a1a]">
                            {event.title}
                          </h3>
                          {event.description ? (
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5c5650]">
                              {event.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="rounded-[24px] bg-[#faf8f5] px-5 py-4 text-sm text-[#5c5650] lg:min-w-[250px]">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-[#1a1a1a]" />
                            <span>{formatEventDate(event.startTime)}</span>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <Clock className="h-4 w-4 text-[#1a1a1a]" />
                            <span>{formatEventTimeRange(event.startTime, event.endTime)}</span>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-[#1a1a1a]" />
                            <span>{event.locationOverride || church.address}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-dashed border-gray-300 bg-[#faf8f5] px-6 py-8 text-sm leading-7 text-[#5c5650]">
                  No events match this filter combination yet. Try widening the date range or
                  switching back to all event types.
                </div>
              )}
            </div>

            {church.amenities.length > 0 || church.languages.length > 0 ? (
              <div className="border-b border-gray-200 py-8">
                <h2 className="mb-5 text-[22px] font-semibold text-[#1a1a1a]">
                  What this church offers
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {church.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-4 py-2">
                      <CheckCircle className="h-6 w-6 text-[#1a1a1a]" />
                      <span className="text-[16px] text-[#1a1a1a]">{amenity}</span>
                    </div>
                  ))}
                  {church.languages.map((language) => (
                    <div key={language} className="flex items-center gap-4 py-2">
                      <Globe className="h-6 w-6 text-[#1a1a1a]" />
                      <span className="text-[16px] text-[#1a1a1a]">{language} services</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div id="reviews" className="py-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-[22px] font-semibold text-[#1a1a1a]">Visitor reviews</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5c5650]">
                    {writtenReviewCount > 0
                      ? `${writtenReviewCount} written ${writtenReviewCount === 1 ? 'review is' : 'reviews are'} currently published on SA Church Finder for this church.`
                      : church.reviewCount > 0
                        ? 'This listing already has an overall score, and written reviews on SA Church Finder will grow as members share their visits here.'
                        : 'Be the first person to leave a written review for this church.'}
                  </p>
                </div>

                <label className="w-full sm:w-[220px]">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8f7f]">
                    Sort reviews
                  </span>
                  <select
                    value={reviewSort}
                    onChange={(event) => {
                      setReviewSort(event.target.value as ReviewSort);
                      setReviewPage(1);
                    }}
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
                  >
                    {REVIEW_SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-6">
                <ReviewForm
                  churchId={church.id}
                  churchName={church.name}
                  currentUserReview={currentUserReview}
                  isAuthenticated={Boolean(user)}
                />
              </div>

              {helpfulVoteError ? (
                <div className="mt-6 rounded-[28px] border border-[#ffc2cc] bg-[#fff0f3] px-5 py-4 text-sm text-[#a8083a]">
                  {helpfulVoteError}
                </div>
              ) : null}

              {reviewNotice ? (
                <div className="mt-6 rounded-[28px] border border-[#bfdbfe] bg-[#eff6ff] px-5 py-4 text-sm text-[#1d4ed8]">
                  {reviewNotice}
                </div>
              ) : null}

              {reviewsError ? (
                <div className="mt-6 rounded-[28px] border border-[#ffc2cc] bg-[#fff0f3] px-5 py-4 text-sm text-[#a8083a]">
                  {reviewsError.message}
                </div>
              ) : isReviewsLoading ? (
                <div className="mt-6 space-y-4">
                  {[0, 1].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-[28px] border border-gray-200 bg-white p-6 shadow-airbnb-subtle"
                    >
                      <div className="h-4 w-32 rounded bg-gray-200" />
                      <div className="mt-3 h-3 w-24 rounded bg-gray-200" />
                      <div className="mt-5 space-y-2">
                        <div className="h-3 w-full rounded bg-gray-200" />
                        <div className="h-3 w-5/6 rounded bg-gray-200" />
                        <div className="h-3 w-3/4 rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : writtenReviews.length === 0 ? (
                <div className="mt-6 rounded-[28px] border border-dashed border-gray-300 bg-[#faf8f5] px-5 py-6 text-sm leading-6 text-[#5c5650]">
                  No written reviews are live on SA Church Finder for this church yet.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {writtenReviews.map((review) => {
                    const subratings = getReviewSubratings(review);
                    const isOwnReview = review.userId === user?.id;
                    const wasEdited = review.updatedAt !== review.createdAt;
                    const isHelpfulVotePending =
                      (addHelpfulVoteMutation.isPending &&
                        addHelpfulVoteMutation.variables === review.id) ||
                      (removeHelpfulVoteMutation.isPending &&
                        removeHelpfulVoteMutation.variables === review.id);
                    const isFlaggingReview =
                      flagReviewMutation.isPending && flagReviewMutation.variables === review.id;

                    return (
                      <article
                        key={review.id}
                        className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-airbnb-subtle"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-[#1a1a1a]">
                                {review.user.name}
                              </h3>
                              {isOwnReview ? (
                                <span className="rounded-full bg-[#fff0f3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d90b45]">
                                  Your review
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#5c5650]">
                              <span className="inline-flex items-center gap-1 font-semibold text-[#1a1a1a]">
                                <Star className="h-4 w-4 fill-[#1a1a1a] text-[#1a1a1a]" />
                                {formatRating(review.rating)}
                              </span>
                              <span>&middot;</span>
                              <span>{formatReviewDate(review.createdAt)}</span>
                              {wasEdited ? (
                                <>
                                  <span>&middot;</span>
                                  <span>Edited</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#1a1a1a]">
                          {review.body}
                        </p>

                        {subratings.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {subratings.map((item) => (
                              <span
                                key={item.label}
                                className="rounded-full bg-[#f5f2ed] px-3 py-1.5 text-xs font-medium text-[#5c5650]"
                              >
                                {item.label}: {item.value}/5
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9a8f7f]">
                            {formatHelpfulCount(review.helpfulCount)}
                          </p>

                          {!isOwnReview ? (
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleFlagReviewRequest(review);
                                }}
                                disabled={isFlaggingReview}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                <ShieldAlert className="h-4 w-4" />
                                {isFlaggingReview ? 'Reporting...' : 'Report'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  void handleHelpfulVote(review);
                                }}
                                disabled={isHelpfulVotePending}
                                aria-pressed={review.viewerHasVotedHelpful}
                                className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                                  review.viewerHasVotedHelpful
                                    ? 'border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8] hover:bg-[#dbeafe]'
                                    : 'border-gray-300 bg-white text-[#1a1a1a] hover:bg-gray-50'
                                }`}
                              >
                                <ThumbsUp
                                  className={`h-4 w-4 ${review.viewerHasVotedHelpful ? 'fill-current' : ''}`}
                                />
                                {isHelpfulVotePending
                                  ? 'Updating...'
                                  : review.viewerHasVotedHelpful
                                    ? 'Marked helpful'
                                    : 'Helpful'}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {reviewTotalPages > 1 ? (
                <div className="mt-6 flex items-center justify-between gap-4 rounded-[28px] border border-gray-200 bg-[#faf8f5] px-5 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewPage((current) => Math.max(1, current - 1));
                    }}
                    disabled={reviewPage === 1}
                    className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Previous
                  </button>
                  <p className="text-sm text-[#5c5650]">
                    Page {reviewPage} of {reviewTotalPages}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewPage((current) => Math.min(reviewTotalPages, current + 1));
                    }}
                    disabled={reviewPage >= reviewTotalPages}
                    className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="w-full flex-shrink-0 lg:w-[370px]">
            <div className="sticky top-[120px] rounded-[32px] border border-[#e8dfd2] bg-white p-6 shadow-airbnb-subtle">
              <h3 className="mb-1 text-[22px] font-semibold text-[#1a1a1a]">
                Visit {church.name.split(' ').slice(0, 3).join(' ')}
              </h3>
              <p className="mb-6 text-[14px] text-[#6b6560]">
                Get directions or contact the church
              </p>

              <div className="mb-6">
                <div className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  <iframe
                    title={`Map of ${church.name}`}
                    src={googleMapsEmbedUrl}
                    className="h-40 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1a1a1a]" />
                  <div>
                    <p className="text-[14px] font-medium text-[#1a1a1a]">{church.address}</p>
                    <p className="text-[14px] text-[#6b6560]">
                      {church.city}, {church.state} {church.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 block w-full rounded-lg bg-[#d90b45] px-6 py-3.5 text-center text-[16px] font-semibold text-white transition-colors hover:bg-[#b00838]"
              >
                Get Directions
              </a>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                {church.phone ? (
                  <a
                    href={`tel:${church.phone}`}
                    className="flex items-center gap-3 text-[14px] text-[#1a1a1a] transition-colors hover:underline"
                  >
                    <Phone className="h-5 w-5" />
                    <span>{church.phone}</span>
                  </a>
                ) : null}
                {church.email ? (
                  <a
                    href={`mailto:${church.email}`}
                    className="flex items-center gap-3 text-[14px] text-[#1a1a1a] transition-colors hover:underline"
                  >
                    <Mail className="h-5 w-5" />
                    <span>{church.email}</span>
                  </a>
                ) : null}
                {church.website ? (
                  <a
                    href={
                      church.website.startsWith('http')
                        ? church.website
                        : `https://${church.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[14px] text-[#1a1a1a] transition-colors hover:underline"
                  >
                    <Globe className="h-5 w-5" />
                    <span className="truncate">{church.website}</span>
                    <ExternalLink className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-[#6b6560]" />
                  </a>
                ) : null}
              </div>

              {showClaimCard ? (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="rounded-[28px] border border-[#e8dfd2] bg-[#faf8f5] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#1f4d45] shadow-airbnb-subtle">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-[#1a1a1a]">
                          {viewerClaim?.status === 'approved'
                            ? 'You manage this listing'
                            : viewerClaim?.status === 'pending'
                              ? 'Claim request pending'
                              : 'Represent this church?'}
                        </h4>
                        <p className="mt-1 text-sm leading-6 text-[#5c5650]">
                          {viewerClaim?.status === 'approved'
                            ? 'Your church claim was approved. Listing editing and event-management tools are the next Milestone 3 slice.'
                            : viewerClaim?.status === 'pending'
                              ? 'A site admin still needs to review your request before this listing becomes church-managed.'
                              : 'Church representatives can request access to manage listing details and upcoming events.'}
                        </p>
                      </div>
                    </div>

                    {claimNotice ? (
                      <div className="mt-4 rounded-2xl border border-[#bfdbfe] bg-white px-4 py-3 text-sm text-[#1d4ed8]">
                        {claimNotice}
                      </div>
                    ) : null}

                    {claimError ? (
                      <div className="mt-4 rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]">
                        {claimError}
                      </div>
                    ) : null}

                    {viewerClaim ? (
                      <div className="mt-4 rounded-2xl border border-[#e7ded1] bg-white px-4 py-4 text-sm text-[#5c5650]">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a8f7f]">
                          {viewerClaim.status === 'approved'
                            ? 'Approved'
                            : viewerClaim.status === 'pending'
                              ? 'Pending review'
                              : 'Not approved'}
                        </p>
                        <p className="mt-2 leading-6">
                          Requested as{' '}
                          <span className="font-semibold text-[#1a1a1a]">
                            {viewerClaim.roleTitle}
                          </span>{' '}
                          with{' '}
                          <span className="font-semibold text-[#1a1a1a]">
                            {viewerClaim.verificationEmail}
                          </span>
                          .
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#9a8f7f]">
                          Submitted {formatClaimDate(viewerClaim.createdAt)}
                          {viewerClaim.reviewedAt
                            ? ` · Reviewed ${formatClaimDate(viewerClaim.reviewedAt)}`
                            : ''}
                        </p>
                      </div>
                    ) : null}

                    {canSubmitClaim ? (
                      isClaimFormOpen ? (
                        <form className="mt-4 space-y-3" onSubmit={handleSubmitChurchClaim}>
                          <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a8f7f]">
                              Your role
                            </span>
                            <input
                              value={claimRoleTitle}
                              onChange={(event) => {
                                setClaimRoleTitle(event.target.value);
                              }}
                              placeholder="Executive Pastor"
                              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
                            />
                          </label>

                          <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a8f7f]">
                              Church email
                            </span>
                            <input
                              type="email"
                              value={claimVerificationEmail}
                              onChange={(event) => {
                                setClaimVerificationEmail(event.target.value);
                              }}
                              placeholder={
                                claimDomainHint ? `you@${claimDomainHint}` : 'you@church.org'
                              }
                              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
                            />
                          </label>

                          <p className="text-xs leading-5 text-[#6b6560]">
                            Use a staff or ministry address that matches the church&apos;s public
                            website or contact email
                            {claimDomainHint ? `, like ${claimDomainHint}` : ''}.
                          </p>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="submit"
                              disabled={isSubmittingClaim}
                              className="rounded-full bg-[#1a1a1a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {isSubmittingClaim ? 'Submitting...' : 'Submit claim request'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsClaimFormOpen(false);
                              }}
                              className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={handleOpenClaimForm}
                            className="rounded-full bg-[#1a1a1a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                          >
                            {viewerClaim?.status === 'rejected'
                              ? 'Submit a new claim request'
                              : 'Claim this church'}
                          </button>
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#e8dfd2] bg-[#f8f4ec]">
        <div className="mx-auto max-w-[1180px] px-6 py-6 lg:px-0">
          <p className="text-sm text-[#6b6560]">&copy; 2026 SA Church Finder</p>
        </div>
      </footer>

      <ConfirmDialog
        open={flagDialogReviewId !== null}
        title="Report this review?"
        description="This review will be queued for moderator follow-up and hidden from public listings while it is being reviewed."
        confirmLabel="Report review"
        variant="destructive"
        isPending={flagReviewMutation.isPending}
        onConfirm={() => {
          void handleFlagReviewConfirmed();
        }}
        onCancel={() => setFlagDialogReviewId(null)}
      />
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="flex-1 animate-pulse overflow-y-auto bg-white">
    <div className="mx-auto max-w-[1120px] px-6 pb-4 pt-6 lg:px-0">
      <div className="h-4 w-16 rounded bg-gray-200" />
    </div>

    <div className="mx-auto mb-6 max-w-[1120px] px-6 lg:px-0">
      <div className="grid h-[400px] grid-cols-4 gap-2 overflow-hidden rounded-xl">
        <div className="col-span-2 row-span-2 bg-gray-200" />
        <div className="bg-gray-100" />
        <div className="bg-gray-200" />
        <div className="bg-gray-100" />
        <div className="bg-gray-200" />
      </div>
    </div>

    <div className="mx-auto max-w-[1120px] px-6 pb-16 lg:px-0">
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-24">
        <div className="flex-1">
          <div className="mb-3 h-8 w-2/3 rounded bg-gray-200" />
          <div className="mb-8 h-4 w-1/2 rounded bg-gray-200" />
          <div className="space-y-3 border-t border-gray-200 pt-8">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-4/6 rounded bg-gray-200" />
          </div>
        </div>
        <div className="w-full lg:w-[370px]">
          <div className="h-[400px] rounded-xl border border-gray-200 bg-gray-50 p-6" />
        </div>
      </div>
    </div>
  </div>
);
