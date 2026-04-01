# Recommended Project Instructions

> Copy the text below into your Cowork project's "Project Instructions" settings field when you create the SA Church Finder project.

---

```
Airbnb-style church finder for San Antonio. React 18 + TypeScript frontend, Node.js/Express backend, PostgreSQL + PostGIS database.

Read AGENT_BRIEFING.md before starting any work.
Follow conventions in docs/engineering/CONVENTIONS.md strictly.
Check docs/process/DECISIONS.md before making any architectural choices.
Update docs/history/PROGRESS.md at the end of every session.

Constraints:
- Never use `any` type in TypeScript — use proper types or `unknown`
- Never write raw SQL — use Prisma for all database operations
- Never store secrets in code — use environment variables only
- Never modify the database schema without updating docs/engineering/DATA_MODELS.md
- All new features require unit tests
- All API routes must have error handling with proper HTTP status codes
```

---
