import { act, fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginPage, RegisterPage } from '@/pages/AuthPages';
import { renderWithProviders } from '@/test-utils';

const login = vi.fn();
const register = vi.fn();
const user = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  avatarUrl: null,
  emailVerified: false,
  createdAt: '',
};

vi.mock('@/api/auth', () => ({
  login: (input: unknown) => login(input),
  register: (input: unknown) => register(input),
  fetchCurrentUser: () => Promise.resolve(null),
}));

describe('auth pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in and returns to the original page', async () => {
    login.mockResolvedValue(user);
    renderWithProviders(<LoginPage />, { route: '/login?returnTo=%2Fwishlists' });

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    });

    expect(login).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'secret123' });
    expect(screen.getByTestId('location').textContent).toBe('/wishlists');
  });

  it('shows API errors', async () => {
    login.mockRejectedValue(new Error('Invalid email or password'));
    renderWithProviders(<LoginPage />, { route: '/login' });

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('shows Google OAuth errors from the callback', () => {
    renderWithProviders(<LoginPage />, { route: '/login?authError=google_denied' });
    expect(screen.getByRole('alert')).toHaveTextContent('Google sign-in was canceled');
  });

  it('registers a new member', async () => {
    register.mockResolvedValue(user);
    renderWithProviders(<RegisterPage />, { route: '/register' });

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'longpassword' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Agree and continue' }));
    });

    expect(register).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'longpassword',
    });
    expect(screen.getByTestId('location').textContent).toBe('/');
  });
});
