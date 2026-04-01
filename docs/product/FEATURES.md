# Feature Specifications

> Detailed breakdown of all features for SA Church Finder. Each feature includes user stories, acceptance criteria, and implementation notes.

## Milestone 1: Core Search & Discovery (MVP)

### F1.1 — Church Search with Map View

**User Story:** As a user, I want to search for churches on an interactive map so I can see what's near me.

**Acceptance Criteria:**

- Map centers on San Antonio by default (29.4241, -98.4936)
- Users can pan, zoom, and click pins to see church previews
- Search bar supports text queries (church name, denomination, neighborhood)
- Filter panel allows filtering by: denomination, service day/time, language, amenities
- Map clusters pins when zoomed out; expands on zoom in
- Results update in real-time as map viewport changes
- URL reflects current search state (shareable/bookmarkable)

**Implementation Notes:**

- Use Mapbox GL JS with `mapbox-gl` and `react-map-gl` wrapper
- Implement viewport-based querying with debounce (300ms)
- PostGIS `ST_DWithin` for radius search, `ST_MakeEnvelope` for bounding box
- Cache search results with React Query (staleTime: 60s)

---

### F1.2 — Church List View

**User Story:** As a user, I want to see search results in a scrollable list alongside the map so I can compare churches easily.

**Acceptance Criteria:**

- List shows church card with: photo, name, denomination, rating, distance, next service time
- Hovering a list card highlights corresponding map pin (and vice versa)
- List is sorted by relevance (default), distance, or rating
- Pagination or infinite scroll (20 results per page)
- Responsive: on mobile, list and map are separate tabs; on desktop, side-by-side

**Implementation Notes:**

- Virtualized list with `@tanstack/react-virtual` for performance
- Shared state between map and list via Zustand (hoveredChurchId, selectedChurchId)

---

### F1.3 — Church Profile Page

**User Story:** As a user, I want to view a detailed church profile so I can decide if it's a good fit for me.

**Acceptance Criteria:**

- Hero section with photo carousel (up to 10 images)
- Church name, denomination, rating (stars + count), claimed status badge
- "About" section with description, mission statement, pastor info
- Service schedule (day, time, type — e.g., "Sunday 9:00 AM — Contemporary")
- Location section with static map, address, directions link (Google Maps)
- Contact info: phone, email, website link
- Amenities/features: parking, wheelchair accessible, childcare, livestream, etc.
- Language(s) of services
- SEO-friendly URL: `/churches/san-antonio/grace-community-church`

**Implementation Notes:**

- Use slug-based routing (generate slug from church name + neighborhood)
- Image carousel with `embla-carousel-react`
- Structured data (JSON-LD) for SEO (LocalBusiness + Church schema)

---

## Milestone 2: User Accounts & Reviews

### F2.1 — User Authentication

**User Story:** As a user, I want to create an account so I can leave reviews and save favorite churches.

**Acceptance Criteria:**

- Sign up with email/password or Google OAuth
- Email verification required before leaving reviews
- Login persists via HTTP-only session cookie
- "Forgot password" flow with email reset link
- Profile page showing user's reviews and saved churches

**Implementation Notes:**

- Passport.js with local and Google strategies
- Express sessions stored in PostgreSQL via a Prisma-backed session store
- Rate limiting on auth endpoints (5 attempts per minute)
- Password hashing with bcrypt (12 rounds)

---

### F2.2 — Church Reviews & Ratings

**User Story:** As a user, I want to leave a review and rating for a church I've visited so others can benefit from my experience.

**Acceptance Criteria:**

- 1-5 star rating with half-star increments
- Written review (50-2000 characters) with optional sub-ratings: welcome friendliness, music/worship, sermon quality, facilities, parking
- One review per user per church (editable)
- Reviews sorted by: most recent (default), highest rated, most helpful
- "Helpful" voting on reviews (thumbs up, requires login)
- Review moderation: flagging inappropriate reviews, admin review queue

**Implementation Notes:**

- Optimistic updates for vote counts
- Aggregate ratings computed on write and cached on church record
- Profanity filter with `bad-words` package
- Pagination (10 reviews per page) with cursor-based pagination

---

### F2.3 — Saved / Favorite Churches

**User Story:** As a user, I want to save churches to a favorites list so I can compare them later.

**Acceptance Criteria:**

- Heart icon on church cards and profile page to save/unsave
- Saved churches viewable on profile page as a list
- Works across devices (saved to account, not local storage)

**Implementation Notes:**

- Simple join table `user_saved_churches(user_id, church_id, saved_at)`
- Toggle endpoint: POST `/api/v1/churches/:id/save`

---

## Milestone 3: Events & Community

### F3.1 — Church Events

**User Story:** As a user, I want to see upcoming events at a church so I can participate in community activities.

**Acceptance Criteria:**

- Events displayed on church profile in a calendar/list view
- Event card shows: title, date/time, description, location, type (service, community, volunteer)
- Filter events by type and date range
- "Upcoming this week" section on church profile
- Optional: events feed/calendar page aggregating events across all churches

**Implementation Notes:**

- Events are church-owned (only church admins can create them)
- Recurring event support via `rrule` pattern stored in database
- Use `date-fns` for date formatting (avoid moment.js)

---

### F3.2 — Church Claim & Admin Dashboard

**User Story:** As a church representative, I want to claim my church's listing so I can manage its information and events.

**Acceptance Criteria:**

- "Claim this church" button on unclaimed listings
- Verification process: submit role/title + church email domain verification
- Once claimed, admin can edit: description, photos, service times, contact info, events
- Admin dashboard with: listing editor, event manager, review response capability, analytics (view count, saves)
- Multiple admins per church supported

**Implementation Notes:**

- Role-based access: `user`, `church_admin`, `site_admin`
- Claim requests stored in a queue for site admin approval
- Church admin routes under `/api/v1/admin/churches/:id/`

---

## Milestone 4: Polish & Growth

### F4.1 — Advanced Search & Filters

- Denomination family grouping (e.g., "Baptist" includes SBC, ABC, Independent Baptist)
- Service time range filter ("Saturday evening", "Sunday morning", "Wednesday night")
- Distance radius slider (1–25 miles from a given point)
- "Open now" / "Has service today" quick filters
- Keyword search across descriptions

### F4.2 — Responsive Design & PWA

- Fully responsive from 320px to 1920px+
- Bottom navigation on mobile
- Add-to-home-screen prompt (PWA manifest)
- Offline indicator (graceful degradation, not full offline mode)

### F4.3 — SEO & Social Sharing

- Server-side rendered meta tags for church profiles (or pre-rendering)
- Open Graph and Twitter Card tags for social sharing
- Sitemap.xml generation for all church profile pages
- Structured data for rich search results

---

_Last updated: 2026-03-26_
