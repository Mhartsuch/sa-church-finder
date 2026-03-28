# Progress Log

> Append-only log of work done on this project. Each session adds an entry at the top. This is the project's memory.

## How to Use This File
- Add a new entry at the TOP of the log (newest first) after each work session
- Be specific about what was done, not just what was attempted
- Note anything that was started but not finished
- Link to files that were created or significantly changed

---

## Log

### 2026-03-27 — CI Pipeline Fix
**Focus:** Fixed GitHub Actions CI pipeline failures — multiple missing configs and dependencies.

**Root Causes Identified:**
1. Missing ESLint plugin devDependencies (never installed — `@typescript-eslint/*`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)
2. No vitest config — `vitest run` failed with no config file
3. No jest config — `jest` failed with no config file
4. No test files in source code — test runners exited with failure
5. CI test job required Prisma migrations that don't exist yet (no `migrations/` directory)

**Completed:**
- Added missing ESLint plugin devDependencies to both client and server `package.json`
- Created `client/vitest.config.ts` with jsdom environment, path aliases, and `passWithNoTests`
- Created `server/jest.config.cjs` with ESM support via ts-jest and `passWithNoTests`
- Added real smoke tests: `client/src/utils/format.test.ts` (format utilities) and `server/src/services/church.service.test.ts` (slug/id lookup)
- Simplified CI test job — removed PostgreSQL service container and Prisma migration step (not needed while using in-memory data layer)
- Updated `client/tsconfig.node.json` to include `vitest.config.ts`

**Files Changed:**
- `client/package.json` (updated — added 4 ESLint plugin devDependencies)
- `server/package.json` (updated — added 2 ESLint plugin devDependencies)
- `client/vitest.config.ts` (new — test runner config)
- `server/jest.config.cjs` (new — test runner config)
- `client/src/utils/format.test.ts` (new — unit tests for format utilities)
- `server/src/services/church.service.test.ts` (new — unit tests for church service)
- `.github/workflows/ci.yml` (updated — removed Postgres/Prisma from test job)
- `client/tsconfig.node.json` (updated — added vitest.config.ts to includes)

**Action Required:**
- Run `npm install` in both `client/` and `server/` to install new ESLint deps and update lockfiles
- Then push to trigger CI

---

### 2026-03-27 — Church Profile Page (F1.3)
**Focus:** Built the Church Profile Page — the last major feature for Milestone 1.

**Completed:**
- Created `ChurchProfilePage` component with all spec'd sections:
  - Hero section with gradient header, denomination badge, star rating, claimed badge, address
  - About section with description, pastor name, year established
  - Service schedule grouped by day with formatted times, service type, and language
  - Languages and amenities sections with styled badges
  - Location section with address, map placeholder, and Google Maps directions link
  - Contact section with clickable phone, email, and website links
  - Loading skeleton for smooth UX while data fetches
  - 404 error state with back-to-search navigation
- Added `/churches/:slug` route in App.tsx
- Wired ChurchCard clicks (list view) to navigate to profile page via React Router
- Wired MapPlaceholder pin clicks to navigate to profile page
- Updated Header with React Router `<Link>` for proper SPA navigation (logo + Search link)

**Files Changed:**
- `client/src/pages/ChurchProfilePage.tsx` (new — full profile page with all sections)
- `client/src/App.tsx` (updated — added profile route)
- `client/src/components/church/ChurchList.tsx` (updated — navigate on card click)
- `client/src/components/map/MapPlaceholder.tsx` (updated — navigate on pin click)
- `client/src/components/layout/Header.tsx` (updated — React Router links)

**Next Steps:**
- Test end-to-end on host machine (npm run dev)
- Integrate Mapbox GL JS (replace placeholder map)
- Add responsive layout / mobile breakpoints
- Start on Milestone 2 (User Accounts & Reviews)

---

### 2026-03-27 — GitHub Repository Setup
**Focus:** Created the GitHub repo and pushed all project code.

**Completed:**
- Created public GitHub repo at https://github.com/Mhartsuch/sa-church-finder
- Fixed broken `.git` reference (pointed to expired Cowork session)
- Reinitialized local git repo on `main` branch
- Created README.md with project overview and tech stack summary
- Added GitHub CI/CD workflows (`ci.yml`, `deploy.yml`), PR template, and branching strategy docs
- Created setup script (`scripts/setup-github.bat`) for Windows to push initial commit
- Pushed all 72 project files to GitHub as initial commit
- Updated PROJECT_CONTEXT.md with GitHub link and current status

**Discovered / Notes:**
- Cowork VM cannot push to GitHub (proxy blocks HTTPS git operations) — must push from host machine
- Windows host does not have WSL installed — use `.bat` scripts, not `.sh`
- Project folder is at: `C:\Users\mhart\Documents\Claude\Projects\Project Configurator\sa-church-finder`
- GitHub username: Mhartsuch

**Files Changed:**
- `PROJECT_CONTEXT.md` (updated — added GitHub link, updated status)
- `PROGRESS.md` (updated — added this session log)
- `TODO.md` (updated — marked GitHub tasks complete)
- `README.md` (new — created on GitHub)
- `scripts/setup-github.bat` (new — Windows setup script)
- `scripts/setup-github.sh` (new — Linux/Mac setup script)
- `.github/workflows/ci.yml` (already existed from prior session)
- `.github/workflows/deploy.yml` (already existed from prior session)
- `.github/pull_request_template.md` (already existed from prior session)
- `docs/BRANCHING_STRATEGY.md` (already existed from prior session)

**Next Steps:**
- Build Church Profile Page (F1.3)
- Integrate Mapbox GL JS (replace placeholder map)
- Start Docker PostgreSQL and run Prisma migrations when ready for persistent data

---

