export type AppRole = 'user' | 'church_admin' | 'site_admin'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: AppRole
  emailVerified: boolean
  createdAt: Date
}
