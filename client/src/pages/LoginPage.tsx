import { FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { useAuthSession, useLogin } from '@/hooks/useAuth'

type AuthRedirectState = {
  from?: {
    pathname?: string
    search?: string
  }
}

type LoginFormState = {
  email: string
  password: string
}

const EMAIL_PATTERN = /\S+@\S+\.\S+/

const inputClasses =
  'mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-[#222222] outline-none transition focus:border-[#FF385C] focus:ring-4 focus:ring-[#FF385C]/10'

const resolveRedirectPath = (state: unknown): string => {
  if (!state || typeof state !== 'object') {
    return '/account'
  }

  const from = (state as AuthRedirectState).from

  if (!from?.pathname || from.pathname === '/login' || from.pathname === '/register') {
    return '/account'
  }

  return `${from.pathname}${from.search ?? ''}`
}

const validateForm = ({ email, password }: LoginFormState): string | null => {
  if (!email.trim()) {
    return 'Email is required.'
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Enter a valid email address.'
  }

  if (!password) {
    return 'Password is required.'
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  return null
}

const LoginPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const redirectTo = resolveRedirectPath(location.state)
  const { isLoading, user } = useAuthSession()
  const loginMutation = useLogin()
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

  if (!isLoading && user) {
    return <Navigate replace to={redirectTo} />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationMessage = validateForm(formState)
    if (validationMessage) {
      setFormError(validationMessage)
      return
    }

    setFormError(null)

    try {
      await loginMutation.mutateAsync({
        email: formState.email.trim(),
        password: formState.password,
      })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to sign in right now.',
      )
    }
  }

  return (
    <AuthPageShell
      eyebrow='Welcome back'
      title='Sign in and keep your church search in reach.'
      description='The backend session flow is now live, so this screen hooks directly into the real account API instead of a placeholder.'
      footer={
        <p>
          Don&apos;t have an account yet?{' '}
          <Link
            to='/register'
            state={location.state}
            className='font-semibold text-[#222222] underline underline-offset-4'
          >
            Create one
          </Link>
          .
        </p>
      }
    >
      <div className='space-y-3'>
        <p className='text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]'>
          Sign in
        </p>
        <h1 className='text-3xl font-bold tracking-tight text-[#222222]'>
          Pick up where you left off.
        </h1>
        <p className='text-sm leading-6 text-[#555555]'>
          Local email and password accounts are ready now, including password
          recovery. Google sign-in and email verification are the main auth
          follow-ups still ahead.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
        <label className='block text-sm font-semibold text-[#222222]'>
          Email
          <input
            type='email'
            autoComplete='email'
            value={formState.email}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                email: event.target.value,
              }))
            }}
            className={inputClasses}
            placeholder='you@example.com'
          />
        </label>

        <label className='block text-sm font-semibold text-[#222222]'>
          Password
          <input
            type='password'
            autoComplete='current-password'
            value={formState.password}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                password: event.target.value,
              }))
            }}
            className={inputClasses}
            placeholder='At least 8 characters'
          />
        </label>

        <div className='flex justify-end'>
          <Link
            to='/forgot-password'
            className='text-sm font-semibold text-[#FF385C] underline underline-offset-4'
          >
            Forgot your password?
          </Link>
        </div>

        {formError ? (
          <div className='rounded-2xl border border-[#ffb4c1] bg-[#fff1f4] px-4 py-3 text-sm text-[#9f1239]'>
            {formError}
          </div>
        ) : null}

        <button
          type='submit'
          disabled={loginMutation.isPending}
          className='w-full rounded-full bg-[#222222] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70'
        >
          {loginMutation.isPending ? 'Signing you in...' : 'Sign in'}
        </button>
      </form>
    </AuthPageShell>
  )
}

export default LoginPage
