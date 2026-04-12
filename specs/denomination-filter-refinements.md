# Spec: Denomination Filter Refinements

> Created: 2026-04-12
> Status: draft
> Branch: `claude/filter-search-functionality-hPuHC`

## Problem

Multi-select denomination filtering shipped in PR #10
(`specs/search-hardening-and-multiselect-denomination.md`), so users can
now combine "Baptist OR Methodist OR Non-denominational" in one query.
The underlying wire format and backend SQL are solid. But the visible
denomination surface — the homepage `CategoryFilter` rail and the
`FilterPanel` Tradition section — has several ergonomics gaps that a
follow-up audit turned up:

1. **`CategoryFilter` denomination list is hardcoded to 8 entries.**
   `client/src/components/search/CategoryFilter.tsx:15–35` ships a static
   `ALL_CATEGORIES` array with exactly eight denomination chips: Catholic,
   Baptist, Methodist, Episcopal (mapped to "Anglican"), Lutheran,
   Non-denominational, Presbyterian, plus four "service style" text-search
   chips. Any denomination family present in `churches.denominationFamily`
   but _not_ in that list — Pentecostal, Assembly of God, Orthodox,
   Adventist, Mennonite, etc. — is invisible on the homepage rail. A
   visitor who came looking for a Pentecostal church has to notice the
   "Filters" button, open the modal, scroll to Tradition, and find it
   there. The chip rail was supposed to be the fast path for the common
   case; today it's a curated minority.

2. **There is no way to tell how many churches are in each denomination
   before selecting it.** The filter UI renders every available tradition
   as an equal-weight chip, so users select a filter, watch results
   collapse, and then have to guess whether "Orthodox (0 results)" means
   they typoed something or whether there really are no Orthodox churches
   in the dataset. Showing a count next to each option ("Baptist · 42",
   "Orthodox · 2") sets expectations up front, reduces zero-result
   frustration, and lets users prioritise the traditions that are actually
   well-represented in San Antonio.

3. **No popular-vs-long-tail split.** As the seed data grows, the
   `DenominationFilterSection` becomes a long flat row of chips with no
   prioritisation. On mobile the row wraps to four or five lines of
   low-frequency traditions, which pushes the active picks below the fold
   and makes the panel feel cluttered. A "Popular" pin of the top 6 with a
   "Show all" disclosure would keep the section tidy.

4. **Episcopal → Anglican is a suspicious hardcoded mapping.**
   `CategoryFilter.tsx:24` maps the visible label "Episcopal" to the
   filter value "Anglican". If the seeded `denominationFamily` column uses
   "Episcopal" (which is the more common U.S. usage), the chip is always a
   no-op because the value never matches what's in the data. Either the
   mapping is correct and we should leave it, or it's a silent bug and we
   should surface it.

Fixing (1) and (4) is a code-hygiene problem. Fixing (2) and (3) is the
actual UX improvement. Bundling them is cheap because (1) and (3) are in
the same file and (2)/(3) share the same backend-data extension.

## Approach

Four changes, split across two layers:

1. **Backend: extend `filter-options` with per-denomination counts.**
   `GET /api/v1/churches/filter-options` currently returns
   `{ denominations: string[], languages, amenities, neighborhoods,
   serviceTypes }`. Upgrade `denominations` to
   `Array<{ value: string, count: number }>` — the other arrays stay as
   plain string arrays for now, since their counts are less useful for UX.
   Count comes from `SELECT denominationFamily, COUNT(*) FROM churches
   WHERE denominationFamily IS NOT NULL AND businessStatus !=
   'CLOSED_PERMANENTLY' GROUP BY denominationFamily`. The existing
   5-minute in-process cache picks it up automatically.

2. **Frontend: make `CategoryFilter` denomination-aware and data-driven.**
   Replace the hardcoded denomination entries in `ALL_CATEGORIES` with a
   derivation step: take the first _N_ denominations sorted by count
   descending from `filterOptions.denominations` and render them as chips.
   The non-denomination service-style chips (Historic, Contemporary,
   Traditional, Community, Missions, Megachurch) stay as-is, rendered
   before the dynamic denomination chips. The "All" chip stays first. Drop
   the `ALL_CATEGORIES` denomination rows entirely and the
   `availableDenominations` whitelist filter that compensates for them.
   _N_ defaults to 6 (on mobile the rail scrolls, on desktop the chips
   fit comfortably).

3. **Frontend: show counts in the `FilterPanel` Tradition section.** The
   existing `DenominationFilterSection` renders chips with just a label;
   extend the chip copy to `"{label} · {count}"` when a count is available
   and fall back to just the label when it isn't. Style stays the same.
   Also sort the section by count descending so the most common traditions
   lead.

