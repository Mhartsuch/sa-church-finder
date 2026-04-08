import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { useRequestPasswordReset } from '@/hooks/useAuth';
import { ForgotPasswordResult } from '@/types/auth';

type ForgotPasswordFormState = {
  email: string;
};

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

const inputClasses =
  'mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#d90b45] focus:ring-4 focus:ring-[#d90b45]/10';

const validateForm = ({ email }: ForgotPasswordFormState): string | null => {
  if (!email.trim()) {
    return 'Email is required.';
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Enter a valid email address.';
  }

  return null;
};

const ForgotPasswordPage = () => {
  const requestPasswordResetMutation = useRequestPasswordReset();
  const [formState, setFormState] = useState<ForgotPasswordFormState>({
    email: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successState, setSuccessState] = useState<{
    email: string;
    result: ForgotPasswordResult;
  } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateForm(formState);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setFormError(null);

    try {
      const normalizedEmail = formState.email.trim();
      const result = await requestPasswordResetMutation.mutateAsync({
        email: normalizedEmail,
      });

      setSuccessState({
        email: normalizedEmail,
        result,
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to start password recovery right now.',
      );
    }
  };

  return (
    <AuthPageShell
      eyebrow="Recover access"
      title="Reset your password without losing your saved churches."
      description="This flow issues a real reset token from the backend and lets you land back on a fresh password when you are ready."
      footer={
        <p>
          Remembered it after all?{' '}
          <Link to="/login" className="font-semibold text-[#1a1a1a] underline underline-offset-4">
            Go back to sign in
          </Link>
          .
        </p>
      }
    >
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d90b45]">
          Forgot password
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">Request a reset link.</h1>
        <p className="text-sm leading-6 text-[#5c5650]">
          Enter the email on your account and we&apos;ll start the reset flow. For security, the
          success message stays the same whether or not that email is registered.
        </p>
      </div>

      {successState ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-[28px] border border-[#b7ebcd] bg-[#f2fbf6] p-5 text-sm leading-6 text-[#1f5132]">
            If an account exists for <span className="font-semibold">{successState.email}</span>,
            password reset instructions are on the way.
          </div>

          {successState.result.previewUrl ? (
            <div className="rounded-[28px] border border-[#c9defa] bg-[#f5f9ff] p-5 text-sm leading-6 text-[#1d4ed8]">
              Development preview enabled:{' '}
              <a
                href={successState.result.previewUrl}
                className="font-semibold underline underline-offset-4"
              >
                open the reset link
              </a>
              .
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setSuccessState(null);
            }}
            className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-gray-50"
          >
            Send another link
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-semibold text-[#1a1a1a]">
            Email
            <input
              type="email"
              autoComplete="email"
              value={formState.email}
              onChange={(event) => {
                setFormState({
                  email: event.target.value,
                });
              }}
              className={inputClasses}
              placeholder="you@example.com"
            />
          </label>

          {formError ? (
            <div className="rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]">
              {formError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={requestPasswordResetMutation.isPending}
            className="w-full rounded-full bg-[#1a1a1a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {requestPasswordResetMutation.isPending
              ? 'Sending reset instructions...'
              : 'Send reset instructions'}
          </button>
        </form>
      )}
    </AuthPageShell>
  );
};

export default ForgotPasswordPage;
