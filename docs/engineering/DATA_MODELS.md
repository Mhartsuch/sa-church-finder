# Data Models

> Database schema design for SA Church Finder. This document is the reference for the Prisma schema. Any changes here must be reflected in `schema.prisma`.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│   users     │──┐    │  churches   │──┐    │   services   │
│             │  │    │             │  │    │              │
│ id          │  │    │ id          │  │    │ id           │
│ email       │  │    │ name        │  │    │ church_id FK │
│ name        │  │    │ slug        │  │    │ day_of_week  │
│ avatar_url  │  │    │ denomination│  │    │ start_time   │
│ role        │  │    │ lat/lng     │  │    │ type         │
│ ...         │  │    │ ...         │  │    │ language     │
└─────────────┘  │    └─────────────┘  │    └──────────────┘
      │          │          │          │
      │          │          │          │
      ▼          │          ▼          │
┌─────────────┐  │    ┌─────────────┐  │    ┌──────────────┐
│  reviews    │  │    │   events    │  │    │ church_photos│
│             │  │    │             │  │    │              │
│ id          │  │    │ id          │  │    │ id           │
│ user_id FK  │  │    │ church_id FK│  │    │ church_id FK │
│ church_id FK│  │    │ title       │  │    │ url          │
│ rating      │  │    │ start_time  │  │    │ order        │
│ body        │  │    │ type        │  │    │ alt_text     │
│ ...         │  │    │ ...         │  │    └──────────────┘
└─────────────┘  │    └─────────────┘
                 │
                 ▼
          ┌──────────────────┐
          │user_saved_churches│
          │                  │
          │ user_id FK       │
          │ church_id FK     │
          │ saved_at         │
          └──────────────────┘
