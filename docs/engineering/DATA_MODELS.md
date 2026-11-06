# Data Models

> Reference for the v2 (lean) schema. `server/prisma/schema.prisma` is the single
> source of truth; keep this file in sync with it. Table names are snake_case
> plural; column names match the Prisma field names (camelCase, quoted in SQL).

## Relationships

```
users ──< reviews >── churches ──< church_services
  │                      │ ──< church_photos
  └──< user_saved_churches >┘ ──1 enrichment_states
users ──< password_reset_tokens
users ──< email_verification_tokens
```

Deleting a user cascades to their reviews, saved churches and tokens. Deleting a
church cascades to its services, photos, reviews, saves and enrichment state.

## Tables

### users

| Column        | Type      | Constraints      | Notes                            |
| ------------- | --------- | ---------------- | -------------------------------- |
| id            | UUID      | PK               |                                  |
| email         | TEXT      | UNIQUE, NOT NULL | Lower-cased on write             |
| passwordHash  | TEXT      | NULLABLE         | bcrypt; null for Google-only     |
| name          | TEXT      | NOT NULL         | Display name                     |
| avatarUrl     | TEXT      | NULLABLE         | Set from the Google profile only |
| googleId      | TEXT      | UNIQUE, NULLABLE | Google OAuth subject             |
| emailVerified | BOOLEAN   | default false    |                                  |
| createdAt     | TIMESTAMP | default now()    |                                  |
| updatedAt     | TIMESTAMP | auto-update      |                                  |

### churches

| Column                                               | Type                  | Constraints            | Notes                                                       |
| ---------------------------------------------------- | --------------------- | ---------------------- | ----------------------------------------------------------- |
| id                                                   | UUID                  | PK                     |                                                             |
| name                                                 | TEXT                  | NOT NULL               |                                                             |
| slug                                                 | TEXT                  | UNIQUE, NOT NULL       | URL identifier                                              |
| denomination                                         | TEXT                  | NULLABLE               | e.g. "Southern Baptist"                                     |
| denominationFamily                                   | TEXT                  | NULLABLE, indexed      | e.g. "Baptist" — the search filter value                    |
| description                                          | TEXT                  | NULLABLE               |                                                             |
| address                                              | TEXT                  | NOT NULL               |                                                             |
| city / state                                         | TEXT                  | default San Antonio/TX |                                                             |
| zipCode                                              | TEXT                  | NOT NULL               |                                                             |
| neighborhood                                         | TEXT                  | NULLABLE               | Derived from zip by `enrich-details`                        |
| latitude / longitude                                 | DECIMAL(10,8)/(11,8)  | NOT NULL               |                                                             |
| location                                             | geography(Point,4326) | NULLABLE, GiST index   | Maintained by a DB trigger from lat/lng (raw SQL migration) |
| phone, email, website, pastorName                    | TEXT                  | NULLABLE               |                                                             |
| yearEstablished                                      | INT                   | NULLABLE               |                                                             |
| avgRating                                            | DECIMAL(3,2)          | default 0              | Recomputed from `reviews` on every review write/delete      |
| reviewCount                                          | INT                   | default 0              | Same                                                        |
| googleRating                                         | DECIMAL(3,2)          | NULLABLE               | From Google Places                                          |
| googleReviewCount                                    | INT                   | NULLABLE               |                                                             |
| languages, amenities                                 | TEXT[]                | default []             |                                                             |
| coverImageUrl                                        | TEXT                  | NULLABLE               |                                                             |
| googlePlaceId                                        | TEXT                  | UNIQUE, NULLABLE       | Import dedup key                                            |
| businessStatus                                       | TEXT                  | NULLABLE, indexed      | `CLOSED_PERMANENTLY` rows are hidden from search            |
| googleMapsUrl, primaryType                           | TEXT                  | NULLABLE               |                                                             |
| goodForChildren, goodForGroups, wheelchairAccessible | BOOLEAN               | NULLABLE               | null = unknown                                              |
| createdAt / updatedAt                                | TIMESTAMP             |                        |                                                             |

Indexes: `slug`, `denominationFamily`, `(latitude, longitude)`, GiST on `location`, `businessStatus`.

### church_services

| Column                | Type      | Constraints            | Notes                                     |
| --------------------- | --------- | ---------------------- | ----------------------------------------- |
| id                    | UUID      | PK                     |                                           |
| churchId              | UUID      | FK → churches, CASCADE |                                           |
| dayOfWeek             | INT       | NOT NULL               | 0 = Sunday … 6 = Saturday                 |
| startTime             | TEXT      | NOT NULL               | `HH:MM` 24-hour                           |
| endTime               | TEXT      | NULLABLE               |                                           |
| serviceType           | TEXT      | NOT NULL               | e.g. "Worship", "Mass"                    |
| language              | TEXT      | default "English"      |                                           |
| description           | TEXT      | NULLABLE               |                                           |
| isAutoImported        | BOOLEAN   | default false          | Pipeline replaces only auto-imported rows |
| createdAt / updatedAt | TIMESTAMP |                        |                                           |

