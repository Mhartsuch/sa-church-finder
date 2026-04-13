import { Prisma, RibbonCategoryFilterType, RibbonCategorySource } from '@prisma/client'

import prisma from '../lib/prisma.js'
import { ConflictError, NotFoundError } from '../middleware/error-handler.js'
import type {
  IAutoGenerateInput,
  IAutoGenerateResult,
  ICreateRibbonCategoryInput,
  IDeleteRibbonCategoryResult,
  IRibbonCategory,
  IUpdateRibbonCategoryInput,
} from '../types/ribbon-category.types.js'

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface RibbonCategoryCache {
  payload: IRibbonCategory[]
  expiresAt: number
}

let ribbonCategoryCache: RibbonCategoryCache | null = null
const RIBBON_CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function invalidateRibbonCategoryCache(): void {
  ribbonCategoryCache = null
}

// ---------------------------------------------------------------------------
// Denomination icon mapping (used by auto-generate)
// ---------------------------------------------------------------------------

const DENOMINATION_ICONS: Record<string, string> = {
  catholic: '✝️',
  baptist: '💧',
  methodist: '✨',
  episcopal: '🌅',
  anglican: '🌅',
  lutheran: '🌿',
  'non-denominational': '🌳',
  presbyterian: '📜',
  pentecostal: '🔥',
  orthodox: '☦️',
  adventist: '🌄',
}

const DEFAULT_DENOMINATION_ICON = '⛪'

function iconForDenomination(value: string): string {
  return DENOMINATION_ICONS[value.toLowerCase()] ?? DEFAULT_DENOMINATION_ICON
}

// ---------------------------------------------------------------------------
// Slug helper
// ---------------------------------------------------------------------------

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---------------------------------------------------------------------------
// Public — read
// ---------------------------------------------------------------------------

export async function getVisibleRibbonCategories(): Promise<IRibbonCategory[]> {
  const now = Date.now()

  if (ribbonCategoryCache && ribbonCategoryCache.expiresAt > now) {
    return ribbonCategoryCache.payload
  }

  const categories = await prisma.ribbonCategory.findMany({
    where: { isVisible: true },
    orderBy: { position: 'asc' },
  })

  ribbonCategoryCache = {
    payload: categories,
    expiresAt: now + RIBBON_CATEGORY_CACHE_TTL_MS,
  }

  return categories
}

// ---------------------------------------------------------------------------
// Admin — CRUD
// ---------------------------------------------------------------------------

export async function getAllRibbonCategories(): Promise<IRibbonCategory[]> {
  return prisma.ribbonCategory.findMany({
    orderBy: { position: 'asc' },
  })
}

export async function createRibbonCategory(
  input: ICreateRibbonCategoryInput,
): Promise<IRibbonCategory> {
  const slug = input.slug ?? toSlug(input.label)

  const existing = await prisma.ribbonCategory.findUnique({ where: { slug } })
  if (existing) {
    throw new ConflictError(`A ribbon category with slug "${slug}" already exists`)
  }

  // Default position: place after the last existing category
  let position = input.position
  if (position === undefined) {
    const last = await prisma.ribbonCategory.findFirst({
      orderBy: { position: 'desc' },
      select: { position: true },
    })
    position = (last?.position ?? -1) + 1
  }

  const category = await prisma.ribbonCategory.create({
    data: {
      label: input.label.trim(),
      icon: input.icon ?? DEFAULT_DENOMINATION_ICON,
      slug,
      filterType: input.filterType,
      filterValue: input.filterValue.trim(),
      position,
      isVisible: input.isVisible ?? true,
      isPinned: input.isPinned ?? false,
      source: RibbonCategorySource.MANUAL,
    },
  })

  invalidateRibbonCategoryCache()
  return category
}

export async function updateRibbonCategory(
  id: string,
  input: IUpdateRibbonCategoryInput,
): Promise<IRibbonCategory> {
  const existing = await prisma.ribbonCategory.findUnique({ where: { id } })
  if (!existing) {
    throw new NotFoundError('Ribbon category not found')
  }

  const data: Prisma.RibbonCategoryUpdateInput = {}

  if (input.label !== undefined) data.label = input.label.trim()
  if (input.icon !== undefined) data.icon = input.icon
  if (input.filterType !== undefined) data.filterType = input.filterType
  if (input.filterValue !== undefined) data.filterValue = input.filterValue.trim()
  if (input.position !== undefined) data.position = input.position
  if (input.isVisible !== undefined) data.isVisible = input.isVisible
  if (input.isPinned !== undefined) data.isPinned = input.isPinned

  const category = await prisma.ribbonCategory.update({ where: { id }, data })

  invalidateRibbonCategoryCache()
  return category
}

