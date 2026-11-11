# Task Board

> Check before starting work; update when finishing. History lives in git.

## P0 — Fill the remaining data gaps (needs production credentials)

The 2026-11-11 audit repaired everything that could be fixed from the data we
already hold and from the churches' own websites (see `docs/engineering/DATA_PIPELINE.md` → "Data audit"). What is
left needs the pipeline run against production, from a machine that has
`DATABASE_URL`, `GOOGLE_PLACES_API_KEY`, the Supabase storage keys and the
`claude` CLI:

- [ ] Photos and Google ratings: 109 visible churches still have no photos.
      `npm run pipeline:run -- --skip-websites` (stages 1, 2 and 4) fills
      them; it needs the Google and Supabase keys.
- [ ] Service times: 573 of 904 visible churches now have a schedule read
      from their own website (2026-11-11). The other 331 have no website on
      file (186), only a social-media page (43), a site that blocks or is
      down (39), or a site with no weekly schedule (62). Re-run
      `npm run enrich:website-v2 -- --stale-days 90` every quarter; sites
      built with JavaScript frameworks need a rendering fetcher (see
      DATA_PIPELINE.md).
- [ ] Still unknown: denomination for ~250 churches, description for ~270.
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

- [ ] Major-upgrade train: React 19, Vite 6+, Vitest 3+, Prisma 6, Express 5, Tailwind 4, Zod 4.
- [ ] Delete stale `claude/*` remote branches (needs a credentialed environment).
