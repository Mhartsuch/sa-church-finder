/**
 * Production-safe backfill for the category ribbon.
 *
 * Upserts the 6 default ribbon categories by slug. Idempotent and
 * non-destructive — it never deletes rows or touches anything else,
 * so it is safe to run against production.
 *
 * The list below is the single source of truth for default ribbon
 * categories; prisma/seed.ts imports it so the two cannot drift.
 *
 * Usage:
 *   npx tsx src/scripts/seed-ribbon-categories.ts
 *   npm run db:seed:ribbon
 */

import { pathToFileURL } from 'node:url'

import { PrismaClient } from '@prisma/client'

export interface RibbonCategorySeed {
  label: string
  icon: string
  slug: string
  filterType: 'QUERY' | 'DENOMINATION'
  filterValue: string
  position: number
}

export const DEFAULT_RIBBON_CATEGORIES: RibbonCategorySeed[] = [
  { label: 'Historic', icon: '🏛️', slug: 'historic', filterType: 'QUERY', filterValue: 'Historic', position: 0 },
  { label: 'Contemporary', icon: '🎵', slug: 'contemporary', filterType: 'QUERY', filterValue: 'Contemporary', position: 1 },
  { label: 'Traditional', icon: '🏠', slug: 'traditional', filterType: 'QUERY', filterValue: 'Traditional', position: 2 },
  { label: 'Community', icon: '💜', slug: 'community', filterType: 'QUERY', filterValue: 'Community', position: 3 },
  { label: 'Missions', icon: '🏛️', slug: 'missions', filterType: 'QUERY', filterValue: 'Mission', position: 4 },
  { label: 'Megachurch', icon: '🏢', slug: 'megachurch', filterType: 'QUERY', filterValue: 'Megachurch', position: 5 },
]

export async function seedRibbonCategories(prisma: PrismaClient): Promise<void> {
  for (const cat of DEFAULT_RIBBON_CATEGORIES) {
    await prisma.ribbonCategory.upsert({
      where: { slug: cat.slug },
      update: { label: cat.label, icon: cat.icon, filterType: cat.filterType, filterValue: cat.filterValue, position: cat.position },
      create: { ...cat, source: 'MANUAL', isVisible: true, isPinned: true },
    })
  }
  console.log(`Upserted ${DEFAULT_RIBBON_CATEGORIES.length} ribbon categories`)
}

// Run only when invoked directly (e.g. `npx tsx src/scripts/seed-ribbon-categories.ts`),
// not when imported by prisma/seed.ts.
const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href

if (invokedDirectly) {
  const prisma = new PrismaClient()

  seedRibbonCategories(prisma)
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error('Ribbon category seed failed:', e)
      await prisma.$disconnect()
      process.exit(1)
    })
}
