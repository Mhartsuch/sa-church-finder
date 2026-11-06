import { act, fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChurchCard } from '@/components/church/ChurchCard';
import { makeChurch, renderWithProviders } from '@/test-utils';

const fetchCurrentUser = vi.fn();
const toggleSaved = vi.fn();

vi.mock('@/api/auth', () => ({ fetchCurrentUser: () => fetchCurrentUser() }));
vi.mock('@/api/churches', () => ({ toggleSaved: (id: string) => toggleSaved(id) }));

describe('ChurchCard', () => {
  beforeEach(() => {
    fetchCurrentUser.mockReset();
    toggleSaved.mockReset();
  });

  it('shows photos, name, subtitle, Google rating fallback, and a profile link', () => {
    fetchCurrentUser.mockResolvedValue(null);
    renderWithProviders(<ChurchCard church={makeChurch()} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/churches/grace-community-church');
    expect(screen.getByText('Grace Community Church')).toBeInTheDocument();
    expect(screen.getByText('Downtown · Baptist')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByAltText('Sanctuary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next photo' })).toBeInTheDocument();
  });

  it('shows a placeholder when the church has no photos', () => {
    fetchCurrentUser.mockResolvedValue(null);
    renderWithProviders(<ChurchCard church={makeChurch({ photos: [], coverImageUrl: null })} />);
    expect(screen.getByRole('img', { name: /photo coming soon/ })).toBeInTheDocument();
  });

  it('sends anonymous visitors to log in when they tap the heart', async () => {
    fetchCurrentUser.mockResolvedValue(null);
    renderWithProviders(<ChurchCard church={makeChurch()} />, { route: '/?kids=1' });
    await vi.waitFor(() => expect(fetchCurrentUser).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /save grace community church/i }));

    expect(screen.getByTestId('location').textContent).toBe('/login?returnTo=%2F%3Fkids%3D1');
    expect(toggleSaved).not.toHaveBeenCalled();
  });

  it('saves the church for signed-in users', async () => {
    fetchCurrentUser.mockResolvedValue({
      id: 'u1',
      name: 'Ana',
      email: 'a@x.co',
      avatarUrl: null,
      emailVerified: true,
      createdAt: '',
    });
    toggleSaved.mockResolvedValue({ churchId: 'church-1', saved: true });
    renderWithProviders(<ChurchCard church={makeChurch()} />);
    await screen.findByText('Grace Community Church');
    await vi.waitFor(() => expect(fetchCurrentUser).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save grace community church/i }));
    });

    expect(toggleSaved).toHaveBeenCalledWith('church-1');
  });
});
