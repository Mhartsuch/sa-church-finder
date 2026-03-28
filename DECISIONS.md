# Decision Log

> Records significant decisions made during this project. Prevents future sessions from re-litigating settled questions or unknowingly contradicting past choices.

## How to Use This File
- Add a new entry when a meaningful decision is made (architecture, tool choice, scope change, etc.)
- Include the reasoning — future agents need to understand WHY, not just WHAT
- Mark decisions as `ACTIVE`, `SUPERSEDED`, or `REVISIT`

---

## Decisions

### DEC-001: React + Node.js/Express over Next.js
- **Date:** 2026-03-26
- **Status:** ACTIVE
- **Decision:** Use separate React SPA (Vite) and Express API server instead of a full-stack Next.js app.
- **Alternatives Considered:** Next.js 14 with App Router and API routes; Remix; Astro.
- **Reasoning:** Cleaner separation of frontend and backend for independent scaling and deployment. Express gives more control over middleware, session management, and the Passport.js auth flow. The team has stronger Express experience. Next.js SSR/RSC adds complexity that isn't needed for the MVP — Mapbox rendering is client-side anyway.
- **Consequences:** No built-in SSR for SEO. Will need to add pre-rendering or a meta-tag service for church profile pages. Frontend and backend deploy as separate services.

### DEC-002: PostgreSQL + PostGIS for geospatial queries
- **Date:** 2026-03-26
- **Status:** ACTIVE
- **Decision:** Use PostgreSQL with PostGIS extension for all spatial search operations.
- **Alternatives Considered:** MongoDB with geospatial indexes; Elasticsearch for search; separate geocoding API.
- **Reasoning:** PostGIS is the gold standard for geospatial queries and integrates natively with PostgreSQL. Keeps the stack simpler (one database). Prisma supports PostgreSQL well. Avoids adding a separate search service for the MVP — PostgreSQL full-text search with trigram indexes is sufficient for the initial dataset size (~2,000–5,000 churches in SA metro).
- **Consequences:** Requires PostGIS extension on managed database (supported on Railway/Render). Some Prisma operations may need raw SQL for advanced PostGIS functions.

### DEC-003: Mapbox over Google Maps
- **Date:** 2026-03-26
- **Status:** ACTIVE
- **Decision:** Use Mapbox GL JS for all mapping functionality.
- **Alternatives Considered:** Google Maps JavaScript API; Leaflet + OpenStreetMap; deck.gl.
- **Reasoning:** Mapbox offers better customization (map styles that match the app's brand), built-in clustering, smoother WebGL rendering, and more generous free tier (50,000 map loads/month). Geocoding API included. The Airbnb-style aesthetic is easier to achieve with Mapbox's design tools.
- **Consequences:** Requires Mapbox account and API token. Need `react-map-gl` wrapper for React integration. Geocoding accuracy should be tested against San Antonio addresses specifically.

### DEC-004: Session-based auth over JWT
- **Date:** 2026-03-26
- **Status:** ACTIVE
- **Decision:** Use server-side sessions with HTTP-only cookies instead of JWT tokens.
- **Alternatives Considered:** JWT with refresh tokens; Auth0/Clerk managed auth.
- **Reasoning:** Sessions are simpler to implement securely, support immediate invalidation (logout works instantly), and avoid the common JWT pitfalls (token storage in localStorage, refresh token rotation complexity). The app has a single backend server, so session state is straightforward. Managed auth (Auth0) was overkill for the MVP budget.
- **Consequences:** Session store needs PostgreSQL adapter (`connect-pg-simple`). CORS configuration requires `credentials: include` on frontend. Not suitable for a multi-server setup without a shared session store (Redis) — but not needed for MVP scale.

### DEC-005: Cloudinary for image hosting
- **Date:** 2026-03-26
- **Status:** ACTIVE
- **Decision:** Use Cloudinary for all church photo storage, optimization, and delivery.
- **Alternatives Considered:** AWS S3 + CloudFront; Imgur API; self-hosted.
- **Reasoning:** Cloudinary provides automatic image optimization (WebP/AVIF), responsive transformations (thumbnail generation), and global CDN — all critical for an image-heavy listing app. Free tier (25GB storage, 25GB bandwidth) is sufficient for MVP. Upload widget simplifies the church admin photo management.
- **Consequences:** External dependency for all images. Need Cloudinary SDK on the backend for secure uploads. Should store both the Cloudinary public_id and the full URL in the database for flexibility.

---
