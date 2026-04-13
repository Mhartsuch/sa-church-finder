# Church Events Discovery Pipeline

> Spec for automated discovery of real church events from church websites.

## Problem

Churches in the SA Church Finder database have websites, but events are only populated when church admins manually enter them. Most churches publish events on their websites — we should be able to discover and import these automatically.

## Solution

A CLI pipeline script (following the existing `google-import` pattern) that:

1. Queries churches with a non-null `website` field
2. Fetches each church's website and event/calendar pages
3. Uses Claude API to extract structured event data from HTML
4. Deduplicates against existing events via content hashing
5. Inserts new events as `pending` for admin review

## Schema Changes

### New Enums

```
EventSource:  MANUAL | WEBSITE_SCRAPE
EventStatus:  PUBLISHED | PENDING | REJECTED
```

### New Event Fields

| Field      | Type        | Default          | Notes                                   |
| ---------- | ----------- | ---------------- | --------------------------------------- |
| source     | EventSource | MANUAL           | How the event was created               |
| status     | EventStatus | PUBLISHED        | Pending events hidden from public feeds |
| sourceUrl  | TEXT        | nullable         | URL where event was discovered          |
| sourceHash | TEXT        | unique, nullable | SHA-256 hash for deduplication          |

Existing events get `source=MANUAL, status=PUBLISHED` — fully backward-compatible.

## Pipeline Design

### Modules

```
server/src/scripts/event-discovery/
  index.ts              CLI entry point (arg parsing, orchestration)
  website-fetcher.ts    Fetch HTML, find event pages, extract text
  event-extractor.ts    Claude API integration for structured extraction
  types.ts              Pipeline-specific types
```

### Flow

```
For each church with a website:
  1. Fetch homepage HTML
  2. Find event-related links (/events, /calendar, /upcoming, etc.)
  3. Fetch event page(s) HTML
  4. Strip non-content elements (scripts, styles, nav)
  5. Send cleaned HTML to Claude API
  6. Claude returns structured JSON array of events
  7. Hash each event (churchId + normalized title + date)
  8. Skip events whose hash already exists in DB
  9. Insert new events: source=WEBSITE_SCRAPE, status=PENDING
```

### Rate Limiting

- Website fetches: 1 request/second (polite crawling)
- Claude API: 2 requests/second (within standard limits)

### Event Service Changes

- Public feeds (`listEventsFeed`, `listChurchEventsBySlug`) filter to `status=PUBLISHED` only
- Admin surfaces pass `status` filter explicitly to see pending/rejected events

## CLI Usage

```
npm run discover:events [flags]

Flags:
  --dry-run         Extract events but don't write to DB
  --limit N         Process only first N churches
  --church SLUG     Process a single church by slug
```

## Environment Variables

| Variable          | Required | Notes                         |
| ----------------- | -------- | ----------------------------- |
| ANTHROPIC_API_KEY | Yes      | Claude API key for extraction |
| DATABASE_URL      | Yes      | Already configured            |

## Deduplication Strategy

Each discovered event gets a `sourceHash` = SHA-256 of:

- `churchId`
- `normalizedTitle` (lowercase, trimmed, collapsed whitespace)
- `startDate` (YYYY-MM-DD only, no time)

If the hash exists, the event is skipped. This prevents re-importing the same event on subsequent runs while allowing genuinely new events to be discovered.

## Done When

- [ ] Schema migration adds source/status/sourceUrl/sourceHash to events
- [ ] Pipeline discovers events from church websites via Claude API
- [ ] Discovered events are deduplicated and inserted as pending
- [ ] Public event feeds only show published events
- [ ] `npm run discover:events` works with --dry-run, --limit, --church
- [ ] Tests pass, lint passes, typecheck passes, build succeeds
