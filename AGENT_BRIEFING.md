# Agent Briefing

> **Read this first.** This file is written specifically for AI agent sessions picking up this project. It contains everything you need to be productive immediately.

## What You Need to Know Right Now

### Project in One Paragraph
SA Church Finder is an Airbnb-style web app for discovering churches in San Antonio, Texas. It uses React + TypeScript on the frontend with Node.js/Express and PostgreSQL (PostGIS) on the backend. The app features interactive map search, rich church profiles with photos and service times, user reviews/ratings, and an events calendar. We are currently in the **planning/architecture phase** — no code has been written yet. The immediate focus is finalizing data models, API design, and setting up the initial project scaffold.

### Current Priority
Set up the initial monorepo structure with the React frontend (Vite + TypeScript) and Express backend. Get a basic dev environment running with database migrations and a seed script for San Antonio churches.

### Recently Completed
- Completed architecture and planning documents
- Defined data models, API specifications, and feature specs
- Established coding conventions and project structure

### Known Blockers
- Need Mapbox API key for map integration
- Need Cloudinary account for image hosting
- Need to decide on church data seeding strategy (manual entry vs. scraping Google Places)

## Where Things Are

### File Structure Overview
```
sa-church-finder/
├── PROJECT_CONTEXT.md         ← What this project is and why
├── AGENT_BRIEFING.md          ← You are here — start of every session
├── ARCHITECTURE.md            ← System design, components, data flow
├── CONVENTIONS.md             ← Code style rules (follow these strictly)
├── DECISIONS.md               ← Why we chose what we chose
├── PROGRESS.md                ← Session-by-session work log
├── TODO.md                    ← Prioritized task board
├── FEATURES.md                ← Feature specifications
├── DATA_MODELS.md             ← Database schema and relationships
├── API_SPEC.md                ← REST API endpoint specifications
└── docs/
    ├── mockups/               ← UI wireframes and design references
    └── api/                   ← Detailed API documentation
```

### Important Files to Read
1. This file (`AGENT_BRIEFING.md`)
2. `PROJECT_CONTEXT.md` — full project context
3. `ARCHITECTURE.md` — system design
4. `CONVENTIONS.md` — coding rules (mandatory)
5. `DECISIONS.md` — past architectural decisions

## Conventions to Follow

### Naming
- Files: kebab-case (`church-service.ts`, `review-card.tsx`)
- Components: PascalCase (`ChurchCard.tsx`, `MapView.tsx`)
- Functions/variables: camelCase (`getChurchById`, `currentFilters`)
- Database: snake_case (`church_services`, `user_reviews`)
- API endpoints: kebab-case plural (`/api/v1/churches`, `/api/v1/reviews`)
- Branches: `type/description` (`feature/church-search`, `fix/map-clustering`)

### Style
- TypeScript strict mode — no `any` types
- Functional components with hooks only — no class components
- Named exports preferred over default exports (except page components)
- All API responses follow a consistent envelope: `{ data, meta, error }`

### Workflow
- Feature branches off `main`
- Commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- All new features require at minimum unit tests
- Run `npm run lint` and `npm run typecheck` before committing

## Do NOT Do These Things
1. Do NOT add dependencies without checking if an existing dependency covers the use case
2. Do NOT use `any` type in TypeScript — use `unknown` and narrow, or define proper types
3. Do NOT write raw SQL — use Prisma for all database operations
4. Do NOT store API keys or secrets in code — use environment variables
5. Do NOT skip error handling on API routes — every route needs try/catch with proper HTTP status codes
6. Do NOT modify the database schema without updating DATA_MODELS.md

## Session End Checklist
When you finish a session, update:
- [ ] This file's "Current Priority" and "Recently Completed" sections
- [ ] `PROGRESS.md` with what was accomplished
- [ ] `DECISIONS.md` if any significant choices were made
- [ ] `TODO.md` to reflect completed and new tasks

---
*Last updated: 2026-03-26 by human*
