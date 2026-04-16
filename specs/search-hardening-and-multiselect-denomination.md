# Spec: Search UX Hardening & Multi-select Denomination

> Created: 2026-04-11
> Status: draft
> Branch: `claude/filter-search-functionality-Ln5TM`

## Problem

PR #9 (`specs/filter-search-enhancements.md`) closed the big gaps in the
filter surface — minRating, neighborhood, serviceType, multi-select language,
hasPhotos, isClaimed, radius selector, chips for everything, case-insensitive
amenity matching, clamped radius/pageSize. A follow-up audit of the live
search flow surfaces a short, tightly-scoped list of remaining issues:

1. **Multi-select denomination is the obvious deferred follow-up.** The
   previous spec explicitly punted on it ("Deferred — single-select covers the
   common case and the chip UI would need rework"). Now that language is
   multi-select and the chip rendering already handles per-chip removal for
   arrays, the cost of doing it right has dropped. San Antonio users
   routinely want "Baptist OR Non-denominational OR Methodist", and there is
   no reason they should have to search three times.

2. **`countActiveFilters` undercounts multi-select languages.** In
   `client/src/lib/search-state.ts:162–179` the counter special-cases
   `amenities` — each entry counts as one filter — but it does not apply the
   same rule to `languages`. A user who selects English, Spanish, and
   Vietnamese sees "1 filter active" instead of "3". The same bug will apply
   to `denomination` the minute we make it multi-select, so we fix the
   counter with a generic rule while we are in there.

3. **`NoResults` suggests removing a hand-picked subset of filters.**
   `client/src/components/search/NoResults.tsx:42–67` only offers "remove
   denomination", "remove day", and "remove languages" as disambiguation
   buttons. Everything else added in PR #9 (neighborhood, serviceType,
   minRating, hasPhotos, isClaimed, radius, wheelchair/community booleans,
   time, amenities) is silently ignored, so a user who hit a zero-result
   state because of a too-tight `minRating=4.5` cannot see which filter to
   loosen without opening the full panel.

4. **`mapBounds` is an invisible filter.** When the user pans the map and
   the "Search this area" button fires, `mapBounds` narrows results but never
   appears in the active-filter chip row. The only affordances are a text
   blurb in the results header ("Following the visible map area") and hiding
   the map entirely — there is no way to clear the bounds without touching
   the map. Users who toggle between list and map end up confused about why
   results changed.

5. **URL hydrate does not restore `sort=distance` when `nearLat`/`nearLng`
   are present.** `useURLSearchState` reads the user location back from the
   URL on mount but never re-applies the "Near me → sort by distance" flip
   that `NearMeButton.handleActivate` performs. A user who shares a "near me"
   link or hard-refreshes after activating it lands on `sort=relevance`
   (the default) even though the search is centered on their location, so
   the top results are no longer "nearest first". The current URL is
   genuinely ambiguous about intent, but matching the NearMeButton behaviour
   on hydrate is the principle of least surprise.

None of these needs a schema migration or breaking API change. All five are
additive fixes that compound — doing them in one PR keeps the diff tight and
closes the loop on the PR #9 work.

## Approach

One PR, five concerns, grouped by layer:

1. **Multi-select denomination** — promote `filters.denomination` from
   `string | undefined` to `string[] | undefined`, mirroring the existing
   `languages` model. Add `toggleDenomination`. Extend `buildQueryString` and
   `useURLSearchState` to serialize as a comma-separated list on the existing
   `denomination` param (backwards-compatible with single-value callers).
   Extend the backend service to split on comma and OR the values with a
   case-insensitive `LOWER(...) = ANY(...)` check, same as the language fix
   already in place. `FilterPanel` swaps the Tradition `FilterSection` for a
   new `DenominationFilterSection` that renders multi-select chips.
   `getActiveSearchTokens` emits one chip per value; `removeToken` dispatches
   to `toggleDenomination` for denomination keys the same way it already
   does for languages/amenities.

2. **`countActiveFilters` generic array rule** — replace the
   `amenities`-only special case with a loop that applies `count += value.length`
   to any `Array.isArray(value)` filter. This fixes languages today and
   denominations on the same PR.

3. **`NoResults` disambiguation sweep** — rewrite the suggestion list to
   iterate every active filter key in a stable order (denomination, day,
   time, languages, amenities, serviceType, neighborhood, minRating, radius,
   booleans) and emit a "Remove &lt;label&gt;" button for each. Cap the list at
   the first 4 (existing behaviour) so the layout does not explode, but
   prioritise the filters most likely to be the cause of a zero-result state
   (narrow ones first: minRating, neighborhood, serviceType, then the
   structural ones).