### church_photos

| Column         | Type      | Constraints            | Notes                                 |
| -------------- | --------- | ---------------------- | ------------------------------------- |
| id             | UUID      | PK                     |                                       |
| churchId       | UUID      | FK → churches, CASCADE |                                       |
| url            | TEXT      | NOT NULL               | Supabase Storage URL (Google import)  |
| altText        | TEXT      | NULLABLE               |                                       |
| displayOrder   | INT       | default 0              | Ascending order in grid/mosaic        |
| googlePhotoRef | TEXT      | NULLABLE               | Google photo resource name, for dedup |
| createdAt      | TIMESTAMP | default now()          |                                       |

### reviews

| Column                | Type         | Constraints            | Notes                    |
| --------------------- | ------------ | ---------------------- | ------------------------ |
| id                    | UUID         | PK                     |                          |
| userId                | UUID         | FK → users, CASCADE    |                          |
| churchId              | UUID         | FK → churches, CASCADE |                          |
| rating                | DECIMAL(3,2) | NOT NULL               | API accepts integers 1–5 |
| body                  | TEXT         | NOT NULL               | 10–2000 chars            |
| createdAt / updatedAt | TIMESTAMP    |                        |                          |

Unique: `(userId, churchId)` — one review per user per church.

### user_saved_churches

| Column   | Type      | Constraints            |
| -------- | --------- | ---------------------- |
| userId   | UUID      | FK → users, CASCADE    |
| churchId | UUID      | FK → churches, CASCADE |
| savedAt  | TIMESTAMP | default now()          |

PK: `(userId, churchId)`.

### password_reset_tokens / email_verification_tokens

| Column    | Type      | Constraints         | Notes                                          |
| --------- | --------- | ------------------- | ---------------------------------------------- |
| id        | UUID      | PK                  |                                                |
| userId    | UUID      | FK → users, CASCADE |                                                |
| tokenHash | TEXT      | UNIQUE              | SHA-256 of the raw token                       |
| expiresAt | TIMESTAMP | NOT NULL            | Reset: 60 min; verify: 24 h (env-configurable) |
| usedAt    | TIMESTAMP | NULLABLE            |                                                |
| createdAt | TIMESTAMP | default now()       |                                                |

### user_sessions

`connect-pg-simple`-compatible session table (`sid`, `sess`, `expire`), created by
raw SQL migration and accessed by `lib/prisma-session-store.ts`. Not a Prisma model.

### enrichment_states

Resumable progress for the website enrichment pipeline (`enrich-website-v2`).

| Column                              | Type      | Notes                                                                             |
| ----------------------------------- | --------- | --------------------------------------------------------------------------------- |
| id                                  | UUID      | PK                                                                                |
| churchId                            | UUID      | FK → churches, CASCADE, UNIQUE                                                    |
| version                             | TEXT      | default "v2"                                                                      |
| status                              | TEXT      | pending · fetched · extracted · applied · skipped_no_data · failed · rate_limited |
| pagesFetched                        | JSONB     | `[{ url, statusCode, bytes, fetchedAt, fromCache }]`                              |
| extractedData                       | JSONB     | Last extraction snapshot                                                          |
| confidence                          | FLOAT     | 0.0–1.0                                                                           |
| source                              | TEXT      | `json-ld`, `claude-ai`, `merged`, …                                               |
| lastError                           | TEXT      |                                                                                   |
| attempts                            | INT       | default 0                                                                         |
| startedAt / completedAt / updatedAt | TIMESTAMP |                                                                                   |

Index: `(status, version)`.

## Enums

None. (v1 enums `role`, `claim_status`, `ribbon_category_source` and
`ribbon_category_filter_type` were dropped.)

## Migration history note

`20261106000000_lean_overhaul` dropped the v1 tables `events`, `forum_posts`,
`forum_replies`, `church_visits`, `church_collections`, `church_collection_items`,
`user_awards`, `church_claims`, `review_votes`, `ribbon_categories`; the columns
`users.role`, `users.deactivatedAt`, `churches.isClaimed`, `churches.claimedById`,
`church_photos.uploadedById` and the review sub-rating/vote/flag/response columns;
and the enums listed above. Rows in those tables were destroyed on deploy.

---

_Last updated: 2026-11-06 — v2 lean overhaul._
