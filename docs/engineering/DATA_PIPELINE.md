# Church Data Pipeline

> How church records get into the database and enriched. All stages live in
> `server/src/scripts/` and run against `DATABASE_URL`.

## One command

```bash
npm run pipeline:run -- [--dry-run] [--limit N] [--stale-days N] \
  [--skip-import] [--skip-ratings] [--skip-websites] [--skip-details] [--continue]
```

`server/src/scripts/pipeline/run.ts` sequences the four stages below in
order (each as its own process). A failed stage stops the run unless
`--continue` is passed.

## Stages

| #   | npm script (root)        | Source               | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | ------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `import:google-churches` | `google-import/`     | Grid-searches Google Places (New) over the SA metro, upserts churches by `googlePlaceId`, imports photos to Supabase Storage. Saturated grid cells (20-result cap) are subdivided automatically; requests retry with backoff on 429/5xx.                                                                                                                                                                                                                                                                                                                                                                                        |
| 2   | `enrich:google-ratings`  | `google-enrich/`     | Refreshes `googleRating` / `googleReviewCount` per place. Default only fills NULLs; `--all` refreshes everything (the orchestrator passes `--all`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 3   | `enrich:website-v2`      | `enrich-website-v2/` | Crawls each visible church's own website (homepage + up to 5 subpages, service-times and visit pages first), then extracts details with a lean `claude -p` call (no tools; `ENRICH_CLAUDE_MODEL` picks the model). Service times and pastor names come ONLY from structured data or the reading pass — never from regex scraping — and every service time must literally appear in the site text (`service-evidence`). Resumable via `enrichment_states`; `--shard I/N` splits the table for parallel runs. Shared platforms (jw.org, Facebook…) are skipped. `--stale-days N` re-processes applied churches older than N days. |
| 4   | `enrich:church-details`  | `enrich-details/`    | Local heuristics, no network: hides non-church listings and duplicates (`listing-quality`), derives denomination from name / website host / stored label (`denomination-classifier`), neighborhood from postal city + zip (`neighborhood-mapper`), languages, cover image, and deletes auto-imported service rows that are office hours or other artifacts (`service-cleaner`). `--reclassify-denominations` re-derives ONLY denomination fields and clears labels the classifier no longer supports; `--remap-neighborhoods` re-derives ONLY neighborhoods.                                                                    |

Parallel website run: `for i in 1 2 3 4; do npm run enrich:website-v2 -- --shard $i/4 & done; wait`

Requirements: `GOOGLE_PLACES_API_KEY` (stages 1–2), Supabase storage env vars
(stage 1 photos), `claude` CLI on PATH (stage 3, or `--skip-websites` /
`--skip-ai`), database access (all).

## Data-safety rules

- **A service time needs evidence.** The website stage keeps a time only if
  that time is written on the church's pages, and takes schedules only from
  the reading pass, which is told to ignore dated announcements, holy-day
  schedules and office hours. The old regex pass ("any weekday followed by a
  time") turned "All Souls' Day Masses 8:00 am and 6:30 pm" into a standing
  weekly schedule and is gone.

- **Opening hours are not service times.** Google's `regularOpeningHours` and
  a website's schema.org `openingHours` say when the office is open. Neither
  stage turns them into `church_services` rows any more (they used to, which
  is where "Monday 9:00 AM service" rows came from), and the website stage
  runs every extracted schedule through `service-cleaner` before saving it.

- **Hand-curated services are preserved.** Stages only replace or delete
  rows flagged `isAutoImported`.
- **Listings are hidden, never deleted.** Non-churches and duplicates get
  `isHidden = true` with a `hiddenReason`; a re-import leaves the flag alone.
  Set `hiddenReason = 'manual'` to hide a listing by hand — the pipeline never
  un-hides those.
- **Unknown stays unknown.** The classifier returns no denomination rather
  than a guess, and the service cleaner deletes times it cannot stand behind;
  a blank field is better than a wrong one.
- **Only auto-imported service rows are deleted**, and only when they match
  an artifact pattern (same generic time on 3+ weekdays, a start equal to
  another service's end, a generic row beside a typed Mass schedule,
  implausible hours).
- **Low confidence ≠ failed.** Website extractions below the 0.5 confidence
  gate get `status = 'needs_review'` in `enrichment_states`; inspect
  `extractedData` and either re-run with `--force-low-confidence` or fix the
  source site.

## Operational runbook

- **Full refresh (quarterly-ish):** `npm run pipeline:run -- --stale-days 90`
- **Cheap refresh (no Google quota):**
  `npm run pipeline:run -- --skip-import --skip-ratings`
- **After classifier or neighborhood-map changes:**
  `npm run enrich:church-details -- --reclassify-denominations --remap-neighborhoods`
  (add `--dry-run` first to review the diff). Rule fixes do nothing for
  existing rows until this runs — the 2026-11 audit found 119 churches still
  carrying a Catholic label from a rule that had been fixed months earlier.

## Data audit, 2026-11-11

All 955 live listings were audited through the public API. Findings, all
repaired by migration `20261111000100_repair_church_data` (generated from the
enrich-details modules; guarded so it only touches rows still holding the
audited value):

- 51 listings that are not places of worship or are duplicates → hidden.
- 225 wrong or missing denominations, 119 of them "Catholic" labels left by
  an old "San Antonio" name rule.
- 446 neighborhood labels (wrong zip mapping, suburbs, duplicate spellings).
- 75 churches listed as Spanish-speaking only because of the city name.
- 835 service rows at 107 churches that were office hours or artifacts.

Still open after the repair: ~270 visible churches with no known
denomination, ~450 with no service times, ~360 with no description and ~130
with no photos. Those need the website and Google stages re-run against
production (`npm run pipeline:run`).

## History

- `enrich-website` (v1) was superseded by `enrich-website-v2` and deleted on
  2026-07-13 (single-page, not resumable, no rate-limit detection).
- The pipeline is currently run manually. If/when scheduling is wanted, a
  Render Cron Job or GitHub Actions schedule invoking `pipeline:run` is the
  intended home.

_Created: 2026-07-13_
