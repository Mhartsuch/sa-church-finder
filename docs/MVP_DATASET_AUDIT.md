# MVP Dataset Audit

## Scope

Seed-only review of the current `server/prisma/seed.ts` church dataset on 2026-03-30.

This audit is intentionally limited to what is already in the repo. It does not verify facts against live church websites yet. The goal is to surface the rough edges that are already obvious before the deeper source-verification pass starts.

## Snapshot

- Seeded churches: 22
- Additional churches still needed to hit the 25-profile minimum: 3
- Seeded cover images: 0
- Seeded profile emails: 2
- Seeded pastor names: 5
- Seeded claimed profiles: 6
- Profiles with explicit languages: 21

## Repo-Based Findings

### 1. The dataset is visually thin right now

- No `coverImageUrl` values are seeded, and no church photo records are created in the seed.
- Every current church profile therefore depends on fallback visuals instead of real church imagery.
- This is acceptable for local development, but it weakens the trust level of the public MVP demo if we do not add a clear photo strategy during curation.

### 2. Contact depth is uneven

- Every seeded church has a website and phone number in the seed.
- Only 2 of 22 profiles include an email address.
- Most profiles therefore lean on website clicks instead of giving a direct contact path.

### 3. Copy and service labeling are inconsistent

- Several descriptions are strong and specific, but many still read like thin seed copy.
- Some service labels are polished (`Sunday Mass`, `Traditional Service`, `Holy Eucharist`), while others stay generic (`Service`, `Worship`, `Midweek Service`).
- Amenity naming also varies in tone and precision (`Parking`, `Large Parking`, `Ample Parking`, `Community Center`, `Youth Center`).

### 4. A few records look risky even before web verification

- `Friendship West Baptist Church` uses ZIP `78702`, which is not a San Antonio ZIP and should be treated as a likely bad record until verified.
- Several names are generic enough that the exact public-facing brand should be confirmed before demo use: `Dominion Church`, `Victory Church`, `New Life Church`, and `Pentecostal Church of God in Christ`.
- `Lakewood Church San Antonio` should be verified carefully so we do not present a confusing or inaccurate local identity in the MVP.

## Suggested Cleanup Order

### Start With These High-Confidence Anchor Profiles

- Cathedral of Saint Ferdinand
- Travis Park United Methodist Church
- Holy Spirit Episcopal Church
- Mission Concepcion
- First Baptist Church of San Antonio
- Broadway Baptist Church
- Bethel Lutheran Church
- St. Mary's University Catholic Center

These already read like strong demo anchors because they provide distinct geography, denomination coverage, and less generic positioning in the current seed.

### Verify These Before They Make The MVP Shortlist

- Covenant Church San Antonio
- Cornerstone Church
- New Life Church
- Grace Church San Antonio
- Dominion Church
- Lakewood Church San Antonio
- Victory Church
- Pentecostal Church of God in Christ

These are not necessarily bad records, but the seed alone suggests branding, copy specificity, or official-name accuracy should be confirmed before they are treated as polished MVP entries.

### Treat These As Highest-Risk Data Checks

- Friendship West Baptist Church
  Reason: the current seed ZIP is `78702`, which strongly suggests a location mismatch.
- San Antonio Korean Church
  Reason: multilingual representation is valuable, so this should be kept only if the official identity, website, and service structure verify cleanly.
- San Antonio Chinese Baptist Church
  Reason: same multilingual-representation value, but we should confirm the exact current brand and service language mix from source.
- Southside Baptist Church
  Reason: useful geography coverage, but the seed copy and service labels are still thin.

## Immediate Follow-Through

1. Verify the highest-confidence anchor profiles against official public sources first.
2. Replace or fix any records that fail basic address, ZIP, website, or official-name verification.
3. Standardize service labels and amenity vocabulary while refining the kept profiles.
4. Add at least 3 additional real San Antonio churches only after the current 22 are triaged.
5. Decide whether the MVP photo strategy is:
   - real curated cover images,
   - verified website-driven photo sourcing,
   - or intentional no-photo placeholders for launch.

## Related Files

- `docs/MVP_PROFILE_CURATION.md`
- `server/prisma/seed.ts`
- `TODO.md`
