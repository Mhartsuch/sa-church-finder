# Task Board

> Persistent task tracking that survives across sessions. Agents should check this before starting work and update it when finishing.

## Priorities

- **P0 - Critical:** Blocking progress, fix immediately
- **P1 - High:** Important for current milestone
- **P2 - Medium:** Should be done soon
- **P3 - Low:** Nice to have, do when convenient

## Current Milestone

**Milestone:** Milestone 3 - Church Claim & Admin Ownership  
**Target Date:** TBD  
**Goal:** Let church representatives claim listings and unlock the church-admin workflow that will power event creation/editing and future listing-management tools.
**Roadmap Note:** The temporary MVP-demo detour is complete. Keep Milestone 3 moving forward from the shipped public events foundation, while still tracking the live auth deployment regression as a separate production blocker.

---

## Tasks

### P0 - Critical

- [ ] Restore live auth/session flows on the deployed app by redeploying the backend with the Prisma-backed session-store fix - the rerun from `https://sachurchfinder.com` now shows CORS is healthy, but `POST /api/v1/auth/register` and `POST /api/v1/auth/login` still return `500`, which keeps saves and reviews blocked
- [x] Set up PostgreSQL + PostGIS database, run Prisma migrations, seed database - Supabase cloud (us-west-2), completed 2026-03-28
- [x] **Deploy to Render** - backend + frontend live on Render, env wiring verified, and live site smoke-tested end-to-end (2026-03-28)
- [x] Run MVP baseline audit (`lint`, `typecheck`, `test`, `build`) - completed 2026-03-30

### P1 - High

- [x] Build church-admin event creation/edit tools now that approved claims can establish church-admin ownership - church admins and site admins can now create, update, and delete events for churches they manage via the Leaders Portal, backed by new `/api/v1/churches/:churchId/events` POST and `/api/v1/events/:id` PATCH/DELETE endpoints (2026-04-11)
- [x] Add aggregated events discovery/feed page after church-admin event tools are live - added `GET /api/v1/events` aggregated feed with type/date/keyword filters, pagination, and church info joins, plus a public `/events` discovery page with URL-synced filters, empty/loading/error states, pagination, and new Header + Footer + Sitemap nav entries (2026-04-11)
- [x] Build Milestone 3 church claim request flow - added member-facing claim submission on unclaimed church profiles, account-page claim history, a site-admin approval queue, and server/client coverage (2026-03-31)
- [ ] Smoke test the current live flows end to end on the deployed app (search, profile, auth, saves, reviews, events)
- [x] Curate a gold set of 12 real San Antonio churches for the polished MVP dataset - the seed now uses a curated 12-church hero set with real cover images and only high-confidence profiles (2026-03-30)
- [x] Refine church profiles so the shortlisted records have trustworthy descriptions, contact info, website links, service details, and clean metadata - completed for the current 12-church gold set with real cover images and honest zero-review baselines (2026-03-30)
- [x] Review the current seeded/live dataset for rough copy, inconsistent naming, weak images, and missing fields that hurt the demo - seed audit documented in `docs/product/data/MVP_DATASET_AUDIT.md` (2026-03-30)
- [x] Prepare the launch-ready deployment checklist for a shareable domain (Render settings, env vars, callback URLs, and DNS/custom-domain wiring) - user confirmed `sachurchfinder.com` is live; repo defaults updated for the custom frontend origin (2026-03-30)
- [x] Replace placeholder auth API with real local session-based auth (`register`, `login`, `logout`, `me`) - completed 2026-03-28
- [x] Add auth UI and client-side current-session integration - completed 2026-03-28
- [x] Build saved churches MVP (save/unsave on cards + profile, account list) - completed 2026-03-28
- [x] Build reviews MVP (create/edit review flow, church profile list, account history) - completed 2026-03-28
- [x] Build forgot/reset password flow (reset-token APIs, frontend pages, and opt-in local preview link) - completed 2026-03-28
- [x] Build email verification flow (token APIs, verification page, account resend action, and opt-in local preview link) - completed 2026-03-28
- [x] Finish auth follow-up: Google OAuth - completed 2026-03-29
- [x] Build Church Profile Page (F1.3 - hero, about, services, location, contact) - completed 2026-03-27
- [x] Integrate Mapbox GL JS when token is available (replace MapPlaceholder) - completed 2026-03-27
- [x] Implement map pin clustering for zoomed-out views - completed 2026-03-27
- [x] Add viewport-based querying (update results as map pans) - completed 2026-03-27
- [x] Make URL reflect search state (shareable/bookmarkable) - completed 2026-03-27

