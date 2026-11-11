# API Specification (v2)

> REST API for SA Church Finder. All endpoints except `/sitemap.xml` are
> prefixed with `/api/v1`. This is the complete public surface — anything not
> listed here returns `404`.

## Conventions

```jsonc
// Success
{ "data": { ... }, "meta": { ... } }

// Error
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { ... } } }
```

- Auth is session-based (HTTP-only cookie). Protected routes return `401 AUTH_ERROR`
  without a session; `/users/:id/*` routes return `403 FORBIDDEN` when `:id` is not
  the signed-in user.
- Invalid input returns `400 VALIDATION_ERROR` with a human-readable `message`
  ("Password must be at least 8 characters") and
  `details.issues: [{ field, message }]` for per-field display; missing resources `404 NOT_FOUND`;
  duplicates `409 CONFLICT`. Auth mutation endpoints are rate limited (`429 RATE_LIMITED`).
- Dates are ISO 8601 strings. Nullable fields are always present (as `null`).
- Cache: `/auth/*` and all mutations are `no-store`; `/churches/filter-options` is
  `private, max-age=30, stale-while-revalidate=120`; other GETs are `private, no-cache`.

## Shared shapes

```ts
type ChurchService = {
  id: string;
  churchId: string;
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
  startTime: string; // "HH:MM"
  endTime: string | null;
  serviceType: string;
  language: string;
  description: string | null;
};

type ChurchPhoto = {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
};

type ChurchSummary = {
  id: string;
  name: string;
  slug: string;
  denomination: string | null;
  denominationFamily: string | null;
  description: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  avgRating: number;
  reviewCount: number;
  googleRating: number | null;
  googleReviewCount: number | null;
  languages: string[];
  amenities: string[];
  coverImageUrl: string | null;
  businessStatus: string | null;
  goodForChildren: boolean | null;
  goodForGroups: boolean | null;
  wheelchairAccessible: boolean | null;
  isSaved: boolean;
  distance?: number; // miles from search center, search results only
  photos: ChurchPhoto[]; // first 5 by displayOrder
  services: ChurchService[]; // ordered by dayOfWeek, startTime
};

type Church = ChurchSummary & {
  // detail: photos = ALL photos by displayOrder
  email: string | null;
  pastorName: string | null;
  yearEstablished: number | null;
  googleMapsUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type Review = {
  id: string;
  churchId: string;
  userId: string;
  rating: number; // integer 1–5
  body: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
};

type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
};
```

---

## Health

#### `GET /health`

`200` (or `503` when the database is unreachable):
`{ status: "ok"|"degraded", version, commit, timestamp, uptime, environment, database: { connected, latencyMs?, error? }, integrations: { emailDelivery, errorMonitoring, googleOAuth } }`
(each integration is `{ configured, status }`). Not wrapped in the envelope.

## Churches

#### `GET /churches`

Search. Response: `{ data: ChurchSummary[], meta: { page, pageSize, total, totalPages, center: { lat, lng } } }`.

| Param                                                                   | Type                                                      | Notes                                                                                       |
| ----------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `q`                                                                     | string ≤ 200                                              | Name, denomination, neighborhood, city, zip, address, description, amenities, service types |
| `denomination`                                                          | csv                                                       | Denomination families, OR-combined, case-insensitive                                        |
| `day`                                                                   | 0–6                                                       | Has a service that day                                                                      |
| `time`                                                                  | `morning` \| `afternoon` \| `evening`                     | Service start <12:00, 12–17, ≥17:00                                                         |
| `language`                                                              | csv                                                       | OR-combined                                                                                 |
| `amenities`                                                             | csv                                                       | AND-combined, exact (case-insensitive)                                                      |
| `wheelchairAccessible`, `goodForChildren`, `goodForGroups`, `hasPhotos` | `true`/`false`/`1`/`0`                                    | Only `true` filters; unknown (null) never matches                                           |
| `minRating`                                                             | 0–5                                                       | Local avg when reviewed, else Google rating                                                 |
| `neighborhood`                                                          | string                                                    | Exact, case-insensitive                                                                     |
| `sort`                                                                  | `relevance` (default) \| `distance` \| `rating` \| `name` | `rating` is Bayesian-weighted                                                               |
| `lat`, `lng`, `radius`                                                  | number; radius ≤ 25 mi (default 10)                       | Default center is downtown San Antonio                                                      |
| `bounds`                                                                | `swLat,swLng,neLat,neLng`                                 | Replaces the radius filter when valid                                                       |
| `page`, `pageSize`                                                      | int; pageSize ≤ 50 (default 20)                           |                                                                                             |

