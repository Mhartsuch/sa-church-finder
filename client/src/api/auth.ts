import { apiRequest, ApiRequestError } from '@/lib/api-client'
import {
  ApiEnvelope,
  AuthCredentials,
  AuthRegisterInput,
  AuthUser,
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

export const logoutUser = async (): Promise<void> => {
  await apiRequest<ApiEnvelope<null>>('/auth/logout', {
    method: 'POST',
  })
}
