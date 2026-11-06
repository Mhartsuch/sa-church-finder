# SA Church Finder

Find a church home in San Antonio. An Airbnb-style directory — stunning photos and clean
filters — built with React, Express, Prisma, and PostgreSQL/PostGIS.

## Start Here

- Contributor and agent handoff: `AGENTS.md` (current status lives in `docs/process/TODO.md`)
- Local setup and commands: `docs/setup/QUICKSTART.md`
- Documentation index: `docs/README.md`

## Project Structure

```text
client/                  Frontend app
server/                  Backend API, Prisma schema, and seed data
docs/                    Organized project documentation
  engineering/           Architecture, API, conventions, data model
  product/               Product context, features, brand
  process/               Task board, decisions, branching
  history/               Legacy progress log (read-only)
  setup/                 Local setup and environment docs
scripts/                 Helper scripts for health checks, rollback, and setup
```

## Common Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Notes

- Main entry points are this file and `AGENTS.md`; `AGENT_BRIEFING.md` is legacy.
- The 2026-11 lean overhaul is described in `specs/lean-overhaul.md`.
