# Project Context

## Project Name
SA Church Finder - Airbnb-style Church Discovery for San Antonio

## One-Line Summary
A web application that helps San Antonio residents and visitors discover, explore, and connect with local churches through an Airbnb-inspired browsing experience with maps, photos, reviews, and event listings.

## Goals
1. Build a searchable directory of churches in San Antonio with interactive map and list views
2. Provide rich church profiles with photos, service times, denomination info, and descriptions
3. Enable user reviews and ratings so visitors can share their experience
4. Surface church events (services, community gatherings, volunteering) in a discoverable calendar
5. Deliver a responsive, mobile-friendly experience that feels as polished as Airbnb

## Non-Goals
1. Not building a donations/payment system - churches handle their own giving platforms
2. Not creating a social media platform - limited community features, not a full social network
3. Not supporting cities outside San Antonio in the MVP (architecture should allow expansion later)
4. Not building native mobile apps - responsive web only for v1
5. Not live-streaming or hosting sermons - link out to church platforms instead
6. Not providing theological content or recommendations based on beliefs

## Target Audience / Users
- **Primary:** San Antonio residents looking for a new church home (recently moved, seeking change)
- **Secondary:** Visitors and travelers wanting to attend a service while in town
- **Tertiary:** Church administrators who want to manage their listing

## Tech Stack & Tools
- **Frontend:** React 18 + TypeScript + Vite
- **UI Framework:** Tailwind CSS + shadcn/ui components
- **State Management:** React Query (server state) + Zustand (client state)
- **Routing:** React Router v6
- **Backend:** Node.js + Express
- **Database:** PostgreSQL with PostGIS extension (geospatial queries)
- **ORM:** Prisma
- **Authentication:** Session-based local auth now live; Google OAuth planned next
- **Maps:** Mapbox GL JS (interactive maps with clustering)
- **Image Storage:** Cloudinary (church photos with CDN)
- **Search:** PostgreSQL full-text search (upgrade to Elasticsearch later if needed)
- **Testing:** Vitest + React Testing Library (frontend), Jest + Supertest (backend)
- **Hosting:** Render (frontend + backend) with Supabase Postgres/PostGIS

## Project Type
software

## Key Constraints
- Must be performant on mobile - majority of users will browse on phones
- Church data must be verifiable - prevent spam/fake listings
- Respect church autonomy - churches should be able to claim and manage their own listings
- Accessible (WCAG 2.1 AA minimum)
- San Antonio geographic boundary enforced in search (Bexar County area)
- Free tier must exist for churches - no paywall for basic listing

## Current Status
Active Development - Milestone 1 is complete and deployed live on Render. The search experience, interactive map, and church profile page are in production, the app runs against Supabase Postgres/PostGIS, and Milestone 2 now includes the local session-based auth backend plus live saved-church and written-review flows on church profiles and the account page.

## Important Links
- GitHub: https://github.com/Mhartsuch/sa-church-finder
- Design mockups: /docs/mockups/
- API docs: /docs/api/

## Owner
- Name: Matthew
- Contact: mhartsuch@gmail.com

---
*Last updated: 2026-03-28*
