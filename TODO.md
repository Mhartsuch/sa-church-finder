# Task Board

> Persistent task tracking that survives across sessions. Agents should check this before starting work and update it when finishing.

## Priorities
- **P0 - Critical:** Blocking progress, fix immediately
- **P1 - High:** Important for current milestone
- **P2 - Medium:** Should be done soon
- **P3 - Low:** Nice to have, do when convenient

## Current Milestone
**Milestone:** Milestone 2 - User Accounts & Reviews (Foundation)  
**Target Date:** TBD  
**Goal:** Land the authentication and account foundation needed for reviews, saved churches, and user profiles.

---

## Tasks

### P0 - Critical
- [x] Set up PostgreSQL + PostGIS database, run Prisma migrations, seed database - Supabase cloud (us-west-2), completed 2026-03-28
- [x] **Deploy to Render** - backend + frontend live on Render, env wiring verified, and live site smoke-tested end-to-end (2026-03-28)

### P1 - High
- [x] Replace placeholder auth API with real local session-based auth (`register`, `login`, `logout`, `me`) - completed 2026-03-28
- [x] Add auth UI and client-side current-session integration - completed 2026-03-28
- [x] Build saved churches MVP (save/unsave on cards + profile, account list) - completed 2026-03-28
- [x] Build reviews MVP (create/edit review flow, church profile list, account history) - completed 2026-03-28
- [ ] Finish auth follow-ups: Google OAuth, email verification, and forgot/reset password
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
- [x] Upgrade deprecated deps (`eslint` 8 -> 9, `multer` 1 -> 2, `supertest` 6 -> 7) - completed 2026-03-28
- [ ] Add review helpful voting and moderation follow-ups after the MVP
- [ ] Review lazy-loaded Mapbox bundle size warning and optimize only if it becomes a real production issue

### P3 - Low
- [ ] Add Husky + lint-staged for pre-commit hooks
- [x] Set up GitHub Actions CI (lint, typecheck, test on PRs) - workflows created, CI fixes applied (2026-03-27)
- [ ] Set up error monitoring (Sentry free tier)
- [x] Add keyboard navigation support for search results - result cards, search submit controls, and popup CTA made keyboard-accessible (2026-03-28)

### Completed
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
- Lazy-loaded `mapbox-gl` chunk still exceeds Vite's size warning threshold - monitor before optimizing
- 4 moderate vulns in client, 1 moderate vuln in server after the dependency sweep - not urgent

---
*Last updated: 2026-03-28 (reviews MVP landed)*
