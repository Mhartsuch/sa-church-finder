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

export interface ApiEnvelope<T> {
  data: T
  message?: string
}
