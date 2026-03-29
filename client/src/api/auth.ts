import { apiRequest, ApiRequestError } from '@/lib/api-client'
import {
  ApiEnvelope,
  AuthCredentials,
  ForgotPasswordInput,
  ForgotPasswordResult,
  AuthRegisterInput,
  RequestEmailVerificationResult,
  ResetPasswordInput,
  AuthUser,
  VerifyEmailInput,
  VerifyEmailResult,
} from '@/types/auth'

type AuthEnvelope = ApiEnvelope<AuthUser>

export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const envelope = await apiRequest<AuthEnvelope>('/auth/me')
    return envelope.data
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return null
    }

    throw error
  }
}

export const loginUser = async (input: AuthCredentials): Promise<AuthUser> => {
  const envelope = await apiRequest<AuthEnvelope>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return envelope.data
}

export const registerUser = async (input: AuthRegisterInput): Promise<AuthUser> => {
  const envelope = await apiRequest<AuthEnvelope>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return envelope.data
}

export const requestPasswordReset = async (
  input: ForgotPasswordInput,
): Promise<ForgotPasswordResult> => {
  const envelope = await apiRequest<ApiEnvelope<ForgotPasswordResult>>(
    '/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )

  return envelope.data ?? {}
}

export const requestEmailVerification = async (): Promise<RequestEmailVerificationResult> => {
  const envelope = await apiRequest<ApiEnvelope<RequestEmailVerificationResult>>(
    '/auth/verify-email/resend',
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
  )

  return envelope.data
}

export const verifyEmail = async (input: VerifyEmailInput): Promise<VerifyEmailResult> => {
  const envelope = await apiRequest<ApiEnvelope<VerifyEmailResult>>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return envelope.data
}

export const resetPassword = async (input: ResetPasswordInput): Promise<void> => {
  await apiRequest<ApiEnvelope<null>>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export const logoutUser = async (): Promise<void> => {
  await apiRequest<ApiEnvelope<null>>('/auth/logout', {
    method: 'POST',
  })
}
