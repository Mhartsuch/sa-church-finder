import { apiRequest, ApiRequestError } from '@/lib/api-client';
import {
  ApiEnvelope,
  AuthUser,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '@/types/auth';

const post = <T>(path: string, body?: unknown) =>
  apiRequest<ApiEnvelope<T>>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    return (await apiRequest<ApiEnvelope<AuthUser>>('/auth/me')).data;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) return null;
    throw error;
  }
};

export const login = async (input: LoginInput) => (await post<AuthUser>('/auth/login', input)).data;

export const register = async (input: RegisterInput) =>
  (await post<AuthUser>('/auth/register', input)).data;

export const logout = async () => {
  await post('/auth/logout');
};

export const requestPasswordReset = async (email: string) => {
  await post('/auth/forgot-password', { email });
};

export const resetPassword = async (input: ResetPasswordInput) => {
  await post('/auth/reset-password', input);
};

export const changePassword = async (input: ChangePasswordInput) => {
  await post('/auth/change-password', input);
};

export const verifyEmail = async (token: string) => {
  await post('/auth/verify-email', { token });
};

export const resendVerificationEmail = async () => {
  await post('/auth/verify-email/resend');
};

export const updateProfile = async (userId: string, name: string): Promise<AuthUser> => {
  const envelope = await apiRequest<ApiEnvelope<AuthUser>>(
    `/users/${encodeURIComponent(userId)}/profile`,
    { method: 'PATCH', body: JSON.stringify({ name }) },
  );
  return envelope.data;
};

export const deleteAccount = async (userId: string, password?: string) => {
  await apiRequest(`/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    body: JSON.stringify(password ? { password } : {}),
  });
};
