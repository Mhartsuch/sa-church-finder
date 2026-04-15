import { z } from 'zod'

export const uploadChurchPhotoSchema = z.object({
  params: z
    .object({
      churchId: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      altText: z.string().trim().max(300).optional(),
    })
    .passthrough(),
})

export const updateChurchPhotoSchema = z.object({
  params: z
    .object({
      photoId: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    altText: z.union([z.string().trim().max(300), z.null()]),
  }),
})

export const reorderChurchPhotosSchema = z.object({
  params: z
    .object({
      churchId: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    ordering: z
      .array(
        z.object({
          photoId: z.string().min(1),
          displayOrder: z.number().int().min(0),
        }),
      )
      .min(1)
      .max(50),
  }),
})

export const deleteChurchPhotoSchema = z.object({
  params: z
    .object({
      photoId: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export const churchPhotoParamsSchema = z.object({
  params: z
    .object({
      churchId: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export type UploadChurchPhotoBody = z.infer<typeof uploadChurchPhotoSchema>['body']
export type UpdateChurchPhotoBody = z.infer<typeof updateChurchPhotoSchema>['body']
export type ReorderChurchPhotosBody = z.infer<typeof reorderChurchPhotosSchema>['body']
