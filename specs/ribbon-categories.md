# Spec: Managed Ribbon Categories

> Created: 2026-04-13
> Status: approved

## Problem

The category ribbon (All, Historic, Contemporary, Traditional, Community,
Missions, Megachurch) is hardcoded in `CategoryFilter.tsx`. Admins cannot
add, remove, reorder, or rename categories without a code change. We also
want auto-generation so the ribbon can surface popular denominations or
service styles automatically based on church data.

## Approach

Move the category definitions from a static TypeScript array into a
`RibbonCategory` database table. Expose a public read endpoint and admin
CRUD + auto-generate endpoints. The frontend fetches categories from the
API and renders them exactly as before, but driven by data instead of code.

Each category has a `source` field (`MANUAL` | `AUTO`) and a `pinned` flag.
Auto-generation analyzes church data (denomination counts, service type
frequency) and inserts/updates `AUTO`-sourced categories without ever
touching `MANUAL` or `pinned` entries. Admins can pin, hide, reorder, or
delete any category regardless of source.

The "All" chip is a UI-only reset button — it is **not** stored in the DB.

## Scope

### In scope

- New `RibbonCategory` Prisma model + migration
- Public `GET /api/v1/ribbon-categories` endpoint (cached)
- Admin CRUD: create, update, delete, reorder, auto-generate
- Seed the 7 existing static categories as `MANUAL` entries
- Update `CategoryFilter.tsx` to fetch from the API
- New API client function + React Query hook

### Out of scope

- Admin dashboard UI (API-only for now)
- SVG/image icon support (emoji only for now)
- Scheduled auto-generation cron (manual trigger via API)

## Data model changes

```prisma
enum RibbonCategorySource {
  MANUAL
  AUTO
  @@map("ribbon_category_source")
}

enum RibbonCategoryFilterType {
  QUERY
  DENOMINATION
  @@map("ribbon_category_filter_type")
}

model RibbonCategory {
  id          String                     @id @default(uuid())
  label       String
  icon        String                     @default("⛪")
  slug        String                     @unique
  filterType  RibbonCategoryFilterType
  filterValue String
  position    Int                        @default(0)
  isVisible   Boolean                    @default(true)
  source      RibbonCategorySource       @default(MANUAL)
  isPinned    Boolean                    @default(false)
  createdAt   DateTime                   @default(now())
  updatedAt   DateTime                   @updatedAt

  @@index([position])
  @@index([isVisible])
  @@map("ribbon_categories")
}
```

**Fields:**

| Field       | Purpose                                                         |
| ----------- | --------------------------------------------------------------- |
| label       | Display name on the chip ("Historic", "Catholic")               |
| icon        | Emoji shown above the label                                     |
| slug        | URL-safe unique id, e.g. `historic`, `denom-catholic`           |
| filterType  | `QUERY` = sets search query, `DENOMINATION` = toggles filter    |
| filterValue | The value passed to the filter ("Historic" or "Catholic")       |
| position    | Sort order (lower = further left)                               |
| isVisible   | Admin can hide without deleting                                 |
| source      | `MANUAL` (admin-created) or `AUTO` (generated from data)        |
| isPinned    | Pinned categories survive auto-generation sweeps                |

## API changes

### Public

```
GET /api/v1/ribbon-categories
  → { data: RibbonCategory[] }
  Returns visible categories ordered by position.
  Cached server-side (5 min TTL, invalidated on mutation).
```

### Admin (requireSiteAdmin)

```
POST   /api/v1/admin/ribbon-categories
  Body: { label, icon?, slug?, filterType, filterValue, position?, isVisible?, isPinned? }
  → 201 { data: RibbonCategory, message }

PATCH  /api/v1/admin/ribbon-categories/:id
  Body: { label?, icon?, filterType?, filterValue?, position?, isVisible?, isPinned? }
  → { data: RibbonCategory, message }

DELETE /api/v1/admin/ribbon-categories/:id
  → { data: { id, deleted: true }, message }

POST   /api/v1/admin/ribbon-categories/reorder
  Body: { ids: string[] }   ← ordered array of category IDs
  → { data: RibbonCategory[], message }

POST   /api/v1/admin/ribbon-categories/auto-generate
  Body: { limit?: number }  ← max categories to generate (default 6)
  → { data: { created: number, updated: number, removed: number }, message }
```

### Auto-generate logic

1. Query `Church` table: count churches per denomination, sorted desc.
2. For each top-N denomination:
   - If a MANUAL or pinned category already covers it → skip.
   - If an AUTO category exists → update position if needed.
   - Otherwise → create a new AUTO category with `filterType: DENOMINATION`.
3. Remove any AUTO (non-pinned) categories that are no longer in the top-N.
4. Invalidate the ribbon cache.

## UI changes

- `CategoryFilter.tsx`: Replace `STATIC_CATEGORIES` + dynamic denomination
  concat with a single `useRibbonCategories()` hook call.
- The hardcoded "All" chip stays in the component (not from DB).
- `handleClick` logic stays the same — it branches on `filterType`.
- Remove `DENOMINATION_ICONS`, `CATEGORY_DENOMINATION_LIMIT`, and the
  dynamic denomination-building block since all of that is now server-driven.

## Test plan

- **Backend unit tests:** service functions for CRUD, reorder, auto-generate
- **Route integration tests:** auth checks, validation, 201/200/404 responses
- **Frontend:** update existing `CategoryFilter.test.tsx` to mock the new hook
- **Manual:** seed, hit `/api/v1/ribbon-categories`, verify chips render

## Open questions

None — ready for implementation.
