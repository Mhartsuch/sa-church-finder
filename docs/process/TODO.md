# Task Board

> Check before starting work; update when finishing. History lives in git.

## P0 — Fill the remaining data gaps (needs production credentials)

The 2026-11-11 audit repaired everything that could be fixed from the data we
already hold (see `docs/engineering/DATA_PIPELINE.md` → "Data audit"). What is
left needs the pipeline run against production, from a machine that has
`DATABASE_URL`, `GOOGLE_PLACES_API_KEY`, the Supabase storage keys and the
`claude` CLI:

- [ ] `npm run pipeline:run -- --stale-days 30` — of 904 visible churches,
      ~450 have no service times, ~360 no description, ~270 no known
      denomination and ~130 no photos. The website stage now refuses office
      hours and self-named denominations, so a re-run is safe.
- [ ] Work the `needs_review` queue in `enrichment_states` afterwards.
- [ ] Coverage check: the import found 955 places; Bexar County has more
      congregations than that. Re-run `import:google-churches` and compare.
- [ ] Decide whether to schedule the pipeline (GitHub Actions or a Render Cron
      Job). `enrich:church-details` alone needs only `DATABASE_URL` and keeps
      hidden-listing, denomination and service-artifact rules applied.

## P1 — Operations

- [ ] **Fix API cold starts.** The free Render API sleeps after ~15 idle
      minutes and takes 30–60s to wake. Best fix: Render Starter plan. Free
      fallback: a 5-minute uptime monitor on `/api/v1/health`, or re-enable the
      `keepalive` workflow (GitHub auto-disabled it on 2026-09-11).
- [ ] Confirm the Render static site sets `VITE_MAPBOX_TOKEN`; without it the
      map shows an "unavailable" message.
- [ ] Mailbox check: profiles now link "Report a correction" to
      `admin@sachurchfinder.com` — make sure someone reads it.
- [ ] Cover photos were hand-curated for the top 200 churches only. Spot-check
      further down the ranking and reorder via `church_photos.displayOrder`
      (keep `churches.coverImageUrl` in step).

## P2 — Nice to have

- [ ] Neighborhood landing pages (`/?neighborhood=...`) linked from the footer for SEO.
- [ ] Major-upgrade train: React 19, Vite 6+, Vitest 3+, Prisma 6, Express 5, Tailwind 4, Zod 4.
- [ ] Delete stale `claude/*` remote branches (needs a credentialed environment).
