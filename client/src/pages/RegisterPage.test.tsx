import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import RegisterPage from './RegisterPage';

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: () => ({ user: null, isLoading: false }),
  useRegister: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/lib/auth-redirect', () => ({
  buildAuthPageHref: (path: string) => path,
  buildGoogleAuthUrl: () => 'https://accounts.google.com/o/oauth2',
  resolveAuthRedirectPath: () => '/',
  resolveOAuthErrorMessage: () => null,
}));

vi.mock('@/components/auth/GoogleAuthButton', () => ({
  GoogleAuthButton: () => <button data-testid="google-auth">Continue with Google</button>,
}));

vi.mock('@/components/auth/AuthPageShell', () => ({
  AuthPageShell: ({
    children,
    footer,
  }: {
    children: React.ReactNode;
    footer?: React.ReactNode;
  }) => (
    <div>
      {children}
      {footer}
    </div>
  ),
}));

const renderRegisterPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/register']}>
        <RegisterPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('RegisterPage', () => {
  it('renders the register heading', () => {
    renderRegisterPage();

    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
  });

  it('shows name, email, and password fields', () => {
    renderRegisterPage();

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows the create account button', () => {
    renderRegisterPage();

    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows the Google auth button', () => {
    renderRegisterPage();

    expect(screen.getByTestId('google-auth')).toBeInTheDocument();
  });

  it('has a link to sign in for existing users', () => {
    renderRegisterPage();

    expect(screen.getByText(/Sign in instead/i)).toBeInTheDocument();
  });
});
