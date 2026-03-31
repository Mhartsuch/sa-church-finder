# Agent Briefing

> Read this first. This file is written specifically for AI agent sessions picking up this project. It should give a fast, accurate picture of where the app stands right now.

## What You Need to Know Right Now

### Project in One Paragraph

SA Church Finder is an Airbnb-style web app for discovering churches in San Antonio, Texas. It uses React + TypeScript on the frontend and Node.js/Express + Prisma/PostgreSQL (PostGIS) on the backend. Milestone 1 core search and discovery work is implemented, including the search page, church profile page, URL-synced filters, responsive mobile map/list behavior, and a Mapbox-powered interactive map with clustering and viewport-based querying. Milestone 2 auth and account work is now complete in-app, and Milestone 3 has started with a public church-events foundation: church profile pages can now load upcoming events via a dedicated API with type/date filters, seeded data, and upcoming-this-week summary cards. The immediate delivery focus is temporarily shifted from new milestone expansion to MVP demo readiness.

### Current Priority

Prioritize MVP demo readiness over new Milestone 3 slices for now. The immediate top priority is restoring live auth/session flows on Render: the 2026-03-30 production smoke test confirmed that `POST /api/v1/auth/register` and `POST /api/v1/auth/login` are currently returning `500`, which blocks live auth, saved churches, and review mutations. A migration-managed `user_sessions` fix is now in the repo and still needs a backend redeploy. Once that is live, continue the broader smoke test, curate 25-50 polished real San Antonio church profiles, and finish launch/domain readiness so the app is easy to demo credibly on a public URL. Church claim flows, admin ownership tooling, and broader events discovery remain the next roadmap work, but they are temporarily deferred unless they directly unblock the demo. SMTP is considered configured in the live environments per user confirmation, while Google sign-in and optional Sentry still depend on environment-specific credentials where those integrations should be active.

### Recently Completed

- Ran the first Render smoke-test pass on 2026-03-30 and confirmed the live frontend, church search API, church profile API, and frontend profile route are reachable, while also catching a production auth regression where register/login now return `500` before any session cookie is established
- Landed a production auth fix locally by adding a committed Prisma SQL migration for the `user_sessions` table, switching the session store to rely on migration-managed schema in production, and updating the Render backend build to run `npx prisma migrate deploy` automatically during deploys
- Replaced the church profile page's fake photo-gallery placeholders with a real visit-summary hero and planning cards so profiles still feel deliberate while the dataset has no curated cover images yet
- Audited the current seeded church dataset and documented the biggest MVP-demo data gaps in `docs/MVP_DATASET_AUDIT.md`, including zero seeded cover images, sparse profile emails, inconsistent service labeling, and a likely bad ZIP for Friendship West Baptist Church
- Verified the current repository baseline for MVP work: root `lint`, `typecheck`, `test`, and `build` all passed on 2026-03-30 (tests and build required rerunning outside the Windows sandbox because Vite/Vitest process spawning hit `spawn EPERM`)
- Added the Milestone 3 church-events foundation end to end: new `GET /api/v1/churches/:slug/events` filtering API, seeded upcoming sample events, and a church-profile events section with type/date filters plus upcoming-this-week and next-gathering summaries
- Added deployment-readiness visibility for backend integrations: `/api/v1/health` now reports safe readiness status for SMTP email delivery, Google OAuth, and server-side Sentry, and production startup logs warn when those integrations are missing or only partially configured
- Tightened SMTP configuration validation so half-configured credentials no longer look "ready"; for example, setting `SMTP_USER` without `SMTP_PASS` now correctly reports a partial setup instead of silently attempting unauthenticated delivery
- Added env-gated Sentry monitoring to both runtimes: browser-side initialization plus a root error boundary fallback in the React app, and server-side exception capture plus fatal-process flushing in the Express API
- Added Husky + lint-staged at the repo root so staged client/server files auto-run through the existing ESLint configs plus Prettier on commit, and the existing pre-push quality gate is now wired through Husky as well
- Optimized the production map bundle by runtime-loading Mapbox GL JS from Mapbox's CDN and removing the 1.7 MB lazy `mapbox-gl` chunk from the Vite build
- Added SMTP-backed auth email delivery for password reset and email verification, while preserving opt-in preview-link fallback for local development
- Refreshed the signed-in account page UX so it reads like a member dashboard instead of an internal milestone checklist, with clearer empty states and more useful guidance
- Added review moderation end to end: authenticated review reporting, a site-admin flagged-review queue, and moderation resolution actions on the account page
- Added Google OAuth end to end: backend `/auth/google` start + callback flow, safe `returnTo` redirect handling, Google account creation/linking, and login/register Google entry points with redirect error messaging
- Added email verification end to end: verification-token persistence + migration, register-time token issuance, resend/consume APIs, a `/verify-email` page, and an account-page resend flow with opt-in local preview support
- Added review helpful voting end to end: helpful/unhelpful APIs, viewer vote state in review payloads, and live helpful controls on church profile reviews
- Added the forgot/reset password flow end to end: reset-token issuance + consumption APIs, frontend forgot/reset screens, and an opt-in local preview link for development
- Added the reviews MVP end to end: church review list/create/edit/delete APIs, account review history, aggregate rating/count updates, and real review UI on church profiles
- Added the saved churches MVP end to end: protected save/list APIs, session-aware church payloads, live save/unsave controls on cards and church profiles, and a real saved churches list on the account page
- Added frontend auth UI with real login/register pages, protected account routing, session-aware header state, and client-side current-session integration
- Replaced the in-memory data layer with Prisma + PostGIS spatial queries
- Connected the app to a live Supabase Postgres/PostGIS database and seeded sample data
- Added the interactive Mapbox map with clustering and viewport-based querying
- Implemented shareable URL search state, mobile map/list UX, loading skeletons, and no-results suggestions
- Improved keyboard accessibility across search results, fixed the faux submit controls in shared/header search UI, and cleaned up nullable server typing drift
- Upgraded the maintenance-risk dependencies: ESLint 9 with flat config, `multer` 2, and `supertest` 7
- Replaced the placeholder auth routes with real session-backed local auth endpoints and route tests
- Added Render deployment configuration for both backend and frontend
- Verified the live Render deployment and hardened the frontend against missing `VITE_API_URL` wiring
- Re-stabilized the local baseline so lint, typecheck, tests, and production builds all pass

