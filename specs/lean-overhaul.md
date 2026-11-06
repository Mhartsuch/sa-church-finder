# Spec: Lean Overhaul (v2)

## Goal

Refocus SA Church Finder on one job: help Christians in San Antonio find a
church to call home, through an interface modeled on the classic Airbnb
website — **stunning photos and clean filters**. Delete everything that does
not serve that job, rebuild the frontend from scratch, and trim the backend to
a small, well-tested API.

## Decisions (user delegated all keep/cut calls, 2026-11-06)

### Keep

| Area            | Notes                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------- |
| Church search   | Raw-SQL PostGIS search, ranking, filters. Trim unused params.                            |
| Map             | Mapbox GL from CDN, price-tag-style pins. Rewritten without `react-map-gl`.              |
| Church profile  | Photo grid hero, all photos modal, services, amenities, reviews, map.                    |
| Accounts        | Email/password + Google OAuth, email verification, password reset.                       |
| Saved churches  | Airbnb "wishlist" heart on every card and profile.                                       |
| Reviews         | 1–5 stars + text. One per user per church. Create/edit/delete.                           |
| Data pipeline   | `google-import`, `google-enrich`, `enrich-details`, `enrich-website-v2`, `pipeline/run`. |
| Sitemap / SEO   | Dynamic sitemap, JSON-LD on profiles, document head.                                     |
| Privacy / Terms | Single static legal pages.                                                               |

### Cut (code, routes, tests, docs, and tables)

- Events (feeds, iCal, RRULE expansion, discovery page, leader event tools)
- Forum
- Passport: visits, collections, awards
- Compare
- Church claims, Leaders Portal, church editing, photo uploads, analytics
- Review extras: sub-ratings, helpful votes, flagging/moderation, church responses
- Managed ribbon categories (replaced by a static client-side category list)
- User extras: roles, avatar upload, email change, deactivation (replaced by delete account)
- PWA: service worker (replaced by a self-unregistering stub), install prompt, offline banner
- Home "spotlights", testimonials, newsletter, denomination guide, first-visit guide,
  recently viewed, quick view, share modal, help/safety/accessibility/report pages, HTML sitemap page
- Dependencies: `react-map-gl`, `@tanstack/react-virtual`, `embla-carousel-react`,
  `class-variance-authority`, `multer`

## API contract (v2)

All responses use `{ data, meta?, error? }`.

| Method | Path                                                              | Notes                                                                    |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------ | ------- | ------------------------------------------- |
| GET    | `/api/v1/health`                                                  |                                                                          |
| GET    | `/api/v1/churches`                                                | Search (params below)                                                    |
| GET    | `/api/v1/churches/filter-options`                                 | `{ denominations:[{value,count}], languages, amenities, neighborhoods }` |
| GET    | `/api/v1/churches/:slug`                                          | Full church incl. all `photos`, `services`, `isSaved`                    |
| POST   | `/api/v1/churches/:id/save`                                       | Toggle. `{ churchId, saved }`                                            |
| GET    | `/api/v1/churches/:churchId/reviews`                              | `?page&pageSize&sort=recent                                              | highest | lowest`→`{ data, meta, currentUserReview }` |
| POST   | `/api/v1/churches/:churchId/reviews`                              | `{ rating, body }`                                                       |
| PATCH  | `/api/v1/reviews/:id`                                             | `{ rating, body }`                                                       |
| DELETE | `/api/v1/reviews/:id`                                             |                                                                          |
| GET    | `/api/v1/users/:id/saved`                                         | Saved churches (summary shape + `savedAt`)                               |
| GET    | `/api/v1/users/:id/reviews`                                       | User's reviews with church summary                                       |
| PATCH  | `/api/v1/users/:id/profile`                                       | `{ name }`                                                               |
| DELETE | `/api/v1/users/:id`                                               | Delete own account (password required if set)                            |
| POST   | `/api/v1/auth/register` `login` `logout`                          | Session auth                                                             |
| GET    | `/api/v1/auth/me`                                                 |                                                                          |
| GET    | `/api/v1/auth/google` `google/callback`                           | OAuth                                                                    |
| POST   | `/api/v1/auth/forgot-password` `reset-password` `change-password` |                                                                          |
| POST   | `/api/v1/auth/verify-email` `verify-email/resend`                 |                                                                          |
| GET    | `/sitemap.xml`                                                    |                                                                          |

Search params: `q, denomination (csv), day (0-6), time (morning|afternoon|evening),
language (csv), amenities (csv), wheelchairAccessible, goodForChildren,
goodForGroups, minRating, neighborhood, hasPhotos, sort (relevance|distance|rating|name),
lat, lng, radius, bounds (swLat,swLng,neLat,neLng), page, pageSize (≤50)`.

`AuthUser`: `{ id, email, name, avatarUrl, emailVerified, createdAt }`.
`IReview`: `{ id, churchId, userId, rating, body, createdAt, updatedAt, user: { id, name, avatarUrl } }`.

## Schema changes

One additive-only-in-spirit migration `20261106000000_lean_overhaul` that drops:
`events`, `forum_posts`, `forum_replies`, `church_visits`, `church_collections`,
`church_collection_items`, `user_awards`, `church_claims`, `review_votes`,
`ribbon_categories`; columns `users.role`, `users.deactivatedAt`,
`churches.isClaimed`, `churches.claimedById`, `church_photos.uploadedById`,
`reviews.{welcomeRating,worshipRating,sermonRating,facilitiesRating,helpfulCount,isFlagged,responseBody,respondedAt}`;
enums `role`, `claim_status`, `ribbon_category_source`, `ribbon_category_filter_type`.

**Data impact:** user-generated rows in those tables are destroyed when the
migration deploys. Live auth has been returning 500s, so volume is expected to
be near zero. Events can be regenerated by re-running the website pipeline if
the feature ever returns.

## Frontend (rebuilt)

Routes: `/` (browse grid + map toggle), `/churches/:slug`, `/wishlists`,
`/account`, `/login`, `/register`, `/forgot-password`, `/reset-password`,
`/verify-email`, `/privacy`, `/terms`, `*`. `/search` redirects to `/` keeping the query string.

- **Header:** logo, Airbnb-style search pill (keyword · day · denomination), user menu.
- **Category bar:** icon row (Catholic, Baptist, Non-denominational, Methodist,
  Spanish services, Kid-friendly, Accessible, …) + "Filters" button.
- **Filters modal:** denomination chips, service day, time of day, language,
  neighborhood, features (accessible/kids/groups), minimum rating, sort; "Clear all" / "Show N churches".
- **Grid:** responsive 1–5 columns, square photo card with swipeable photo
  dots, heart, name, neighborhood · denomination, rating, next service.
- **Map:** floating "Show map" pill toggles split view; pins show church
  initials/rating; bounds search on pan.
- **Profile:** title row, 5-photo mosaic + "Show all photos", details column,
  sticky "Plan a visit" card (next service, directions, website, call).
- All filter state lives in the URL.

## Done when

`npm run lint`, `typecheck`, `test`, `build` pass; docs (API_SPEC,
DATA_MODELS, ARCHITECTURE, FEATURES, AGENTS) reflect v2.