### P2 - Medium

- [x] Configure real SMTP provider credentials in each live environment so auth emails send outside local development - user confirmed live setup completed 2026-03-30
- [x] Expand recurring-event handling beyond stored RRULE metadata - added an in-house RRULE parser/expander (`server/src/lib/recurrence.ts`) that supports `FREQ=DAILY|WEEKLY|MONTHLY`, `INTERVAL`, `BYDAY`, `COUNT`, and `UNTIL`; events are validated and canonicalized on write and expanded into per-occurrence payloads (with new `occurrenceId` / `seriesStartTime` / `isOccurrence` fields) on read for both the church profile feed and the aggregated `/events` feed, plus a recurrence picker on the admin Event form and `expand=false` for the Leaders Portal series view (2026-04-11)
- [x] Launch church events foundation on church profile pages (public events API, type/date filters, upcoming-this-week summary, and seeded sample events) - completed 2026-03-30
- [x] Refresh account page UX copy and empty states so the signed-in experience feels member-facing instead of reading like an internal milestone checklist - completed 2026-03-29
- [x] Add responsive layout (mobile tabs for map/list) - completed 2026-03-27
- [x] Add loading skeleton animations to ChurchCard - shimmer effect component, completed 2026-03-27
- [x] Implement "no results" suggestions (widen radius, change filters) - completed 2026-03-27
- [x] Write database seed script with proper PostGIS location column - completed 2026-03-27
- [x] Upgrade deprecated deps (`eslint` 8 -> 9, `multer` 1 -> 2, `supertest` 6 -> 7) - completed 2026-03-28
- [x] Add review helpful voting follow-up after the MVP - completed 2026-03-28
- [x] Add review moderation follow-ups after the MVP - completed 2026-03-29
- [x] Wire real transactional email delivery for auth emails (password reset + verification) - completed 2026-03-29
- [x] Review lazy-loaded Mapbox bundle size warning and optimize the production bundle by runtime-loading Mapbox GL from CDN instead of bundling the library - completed 2026-03-30

### P3 - Low

- [x] Add Husky + lint-staged for pre-commit hooks - completed 2026-03-30
- [x] Set up GitHub Actions CI (lint, typecheck, test on PRs) - workflows created, CI fixes applied (2026-03-27)
- [x] Set up error monitoring (Sentry free tier) - env-gated browser + server capture landed, docs/Render wiring added (2026-03-30)
- [x] Add keyboard navigation support for search results - result cards, search submit controls, and popup CTA made keyboard-accessible (2026-03-28)

### Completed