```

## Tables

### users

| Column         | Type         | Constraints              | Notes                                |
| -------------- | ------------ | ------------------------ | ------------------------------------ |
| id             | UUID         | PK, default gen          |                                      |
| email          | VARCHAR(255) | UNIQUE, NOT NULL         |                                      |
| password_hash  | VARCHAR(255) | NULLABLE                 | Null for OAuth-only users            |
| name           | VARCHAR(100) | NOT NULL                 | Display name                         |
| avatar_url     | TEXT         | NULLABLE                 | Profile image URL                    |
| role           | ENUM         | NOT NULL, default 'user' | 'user', 'church_admin', 'site_admin' |
| google_id      | VARCHAR(255) | UNIQUE, NULLABLE         | Google OAuth subject ID              |
| email_verified | BOOLEAN      | default false            |                                      |
| deactivated_at | TIMESTAMP    | NULLABLE                 | Soft-delete timestamp                |
| created_at     | TIMESTAMP    | default now()            |                                      |
| updated_at     | TIMESTAMP    | auto-update              |                                      |

### churches

| Column                | Type             | Constraints             | Notes                                                     |
| --------------------- | ---------------- | ----------------------- | --------------------------------------------------------- |
| id                    | UUID             | PK, default gen         |                                                           |
| name                  | VARCHAR(200)     | NOT NULL                |                                                           |
| slug                  | VARCHAR(250)     | UNIQUE, NOT NULL        | URL-friendly identifier                                   |
| denomination          | VARCHAR(100)     | NULLABLE                | e.g., "Southern Baptist", "Catholic"                      |
| denomination_family   | VARCHAR(50)      | NULLABLE                | e.g., "Baptist", "Catholic", "Non-denominational"         |
| description           | TEXT             | NULLABLE                | Rich text about the church                                |
| address               | VARCHAR(300)     | NOT NULL                | Full street address                                       |
| city                  | VARCHAR(100)     | default 'San Antonio'   |                                                           |
| state                 | VARCHAR(2)       | default 'TX'            |                                                           |
| zip_code              | VARCHAR(10)      | NOT NULL                |                                                           |
| neighborhood          | VARCHAR(100)     | NULLABLE                | e.g., "Alamo Heights", "Stone Oak"                        |
| latitude              | DECIMAL(10,7)    | NOT NULL                |                                                           |
| longitude             | DECIMAL(10,7)    | NOT NULL                |                                                           |
| location              | GEOGRAPHY(Point) | NOT NULL                | PostGIS point for spatial queries                         |
| phone                 | VARCHAR(20)      | NULLABLE                |                                                           |
| email                 | VARCHAR(255)     | NULLABLE                |                                                           |
| website               | TEXT             | NULLABLE                |                                                           |
| pastor_name           | VARCHAR(150)     | NULLABLE                |                                                           |
| year_established      | INTEGER          | NULLABLE                |                                                           |
| avg_rating            | DECIMAL(2,1)     | default 0.0             | Cached aggregate from local user reviews                  |
| review_count          | INTEGER          | default 0               | Cached count of local user reviews                        |
| google_rating         | DECIMAL(3,2)     | NULLABLE                | Rating from Google Places API                             |
| google_review_count   | INTEGER          | NULLABLE                | Review count from Google Places API                       |
| is_claimed            | BOOLEAN          | default false           | Whether a church admin has claimed it                     |
| claimed_by            | UUID             | FK → users.id, NULLABLE |                                                           |
| languages             | TEXT[]           | default ['English']     | Array of languages                                        |
| amenities             | TEXT[]           | default []              | e.g., ['parking', 'wheelchair', 'childcare']              |
| cover_image_url       | TEXT             | NULLABLE                | Primary listing photo                                     |
| google_place_id       | TEXT             | UNIQUE, NULLABLE        | Google Places API ID for import deduplication             |
| business_status       | VARCHAR(50)      | NULLABLE                | "OPERATIONAL", "CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY" |
| google_maps_url       | TEXT             | NULLABLE                | Direct link to Google Maps listing                        |
| primary_type          | VARCHAR(50)      | NULLABLE                | Google place type, e.g. "church"                          |
| good_for_children     | BOOLEAN          | NULLABLE                | From Google Places accessibility data                     |
| good_for_groups       | BOOLEAN          | NULLABLE                | From Google Places accessibility data                     |
| wheelchair_accessible | BOOLEAN          | NULLABLE                | From Google Places accessibility data                     |
| created_at            | TIMESTAMP        | default now()           |                                                           |
| updated_at            | TIMESTAMP        | auto-update             |                                                           |

**Indexes:**

- `location` — GiST spatial index (PostGIS)
- `slug` — UNIQUE B-tree
- `denomination_family` — B-tree (filter queries)
- `(city, state)` — composite B-tree
- `name` — GIN trigram index (fuzzy text search)

### church_services

| Column           | Type         | Constraints                | Notes                                                        |
| ---------------- | ------------ | -------------------------- | ------------------------------------------------------------ |
| id               | UUID         | PK, default gen            |                                                              |
| church_id        | UUID         | FK → churches.id, NOT NULL | ON DELETE CASCADE                                            |
| day_of_week      | SMALLINT     | NOT NULL                   | 0=Sunday, 1=Monday, ... 6=Saturday                           |
| start_time       | TIME         | NOT NULL                   | e.g., '09:00'                                                |
| end_time         | TIME         | NULLABLE                   |                                                              |
| service_type     | VARCHAR(50)  | NOT NULL                   | 'traditional', 'contemporary', 'blended', 'youth', 'spanish' |
| language         | VARCHAR(30)  | default 'English'          |                                                              |
| description      | VARCHAR(200) | NULLABLE                   | Optional notes                                               |
| is_auto_imported | BOOLEAN      | default false              | true if auto-generated from Google opening hours             |

### church_photos

| Column           | Type         | Constraints                | Notes                                       |
| ---------------- | ------------ | -------------------------- | ------------------------------------------- |
| id               | UUID         | PK, default gen            |                                             |
| church_id        | UUID         | FK → churches.id, NOT NULL | ON DELETE CASCADE                           |
| url              | TEXT         | NOT NULL                   | Cloudinary URL                              |
| alt_text         | VARCHAR(200) | NULLABLE                   | Accessibility text                          |
| display_order    | SMALLINT     | default 0                  | Sort order in carousel                      |
| uploaded_by      | UUID         | FK → users.id, NULLABLE    |                                             |
| google_photo_ref | TEXT         | NULLABLE                   | Google Places photo resource name for dedup |
| created_at       | TIMESTAMP    | default now()              |                                             |

### reviews

| Column            | Type         | Constraints                | Notes                     |
| ----------------- | ------------ | -------------------------- | ------------------------- |
| id                | UUID         | PK, default gen            |                           |
| user_id           | UUID         | FK → users.id, NOT NULL    | ON DELETE CASCADE         |
| church_id         | UUID         | FK → churches.id, NOT NULL | ON DELETE CASCADE         |
| rating            | DECIMAL(2,1) | NOT NULL                   | 1.0–5.0 in 0.5 increments |
| body              | TEXT         | NOT NULL                   | 50–2000 characters        |
| welcome_rating    | SMALLINT     | NULLABLE                   | 1–5 sub-rating            |
| worship_rating    | SMALLINT     | NULLABLE                   | 1–5 sub-rating            |
| sermon_rating     | SMALLINT     | NULLABLE                   | 1–5 sub-rating            |
| facilities_rating | SMALLINT     | NULLABLE                   | 1–5 sub-rating            |
| helpful_count     | INTEGER      | default 0                  | Cached vote count         |
| is_flagged        | BOOLEAN      | default false              | Flagged for moderation    |
| response_body     | TEXT         | NULLABLE                   | Church leader's reply     |
| responded_at      | TIMESTAMP    | NULLABLE                   | When response was posted  |
| created_at        | TIMESTAMP    | default now()              |                           |
| updated_at        | TIMESTAMP    | auto-update                |                           |

**Constraints:**

- UNIQUE(user_id, church_id) — one review per user per church
- CHECK(rating >= 1.0 AND rating <= 5.0)
- CHECK(char_length(body) >= 50)

### review_votes

| Column     | Type      | Constraints               | Notes |
| ---------- | --------- | ------------------------- | ----- |
| user_id    | UUID      | FK → users.id, NOT NULL   |       |
| review_id  | UUID      | FK → reviews.id, NOT NULL |       |
| created_at | TIMESTAMP | default now()             |       |

**PK:** (user_id, review_id)

### events

| Column            | Type         | Constraints                | Notes                                                                                                                                                                                                                         |
| ----------------- | ------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                | UUID         | PK, default gen            |                                                                                                                                                                                                                               |
| church_id         | UUID         | FK → churches.id, NOT NULL | ON DELETE CASCADE                                                                                                                                                                                                             |
| title             | VARCHAR(200) | NOT NULL                   |                                                                                                                                                                                                                               |
| description       | TEXT         | NULLABLE                   |                                                                                                                                                                                                                               |
| event_type        | VARCHAR(50)  | NOT NULL                   | 'service', 'community', 'volunteer', 'study', 'youth', 'other'                                                                                                                                                                |
| start_time        | TIMESTAMP    | NOT NULL                   |                                                                                                                                                                                                                               |
| end_time          | TIMESTAMP    | NULLABLE                   |                                                                                                                                                                                                                               |
| location_override | VARCHAR(300) | NULLABLE                   | If different from church address                                                                                                                                                                                              |
| is_recurring      | BOOLEAN      | default false              |                                                                                                                                                                                                                               |
| recurrence_rule   | VARCHAR(255) | NULLABLE                   | iCal RRULE body — supports `FREQ=DAILY\|WEEKLY\|MONTHLY`, `INTERVAL`, `BYDAY` (weekly only), `COUNT`, and `UNTIL`. Parsed and canonicalized on write; expanded into occurrences on read (see `server/src/lib/recurrence.ts`). |
| created_by        | UUID         | FK → users.id, NULLABLE    |                                                                                                                                                                                                                               |
| is_auto_imported  | BOOLEAN      | default false              | Set true for events populated by the website enrichment pipeline. The pipeline replaces all auto-imported rows on each run; hand-curated events (`is_auto_imported=false`) are preserved.                                     |
| source_url        | TEXT         | NULLABLE                   | Page where the event was scraped from (for auto-imported events).                                                                                                                                                             |
| created_at        | TIMESTAMP    | default now()              |                                                                                                                                                                                                                               |
| updated_at        | TIMESTAMP    | auto-update                |                                                                                                                                                                                                                               |

**Indexes:** (church_id, is_auto_imported)

### church_claims

| Column             | Type         | Constraints                | Notes                             |
| ------------------ | ------------ | -------------------------- | --------------------------------- |
| id                 | UUID         | PK, default gen            |                                   |
| church_id          | UUID         | FK → churches.id, NOT NULL |                                   |
| user_id            | UUID         | FK → users.id, NOT NULL    |                                   |
| role_title         | VARCHAR(100) | NOT NULL                   | e.g., "Pastor", "Office Manager"  |
| verification_email | VARCHAR(255) | NOT NULL                   | Church domain email               |
| status             | ENUM         | default 'pending'          | 'pending', 'approved', 'rejected' |
| reviewed_by        | UUID         | FK → users.id, NULLABLE    | Site admin who reviewed           |
| created_at         | TIMESTAMP    | default now()              |                                   |
| reviewed_at        | TIMESTAMP    | NULLABLE                   |                                   |

### password_reset_tokens

| Column     | Type         | Constraints             | Notes                                   |
| ---------- | ------------ | ----------------------- | --------------------------------------- |
| id         | UUID         | PK, default gen         |                                         |
| user_id    | UUID         | FK → users.id, NOT NULL | ON DELETE CASCADE                       |
| token_hash | VARCHAR(255) | NOT NULL                | SHA-256 hash of the reset token         |
| expires_at | TIMESTAMP    | NOT NULL                | Token expiration (1 hour from creation) |
| used_at    | TIMESTAMP    | NULLABLE                | Set when token is consumed              |
| created_at | TIMESTAMP    | default now()           |                                         |

### email_verification_tokens

| Column     | Type         | Constraints              | Notes                                             |
| ---------- | ------------ | ------------------------ | ------------------------------------------------- |
| id         | UUID         | PK, default gen          |                                                   |
| user_id    | UUID         | FK -> users.id, NOT NULL | ON DELETE CASCADE                                 |
| token_hash | VARCHAR(255) | NOT NULL                 | SHA-256 hash of the verification token            |
| expires_at | TIMESTAMP    | NOT NULL                 | Token expiration (default 24 hours from creation) |
| used_at    | TIMESTAMP    | NULLABLE                 | Set when the verification link is consumed        |
| created_at | TIMESTAMP    | default now()            |                                                   |

### user_saved_churches

| Column    | Type      | Constraints                | Notes             |
| --------- | --------- | -------------------------- | ----------------- |
| user_id   | UUID      | FK → users.id, NOT NULL    | ON DELETE CASCADE |
| church_id | UUID      | FK → churches.id, NOT NULL | ON DELETE CASCADE |
| saved_at  | TIMESTAMP | default now()              |                   |

**PK:** (user_id, church_id)

### church_visits

| Column     | Type      | Constraints                | Notes                     |
| ---------- | --------- | -------------------------- | ------------------------- |
| id         | UUID      | PK, default gen            |                           |
| user_id    | UUID      | FK → users.id, NOT NULL    | ON DELETE CASCADE         |
| church_id  | UUID      | FK → churches.id, NOT NULL | ON DELETE CASCADE         |
| visited_at | DATE      | NOT NULL                   | Date of the visit         |
| notes      | TEXT      | NULLABLE                   | Personal notes (max 1000) |
| rating     | INTEGER   | NULLABLE                   | Personal 1–5 rating       |
| created_at | TIMESTAMP | default now()              |                           |
| updated_at | TIMESTAMP | auto-update                |                           |

**Constraints:** UNIQUE(user_id, church_id, visited_at) — one visit per church per day.

**Indexes:** user_id

### church_collections

| Column      | Type         | Constraints             | Notes                         |
| ----------- | ------------ | ----------------------- | ----------------------------- |
| id          | UUID         | PK, default gen         |                               |
| user_id     | UUID         | FK → users.id, NOT NULL | ON DELETE CASCADE             |
| name        | VARCHAR(100) | NOT NULL                |                               |
| description | TEXT         | NULLABLE                | Max 500 chars                 |
| slug        | VARCHAR(150) | NOT NULL                | URL-friendly, unique per user |
| is_public   | BOOLEAN      | default true            |                               |
| created_at  | TIMESTAMP    | default now()           |                               |
| updated_at  | TIMESTAMP    | auto-update             |                               |

**Constraints:** UNIQUE(user_id, slug)

**Indexes:** user_id

### church_collection_items

| Column        | Type      | Constraints                          | Notes             |
| ------------- | --------- | ------------------------------------ | ----------------- |
| collection_id | UUID      | FK → church_collections.id, NOT NULL | ON DELETE CASCADE |
| church_id     | UUID      | FK → churches.id, NOT NULL           | ON DELETE CASCADE |
| notes         | TEXT      | NULLABLE                             | Max 500 chars     |
| added_at      | TIMESTAMP | default now()                        |                   |

**PK:** (collection_id, church_id)

### user_awards

| Column     | Type        | Constraints             | Notes                        |
| ---------- | ----------- | ----------------------- | ---------------------------- |
| id         | UUID        | PK, default gen         |                              |
| user_id    | UUID        | FK → users.id, NOT NULL | ON DELETE CASCADE            |
| award_type | VARCHAR(50) | NOT NULL                | Award identifier (enum-like) |
| earned_at  | TIMESTAMP   | default now()           |                              |

**Constraints:** UNIQUE(user_id, award_type) — one of each award per user.

**Indexes:** user_id

**Award types:** FIRST_VISIT, EXPLORER_5, DEVOTED_10, PILGRIM_25, DENOMINATION_DIVERSITY, NEIGHBORHOOD_EXPLORER, REGULAR, REVIEWER

---

### forum_posts

| Column     | Type      | Constraints             | Notes                                                                          |
| ---------- | --------- | ----------------------- | ------------------------------------------------------------------------------ |
| id         | CUID      | PK, default gen         |                                                                                |
| title      | TEXT      | NOT NULL                | 3–200 characters                                                               |
| body       | TEXT      | NOT NULL                | 10–5000 characters                                                             |
| category   | TEXT      | default 'general'       | One of: `general`, `recommendations`, `prayer-requests`, `events`, `newcomers` |
| author_id  | TEXT      | FK → users.id, NOT NULL | ON DELETE CASCADE                                                              |
| is_pinned  | BOOLEAN   | default false           | Pinned posts sort first in all views                                           |
| is_locked  | BOOLEAN   | default false           | Locked posts reject new replies                                                |
| view_count | INTEGER   | default 0               | Incremented on each detail fetch                                               |
| created_at | TIMESTAMP | default now()           |                                                                                |
| updated_at | TIMESTAMP | auto-update             |                                                                                |

**Indexes:** category, author_id, created_at

### forum_replies

| Column     | Type      | Constraints                   | Notes             |
| ---------- | --------- | ----------------------------- | ----------------- |
| id         | CUID      | PK, default gen               |                   |
| body       | TEXT      | NOT NULL                      | 1–5000 characters |
| post_id    | TEXT      | FK → forum_posts.id, NOT NULL | ON DELETE CASCADE |
| author_id  | TEXT      | FK → users.id, NOT NULL       | ON DELETE CASCADE |
| created_at | TIMESTAMP | default now()                 |                   |
| updated_at | TIMESTAMP | auto-update                   |                   |

**Indexes:** post_id, author_id

---

### ribbon_categories

| Column       | Type                        | Constraints    | Notes                                        |
| ------------ | --------------------------- | -------------- | -------------------------------------------- |
| id           | UUID                        | PK             | auto-generated                               |
| label        | TEXT                        | NOT NULL       | Display name on the chip                     |
| icon         | TEXT                        | default '⛪'   | Emoji icon                                   |
| slug         | TEXT                        | UNIQUE         | URL-safe identifier                          |
| filter_type  | ribbon_category_filter_type | NOT NULL       | QUERY or DENOMINATION                        |
| filter_value | TEXT                        | NOT NULL       | Value used for filtering                     |
| position     | INTEGER                     | default 0      | Sort order (lower = further left)            |
| is_visible   | BOOLEAN                     | default true   | Admin can hide without deleting              |
| source       | ribbon_category_source      | default MANUAL | MANUAL (admin) or AUTO (generated from data) |
| is_pinned    | BOOLEAN                     | default false  | Pinned categories survive auto-gen sweeps    |
| created_at   | TIMESTAMP                   | default now()  |                                              |
| updated_at   | TIMESTAMP                   | auto-updated   |                                              |

**Indexes:** slug (unique), position, is_visible

**Enums:**

- `ribbon_category_source`: MANUAL, AUTO
- `ribbon_category_filter_type`: QUERY, DENOMINATION

---

### enrichment_states

Tracks progress of the website enrichment pipeline (v2) so runs are
resumable after interruption or Claude CLI rate limits.

| Column         | Type      | Constraints              | Notes                                                                                   |
| -------------- | --------- | ------------------------ | --------------------------------------------------------------------------------------- |
| id             | UUID      | PK                       | auto-generated                                                                          |
| church_id      | TEXT      | FK → churches.id, UNIQUE | ON DELETE CASCADE. One state row per church.                                            |
| version        | TEXT      | default 'v2'             | Pipeline version identifier                                                             |
| status         | TEXT      | NOT NULL                 | pending \| fetched \| extracted \| applied \| skipped_no_data \| failed \| rate_limited |
| pages_fetched  | JSONB     | default '[]'             | Array of `{url, statusCode, bytes, fetchedAt, fromCache}`                               |
| extracted_data | JSONB     | nullable                 | Last ExtractedChurchData snapshot                                                       |
| confidence     | FLOAT     | nullable                 | 0.0–1.0                                                                                 |
| source         | TEXT      | nullable                 | e.g. `json-ld`, `claude-ai`, `merged`                                                   |
| last_error     | TEXT      | nullable                 | Most recent failure message                                                             |
| attempts       | INTEGER   | default 0                | Incremented on each fetch attempt                                                       |
| started_at     | TIMESTAMP | default now()            |                                                                                         |
| completed_at   | TIMESTAMP | nullable                 | Set when terminal state reached                                                         |
| updated_at     | TIMESTAMP | auto-updated             |                                                                                         |

**Indexes:** church_id (unique), (status, version)

The pipeline script (`npm run enrich:website-v2`) consults this table to
skip already-applied churches and to resume interrupted runs.

---

_Last updated: 2026-04-14 — added enrichment_states + events.is_auto_imported/source_url for resumable website enrichment (v2)._
