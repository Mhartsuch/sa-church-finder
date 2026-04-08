# AGENTS.md

> Shared repo brain for all AI agents. Keep this under 100 lines.
> Deep reference lives in docs/. Feature specs live in specs/.

## Project

SA Church Finder — Airbnb-style church discovery app for San Antonio, TX.

## Repo map

```
client/          React 18 + TypeScript + Vite + Tailwind frontend
  src/api/       API client functions (one file per resource)
  src/components/ Reusable UI (church, map, auth, layout, search, reviews)
  src/hooks/     React Query + URL state hooks
  src/pages/     Route-level page components
  src/stores/    Zustand state stores
  src/types/     Shared TypeScript types
server/          Express 4 + TypeScript backend
  src/routes/    REST route handlers (one file per resource)
  src/services/  Business logic layer
  src/middleware/ Auth, validation, rate limiting, error handling
  src/lib/       Prisma client, session store, email, logging
  prisma/        Schema, migrations, seed
docs/            Architecture, API spec, conventions, decisions, progress
specs/           One file per feature/migration spec
scripts/         Health checks, rollback, setup helpers
```

## Stack

- **Frontend:** React 18, Vite, React Router 6, TanStack Query, Zustand, Tailwind, Mapbox GL
- **Backend:** Express 4, Prisma 5, PostgreSQL + PostGIS, Passport (local + Google OAuth), Nodemailer
- **Quality:** ESLint 9 (flat config), Prettier, Vitest (client), Jest (server), Husky + lint-staged
- **Deploy:** Render (SPA + API), Docker Compose for local Postgres

## Commands

```
npm run dev          # concurrent client + server dev
npm run build        # build client then server
npm run test         # test both client and server
npm run lint         # ESLint both
npm run typecheck    # tsc --noEmit both
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run db:studio    # prisma studio UI
```

## Constraints

- No new dependencies without explicit approval
- No `any` in TypeScript — use proper types or `unknown`
- No raw SQL — use Prisma for all database operations
- No secrets in code — environment variables only
- Schema changes require a Prisma migration + update docs/engineering/DATA_MODELS.md
- Public API changes require updating docs/engineering/API_SPEC.md
- API responses follow `{ data, meta, error }` envelope pattern
- Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)

## Naming

| Thing           | Convention        | Example                 |
| --------------- | ----------------- | ----------------------- |
| Component files | PascalCase        | `ChurchCard.tsx`        |
| Other files     | kebab-case        | `church-service.ts`     |
| Functions/vars  | camelCase         | `getChurchById`         |
| DB tables       | snake_case plural | `church_services`       |
| API endpoints   | kebab-case plural | `/api/v1/churches`      |
| Branches        | type/description  | `feature/church-search` |

## Done when

- `npm run test` passes
- `npm run lint` passes
- `npm run typecheck` passes
- `npm run build` succeeds
- Changed behavior is covered by tests
- API changes documented in docs/engineering/API_SPEC.md
- Schema changes documented in docs/engineering/DATA_MODELS.md

## Reference docs

- Architecture: `docs/engineering/ARCHITECTURE.md`
- API spec: `docs/engineering/API_SPEC.md`
- Coding conventions: `docs/engineering/CONVENTIONS.md`
- Data models: `docs/engineering/DATA_MODELS.md`
- Decisions log: `docs/process/DECISIONS.md`
- Product context: `docs/product/PROJECT_CONTEXT.md`