### 2026-03-27 — Install, Build Verification & Bug Fixes
**Focus:** Got the project running end-to-end on local machine for the first time.

**Completed:**
- Installed all npm dependencies (root, client, server) — everything resolved successfully
- Both dev servers start and run together via `npm run dev` (concurrently)
  - Vite frontend at http://localhost:5173
  - Express backend at http://localhost:3001
- Created `server/.env` with DATABASE_URL matching docker-compose.yml
- Fixed ChurchList onClick type mismatch (was passing `() => void` where `(slug: string) => void` was expected)
- Fixed sort dropdown using `as any` — now calls typed `setSort` action from Zustand store
- Audited all config files (tsconfig, vite, tailwind, postcss, eslint) — all correct
- Verified all server imports use `.js` extensions for NodeNext module resolution
- Confirmed server runs without Postgres (in-memory data layer with 22 churches)
- App loads and is functional in the browser

**Discovered / Notes:**
- Some npm deprecation warnings (eslint 8, multer 1.x CVE, inflight) — non-blocking, can upgrade later
- 13 moderate vulns in client, 30 vulns in server (mostly transitive dep issues) — not urgent
- Docker not needed for initial dev — in-memory data layer works standalone
- Sandbox environment (Cowork VM) cannot run npm install or Docker — must be done on host machine

**Files Changed:**
- `server/.env` (new — created from .env.example with Docker DB URL)
- `client/src/components/church/ChurchList.tsx` (fixed onClick type + sort dropdown)

**Next Steps:**
- Build Church Profile Page (F1.3)
- Integrate Mapbox GL JS (replace placeholder map)
- Start Docker PostgreSQL and run Prisma migrations when ready for persistent data
- Polish UI/UX (loading skeletons, responsive layout, no-results state)

---

### 2026-03-26 — Milestone 1: Search + Map + List View
**Focus:** Built the core Milestone 1 features — search API, map placeholder, and list view.

**Completed:**
- Built full search API with in-memory data layer (22 San Antonio churches)
  - Haversine distance calculation, text search, denomination/day/time/language/amenities filters
  - Sorting (distance, rating, name) and pagination
  - Bounding box support for viewport-based queries
  - Zod validation schemas for all query params
- Built frontend SearchPage with three-panel layout:
  - SearchBar with 300ms debounce
  - FilterPanel with collapsible denomination/day/time/language/amenities filters
  - MapPlaceholder with SVG-rendered pins (interactive hover/select)
  - ChurchList with cards showing name, denomination, rating, distance, next service, amenities
  - Pagination and sort controls
- Created Zustand store for search state (query, filters, sort, page, hovered/selected church, map center)
- Created React Query hooks with 60s stale time
- Created API client layer with proper response envelope handling
- Created utility functions (formatDistance, formatRating, formatServiceTime, getNextService)
- Added proper TypeScript types for both frontend and backend

**In Progress (not finished):**
- npm dependencies not yet installed (requires npm registry access)
- Mapbox integration deferred (placeholder map in use)
- Church Profile Page (Milestone 1, Feature F1.3) not yet started

**Files Changed:**
- `server/src/types/church.types.ts` (new)
- `server/src/data/churches.ts` (new — 22 churches with services)
- `server/src/services/church.service.ts` (new)
- `server/src/services/church-detail.service.ts` (new)
- `server/src/schemas/church.schema.ts` (new)
- `server/src/routes/church.routes.ts` (updated — real search logic)
- `server/src/routes/auth.routes.ts` (updated — fixed unused vars)
- `client/src/types/church.ts` (new)
- `client/src/constants/index.ts` (new)
- `client/src/api/churches.ts` (new)
- `client/src/hooks/useChurches.ts` (new)
- `client/src/stores/search-store.ts` (new)
- `client/src/utils/format.ts` (new)
- `client/src/components/layout/Header.tsx` (new)
- `client/src/components/church/ChurchCard.tsx` (new)
- `client/src/components/church/ChurchList.tsx` (new)
- `client/src/components/map/MapPlaceholder.tsx` (new)
- `client/src/components/search/SearchBar.tsx` (new)
- `client/src/components/search/FilterPanel.tsx` (new)
- `client/src/pages/SearchPage.tsx` (new)
- `client/src/App.tsx` (updated)
- `QUICKSTART.md` (updated)

**Next Steps:**
- Run `npm install` in client/ and server/
- Start Docker PostgreSQL, run migrations and seed
- Start dev servers and verify end-to-end
- Add Mapbox when token is available
- Build Church Profile Page (F1.3)

---

### 2026-03-26 — Project Planning & Configuration
**Focus:** Set up the complete planning documentation suite for the SA Church Finder project.

**Completed:**
- Created full project scaffold with all planning documents
- Defined system architecture (React + Express + PostgreSQL/PostGIS + Mapbox)
- Wrote detailed feature specifications across 4 milestones
- Designed complete data model with 9 tables and relationships
- Specified REST API with all endpoints, params, and response formats
- Established coding conventions and naming standards
- Documented 5 key architectural decisions with rationale
- Created recommended project instructions for Cowork

**In Progress (not finished):**
- Nothing — planning phase complete

**Discovered / Notes:**
- PostGIS is well-supported on Railway and Render managed PostgreSQL
- Mapbox free tier (50K loads/month) should be sufficient through beta
- Church dataset for San Antonio estimated at 2,000–5,000 listings
- Consider Google Places API or Data.sa.gov for initial seed data

**Files Changed:**
- All files in `sa-church-finder/` (created)

**Next Steps:**
- Set up monorepo with `client/` and `server/` directories
- Initialize React + Vite + TypeScript frontend
- Initialize Express + TypeScript + Prisma backend
- Create Prisma schema from DATA_MODELS.md
- Write database seed script with sample San Antonio church data

---
