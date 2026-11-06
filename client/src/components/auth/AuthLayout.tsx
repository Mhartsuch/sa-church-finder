import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useCurrentUser } from '@/hooks/useAuth';
import { buildAuthPageHref } from '@/lib/auth-redirect';

export const AuthLayout = ({ title, children }: { title: string; children: ReactNode }) => (
  <main className="flex justify-center px-6 py-12 sm:py-20">
    <div className="w-full max-w-[568px] rounded-2xl border border-gray-300">
      <h1 className="border-b border-gray-200 py-5 text-center font-semibold">{title}</h1>
      <div className="p-6">{children}</div>
    </div>
  </main>
);

export const Field = ({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block rounded-lg border border-gray-400 px-3 py-2 focus-within:border-2 focus-within:border-gray-900">
    <span className="block text-xs text-gray-500">{label}</span>
    <input {...props} className="w-full bg-transparent text-base outline-none" />
  </label>
);

export const PrimaryButton = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className="w-full rounded-lg bg-brand-gradient py-3.5 font-semibold text-white disabled:opacity-60"
  >
    {children}
  </button>
);

export const FormError = ({ error }: { error: Error | null | undefined }) =>
  error ? (
    <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      {error.message}
    </p>
  ) : null;

/** Redirects anonymous visitors to log in, then back. */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { data: user, isPending } = useCurrentUser();
  const location = useLocation();
  if (isPending) return <div className="min-h-[60vh]" />;
  if (!user) {
    return (
      <Navigate
        to={buildAuthPageHref('/login', `${location.pathname}${location.search}`)}
        replace
      />
    );
  }
  return <>{children}</>;
};
