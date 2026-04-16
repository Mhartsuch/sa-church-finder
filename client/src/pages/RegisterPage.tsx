import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { useAuthSession, useRegister } from '@/hooks/useAuth';
import { useDocumentHead } from '@/hooks/useDocumentHead';
import {
  buildAuthPageHref,
  buildGoogleAuthUrl,
  resolveAuthRedirectPath,
  resolveOAuthErrorMessage,
} from '@/lib/auth-redirect';

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
};

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

const inputClasses =
  'mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-foreground outline-none transition focus:border-[#FF385C] focus:ring-4 focus:ring-[#FF385C]/10';

const validateForm = ({ name, email, password }: RegisterFormState): string | null => {
  if (!name.trim()) {
    return 'Name is required.';
  }

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

const RegisterPage = () => {
  useDocumentHead({ title: 'Create Account', noindex: true });

  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = resolveAuthRedirectPath(location.state, location.search);
  const googleAuthUrl = buildGoogleAuthUrl(redirectTo);
  const loginHref = buildAuthPageHref('/login', redirectTo);
  const oauthErrorMessage = resolveOAuthErrorMessage(location.search);
  const { isLoading, user } = useAuthSession();
  const registerMutation = useRegister();
  const [formState, setFormState] = useState<RegisterFormState>({
    name: '',
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
      await registerMutation.mutateAsync({
        name: formState.name.trim(),
        email: formState.email.trim(),
        password: formState.password,
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to create your account right now.',
      );
    }
  };

  return (
    <AuthPageShell
      eyebrow="Create your account"
      title="Start a church shortlist you can come back to."
      description="Start with email/password or Google, then land in the same real session-backed account flow for saved churches, reviews, and more."
      footer={
        <p>
          Already have an account?{' '}
          <Link
            to={loginHref}
            state={location.state}
            className="font-semibold text-foreground underline underline-offset-4"
          >
            Sign in instead
          </Link>
          .
        </p>
      }
    >
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">Sign up</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create your account your way.
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Email/password signup and Google sign-in both land in the same account area, so your
          shortlist and reviews stay tied to one session-backed identity.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {oauthErrorMessage ? (
          <div className="rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]">
            {oauthErrorMessage}
          </div>
        ) : null}

        <GoogleAuthButton href={googleAuthUrl} label="Continue with Google" />

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Or create an account with email
          <span className="h-px flex-1 bg-border" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-foreground">
          Name
          <input
            type="text"
            autoComplete="name"
            value={formState.name}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                name: event.target.value,
              }));
            }}
            className={inputClasses}
            placeholder="Grace Hopper"
          />
        </label>

        <label className="block text-sm font-semibold text-foreground">
          Email
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
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

        <label className="block text-sm font-semibold text-foreground">
          Password
          <input
            type="password"
            autoComplete="new-password"
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

        {formError ? (
          <div className="rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]">
            {formError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full rounded-full bg-[#FF385C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00838] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {registerMutation.isPending ? 'Creating your account...' : 'Create account'}
        </button>
      </form>
    </AuthPageShell>
  );
};

export default RegisterPage;