4. **`mapBounds` chip** — `mapBounds` lives outside `SearchFilters` in the
   store, so it cannot flow through `getActiveSearchTokens` directly.
   Introduce a second token source in `SearchPage`: compute a synthetic
   "Map area" token when `mapBounds` is set, render it in the same chip row,
   and dispatch `setMapBounds(null)` on removal. Keep the existing
   "Following the visible map area" blurb but drop it once the chip is
   rendering, so users have a single consistent control.

5. **URL hydrate → sort=distance** — in `useURLSearchState`'s one-shot mount
   effect, after we call `setUserLocation({ lat, lng })`, check whether the
   URL also specified a `sort`. If it did not (i.e. the page is defaulting
   to `relevance`), call `setSort('distance')`. This mirrors the click
   handler in `NearMeButton`. Explicit `sort=name` / `sort=rating` /
   `sort=relevance` in the URL still wins.

## Scope

### In scope

- `client/src/stores/search-store.ts`
  - `SearchFilters.denomination: string[] | undefined`
  - `toggleDenomination(value)` action, mirroring `toggleLanguage`
  - `setFilter` collapses empty denomination arrays to `undefined`
  - `clearFilters` unaffected (already wipes the object)
- `client/src/hooks/useURLSearchState.ts`
  - Parse `denomination` URL param as comma-separated list
  - Serialize `filters.denomination` as comma-separated list
  - After hydrating `userLocation`, flip sort to `distance` when the URL has
    no explicit `sort` value
- `client/src/api/churches.ts`
  - `buildQueryString` joins `params.denominations` (new optional field) with
    `,` on the `denomination` wire param
- `client/src/types/church.ts`
  - `ISearchParams.denominations?: string[]` (replaces single `denomination`
    in the client type; server type stays `string` since the wire param is a
    single comma-separated string)
- `client/src/hooks/useChurches.ts`
  - `useChurchSearchParams` reads `filters.denomination` (now an array) and
    passes it through as `denominations`
- `client/src/lib/search-state.ts`
  - `getActiveSearchTokens` emits one "Tradition: X" chip per selected
    denomination
  - `countActiveFilters` uses a generic `Array.isArray(value)` rule instead
    of the current `amenities`-only special case
- `client/src/components/search/FilterPanel.tsx`
  - Replace the Tradition `<FilterSection>` with a new
    `<DenominationFilterSection>` that renders multi-select chips using
    `toggleDenomination`
- `client/src/components/search/NoResults.tsx`
  - Iterate all active filter keys in a stable priority order; emit
    "Remove &lt;label&gt;" for each; keep the 4-chip visual cap
- `client/src/pages/SearchPage.tsx`
  - When `mapBounds` is set, prepend a synthetic "Map area" token to the
    chip row and wire removal to `setMapBounds(null)`
  - Drop the "Following the visible map area" inline blurb once the chip is
    doing the job
  - Extend `removeToken` to call `toggleDenomination` for the
    `'denomination'` key
- `server/src/services/church.service.ts`
  - Denomination filter: split on `,`, trim, lowercase, build an EXISTS-free
    `LOWER(c."denominationFamily") = ANY(${list}::text[])` check. Single-value
    callers (`?denomination=Baptist`) keep working.
- `server/src/types/church.types.ts`
  - JSDoc update on `ISearchParams.denomination` noting the comma-separated
    multi-select semantics. Type stays `string | undefined` since the wire
    format is a single string.
- `docs/engineering/API_SPEC.md`
  - Update the `denomination` row to note it accepts a comma-separated list
    (OR semantics), mirroring the language entry.

### Out of scope

- No schema migration. `denominationFamily` already exists on the churches
  table and is already indexed through the radius-search query pattern.
- No ranking weight retuning. The `NO_PHOTO_PENALTY` discussion stays parked.
- No saved filter presets, no NL query parsing, no time-range picker — those
  are legitimate follow-ups but are their own specs.
- No changes to how `mapBounds` is computed or when the "Search this area"
  button fires. We are only making the existing bounds filter visible and
  dismissable.
- No tests added — matches the convention the last spec set for this area.

## API changes

### `GET /api/v1/churches` — `denomination` semantics

