# Quick Start

## Prerequisites

- Node.js 20+ and npm 10+
- Docker Desktop (optional, for local PostgreSQL + PostGIS)

## Setup

```bash
# 1. Install all dependencies
npm install --prefix .
npm install --prefix client
npm install --prefix server

# Root install also runs the Husky prepare step so local git hooks are wired
# for pre-commit staged-file checks and the pre-push quality gate.

# 2. Start the database
# Skip this if you are using Supabase or another hosted Postgres/PostGIS DB
docker compose up -d

# 3. Copy and configure environment variables
cp server/.env.example server/.env
# Set DATABASE_URL to either:
# postgresql://postgres:postgres@localhost:5432/sa_church_finder
# or your hosted Postgres/PostGIS connection string
# Optional for local auth testing:
# AUTH_EXPOSE_RESET_PREVIEW=true
# PASSWORD_RESET_TOKEN_TTL_MINUTES=60
# AUTH_EXPOSE_VERIFICATION_PREVIEW=true
# EMAIL_VERIFICATION_TOKEN_TTL_MINUTES=1440
# Optional for local SMTP-backed auth emails:
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@example.com
# SMTP_PASS=your-email-password
# SMTP_FROM=noreply@sachurchfinder.com
# Optional for local Google OAuth testing:
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback

# 4. Apply committed migrations
cd server && npx prisma migrate deploy && cd ..

# 5. Seed sample data
cd server && npx prisma db seed && cd ..

# 6. Start both frontend and backend
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3001`.

If `SMTP_HOST`, `SMTP_PORT`, and `SMTP_FROM` are configured (plus `SMTP_USER` and `SMTP_PASS` when your provider requires authentication), forgot-password and email-verification requests now send real SMTP emails from the backend.

If `AUTH_EXPOSE_RESET_PREVIEW=true` is also set locally, successful forgot-password requests for real accounts will include a preview reset URL in the API response in addition to any SMTP delivery, which is helpful for local testing.

If `AUTH_EXPOSE_VERIFICATION_PREVIEW=true` is also set locally, signed-in users can request a fresh verification link from the account page and receive a preview verification URL in the resend response. Registration also issues a verification token immediately, and the preview flag gives local development a safe fallback if you are not pointing at a real SMTP provider yet.

If you want to test Google sign-in locally, create OAuth web credentials in Google Cloud and add `http://localhost:3001/api/v1/auth/google/callback` as an authorized redirect URI. Then set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and optionally `GOOGLE_CALLBACK_URL` in `server/.env`.

## Important Note

The backend now reads from Prisma/PostGIS. You need a reachable PostgreSQL database with the `postgis` extension enabled before the church API will return data.

## Render Deployment

The repo includes a `render.yaml` blueprint for both services:

- Backend web service: `sa-church-finder-api`
- Frontend static site: `sa-church-finder`

The blueprint now prewires the default Render service URLs for:

- `VITE_API_URL=https://sa-church-finder-api.onrender.com`
- `CLIENT_URL=https://sa-church-finder.onrender.com`

You still need to set:

- `DATABASE_URL` on the backend to the Supabase session pooler URL or another reachable Postgres/PostGIS URL
- `GOOGLE_CLIENT_ID` on the backend if you want Google sign-in enabled
- `GOOGLE_CLIENT_SECRET` on the backend if you want Google sign-in enabled
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and any required SMTP credentials on the backend if you want password reset and email verification to send real emails

If you rename either Render service or switch to a custom domain, update `VITE_API_URL`, `CLIENT_URL`, and the backend `GOOGLE_CALLBACK_URL` to match the new URLs.

## Useful Commands

| Command               | Description                                    |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Start both client and server in dev mode       |
| `npm run dev:client`  | Start only the frontend                        |
| `npm run dev:server`  | Start only the backend                         |
| `npm run build`       | Build both for production                      |
| `npm run lint`        | Lint both client and server                    |
| `npm run typecheck`   | TypeScript check both                          |
| `npm run test`        | Run all tests                                  |
| `npm run lint-staged` | Run staged-file formatting/lint rules manually |
| `npm run db:migrate`  | Run Prisma migrations                          |
| `npm run db:seed`     | Seed the database                              |
| `npm run db:studio`   | Open Prisma Studio                             |
| `npm run docker:up`   | Start the local PostgreSQL container           |
| `npm run docker:down` | Stop the local PostgreSQL container            |

## API Endpoints (Milestone 1)

### Search Churches

```text
GET /api/v1/churches?lat=29.4241&lng=-98.4936&radius=10&q=baptist&denomination=Baptist&sort=distance&page=1&pageSize=20
```

Query parameters: `lat`, `lng`, `radius`, `q`, `denomination`, `day`, `time`, `language`, `amenities`, `sort`, `page`, `pageSize`, `bounds`

### Church Detail

```text
GET /api/v1/churches/:slug
```

## Project Structure

```text
sa-church-finder/
|-- client/                 # React + Vite + TypeScript frontend
|   |-- src/
|   |   |-- pages/          # Home, search, church profile
|   |   |-- components/
|   |   |   |-- church/     # Cards, lists, skeleton states
|   |   |   |-- map/        # MapContainer, InteractiveMap, fallback map
|   |   |   |-- search/     # Search/filter UI
|   |   |   `-- layout/     # Header, shared layout
|   |   |-- hooks/          # React Query, URL state
|   |   |-- api/            # Church API client
|   |   |-- stores/         # Zustand search store
|   |   |-- types/          # Church/search types
|   |   `-- utils/          # Formatting helpers
|   `-- ...config files
|-- server/                 # Express + TypeScript backend
|   |-- src/
|   |   |-- routes/         # church.routes.ts, auth.routes.ts
|   |   |-- middleware/     # validate.ts, error-handler.ts
|   |   |-- services/       # Prisma/PostGIS query services
|   |   |-- schemas/        # Zod validation schemas
|   |   |-- types/          # IChurch, ISearchParams, ISearchResponse
|   |   `-- lib/            # Logger, Prisma client
|   `-- prisma/
|       |-- schema.prisma   # Prisma schema with PostGIS support
|       |-- migrations/     # Committed SQL migrations
|       `-- seed.ts         # Database seeder
|-- docker-compose.yml      # Local PostgreSQL + PostGIS
|-- render.yaml             # Render blueprint
`-- package.json            # Root scripts
```
