import prisma from '../lib/prisma.js'
import { AppError, ConflictError, NotFoundError } from '../middleware/error-handler.js'

export interface IChurchCollection {
  id: string
  userId: string
  name: string
  description?: string | null
  slug: string
  isPublic: boolean
  churchCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ICollectionWithChurches extends IChurchCollection {
  churches: ICollectionChurch[]
  user: {
    id: string
    name: string
    avatarUrl?: string | null
  }
}

export interface ICollectionChurch {
  id: string
  name: string
  slug: string
  denomination?: string | null
  denominationFamily?: string | null
  address: string
  city: string
  neighborhood?: string | null
  coverImageUrl?: string | null
  avgRating: number
  reviewCount: number
  notes?: string | null
  addedAt: Date
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150)
}

async function resolveUniqueSlug(
  userId: string,
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let slug = baseSlug
  let suffix = 2

  while (true) {
    const existing = await prisma.churchCollection.findUnique({
      where: { userId_slug: { userId, slug } },
      select: { id: true },
    })

    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug
    }

    slug = `${baseSlug}-${suffix}`
    suffix++
  }
}

export async function createCollection(
  userId: string,
  input: { name: string; description?: string; isPublic?: boolean },
): Promise<IChurchCollection> {
  const baseSlug = generateSlug(input.name)
  const slug = await resolveUniqueSlug(userId, baseSlug)

  const collection = await prisma.churchCollection.create({
    data: {
      userId,
      name: input.name,
      description: input.description ?? null,
      slug,
      isPublic: input.isPublic ?? true,
    },
  })

  return {
    id: collection.id,
    userId: collection.userId,
    name: collection.name,
    description: collection.description,
    slug: collection.slug,
    isPublic: collection.isPublic,
    churchCount: 0,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  }
}

export async function getUserCollections(
  userId: string,
  viewerId?: string,
): Promise<IChurchCollection[]> {
  const where = viewerId === userId ? { userId } : { userId, isPublic: true }

  const collections = await prisma.churchCollection.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { items: true },
      },
    },
  })

  return collections.map((collection) => ({
    id: collection.id,
    userId: collection.userId,
    name: collection.name,
    description: collection.description,
    slug: collection.slug,
    isPublic: collection.isPublic,
    churchCount: collection._count.items,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  }))
}

export async function getCollection(
  collectionId: string,
  viewerId?: string,
): Promise<ICollectionWithChurches> {
  const collection = await prisma.churchCollection.findUnique({
    where: { id: collectionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      items: {
        orderBy: { addedAt: 'desc' },
        include: {
          church: {
            select: {
              id: true,
              name: true,
              slug: true,
              denomination: true,
              denominationFamily: true,
              address: true,
              city: true,
              neighborhood: true,
              coverImageUrl: true,
              avgRating: true,
              reviewCount: true,
            },
          },
        },
      },
    },
  })

  if (!collection) {
    throw new NotFoundError('Collection not found')
  }

  if (!collection.isPublic && viewerId !== collection.userId) {
    throw new AppError(403, 'FORBIDDEN', 'This collection is private')
  }

  const churches: ICollectionChurch[] = collection.items.map((item) => ({
    id: item.church.id,
    name: item.church.name,
    slug: item.church.slug,
    denomination: item.church.denomination,
    denominationFamily: item.church.denominationFamily,
    address: item.church.address,
    city: item.church.city,
    neighborhood: item.church.neighborhood,
    coverImageUrl: item.church.coverImageUrl,
    avgRating: Number(item.church.avgRating) || 0,
    reviewCount: item.church.reviewCount,
    notes: item.notes,
    addedAt: item.addedAt,
  }))

  return {
    id: collection.id,
    userId: collection.userId,
    name: collection.name,
    description: collection.description,
    slug: collection.slug,
    isPublic: collection.isPublic,
    churchCount: collection.items.length,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    churches,
    user: {
      id: collection.user.id,
      name: collection.user.name,
      avatarUrl: collection.user.avatarUrl,
    },
  }
}

