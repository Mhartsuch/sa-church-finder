import { useState } from 'react'
import {
  CheckCircle2,
  Heart,
  Mail,
  MapPin,
  MessageSquareText,
  ShieldCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuthSession, useLogout } from '@/hooks/useAuth'
import { useSavedChurches, useToggleSavedChurch } from '@/hooks/useChurches'

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

const AccountPage = () => {
  const navigate = useNavigate()
  const logoutMutation = useLogout()
  const { user } = useAuthSession()
  const { data: savedChurches = [], isLoading: isSavedChurchesLoading, error: savedChurchesError } =
    useSavedChurches(user?.id ?? null)
  const toggleSavedChurchMutation = useToggleSavedChurch()
  const [actionError, setActionError] = useState<string | null>(null)

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
            Session-backed auth and saved churches are now connected end to end.
            This account home is the working surface for your shortlist today, with
            reviews and the remaining auth flows queued next.
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

            <div className='mt-6 grid gap-4 md:grid-cols-2'>
              <div className='rounded-[28px] bg-[#fff7f3] p-5'>
                <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#FF385C] shadow-airbnb-subtle'>
                  <Mail className='h-5 w-5' />
                </div>
                <h3 className='mt-4 text-lg font-semibold text-[#222222]'>
                  Membership details
                </h3>
                <p className='mt-2 text-sm leading-6 text-[#555555]'>
                  Member since {formatMemberSince(user.createdAt)}. Local email and
                  password auth are live, with saved churches now synced to your
                  account.
                </p>
              </div>

              <div className='rounded-[28px] bg-[#f6faf8] p-5'>
                <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#1f4d45] shadow-airbnb-subtle'>
                  <ShieldCheck className='h-5 w-5' />
                </div>
                <h3 className='mt-4 text-lg font-semibold text-[#222222]'>
                  Review readiness
                </h3>
                <p className='mt-2 text-sm leading-6 text-[#555555]'>
                  Reviews will unlock once email verification ships. This page is
                  the surface where that status will live.
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
                      {savedChurches.length} saved {savedChurches.length === 1 ? 'church' : 'churches'}
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
                    <p className='text-sm text-[#555555]'>Ready for the review workflow</p>
                  </div>
                </div>
                <p className='mt-4 text-sm leading-6 text-[#555555]'>
                  Once review endpoints and UI land, this section will show your
                  recent feedback and rating history.
                </p>
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
              Sign in, registration, logout, and current-session checks are all
              connected end to end now, and saved churches sync with your account.
              Reviews, Google OAuth, password reset, and email verification are the
              main Milestone 2 follow-ups still open.
            </p>

            <div className='mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5'>
              <p className='text-sm font-semibold uppercase tracking-[0.18em] text-white/70'>
                Next up
              </p>
              <ul className='mt-4 space-y-3 text-sm leading-6 text-white/90'>
                <li>Review creation and account history</li>
                <li>Email verification flow</li>
                <li>Google OAuth and password reset</li>
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
