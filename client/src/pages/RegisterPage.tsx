import { FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { useAuthSession, useRegister } from '@/hooks/useAuth'

type AuthRedirectState = {
  from?: {
    pathname?: string
    search?: string
  }
}

type RegisterFormState = {
  name: string
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

const validateForm = ({ name, email, password }: RegisterFormState): string | null => {
  if (!name.trim()) {
    return 'Name is required.'
  }

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

const RegisterPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const redirectTo = resolveRedirectPath(location.state)
  const { isLoading, user } = useAuthSession()
  const registerMutation = useRegister()
  const [formState, setFormState] = useState<RegisterFormState>({
    name: '',
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
      await registerMutation.mutateAsync({
        name: formState.name.trim(),
        email: formState.email.trim(),
        password: formState.password,
      })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to create your account right now.',
      )
    }
  }

  return (
    <AuthPageShell
      eyebrow='Create your account'
      title='Start a church shortlist you can come back to.'
      description='This first pass focuses on the real session-backed foundation: register, log in, stay signed in, and prepare the app for favorites and reviews.'
      footer={
        <p>
          Already have an account?{' '}
          <Link
            to='/login'
            state={location.state}
            className='font-semibold text-[#222222] underline underline-offset-4'
          >
            Sign in instead
          </Link>
          .
        </p>
      }
    >
      <div className='space-y-3'>
        <p className='text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]'>
          Sign up
        </p>
        <h1 className='text-3xl font-bold tracking-tight text-[#222222]'>
          Create a local account.
        </h1>
        <p className='text-sm leading-6 text-[#555555]'>
          You&apos;ll land in a new account area right after signup, with session
          state wired through the frontend shell and ready for the next user
          features.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
        <label className='block text-sm font-semibold text-[#222222]'>
          Name
          <input
            type='text'
            autoComplete='name'
            value={formState.name}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                name: event.target.value,
              }))
            }}
            className={inputClasses}
            placeholder='Grace Hopper'
          />
        </label>

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
            autoComplete='new-password'
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

        {formError ? (
          <div className='rounded-2xl border border-[#ffb4c1] bg-[#fff1f4] px-4 py-3 text-sm text-[#9f1239]'>
            {formError}
          </div>
        ) : null}

        <button
          type='submit'
          disabled={registerMutation.isPending}
          className='w-full rounded-full bg-[#FF385C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E00B41] disabled:cursor-not-allowed disabled:opacity-70'
        >
          {registerMutation.isPending ? 'Creating your account...' : 'Create account'}
        </button>
      </form>
    </AuthPageShell>
  )
}

export default RegisterPage
