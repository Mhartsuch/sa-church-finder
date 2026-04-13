export type AppRole = 'user' | 'church_admin' | 'site_admin'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: AppRole
  emailVerified: boolean
  createdAt: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthRegisterInput extends AuthCredentials {
  name: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ForgotPasswordResult {
  previewUrl?: string
}

export interface ResetPasswordInput {
  token: string
  password: string
}

export interface RequestEmailVerificationResult {
  status: 'sent' | 'already-verified'
  previewUrl?: string
}

export interface VerifyEmailInput {
  token: string
}

export interface VerifyEmailResult {
  status: 'verified' | 'already-verified'
}

export type { ApiEnvelope } from './api'
