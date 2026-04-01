# SA Church Finder

Airbnb-style church discovery for San Antonio, built with React, Express, Prisma, and PostgreSQL/PostGIS.

## Start Here

- Contributor and agent handoff: `AGENT_BRIEFING.md`
- Local setup and commands: `docs/setup/QUICKSTART.md`
- Documentation index: `docs/README.md`

## Project Structure

```text
client/                  Frontend app
server/                  Backend API, Prisma schema, and seed data
docs/                    Organized project documentation
  engineering/           Architecture, API, conventions, data model
  product/               Product context, features, brand, data curation
  process/               Task board, decisions, branching, instructions
  history/               Append-only progress log
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

- The repo root is intentionally kept light: the main entry points are this file and `AGENT_BRIEFING.md`.
- Supporting docs were reorganized under `docs/` on 2026-03-31 to reduce root-level clutter without deleting project history.