4. **Frontend: popular / all disclosure.** In the same
   `DenominationFilterSection`, when more than 8 denominations are
   available, show only the top 6 by count by default and render a "Show
   all _(N more)_" button that expands the full list. Collapse back to the
   pinned set with "Show fewer". No URL state — the disclosure is purely
   local UI.

Concern (4) from Problem — the Episcopal/Anglican mapping — falls out of
change (2) automatically: once the chip rail is data-driven, whatever
value is actually in `denominationFamily` is what the chip emits, so
there is no mapping layer to drift out of sync. No special fix needed.

## Scope

### In scope

**Backend**

- `server/src/services/church.service.ts`
  - `getAvailableDenominationsWithCounts()` — new function; returns
    `Array<{ value: string, count: number }>` sorted by count desc, then
    name asc. Uses Prisma `groupBy` (no raw SQL — per backend rule).
  - `getFilterOptions()` — wire the new counts array in place of the
    plain `denominations: string[]` field.
  - The existing 5-minute cache wraps the entire payload, so no new cache
    plumbing.
- `server/src/routes/church.routes.ts`
  - No handler changes. The route just re-serialises whatever
    `getFilterOptions` returns.
- `server/src/types/church.types.ts`
  - `IFilterOptionsResponse.denominations: Array<{ value: string,
    count: number }>` replaces the `string[]` shape.

**Frontend**

- `client/src/types/church.ts`
  - Mirror the new `denominations` shape on the client type.
- `client/src/hooks/useChurches.ts`
  - `useFilterOptions` returns the new shape; consumers switch from
    `option: string` to `option.value`.
- `client/src/components/search/FilterPanel.tsx`
  - `DenominationFilterSection` reads counts from the new shape.
  - Sort input by count desc.
  - Append ` · ${count}` to each chip label.
  - Implement the popular / show-all disclosure: 6 pinned, "Show all
    (N more)" button, local `useState` for expanded.
- `client/src/components/search/CategoryFilter.tsx`
  - Drop hardcoded denomination entries from `ALL_CATEGORIES` (Catholic,
    Baptist, Methodist, Episcopal, Lutheran, Non-denom, Presbyterian).
    Keep the service-style entries (Historic, Contemporary, Traditional,
    Community, Missions, Megachurch) and the "All" entry.
  - Derive denomination chips from `filterOptions?.denominations.slice(0,
    6)` and render them after the style chips.
  - Drop the `availableDenominations` whitelist filter and its `.has()`
    call — now unnecessary.
  - Drop the Episcopal → Anglican mapping comment and logic.

**Docs**

- `docs/engineering/API_SPEC.md`
  - Update the `GET /churches/filter-options` response example to show the
    new `denominations` shape with counts.
- `docs/engineering/DATA_MODELS.md`
  - No change; no schema touched.

### Out of scope

- No schema migration. Counts come from existing `denominationFamily`.
- No change to search query semantics — wire format stays
  `?denomination=Baptist,Methodist`.
- No counts for languages / amenities / neighborhoods / serviceTypes.
  Adding them is a trivial extension of the pattern but doubles the
  backend query count and the four above are less confusing in practice.
