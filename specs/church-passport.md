# Church Passport & Collections

> Feature spec for visit tracking, church collections, and the passport experience.

## Overview

Users can track churches they've visited ("passport stamps"), organize churches into shareable collections, and earn awards for their exploration. The passport is a social, shareable profile of a user's church journey.

## Concepts

| Concept        | Description                                                                   |
| -------------- | ----------------------------------------------------------------------------- |
| **Visit**      | A record that a user attended a church, with date, notes, and optional rating |
| **Collection** | A named, shareable list of churches (e.g., "Best Music", "Historic Churches") |
| **Passport**   | A user's public profile showing visits, stats, awards, and collections        |
| **Award**      | A badge earned by reaching milestones (visit count, diversity, etc.)          |

## Relationship to Saved Churches

- **Saved churches** = bookmarks / "want to visit" (existing feature, unchanged)
- **Visits** = "I've been here" with rich metadata (new)
- **Collections** = curated, named lists of churches (new, separate from saved)

---

## Data Models

### church_visits

| Column     | Type      | Constraints                | Notes                     |
| ---------- | --------- | -------------------------- | ------------------------- |
| id         | UUID      | PK, default gen            |                           |
| user_id    | UUID      | FK → users.id, NOT NULL    | ON DELETE CASCADE         |
| church_id  | UUID      | FK → churches.id, NOT NULL | ON DELETE CASCADE         |
| visited_at | DATE      | NOT NULL                   | Date the user visited     |
| notes      | TEXT      | NULLABLE                   | Personal notes (max 1000) |
| rating     | SMALLINT  | NULLABLE                   | Personal 1–5 rating       |
| created_at | TIMESTAMP | default now()              |                           |
| updated_at | TIMESTAMP | auto-update                |                           |

**Constraints:** UNIQUE(user_id, church_id, visited_at) — one visit per church per day.

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

### church_collection_items

| Column        | Type      | Constraints                          | Notes             |
| ------------- | --------- | ------------------------------------ | ----------------- |
| collection_id | UUID      | FK → church_collections.id, NOT NULL | ON DELETE CASCADE |
| church_id     | UUID      | FK → churches.id, NOT NULL           | ON DELETE CASCADE |
| notes         | TEXT      | NULLABLE                             | Max 500 chars     |
| added_at      | TIMESTAMP | default now()                        |                   |

**PK:** (collection_id, church_id)

### user_awards

| Column     | Type        | Constraints             | Notes             |
| ---------- | ----------- | ----------------------- | ----------------- |
| id         | UUID        | PK, default gen         |                   |
| user_id    | UUID        | FK → users.id, NOT NULL | ON DELETE CASCADE |
| award_type | VARCHAR(50) | NOT NULL                | Award identifier  |
| earned_at  | TIMESTAMP   | default now()           |                   |

**Constraints:** UNIQUE(user_id, award_type) — one of each award per user.

---

## Awards

| Award Type             | Trigger                            | Display Name          | Description                          |
| ---------------------- | ---------------------------------- | --------------------- | ------------------------------------ |
| FIRST_VISIT            | Log 1st visit                      | First Steps           | Logged your first church visit       |
| EXPLORER_5             | Visit 5 unique churches            | Explorer              | Visited 5 different churches         |
| DEVOTED_10             | Visit 10 unique churches           | Devoted               | Visited 10 different churches        |
| PILGRIM_25             | Visit 25 unique churches           | Pilgrim               | Visited 25 different churches        |
| DENOMINATION_DIVERSITY | Visit 3+ denomination families     | Open Doors            | Visited 3+ different denominations   |
| NEIGHBORHOOD_EXPLORER  | Visit churches in 3+ neighborhoods | Neighborhood Explorer | Visited churches in 3+ neighborhoods |
| REGULAR                | Visit same church 3+ times         | Regular               | Visited the same church 3+ times     |
| REVIEWER               | Write 1st review                   | Reviewer              | Wrote your first church review       |

Awards are checked and granted after each visit is logged.

---

## API Endpoints

### Visits

#### `POST /churches/:id/visits` _(authenticated)_

Log a visit to a church.

| Field     | Type   | Required | Notes                 |
| --------- | ------ | -------- | --------------------- |
| visitedAt | string | Yes      | ISO date (YYYY-MM-DD) |
| notes     | string | No       | Max 1000 chars        |
| rating    | number | No       | 1–5 integer           |

**Response:** `{ data: ChurchVisit, message, meta: { newAwards: Award[] } }`

#### `PATCH /visits/:id` _(visit owner)_

Update visit notes/rating.

#### `DELETE /visits/:id` _(visit owner)_

Remove a visit record.

#### `GET /users/:id/visits` _(public)_

List a user's visits with church info.

| Param    | Type   | Required | Notes                |
| -------- | ------ | -------- | -------------------- |
| page     | number | No       | Default: 1           |
| pageSize | number | No       | Default: 20, max: 50 |

### Collections

#### `POST /collections` _(authenticated)_

Create a new collection.

| Field       | Type    | Required | Notes         |
| ----------- | ------- | -------- | ------------- |
| name        | string  | Yes      | 1–100 chars   |
| description | string  | No       | Max 500 chars |
| isPublic    | boolean | No       | Default: true |

#### `GET /users/:id/collections` _(public for public collections, owner sees all)_

List a user's collections.

#### `GET /collections/:id` _(public if isPublic, owner always)_

Get collection with churches.

#### `PATCH /collections/:id` _(collection owner)_

Update collection name/description/visibility.

#### `DELETE /collections/:id` _(collection owner)_

Delete a collection.

#### `POST /collections/:id/churches/:churchId` _(collection owner)_

Add a church to a collection.

| Field | Type   | Required | Notes         |
| ----- | ------ | -------- | ------------- |
| notes | string | No       | Max 500 chars |

#### `DELETE /collections/:id/churches/:churchId` _(collection owner)_

Remove a church from a collection.

### Passport

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
      "collectionsCount": 3
    },
    "awards": [
      { "awardType": "FIRST_VISIT", "earnedAt": "..." }
    ],
    "recentVisits": [
      { "id", "churchId", "visitedAt", "rating", "church": { "name", "slug", "coverImageUrl" } }
    ]
  }
}
```

---

## Frontend Pages

### `/passport` (own passport, requires auth)

- Stats summary cards (total visits, unique churches, denominations, neighborhoods)
- Awards grid with earned/locked state
- Visit timeline (chronological list)
- Link to collections
- Share button → `/users/:id/passport`

### `/users/:id/passport` (public passport view)

- Same layout but read-only
- Only shows public collections

### `/collections/:id` (collection detail)

- Collection name, description, church count
- Grid of church cards
- Owner can add/remove churches, edit details

---

## Scope for v1

- Core visit CRUD + passport page + stats
- Collections CRUD + collection page
- Award checking on visit creation
- Public passport sharing
- No: photo uploads on visits, visit verification, social feed

---

_Created: 2026-04-13_
