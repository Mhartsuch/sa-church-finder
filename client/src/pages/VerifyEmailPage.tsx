import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { useAuthSession, useVerifyEmail } from '@/hooks/useAuth';
import { useDocumentHead } from '@/hooks/useDocumentHead';
import { VerifyEmailResult } from '@/types/auth';

const VerifyEmailPage = () => {
  useDocumentHead({ title: 'Verify Email', noindex: true });

  const { isLoading, user } = useAuthSession();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const verifyEmailMutation = useVerifyEmail();
  const [hasStarted, setHasStarted] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerifyEmailResult | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const fallbackPath = user || isLoading ? '/account' : '/login';
  const fallbackLabel = user || isLoading ? 'Go to your account' : 'Go to sign in';

  useEffect(() => {
    if (!token || hasStarted) {
      return;
    }

    setHasStarted(true);
    setVerificationError(null);

    void verifyEmailMutation
      .mutateAsync({ token })
      .then((result) => {
        setVerificationResult(result);
      })
      .catch((error) => {
        setVerificationError(
          error instanceof Error ? error.message : 'Unable to verify your email right now.',
        );
      });
  }, [hasStarted, token, verifyEmailMutation]);

  return (
    <AuthPageShell
      eyebrow="Verify your email"
      title="Confirm your address and keep your account in good standing."
      description="This screen consumes the verification token from your email link and updates your account status once the token checks out."
      footer={
        <p>
          Need another link?{' '}
          <Link
            to={fallbackPath}
            className="font-semibold text-foreground underline underline-offset-4"
          >
            {fallbackLabel}
          </Link>
          .
        </p>
      }
    >
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">
          Email verification
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Finalize verification.
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Once this succeeds, your account badge and future auth flows will reflect that the address
          has been confirmed.
        </p>
      </div>

      {!token ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-[28px] border border-[#ffc2cc] bg-[#fff0f3] p-5 text-sm leading-6 text-[#a8083a]">
            This verification link is incomplete or malformed. Request a fresh link from your
            account area and try again.
          </div>

          <Link
            to={fallbackPath}
            className="inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            {fallbackLabel}
          </Link>
        </div>
      ) : verifyEmailMutation.isPending ? (
        <div className="mt-8 rounded-[28px] border border-border bg-card p-5 text-sm leading-6 text-muted-foreground">
          Verifying your email now...
        </div>
      ) : verificationError ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-[28px] border border-[#ffc2cc] bg-[#fff0f3] p-5 text-sm leading-6 text-[#a8083a]">
            {verificationError}
          </div>

          <Link
            to={fallbackPath}
            className="inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            {user ? 'Back to account' : 'Back to sign in'}
          </Link>
        </div>
      ) : verificationResult ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-[28px] border border-[#b7ebcd] bg-[#f2fbf6] p-5 text-sm leading-6 text-[#1f5132]">
            {verificationResult.status === 'already-verified'
              ? 'This email address was already verified, so you are all set.'
              : 'Your email address has been verified successfully.'}
          </div>

          <Link
            to={user ? '/account' : '/login'}
            className="inline-flex rounded-full bg-[#FF385C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00838]"
          >
            {user ? 'Return to account' : 'Go to sign in'}
          </Link>
        </div>
      ) : null}
    </AuthPageShell>
  );
};

export default VerifyEmailPage;
