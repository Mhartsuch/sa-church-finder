# Task Board

> Check before starting work; update when finishing. History lives in git.

## P0 — Ship the lean overhaul (see `specs/lean-overhaul.md`)

- [ ] Merge the overhaul branch and redeploy **both** Render services. The API build runs
      `prisma migrate deploy`, which applies `20261106000000_lean_overhaul` and **drops** the
      events, forum, passport, claims, review-vote, and ribbon-category tables.
- [ ] Smoke-test the live site: browse grid, category bar, filters modal, map toggle, church
      profile, log in / sign up (email + Google), save to wishlist, write a review.
- [ ] Confirm the Render static site still sets `VITE_MAPBOX_TOKEN`; without it the map shows
      an "unavailable" message.

## P1 — Photos are the product

- [ ] Run `npm run pipeline:run` against production so every church has Google Places photos;
      churches without photos rank last and show a placeholder.
- [ ] Spot-check the top 50 churches for low-quality or off-topic photos and reorder via
      `displayOrder`.
- [ ] Consider a paid Render instance for the API to remove cold starts (the `keepalive`
      workflow only mitigates them).

## P2 — Nice to have

- [ ] Neighborhood landing pages (`/?neighborhood=...`) linked from the footer for SEO.
- [ ] Major-upgrade train: React 19, Vite 6+, Vitest 3+, Prisma 6, Express 5, Tailwind 4, Zod 4.
- [ ] Delete stale `claude/*` remote branches (needs a credentialed environment).
