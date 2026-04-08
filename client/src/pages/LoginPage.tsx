import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { useAuthSession, useLogin } from '@/hooks/useAuth';
import {
  buildAuthPageHref,
  buildGoogleAuthUrl,
  resolveAuthRedirectPath,
  resolveOAuthErrorMessage,
} from '@/lib/auth-redirect';

type LoginFormState = {
  email: string;
  password: string;
};

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

const inputClasses =
  'mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-[#222] outline-none transition focus:border-[#FF385C] focus:ring-4 focus:ring-[#FF385C]/10';

const validateForm = ({ email, password }: LoginFormState): string | null => {
  if (!email.trim()) {
    return 'Email is required.';
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Enter a valid email address.';
  }

  if (!password) {
    return 'Password is required.';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  return null;
};

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = resolveAuthRedirectPath(location.state, location.search);
  const googleAuthUrl = buildGoogleAuthUrl(redirectTo);
  const registerHref = buildAuthPageHref('/register', redirectTo);
  const oauthErrorMessage = resolveOAuthErrorMessage(location.search);
  const { isLoading, user } = useAuthSession();
  const loginMutation = useLogin();
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  if (!isLoading && user) {
    return <Navigate replace to={redirectTo} />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateForm(formState);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setFormError(null);

    try {
      await loginMutation.mutateAsync({
        email: formState.email.trim(),
        password: formState.password,
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in right now.');
    }
  };

  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="Sign in and keep your church search in reach."
      description="Choose the sign-in method that fits the moment. Email/password and Google now land in the same real session-backed account flow."
      footer={
        <p>
          Don&apos;t have an account yet?{' '}
          <Link
            to={registerHref}
            state={location.state}
            className="font-semibold text-[#222] underline underline-offset-4"
          >
            Create one
          </Link>
          .
        </p>
      }
    >
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">Sign in</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#222]">
          Pick up where you left off.
        </h1>
        <p className="text-sm leading-6 text-[#5c5650]">
          Email/password accounts, Google sign-in, password recovery, and email verification now all
          feed the same session-aware account area.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {oauthErrorMessage ? (
          <div className="rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]">
            {oauthErrorMessage}
          </div>
        ) : null}

        <GoogleAuthButton href={googleAuthUrl} label="Continue with Google" />

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#999]">
          <span className="h-px flex-1 bg-gray-200" />
          Or continue with email
          <span className="h-px flex-1 bg-gray-200" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-[#222]">
          Email
          <input
            type="email"
            autoComplete="email"
            value={formState.email}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                email: event.target.value,
              }));
            }}
            className={inputClasses}
            placeholder="you@example.com"
          />
        </label>

        <label className="block text-sm font-semibold text-[#222]">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={formState.password}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                password: event.target.value,
              }));
            }}
            className={inputClasses}
            placeholder="At least 8 characters"
          />
        </label>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-[#FF385C] underline underline-offset-4"
          >
            Forgot your password?
          </Link>
        </div>

        {formError ? (
          <div className="rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]">
            {formError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-full bg-[#222] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loginMutation.isPending ? 'Signing you in...' : 'Sign in'}
        </button>
      </form>
    </AuthPageShell>
  );
};

export default LoginPage;