export async function deleteRibbonCategory(id: string): Promise<IDeleteRibbonCategoryResult> {
  const existing = await prisma.ribbonCategory.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) {
    throw new NotFoundError('Ribbon category not found')
  }

  await prisma.ribbonCategory.delete({ where: { id } })

  invalidateRibbonCategoryCache()
  return { id, deleted: true }
}

// ---------------------------------------------------------------------------
// Admin — reorder
// ---------------------------------------------------------------------------

export async function reorderRibbonCategories(ids: string[]): Promise<IRibbonCategory[]> {
  // Verify all IDs exist
  const existing = await prisma.ribbonCategory.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  })
  const existingIds = new Set(existing.map((c) => c.id))
  const missing = ids.filter((id) => !existingIds.has(id))
  if (missing.length > 0) {
    throw new NotFoundError(`Ribbon categories not found: ${missing.join(', ')}`)
  }

  // Update positions in a transaction
  await prisma.$transaction(
    ids.map((id, index) => prisma.ribbonCategory.update({ where: { id }, data: { position: index } })),
  )

  invalidateRibbonCategoryCache()
  return prisma.ribbonCategory.findMany({ orderBy: { position: 'asc' } })
}

// ---------------------------------------------------------------------------
// Admin — auto-generate
// ---------------------------------------------------------------------------

const DEFAULT_AUTO_GENERATE_LIMIT = 6

export async function autoGenerateRibbonCategories(
  input: IAutoGenerateInput,
): Promise<IAutoGenerateResult> {
  const limit = input.limit ?? DEFAULT_AUTO_GENERATE_LIMIT

  // 1. Get top denominations by church count
  const denomCounts = await prisma.church.groupBy({
    by: ['denomination'],
    _count: { denomination: true },
    where: { denomination: { not: null } },
    orderBy: { _count: { denomination: 'desc' } },
    take: limit + 10, // fetch extra to account for already-covered ones
  })

  // 2. Get existing manual/pinned categories that cover denominations
  const existingCategories = await prisma.ribbonCategory.findMany({
    where: {
      filterType: RibbonCategoryFilterType.DENOMINATION,
      OR: [{ source: RibbonCategorySource.MANUAL }, { isPinned: true }],
    },
    select: { filterValue: true },
  })
  const coveredDenominations = new Set(
    existingCategories.map((c) => c.filterValue.toLowerCase()),
  )

  // 3. Get existing AUTO (non-pinned) denomination categories
  const existingAutoCategories = await prisma.ribbonCategory.findMany({
    where: {
      filterType: RibbonCategoryFilterType.DENOMINATION,
      source: RibbonCategorySource.AUTO,
      isPinned: false,
    },
  })
  const autoByDenom = new Map(
    existingAutoCategories.map((c) => [c.filterValue.toLowerCase(), c]),
  )

  // 4. Determine the highest existing position for appending new ones
  const lastCategory = await prisma.ribbonCategory.findFirst({
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  let nextPosition = (lastCategory?.position ?? -1) + 1

  // 5. Walk the top denominations and create/update AUTO categories
  let created = 0
  let updated = 0
  const keptDenoms = new Set<string>()

  for (const row of denomCounts) {
    if (keptDenoms.size >= limit) break
    const denomName = row.denomination as string
    const denomLower = denomName.toLowerCase()

    // Skip if already covered by a manual/pinned category
    if (coveredDenominations.has(denomLower)) continue

    keptDenoms.add(denomLower)

    const existingAuto = autoByDenom.get(denomLower)
    if (existingAuto) {
      // Already exists as AUTO — ensure it's visible
      if (!existingAuto.isVisible) {
        await prisma.ribbonCategory.update({
          where: { id: existingAuto.id },
          data: { isVisible: true },
        })
        updated++
      }
    } else {
      // Create a new AUTO category
      const slug = `denom-${toSlug(denomName)}`
      const existingSlug = await prisma.ribbonCategory.findUnique({
        where: { slug },
        select: { id: true },
      })
      if (!existingSlug) {
        await prisma.ribbonCategory.create({
          data: {
            label: denomName,
            icon: iconForDenomination(denomName),
            slug,
            filterType: RibbonCategoryFilterType.DENOMINATION,
            filterValue: denomName,
            position: nextPosition++,
            isVisible: true,
            source: RibbonCategorySource.AUTO,
            isPinned: false,
          },
        })
        created++
      }
    }
  }

  // 6. Remove AUTO (non-pinned) denomination categories no longer in top-N
  let removed = 0
  for (const [denomLower, autoCategory] of autoByDenom) {
    if (!keptDenoms.has(denomLower)) {
      await prisma.ribbonCategory.delete({ where: { id: autoCategory.id } })
      removed++
    }
  }

  invalidateRibbonCategoryCache()
  return { created, updated, removed }
}
