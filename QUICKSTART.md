# Quick Start

## Prerequisites
- Node.js 20+ and npm 10+
- Docker Desktop (for PostgreSQL + PostGIS)

## Setup

```bash
# 1. Install all dependencies
npm install --prefix .
npm install --prefix client
npm install --prefix server

# 2. Start the database
docker compose up -d

# 3. Copy and configure environment variables
cp server/.env.example server/.env
# Edit server/.env — set DATABASE_URL to:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sa_church_finder
# (This matches the docker-compose.yml defaults)

# 4. Run database migrations
cd server && npx prisma migrate dev --name init && cd ..

# 5. Seed the database with sample churches
cd server && npx prisma db seed && cd ..

# 6. Start both frontend and backend
npm run dev
```

The frontend runs at http://localhost:5173 and the backend at http://localhost:3001.

**Note:** The backend includes an in-memory data layer (22 San Antonio churches) that works without a database connection. If you skip steps 2-5, the search API will still function with the in-memory data.

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
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run docker:up` | Start PostgreSQL container |
| `npm run docker:down` | Stop PostgreSQL container |

## API Endpoints (Milestone 1)

### Search Churches
```
GET /api/v1/churches?lat=29.4241&lng=-98.4936&radius=10&q=baptist&denomination=Baptist&sort=distance&page=1&pageSize=20
```

Query parameters: `lat`, `lng`, `radius`, `q` (text search), `denomination`, `day` (0-6), `time` (morning/afternoon/evening), `language`, `amenities`, `sort` (distance/rating/name), `page`, `pageSize`, `bounds` (sw_lat,sw_lng,ne_lat,ne_lng)

### Church Detail
```
GET /api/v1/churches/:slug
```

## Project Structure

```
sa-church-finder/
├── client/                 # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── pages/          # SearchPage, ChurchProfilePage
│   │   ├── components/
│   │   │   ├── church/     # ChurchCard, ChurchList
│   │   │   ├── map/        # MapPlaceholder (Mapbox later)
│   │   │   ├── search/     # SearchBar, FilterPanel
│   │   │   └── layout/     # Header
│   │   ├── hooks/          # useChurches (React Query)
│   │   ├── api/            # API client (fetchChurches, fetchChurchBySlug)
│   │   ├── stores/         # Zustand search store
│   │   ├── types/          # IChurch, ISearchParams, etc.
│   │   ├── utils/          # formatDistance, getNextService, etc.
│   │   ├── constants/      # SA_CENTER, denomination/day/time options
│   │   └── lib/            # cn() helper
│   └── ...config files
├── server/                 # Express + TypeScript backend
│   ├── src/
│   │   ├── routes/         # church.routes.ts, auth.routes.ts
│   │   ├── middleware/     # validate.ts, error-handler.ts
│   │   ├── services/       # church.service.ts (search + filters)
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── data/           # In-memory church data (22 churches)
│   │   ├── types/          # IChurch, ISearchParams, ISearchResponse
│   │   └── lib/            # Logger
│   └── prisma/
│       ├── schema.prisma   # Database schema (ready for Postgres)
│       └── seed.ts         # Database seeder
├── docker-compose.yml      # PostgreSQL + PostGIS
└── package.json            # Root scripts
```
