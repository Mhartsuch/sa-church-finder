# Progress Log

> Append-only log of work done on this project. Each session adds an entry at the top. This is the project's memory.

## How to Use This File
- Add a new entry at the TOP of the log (newest first) after each work session
- Be specific about what was done, not just what was attempted
- Note anything that was started but not finished
- Link to files that were created or significantly changed

---

## Log

### 2026-03-28 - Dependency Upgrade Sweep
**Focus:** Cleared the open dependency-maintenance bucket and migrated the repo to ESLint 9 without leaving compatibility shims behind.

**Completed:**
- **ESLint 9 migration:** Replaced the legacy `.eslintrc.cjs` files in both `client/` and `server/` with flat-config `eslint.config.js` files, updated the lint scripts to the flat-config-friendly CLI form, and moved TypeScript linting to the `typescript-eslint` meta package plus `@eslint/js`.
- **Package upgrades:** Upgraded `eslint` to 9.39.4, `multer` to 2.1.1, and `supertest` to 7.2.2. Also refreshed the related linting packages (`typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `@eslint/js`) and updated `@types/multer` / `@types/supertest`.
- **Type alignment:** Because the stricter lint/type pass surfaced nullability drift in the server domain types, updated `server/src/types/church.types.ts` to match the actual Prisma payload shape for nullable fields.
- **Install + lockfiles:** Refreshed both `client/package-lock.json` and `server/package-lock.json` from clean installs.
- **Verification:** Ran `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test`, and `npm.cmd run build` successfully. The test/build run needed elevated execution in this environment because Vitest/Vite child-process spawning is sandbox-restricted here.

**Remaining Notes:**
- Vite still warns that the lazy-loaded `mapbox-gl` chunk is very large (~1.7 MB minified). That remains a performance follow-up rather than a release blocker.
- `npm install` reduced the vulnerability counts, but the client still reports 4 moderate vulnerabilities and the server still reports 1 moderate vulnerability.

**Files Changed:**
- `client/package.json`
- `client/package-lock.json`
- `client/eslint.config.js`
- `client/.eslintrc.cjs` (removed)
- `server/package.json`
- `server/package-lock.json`
- `server/eslint.config.js`
- `server/.eslintrc.cjs` (removed)
- `server/src/types/church.types.ts`
- `TODO.md`
- `PROGRESS.md`
- `AGENT_BRIEFING.md`

### 2026-03-28 - Search Accessibility Polish
**Focus:** Tightened keyboard accessibility and search interaction semantics after deployment so the core discovery flow is easier to navigate without a mouse.

**Completed:**
- **Keyboard-accessible result cards:** Reworked `ChurchCard` from a clickable `div` into a real button-based interaction pattern with focus styling, preserved hover-sync behavior, and a separate save button that no longer interferes with navigation.
- **Search results semantics:** Added list semantics and a screen-reader status message in `ChurchList` so result navigation is announced more clearly.
- **Search submit controls:** Converted the shared `SearchBar` submit affordance and the header search pill submit affordance into real buttons, and removed the invalid nested interactive markup in the header search form.
- **Popup text cleanup:** Updated the interactive map popup to use icon-based rating/profile affordances and consistent distance formatting, which also removed visible mojibake in the UI.
- **Server typing cleanup:** Added explicit return types for the church detail/lookup helpers and aligned nullable server church/service types with the actual Prisma payload shape so root lint/typecheck are clean again.
- **Verification:** Added `client/src/components/church/ChurchCard.test.tsx` to cover keyboard focus and save-button behavior. Ran `npm.cmd run lint`, `npm.cmd run typecheck`, and `npm.cmd run test` successfully. The test run required elevated execution in this environment because sandboxed Vitest/esbuild spawning is blocked here.

**Files Changed:**
- `client/src/components/church/ChurchCard.tsx`
- `client/src/components/church/ChurchList.tsx`
- `client/src/components/church/ChurchCard.test.tsx`
- `client/src/components/layout/Header.tsx`
- `client/src/components/search/SearchBar.tsx`
- `client/src/components/map/InteractiveMap.tsx`
- `server/src/index.ts`
- `server/src/services/church-detail.service.ts`
- `server/src/services/church.service.ts`
- `server/src/types/church.types.ts`
- `TODO.md`
- `PROGRESS.md`
- `AGENT_BRIEFING.md`

### 2026-03-28 - Render Deployment Verified Live
**Focus:** Closed the loop on the Render deployment after the live frontend showed `Failed to fetch` on church search.

**Completed:**
- **Root-cause isolation:** Confirmed the backend root 404 was expected for this API and narrowed the real production issue to frontend/backend wiring rather than an Express crash.
- **Frontend hardening:** Added `client/src/lib/api-url.ts` so production prefers `VITE_API_URL`, keeps local Vite proxy behavior in dev, and infers the sibling `-api` Render host as a safety net on `*.onrender.com`.
- **Clearer runtime errors:** Updated `client/src/api/churches.ts` to normalize fetch and parse failures into deployment-focused messages instead of generic browser errors.
- **Blueprint defaults:** Updated `render.yaml` so the default Render service names prefill `CLIENT_URL=https://sa-church-finder.onrender.com` and `VITE_API_URL=https://sa-church-finder-api.onrender.com`.
- **Verification:** Ran `npm.cmd run typecheck:client`, `npm.cmd run test:client`, and `npm.cmd run build:client` successfully. After redeploying with the corrected env wiring, the live site worked.

**Files Changed:**
- `client/src/lib/api-url.ts`
- `client/src/lib/api-url.test.ts`
- `client/src/api/churches.ts`
- `render.yaml`
- `QUICKSTART.md`
- `AGENT_BRIEFING.md`
- `TODO.md`
- `PROGRESS.md`

### 2026-03-28 - Render Deployment Troubleshooting Hardening
**Focus:** Investigated the live Render failure mode and reduced the two most likely configuration gaps: missing frontend API URL wiring and backend/frontend origin mismatch.

**Completed:**
- **Frontend API resolution:** Added `client/src/lib/api-url.ts` so production builds still prefer `VITE_API_URL`, keep local dev on the Vite `/api` proxy, and infer the sibling `-api` Render host as a safety net when the env var is missing on `*.onrender.com`.
- **Clearer fetch errors:** Wrapped church API requests so browser-level network failures now point directly at the likely Render misconfig (`VITE_API_URL` and `CLIENT_URL`), and HTML/non-JSON responses point at a bad API base URL instead of surfacing a generic parse failure.
- **Blueprint defaults:** Updated `render.yaml` to preconfigure `CLIENT_URL=https://sa-church-finder.onrender.com` and `VITE_API_URL=https://sa-church-finder-api.onrender.com`, removing a manual deployment step for the default service names.
- **Docs:** Updated `QUICKSTART.md` so the Render section reflects the new blueprint defaults and calls out when those URLs still need manual changes.

**Remaining Notes:**
- `DATABASE_URL` still must be supplied manually in Render.
- The live services need a redeploy or blueprint sync before these config changes take effect.
- I could not fully probe the live Render headers from this environment because outbound requests to the public service were unreliable here, so the CORS/header diagnosis is still based on code paths and the browser symptom.

**Files Changed:**
- `client/src/lib/api-url.ts`
- `client/src/lib/api-url.test.ts`
- `client/src/api/churches.ts`
- `render.yaml`
- `QUICKSTART.md`
- `PROGRESS.md`
 
### 2026-03-28 - Repo Baseline Stabilization + Docs Refresh
**Focus:** Re-established a trustworthy local baseline after the Prisma/Render work, then refreshed stale onboarding docs to match the actual codebase state.

**Completed:**
- **Client cleanup:** Fixed stale lint/type issues in `ChurchCard`, `MapPlaceholder`, `CategoryFilter`, `SearchBar`, and `Header`. Restored a real hover effect on cards and switched browser-side timeout refs away from `NodeJS.Timeout`.
- **Server cleanup:** Fixed the server ESLint config typo for `@typescript-eslint/explicit-function-return-type`, corrected `pino` / `pino-http` imports for NodeNext typing, cleaned unused params in `server/src/index.ts`, tightened error payload construction in `error-handler.ts`, and made church route handlers return `void` consistently.
- **Verification:** Confirmed `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` all pass. `test` and `build` required elevated execution in this environment because the sandbox blocked child-process spawning for esbuild/Vitest.
- **Build warning fix:** Removed the Vite CSS warning by moving the Google Fonts import ahead of Tailwind directives in `client/src/index.css`.
- **Docs refresh:** Updated `AGENT_BRIEFING.md` and `QUICKSTART.md` so they no longer describe the project as pre-scaffold / in-memory-only.

**Remaining Notes:**
- Vite still warns that the lazy-loaded `mapbox-gl` chunk is large (~1.7 MB minified). The app already code-splits the interactive map, so this is currently a performance warning rather than a release blocker.
- Render deployment remains the main outstanding manual step.

**Files Changed:**
- `client/src/components/church/ChurchCard.tsx`
- `client/src/components/map/MapPlaceholder.tsx`
- `client/src/components/search/CategoryFilter.tsx`
- `client/src/components/search/SearchBar.tsx`
- `client/src/components/layout/Header.tsx`
- `client/src/index.css`
- `server/.eslintrc.cjs`
- `server/src/index.ts`
- `server/src/lib/logger.ts`
- `server/src/middleware/error-handler.ts`
- `server/src/routes/church.routes.ts`
- `AGENT_BRIEFING.md`
- `QUICKSTART.md`

**Next Steps for Codex/Next Session:**
1. Finish the manual Render deploy flow and verify the live URLs are wired correctly
2. Decide whether to tackle dependency upgrades next (`eslint` 9, `multer` 2, `supertest` 7) or begin Milestone 2 feature work
3. Optionally reduce the size of the lazy-loaded Mapbox chunk if production performance becomes a concern

### 2026-03-28 — Supabase Cloud DB + Prisma Data Layer + Render Deployment (IN PROGRESS)
**Focus:** Got the database live on Supabase cloud, swapped in-memory data layer to Prisma+PostGIS, and started deploying to Render.

**Completed:**
- **Supabase cloud database:** Connected to Supabase PostgreSQL (us-west-2) with PostGIS 3.3. Uses Session Pooler URL for IPv4 compatibility (`aws-0-us-west-2.pooler.supabase.com:5432`). Direct connection is IPv6-only. Password has special chars that need URL-encoding.
- **Prisma data layer swap:** Replaced all in-memory data with Prisma client. Created `server/src/lib/prisma.ts` (singleton pattern). Rewrote `server/src/services/church.service.ts` to use `$queryRaw` with PostGIS spatial functions (`ST_DWithin`, `ST_Distance`, `ST_MakePoint`). Updated routes to be async with `await`.
- **Database seeded:** 22 churches, admin user, test user, 5 reviews, 3 saved churches. PostGIS spatial queries verified working.
- **Render deployment config:** Created `render.yaml` blueprint. Made `client/src/api/churches.ts` use configurable `VITE_API_URL`.

**In Progress — Render Deployment:**
- Backend Web Service (`sa-church-finder-api`): Created on Render with Git Provider connected to GitHub. Configuration:
  - Root directory: `server`
  - Build command: `npm install && npx prisma generate && npm run build`
  - Start command: `npm start`
  - Instance: Free tier ($0/month)
  - Env vars set: `DATABASE_URL`, `NODE_ENV=production`, `SESSION_SECRET` (auto-generated), `CLIENT_URL=*`
  - **Status: "Deploy Web Service" button NOT YET clicked — deployment not started**
- Frontend Static Site: Not yet created on Render
- After both deploy: update `CLIENT_URL` on backend to frontend URL, set `VITE_API_URL` on frontend to backend URL

**Files Changed:**
- `server/src/lib/prisma.ts` (new — Prisma client singleton)
- `server/src/services/church.service.ts` (rewritten — Prisma+PostGIS queries)
- `server/src/services/church-detail.service.ts` (updated — async)
- `server/src/routes/church.routes.ts` (updated — async await)
- `server/src/index.ts` (updated — Prisma import, graceful shutdown, CORS wildcard)
- `server/src/services/church.service.test.ts` (updated — mocks Prisma)
- `client/src/api/churches.ts` (updated — configurable VITE_API_URL)
- `render.yaml` (new — Render deployment blueprint)
- `server/.env` (updated — Supabase connection string)

**Next Steps for Codex/Next Session:**
1. Click "Deploy Web Service" on Render dashboard (backend is fully configured, just needs the button click)
2. Create a Render Static Site for the frontend (root dir: `client`, build cmd: `npm install && npm run build`, publish dir: `dist`)
3. Set `VITE_API_URL` on frontend to the backend URL (e.g., `https://sa-church-finder-api.onrender.com`)
4. Update `CLIENT_URL` on backend to the frontend URL
5. Test the live site end-to-end

### 2026-03-27 — PostGIS Database Migration & Loading Skeletons
**Focus:** Prepared the full PostGIS database layer (schema, migration, seed) so that spinning up Docker is all that's needed to go live with persistent data. Also added polished loading skeletons.

**Completed:**
- **Prisma schema update:** Added `postgresqlExtensions` preview feature, `postgis` extension, and `location Unsupported("geography(Point,4326)")?` column to Church model. Prisma now knows the column exists even though it manages it via raw SQL.
- **Initial migration SQL:** Created `server/prisma/migrations/20260327000000_init/migration.sql` — full DDL for all 10 tables, enums, foreign keys, unique constraints, and indexes. Includes PostGIS-specific additions: `CREATE EXTENSION IF NOT EXISTS "postgis"`, `geography(Point, 4326)` column on `churches`, GIST spatial index on `location`, and a `BEFORE INSERT OR UPDATE` trigger (`churches_location_sync`) that auto-populates the geography column from `latitude`/`longitude` on every write.
- **Seed script rewrite:** Completely rewrote `server/prisma/seed.ts` with proper `Prisma.Decimal` types for all numeric fields, an admin user in addition to the test user, 5 sample reviews (up from 2), PostGIS verification on startup (checks PostGIS version, validates location column population, runs a test `ST_DWithin` spatial query), and graceful fallback warnings if PostGIS isn't available.
- **ChurchCardSkeleton component:** Created `client/src/components/church/ChurchCardSkeleton.tsx` with a CSS shimmer gradient animation (not just `animate-pulse`). The skeleton matches the exact layout dimensions of `ChurchCard` (aspect ratio, text line heights, spacing) so there's zero layout shift on load. Includes a `ChurchCardSkeletonGrid` wrapper that matches both `grid` and `sidebar` variants. Updated `ChurchList` to use the new component.
- **Tailwind config:** Added `shimmer` keyframe animation to `tailwind.config.ts`.

**Files Changed:**
- `server/prisma/schema.prisma` (updated — PostGIS extension + location column)
- `server/prisma/migrations/20260327000000_init/migration.sql` (new — full initial migration)
- `server/prisma/migrations/migration_lock.toml` (new — Prisma migration lock)
- `server/prisma/seed.ts` (rewritten — PostGIS-aware, better types, more seed data)
- `client/src/components/church/ChurchCardSkeleton.tsx` (new — shimmer skeleton)
- `client/src/components/church/ChurchList.tsx` (updated — uses ChurchCardSkeletonGrid)
- `client/tailwind.config.ts` (updated — shimmer keyframe)

**To activate the database:**
```bash
# From the project root
docker compose up -d
cd server
npx prisma migrate deploy
npx prisma db seed
```

**Next Steps:**
- Run `docker compose up` on host machine to start PostgreSQL
- Apply migration and seed the database
- Swap the in-memory data layer for Prisma queries (church.service.ts)
- Begin Milestone 2 (User Accounts & Reviews)

---

### 2026-03-27 — Mapbox GL JS Integration with Clustering & Viewport Querying
**Focus:** Built the full interactive map — the biggest remaining M1 feature. Covers three P1 tasks at once.

**Completed:**
- **InteractiveMap component:** Full Mapbox GL JS map using `react-map-gl`. Features Airbnb-style name-bubble pins (white with text halo at rest, dark on hover). Pins sync hover state with the ChurchList. Clicking a pin opens a popup card with church name, denomination, rating, distance, next service, and "View profile →" link. Map includes NavigationControl (zoom buttons) and GeolocateControl.
- **Clustering:** GeoJSON source with `cluster: true`, `clusterMaxZoom: 14`, `clusterRadius: 60`. Dark circle clusters show abbreviated count, with three size tiers (18/22/28px radius). Clicking a cluster zooms in to its expansion zoom. Individual pins use `text-allow-overlap: false` to declutter automatically.
- **Viewport-based querying:** Map reports its bounds (sw/ne corners) to the Zustand store via `setMapBounds`. Both the ChurchList and InteractiveMap use the `bounds` query parameter when available, so the list and map always show the same churches. Bounds updates are debounced (300ms) to avoid excessive API calls while panning.
- **Graceful fallback:** Created `MapContainer` that lazy-loads the InteractiveMap only when `VITE_MAPBOX_TOKEN` is set. Without a token, the existing SVG `MapPlaceholder` renders as before. The mapbox-gl bundle is code-split via `React.lazy`.
- **Store update:** Added `mapBounds` and `setMapBounds` to the Zustand search store. ChurchList now uses bounds for filtering when the map viewport is available.
- **Popup styling:** Added Mapbox popup CSS overrides in `index.css` matching the Airbnb card aesthetic (rounded corners, shadow, clean close button).

**Files Changed:**
- `client/src/components/map/InteractiveMap.tsx` (new — full Mapbox map with clustering, viewport querying, popups)
- `client/src/components/map/MapContainer.tsx` (new — smart switcher: real map vs placeholder)
- `client/src/stores/search-store.ts` (updated — added MapBounds type, mapBounds state, setMapBounds action)
- `client/src/components/church/ChurchList.tsx` (updated — uses mapBounds for viewport-based list filtering)
- `client/src/pages/SearchPage.tsx` (updated — uses MapContainer instead of MapPlaceholder)
- `client/src/index.css` (updated — Mapbox popup styling)

**To activate the map:**
- Set `VITE_MAPBOX_TOKEN=pk.your_token_here` in `client/.env`
- Run `npm run dev` — the map will load automatically

**Next Steps:**
- Get a Mapbox token and test the live map
- Start Docker PostgreSQL + Prisma migrations for persistent data
- Begin Milestone 2 (User Accounts & Reviews)

---

### 2026-03-27 — URL Search State, Responsive Layout & No-Results UX
**Focus:** Three P1/P2 improvements to close out remaining Milestone 1 polish items.

**Completed:**
- **URL-based search state (P1):** Created `useURLSearchState` hook that syncs the Zustand search store with URL search parameters. On page load, URL params (`q`, `denomination`, `day`, `time`, `language`, `amenities`, `sort`, `page`) initialize the store. When the user changes filters, the URL updates in real-time (via `replace` to keep history clean). Search URLs are now shareable and bookmarkable (e.g., `/search?q=baptist&day=0&sort=rating`).
- **Responsive layout (P2):** SearchPage now detects mobile viewport (<768px). On mobile: map is hidden by default (list-first experience), list uses the full-width grid layout instead of sidebar, and the map toggle switches between full-screen map and full-screen list. On desktop: side-by-side layout preserved as before.
- **No-results suggestions (P2):** Replaced the generic "No churches found" empty state with a contextual `NoResults` component. Shows a map-pin icon, an explanation tailored to what's active (query, filters, or both), and up to 3 actionable suggestion buttons (e.g., "Clear filters and keep search", "Remove 'Sunday' filter", "Reset everything"). Primary action is styled with the dark Airbnb-style pill button.

**Files Changed:**
- `client/src/hooks/useURLSearchState.ts` (new — URL ↔ store sync hook)
- `client/src/components/search/NoResults.tsx` (new — contextual empty state)
- `client/src/pages/SearchPage.tsx` (updated — responsive layout + URL state hook)
- `client/src/components/church/ChurchList.tsx` (updated — uses NoResults component)

**Next Steps:**
- Push to GitHub (host-side) and verify CI passes
- Integrate Mapbox GL JS when token is available
- Start Docker PostgreSQL + Prisma migrations for persistent data
- Begin Milestone 2 (User Accounts & Reviews)

---

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
