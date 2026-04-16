# Spec: Website Enrichment Pipeline v2

> Created: 2026-04-14
> Status: draft

## Problem

The v1 pipeline (shipped in 035b429) fetches a church's homepage and extracts
pastor, denomination, year, and service times via structured-data parsing plus
`claude -p`. It works, but:

1. **Single-page crawl misses most of the data.** Pastor names, staff, mission
   statements, languages, and ministries live on `/about`, `/staff`,
   `/leadership`, `/services`, `/ministries`, `/contact` — not the homepage.
2. **Not resumable.** A run of ~500 churches can take an hour and burns Claude
   CLI quota. If it is killed (Ctrl-C, CLI usage limit, SSH drop), the next
   run starts from the top and re-does every successful church.
3. **No rate-limit detection.** When `claude -p` returns a usage-limit error,
   the script just records it as an extraction error and keeps hammering.
4. **Narrow extraction schema.** Only five fields populated. The DB also
   stores `phone`, `email`, `languages`, `description`, plus the amenity
   booleans (`goodForChildren`, `goodForGroups`, `wheelchairAccessible`) that
   we could fill in.

## Approach

A new `enrich-website-v2/` script that:

1. **Persists per-church state in Postgres** via a new `EnrichmentState` table
   so runs are idempotent and resumable.
2. **Caches fetched HTML on disk** at `server/.enrichment-cache/v2/<churchId>/`
   (gitignored) so a resume does not re-fetch pages.
3. **Crawls common subpages** in addition to the homepage — discovers links
   from the homepage `<a>` tags that match a whitelist (`/about`, `/staff`,
   `/leadership`, `/pastors?`, `/ministries`, `/contact`, `/services`,
   `/worship`, `/what-we-believe`) and fetches up to N of them.
4. **Combines pages into one extraction call.** Strip each page, concatenate
   with page-section headers, truncate to ~16k chars, then run Pass 1
   (per-page structured-data parse, merged) and Pass 2 (single Claude call
   over the combined text).
5. **Detects CLI rate limits.** If `claude -p` fails with a usage-limit error
   (see patterns in `claude-extractor.ts`), the script persists progress and
   exits 0 with a "resume later" message instead of continuing.
6. **Graceful shutdown.** SIGINT / SIGTERM mark the in-flight church as
   `pending` and flush state before exiting.

Implementation lives in `server/src/scripts/enrich-website-v2/`. The v1
pipeline stays in place so it keeps working.

## Scope

### In scope

- New Prisma model `EnrichmentState` + migration.
- New columns on `events`: `isAutoImported` + `sourceUrl` + composite index.
- Disk HTML cache (gitignored).
- Multi-page crawler with subpage whitelist (about, staff, ministries,
  services, contact, visit, events, calendar).
- Expanded extraction schema:
  - Core: `description`, `email`, `phone`, `languages`, `amenities`
    (children/groups/wheelchair booleans), `staff`, `socialLinks`.
  - Events: upcoming events (JSON-LD Event + AI), written to `events`
    table with `isAutoImported=true`.
  - Ministries (canonical names like Celebrate Recovery, AWANA, MOPS,
    Women's Ministry, GriefShare, …).
  - Affiliations (SBC, PCA, LCMS, UMC, Vineyard USA, …).
  - Service style (Traditional / Contemporary / Blended / Liturgical).
  - Named URLs: sermons, livestream, statement of faith, giving,
    new-visitor / connect card.
  - Parking info, dress code hints.
- The "soft" fields above (ministries, affiliations, URLs, parking, dress
  code) are stored in `enrichment_states.extractedData` JSON — not yet in
  dedicated Church columns. Consumers can read them via the enrichment
  snapshot; surfacing them in the UI is a follow-on.
- Pass 1 enhancements: mailto/tel harvesting, og:description capture,
  anchor-text driven URL classification, JSON-LD Event harvesting.
- Rate-limit detection + graceful exit with exit code 0.
- Resume: only processes churches whose `EnrichmentState` is missing,
  `pending`, `fetched`, or `failed` (with < max_attempts).
- `--retry-failed`, `--force-refetch`, and the existing v1 flags.
- `npm run enrich:website-v2` script.

### Out of scope

- Image discovery / photo ingest (stays in Leaders Portal).
- PDF/Google Doc parsing for bulletins.
- Per-subdomain respect of `robots.txt` (we will keep the fixed 2 req/s limit
  and identify as `SAChurchFinder/2.0`).
- JS rendering for SPA-heavy sites (no headless browser — still regex-based).
- Event extraction (one-off events vs. recurring services is hard; punt).

## API changes

None. This is a batch script, not a user-facing endpoint.

## Data model changes

New table `enrichment_states`:

```prisma
model EnrichmentState {
  id            String    @id @default(uuid())
  churchId      String    @unique
  church        Church    @relation(fields: [churchId], references: [id], onDelete: Cascade)
  version       String    // "v2"
  status        String    // pending | fetched | extracted | applied | skipped_no_data | failed | rate_limited
  pagesFetched  Json      @default("[]") // [{url, statusCode, bytes, fetchedAt}]
  extractedData Json?     // ExtractedChurchData snapshot
  confidence    Float?
  source        String?
  lastError     String?
  attempts      Int       @default(0)
  startedAt     DateTime  @default(now())
  completedAt   DateTime?
  updatedAt     DateTime  @updatedAt

  @@index([status, version])
  @@map("enrichment_states")
}
```

Requires updating `docs/engineering/DATA_MODELS.md`.

## UI changes

None.

## Test plan

- `npm run lint && npm run typecheck && npm run build` all pass.
- Unit tests for:
  - `subpage-discovery.ts` — whitelist matching, URL resolution, dedup.
  - `html-cache.ts` — read/write/expiry.
  - `rate-limit-detector.ts` — matches the known CLI error strings.
  - Updated `result-validator.ts` — accepts new fields, rejects malformed.
- Manual `--dry-run --limit 5` on a dev DB to verify:
  1. State rows get created with `status=applied` or `skipped_no_data`.
  2. Re-running with the same churches skips them.
  3. `--retry-failed` re-runs only the failures.
  4. SIGINT mid-run leaves the current church as `pending`, and the next
     run picks it up.
  5. A simulated rate-limit error (mock via env var) triggers clean exit.

## Open questions

- Should we bump `attempts` on every run or only on fetch? → Only on fetch
  attempts so rate-limit retries do not burn the retry budget.
- How long is cached HTML valid? → 7 days. Beyond that, re-fetch.
- Max subpages per church? → 6 (homepage + 5 discovered).
- Max concurrent fetches? → 1 (serial, to stay polite).
