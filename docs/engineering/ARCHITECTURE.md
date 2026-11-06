# Architecture

## Overview

```
Browser ── React SPA (Render static site, sachurchfinder.com)
   │          TanStack Query cache · URL-driven filters · Mapbox GL from CDN
   │ REST /api/v1 (JSON, cookie session)
   ▼
Express API (Render web service, sa-church-finder-api)
   routes/ → services/ → Prisma ──► Supabase Postgres + PostGIS
   Passport (local + Google) · express-session (Prisma store) · rate limits · Pino · Sentry
```

Church photos are stored in Supabase Storage by the import pipeline and referenced by URL.

## Client (`client/`)

| Path              | Contents                                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/`      | `BrowsePage`, `ChurchPage`, `WishlistsPage`, `AccountPage`, `AuthPages`, `LegalPage`                                                          |
| `src/components/` | `church/` cards, carousel, mosaic, heart · `search/` pill, categories, filters modal · `map/` · `reviews/` · `auth/` · `layout/` · `ui/Modal` |
| `src/api/`        | One file per resource: `churches`, `auth`, `reviews`                                                                                          |
| `src/hooks/`      | React Query hooks + `useFilters` (URL state)                                                                                                  |
| `src/lib/`        | API client, URL ⇄ filter mapping, formatting, Mapbox loader                                                                                   |
| `src/constants/`  | Category bar presets                                                                                                                          |

Filters live in the URL (`?denomination=Baptist&day=0&kids=1&view=map`). `useFilters`
parses them; `useChurchSearch` turns them into an infinite query against `GET /churches`.
The map loads Mapbox GL JS from its CDN on first use; with the map open, panning sends a
`bounds` search.

## Server (`server/`)

| Path              | Contents                                                                                |
| ----------------- | --------------------------------------------------------------------------------------- |
| `src/routes/`     | `auth`, `church`, `review`, `users`, `sitemap`                                          |
| `src/services/`   | Search + ranking (PostGIS raw SQL), church detail, reviews, saved churches, auth, users |
| `src/middleware/` | Zod validation, auth guard, rate limit, cache headers, errors                           |
| `src/scripts/`    | Data pipeline (Google import, enrichment, website extraction)                           |
| `prisma/`         | Schema, migrations, idempotent seed                                                     |

## Deployment

- `render.yaml` defines both services. The API build runs `prisma migrate deploy`.
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, test, and build on PRs and `main`.
- `keepalive.yml` pings the free-tier API to reduce cold starts.