### Known Blockers

- Live auth is currently broken on Render until the backend is redeployed with the committed `user_sessions` migration; as of the 2026-03-30 smoke test, `/api/v1/auth/register` and `/api/v1/auth/login` both return `500`
- The current curated dataset is still too small and uneven for a strong demo; the seed currently covers 22 churches and now needs a polished 25-50 church MVP shortlist
- A stable custom domain and the related frontend/backend callback URL updates still need to be finalized before the most credible public demo
- A Mapbox token is still required anywhere the live interactive map should be enabled
- Google OAuth is implemented in-app now, but each environment still needs valid Google OAuth credentials plus an authorized redirect URI before live sign-in will work there
- `/api/v1/health` now exposes safe readiness flags for SMTP, Google OAuth, and server Sentry so deployment setup gaps can be checked without digging through logs
- Sentry monitoring is implemented in-app now, but each environment still needs `SENTRY_DSN` and/or `VITE_SENTRY_DSN` configured before events will actually flow to Sentry there

## Where Things Are

### File Structure Overview

```text
sa-church-finder/
|-- client/                     # React + Vite frontend
|   `-- src/
|       |-- components/         # Church cards, filters, layout, map UI
|       |-- pages/              # Home, search, and church profile pages
|       |-- hooks/              # React Query + URL state hooks
|       |-- stores/             # Zustand search state
|       `-- api/                # Frontend API layer
|-- server/                     # Express + Prisma backend
|   |-- src/
|   |   |-- routes/             # REST endpoints
|   |   |-- services/           # Church search/detail data access
|   |   |-- middleware/         # Validation + error handling
|   |   `-- lib/                # Logger and Prisma client
|   `-- prisma/                 # Schema, migrations, seed
|-- render.yaml                 # Render blueprint for frontend + backend
|-- PROGRESS.md                 # Session-by-session work log
|-- TODO.md                     # Prioritized task board
|-- QUICKSTART.md               # Local setup and useful commands
`-- docs/                       # Supporting project docs
```

### Important Files to Read

1. This file (`AGENT_BRIEFING.md`)
2. `PROJECT_CONTEXT.md` for the broader product context
3. `ARCHITECTURE.md` for system design and data flow
4. `CONVENTIONS.md` for coding rules
5. `DECISIONS.md` for past architectural choices
6. `PROGRESS.md` and `TODO.md` for current execution state
7. `docs/MVP_PROFILE_CURATION.md` for the temporary MVP church-data curation queue
8. `docs/MVP_DATASET_AUDIT.md` for the seed-wide audit findings and first-pass cleanup order

## Conventions to Follow

### Naming

- Files: kebab-case (`church-service.ts`, `review-card.tsx`)
- Components: PascalCase (`ChurchCard.tsx`, `InteractiveMap.tsx`)
- Functions and variables: camelCase (`getChurchById`, `currentFilters`)
- Database: snake_case (`church_services`, `user_reviews`)
- API endpoints: kebab-case plural (`/api/v1/churches`, `/api/v1/reviews`)
- Branches: `type/description` (`feature/church-search`, `fix/map-clustering`)

### Style

- TypeScript strict mode; avoid `any`
- Functional components with hooks only
- Named exports preferred over default exports except page components
- API responses should follow the `{ data, meta, error }` envelope pattern

### Workflow

- Feature branches off `main`
- Commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- New features should include tests where practical
- Run `npm run lint` and `npm run typecheck` before committing

## Do Not Do These Things

1. Do not add dependencies without checking whether existing dependencies already cover the use case.
2. Do not use `any` in TypeScript; use `unknown` and narrow, or define proper types.
3. Do not store secrets in code; use environment variables.
4. Do not skip error handling on API routes.
5. Do not modify the database schema without updating `DATA_MODELS.md`.
6. Do not assume old docs describing the in-memory data layer are still accurate; the app now depends on Prisma/PostGIS.

## Session End Checklist

When you finish a session, update:

- This file's current state summary if priorities changed
- `PROGRESS.md` with what was accomplished
- `DECISIONS.md` if any significant choices were made
- `TODO.md` to reflect completed and new tasks

---

_Last updated: 2026-03-30 by Codex_
