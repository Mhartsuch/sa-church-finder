import { useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Compass,
  Heart,
  Mail,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { useAuthSession, useLogout, useRequestEmailVerification } from '@/hooks/useAuth';
import {
  useAdminChurchClaims,
  useResolveChurchClaim,
  useUserChurchClaims,
} from '@/hooks/useChurchClaims';
import { useSavedChurches, useToggleSavedChurch } from '@/hooks/useChurches';
import {
  useDeleteReview,
  useFlaggedReviews,
  useResolveFlaggedReview,
  useUserReviews,
} from '@/hooks/useReviews';
import { ChurchClaimStatus } from '@/types/church-claim';
import { useToast } from '@/hooks/useToast';
import { formatRating } from '@/utils/format';

const formatMemberSince = (createdAt: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(createdAt));
};

const formatSavedDate = (savedAt: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(savedAt));
};

const formatReviewDate = (reviewDate: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(reviewDate));
};

const formatFlaggedDate = (reviewDate: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(reviewDate));
};

const formatClaimDate = (reviewDate: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(reviewDate));
};

const formatRoleLabel = (role: string): string => {
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatClaimStatusLabel = (status: ChurchClaimStatus): string => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'pending':
    default:
      return 'Pending';
  }
};

const getClaimStatusClasses = (status: ChurchClaimStatus): string => {
  switch (status) {
    case 'approved':
      return 'bg-[#effaf3] text-[#166534]';
    case 'rejected':
      return 'bg-[#fff0f3] text-[#a8083a]';
    case 'pending':
    default:
      return 'bg-[#eff6ff] text-[#1d4ed8]';
  }
};

