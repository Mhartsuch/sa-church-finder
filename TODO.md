# Task Board

> Persistent task tracking that survives across sessions. Agents should check this before starting work and update it when finishing.

## Priorities
- **P0 — Critical:** Blocking progress, fix immediately
- **P1 — High:** Important for current milestone
- **P2 — Medium:** Should be done soon
- **P3 — Low:** Nice to have, do when convenient

## Current Milestone
**Milestone:** 1 — Core Search & Discovery (MVP)
**Target Date:** TBD
**Goal:** Working search page with map view, list view, and church profile page.

---

## Tasks

### P0 — Critical
- [ ] Start Docker PostgreSQL, run Prisma migrations, seed database

### P1 — High
- [ ] Build Church Profile Page (F1.3 — hero, about, services, location, contact)
- [ ] Integrate Mapbox GL JS when token is available (replace MapPlaceholder)
- [ ] Implement map pin clustering for zoomed-out views
- [ ] Add viewport-based querying (update results as map pans)
- [ ] Make URL reflect search state (shareable/bookmarkable)

### P2 — Medium
- [ ] Add responsive layout (mobile tabs for map/list)
- [ ] Add loading skeleton animations to ChurchCard
- [ ] Implement "no results" suggestions (widen radius, change filters)
- [ ] Write database seed script with proper PostGIS location column
- [ ] Upgrade deprecated deps (eslint 8→9, multer 1→2, supertest 6→7)

### P3 — Low
- [ ] Add Husky + lint-staged for pre-commit hooks
- [ ] Set up GitHub Actions CI (lint, typecheck, test on PRs)
- [ ] Set up error monitoring (Sentry free tier)
- [ ] Add keyboard navigation support for search results

### Completed
- [x] npm install and build verification — app runs end-to-end (2026-03-27)
- [x] Created server/.env with Docker DATABASE_URL (2026-03-27)
- [x] Fixed ChurchList onClick type mismatch and sort dropdown type safety (2026-03-27)
- [x] Project planning and architecture documentation (2026-03-26)
- [x] Data model design (2026-03-26)
- [x] API specification (2026-03-26)
- [x] Feature specifications (2026-03-26)
- [x] Coding conventions (2026-03-26)
- [x] Set up monorepo structure (client/, server/, shared scripts) (2026-03-26)
- [x] Initialize React + Vite + TypeScript frontend (2026-03-26)
- [x] Initialize Express + TypeScript backend (2026-03-26)
- [x] Create Prisma schema from DATA_MODELS.md (2026-03-26)
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
- Church data import pipeline (Google Places API → database)
- Email notification system (welcome, review responses, claim updates)
- Analytics dashboard for church admins
- A/B test different search result layouts
- Explore Elasticsearch if PostgreSQL FTS becomes a bottleneck
- Multi-city expansion architecture

## Known Bugs
- npm deprecation warnings (eslint 8, multer CVE, inflight) — non-blocking
- 13 moderate vulns in client, 30 vulns in server (transitive deps) — not urgent

---
*Last updated: 2026-03-27*