export async function updateCollection(
  collectionId: string,
  userId: string,
  input: { name?: string; description?: string | null; isPublic?: boolean },
): Promise<IChurchCollection> {
  const existing = await prisma.churchCollection.findUnique({
    where: { id: collectionId },
    include: {
      _count: {
        select: { items: true },
      },
    },
  })

  if (!existing) {
    throw new NotFoundError('Collection not found')
  }

  if (existing.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only edit your own collections')
  }

  const data: { name?: string; description?: string | null; slug?: string; isPublic?: boolean } = {}

  if (input.name !== undefined) {
    data.name = input.name
    const baseSlug = generateSlug(input.name)
    data.slug = await resolveUniqueSlug(userId, baseSlug, collectionId)
  }

  if (input.description !== undefined) {
    data.description = input.description
  }

  if (input.isPublic !== undefined) {
    data.isPublic = input.isPublic
  }

  const updated = await prisma.churchCollection.update({
    where: { id: collectionId },
    data,
    include: {
      _count: {
        select: { items: true },
      },
    },
  })

  return {
    id: updated.id,
    userId: updated.userId,
    name: updated.name,
    description: updated.description,
    slug: updated.slug,
    isPublic: updated.isPublic,
    churchCount: updated._count.items,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  }
}

export async function deleteCollection(collectionId: string, userId: string): Promise<void> {
  const existing = await prisma.churchCollection.findUnique({
    where: { id: collectionId },
    select: { id: true, userId: true },
  })

  if (!existing) {
    throw new NotFoundError('Collection not found')
  }

  if (existing.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only delete your own collections')
  }

  await prisma.churchCollection.delete({
    where: { id: collectionId },
  })
}

export async function addChurchToCollection(
  collectionId: string,
  churchId: string,
  userId: string,
  notes?: string,
): Promise<ICollectionChurch> {
  const collection = await prisma.churchCollection.findUnique({
    where: { id: collectionId },
    select: { id: true, userId: true },
  })

  if (!collection) {
    throw new NotFoundError('Collection not found')
  }

  if (collection.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only add churches to your own collections')
  }

  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      id: true,
      name: true,
      slug: true,
      denomination: true,
      denominationFamily: true,
      address: true,
      city: true,
      neighborhood: true,
      coverImageUrl: true,
      avgRating: true,
      reviewCount: true,
    },
  })

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  const existingItem = await prisma.churchCollectionItem.findUnique({
    where: {
      collectionId_churchId: {
        collectionId,
        churchId,
      },
    },
    select: { collectionId: true },
  })

  if (existingItem) {
    throw new ConflictError('Church is already in this collection')
  }

  const item = await prisma.churchCollectionItem.create({
    data: {
      collectionId,
      churchId,
      notes: notes ?? null,
    },
  })

  return {
    id: church.id,
    name: church.name,
    slug: church.slug,
    denomination: church.denomination,
    denominationFamily: church.denominationFamily,
    address: church.address,
    city: church.city,
    neighborhood: church.neighborhood,
    coverImageUrl: church.coverImageUrl,
    avgRating: Number(church.avgRating) || 0,
    reviewCount: church.reviewCount,
    notes: item.notes,
    addedAt: item.addedAt,
  }
}

export async function removeChurchFromCollection(
  collectionId: string,
  churchId: string,
  userId: string,
): Promise<void> {
  const collection = await prisma.churchCollection.findUnique({
    where: { id: collectionId },
    select: { id: true, userId: true },
  })

  if (!collection) {
    throw new NotFoundError('Collection not found')
  }

  if (collection.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only remove churches from your own collections')
  }

  const existingItem = await prisma.churchCollectionItem.findUnique({
    where: {
      collectionId_churchId: {
        collectionId,
        churchId,
      },
    },
    select: { collectionId: true },
  })

  if (!existingItem) {
    throw new NotFoundError('Church not found in this collection')
  }

  await prisma.churchCollectionItem.delete({
    where: {
      collectionId_churchId: {
        collectionId,
        churchId,
      },
    },
  })
}
