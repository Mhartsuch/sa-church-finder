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

# 2. Start the database
# Skip this if you are using Supabase or another hosted Postgres/PostGIS DB
docker compose up -d

# 3. Copy and configure environment variables
cp server/.env.example server/.env
# Set DATABASE_URL to either:
# postgresql://postgres:postgres@localhost:5432/sa_church_finder
# or your hosted Postgres/PostGIS connection string

# 4. Apply committed migrations
cd server && npx prisma migrate deploy && cd ..

# 5. Seed sample data
cd server && npx prisma db seed && cd ..

# 6. Start both frontend and backend
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3001`.

## Important Note

The backend now reads from Prisma/PostGIS. You need a reachable PostgreSQL database with the `postgis` extension enabled before the church API will return data.

## Render Deployment

The repo includes a `render.yaml` blueprint for both services:

- Backend web service: `sa-church-finder-api`
- Frontend static site: `sa-church-finder`

After the first deploy, set:

- `VITE_API_URL` on the frontend to the backend Render URL
- `CLIENT_URL` on the backend to the frontend Render URL
- `DATABASE_URL` on the backend to the Supabase session pooler URL or another reachable Postgres/PostGIS URL

## Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start both client and server in dev mode |
| `npm run dev:client` | Start only the frontend |
| `npm run dev:server` | Start only the backend |
| `npm run build` | Build both for production |
| `npm run lint` | Lint both client and server |
| `npm run typecheck` | TypeScript check both |
| `npm run test` | Run all tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run docker:up` | Start the local PostgreSQL container |
| `npm run docker:down` | Stop the local PostgreSQL container |

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
