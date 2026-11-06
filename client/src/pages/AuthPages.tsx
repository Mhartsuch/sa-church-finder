import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { requestPasswordReset, resetPassword, verifyEmail } from '@/api/auth';
import { AuthLayout, Field, FormError, PrimaryButton } from '@/components/auth/AuthLayout';
import { useLogin, useRegister } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  buildAuthPageHref,
  buildGoogleAuthUrl,
  resolveAuthRedirectPath,
  resolveOAuthErrorMessage,
} from '@/lib/auth-redirect';

const GoogleButton = ({ returnTo }: { returnTo: string }) => (
  <a
    href={buildGoogleAuthUrl(returnTo)}
    className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-900 py-3 font-semibold hover:bg-gray-50"
  >
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
    Continue with Google
  </a>
);

const Divider = () => (
  <div className="my-6 flex items-center gap-4 text-xs text-gray-500">
    <span className="h-px flex-1 bg-gray-200" /> or <span className="h-px flex-1 bg-gray-200" />
  </div>
);

export const LoginPage = () => {
  useDocumentTitle('Log in');
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = resolveAuthRedirectPath(location.state, location.search);
  const oauthError = resolveOAuthErrorMessage(location.search);
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate({ email, password }, { onSuccess: () => navigate(returnTo, { replace: true }) });
  };

  return (
    <AuthLayout title="Log in">
      <h2 className="mb-6 text-[22px] font-semibold">Welcome back</h2>
      <form onSubmit={submit} className="space-y-4">
        <FormError error={login.error ?? (oauthError ? new Error(oauthError) : null)} />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PrimaryButton type="submit" disabled={login.isPending}>
          {login.isPending ? 'Logging in…' : 'Continue'}
        </PrimaryButton>
      </form>
      <Divider />
      <GoogleButton returnTo={returnTo} />
      <div className="mt-6 flex justify-between text-sm">
        <Link to="/forgot-password" className="font-semibold underline">
          Forgot password?
        </Link>
        <Link to={buildAuthPageHref('/register', returnTo)} className="font-semibold underline">
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
};

export const RegisterPage = () => {
  useDocumentTitle('Sign up');
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = resolveAuthRedirectPath(location.state, location.search);
  const register = useRegister();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    register.mutate(form, { onSuccess: () => navigate(returnTo, { replace: true }) });
  };

  return (
    <AuthLayout title="Sign up">
      <h2 className="mb-2 text-[22px] font-semibold">Find your church home</h2>
      <p className="mb-6 text-gray-500">
        Save churches to your wishlist and share your experience.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <FormError error={register.error} />
        <Field
          label="Name"
          autoComplete="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Field
          label="Password (8+ characters)"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <PrimaryButton type="submit" disabled={register.isPending}>
          {register.isPending ? 'Creating account…' : 'Agree and continue'}
        </PrimaryButton>
        <p className="text-xs text-gray-500">
          By continuing you agree to our{' '}
          <Link to="/terms" className="underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
      <Divider />
      <GoogleButton returnTo={returnTo} />
      <p className="mt-6 text-center text-sm">
        Already have an account?{' '}
        <Link to={buildAuthPageHref('/login', returnTo)} className="font-semibold underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export const ForgotPasswordPage = () => {
  useDocumentTitle('Reset password');
  const [email, setEmail] = useState('');
  const request = useMutation({ mutationFn: requestPasswordReset });

  return (
    <AuthLayout title="Reset your password">
      {request.isSuccess ? (
        <p className="text-gray-700">
          If an account exists for {email}, a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            request.mutate(email);
          }}
          className="space-y-4"
        >
          <p className="text-gray-500">
            Enter your email and we’ll send you a link to reset your password.
          </p>
          <FormError error={request.error} />
          <Field
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PrimaryButton type="submit" disabled={request.isPending}>
            Send reset link
          </PrimaryButton>
        </form>
      )}
      <Link to="/login" className="mt-6 block text-center text-sm font-semibold underline">
        Back to log in
      </Link>
    </AuthLayout>
  );
};

export const ResetPasswordPage = () => {
  useDocumentTitle('Choose a new password');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const reset = useMutation({ mutationFn: resetPassword });

  return (
    <AuthLayout title="Choose a new password">
      {!token ? (
        <p className="text-gray-700">
          This reset link is invalid. Request a new one from the log in page.
        </p>
      ) : reset.isSuccess ? (
        <p className="text-gray-700">
          Your password has been updated.{' '}
          <Link to="/login" className="font-semibold underline">
            Log in
          </Link>
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            reset.mutate({ token, password });
          }}
          className="space-y-4"
        >
          <FormError error={reset.error} />
          <Field
            label="New password (8+ characters)"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PrimaryButton type="submit" disabled={reset.isPending}>
            Update password
          </PrimaryButton>
        </form>
      )}
    </AuthLayout>
  );
};

export const VerifyEmailPage = () => {
  useDocumentTitle('Verify email');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const verify = useMutation({ mutationFn: verifyEmail });
  const started = useRef(false);

  useEffect(() => {
    if (token && !started.current) {
      started.current = true;
      verify.mutate(token);
    }
  }, [token, verify]);

  return (
    <AuthLayout title="Verify your email">
      <p className="text-gray-700">
        {!token
          ? 'This verification link is invalid.'
          : verify.isSuccess
            ? 'Your email is verified. Thank you!'
            : verify.isError
              ? verify.error.message
              : 'Verifying…'}
      </p>
      <Link to="/" className="mt-6 block text-center text-sm font-semibold underline">
        Browse churches
      </Link>
    </AuthLayout>
  );
};
