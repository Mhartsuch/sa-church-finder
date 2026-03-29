import { z } from 'zod'

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Please provide a valid email address')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or fewer')

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be 100 characters or fewer')

export const authRegisterSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
  }),
})

export const authLoginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
})

export const authForgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
})

export const authResetPasswordSchema = z.object({
  body: z.object({
    token: z.string().trim().min(1, 'Password reset token is required'),
    password: passwordSchema,
  }),
})

export const authResendVerificationSchema = z.object({
  body: z.object({}).passthrough(),
})

export const authVerifyEmailSchema = z.object({
  body: z.object({
    token: z.string().trim().min(1, 'Email verification token is required'),
  }),
})

export type AuthRegisterBody = z.infer<typeof authRegisterSchema>['body']
export type AuthLoginBody = z.infer<typeof authLoginSchema>['body']
export type AuthForgotPasswordBody = z.infer<typeof authForgotPasswordSchema>['body']
export type AuthResetPasswordBody = z.infer<typeof authResetPasswordSchema>['body']
export type AuthVerifyEmailBody = z.infer<typeof authVerifyEmailSchema>['body']

export type AuthGoogleOAuthCallbackInput = {
  code: string
  redirectUri: string
}
