import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { useResetPassword } from '@/hooks/useAuth';

type ResetPasswordFormState = {
  password: string;
  confirmPassword: string;
};

const inputClasses =
  'mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-[#222] outline-none transition focus:border-[#FF385C] focus:ring-4 focus:ring-[#FF385C]/10';

const validateForm = (token: string, formState: ResetPasswordFormState): string | null => {
  if (!token) {
    return 'This reset link is missing its token. Request a new one.';
  }

  if (!formState.password) {
    return 'Password is required.';
  }

  if (formState.password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (formState.confirmPassword !== formState.password) {
    return 'Passwords do not match.';
  }

  return null;
};

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const resetPasswordMutation = useResetPassword();
  const [formState, setFormState] = useState<ResetPasswordFormState>({
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateForm(token, formState);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setFormError(null);

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        password: formState.password,
      });
      setIsComplete(true);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to reset your password right now.',
      );
    }
  };

  return (
    <AuthPageShell
      eyebrow="Choose a new password"
      title="Finish your reset and head back into your account."
      description="This screen accepts the secure reset token from your email link and swaps in a fresh password for future sign-ins."
      footer={
        <p>
          Need a fresh link?{' '}
          <Link
            to="/forgot-password"
            className="font-semibold text-[#222] underline underline-offset-4"
          >
            Request another reset email
          </Link>
          .
        </p>
      }
    >
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">
          Reset password
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#222]">Set a new password.</h1>
        <p className="text-sm leading-6 text-[#5c5650]">
          You&apos;ll use this new password the next time you sign in. The reset does not
          automatically log you into the app.
        </p>
      </div>

      {!token ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-[28px] border border-[#ffc2cc] bg-[#fff0f3] p-5 text-sm leading-6 text-[#a8083a]">
            This password reset link is incomplete or malformed. Request a new link to keep going.
          </div>

          <Link
            to="/forgot-password"
            className="inline-flex rounded-full bg-[#222] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            Request a new link
          </Link>
        </div>
      ) : isComplete ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-[28px] border border-[#b7ebcd] bg-[#f2fbf6] p-5 text-sm leading-6 text-[#1f5132]">
            Your password has been updated. Head back to sign in with the new credentials whenever
            you&apos;re ready.
          </div>

          <Link
            to="/login"
            className="inline-flex rounded-full bg-[#FF385C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00838]"
          >
            Return to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-semibold text-[#222]">
            New password
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

          <label className="block text-sm font-semibold text-[#222]">
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              value={formState.confirmPassword}
              onChange={(event) => {
                setFormState((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }));
              }}
              className={inputClasses}
              placeholder="Re-enter your new password"
            />
          </label>

          {formError ? (
            <div className="rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]">
              {formError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full rounded-full bg-[#FF385C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00838] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {resetPasswordMutation.isPending ? 'Updating password...' : 'Update password'}
          </button>
        </form>
      )}
    </AuthPageShell>
  );
};

export default ResetPasswordPage;