const AccountPage = () => {
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const requestEmailVerificationMutation = useRequestEmailVerification();
  const { user } = useAuthSession();
  const {
    data: savedChurches = [],
    isLoading: isSavedChurchesLoading,
    error: savedChurchesError,
  } = useSavedChurches(user?.id ?? null);
  const {
    data: userReviews = [],
    isLoading: isUserReviewsLoading,
    error: userReviewsError,
  } = useUserReviews(user?.id ?? null);
  const {
    data: churchClaims,
    isLoading: isChurchClaimsLoading,
    error: churchClaimsError,
  } = useUserChurchClaims(user?.id ?? null);
  const {
    data: adminChurchClaims,
    isLoading: isAdminChurchClaimsLoading,
    error: adminChurchClaimsError,
  } = useAdminChurchClaims(user?.role === 'site_admin');
  const {
    data: flaggedReviews,
    isLoading: isFlaggedReviewsLoading,
    error: flaggedReviewsError,
  } = useFlaggedReviews(user?.role === 'site_admin');
  const toggleSavedChurchMutation = useToggleSavedChurch();
  const deleteReviewMutation = useDeleteReview();
  const resolveChurchClaimMutation = useResolveChurchClaim();
  const resolveFlaggedReviewMutation = useResolveFlaggedReview();
  const { addToast } = useToast();
  const [actionError, setActionError] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<{
    message: string;
    previewUrl?: string;
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  if (!user) {
    return null;
  }

  const savedChurchCount = savedChurches.length;
  const writtenReviewCount = userReviews.length;
  const claimCount = churchClaims?.meta.total ?? 0;
  const hasLeaderPortalEntry = user.role === 'church_admin' || claimCount > 0;
  const roleLabel = formatRoleLabel(user.role);
  const isAccountActivityLoading = isSavedChurchesLoading || isUserReviewsLoading;
  const dashboardSummary = isAccountActivityLoading
    ? 'Pulling together your shortlist and visit notes now.'
    : savedChurchCount === 0 && writtenReviewCount === 0
      ? 'Start by saving a few churches that feel promising, then come back here to compare them after a visit.'
      : savedChurchCount > 0 && writtenReviewCount === 0
        ? `You already have ${savedChurchCount} saved ${
            savedChurchCount === 1 ? 'church' : 'churches'
          }. After you visit one, leave a quick review so this page becomes a useful record.`
        : `You have ${savedChurchCount} saved ${
            savedChurchCount === 1 ? 'church' : 'churches'
          } and ${writtenReviewCount} written ${
            writtenReviewCount === 1 ? 'review' : 'reviews'
          } helping you keep track of what stands out.`;
  const nextSteps: string[] = [];

  if (isAccountActivityLoading) {
    nextSteps.push(
      'Your saved churches and review history will show up here as soon as they finish loading.',
    );
  }

  if (!isAccountActivityLoading && savedChurchCount === 0) {
    nextSteps.push('Save a few churches so you can compare them later.');
  }

  if (!isAccountActivityLoading && writtenReviewCount === 0) {
    nextSteps.push('Leave your first review after a visit so future-you remembers the feel.');
  }

  if (!isChurchClaimsLoading && claimCount === 0 && user.role !== 'church_admin') {
    nextSteps.push(
      'If you represent a church, open its profile and send a claim request with a church-domain email.',
    );
  }

  if (user.role === 'church_admin') {
    nextSteps.push(
      'Open the leaders portal to review your claimed church listings and upcoming event visibility.',
    );
  }

  if (!user.emailVerified) {
    nextSteps.push(
      'Verify your email so password recovery and future account notices stay simple.',
    );
  }

  if (nextSteps.length === 0) {
    nextSteps.push(
      'Keep exploring and add another church to your shortlist when one feels promising.',
    );
  }

  const firstName = user.name.split(' ')[0] || user.name;
  const initials =
    user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';

  const handleLogout = async () => {
    setActionError(null);

    try {
      await logoutMutation.mutateAsync();
      navigate('/', { replace: true });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to sign out right now.');
    }
  };

  const handleToggleSavedChurch = async (churchId: string) => {
    setActionError(null);

    try {
      await toggleSavedChurchMutation.mutateAsync(churchId);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to update saved churches right now.',
      );
    }
  };

  const handleDeleteReview = (reviewId: string, churchName: string) => {
    setConfirmDialog({
      title: 'Delete review?',
      description: `Your review for ${churchName} will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete review',
      onConfirm: async () => {
        setActionError(null);
        try {
          await deleteReviewMutation.mutateAsync(reviewId);
          setConfirmDialog(null);
          addToast({ message: 'Review deleted', variant: 'success' });
        } catch (error) {
          setConfirmDialog(null);
          setActionError(
            error instanceof Error ? error.message : 'Unable to delete your review right now.',
          );
        }
      },
    });
  };

  const handleRequestEmailVerification = async () => {
    setActionError(null);
    setVerificationNotice(null);

    try {
      const result = await requestEmailVerificationMutation.mutateAsync();

      setVerificationNotice({
        message:
          result.status === 'already-verified'
            ? 'Your email address is already verified.'
            : 'Verification instructions are ready for your inbox.',
        previewUrl: result.previewUrl,
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to send a verification link right now.',
      );
    }
  };

  const handleResolveFlaggedReview = (
    reviewId: string,
    status: 'approved' | 'removed',
    churchName: string,
  ) => {
    const execute = async () => {
      setActionError(null);
      try {
        await resolveFlaggedReviewMutation.mutateAsync({ reviewId, status });
        setConfirmDialog(null);
        addToast({
          message: status === 'removed' ? 'Review removed' : 'Review approved',
          variant: 'success',
        });
      } catch (error) {
        setConfirmDialog(null);
        setActionError(
          error instanceof Error
            ? error.message
            : 'Unable to resolve that flagged review right now.',
        );
      }
    };

    if (status === 'removed') {
      setConfirmDialog({
        title: 'Remove flagged review?',
        description: `The flagged review for ${churchName} will be permanently removed.`,
        confirmLabel: 'Remove review',
        onConfirm: execute,
      });
    } else {
      void execute();
    }
  };

  const handleResolveChurchClaim = (
    claimId: string,
    status: 'approved' | 'rejected',
    churchName: string,
  ) => {
    const execute = async () => {
      setActionError(null);
      try {
        await resolveChurchClaimMutation.mutateAsync({ claimId, status });
        setConfirmDialog(null);
        addToast({
          message: status === 'rejected' ? 'Claim rejected' : 'Claim approved',
          variant: 'success',
        });
      } catch (error) {
        setConfirmDialog(null);
        setActionError(
          error instanceof Error ? error.message : 'Unable to resolve that church claim right now.',
        );
      }
    };

    if (status === 'rejected') {
      setConfirmDialog({
        title: 'Reject church claim?',
        description: `The pending claim for ${churchName} will be rejected.`,
        confirmLabel: 'Reject claim',
        onConfirm: execute,
      });
    } else {
      void execute();
    }
  };

  return (
    <div className="flex flex-1 bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">
            Member dashboard
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Good to see you, {firstName}.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            This is your running home for saved churches, visit notes, and the account details that
            help you pick your search back up later.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="rounded-[32px] border border-border bg-card p-6 shadow-airbnb-subtle sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-foreground text-xl font-bold text-white">
                  {initials}
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{user.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {roleLabel}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground">
                <CheckCircle2
                  className={`h-4 w-4 ${user.emailVerified ? 'text-[#166534]' : 'text-[#FF385C]'}`}
                />
                {user.emailVerified ? 'Email ready' : 'Email still needs verification'}
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
              {dashboardSummary}
            </p>

            <Link
              to="/passport"
              className="mt-6 flex items-center justify-between rounded-[28px] border border-[#c9defa] bg-[#f5f9ff] p-5 transition-colors hover:bg-[#eef4ff]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-[#1d4ed8] shadow-airbnb-subtle">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Church Passport</h3>
                  <p className="text-sm text-muted-foreground">
                    Track visits, earn awards, and share your church journey
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-[#1d4ed8]" />
            </Link>

            {!user.emailVerified ? (
              <div className="mt-6 rounded-[28px] border border-[#ffc2cc] bg-[#fff0f3] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Confirm your email before you need it
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Verifying {user.email} makes password recovery and future account notices much
                      smoother. We can send you a fresh link any time.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void handleRequestEmailVerification();
                    }}
                    disabled={requestEmailVerificationMutation.isPending}
                    className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {requestEmailVerificationMutation.isPending
                      ? 'Sending link...'
                      : 'Email me a fresh link'}
                  </button>
                </div>

                {verificationNotice ? (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-[#c9defa] bg-card px-4 py-3 text-sm text-[#1d4ed8]">
                      {verificationNotice.message}
                    </div>
                    {verificationNotice.previewUrl ? (
                      <div className="rounded-2xl border border-[#c9defa] bg-[#f5f9ff] px-4 py-3 text-sm text-[#1d4ed8]">
                        Development preview is enabled in this environment:{' '}
                        <a
                          href={verificationNotice.previewUrl}
                          className="font-semibold underline underline-offset-4"
                        >
                          open the verification link
                        </a>
                        .
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] bg-[#fff5f0] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-[#FF385C] shadow-airbnb-subtle">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">Your account</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Member since {formatMemberSince(user.createdAt)}. Whether you sign in with
                  email/password or Google, your saved churches and reviews stay tied to the same
                  place.
                </p>
              </div>

              <div className="rounded-[28px] bg-[#f5faf7] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-[#1f4d45] shadow-airbnb-subtle">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  What this page is for
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Use this dashboard to keep a shortlist, revisit your notes, manage email
                  verification, and head back into the search when you want a few more options.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-border p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0f3] text-[#FF385C]">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Saved churches</h3>
                    <p className="text-sm text-muted-foreground">
                      {savedChurchCount} saved {savedChurchCount === 1 ? 'church' : 'churches'}
                    </p>
                  </div>
                </div>
                {isSavedChurchesLoading ? (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Loading your saved churches...
                  </p>
                ) : savedChurchesError ? (
                  <p className="mt-4 text-sm leading-6 text-[#a8083a]">
                    {savedChurchesError.message}
                  </p>
                ) : savedChurchCount === 0 ? (
                  <div className="mt-4 rounded-[24px] border border-dashed border-gray-300 bg-background p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-[#FF385C] shadow-airbnb-subtle">
                      <Compass className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Your shortlist starts on the search page. Save churches from results or
                      profile pages so promising options stay in one place.
                    </p>
                    <Link
                      to="/search"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#FF385C] hover:underline"
                    >
                      Browse churches
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {savedChurches.map((church) => {
                      const isUpdating =
                        toggleSavedChurchMutation.isPending &&
                        toggleSavedChurchMutation.variables === church.id;

                      return (
                        <div
                          key={church.id}
                          className="rounded-2xl border border-border bg-background p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                to={`/churches/${church.slug}`}
                                className="text-sm font-semibold text-foreground hover:underline"
                              >
                                {church.name}
                              </Link>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {church.denomination || 'Church listing'}
                              </p>
                              <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {church.neighborhood || church.city}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                void handleToggleSavedChurch(church.id);
                              }}
                              disabled={isUpdating}
                              className="rounded-full border border-[#ffc2cc] bg-card px-3 py-1.5 text-xs font-semibold text-[#FF385C] transition-colors hover:bg-[#fff0f3] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {isUpdating ? 'Updating...' : 'Remove save'}
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>Saved {formatSavedDate(church.savedAt)}</span>
                            <span>{church.reviewCount} reviews</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-[28px] border border-border p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef7ff] text-[#2563eb]">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Your reviews</h3>
                    <p className="text-sm text-muted-foreground">
                      {writtenReviewCount} written {writtenReviewCount === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>

                {isUserReviewsLoading ? (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Loading your review history...
                  </p>
                ) : userReviewsError ? (
                  <p className="mt-4 text-sm leading-6 text-[#a8083a]">
                    {userReviewsError.message}
                  </p>
                ) : writtenReviewCount === 0 ? (
                  <div className="mt-4 rounded-[24px] border border-dashed border-gray-300 bg-background p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-[#2563eb] shadow-airbnb-subtle">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      After you visit a church, leave a short review so you can remember the
                      welcome, tone, and overall fit later on.
                    </p>
                    <Link
                      to="/search"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb] hover:underline"
                    >
                      Find a church to review
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {userReviews.map((review) => {
                      const isDeleting =
                        deleteReviewMutation.isPending &&
                        deleteReviewMutation.variables === review.id;

                      return (
                        <div
                          key={review.id}
                          className="rounded-2xl border border-border bg-background p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                to={`/churches/${review.church.slug}#reviews`}
                                className="text-sm font-semibold text-foreground hover:underline"
                              >
                                {review.church.name}
                              </Link>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {review.church.denomination || 'Church listing'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                void handleDeleteReview(review.id, review.church.name);
                              }}
                              disabled={isDeleting}
                              className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {isDeleting ? 'Deleting...' : 'Delete review'}
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                              <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
                              {formatRating(review.rating)}
                            </span>
                            <span>Updated {formatReviewDate(review.updatedAt)}</span>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {review.body}
                          </p>

                          <Link
                            to={`/churches/${review.church.slug}#reviews`}
                            className="mt-3 inline-flex text-sm font-semibold text-[#2563eb] hover:underline"
                          >
                            Edit on church page
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-border p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5faf7] text-[#1f4d45]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Church claims</h3>
                  <p className="text-sm text-muted-foreground">
                    Track the listing-access requests tied to your account
                  </p>
                </div>
              </div>

              {isChurchClaimsLoading ? (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Loading your church claims...
                </p>
              ) : churchClaimsError ? (
                <p className="mt-4 text-sm leading-6 text-[#a8083a]">{churchClaimsError.message}</p>
              ) : !churchClaims || churchClaims.data.length === 0 ? (
                <div className="mt-4 rounded-[24px] border border-dashed border-gray-300 bg-background p-4">
                  <p className="text-sm leading-6 text-muted-foreground">
                    If you represent a church, start from its profile page and submit a claim
                    request with a staff or ministry email that matches the church&apos;s public
                    domain.
                  </p>
                  <Link
                    to="/search"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1f4d45] hover:underline"
                  >
                    Find a church to claim
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {churchClaims.data.map((claim) => (
                    <div
                      key={claim.id}
                      className="rounded-2xl border border-border bg-background p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/churches/${claim.church.slug}`}
                              className="text-sm font-semibold text-foreground hover:underline"
                            >
                              {claim.church.name}
                            </Link>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getClaimStatusClasses(
                                claim.status,
                              )}`}
                            >
                              {formatClaimStatusLabel(claim.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {claim.roleTitle} · {claim.verificationEmail}
                          </p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            Submitted {formatClaimDate(claim.createdAt)}
                            {claim.reviewedAt
                              ? ` · Reviewed ${formatClaimDate(claim.reviewedAt)}`
                              : ''}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {claim.status === 'approved'
                          ? 'This listing is now connected to your account. Open the leaders portal for a live readiness and event overview.'
                          : claim.status === 'pending'
                            ? 'A site admin still needs to review this request before the listing becomes church-managed.'
                            : 'This request was not approved. If the listing is still unclaimed, you can submit a fresh request from the church page.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasLeaderPortalEntry ? (
              <div className="mt-6 rounded-[28px] border border-[#d7e6dc] bg-[#f5faf7] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-[#1f4d45] shadow-airbnb-subtle">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Church leaders portal</h3>
                    <p className="text-sm text-muted-foreground">
                      Review claimed listings, public-facing gaps, and upcoming event visibility
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-4 rounded-[24px] border border-[#d7e6dc] bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Use the leaders portal as your church-side home base. It pulls approved claims
                    into one place so you can quickly see what visitors can already view and what
                    still needs attention.
                  </p>
                  <Link
                    to="/leaders"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f4d45] px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
                  >
                    Open leaders portal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : null}

            {user.role === 'site_admin' ? (
              <div className="mt-6 rounded-[28px] border border-[#d7e6dc] bg-[#f5faf7] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-[#1f4d45] shadow-airbnb-subtle">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Church claim queue</h3>
                    <p className="text-sm text-muted-foreground">
                      Representatives waiting for listing access approval
                    </p>
                  </div>
                </div>

                {isAdminChurchClaimsLoading ? (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Loading church claims...
                  </p>
                ) : adminChurchClaimsError ? (
                  <p className="mt-4 text-sm leading-6 text-[#a8083a]">
                    {adminChurchClaimsError.message}
                  </p>
                ) : !adminChurchClaims || adminChurchClaims.data.length === 0 ? (
                  <div className="mt-4 rounded-[24px] border border-dashed border-[#b7d1c3] bg-white/80 p-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                      No church claim requests are waiting for review right now.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {adminChurchClaims.data.map((claim) => {
                      const isResolvingClaim =
                        resolveChurchClaimMutation.isPending &&
                        resolveChurchClaimMutation.variables?.claimId === claim.id;

                      return (
                        <div
                          key={claim.id}
                          className="rounded-2xl border border-[#d7e6dc] bg-card p-4"
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <Link
                                to={`/churches/${claim.church.slug}`}
                                className="text-sm font-semibold text-foreground hover:underline"
                              >
                                {claim.church.name}
                              </Link>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {claim.user.name} · {claim.user.email}
                              </p>
                              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                {claim.roleTitle} · Submitted {formatClaimDate(claim.createdAt)}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Verification email: {claim.verificationEmail}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  void handleResolveChurchClaim(
                                    claim.id,
                                    'approved',
                                    claim.church.name,
                                  );
                                }}
                                disabled={isResolvingClaim}
                                className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-4 py-2 text-sm font-semibold text-[#1d4ed8] transition-colors hover:bg-[#dbeafe] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {isResolvingClaim &&
                                resolveChurchClaimMutation.variables?.status === 'approved'
                                  ? 'Approving...'
                                  : 'Approve claim'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  void handleResolveChurchClaim(
                                    claim.id,
                                    'rejected',
                                    claim.church.name,
                                  );
                                }}
                                disabled={isResolvingClaim}
                                className="rounded-full border border-[#ffc2cc] bg-card px-4 py-2 text-sm font-semibold text-[#FF385C] transition-colors hover:bg-[#fff0f3] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {isResolvingClaim &&
                                resolveChurchClaimMutation.variables?.status === 'rejected'
                                  ? 'Rejecting...'
                                  : 'Reject claim'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {user.role === 'site_admin' ? (
              <div className="mt-6 rounded-[28px] border border-[#d7e6dc] bg-[#f5faf7] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-[#1f4d45] shadow-airbnb-subtle">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Review moderation queue
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Community-reported reviews waiting for a decision
                    </p>
                  </div>
                </div>

                {isFlaggedReviewsLoading ? (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Loading flagged reviews...
                  </p>
                ) : flaggedReviewsError ? (
                  <p className="mt-4 text-sm leading-6 text-[#a8083a]">
                    {flaggedReviewsError.message}
                  </p>
                ) : !flaggedReviews || flaggedReviews.data.length === 0 ? (
                  <div className="mt-4 rounded-[24px] border border-dashed border-[#b7d1c3] bg-white/80 p-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                      No flagged reviews are waiting for moderation right now. This queue is clear.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {flaggedReviews.data.map((review) => {
                      const isResolving =
                        resolveFlaggedReviewMutation.isPending &&
                        resolveFlaggedReviewMutation.variables?.reviewId === review.id;

                      return (
                        <div
                          key={review.id}
                          className="rounded-2xl border border-[#d7e6dc] bg-card p-4"
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <Link
                                to={`/churches/${review.church.slug}#reviews`}
                                className="text-sm font-semibold text-foreground hover:underline"
                              >
                                {review.church.name}
                              </Link>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Flagged {formatFlaggedDate(review.flaggedAt)} by community reporting
                              </p>
                              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                Reviewer: {review.user.name}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  void handleResolveFlaggedReview(
                                    review.id,
                                    'approved',
                                    review.church.name,
                                  );
                                }}
                                disabled={isResolving}
                                className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-4 py-2 text-sm font-semibold text-[#1d4ed8] transition-colors hover:bg-[#dbeafe] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {isResolving &&
                                resolveFlaggedReviewMutation.variables?.status === 'approved'
                                  ? 'Restoring...'
                                  : 'Keep live'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  void handleResolveFlaggedReview(
                                    review.id,
                                    'removed',
                                    review.church.name,
                                  );
                                }}
                                disabled={isResolving}
                                className="rounded-full border border-[#ffc2cc] bg-card px-4 py-2 text-sm font-semibold text-[#FF385C] transition-colors hover:bg-[#fff0f3] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {isResolving &&
                                resolveFlaggedReviewMutation.variables?.status === 'removed'
                                  ? 'Removing...'
                                  : 'Remove review'}
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                              <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
                              {formatRating(review.rating)}
                            </span>
                            <span>Updated {formatReviewDate(review.updatedAt)}</span>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {review.body}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </section>

          <aside className="rounded-[32px] bg-[#1f4d45] p-6 text-white shadow-airbnb sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h2 className="mt-6 text-2xl font-bold tracking-tight">Keep this dashboard useful</h2>
            <p className="mt-3 text-sm leading-7 text-white/85">
              Search for churches that feel promising, save the ones worth a second look, and leave
              quick notes after a visit so your decision gets easier over time.
            </p>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                Next steps
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-white/90">
                {nextSteps.map((step) => (
                  <p key={step}>{step}</p>
                ))}
              </div>
            </div>

            {actionError ? (
              <div className="mt-6 rounded-2xl border border-[#ffc2cc]/40 bg-[#43111c] px-4 py-3 text-sm text-[#ffd3dc]">
                {actionError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  void handleLogout();
                }}
                disabled={logoutMutation.isPending}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1f4d45] transition-colors hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {logoutMutation.isPending ? 'Signing you out...' : 'Sign out'}
              </button>
              <Link
                to="/search"
                className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Explore more churches
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog !== null}
        title={confirmDialog?.title ?? ''}
        description={confirmDialog?.description ?? ''}
        confirmLabel={confirmDialog?.confirmLabel ?? 'Confirm'}
        variant="destructive"
        isPending={
          deleteReviewMutation.isPending ||
          resolveFlaggedReviewMutation.isPending ||
          resolveChurchClaimMutation.isPending
        }
        onConfirm={() => {
          if (confirmDialog) void confirmDialog.onConfirm();
        }}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
};

export default AccountPage;
