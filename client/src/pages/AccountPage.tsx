import { useState } from 'react'
import {
  CheckCircle2,
  Heart,
  Mail,
  MessageSquareText,
  ShieldCheck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuthSession, useLogout } from '@/hooks/useAuth'

const formatMemberSince = (createdAt: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(createdAt))
}

const AccountPage = () => {
  const navigate = useNavigate()
  const logoutMutation = useLogout()
  const { user } = useAuthSession()
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
            Session-backed auth is now connected through the frontend shell. This
            account home is ready for saved churches, reviews, and the remaining
            auth flows as the next Milestone 2 slices land.
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
                  password auth are live, with more account flows queued next.
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
                    <p className='text-sm text-[#555555]'>Coming in the next account slice</p>
                  </div>
                </div>
                <p className='mt-4 text-sm leading-6 text-[#555555]'>
                  Your favorites will appear here once the save and unsave flows
                  are wired into church cards and profile pages.
                </p>
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
              connected end to end now. Google OAuth, password reset, and email
              verification are the main auth follow-ups still open.
            </p>

            <div className='mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5'>
              <p className='text-sm font-semibold uppercase tracking-[0.18em] text-white/70'>
                Next up
              </p>
              <ul className='mt-4 space-y-3 text-sm leading-6 text-white/90'>
                <li>Email verification flow</li>
                <li>Google OAuth sign-in</li>
                <li>Forgot and reset password screens</li>
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
