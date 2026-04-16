import { z } from 'zod'

export const createRibbonCategorySchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    label: z.string().trim().min(1).max(50),
    icon: z.string().trim().max(10).optional(),
    slug: z
      .string()
      .trim()
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional(),
    filterType: z.enum(['QUERY', 'DENOMINATION']),
    filterValue: z.string().trim().min(1).max(100),
    position: z.number().int().min(0).optional(),
    isVisible: z.boolean().optional(),
    isPinned: z.boolean().optional(),
  }),
})

export const updateRibbonCategorySchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      label: z.string().trim().min(1).max(50).optional(),
      icon: z.string().trim().max(10).optional(),
      filterType: z.enum(['QUERY', 'DENOMINATION']).optional(),
      filterValue: z.string().trim().min(1).max(100).optional(),
      position: z.number().int().min(0).optional(),
      isVisible: z.boolean().optional(),
      isPinned: z.boolean().optional(),
    })
    .refine((value) => Object.values(value).some((field) => field !== undefined), {
      message: 'At least one field is required',
    }),
})

export const ribbonCategoryIdSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export const reorderRibbonCategoriesSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    ids: z.array(z.string().min(1)).min(1).max(100),
  }),
})

export const autoGenerateRibbonCategoriesSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    limit: z.number().int().min(1).max(20).optional(),
  }),
})

export type CreateRibbonCategoryBody = z.infer<typeof createRibbonCategorySchema>['body']
export type UpdateRibbonCategoryBody = z.infer<typeof updateRibbonCategorySchema>['body']
export type ReorderRibbonCategoriesBody = z.infer<typeof reorderRibbonCategoriesSchema>['body']
export type AutoGenerateRibbonCategoriesBody = z.infer<
  typeof autoGenerateRibbonCategoriesSchema
>['body']
