# Spec: Filter & Search Enhancements

> Created: 2026-04-11
> Status: draft
> Branch: `claude/filter-search-functionality-3D21O`

## Problem

The current `/api/v1/churches` search endpoint exposes a solid foundation —
PostGIS radius search, full-text `q`, denomination/day/time/language/amenities,
boolean accessibility flags, a 127-point relevance ranking, and URL-synced
client state. But several gaps prevent visitors from expressing common,
high-intent queries:

1. **No way to filter by minimum rating.** Rating feeds the ranking score but
   there's no `minRating` parameter — users can't say "only show me 4+ star
   churches".
2. **`neighborhood` is indexed in the DB but invisible to the API.** San
   Antonio has strong neighborhood identity (Alamo Heights, Stone Oak, South
   Side, etc.) and users routinely search that way.
3. **`radius` is hard-coded to 10 miles** in the client (`DEFAULT_RADIUS`) with
   no UI to change it. Backend accepts it; frontend never surfaces it.
4. **Service type is only reachable via text search.** Users can't pick
   "contemporary" or "traditional" as a structured filter; they have to type
   it into the search box, which also matches church names/descriptions.
5. **Language is single-select.** A bilingual family can't ask for "English OR
   Spanish" services.
6. **No `hasPhotos` or `isClaimed` (verified) filter.** Power users want to
   hide sparse profiles; the ranking system already penalizes them but can't
   exclude them entirely.
7. **Amenity matching is case-sensitive via `ILIKE ANY` pattern that's
   actually brittle.** `${amenity} ILIKE ANY(c."amenities")` treats `amenity`
   as a LIKE pattern, so amenities with `_` or `%` characters cause false
   positives, and exact-match spelling from the DB is still required. We want
   case-insensitive equality.
8. **API spec / code drift.** API_SPEC says `pageSize` max is 50; code clamps
   at 100. API_SPEC says `radius` max is 25; code has no upper bound.
9. **Active filter chips in the results header don't show the new filters.**
   `getActiveSearchTokens()` hand-lists the filters it renders, so every new
   filter needs a matching chip entry.

Now is the right moment to address these before we ship more search UI on top
of a sub-par baseline.

## Approach

Additive changes only — no schema migrations, no breaking API changes. All new
query parameters are optional; existing callers continue to work unchanged.

The work splits into four layers:

1. **Backend search service** (`server/src/services/church.service.ts`) — add
   SQL conditions for the new params and fix the amenity matching bug.
2. **Backend validation** (`server/src/schemas/church.schema.ts`) — extend the
   Zod schema with new fields and tighten `pageSize`/`radius` bounds to match
   spec.
3. **Frontend state + URL sync + API client** — add fields to `SearchFilters`,
   `ISearchParams`, `buildQueryString`, and `useURLSearchState`. Keep the
   "false means undefined" convention so shared URLs stay clean.
4. **UI controls** — new sections in `FilterPanel.tsx` and new chip rows in
   `search-state.ts` so active filters render correctly in the results header.

## Scope

### In scope

**New filters:**

- `minRating` (number, 0–5) — show only churches whose _effective_ rating (local
  `avgRating` if any reviews, else `googleRating`) meets or exceeds the value.
- `neighborhood` (string) — case-insensitive exact match on `churches.neighborhood`.
- `serviceType` (string) — `EXISTS` subquery on `church_services.serviceType`
  (case-insensitive). Complements the day/time filter.
- `language` → already exists, but upgrade to **multi-select OR**. Accept
  comma-separated values; any match satisfies. Backward-compatible with single
  value.
- `hasPhotos` (boolean) — when `true`, require `photo_count > 0`. Uses the
  existing subquery from the ranking CTE (no extra cost).
- `isClaimed` (boolean) — when `true`, require `c.isClaimed = true`.
- `radius` selector in UI — already accepted by backend; just expose the
  control. Options: 2, 5, 10, 25 miles.

**Fixes / hardening:**

- Amenity match: use `lower(a) = any(lower(c.amenities::text[]))` semantics via
  a subquery so the match is case-insensitive AND exact (no LIKE wildcards).
- `pageSize`: align to spec max of 50 (update code; API_SPEC unchanged).
- `radius`: clamp to max 25 (matches API_SPEC) and add Zod `.max(25)`.
- `getActiveSearchTokens`: add entries for the new filters so chips render.
- `countActiveFilters`: pick up the new keys automatically (it already
  iterates `Object.entries`).

**Docs:**

- Update `docs/engineering/API_SPEC.md` with all new params and the corrected
  radius/pageSize ceilings.

**New filter option endpoint data:**

- `GET /api/v1/churches/filter-options` also returns `neighborhoods` and
  `serviceTypes` (DISTINCT queries, same 5-minute cache).

### Out of scope

- No schema migration. `neighborhood` already exists; `serviceType` already
  exists on `church_services`.
