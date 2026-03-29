import { useState } from 'react'
import {
  CheckCircle2,
  Heart,
  Mail,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Star,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuthSession, useLogout, useRequestEmailVerification } from '@/hooks/useAuth'
import { useSavedChurches, useToggleSavedChurch } from '@/hooks/useChurches'
import { useDeleteReview, useUserReviews } from '@/hooks/useReviews'
import { formatRating } from '@/utils/format'

const formatMemberSince = (createdAt: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(createdAt))
}

const formatSavedDate = (savedAt: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(savedAt))
}

const formatReviewDate = (reviewDate: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(reviewDate))
}

const AccountPage = () => {
  const navigate = useNavigate()
  const logoutMutation = useLogout()
  const requestEmailVerificationMutation = useRequestEmailVerification()
  const { user } = useAuthSession()
  const {
    data: savedChurches = [],
    isLoading: isSavedChurchesLoading,
    error: savedChurchesError,
  } = useSavedChurches(user?.id ?? null)
  const {
    data: userReviews = [],
    isLoading: isUserReviewsLoading,
    error: userReviewsError,
  } = useUserReviews(user?.id ?? null)
  const toggleSavedChurchMutation = useToggleSavedChurch()
  const deleteReviewMutation = useDeleteReview()
  const [actionError, setActionError] = useState<string | null>(null)
  const [verificationNotice, setVerificationNotice] = useState<{
    message: string
    previewUrl?: string
  } | null>(null)

  if (!user) {
    return null
  }

  const firstName = user.name.split(' ')[0] || user.name
  const initials =
    user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'

  const handleLogout = async () => {
    setActionError(null)

    try {
      await logoutMutation.mutateAsync()
      navigate('/', { replace: true })
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to sign out right now.',
      )
    }
  }

  const handleToggleSavedChurch = async (churchId: string) => {
    setActionError(null)

    try {
      await toggleSavedChurchMutation.mutateAsync(churchId)
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to update saved churches right now.',
      )
    }
  }

  const handleDeleteReview = async (reviewId: string, churchName: string) => {
    setActionError(null)

    if (!window.confirm(`Delete your review for ${churchName}?`)) {
      return
    }

    try {
      await deleteReviewMutation.mutateAsync(reviewId)
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to delete your review right now.',
      )
    }
  }

  const handleRequestEmailVerification = async () => {
    setActionError(null)
    setVerificationNotice(null)

    try {
      const result = await requestEmailVerificationMutation.mutateAsync()

      setVerificationNotice({
        message:
          result.status === 'already-verified'
            ? 'Your email address is already verified.'
            : 'Verification instructions are ready for your inbox.',
        previewUrl: result.previewUrl,
      })
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to send a verification link right now.',
      )
    }
  }

  return (
    <div className='flex flex-1 bg-[#fcfbf8]'>
      <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12'>
        <div className='mb-8 space-y-3'>
          <p className='text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]'>
            Account
          </p>
          <h1 className='text-4xl font-bold tracking-tight text-[#222222] sm:text-5xl'>
            Welcome back, {firstName}.
          </h1>
          <p className='max-w-3xl text-base leading-7 text-[#555555]'>
            Session-backed auth, Google sign-in, saved churches, written reviews,
            password recovery, and email verification are now connected end to
            end. This page is the working home for your shortlist, review
            history, and account status.
          </p>
        </div>

        <div className='grid gap-6 lg:grid-cols-[1.1fr,0.9fr]'>
          <section className='rounded-[32px] border border-gray-200 bg-white p-6 shadow-airbnb-subtle sm:p-8'>
            <div className='flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#222222] text-xl font-bold text-white'>
                  {initials}
                </div>
                <div>
                  <h2 className='text-2xl font-bold tracking-tight text-[#222222]'>
                    {user.name}
                  </h2>
                  <p className='mt-1 text-sm text-[#555555]'>{user.email}</p>
                  <p className='mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8f8f]'>
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className='inline-flex items-center gap-2 rounded-full border border-gray-200 bg-[#f8f8f8] px-4 py-2 text-sm font-semibold text-[#222222]'>
                <CheckCircle2
                  className={`h-4 w-4 ${user.emailVerified ? 'text-[#1f9d55]' : 'text-[#FF385C]'}`}
                />
                {user.emailVerified ? 'Email verified' : 'Email verification pending'}
              </div>
            </div>

            {!user.emailVerified ? (
              <div className='mt-6 rounded-[28px] border border-[#ffd6df] bg-[#fff7f9] p-5'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold text-[#222222]'>
                      Verify your email address
                    </h3>
                    <p className='mt-2 text-sm leading-6 text-[#555555]'>
                      The verification flow is now wired. Send yourself a fresh link
                      here, and if local preview mode is enabled you&apos;ll get a
                      direct verification URL without waiting on SMTP.
                    </p>
                  </div>

                  <button
                    type='button'
                    onClick={() => {
                      void handleRequestEmailVerification()
                    }}
                    disabled={requestEmailVerificationMutation.isPending}
                    className='rounded-full bg-[#222222] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70'
                  >
                    {requestEmailVerificationMutation.isPending
                      ? 'Sending link...'
                      : 'Send verification link'}
                  </button>
                </div>

                {verificationNotice ? (
                  <div className='mt-4 space-y-3'>
                    <div className='rounded-2xl border border-[#c9defa] bg-white px-4 py-3 text-sm text-[#1d4ed8]'>
                      {verificationNotice.message}
                    </div>
                    {verificationNotice.previewUrl ? (
                      <div className='rounded-2xl border border-[#c9defa] bg-[#f5f9ff] px-4 py-3 text-sm text-[#1d4ed8]'>
                        Development preview enabled:{' '}
                        <a
                          href={verificationNotice.previewUrl}
                          className='font-semibold underline underline-offset-4'
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

            <div className='mt-6 grid gap-4 md:grid-cols-2'>
              <div className='rounded-[28px] bg-[#fff7f3] p-5'>
                <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#FF385C] shadow-airbnb-subtle'>
                  <Mail className='h-5 w-5' />
                </div>
                <h3 className='mt-4 text-lg font-semibold text-[#222222]'>
                  Membership details
                </h3>
                <p className='mt-2 text-sm leading-6 text-[#555555]'>
                  Member since {formatMemberSince(user.createdAt)}. Email/password
                  sign-in, Google sign-in, and your shortlist plus written reviews
                  now stay tied to the same account.
                </p>
              </div>

              <div className='rounded-[28px] bg-[#f6faf8] p-5'>
                <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#1f4d45] shadow-airbnb-subtle'>
                  <ShieldCheck className='h-5 w-5' />
                </div>
                <h3 className='mt-4 text-lg font-semibold text-[#222222]'>
                  Review activity
                </h3>
                <p className='mt-2 text-sm leading-6 text-[#555555]'>
                  Reviews are live for signed-in accounts today, email
                  verification can be managed from this page, and password
                  recovery plus Google sign-in now give you two ways back into
                  your account.
                </p>
              </div>
            </div>

            <div className='mt-6 grid gap-4 md:grid-cols-2'>
              <div className='rounded-[28px] border border-gray-200 p-5'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1f4] text-[#FF385C]'>
                    <Heart className='h-5 w-5' />
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-[#222222]'>
                      Saved churches
                    </h3>
                    <p className='text-sm text-[#555555]'>
                      {savedChurches.length} saved{' '}
                      {savedChurches.length === 1 ? 'church' : 'churches'}
                    </p>
                  </div>
                </div>
                {isSavedChurchesLoading ? (
                  <p className='mt-4 text-sm leading-6 text-[#555555]'>
                    Loading your saved churches...
                  </p>
                ) : savedChurchesError ? (
                  <p className='mt-4 text-sm leading-6 text-[#9f1239]'>
                    {savedChurchesError.message}
                  </p>
                ) : savedChurches.length === 0 ? (
                  <p className='mt-4 text-sm leading-6 text-[#555555]'>
                    Save a church from search results or a profile page and it will
                    appear here for quick comparison later.
                  </p>
                ) : (
                  <div className='mt-4 space-y-3'>
                    {savedChurches.map((church) => {
                      const isUpdating =
                        toggleSavedChurchMutation.isPending &&
                        toggleSavedChurchMutation.variables === church.id

                      return (
                        <div
                          key={church.id}
                          className='rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4'
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div className='min-w-0'>
                              <Link
                                to={`/churches/${church.slug}`}
                                className='text-sm font-semibold text-[#222222] hover:underline'
                              >
                                {church.name}
                              </Link>
                              <p className='mt-1 text-sm text-[#555555]'>
                                {church.denomination || 'Church listing'}
                              </p>
                              <p className='mt-2 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.12em] text-[#8f8f8f]'>
                                <MapPin className='h-3.5 w-3.5' />
                                {church.neighborhood || church.city}
                              </p>
                            </div>

                            <button
                              type='button'
                              onClick={() => {
                                void handleToggleSavedChurch(church.id)
                              }}
                              disabled={isUpdating}
                              className='rounded-full border border-[#ffd6df] bg-white px-3 py-1.5 text-xs font-semibold text-[#FF385C] transition-colors hover:bg-[#fff1f4] disabled:cursor-not-allowed disabled:opacity-70'
                            >
                              {isUpdating ? 'Updating...' : 'Saved'}
                            </button>
                          </div>

                          <div className='mt-3 flex flex-wrap items-center gap-3 text-xs text-[#717171]'>
                            <span>Saved {formatSavedDate(church.savedAt)}</span>
                            <span>{church.reviewCount} reviews</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className='rounded-[28px] border border-gray-200 p-5'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef7ff] text-[#2563eb]'>
                    <MessageSquareText className='h-5 w-5' />
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-[#222222]'>Your reviews</h3>
                    <p className='text-sm text-[#555555]'>
                      {userReviews.length} written{' '}
                      {userReviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>

                {isUserReviewsLoading ? (
                  <p className='mt-4 text-sm leading-6 text-[#555555]'>
                    Loading your review history...
                  </p>
                ) : userReviewsError ? (
                  <p className='mt-4 text-sm leading-6 text-[#9f1239]'>
                    {userReviewsError.message}
                  </p>
                ) : userReviews.length === 0 ? (
                  <p className='mt-4 text-sm leading-6 text-[#555555]'>
                    Visit any church profile to leave your first review. Once you do,
                    the latest feedback and edit links will appear here.
                  </p>
                ) : (
                  <div className='mt-4 space-y-3'>
                    {userReviews.map((review) => {
                      const isDeleting =
                        deleteReviewMutation.isPending &&
                        deleteReviewMutation.variables === review.id

                      return (
                        <div
                          key={review.id}
                          className='rounded-2xl border border-gray-200 bg-[#fcfbf8] p-4'
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div className='min-w-0'>
                              <Link
                                to={`/churches/${review.church.slug}#reviews`}
                                className='text-sm font-semibold text-[#222222] hover:underline'
                              >
                                {review.church.name}
                              </Link>
                              <p className='mt-1 text-sm text-[#555555]'>
                                {review.church.denomination || 'Church listing'}
                              </p>
                            </div>
                            <button
                              type='button'
                              onClick={() => {
                                void handleDeleteReview(review.id, review.church.name)
                              }}
                              disabled={isDeleting}
                              className='inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#222222] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70'
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>

                          <div className='mt-3 flex flex-wrap items-center gap-3 text-xs text-[#717171]'>
                            <span className='inline-flex items-center gap-1 font-semibold text-[#222222]'>
                              <Star className='h-3.5 w-3.5 fill-[#222222] text-[#222222]' />
                              {formatRating(review.rating)}
                            </span>
                            <span>Updated {formatReviewDate(review.updatedAt)}</span>
                          </div>

                          <p className='mt-3 text-sm leading-6 text-[#555555]'>
                            {review.body}
                          </p>

                          <Link
                            to={`/churches/${review.church.slug}#reviews`}
                            className='mt-3 inline-flex text-sm font-semibold text-[#2563eb] hover:underline'
                          >
                            Edit on church page
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className='rounded-[32px] bg-[#1f4d45] p-6 text-white shadow-airbnb sm:p-8'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10'>
              <ShieldCheck className='h-6 w-6' />
            </div>

            <h2 className='mt-6 text-2xl font-bold tracking-tight'>
              Session and security
            </h2>
            <p className='mt-3 text-sm leading-7 text-white/85'>
              Sign in, registration, Google OAuth, logout, current-session checks,
              password reset, saved churches, helpful voting, and written review
              history are all connected end to end now. Production-ready auth email
              delivery and review moderation are the main Milestone 2 follow-ups
              still open.
            </p>

            <div className='mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5'>
              <p className='text-sm font-semibold uppercase tracking-[0.18em] text-white/70'>
                Next up
              </p>
              <ul className='mt-4 space-y-3 text-sm leading-6 text-white/90'>
                <li>Transactional email delivery for auth</li>
                <li>Review moderation</li>
                <li>Map bundle follow-up only if the production warning becomes real</li>
              </ul>
            </div>

            {actionError ? (
              <div className='mt-6 rounded-2xl border border-[#ffb4c1]/40 bg-[#43111c] px-4 py-3 text-sm text-[#ffd3dc]'>
                {actionError}
              </div>
            ) : null}

            <div className='mt-6 flex flex-col gap-3'>
              <button
                type='button'
                onClick={() => {
                  void handleLogout()
                }}
                disabled={logoutMutation.isPending}
                className='rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1f4d45] transition-colors hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-70'
              >
                {logoutMutation.isPending ? 'Signing you out...' : 'Sign out'}
              </button>
              <Link
                to='/search'
                className='rounded-full border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10'
              >
                Keep exploring churches
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default AccountPage
