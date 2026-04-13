import { z } from 'zod'

const userIdParams = z
  .object({
    id: z.string().min(1),
  })
  .passthrough()

export const userSavedChurchesSchema = z.object({
  params: userIdParams,
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export const userReviewsSchema = z.object({
  params: userIdParams,
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export const userClaimsSchema = z.object({
  params: userIdParams,
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

const emailSchema = z.string().trim().toLowerCase().email('Please provide a valid email address')

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be 100 characters or fewer')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or fewer')

export const updateProfileSchema = z.object({
  params: userIdParams,
  body: z
    .object({
      name: nameSchema.optional(),
      email: emailSchema.optional(),
    })
    .refine((data) => data.name !== undefined || data.email !== undefined, {
      message: 'At least one field (name or email) is required',
    }),
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
})

export const uploadAvatarSchema = z.object({
  params: userIdParams,
})

export const removeAvatarSchema = z.object({
  params: userIdParams,
})

export const deactivateAccountSchema = z.object({
  params: userIdParams,
  body: z.object({
    password: z.string().optional(),
  }),
})

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>['body']
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>['body']
export type DeactivateAccountBody = z.infer<typeof deactivateAccountSchema>['body']
