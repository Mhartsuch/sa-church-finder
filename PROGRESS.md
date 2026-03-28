# Progress Log

> Append-only log of work done on this project. Each session adds an entry at the top. This is the project's memory.

## How to Use This File
- Add a new entry at the TOP of the log (newest first) after each work session
- Be specific about what was done, not just what was attempted
- Note anything that was started but not finished
- Link to files that were created or significantly changed

---

## Log

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
