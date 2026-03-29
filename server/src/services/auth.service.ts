import bcrypt from 'bcryptjs'
import { Prisma, Role } from '@prisma/client'

import prisma from '../lib/prisma.js'
import { AppError, AuthError } from '../middleware/error-handler.js'
import { AuthLoginBody, AuthRegisterBody } from '../schemas/auth.schema.js'
import { AppRole, AuthUser } from '../types/auth.types.js'

const authUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  role: true,
  emailVerified: true,
  createdAt: true,
})

const authUserWithPasswordSelect = Prisma.validator<Prisma.UserSelect>()({
  ...authUserSelect,
  passwordHash: true,
})

type AuthUserRecord = Prisma.UserGetPayload<{ select: typeof authUserSelect }>
type AuthUserWithPasswordRecord = Prisma.UserGetPayload<{
  select: typeof authUserWithPasswordSelect
}>

function mapRole(role: Role): AppRole {
  return role.toLowerCase() as AppRole
}

function toAuthUser(user: AuthUserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: mapRole(user.role),
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  }
}

export async function registerUser(input: AuthRegisterBody): Promise<AuthUser> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  })

  if (existingUser) {
    throw new AppError(409, 'CONFLICT', 'An account with that email already exists')
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      name: input.name,
      emailVerified: false,
    },
    select: authUserSelect,
  })

  return toAuthUser(user)
}

export async function authenticateUser(input: AuthLoginBody): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: authUserWithPasswordSelect,
  })

  if (!user?.passwordHash) {
    throw new AuthError('Invalid email or password')
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)

  if (!passwordMatches) {
    throw new AuthError('Invalid email or password')
  }

  return toAuthUser(user as AuthUserWithPasswordRecord)
}

export async function getCurrentUser(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: authUserSelect,
  })

  return user ? toAuthUser(user) : null
}
