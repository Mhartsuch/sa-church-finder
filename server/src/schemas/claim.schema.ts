import { z } from 'zod'

export const createChurchClaimSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    roleTitle: z.string().trim().min(2).max(120),
    verificationEmail: z.string().trim().email().max(320),
  }),
})

export const resolveChurchClaimSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    status: z.enum(['approved', 'rejected']),
  }),
})

export type CreateChurchClaimBody = z.infer<typeof createChurchClaimSchema>['body']
export type ResolveChurchClaimBody = z.infer<typeof resolveChurchClaimSchema>['body']