Permanently closed churches and hidden listings (`isHidden`: non-churches
such as parish offices, schools and cemeteries, plus duplicates) are always
excluded. Relevance ranking rewards
photos (churches without photos always rank last), profile completeness,
service variety, rating/review volume, proximity, freshness, accessibility and
operational status; Latter-day Saints and Jehovah's Witnesses are demoted (not
excluded) in default orderings. Anonymous responses are cached in-process for 60s.

#### `GET /churches/filter-options`

`{ data: { denominations: { value, count }[], languages: string[], amenities: string[], neighborhoods: string[] } }`
— derived from visible (non-closed, non-hidden) churches; denominations sorted by count desc. Cached in-process for 5 minutes.

#### `GET /churches/:slug`

`{ data: Church }` — `404` for unknown slugs.

#### `POST /churches/:id/save` _(auth)_

Toggles the saved state. `{ data: { churchId, saved: boolean } }`. `404` for unknown churches.

## Reviews

#### `GET /churches/:churchId/reviews`

Query: `page` (default 1), `pageSize` (≤ 50, default 10), `sort` = `recent` (default) | `highest` | `lowest`.

```jsonc
{
  "data": [Review],
  "meta": { "page": 1, "pageSize": 10, "total": 23, "totalPages": 3, "sort": "recent" },
  "currentUserReview": Review | null   // signed-in user's review of this church
}
```

#### `POST /churches/:churchId/reviews` _(auth)_

Body `{ rating: 1–5 integer, body: string 10–2000 }` → `201 { data: Review }`.
`409` if the user already reviewed this church; `404` for unknown churches.

#### `PATCH /reviews/:id` _(auth, owner)_

Body `{ rating?, body? }` (at least one) → `{ data: Review }`. `403` when not the owner.

#### `DELETE /reviews/:id` _(auth, owner)_

`{ data: { id, churchId } }`. `403` when not the owner.

Every create, rating change and delete recomputes the church's `avgRating` and `reviewCount`.

## Users _(auth, own account only)_

#### `GET /users/:id/saved`

Query `page`, `pageSize` (≤ 100, default 20). Most recently saved first.
`{ data: (ChurchSummary & { savedAt: string })[], meta: { page, pageSize, total, totalPages } }`.

#### `GET /users/:id/reviews`

`{ data: (Review & { church: { id, name, slug, denomination, neighborhood, coverImageUrl } })[], meta: { total } }`, most recently updated first.

#### `PATCH /users/:id/profile`

Body `{ name: string 1–100 }` → `{ data: AuthUser }`.

#### `DELETE /users/:id`

Body `{ password?: string }` — required (`400 PASSWORD_REQUIRED` / `400 INVALID_PASSWORD`)
when the account has a password; Google-only accounts omit it. Permanently deletes
the user (reviews, saves and tokens cascade; affected church ratings are
recomputed), destroys the session and clears the cookie. `{ data: { deleted: true } }`.

## Auth

All return `{ data, message }` unless noted. `data` is an `AuthUser` where a user is returned.

| Method | Path                        | Body / notes                                                                             |
| ------ | --------------------------- | ---------------------------------------------------------------------------------------- |
| POST   | `/auth/register`            | `{ email, password (8–72), name }` → `201`, signs in, sends verification + welcome email |
| POST   | `/auth/login`               | `{ email, password }` → `AuthUser`; `401` on bad credentials                             |
| POST   | `/auth/logout`              | Destroys the session                                                                     |
| GET    | `/auth/me`                  | `{ data: AuthUser }`; `401` without a session                                            |
| GET    | `/auth/google`              | Redirects to Google. Optional `returnTo` (safe client path; default `/account`)          |
| GET    | `/auth/google/callback`     | Signs in/links by Google id or email, redirects to the client (`?authError=` on failure) |
| POST   | `/auth/forgot-password`     | `{ email }` → always the same generic message                                            |
| POST   | `/auth/reset-password`      | `{ token, password }`                                                                    |
| POST   | `/auth/change-password`     | _(auth)_ `{ currentPassword, newPassword }`; `400 NO_PASSWORD` for Google-only accounts  |
| POST   | `/auth/verify-email`        | `{ token }` → `{ status: "verified" \| "already-verified" }`                             |
| POST   | `/auth/verify-email/resend` | _(auth)_ → `{ status: "sent" \| "already-verified", previewUrl? }`                       |

`previewUrl` (verification/reset links) is only exposed outside production when
`AUTH_EXPOSE_VERIFICATION_PREVIEW` / `AUTH_EXPOSE_RESET_PREVIEW` is `true`.

## Sitemap

#### `GET /sitemap.xml`

XML sitemap of `/`, `/privacy`, `/terms` and every visible (non-closed, non-hidden) `/churches/:slug`, plus a landing page
(`/?denomination=…`, `/?neighborhood=…`) for each tradition and area with at least five churches.
