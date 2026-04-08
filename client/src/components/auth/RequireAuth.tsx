import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthSession } from '@/hooks/useAuth';

type RequireAuthProps = {
  children: ReactNode;
};

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const location = useLocation();
  const { error, isLoading, refetch, user } = useAuthSession();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-16">
        <div className="rounded-[28px] border border-border bg-card px-6 py-8 text-center shadow-airbnb-subtle">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">
            Checking session
          </p>
          <p className="mt-3 text-base text-muted-foreground">
            Making sure your account is ready before we open this page.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-16">
        <div className="max-w-md rounded-[28px] border border-border bg-card p-8 text-center shadow-airbnb-subtle">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">
            Session unavailable
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            We couldn&apos;t verify your account right now.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{error.message}</p>
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            className="mt-6 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-colors hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        replace
        to="/login"
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        }}
      />
    );
  }

  return <>{children}</>;
};
