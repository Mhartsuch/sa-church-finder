import { z } from 'zod'

export const createCollectionSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Collection name is required')
      .max(100, 'Collection name must be 100 characters or fewer'),
    description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
    isPublic: z.boolean().optional(),
  }),
})

export const updateCollectionSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Collection name is required')
      .max(100, 'Collection name must be 100 characters or fewer')
      .optional(),
    description: z
      .string()
      .max(500, 'Description must be 500 characters or fewer')
      .nullable()
      .optional(),
    isPublic: z.boolean().optional(),
  }),
})

export const collectionIdSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
})

export const addChurchToCollectionSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
      churchId: z.string().min(1),
    })
    .passthrough(),
  body: z.object({
    notes: z.string().max(500, 'Notes must be 500 characters or fewer').optional(),
  }),
})

export const removeChurchFromCollectionSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
      churchId: z.string().min(1),
    })
    .passthrough(),
})

export const userCollectionsSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
})

export const userPassportSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
})

export type CreateCollectionBody = z.infer<typeof createCollectionSchema>['body']
export type UpdateCollectionBody = z.infer<typeof updateCollectionSchema>['body']
