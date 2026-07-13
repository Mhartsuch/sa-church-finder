# Church Data Pipeline

> How church records get into the database and enriched. All stages live in
> `server/src/scripts/` and run against `DATABASE_URL`.

## One command

```bash
npm run pipeline:run -- [--dry-run] [--limit N] [--stale-days N] \
  [--skip-import] [--skip-ratings] [--skip-websites] [--skip-details] [--continue]
```

`server/src/scripts/pipeline/run.ts` sequences the four stages below in
order (each as its own process), then deletes one-off auto-imported events
that ended more than a day ago. A failed stage stops the run unless
`--continue` is passed.

## Stages

| # | npm script (root)        | Source                              | What it does                                                                                         |
| - | ------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1 | `import:google-churches` | `google-import/`                    | Grid-searches Google Places (New) over the SA metro, upserts churches by `googlePlaceId`, imports photos to Supabase Storage. Saturated grid cells (20-result cap) are subdivided automatically; requests retry with backoff on 429/5xx. |
| 2 | `enrich:google-ratings`  | `google-enrich/`                    | Refreshes `googleRating` / `googleReviewCount` per place. Default only fills NULLs; `--all` refreshes everything (the orchestrator passes `--all`). |
| 3 | `enrich:website-v2`      | `enrich-website-v2/`                | Crawls each church's website (homepage + up to 5 subpages), extracts details deterministically then via `claude -p`, applies high-confidence results. Resumable via the `enrichment_states` table; low-confidence extractions park as `needs_review` with the snapshot kept in `extractedData`. `--stale-days N` re-processes applied churches older than N days. |
| 4 | `enrich:church-details`  | `enrich-details/`                   | Local heuristics: denomination from name, neighborhood from zip, languages, cover image. `--reclassify-denominations` re-derives ONLY denomination fields (use after classifier rule changes). |

Requirements: `GOOGLE_PLACES_API_KEY` (stages 1–2), Supabase storage env vars
(stage 1 photos), `claude` CLI on PATH (stage 3, or `--skip-websites` /
`--skip-ai`), database access (all).

## Data-safety rules

- **Claimed churches are leader-curated.** No stage overwrites a claimed
  church's existing values — null fields are still filled.
- **Hand-curated services/events are preserved.** Stages only replace rows
  flagged `isAutoImported`.
- **Nothing is deleted by enrichment** except past one-off auto-imported
  events in the orchestrator's cleanup step.
- **Low confidence ≠ failed.** Website extractions below the 0.5 confidence
  gate get `status = 'needs_review'` in `enrichment_states`; inspect
  `extractedData` and either re-run with `--force-low-confidence` or fix the
  source site.

## Operational runbook

- **Full refresh (quarterly-ish):** `npm run pipeline:run -- --stale-days 90`
- **Cheap refresh (no Google quota):**
  `npm run pipeline:run -- --skip-import --skip-ratings`
- **After classifier rule changes:**
  `npm run enrich:church-details -- --reclassify-denominations` (add
  `--dry-run` first to review the diff)
- **Ribbon categories backfill:** `npm run db:seed:ribbon` (idempotent,
  upserts only — safe against production)

## History

- `enrich-website` (v1) was superseded by `enrich-website-v2` and deleted on
  2026-07-13 (single-page, not resumable, no rate-limit detection).
- The pipeline is currently run manually. If/when scheduling is wanted, a
  Render Cron Job or GitHub Actions schedule invoking `pipeline:run` is the
  intended home.

_Created: 2026-07-13_
