# Agent Briefing (Legacy)

> **DEPRECATED:** This file is retained for historical context only.
> New agent sessions should use `AGENTS.md` (shared repo brain) and `CLAUDE.md` (Claude-specific).
> Path-scoped rules are in `.claude/rules/`. Feature specs go in `specs/`.

> Original purpose: written specifically for AI agent sessions picking up this project.

## What You Need to Know Right Now

### Project in One Paragraph

SA Church Finder is an Airbnb-style web app for discovering churches in San Antonio, Texas. It uses React + TypeScript on the frontend and Node.js/Express + Prisma/PostgreSQL (PostGIS) on the backend. Milestone 1 core search and discovery work is implemented, including the search page, church profile page, URL-synced filters, responsive mobile map/list behavior, and a Mapbox-powered interactive map with clustering and viewport-based querying. Milestone 2 auth and account work is complete in-app, and Milestone 3 now includes both the public church-events foundation and the first church-ownership slice: representatives can submit church claim requests from unclaimed profiles, see claim history on the account page, and site admins can approve or reject those requests from their dashboard queue.

### Current Priority

The roadmap focus is back on Milestone 3. The next product task is church-admin event creation/edit tooling built on top of approved church claims. Separately, there is still one production blocker to keep in view: the 2026-03-30 production smoke test and follow-up rerun from `https://sachurchfinder.com` confirmed that `POST /api/v1/auth/register` and `POST /api/v1/auth/login` still return `500`, so the deployed app needs one more backend redeploy with the Prisma-backed session-store fix before live auth, saves, and review mutations can be re-verified. The custom domain is live, custom-domain CORS is healthy, and SMTP is considered configured in the live environments per user confirmation. Google sign-in and optional Sentry still depend on environment-specific credentials where those integrations should be active.

### Recently Completed

- Added the Milestone 3 church-claim request flow end to end: new `POST /api/v1/churches/:id/claim`, `GET /api/v1/users/:id/claims`, and `GET/PATCH /api/v1/admin/claims` endpoints, church-profile claim submission UI, account-page claim history, and a site-admin approval queue
- Narrowed the active MVP church dataset to a 12-profile gold set, seeded a real cover image for every active church, and stopped creating synthetic reviews/events so the demo data feels more trustworthy
- Expanded the seeded church dataset from 22 to 25 records by adding Oak Hills Church, First Presbyterian Church of San Antonio, and St. Luke Catholic Church from official public sources, and refreshed several existing profile names/details to better match their current public-facing identities
- Replaced the server's `connect-pg-simple` runtime dependency with a Prisma-backed session store that uses the same database path the rest of the production app already exercises, added a dedicated session-store test suite, and kept the `user_sessions` migration plus Render deploy wiring in place
- Re-ran the live smoke test from `https://sachurchfinder.com` and confirmed the custom-domain CORS headers are now correct, which narrows the remaining live auth failure back to the backend session persistence path instead of origin wiring
- User confirmed the custom frontend domain `sachurchfinder.com` is now live, and the repo defaults were updated so future backend deploys allow both the custom domain and the legacy Render frontend URL as valid client origins
- Ran the first Render smoke-test pass on 2026-03-30 and confirmed the live frontend, church search API, church profile API, and frontend profile route are reachable, while also catching a production auth regression where register/login now return `500` before any session cookie is established
- Landed an initial production auth fix locally by adding a committed Prisma SQL migration for the `user_sessions` table and updating the Render backend build to run `npx prisma migrate deploy` automatically during deploys
- Replaced the church profile page's fake photo-gallery placeholders with a real visit-summary hero and planning cards so profiles still feel deliberate while the dataset has no curated cover images yet
- Audited the current seeded church dataset and documented the biggest MVP-demo data gaps in `docs/product/data/MVP_DATASET_AUDIT.md`, including zero seeded cover images, sparse profile emails, inconsistent service labeling, and a likely bad ZIP for Friendship West Baptist Church
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

- Live auth is currently broken on the deployed app until the backend is redeployed with the Prisma-backed session-store fix; as of the 2026-03-30 smoke-test rerun from `https://sachurchfinder.com`, `/api/v1/auth/register` and `/api/v1/auth/login` still return `500` even though the custom-domain CORS headers are now correct
- The active seed is now much stronger, but image attribution/licensing still needs a more launch-ready path before any broader public rollout that depends on third-party hosted photos
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
|-- README.md                   # Repo overview and docs index
`-- docs/
    |-- engineering/           # Architecture, API, conventions, data model
    |-- history/               # Session-by-session work log
    |-- process/               # Task board, decisions, branching, instructions
    |-- product/               # Product specs, brand, and dataset notes
    `-- setup/                 # Local setup and useful commands
```

### Important Files to Read

1. This file (`AGENT_BRIEFING.md`)
2. `README.md` for the repo-level overview
3. `docs/product/PROJECT_CONTEXT.md` for the broader product context
4. `docs/engineering/ARCHITECTURE.md` for system design and data flow
5. `docs/engineering/CONVENTIONS.md` for coding rules
6. `docs/process/DECISIONS.md` for past architectural choices
7. `docs/history/PROGRESS.md` and `docs/process/TODO.md` for current execution state
8. `docs/engineering/API_SPEC.md` for the currently implemented API surface, including church claims and admin moderation routes
9. `docs/product/FEATURES.md` for the milestone roadmap and the next product slices after the current work

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
5. Do not modify the database schema without updating `docs/engineering/DATA_MODELS.md`.
6. Do not assume old docs describing the in-memory data layer are still accurate; the app now depends on Prisma/PostGIS.

## Session End Checklist

When you finish a session, update:

- This file's current state summary if priorities changed
- `docs/history/PROGRESS.md` with what was accomplished
- `docs/process/DECISIONS.md` if any significant choices were made
- `docs/process/TODO.md` to reflect completed and new tasks

---

_Last updated: 2026-03-31 by Codex_