| Param        | Type   | Before                            | After                                                               |
| ------------ | ------ | --------------------------------- | ------------------------------------------------------------------- |
| denomination | string | Single value, case-insensitive eq | Accepts a comma-separated list; OR-combined; case-insensitive match |

Wire format:

- `?denomination=Baptist` — unchanged, still matches one family.
- `?denomination=Baptist,Methodist,Non-denominational` — new, matches any
  church whose `denominationFamily` is in the list.

No new fields on the response envelope. No change to `/filter-options`.

## Data model changes

None. `churches.denominationFamily` is the target column and already exists.

## UI changes

### FilterPanel.tsx

`DenominationFilterSection` — a new component modelled on the existing
`LanguageFilterSection`:

- Reads `filters.denomination` (now an array) from the store.
- Uses `toggleDenomination(value)` to add/remove one entry.
- Renders the same rounded chip style as language/amenity multi-select.
- Copy: "Pick one or more traditions — we will match churches from any of
  them."

The section slot in the panel stays where Tradition already lives, so the
visual order does not change.

### SearchPage.tsx — active filter chips

- New synthetic "Map area" chip rendered first when `mapBounds` is set, with
  an X that calls `setMapBounds(null)`.
- Denomination chips render one-per-value through the generic
  `getActiveSearchTokens` path; per-chip removal calls `toggleDenomination`.
- Drop the `'  /  Following the visible map area'` blurb in
  `resultsDescription` once the chip replaces it.

### NoResults.tsx

- Suggestion list driven by a single `ACTIVE_FILTER_SUGGESTIONS` table that
  maps each filter key to a label builder and an undo action.
- Priority ordering: `minRating`, `neighborhood`, `serviceType`, `radius`,
  `denomination`, `day`, `time`, `languages`, `amenities`, booleans.
- Each denomination/language/amenity value renders its own "Remove" button
  (first 4 wins the cap, matching today's visual limit).

### No new routes or pages.

## Test plan

No automated tests (matching the last spec's convention). Manual smoke plan
before merging:

1. `npm run dev`; visit `/search`.
2. Open the filter panel; verify Tradition renders as multi-select chips.
3. Pick Baptist + Methodist; verify:
   - Two "Tradition:" chips in the results header.
   - `countActiveFilters` reads "2 filters active".
   - URL is `?denomination=Baptist,Methodist`.
   - Results update and include churches from either family.
4. Click one of the chips; verify only that denomination is removed and the
   other stays active.
5. Select three languages; verify the filter count reads "3" (fixes the
   counter bug).
6. Pan the map, click "Search this area"; verify a "Map area" chip renders
   in the filter row; click its X and confirm `mapBounds` clears and the
   full-city results return.
7. Hard-refresh a URL with `?nearLat=29.42&nearLng=-98.49`; verify the sort
   dropdown shows "Nearest" (distance). Add `&sort=rating` to the URL and
   confirm the explicit sort wins.
8. Apply `minRating=4.5&neighborhood=Stone%20Oak` with no matches; verify
   the `NoResults` card lists "Remove 4.5+ stars" and "Remove Stone Oak"
   buttons.
9. Hit the API directly:
   - `GET /api/v1/churches?denomination=Baptist,Methodist` → mixed results
   - `GET /api/v1/churches?denomination=Baptist` → unchanged single-family
     behaviour
10. `npm run lint && npm run typecheck && npm run build`.

## Open questions

- Should multi-select denomination collapse to the single-value wire format
  when only one value is selected, or always send the same comma-list
  format? **Decision:** always use the same format — `URLSearchParams`
  produces `denomination=Baptist` for a one-element join anyway, so the
  single-select case is already covered without a branch.
- Should the "Map area" chip label include coordinates?
  **Decision:** no — the bounds are opaque geography that the user cannot
  parse at a glance. A plain "Map area" label with an X affordance is
  clearer than "Area (29.42, -98.49 … 29.47, -98.44)".
- Should `NoResults` special-case `hasPhotos` / `isClaimed` as "loosen trust
  filters" instead of "Remove Has photos"? **Decision:** keep the plain
  "Remove &lt;label&gt;" copy — a dedicated trust-loosening hint can come later
  if user testing shows the plain copy confuses anyone.
- Denomination selection currently drives `resultsDescription` in
  `SearchPage.tsx` ("Baptist churches"). With multi-select, should we list
  all of them? **Decision:** when `filters.denomination.length === 1`, keep
  the existing phrasing; otherwise fall back to "All denominations" and let
  the chip row carry the specifics. Keeps the subtitle short.
