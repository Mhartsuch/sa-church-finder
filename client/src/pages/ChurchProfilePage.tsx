import { useState } from 'react';
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

import ReviewForm from '@/components/reviews/ReviewForm';
import { useAuthSession } from '@/hooks/useAuth';
import { useChurch, useToggleSavedChurch } from '@/hooks/useChurches';
import {
  useAddHelpfulVote,
  useChurchReviews,
  useFlagReview,
  useRemoveHelpfulVote,
} from '@/hooks/useReviews';
import { getChurchMonogram, getChurchVisualTheme } from '@/lib/church-visuals';
import { IChurchService } from '@/types/church';
import { IReview, ReviewSort } from '@/types/review';
import { formatRating, formatServiceTime, getDayName } from '@/utils/format';

const DAY_ORDER = [0, 1, 2, 3, 4, 5, 6];
const REVIEW_SORT_OPTIONS: Array<{ value: ReviewSort; label: string }> = [
  { value: 'recent', label: 'Most recent' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
  { value: 'helpful', label: 'Most helpful' },
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

export const ChurchProfilePage = () => {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const toggleSavedChurchMutation = useToggleSavedChurch();
  const addHelpfulVoteMutation = useAddHelpfulVote();
  const flagReviewMutation = useFlagReview();
  const removeHelpfulVoteMutation = useRemoveHelpfulVote();
  const { data: church, isLoading, error } = useChurch(slug ?? '');
  const [reviewSort, setReviewSort] = useState<ReviewSort>('recent');
  const [reviewPage, setReviewPage] = useState(1);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [helpfulVoteError, setHelpfulVoteError] = useState<string | null>(null);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
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
        <h2 className="mb-2 text-2xl font-bold text-[#222222]">Church Not Found</h2>
        <p className="mb-6 text-[#717171]">We couldn&apos;t find a church at this address.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#222222] px-6 py-3 font-semibold text-white transition-colors hover:bg-black"
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
  const churchTheme = getChurchVisualTheme(church);
  const churchMonogram = getChurchMonogram(church.name);

  const groupedServices = groupServicesByDay(church.services);
  const isSavePending =
    toggleSavedChurchMutation.isPending && toggleSavedChurchMutation.variables === church.id;
  const writtenReviews = churchReviews?.data ?? [];
  const currentUserReview = churchReviews?.currentUserReview ?? null;
  const writtenReviewCount = churchReviews?.meta.total ?? 0;
  const reviewTotalPages = churchReviews?.meta.totalPages ?? 1;

  const handleToggleSave = async () => {
    setSaveError(null);

    if (!user) {
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        },
      });
      return;
    }

    try {
      await toggleSavedChurchMutation.mutateAsync(church.id);
    } catch (toggleError) {
      setSaveError(
        toggleError instanceof Error
          ? toggleError.message
          : 'Unable to update saved churches right now.',
      );
    }
  };

  const handleHelpfulVote = async (review: IReview) => {
    setHelpfulVoteError(null);
    setReviewNotice(null);

    if (!user) {
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        },
      });
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

  const handleFlagReview = async (review: IReview) => {
    setHelpfulVoteError(null);
    setReviewNotice(null);

    if (!user) {
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        },
      });
      return;
    }

    if (!window.confirm('Report this review for moderator follow-up?')) {
      return;
    }

    try {
      const result = await flagReviewMutation.mutateAsync(review.id);
      setReviewNotice(
        result.status === 'already-flagged'
          ? 'That review is already waiting in the moderation queue.'
          : 'Thanks. That review is now queued for moderation and hidden from public listings while it is reviewed.',
      );
    } catch (flagError) {
      setHelpfulVoteError(
        flagError instanceof Error ? flagError.message : 'Unable to report that review right now.',
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fffdfb]">
      <div className="mx-auto max-w-[1180px] px-6 pb-4 pt-6 lg:px-0">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#222222] hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="mx-auto mb-6 max-w-[1180px] px-6 lg:px-0">
        <div className="grid h-[330px] grid-cols-4 gap-2 overflow-hidden rounded-[32px] lg:h-[420px]">
          <div
            className={`relative col-span-2 row-span-2 overflow-hidden bg-gradient-to-br ${churchTheme.surfaceClass}`}
          >
            <div className={`absolute inset-0 ${churchTheme.glowClass}`} />
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(0,0,0,0.04),rgba(0,0,0,0.3))]" />
            <div className="absolute right-5 top-5 flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/25 bg-white/12 text-lg font-semibold tracking-[0.24em] text-white backdrop-blur-sm">
              {churchMonogram}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm ${churchTheme.outlineClass}`}
              >
                {church.denomination || 'San Antonio church'}
              </span>
              <div className="mt-4 max-w-md">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                  {church.neighborhood || `${church.city}, ${church.state}`}
                </p>
                <p className="mt-1 text-[30px] font-semibold leading-[1.05]">{church.name}</p>
                {church.description ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/80">
                    {church.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <div className="relative cursor-pointer bg-gray-100">
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
          </div>
          <div className="relative cursor-pointer bg-gray-200">
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
          </div>
          <div className="relative cursor-pointer bg-gray-100">
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
          </div>
          <div className="relative cursor-pointer bg-gray-200">
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
            <div className="absolute bottom-3 right-3">
              <button className="rounded-lg border border-[#222222] bg-white px-4 py-1.5 text-xs font-semibold text-[#222222] transition-colors hover:bg-gray-50">
                Show all photos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-6 pb-16 lg:px-0">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-24">
          <div className="min-w-0 flex-1">
            <div className="border-b border-gray-200 pb-6">
              <h1 className="mb-1 text-[26px] font-bold text-[#222222]">{church.name}</h1>

              <div className="flex flex-wrap items-center gap-1.5 text-[14px]">
                {church.avgRating > 0 && (
                  <>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#222222] text-[#222222]" />
                      <span className="font-semibold">{formatRating(church.avgRating)}</span>
                    </div>
                    <span className="text-[#717171]">&middot;</span>
                    <a href="#reviews" className="font-semibold text-[#222222] underline">
                      {church.reviewCount} reviews
                    </a>
                    <span className="text-[#717171]">&middot;</span>
                  </>
                )}
                {church.isClaimed && (
                  <>
                    <span className="flex items-center gap-1 font-medium text-[#222222]">
                      <CheckCircle className="h-4 w-4" />
                      Claimed
                    </span>
                    <span className="text-[#717171]">&middot;</span>
                  </>
                )}
                {church.denomination && (
                  <>
                    <span className="font-semibold text-[#222222]">{church.denomination}</span>
                    <span className="text-[#717171]">&middot;</span>
                  </>
                )}
                <button className="font-semibold text-[#222222] underline">
                  {church.neighborhood || church.city}, {church.state}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button className="flex items-center gap-2 text-sm font-semibold text-[#222222] underline hover:text-black">
                  <Share className="h-4 w-4" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleToggleSave();
                  }}
                  disabled={isSavePending}
                  className="flex items-center gap-2 text-sm font-semibold text-[#222222] underline hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Heart
                    className={`h-4 w-4 ${church.isSaved ? 'fill-[#FF385C] text-[#FF385C]' : ''}`}
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
                <div className="mt-4 rounded-2xl border border-[#ffb4c1] bg-[#fff1f4] px-4 py-3 text-sm text-[#9f1239]">
                  {saveError}
                </div>
              ) : null}
            </div>

            {(church.description || church.pastorName || church.yearEstablished) && (
              <div className="border-b border-gray-200 py-8">
                <h2 className="mb-5 text-[22px] font-semibold text-[#222222]">About this church</h2>

                {church.description ? (
                  <p className="mb-6 text-[16px] leading-relaxed text-[#222222]">
                    {church.description}
                  </p>
                ) : null}

                <div className="flex flex-col gap-5">
                  {church.pastorName ? (
                    <div className="flex items-center gap-4">
                      <Users className="h-6 w-6 text-[#222222]" />
                      <div>
                        <p className="text-[14px] font-semibold text-[#222222]">Pastor</p>
                        <p className="text-[14px] text-[#717171]">{church.pastorName}</p>
                      </div>
                    </div>
                  ) : null}
                  {church.yearEstablished ? (
                    <div className="flex items-center gap-4">
                      <Calendar className="h-6 w-6 text-[#222222]" />
                      <div>
                        <p className="text-[14px] font-semibold text-[#222222]">Established</p>
                        <p className="text-[14px] text-[#717171]">{church.yearEstablished}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {groupedServices.length > 0 ? (
              <div className="border-b border-gray-200 py-8">
                <h2 className="mb-5 text-[22px] font-semibold text-[#222222]">Service schedule</h2>
                <div className="space-y-5">
                  {groupedServices.map(({ day, dayName, services }) => (
                    <div key={day}>
                      <h3 className="mb-2 text-[16px] font-semibold text-[#222222]">{dayName}</h3>
                      <div className="space-y-2">
                        {services.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center gap-3 text-[14px] text-[#717171]"
                          >
                            <Clock className="h-4 w-4 flex-shrink-0 text-[#717171]" />
                            <span className="font-medium text-[#222222]">
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

            {church.amenities.length > 0 || church.languages.length > 0 ? (
              <div className="border-b border-gray-200 py-8">
                <h2 className="mb-5 text-[22px] font-semibold text-[#222222]">
                  What this church offers
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {church.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-4 py-2">
                      <CheckCircle className="h-6 w-6 text-[#222222]" />
                      <span className="text-[16px] text-[#222222]">{amenity}</span>
                    </div>
                  ))}
                  {church.languages.map((language) => (
                    <div key={language} className="flex items-center gap-4 py-2">
                      <Globe className="h-6 w-6 text-[#222222]" />
                      <span className="text-[16px] text-[#222222]">{language} services</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div id="reviews" className="py-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-[22px] font-semibold text-[#222222]">Visitor reviews</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#555555]">
                    {writtenReviewCount > 0
                      ? `${writtenReviewCount} written ${writtenReviewCount === 1 ? 'review is' : 'reviews are'} currently published on SA Church Finder for this church.`
                      : church.reviewCount > 0
                        ? 'This listing already has an overall score, and written reviews on SA Church Finder will grow as members share their visits here.'
                        : 'Be the first person to leave a written review for this church.'}
                  </p>
                </div>

                <label className="w-full sm:w-[220px]">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f8f8f]">
                    Sort reviews
                  </span>
                  <select
                    value={reviewSort}
                    onChange={(event) => {
                      setReviewSort(event.target.value as ReviewSort);
                      setReviewPage(1);
                    }}
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#222222] outline-none transition-colors focus:border-[#222222]"
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
                <div className="mt-6 rounded-[28px] border border-[#ffb4c1] bg-[#fff1f4] px-5 py-4 text-sm text-[#9f1239]">
                  {helpfulVoteError}
                </div>
              ) : null}

              {reviewNotice ? (
                <div className="mt-6 rounded-[28px] border border-[#bfdbfe] bg-[#eff6ff] px-5 py-4 text-sm text-[#1d4ed8]">
                  {reviewNotice}
                </div>
              ) : null}

              {reviewsError ? (
                <div className="mt-6 rounded-[28px] border border-[#ffb4c1] bg-[#fff1f4] px-5 py-4 text-sm text-[#9f1239]">
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
                <div className="mt-6 rounded-[28px] border border-dashed border-gray-300 bg-[#fcfbf8] px-5 py-6 text-sm leading-6 text-[#555555]">
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
                              <h3 className="text-base font-semibold text-[#222222]">
                                {review.user.name}
                              </h3>
                              {isOwnReview ? (
                                <span className="rounded-full bg-[#fff1f4] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FF385C]">
                                  Your review
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#555555]">
                              <span className="inline-flex items-center gap-1 font-semibold text-[#222222]">
                                <Star className="h-4 w-4 fill-[#222222] text-[#222222]" />
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

                        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#222222]">
                          {review.body}
                        </p>

                        {subratings.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {subratings.map((item) => (
                              <span
                                key={item.label}
                                className="rounded-full bg-[#f7f7f7] px-3 py-1.5 text-xs font-medium text-[#555555]"
                              >
                                {item.label}: {item.value}/5
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8f8f8f]">
                            {formatHelpfulCount(review.helpfulCount)}
                          </p>

                          {!isOwnReview ? (
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  void handleFlagReview(review);
                                }}
                                disabled={isFlaggingReview}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#222222] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
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
                                    : 'border-gray-300 bg-white text-[#222222] hover:bg-gray-50'
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
                <div className="mt-6 flex items-center justify-between gap-4 rounded-[28px] border border-gray-200 bg-[#fcfbf8] px-5 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewPage((current) => Math.max(1, current - 1));
                    }}
                    disabled={reviewPage === 1}
                    className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#222222] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Previous
                  </button>
                  <p className="text-sm text-[#555555]">
                    Page {reviewPage} of {reviewTotalPages}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewPage((current) => Math.min(reviewTotalPages, current + 1));
                    }}
                    disabled={reviewPage >= reviewTotalPages}
                    className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#222222] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="w-full flex-shrink-0 lg:w-[370px]">
            <div className="sticky top-[120px] rounded-[32px] border border-[#e8dfd2] bg-white p-6 shadow-airbnb-subtle">
              <h3 className="mb-1 text-[22px] font-semibold text-[#222222]">
                Visit {church.name.split(' ').slice(0, 3).join(' ')}
              </h3>
              <p className="mb-6 text-[14px] text-[#717171]">
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
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#222222]" />
                  <div>
                    <p className="text-[14px] font-medium text-[#222222]">{church.address}</p>
                    <p className="text-[14px] text-[#717171]">
                      {church.city}, {church.state} {church.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 block w-full rounded-lg bg-[#FF385C] px-6 py-3.5 text-center text-[16px] font-semibold text-white transition-colors hover:bg-[#E00B41]"
              >
                Get Directions
              </a>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                {church.phone ? (
                  <a
                    href={`tel:${church.phone}`}
                    className="flex items-center gap-3 text-[14px] text-[#222222] transition-colors hover:underline"
                  >
                    <Phone className="h-5 w-5" />
                    <span>{church.phone}</span>
                  </a>
                ) : null}
                {church.email ? (
                  <a
                    href={`mailto:${church.email}`}
                    className="flex items-center gap-3 text-[14px] text-[#222222] transition-colors hover:underline"
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
                    className="flex items-center gap-3 text-[14px] text-[#222222] transition-colors hover:underline"
                  >
                    <Globe className="h-5 w-5" />
                    <span className="truncate">{church.website}</span>
                    <ExternalLink className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-[#717171]" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#e8dfd2] bg-[#f8f4ec]">
        <div className="mx-auto max-w-[1180px] px-6 py-6 lg:px-0">
          <p className="text-sm text-[#717171]">&copy; 2026 SA Church Finder</p>
        </div>
      </footer>
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
