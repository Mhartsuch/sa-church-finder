# Discover Church Events

Discover real upcoming events from church websites and save them to the database.

## Arguments

$ARGUMENTS

If no arguments provided, process up to 5 churches. Accepted arguments:

- `--limit N` — process N churches (default: 5)
- `--church SLUG` — process a single church by its slug
- `--dry-run` — extract events but don't save to DB

## Step 1: Fetch website content

Run the fetch-content script from the **server/** directory:

```
cd server && npx tsx src/scripts/event-discovery/fetch-content.ts [arguments from above]
```

This outputs a JSON array of `{ church: { id, name, slug }, content, sourceUrl }` objects — one per church whose website was successfully fetched. Read the output carefully.

If the script outputs an empty array or errors, report what happened and stop.

## Step 2: Extract events from each church's content

For **each** church in the output, read the `content` field and extract all upcoming events, activities, classes, and gatherings you can find. Focus on specific scheduled events — not vague descriptions of ministries.

For each event, determine:

- **title**: The event name
- **description**: A brief description (1-2 sentences), or null
- **eventType**: One of: `service`, `community`, `volunteer`, `study`, `youth`, `other`
  - `service` = worship services, masses, Sunday services
  - `community` = social gatherings, potlucks, concerts, festivals
  - `volunteer` = service projects, mission trips, outreach
  - `study` = Bible studies, small groups, classes, workshops
  - `youth` = youth group, VBS, children's programs, teen events
  - `other` = anything else
- **startDate**: `YYYY-MM-DD` format. Use the current year if not specified
- **startTime**: `HH:MM` 24-hour format, or null if not specified
- **endTime**: `HH:MM` 24-hour format, or null
- **location**: Only if different from the church address, otherwise null
- **isRecurring**: true if it repeats on a schedule

**Rules:**

- Only extract events with reasonably specific dates or schedules
- Skip vague references like "we meet regularly" without details
- Skip events that have clearly already passed
- If you find zero events for a church, that's fine — skip it
- Do NOT invent events — only extract what's actually in the content

## Step 3: Save events to database

For each church that had events, write a JSON file and run the save script:

```
cat > /tmp/discovered-events.json << 'EVENTS_EOF'
[
  {
    "churchId": "<church id from step 1>",
    "title": "Event Title",
    "description": "Brief description",
    "eventType": "community",
    "startDate": "2026-05-15",
    "startTime": "18:00",
    "endTime": "20:00",
    "location": null,
    "isRecurring": false,
    "sourceUrl": "<sourceUrl from step 1>"
  }
]
EVENTS_EOF
cd server && npx tsx src/scripts/event-discovery/save-events.ts /tmp/discovered-events.json [--dry-run if specified]
```

The save script handles deduplication (same title + date + church won't be inserted twice) and sets `source=WEBSITE_SCRAPE`, `status=PENDING` so events require admin approval.

## Step 4: Report results

Summarize what you found:

- How many churches were processed
- How many events were discovered per church
- How many were saved vs deduplicated
- Any churches that had no events or couldn't be fetched
