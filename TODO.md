# Task Board

> Persistent task tracking that survives across sessions. Agents should check this before starting work and update it when finishing.

## Priorities
- **P0 - Critical:** Blocking progress, fix immediately
- **P1 - High:** Important for current milestone
- **P2 - Medium:** Should be done soon
- **P3 - Low:** Nice to have, do when convenient

## Current Milestone
**Milestone:** 1 - Core Search & Discovery (MVP)  
**Target Date:** TBD  
**Goal:** Working search page with map view, list view, and church profile page.

---

## Tasks

### P0 - Critical
- [x] Set up PostgreSQL + PostGIS database, run Prisma migrations, seed database - Supabase cloud (us-west-2), completed 2026-03-28
- [ ] **Deploy to Render** - `render.yaml` now defines both backend and frontend services, but the dashboard deploy flow is still manual. Remaining work: trigger the deploys, set `VITE_API_URL` on the frontend, update `CLIENT_URL` on the backend, and verify the live site end-to-end.

### P1 - High
- [x] Build Church Profile Page (F1.3 - hero, about, services, location, contact) - completed 2026-03-27
- [x] Integrate Mapbox GL JS when token is available (replace MapPlaceholder) - completed 2026-03-27
- [x] Implement map pin clustering for zoomed-out views - completed 2026-03-27
- [x] Add viewport-based querying (update results as map pans) - completed 2026-03-27
- [x] Make URL reflect search state (shareable/bookmarkable) - completed 2026-03-27

### P2 - Medium
- [x] Add responsive layout (mobile tabs for map/list) - completed 2026-03-27
- [x] Add loading skeleton animations to ChurchCard - shimmer effect component, completed 2026-03-27
- [x] Implement "no results" suggestions (widen radius, change filters) - completed 2026-03-27
- [x] Write database seed script with proper PostGIS location column - completed 2026-03-27
- [ ] Upgrade deprecated deps (`eslint` 8 -> 9, `multer` 1 -> 2, `supertest` 6 -> 7)
- [ ] Review lazy-loaded Mapbox bundle size warning and optimize only if it becomes a real production issue

### P3 - Low
- [ ] Add Husky + lint-staged for pre-commit hooks
- [x] Set up GitHub Actions CI (lint, typecheck, test on PRs) - workflows created, CI fixes applied (2026-03-27)
- [ ] Set up error monitoring (Sentry free tier)
- [ ] Add keyboard navigation support for search results

### Completed
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
- [x] Create Prisma schema from `DATA_MODELS.md` (2026-03-26)
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
- npm deprecation warnings (`eslint` 8, `multer` CVE, `inflight`) - non-blocking
- 13 moderate vulns in client, 30 vulns in server (transitive deps) - not urgent

---
*Last updated: 2026-03-28 (baseline stabilized; deployment still pending)*
