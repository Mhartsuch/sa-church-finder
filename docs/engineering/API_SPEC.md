# API Specification

> REST API endpoints for SA Church Finder. All endpoints are prefixed with `/api/v1`. Responses use a consistent envelope format.

## Response Envelope

```json
// Success
{
  "data": { ... },
  "meta": { "page": 1, "pageSize": 20, "total": 150 }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Rating must be between 1 and 5",
    "details": { "field": "rating", "received": 6 }
  }
}
```

## Authentication

- Session-based with HTTP-only cookies
- Protected routes return `401 Unauthorized` if no session
- Role-restricted routes return `403 Forbidden` if insufficient role

---

## Endpoints

### Churches

#### `GET /churches`

Search and list churches.

| Param                | Type    | Required | Notes                                                                                                                         |
| -------------------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| lat                  | number  | No       | Center latitude (default: 29.4241)                                                                                            |
| lng                  | number  | No       | Center longitude (default: -98.4936)                                                                                          |
| radius               | number  | No       | Search radius in miles (default: 10, max: 25)                                                                                 |
| q                    | string  | No       | Text search query (name, description, amenities, service types)                                                               |
| denomination         | string  | No       | Denomination-family filter. Accepts a single value or a comma-separated list — multiple values OR-combine (case-insensitive). |
| neighborhood         | string  | No       | Case-insensitive exact match on the `neighborhood` column                                                                     |
| day                  | number  | No       | Filter by service day (0=Sun–6=Sat)                                                                                           |
| time                 | string  | No       | Filter by service time range ('morning','afternoon','evening')                                                                |
| serviceType          | string  | No       | Case-insensitive match on `church_services.serviceType` (e.g. 'traditional', 'contemporary')                                  |
| language             | string  | No       | Service language filter. Accepts a single value or a comma-separated list — multiple values OR-combine.                       |
| amenities            | string  | No       | Comma-separated amenity names. Matching is case-insensitive and AND-combined (church must offer all).                         |
| minRating            | number  | No       | 0–5. Floor on effective rating (local `avgRating` if the church has reviews, else `googleRating`).                            |
| wheelchairAccessible | boolean | No       | When `true`, only return churches confirmed wheelchair accessible. Omit or `false` disables.                                  |
| goodForChildren      | boolean | No       | When `true`, only return churches confirmed family-friendly. Omit or `false` disables.                                        |
| goodForGroups        | boolean | No       | When `true`, only return churches confirmed suitable for groups. Omit or `false` disables.                                    |
| hasPhotos            | boolean | No       | When `true`, only return churches with at least one uploaded photo.                                                           |
| isClaimed            | boolean | No       | When `true`, only return churches that have been claimed/verified by a church leader.                                         |
| sort                 | string  | No       | 'relevance' (default), 'distance', 'rating', 'name'                                                                           |
| page                 | number  | No       | Page number (default: 1)                                                                                                      |
| pageSize             | number  | No       | Results per page (default: 20, max: 50). Values above 50 are rejected with 400.                                               |
| bounds               | string  | No       | Viewport bounding box 'sw_lat,sw_lng,ne_lat,ne_lng'                                                                           |

> Boolean flags accept `'true'`, `'false'`, `'1'`, or `'0'`. They are intentionally restrictive —
> a NULL value on the church row means "unknown" and will NOT satisfy a `true` filter, so only
> churches with confirmed accessibility/community data are returned when the flag is on.

**Response:** Array of church summary objects with distance.

---

#### `GET /churches/filter-options`

Returns the distinct values that populate the client's filter panel. Data is
derived from real database content so the options always match what can be
found via the search endpoint. Cached for 5 minutes.

**Response:**

```json
{
  "data": {
    "denominations": [
      { "value": "Baptist", "count": 42 },
      { "value": "Catholic", "count": 38 },
      { "value": "Non-denominational", "count": 24 }
    ],
    "languages":     ["English", "Spanish", ...],
    "amenities":     ["Parking", "Nursery", "WiFi", ...],
    "neighborhoods": ["Alamo Heights", "Stone Oak", "Downtown", ...],
    "serviceTypes":  ["Traditional", "Contemporary", "Bilingual", ...]
  }
}
```

