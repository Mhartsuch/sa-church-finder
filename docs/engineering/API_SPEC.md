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

### Church Services

#### `GET /churches/:churchId/services`

List all services for a church.

---

#### `POST /churches/:churchId/services` _(church_admin)_

Add a new service time.

| Field        | Type   | Required | Notes                                                        |
| ------------ | ------ | -------- | ------------------------------------------------------------ |
| day_of_week  | number | Yes      | 0=Sunday through 6=Saturday                                  |
| start_time   | string | Yes      | HH:MM format (e.g., '09:00')                                 |
| end_time     | string | No       | HH:MM format                                                 |
| service_type | string | Yes      | 'traditional', 'contemporary', 'blended', 'youth', 'spanish' |
| language     | string | No       | Default: 'English'                                           |
| description  | string | No       | Max 200 chars                                                |

---

#### `PATCH /churches/services/:id` _(church_admin)_

Update an existing service.

---

#### `DELETE /churches/services/:id` _(church_admin or site_admin)_

Remove a service.

---

### Church Photos

#### `GET /churches/:churchId/photos`

List photos for a church, ordered by display_order.

---

#### `POST /churches/:churchId/photos` _(church_admin)_

Upload a photo. Accepts multipart/form-data.

| Field         | Type   | Required | Notes                                |
| ------------- | ------ | -------- | ------------------------------------ |
| image         | file   | Yes      | JPEG, PNG, or WebP. Max 5MB.         |
| alt_text      | string | No       | Accessibility description            |
| display_order | number | No       | Sort position (default: append last) |

**Flow:** Backend uploads to Cloudinary, stores URL and public_id in database.

---

#### `PATCH /churches/photos/:id` _(church_admin)_

Update photo metadata (alt_text, display_order).

---

#### `DELETE /churches/photos/:id` _(church_admin or site_admin)_

Delete a photo (removes from Cloudinary and database).

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

_Last updated: 2026-04-11 — documented church-admin event create/update/delete endpoints._
