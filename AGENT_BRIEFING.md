# Agent Briefing

> Read this first. This file is written specifically for AI agent sessions picking up this project. It should give a fast, accurate picture of where the app stands right now.

## What You Need to Know Right Now

### Project in One Paragraph
SA Church Finder is an Airbnb-style web app for discovering churches in San Antonio, Texas. It uses React + TypeScript on the frontend and Node.js/Express + Prisma/PostgreSQL (PostGIS) on the backend. Milestone 1 core search and discovery work is implemented, including the search page, church profile page, URL-synced filters, responsive mobile map/list behavior, and a Mapbox-powered interactive map with clustering and viewport-based querying. The app now queries a live Supabase Postgres/PostGIS database through Prisma instead of the old in-memory data layer.

### Current Priority
Finish the Render deployment flow end-to-end. The repo already contains a backend + frontend `render.yaml` blueprint, but the remaining work is manual: trigger the deploys in Render, wire `VITE_API_URL` and `CLIENT_URL`, and smoke-test the live site.

### Recently Completed
- Replaced the in-memory data layer with Prisma + PostGIS spatial queries
- Connected the app to a live Supabase Postgres/PostGIS database and seeded sample data
- Added the interactive Mapbox map with clustering and viewport-based querying
- Implemented shareable URL search state, mobile map/list UX, loading skeletons, and no-results suggestions
- Added Render deployment configuration for both backend and frontend
- Re-stabilized the local baseline so lint, typecheck, tests, and production builds all pass

### Known Blockers
- Render deployment still needs dashboard access to kick off the services and wire final environment URLs
- A Mapbox token is still required anywhere the live interactive map should be enabled
- Dependency maintenance remains open (`eslint` 9, `multer` 2, `supertest` 7)

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
*Last updated: 2026-03-28 by Codex*
