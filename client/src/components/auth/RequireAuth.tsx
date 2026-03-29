import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuthSession } from '@/hooks/useAuth'

type RequireAuthProps = {
  children: ReactNode
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const location = useLocation()
  const { error, isLoading, refetch, user } = useAuthSession()

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center bg-[#fff8f5] px-4 py-16'>
        <div className='rounded-[28px] border border-gray-200 bg-white px-6 py-8 text-center shadow-airbnb-subtle'>
          <p className='text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]'>
            Checking session
          </p>
          <p className='mt-3 text-base text-[#555555]'>
            Making sure your account is ready before we open this page.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-1 items-center justify-center bg-[#fff8f5] px-4 py-16'>
        <div className='max-w-md rounded-[28px] border border-gray-200 bg-white p-8 text-center shadow-airbnb-subtle'>
          <p className='text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]'>
            Session unavailable
          </p>
          <h1 className='mt-3 text-2xl font-bold tracking-tight text-[#222222]'>
            We couldn&apos;t verify your account right now.
          </h1>
          <p className='mt-3 text-sm leading-6 text-[#555555]'>{error.message}</p>
          <button
            type='button'
            onClick={() => {
              void refetch()
            }}
            className='mt-6 rounded-full bg-[#222222] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black'
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        replace
        to='/login'
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        }}
      />
    )
  }

  return <>{children}</>
}