- [x] Recurring-event RRULE expansion - added `server/src/lib/recurrence.ts` with a focused iCal parser/expander, write-time validation and canonicalization inside `event.service.ts`, occurrence-aware read paths for `GET /api/v1/churches/:slug/events` and `GET /api/v1/events` (with an `expand=false` escape hatch for admins managing the series template), new `occurrenceId` / `seriesStartTime` / `isOccurrence` fields on event payloads, a recurrence picker on the Leaders Portal event form, and Jest/Vitest coverage for the library, route expansion, and UI submission (2026-04-11)
- [x] Aggregated events discovery feed - added `GET /api/v1/events` with type/date/keyword filters, pagination, and church join data; a public `/events` page with URL-synced filters, pagination, event cards linking to church profiles, empty/loading/error states, new Header + Footer + Sitemap entry points, and Jest/Vitest coverage (2026-04-11)
- [x] Milestone 3 church-admin event tools - added `POST /api/v1/churches/:churchId/events`, `PATCH /api/v1/events/:id`, `DELETE /api/v1/events/:id` with church-admin/site-admin authorization, an EventManager component on the Leaders Portal, new React Query mutations + toasts, Jest/Vitest coverage, and updated API spec (2026-04-11)
- [x] Milestone 3 church claim request flow - added `POST /api/v1/churches/:id/claim`, `GET /api/v1/users/:id/claims`, `GET/PATCH /api/v1/admin/claims`, church-profile claim UI, account-page claim history, site-admin approval actions, and focused server/client test coverage (2026-03-31)
- [x] MVP dataset narrowed to a 12-church gold set - replaced the broad shortlist with 12 high-confidence San Antonio churches, seeded real cover images for every profile, and stopped seeding synthetic reviews/events so the demo data stays trustworthy (2026-03-30)
- [x] Milestone 3 events foundation - added a public `/api/v1/churches/:slug/events` endpoint with type/date filtering, seeded upcoming events, and a church-profile events section with upcoming-this-week and next-gathering summaries (2026-03-30)
- [x] Church profile empty-media polish - replaced the fake gallery placeholders with a visit-summary hero and planning cards so church profiles still feel intentional before real cover images are curated (2026-03-30)
- [x] MVP shortlist expansion to 25 profiles - completed earlier on 2026-03-30 and later superseded by the tighter 12-church gold-set strategy for demo quality
- [x] MVP dataset seed audit - documented seed-wide data gaps, likely verification risks, and the recommended cleanup order in `docs/product/data/MVP_DATASET_AUDIT.md` (2026-03-30)
- [x] Backend integration readiness visibility - added safe `/api/v1/health` integration status for SMTP/Google/Sentry, production startup warnings for missing live credentials, and stricter SMTP partial-config validation so misconfigured auth email delivery is easier to spot before testing (2026-03-30)
- [x] Husky + lint-staged workflow polish - added root Husky hooks, staged-file ESLint/Prettier rules that reuse the existing client/server configs, a manual `npm run lint-staged` entry point, and documented the new local hook behavior in Quick Start (2026-03-30)
- [x] Error monitoring foundation - added env-gated Sentry setup for the React SPA and Express API, a browser crash fallback, server-side exception capture that skips normal 4xx app errors, Render/env example wiring, and config tests (2026-03-30)
- [x] Mapbox bundle optimization - moved Mapbox GL JS to a runtime CDN loader, aliased the bundled package to a tiny stub, removed the 1.7 MB lazy `mapbox-gl` chunk from the client build, and kept the interactive map flow unchanged (2026-03-30)
- [x] Account page UX refresh - rewrote the signed-in copy to feel member-facing, improved saved/review empty states with clearer next actions, and replaced the internal-looking sidebar checklist with user-centered guidance (2026-03-29)
- [x] Auth email delivery - added SMTP-backed password reset + email verification delivery, preserved opt-in preview links for local development, added auth email templates, Render/env wiring docs, and server auth test coverage (2026-03-29)
- [x] Search workspace UX pass - search-page toolbar with mobile search input, sort control, removable active-filter chips, slide-over advanced filters, and cleaner desktop map/list steering (2026-03-29)
- [x] Review moderation follow-up - authenticated review reporting, site-admin flagged-review queue, moderation resolution actions, and client/server coverage (2026-03-29)
- [x] Google OAuth - backend redirect/callback flow, session-safe return paths, Google account linking/creation, login/register Google CTAs, callback error messaging, and auth/client test coverage (2026-03-29)
- [x] Email verification flow - verification-token model + migration, register-time token issuance, resend + consume APIs, verification page, account resend CTA, local preview mode, and auth/client test coverage (2026-03-28)
- [x] Review helpful voting - helpful/unhelpful endpoints, viewer vote state in review payloads, church profile helpful controls, and client/server test coverage (2026-03-28)
- [x] Forgot/reset password flow - protected token issuance/consumption backend, login recovery UI, opt-in local preview link, auth route tests, and client auth API coverage (2026-03-28)
- [x] Reviews MVP - church review listing/create/edit/delete APIs, incremental aggregate rating updates, church profile review UI, account review history, and route tests (2026-03-28)
- [x] Saved churches MVP - protected save/list APIs, session-aware church payloads, save/unsave controls on cards and profile pages, account saved list, and route tests (2026-03-28)
- [x] Frontend auth UI + client session integration - login/register pages, protected account page, session-aware header, React Query auth hooks, and client auth tests (2026-03-28)
- [x] Local auth foundation - Prisma+bcrypt register/login/logout/me endpoints, session middleware, route validation, auth route tests, and testable app bootstrap (2026-03-28)
- [x] Dependency upgrade sweep - ESLint 9 flat config migration, `multer` 2.1.1, `supertest` 7.2.2, fresh client/server lockfiles, full lint/typecheck/test/build pass (2026-03-28)
- [x] Render deployment verified live - frontend and backend working on Render after env wiring + redeploy (2026-03-28)
- [x] Repository baseline re-stabilized: lint, typecheck, test, and build verified after Prisma/Render work (2026-03-28)
- [x] Supabase cloud database live - PostgreSQL + PostGIS 3.3, 22 churches seeded, spatial queries verified (2026-03-28)
- [x] PostGIS database migration - initial migration SQL with geography column, GIST spatial index, auto-sync trigger (2026-03-27)
- [x] Seed script rewrite - uses Prisma.Decimal, verifies PostGIS, tests spatial query, 5 sample reviews, admin user (2026-03-27)
- [x] ChurchCardSkeleton component - shimmer animation matching exact ChurchCard layout (2026-03-27)
- [x] Mapbox GL JS interactive map with Airbnb-style name-bubble pins, popups, and lazy loading (2026-03-27)
- [x] Map pin clustering - dark circles with count, click-to-zoom, three size tiers (2026-03-27)
- [x] Viewport-based querying - list + map sync via bounds parameter, debounced on pan/zoom (2026-03-27)
- [x] URL-based search state - shareable/bookmarkable URLs with all filters synced (2026-03-27)
- [x] Responsive layout - mobile-first list view, full-screen map/list toggle on small screens (2026-03-27)
- [x] No-results suggestions - contextual empty state with actionable filter-removal buttons (2026-03-27)
- [x] Keyboard navigation support for search results - focusable result cards, accessible search submit buttons, map popup CTA cleanup (2026-03-28)
- [x] Church Profile Page (F1.3) with hero, about, services, location, contact, amenities (2026-03-27)
- [x] Navigation wired: card clicks + map pin clicks -> profile page (2026-03-27)
- [x] Header updated with React Router links (2026-03-27)
- [x] CI pipeline fixed: added ESLint plugins, vitest/jest configs, smoke tests, removed premature Prisma step (2026-03-27)
- [x] GitHub repo created and initial code pushed - https://github.com/Mhartsuch/sa-church-finder (2026-03-27)
- [x] npm install and build verification - app runs end-to-end (2026-03-27)
- [x] Created server/.env with Docker DATABASE_URL (2026-03-27)
- [x] Fixed ChurchList onClick type mismatch and sort dropdown type safety (2026-03-27)
- [x] Project planning and architecture documentation (2026-03-26)
- [x] Data model design (2026-03-26)
- [x] API specification (2026-03-26)
- [x] Feature specifications (2026-03-26)
- [x] Coding conventions (2026-03-26)
- [x] Set up monorepo structure (`client/`, `server/`, shared scripts) (2026-03-26)
- [x] Initialize React + Vite + TypeScript frontend (2026-03-26)
- [x] Initialize Express + TypeScript backend (2026-03-26)
- [x] Create Prisma schema from `docs/engineering/DATA_MODELS.md` (2026-03-26)
- [x] Reorganize project documentation so supporting Markdown lives under `docs/` and the repo root stays focused on entry points (2026-03-31)
- [x] Write database seed script with 22 sample churches (2026-03-26)
- [x] Build backend search API with filtering, sorting, pagination (2026-03-26)
- [x] Build frontend search page with map + list layout (2026-03-26)
- [x] Create Zustand store for search state (2026-03-26)
- [x] Create React Query hooks for data fetching (2026-03-26)
- [x] Build ChurchCard component with hover interactions (2026-03-26)
- [x] Build placeholder map with SVG pins (2026-03-26)
- [x] Build search bar with debounce (2026-03-26)
- [x] Build filter panel (denomination, day, time, language, amenities) (2026-03-26)