- No tooltips / explainer text for unfamiliar traditions ("what is
  Presbyterian?"). That's a legitimate content concern but its own spec —
  would require copy review, illustration, and probably a link out to
  `docs/product/denomination-guide.md`.
- No "popular + all" split in the `CategoryFilter` rail. That component is
  already a horizontally scrolling row; the top-6 cap is enough.
- No ranking-weight tuning.
- No tests — matches the convention both prior search specs set for this
  area.

## API changes

### `GET /api/v1/churches/filter-options` — `denominations` shape

Before:

```json
{
  "data": {
    "denominations": ["Baptist", "Catholic", "Lutheran", "..."],
    "languages": ["English", "Spanish", "..."],
    "amenities": ["Parking", "Nursery", "..."],
    "neighborhoods": ["Alamo Heights", "Stone Oak", "..."],
    "serviceTypes": ["Traditional", "Contemporary", "..."]
  }
}
```

After:

```json
{
  "data": {
    "denominations": [
      { "value": "Baptist", "count": 42 },
      { "value": "Catholic", "count": 38 },
      { "value": "Non-denominational", "count": 24 }
    ],
    "languages": ["English", "Spanish", "..."],
    "amenities": ["Parking", "Nursery", "..."],
    "neighborhoods": ["Alamo Heights", "Stone Oak", "..."],
    "serviceTypes": ["Traditional", "Contemporary", "..."]
  }
}
```

This is a breaking change to the shape of `denominations`, but the only
consumers are first-party (`client/src/components/search/FilterPanel.tsx`
and `CategoryFilter.tsx`, both in this repo, both updated in the same
PR). No public contract; no deprecation window needed.

No change to `GET /api/v1/churches` — denomination query semantics are
unchanged.

## Data model changes

None. Counts are computed from existing `churches.denominationFamily`.

## UI changes

### `FilterPanel.tsx` — Tradition section

- Chip label becomes `"{name} · {count}"` (e.g. `"Baptist · 42"`).
  Chip style, padding, colours all stay the same.
- Options are rendered in count-desc order, not alphabetical.
- When `denominations.length > 8`, render only the top 6 by default and
  append a "Show all (N more)" text button below the chip row. Clicking
  it expands to the full list and the button copy flips to "Show fewer".
- Copy under the section heading stays: _"Pick one or more traditions —
  we will match churches from any of them."_

### `CategoryFilter.tsx` — homepage chip rail

- Keep the "All" chip first.
- Keep the service-style chips (Historic, Contemporary, Traditional,
  Community, Missions, Megachurch) in their existing positions and
  ordering.
- Drop the seven hardcoded denomination chips.
- Append up to 6 denomination chips sorted by count desc, derived from
  the new `filterOptions.denominations` response. Fall back to emoji
  `⛪` when no icon mapping exists (the existing hardcoded icons are
  lost; we can port them into a small `DENOMINATION_ICONS` map in the
  same file if we want to preserve them — see Open questions).
- `toggleDenomination` wiring stays the same; `isActive` for the "All"
  chip already handles "no denominations selected" correctly.

### No new pages or routes.

## Test plan

No automated tests (per the convention prior search specs set). Manual
smoke plan before merging:

1. `npm run db:seed` with the latest seed file, then `npm run dev`.
2. Visit `/` and confirm the homepage chip rail shows the top 6
   denominations from the seed data in count-desc order, with the "All"
   chip still first and the service-style chips still present.
3. If seed data contains a denomination previously not in the hardcoded
   list (e.g. Pentecostal), confirm it now renders as a chip.
4. Visit `/search`, open the filter modal, and verify the Tradition
   section:
   - Chips include a `· N` count suffix.
   - Chips are sorted by count descending.
   - When >8 denominations are available, only 6 render by default with
     a "Show all (N more)" button.
   - Clicking "Show all" expands the full list; clicking "Show fewer"
     collapses.
5. Select 2 denominations; confirm the URL, the chips in the results
   header, and the API request all behave the same as before multi-select
   shipped.
6. Hit the API directly:
   `curl /api/v1/churches/filter-options` and verify
   `denominations` is an array of `{ value, count }` objects in
   count-desc order.
7. `npm run lint && npm run typecheck && npm run test && npm run build`
   all pass (the existing filter-panel test may need a small update to
   match the new prop shape).

## Open questions

- Should the hardcoded denomination icons in `CategoryFilter.tsx`
  (`✝️` Catholic, `💧` Baptist, `✨` Methodist, `🌅` Episcopal, `🌿` Lutheran,
  `🌳` Non-denom, `📜` Presbyterian) survive the cleanup? Those are
  specific to individual denominations, not the rail layout.
  **Proposed decision:** port them into a `DENOMINATION_ICONS`
  constant keyed on lowercased family name, fall back to `⛪` when a
  family has no entry. Preserves visual polish for the seven common
  ones and gracefully handles any new family.

- Should the `FilterPanel` chip show `"Baptist · 42"` or `"Baptist (42)"`
  or `"Baptist 42"`? All three are clear. **Proposed decision:** the
  middle-dot variant (` · `) matches the visual rhythm used elsewhere in
  the app (`ChurchCard` uses it for `rating · distance`), which keeps the
  design language consistent.

- Should "Closed permanently" churches be excluded from denomination
  counts? The search query already excludes them, so yes — otherwise a
  user selects "Baptist · 42" but only sees 38 results, which is
  confusing. **Proposed decision:** filter out
  `businessStatus = 'CLOSED_PERMANENTLY'` in the count query to match
  the list-view behaviour.

- Should we cap the `CategoryFilter` rail at 6 dynamic denomination
  chips, or let it grow up to the full list and rely on horizontal
  scrolling? **Proposed decision:** cap at 6. The rail already scrolls,
  but a very long row buries the trailing "Filters" button and the
  Compare affordance on desktop. 6 is enough for discovery; power users
  open the modal for the rest.

- Should this work block on porting the existing count data into
  `server/src/services/__tests__/church.service.test.ts`? **Proposed
  decision:** no — the prior specs in this area explicitly opted out of
  new tests, and the payload change is small and easy to verify
  manually. Revisit when we do the broader search test sweep.