`denominations` returns `{ value, count }` tuples sorted by `count`
descending (tiebreaker: alphabetical on `value`). `count` is the number
of operational churches in each family; `CLOSED_PERMANENTLY` churches
are excluded to match the behaviour of `GET /churches`. The UI uses
the count to sort and label chips ("Baptist · 42"). All other filter
arrays remain plain string arrays.

---

#### `GET /churches/:slug`

Get full church profile by slug.

**Response:** Complete church object with services, photos, upcoming events, and aggregate review data.

---

#### `POST /churches` _(site_admin only)_

Create a new church listing.

---

#### `PATCH /churches/:id` _(church_admin or site_admin)_

Update editable church listing fields. Only included fields are changed (PATCH semantics). String fields accept `null` to clear the value.

**Request body** (all fields optional):

| Field                  | Type              | Constraints                    |
| ---------------------- | ----------------- | ------------------------------ |
| `description`          | `string \| null`  | Max 5,000 chars                |
| `phone`                | `string \| null`  | Max 30 chars                   |
| `email`                | `string \| null`  | Valid email, max 255 chars     |
| `website`              | `string \| null`  | Max 500 chars                  |
| `pastorName`           | `string \| null`  | Max 255 chars                  |
| `yearEstablished`      | `number \| null`  | Integer, 1500–current year     |
| `languages`            | `string[]`        | Max 20 items, each 1–100 chars |
| `amenities`            | `string[]`        | Max 50 items, each 1–100 chars |
| `goodForChildren`      | `boolean \| null` |                                |
| `goodForGroups`        | `boolean \| null` |                                |
| `wheelchairAccessible` | `boolean \| null` |                                |

**Response:** `{ data: Church, message: "Church updated successfully" }`

**Errors:** `401` not authenticated, `403` not authorized, `404` church not found, `400` validation failed.

---

### Church Photos

#### `GET /churches/:churchId/photos`