---

## Backlog

- Church data import pipeline (Google Places API -> database)
- Email notification system (welcome, review responses, claim updates)
- Analytics dashboard for church admins
- A/B test different search result layouts
- Explore Elasticsearch if PostgreSQL FTS becomes a bottleneck
- Multi-city expansion architecture

## Known Bugs

- Live auth regression on the deployed app - a rerun from `https://sachurchfinder.com` shows the custom-domain CORS headers are now correct, but `POST /api/v1/auth/register` and `POST /api/v1/auth/login` still return `500 Internal Server Error`, so live auth, saved churches, and review mutations remain blocked until the backend is redeployed with the Prisma-backed session-store fix

- ~~Mapbox map not loading on Render (showing SVG placeholder instead)~~ — **Fixed 2026-03-29**: `VITE_MAPBOX_TOKEN` was missing from Render env vars; added to `render.yaml`. Token must be set in Render dashboard and a redeploy triggered.
- 4 moderate vulns in client, 1 moderate vuln in server after the dependency sweep - not urgent

---

_Last updated: 2026-04-15 (events discovery feed now supports a signed-in "From saved churches" filter — `GET /api/v1/events?savedOnly=true` and a toggle on `/events`; `sachurchfinder.com` still needs a backend redeploy for the Prisma session-store auth fix)_