- No ranking weight retuning (separate concern).
- No "save filter preset" feature.
- No specific time-range picker (beyond morning/afternoon/evening buckets).
- No tests (per user decision, 2026-04-11).
- No AI-powered suggestions / natural language query parsing.
- No changes to the photo-absence ranking penalty.

## API changes

### `GET /api/v1/churches` — added query params

| Param        | Type    | Default | Notes                                                                  |
| ------------ | ------- | ------- | ---------------------------------------------------------------------- |
| minRating    | number  | —       | 0–5. Effective rating floor (local avgRating, else googleRating).      |
| neighborhood | string  | —       | Case-insensitive exact match on `churches.neighborhood`.               |
| serviceType  | string  | —       | Case-insensitive match on `church_services.serviceType` (EXISTS subq). |
| language     | string  | —       | Now accepts comma-separated list (OR). Single value still works.       |
| hasPhotos    | boolean | —       | When `true`, requires at least one uploaded photo.                     |
| isClaimed    | boolean | —       | When `true`, requires `isClaimed = true`.                              |
| radius       | number  | 10      | Now clamped to max 25 (matches existing API_SPEC).                     |
| pageSize     | number  | 20      | Max clamped from 100 → 50 (matches existing API_SPEC).                 |

### `GET /api/v1/churches/filter-options` — extended response

```json
{
  "data": {
    "denominations": ["Baptist", "Catholic", ...],
    "languages":     ["English", "Spanish", ...],
    "amenities":     ["Parking", "Nursery", ...],
    "neighborhoods": ["Alamo Heights", "Stone Oak", ...],   // NEW
    "serviceTypes":  ["Traditional", "Contemporary", ...]   // NEW
  }
}
```

Both new arrays come from `DISTINCT` queries filtered to non-null, non-empty
values and sorted alphabetically.

## Data model changes

None. All target columns exist:

- `churches.neighborhood` (nullable string, indexed by address already)
- `churches.isClaimed` (boolean, default false)
- `church_services.serviceType` (string)
- `church_photos` (existing table; filter uses `EXISTS`)
- `churches.avgRating`, `churches.googleRating` (both already used in ranking)

## UI changes

### FilterPanel.tsx — new sections

1. **Distance** — horizontal radio/chip group: `2mi`, `5mi`, `10mi`, `25mi`.
   Binds to `filters.radius`. Default is `undefined` (= backend default 10 mi).
2. **Minimum rating** — horizontal chip group: `Any`, `3+`, `3.5+`, `4+`,
   `4.5+`. Binds to `filters.minRating`.
3. **Neighborhood** — reuse the existing `FilterSection` component with the
   dynamic options from `filter-options`.
4. **Service type** — reuse `FilterSection` with dynamic options.
5. **Language** — swap `FilterSection` (single-select) for a multi-select chip
   group, similar to the existing `AmenityFilterSection`. Collapses to
   `undefined` when empty so active-filter count stays accurate.
6. **Quality toggles** — add two new switches to the existing
   `BooleanFilterSection`:
   - `Only churches with photos` → `hasPhotos`
   - `Only verified churches` → `isClaimed`

### SearchPage.tsx / search-state.ts — filter chips

- Add token entries for: `radius`, `minRating`, `neighborhood`, `serviceType`,
  `hasPhotos`, `isClaimed`, and multi-select `language`.
- Each chip is removable via `removeToken` (already handles generic
  `setFilter(key, undefined)`).

### No new routes or pages.

## Test plan

No automated tests (per user decision). Manual smoke plan before merging:

1. `npm run dev` → visit `/search`.
2. Open filter panel; verify new Distance, Rating, Neighborhood, Service type,
   Quality toggle sections render and populate.
3. Apply combinations and watch the results list + map update, URL reflects
   changes, chips appear in results header, "X filters active" is correct.
4. Share the URL in a new tab → state restored.
5. Hit the API directly with `curl` to confirm:
   - `GET /api/v1/churches?minRating=4` → only 4+ star results
   - `GET /api/v1/churches?language=English,Spanish` → OR semantics
   - `GET /api/v1/churches?neighborhood=Alamo%20Heights` → exact match
   - `GET /api/v1/churches?hasPhotos=true&isClaimed=true` → compound filter
   - `GET /api/v1/churches?radius=50` → Zod validation error (max 25)
6. `npm run lint && npm run typecheck && npm run build`.

## Open questions

- Should `minRating` use the Bayesian-adjusted rating or the raw effective
  rating? **Decision:** raw effective rating — simpler, matches user
  intuition ("4+ stars on the card" = "passes a `minRating=4` filter").
- Should we also add `maxDistance` as a separate param from `radius`?
  **Decision:** no — the UI radius selector _is_ the max distance. Keeps the
  API surface minimal.
- Multi-select denomination? **Deferred** — single-select covers the common
  case and the chip UI would need rework. Not worth scope creep here.
