import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import LoginPage from './LoginPage';

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: () => ({ user: null, isLoading: false }),
  useLogin: () => ({
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

const renderLoginPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('LoginPage', () => {
  it('renders the login heading', () => {
    renderLoginPage();

    expect(
      screen.getByRole('heading', { name: /pick up where you left off/i }),
    ).toBeInTheDocument();
  });

  it('shows email and password fields', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows the submit button', () => {
    renderLoginPage();

    expect(screen.getByRole('button', { name: /log in|sign in/i })).toBeInTheDocument();
  });

  it('shows the Google auth button', () => {
    renderLoginPage();

    expect(screen.getByTestId('google-auth')).toBeInTheDocument();
  });

  it('has a link to create an account', () => {
    renderLoginPage();

    expect(screen.getByText(/Create one/i)).toBeInTheDocument();
  });

  it('has a link to forgot password', () => {
    renderLoginPage();

    expect(screen.getByText(/forgot.*password/i)).toBeInTheDocument();
  });
});
