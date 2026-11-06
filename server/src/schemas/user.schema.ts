import { z } from 'zod'

const userIdParams = z.object({ id: z.string().min(1) }).passthrough()
const emptyObject = z.object({}).passthrough()

export const userSavedChurchesSchema = z.object({
  params: userIdParams,
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
  }),
  body: emptyObject,
})

export const userReviewsSchema = z.object({
  params: userIdParams,
  query: emptyObject,
  body: emptyObject,
})

export const updateProfileSchema = z.object({
  params: userIdParams,
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(100, 'Name must be 100 characters or fewer'),
  }),
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be 72 characters or fewer'),
  }),
})

export const deleteAccountSchema = z.object({
  params: userIdParams,
  body: z.object({ password: z.string().optional() }).default({}),
})

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>['body']
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>['body']
export type DeleteAccountBody = z.infer<typeof deleteAccountSchema>['body']
