---
description: Rules for Prisma schema and migrations
globs: server/prisma/**
---

- `schema.prisma` is the single source of truth for the data model
- Always create a migration for schema changes: `npm run db:migrate`
- After any schema change, update `docs/engineering/DATA_MODELS.md`
- Seed data in `seed.ts` must be idempotent (upsert, not create)
- PostGIS `location` column uses raw SQL in migrations only — Prisma handles the rest
- Never delete or rename existing migrations — only add new ones
