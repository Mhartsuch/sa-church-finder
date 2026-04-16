import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  changePassword,
  deactivateAccount,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from './auth';

const fetchMock = vi.fn();

describe('account api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  describe('updateProfile', () => {
    it('sends PATCH request to /users/:id/profile with correct body and returns the result', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () =>
          JSON.stringify({
            data: {
              user: {
                id: 'user-1',
                email: 'user@example.com',
                name: 'Updated Name',
                avatarUrl: null,
                role: 'user',
                emailVerified: true,
                createdAt: '2026-03-28T00:00:00.000Z',
              },
              emailChanged: false,
            },
          }),
      } as Response);

      const result = await updateProfile('user-1', { name: 'Updated Name' });

      expect(result.user.name).toBe('Updated Name');
      expect(result.emailChanged).toBe(false);

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      const headers = new Headers(options.headers);

      expect(url).toBe('/api/v1/users/user-1/profile');
      expect(options.method).toBe('PATCH');
      expect(options.credentials).toBe('include');
      expect(options.body).toBe(JSON.stringify({ name: 'Updated Name' }));
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Accept')).toBe('application/json');
    });

    it('handles email change result with emailChanged true and previewUrl', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () =>
          JSON.stringify({
            data: {
              user: {
                id: 'user-1',
                email: 'old@example.com',
                name: 'Test User',
                avatarUrl: null,
                role: 'user',
                emailVerified: true,
                createdAt: '2026-03-28T00:00:00.000Z',
              },
              emailChanged: true,
              previewUrl: 'http://localhost:5173/verify-email?token=preview-token',
            },
          }),
      } as Response);

      const result = await updateProfile('user-1', { email: 'new@example.com' });

      expect(result.emailChanged).toBe(true);
      expect(result.previewUrl).toBe('http://localhost:5173/verify-email?token=preview-token');
      expect(result.user.email).toBe('old@example.com');

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/v1/users/user-1/profile');
      expect(options.method).toBe('PATCH');
      expect(options.body).toBe(JSON.stringify({ email: 'new@example.com' }));
    });
  });

  describe('changePassword', () => {
    it('sends POST request to /auth/change-password with correct body', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () =>
          JSON.stringify({
            data: null,
            message: 'Password changed successfully',
          }),
      } as Response);

      await expect(
        changePassword({
          currentPassword: 'oldpass123',
          newPassword: 'newpass456',
        }),
      ).resolves.toBeUndefined();

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/v1/auth/change-password');
      expect(options.method).toBe('POST');
      expect(options.credentials).toBe('include');
      expect(options.body).toBe(
        JSON.stringify({
          currentPassword: 'oldpass123',
          newPassword: 'newpass456',
        }),
      );
    });

    it('throws on error when current password is wrong', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () =>
          JSON.stringify({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Current password is incorrect',
            },
          }),
      } as Response);

      await expect(
        changePassword({
          currentPassword: 'wrongpass',
          newPassword: 'newpass456',
        }),
      ).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('uploadAvatar', () => {
    it('sends POST request with FormData and returns updated user', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () =>
          JSON.stringify({
            data: {
              id: 'user-1',
              email: 'user@example.com',
              name: 'Test User',
              avatarUrl: '/uploads/avatars/user-1.jpg',
              role: 'user',
              emailVerified: true,
              createdAt: '2026-03-28T00:00:00.000Z',
            },
          }),
      } as Response);

      const file = new File(['avatar-data'], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      const user = await uploadAvatar('user-1', file);

      expect(user.avatarUrl).toBe('/uploads/avatars/user-1.jpg');
      expect(user.id).toBe('user-1');

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/v1/users/user-1/avatar');
      expect(options.method).toBe('POST');
      expect(options.credentials).toBe('include');
      expect(options.body).toBeInstanceOf(FormData);

      const formData = options.body as FormData;
      expect(formData.get('avatar')).toBeInstanceOf(File);
      expect((formData.get('avatar') as File).name).toBe('avatar.jpg');
    });

    it('does not set Content-Type to application/json when skipJsonContentType is used', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () =>
          JSON.stringify({
            data: {
              id: 'user-1',
              email: 'user@example.com',
              name: 'Test User',
              avatarUrl: '/uploads/avatars/user-1.jpg',
              role: 'user',
              emailVerified: true,
              createdAt: '2026-03-28T00:00:00.000Z',
            },
          }),
      } as Response);

      const file = new File(['avatar-data'], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      await uploadAvatar('user-1', file);

      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      const headers = new Headers(options.headers);

      expect(headers.get('Content-Type')).toBeNull();
      expect(headers.get('Accept')).toBe('application/json');
    });
  });

  describe('removeAvatar', () => {
    it('sends DELETE request to /users/:id/avatar and returns updated user', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () =>
          JSON.stringify({
            data: {
              id: 'user-1',
              email: 'user@example.com',
              name: 'Test User',
              avatarUrl: null,
              role: 'user',
              emailVerified: true,
              createdAt: '2026-03-28T00:00:00.000Z',
            },
          }),
      } as Response);

      const user = await removeAvatar('user-1');

      expect(user.avatarUrl).toBeNull();
      expect(user.id).toBe('user-1');

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/v1/users/user-1/avatar');
      expect(options.method).toBe('DELETE');
      expect(options.credentials).toBe('include');
    });
  });

  describe('deactivateAccount', () => {
    it('sends POST request with password to /users/:id/deactivate', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () =>
          JSON.stringify({
            data: null,
            message: 'Account deactivated',
          }),
      } as Response);

      await expect(
        deactivateAccount('user-1', { password: 'mypassword' }),
      ).resolves.toBeUndefined();

      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/v1/users/user-1/deactivate');
      expect(options.method).toBe('POST');
      expect(options.credentials).toBe('include');
      expect(options.body).toBe(JSON.stringify({ password: 'mypassword' }));
    });
  });
});
