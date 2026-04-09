# Architecture

> High-level technical architecture of this project. Agents should read this to understand how the system is structured before making changes.

## System Overview

SA Church Finder is a full-stack web application with a React SPA frontend communicating with a RESTful Express API backend. The backend uses PostgreSQL with PostGIS for geospatial church search. Images are stored on Cloudinary, maps are rendered via Mapbox, and authentication uses session-based Passport.js with Google OAuth support.

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   Frontend (React)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Map View │ │ List View│ │ Church Profiles  │ │
│  │ (Mapbox) │ │          │ │ Reviews / Events │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│           React Query ← cache layer              │
└────────────────────┬────────────────────────────┘
                     │ REST API (JSON)
                     ▼
┌─────────────────────────────────────────────────┐
│              Backend (Express + Node.js)          │
│  ┌────────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Auth       │ │ Church   │ │ Review/Event  │  │
│  │ (Passport) │ │ Routes   │ │ Routes        │  │
│  └────────────┘ └──────────┘ └───────────────┘  │
│  ┌────────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Middleware  │ │ Prisma   │ │ Upload        │  │
│  │ (auth,rate)│ │ ORM      │ │ (Cloudinary)  │  │
│  └────────────┘ └──────────┘ └───────────────┘  │
└────────────────────┬────────────────────────────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
    ┌──────────┐ ┌────────┐ ┌───────────┐
    │PostgreSQL│ │Cloudnry│ │ Mapbox    │
    │+ PostGIS │ │(images)│ │ (geocode) │
    └──────────┘ └────────┘ └───────────┘
```

## Components

### Component 1: Frontend SPA

- **Purpose:** User-facing interface — search, browse, review churches
- **Location:** `/client`
- **Key files:** `src/pages/`, `src/components/`, `src/hooks/`, `src/api/`
- **Dependencies:** React 18, TypeScript, Vite, Tailwind, shadcn/ui, Mapbox GL JS, React Query, Zustand, React Router

### Component 2: REST API Server

- **Purpose:** Business logic, data access, authentication, file uploads
- **Location:** `/server`
- **Key files:** `src/routes/`, `src/middleware/`, `src/services/`, `src/prisma/`
- **Dependencies:** Express, Prisma, Passport.js, Cloudinary SDK, multer

### Component 3: Database

- **Purpose:** Persistent storage for churches, users, reviews, events
- **Location:** Managed PostgreSQL instance (Railway/Render)
- **Key files:** `/server/prisma/schema.prisma`, `/server/prisma/migrations/`, `/server/prisma/seed.ts`
- **Dependencies:** PostgreSQL 15+, PostGIS extension

## Data Flow

1. **Search flow:** User enters filters/location → frontend sends GET to `/api/v1/churches?lat=...&lng=...&radius=...` → backend builds PostGIS query via Prisma → returns paginated results → frontend renders map pins + list cards
2. **Review flow:** Authenticated user submits review → POST to `/api/v1/churches/:id/reviews` → backend validates and stores → updates church average rating → returns updated review list
3. **Church profile:** User clicks a church → GET `/api/v1/churches/:slug` → backend returns full profile with related reviews and upcoming events → frontend renders detail page
4. **Image upload:** Church admin uploads photos → POST with multipart form → backend uploads to Cloudinary → stores CDN URL in database → returns URL for display

## External Dependencies

| Dependency           | Purpose                                    | Docs URL                               |
| -------------------- | ------------------------------------------ | -------------------------------------- |
| Mapbox GL JS         | Interactive maps, geocoding, clustering    | https://docs.mapbox.com/mapbox-gl-js/  |
| Cloudinary           | Image hosting, optimization, CDN           | https://cloudinary.com/documentation   |
| Google OAuth         | Social login for users                     | https://developers.google.com/identity |
| PostgreSQL + PostGIS | Geospatial queries (nearby search, radius) | https://postgis.net/documentation/     |

## Environment Setup

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 15+ with PostGIS extension
- Mapbox account (API token)
- Cloudinary account (cloud name, API key, API secret)
- Google Cloud project with OAuth 2.0 credentials

### Setup Steps

1. Clone repo and install: `npm install` (in both `/client` and `/server`)
2. Copy `/server/.env.example` to `/server/.env` and fill in credentials
3. Start PostgreSQL, enable PostGIS: `CREATE EXTENSION postgis;`
4. Run migrations: `cd server && npx prisma migrate dev`
5. Seed database: `cd server && npx prisma db seed`
6. Start dev servers: `npm run dev` (runs both client and server concurrently)

### Environment Variables

| Variable              | Purpose                        | Required | Default               |
| --------------------- | ------------------------------ | -------- | --------------------- |
| DATABASE_URL          | PostgreSQL connection string   | Yes      | —                     |
| MAPBOX_TOKEN          | Mapbox GL JS and geocoding API | Yes      | —                     |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name          | Yes      | —                     |
| CLOUDINARY_API_KEY    | Cloudinary API key             | Yes      | —                     |
| CLOUDINARY_API_SECRET | Cloudinary API secret          | Yes      | —                     |
| GOOGLE_CLIENT_ID      | Google OAuth client ID         | Yes      | —                     |
| GOOGLE_CLIENT_SECRET  | Google OAuth client secret     | Yes      | —                     |
| SESSION_SECRET        | Express session encryption key | Yes      | —                     |
| PORT                  | Backend server port            | No       | 3001                  |
| CLIENT_URL            | Frontend URL (CORS)            | No       | http://localhost:5173 |
| NODE_ENV              | Environment mode               | No       | development           |

## Testing Strategy

- **Unit tests:** Component rendering, utility functions, service layer logic (Vitest + RTL frontend, Jest backend)
- **Integration tests:** API route testing with Supertest against a test database
- **E2E tests:** Critical user flows — search, view profile, leave review (Playwright, added in later milestone)

## Deployment

### Production

- **Frontend:** Render static site (auto-deploy from `main` branch, custom domain sachurchfinder.com)
- **Backend:** Render web service (`sa-church-finder-api`)
- **Database:** Supabase PostgreSQL (with PostGIS)
- **CI/CD:** GitHub Actions — lint, typecheck, test on PRs; manual deploy via `deploy.yml`

### Staging / Preview

- **Frontend previews:** Vercel deploys a unique preview URL for every PR to `main` (via `.github/workflows/preview.yml`). Each preview points to the staging API.
- **Staging API:** Render web service (`sa-church-finder-staging-api`) auto-deploys from the `develop` branch.
- **Staging DB:** Render free-tier PostgreSQL (`sa-church-finder-staging-db`).
- **CORS:** The staging API accepts all `*.vercel.app` origins so any Vercel preview can connect.

#### Setup (one-time)

1. Run `npx vercel link` in `client/` to connect the Vercel project.
2. Set Vercel environment variables: `VITE_API_URL=https://sa-church-finder-staging-api.onrender.com`, `VITE_MAPBOX_TOKEN`.
3. Add GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
4. Deploy `render.yaml` to create the staging services.
5. Run `prisma migrate deploy` against the staging DB to initialize the schema.
6. Optionally seed the staging DB: `npx prisma db seed`.

---

_Last updated: 2026-03-26_