List all photos for a church, ordered by `displayOrder` ascending.

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "churchId": "uuid",
      "url": "/uploads/church-photos/abc123.jpg",
      "altText": "Church exterior",
      "displayOrder": 0,
      "createdAt": "2026-04-13T00:00:00.000Z"
    }
  ],
  "meta": { "total": 1 }
}
```

---

#### `POST /churches/:churchId/photos` _(church_admin or site_admin)_

Upload a photo. Accepts `multipart/form-data`.

| Field   | Type   | Required | Notes                                                        |
| ------- | ------ | -------- | ------------------------------------------------------------ |
| photo   | file   | Yes      | JPEG, PNG, or WebP. Max 10 MB.                               |
| altText | string | No       | Accessibility description for screen readers (max 300 chars) |

**Flow:** Backend saves the file to `uploads/church-photos/` on disk and creates a database record. The photo is appended to the end of the display order.

**Returns:** `201` with the created photo object.

---

#### `PATCH /churches/photos/:photoId` _(church_admin or site_admin)_

Update the alt text of a photo.

| Field   | Type          | Required | Notes                          |
| ------- | ------------- | -------- | ------------------------------ |
| altText | string / null | Yes      | New alt text, or null to clear |

---

#### `PUT /churches/:churchId/photos/reorder` _(church_admin or site_admin)_

Reorder photos for a church.

| Field    | Type  | Required | Notes                                                             |
| -------- | ----- | -------- | ----------------------------------------------------------------- |
| ordering | array | Yes      | Array of `{ photoId: string, displayOrder: number }` (1–50 items) |

**Returns:** The full list of photos in the new order.

---

#### `DELETE /churches/photos/:photoId` _(church_admin or site_admin)_

Delete a photo. Removes the database record and attempts to clean up the file from disk.

---

### Reviews

#### `GET /churches/:churchId/reviews`

List reviews for a church.

| Param    | Type   | Required | Notes                                              |
| -------- | ------ | -------- | -------------------------------------------------- |
| sort     | string | No       | 'recent' (default), 'highest', 'lowest', 'helpful' |
| page     | number | No       | Page number (default: 1)                           |
| pageSize | number | No       | Results per page (default: 10, max: 50)            |

---

#### `POST /churches/:churchId/reviews` _(authenticated)_

Create a review.

| Field             | Type   | Required | Notes                |
| ----------------- | ------ | -------- | -------------------- |
| rating            | number | Yes      | 1.0–5.0 in 0.5 steps |
| body              | string | Yes      | 50–2000 characters   |
| welcome_rating    | number | No       | 1–5                  |
| worship_rating    | number | No       | 1–5                  |
| sermon_rating     | number | No       | 1–5                  |
| facilities_rating | number | No       | 1–5                  |

---

#### `PATCH /reviews/:id` _(review owner)_

Edit own review.

---

#### `DELETE /reviews/:id` _(review owner or site_admin)_

Delete a review.

---

#### `POST /reviews/:id/helpful` _(authenticated)_

Mark a review as helpful.

---

#### `DELETE /reviews/:id/helpful` _(authenticated)_

Remove the current user's helpful vote from a review.

---

#### `POST /reviews/:id/flag` _(authenticated)_

Flag a review for moderation.

---

#### `POST /reviews/:id/response` _(church_admin or site_admin)_

Add or update a church leader's response to a review. The authenticated user must be the church's claimant or a site admin.

| Field | Type   | Required | Notes             |
| ----- | ------ | -------- | ----------------- |
| body  | string | Yes      | 1–2000 characters |

**Response:** `{ data: { reviewId, responseBody, respondedAt }, message }`

**Errors:** `401` not authenticated, `403` not the church's claimant, `404` review not found.

---

#### `DELETE /reviews/:id/response` _(church_admin or site_admin)_

Remove the church leader's response from a review. Same authorization as `POST`.

**Response:** `{ data: { reviewId }, message }`

---

### Church Services

#### `POST /churches/:churchId/services` _(church_admin or site_admin)_

Add a new service time. The authenticated user must be the church's claimant or a site admin.

| Field       | Type   | Required | Notes                        |
| ----------- | ------ | -------- | ---------------------------- |
| dayOfWeek   | number | Yes      | 0=Sunday through 6=Saturday  |
| startTime   | string | Yes      | HH:MM format (e.g., '09:00') |
| endTime     | string | No       | HH:MM format                 |
| serviceType | string | Yes      | e.g., 'Sunday Worship'       |
| language    | string | No       | Default: 'English'           |
| description | string | No       | Max 500 chars                |

**Response:** `{ data: ChurchService, message: "Service time created successfully" }`

**Errors:** `401` not authenticated, `403` not authorized, `404` church not found, `400` validation failed.

---

#### `PATCH /services/:id` _(church_admin or site_admin)_

Update an existing service time. At least one field must be provided.

---

#### `DELETE /services/:id` _(church_admin or site_admin)_

Remove a service time.

---

### Events

#### `GET /events`

Aggregated upcoming events across all churches for the public discovery feed. Results are ordered
by `startTime` ascending and paginated. Recurring events are expanded server-side into concrete
occurrences that intersect the requested window; each occurrence is returned as a separate item
with a unique `occurrenceId` while `id` still points back to the stored series row.

| Param    | Type    | Required | Notes                                                                                     |
| -------- | ------- | -------- | ----------------------------------------------------------------------------------------- |
| type     | string  | No       | Filter by event_type                                                                      |
| from     | string  | No       | ISO 8601 datetime (default: now — only future events)                                     |
| to       | string  | No       | ISO 8601 datetime; must be on or after `from` (defaults to `from + 90 days` when omitted) |
| q        | string  | No       | Case-insensitive search over title, description, and church name                          |
| page     | integer | No       | 1-indexed (default: 1)                                                                    |
| pageSize | integer | No       | Default 20, maximum 50                                                                    |

**Response:**

```json
{
  "data": [
    {
      "id": "...",
      "occurrenceId": "...::2026-05-03T14:00:00.000Z",
      "churchId": "...",
      "title": "Sunday Worship",
      "description": "Weekly gathering",
      "eventType": "service",
      "startTime": "2026-05-03T14:00:00.000Z",
      "endTime": "2026-05-03T15:30:00.000Z",
      "seriesStartTime": "2026-05-03T14:00:00.000Z",
      "locationOverride": null,
      "isRecurring": true,
      "recurrenceRule": "FREQ=WEEKLY",
      "isOccurrence": true,
      "church": {
        "id": "...",
        "slug": "grace-church",
        "name": "Grace Church",
        "city": "San Antonio",
        "denomination": "Non-denominational",
        "coverImageUrl": "https://..."
      }
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3,
    "filters": { "type": "service", "from": "...", "to": "...", "q": "..." }
  }
}
```

`total` reflects the count of expanded occurrences inside the window, not the number of stored
event rows, so pagination operates on the post-expansion list.

**Errors:**

- `400 VALIDATION_ERROR` — invalid `type`, malformed ISO dates, or `to` before `from`.

---

#### `GET /churches/:slug/events`

List upcoming events for a church by slug. Recurring events are expanded into occurrences by
default; pass `expand=false` to receive the raw stored series rows instead (used by the church
admin leaders portal where administrators manage the series template, not individual dates).

| Param  | Type    | Required | Notes                                                                  |
| ------ | ------- | -------- | ---------------------------------------------------------------------- |
| type   | string  | No       | Filter by event_type                                                   |
| from   | string  | No       | Start date ISO 8601 (default: today)                                   |
| to     | string  | No       | End date ISO 8601 (defaults to `from + 90 days` when `expand` is true) |
| expand | boolean | No       | `false` to skip RRULE expansion; defaults to `true`                    |

**Response:** `{ data, meta: { total, filters: { ..., expand } } }` where `data` is an array of
church events (or occurrences) ordered by `startTime`. Each item is an `IChurchEvent` payload
with the same occurrence-aware shape as the aggregated feed above.

---

#### `POST /churches/:churchId/events` _(church_admin or site_admin)_

Publish a new event. The authenticated user must either be a site admin or a church admin whose `claimedById` matches the church being targeted.

| Field            | Type    | Required | Notes                                                                 |
| ---------------- | ------- | -------- | --------------------------------------------------------------------- |
| title            | string  | Yes      | 2–200 characters                                                      |
| eventType        | string  | Yes      | One of `service`, `community`, `volunteer`, `study`, `youth`, `other` |
| startTime        | string  | Yes      | ISO 8601 datetime                                                     |
| endTime          | string  | No       | ISO 8601 datetime; must be strictly after `startTime` when provided   |
| description      | string  | No       | Max 5000 characters                                                   |
| locationOverride | string  | No       | Max 200 characters; leave empty to use the church address             |
| isRecurring      | boolean | No       | Defaults to `false`                                                   |
| recurrenceRule   | string  | No       | RRULE string when `isRecurring` is `true` (see below)                 |

**Recurrence rules.** `recurrenceRule` must be a valid iCal RRULE body when `isRecurring=true`
(and must be empty otherwise). The server parses the rule on write, stores it in canonical
form (dropping `INTERVAL=1`, sorting `BYDAY` into week order), and expands it into occurrences
on read. Only the following subset is supported:

| Part       | Notes                                                           |
| ---------- | --------------------------------------------------------------- |
| `FREQ`     | `DAILY`, `WEEKLY`, or `MONTHLY`                                 |
| `INTERVAL` | Positive integer; default `1`                                   |
| `BYDAY`    | Weekday codes (`SU`, `MO`, … `SA`); only with `FREQ=WEEKLY`     |
| `COUNT`    | Positive integer; mutually exclusive with `UNTIL`               |
| `UNTIL`    | `YYYYMMDDTHHMMSSZ` or ISO 8601; mutually exclusive with `COUNT` |

Invalid rules return `400 VALIDATION_ERROR` with a descriptive message.

**Errors:**

- `400 VALIDATION_ERROR` — invalid body shape or `endTime` ≤ `startTime`.
- `401 AUTH_ERROR` — missing session.
- `403 FORBIDDEN` — the user does not manage the church.
- `404 NOT_FOUND` — the church does not exist.

---

#### `PATCH /events/:id` _(church_admin or site_admin)_

Update an existing event. Same authorization and validation rules as `POST /churches/:churchId/events`. At least one field must be provided.

---

#### `DELETE /events/:id` _(church_admin or site_admin)_

Delete an event. Authorization matches the create/update endpoints.

---

#### `GET /events.ics`

Aggregated **iCalendar (RFC 5545)** feed for every church. Designed to be subscribed to from a
calendar app (Apple Calendar, Google Calendar, Outlook) so upcoming events stay in sync with a
user's personal calendar.

| Param | Type   | Required | Notes                                       |
| ----- | ------ | -------- | ------------------------------------------- |
| type  | string | No       | Filter by event type, same values as above. |

**Response headers:** `Content-Type: text/calendar; charset=utf-8`,
`Cache-Control: public, max-age=300`, `Content-Disposition: inline; filename="sa-church-finder-events.ics"`.

The document emits one `VEVENT` per stored row. Recurring series pass their canonical `RRULE`
straight through so calendar clients expand occurrences natively. Non-recurring events that
already ended more than a week ago are omitted; future entries are capped at 500 per feed.

---

#### `GET /churches/:slug/events.ics`

Per-church iCalendar feed with the same shape as `/events.ics`. The calendar name is
`"<Church Name> — Events"` so subscribers can distinguish feeds in their calendar app sidebar.

| Param | Type   | Required | Notes                                       |
| ----- | ------ | -------- | ------------------------------------------- |
| type  | string | No       | Filter by event type, same values as above. |

Returns `404 NOT_FOUND` when the slug does not exist.

---

### Auth

#### `POST /auth/register`

Register with email/password.

| Field    | Type   | Required       |
| -------- | ------ | -------------- |
| email    | string | Yes            |
| password | string | Yes (8+ chars) |
| name     | string | Yes            |

**Notes:** Creates the session immediately and also issues an email-verification token for the new account.

---

#### `POST /auth/login`

Login with email/password. Sets session cookie.

---

#### `POST /auth/logout`

Destroy session. Clears cookie.

---

#### `GET /auth/google`

Initiate Google OAuth flow. Redirects to Google.

**Notes:** Accepts an optional `returnTo` query parameter for the frontend path to land on after authentication. Unsafe or auth-page values fall back to `/account`.

---

#### `GET /auth/google/callback`

Google OAuth callback. Sets session and redirects to frontend.

**Notes:** On callback failure, redirects to the frontend login page with an `authError` query parameter instead of returning JSON.

---

#### `GET /auth/me`

Get current authenticated user profile.

---

#### `POST /auth/forgot-password`

Send password reset email.

---

#### `POST /auth/verify-email/resend`

Issue a fresh email verification token for the current authenticated user.

**Notes:** In local development, the response may include a preview verification URL when `AUTH_EXPOSE_VERIFICATION_PREVIEW=true`.

---

#### `POST /auth/verify-email`

Verify an email address with a token.

| Field | Type   | Required |
| ----- | ------ | -------- |
| token | string | Yes      |

---

#### `POST /auth/reset-password`

Reset password with token.

---

#### `POST /auth/change-password` _(authenticated)_

Change password for the currently authenticated user.

| Field           | Type   | Required       |
| --------------- | ------ | -------------- |
| currentPassword | string | Yes            |
| newPassword     | string | Yes (8+ chars) |

**Notes:** Returns 400 for Google-only users who have no password set.

---

### User

#### `GET /users/:id/claims`

Get a user's church claim requests. _(authenticated, own profile only)_

---

#### `GET /users/:id/reviews`

Get all reviews by a user.

---

#### `GET /users/:id/saved`

Get user's saved churches. _(authenticated, own profile only)_

---

#### `PATCH /users/:id/profile` _(authenticated, own profile only)_

Update user profile information.

| Field | Type   | Required |
| ----- | ------ | -------- |
| name  | string | No       |
| email | string | No       |

**Notes:** At least one field is required. Changing email sets `emailVerified` to false and issues a new verification token.

---

#### `POST /users/:id/avatar` _(authenticated, own profile only)_

Upload a profile photo. Accepts multipart/form-data with an `avatar` file field.

**Constraints:** JPEG, PNG, WebP, or GIF. Max 5 MB.

---

#### `DELETE /users/:id/avatar` _(authenticated, own profile only)_

Remove the user's profile photo.

---

#### `POST /users/:id/deactivate` _(authenticated, own profile only)_

Soft-delete the user account.

| Field    | Type   | Required                                         |
| -------- | ------ | ------------------------------------------------ |
| password | string | Yes for password users, optional for Google-only |

**Notes:** Sets `deactivatedAt` timestamp and destroys the session. Deactivated users cannot log in. Contact support to reactivate.

---

#### `POST /churches/:id/save` _(authenticated)_

Toggle save/unsave a church.

---

### Admin

#### `GET /admin/claims` _(site_admin)_

List pending church claim requests.

---

#### `PATCH /admin/claims/:id` _(site_admin)_

Approve or reject a claim.

| Field  | Type   | Required                       |
| ------ | ------ | ------------------------------ |
| status | string | Yes ('approved' or 'rejected') |

---

#### `GET /admin/flagged-reviews` _(site_admin)_

List flagged reviews for moderation.

---

### Church Claims

#### `POST /churches/:id/claim` _(authenticated)_

Submit a claim request for a church.

| Field              | Type   | Required |
| ------------------ | ------ | -------- |
| role_title         | string | Yes      |
| verification_email | string | Yes      |

---

### Church Visits (Passport)

#### `POST /churches/:id/visits` _(authenticated)_

Log a visit to a church.

| Field     | Type   | Required | Notes                 |
| --------- | ------ | -------- | --------------------- |
| visitedAt | string | Yes      | ISO date (YYYY-MM-DD) |
| notes     | string | No       | Max 1000 chars        |
| rating    | number | No       | 1–5 integer           |

**Response:** `{ data: ChurchVisit, meta: { newAwards: Award[] }, message }`

**Constraints:** One visit per user per church per day (unique on userId + churchId + visitedAt).

---

#### `PATCH /visits/:id` _(visit owner)_

Update visit notes or rating.

---

#### `DELETE /visits/:id` _(visit owner)_

Remove a visit record.

---

#### `GET /users/:id/visits` _(public)_

List a user's church visits with church info.

| Param    | Type   | Required | Notes                |
| -------- | ------ | -------- | -------------------- |
| page     | number | No       | Default: 1           |
| pageSize | number | No       | Default: 20, max: 50 |

---

#### `GET /users/:id/passport` _(public)_

Get a user's passport — stats, awards, and recent visits.

**Response:**

```json
{
  "data": {
    "user": { "id", "name", "avatarUrl", "createdAt" },
    "stats": {
      "totalVisits": 15,
      "uniqueChurches": 12,
      "denominationsVisited": 4,
      "neighborhoodsVisited": 6,
      "collectionsCount": 3,
      "reviewCount": 8
    },
    "awards": [
      { "awardType": "FIRST_VISIT", "earnedAt": "..." }
    ],
    "recentVisits": [
      { "id", "visitedAt", "rating", "notes", "church": { "name", "slug", ... } }
    ]
  }
}
```

---

### Collections

#### `POST /collections` _(authenticated)_

Create a new collection.

| Field       | Type    | Required | Notes         |
| ----------- | ------- | -------- | ------------- |
| name        | string  | Yes      | 1–100 chars   |
| description | string  | No       | Max 500 chars |
| isPublic    | boolean | No       | Default: true |

---

#### `GET /users/:id/collections` _(public for public collections, owner sees all)_

List a user's collections.

---

#### `GET /collections/:id` _(public if isPublic, owner always)_

Get a collection with its churches.

---

#### `PATCH /collections/:id` _(collection owner)_

Update collection name, description, or visibility.

---

#### `DELETE /collections/:id` _(collection owner)_

Delete a collection (cascade removes items).

---

#### `POST /collections/:id/churches/:churchId` _(collection owner)_

Add a church to a collection.

| Field | Type   | Required | Notes         |
| ----- | ------ | -------- | ------------- |
| notes | string | No       | Max 500 chars |

---

#### `DELETE /collections/:id/churches/:churchId` _(collection owner)_

Remove a church from a collection.

---

## Rate Limiting

- Auth endpoints: 5 requests/minute per IP
- Write endpoints (POST/PATCH/DELETE): 30 requests/minute per user
- Read endpoints: 100 requests/minute per IP
- Search endpoint: 60 requests/minute per IP

## Pagination

- All list endpoints use page-based pagination
- Default pageSize: 20, max: 50
- Response meta includes: `page`, `pageSize`, `total`, `totalPages`

---

## Ribbon Categories

### GET /ribbon-categories

Returns visible ribbon categories ordered by position. Cached server-side (5 min TTL).

**Auth:** None (public)

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "label": "Historic",
      "icon": "🏛️",
      "slug": "historic",
      "filterType": "QUERY",
      "filterValue": "Historic",
      "position": 0,
      "isVisible": true,
      "source": "MANUAL",
      "isPinned": true,
      "createdAt": "2026-04-13T...",
      "updatedAt": "2026-04-13T..."
    }
  ]
}
```

### GET /admin/ribbon-categories

Returns all ribbon categories (including hidden) ordered by position.

**Auth:** SITE_ADMIN

### POST /admin/ribbon-categories

Create a new ribbon category.

**Auth:** SITE_ADMIN

| Field       | Type    | Required | Notes                              |
| ----------- | ------- | -------- | ---------------------------------- |
| label       | string  | Yes      | 1-50 chars                         |
| icon        | string  | No       | Emoji, defaults to ⛪              |
| slug        | string  | No       | Auto-derived from label if omitted |
| filterType  | string  | Yes      | "QUERY" or "DENOMINATION"          |
| filterValue | string  | Yes      | Value used for filtering           |
| position    | number  | No       | Auto-appended if omitted           |
| isVisible   | boolean | No       | Defaults to true                   |
| isPinned    | boolean | No       | Defaults to false                  |

### PATCH /admin/ribbon-categories/:id

Update a ribbon category. At least one field required.

**Auth:** SITE_ADMIN

### DELETE /admin/ribbon-categories/:id

Delete a ribbon category.

**Auth:** SITE_ADMIN

### POST /admin/ribbon-categories/reorder

Bulk reorder categories by providing an ordered array of IDs.

**Auth:** SITE_ADMIN

| Field | Type     | Required | Notes                  |
| ----- | -------- | -------- | ---------------------- |
| ids   | string[] | Yes      | Ordered array of UUIDs |

### POST /admin/ribbon-categories/auto-generate

Auto-generate denomination categories from church data. Creates/updates AUTO-sourced categories based on the most popular denominations. Never touches MANUAL or pinned categories.

**Auth:** SITE_ADMIN

| Field | Type   | Required | Notes                      |
| ----- | ------ | -------- | -------------------------- |
| limit | number | No       | Max categories (default 6) |

**Response:**

```json
{
  "data": { "created": 3, "updated": 1, "removed": 0 },
  "message": "Auto-generation complete: 3 created, 1 updated, 0 removed"
}
```

---

### Forum

Community discussion forum for church visitors and leaders.

#### `GET /forum/posts`

List forum posts with filtering and pagination.

| Param    | Type   | Required | Notes                                                                         |
| -------- | ------ | -------- | ----------------------------------------------------------------------------- |
| category | string | No       | One of `general`, `recommendations`, `prayer-requests`, `events`, `newcomers` |
| sort     | string | No       | `recent` (default), `popular` (by views), `most-replies`                      |
| page     | number | No       | Page number (default: 1)                                                      |
| pageSize | number | No       | Results per page (default: 20, max: 50)                                       |

**Response:**

```json
{
  "data": [
    {
      "id": "...",
      "title": "Best churches for newcomers?",
      "body": "Just moved to SA...",
      "category": "newcomers",
      "authorId": "...",
      "author": { "id": "...", "name": "Jane", "avatarUrl": null },
      "isPinned": false,
      "isLocked": false,
      "viewCount": 42,
      "replyCount": 5,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 35,
    "totalPages": 2,
    "sort": "recent",
    "category": null
  }
}
```

Pinned posts are always sorted first regardless of sort option.

---

#### `GET /forum/posts/:id`

Get a single forum post with all replies. Increments the post's view count.

**Response:**

```json
{
  "data": {
    "id": "...",
    "title": "...",
    "body": "...",
    "category": "general",
    "authorId": "...",
    "author": { "id": "...", "name": "...", "avatarUrl": null },
    "isPinned": false,
    "isLocked": false,
    "viewCount": 43,
    "replyCount": 2,
    "createdAt": "...",
    "updatedAt": "...",
    "replies": [
      {
        "id": "...",
        "body": "Great question!",
        "postId": "...",
        "authorId": "...",
        "author": { "id": "...", "name": "...", "avatarUrl": null },
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

**Errors:** `404` post not found.

---

#### `POST /forum/posts` _(authenticated)_

Create a new forum post.

| Field    | Type   | Required | Notes                                                                                             |
| -------- | ------ | -------- | ------------------------------------------------------------------------------------------------- |
| title    | string | Yes      | 3–200 characters                                                                                  |
| body     | string | Yes      | 10–5000 characters                                                                                |
| category | string | No       | Default: `general`. One of `general`, `recommendations`, `prayer-requests`, `events`, `newcomers` |

**Response:** `{ data: ForumPost, message: "Post created successfully" }`

**Errors:** `400` validation failed, `401` not authenticated.

---

#### `PATCH /forum/posts/:id` _(post owner)_

Update an existing forum post. At least one field must be provided. Only the post author can edit.

| Field    | Type   | Required | Notes              |
| -------- | ------ | -------- | ------------------ |
| title    | string | No       | 3–200 characters   |
| body     | string | No       | 10–5000 characters |
| category | string | No       | Valid category     |

**Response:** `{ data: ForumPost, message: "Post updated successfully" }`

**Errors:** `400` validation failed, `401` not authenticated, `403` not the post author, `404` post not found.

---

#### `DELETE /forum/posts/:id` _(post owner or site_admin)_

Delete a forum post and all its replies (cascade).

**Response:** `{ data: { id, deleted: true }, message: "Post deleted successfully" }`

**Errors:** `401` not authenticated, `403` not the post author or site admin, `404` post not found.

---

#### `POST /forum/posts/:id/replies` _(authenticated)_

Add a reply to a forum post. Blocked if the post is locked.

| Field | Type   | Required | Notes             |
| ----- | ------ | -------- | ----------------- |
| body  | string | Yes      | 1–5000 characters |

**Response:** `{ data: ForumReply, message: "Reply created successfully" }`

**Errors:** `400` validation failed, `401` not authenticated, `403` post is locked, `404` post not found.

---

#### `DELETE /forum/replies/:id` _(reply owner or site_admin)_

Delete a forum reply.

**Response:** `{ data: { id, deleted: true }, message: "Reply deleted successfully" }`

**Errors:** `401` not authenticated, `403` not the reply author or site admin, `404` reply not found.

---

_Last updated: 2026-04-13 — added forum endpoints, ribbon categories, and church passport endpoints._
