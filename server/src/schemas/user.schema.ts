import { z } from 'zod'

export const userSavedChurchesSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})
