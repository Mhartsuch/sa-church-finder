# MVP Dataset Audit

## Scope

Seed-level snapshot of the current curated MVP dataset in `server/prisma/seed.ts` as of 2026-03-30.

This document now reflects the active gold-set strategy rather than the earlier broad shortlist audit.

## Snapshot

- Seeded churches in the active MVP set: 12
- Seeded cover images: 12
- Seeded church photo records: 12
- Seeded profile emails: 7
- Seeded review aggregates: 0
- Seeded written reviews: 0
- Seeded upcoming events: 0

## What Improved

### 1. The dataset is now visually credible

- Every active seeded church now has a real `coverImageUrl`
- The seed also creates one `church_photos` record per active church so the image exists as profile media, not just a hero field
- Church cards and church profile pages can now render real imagery instead of relying on abstract fallbacks

### 2. The active set is intentionally smaller and higher-confidence

- The broad 25-church shortlist has been replaced, for seeding purposes, by a 12-church gold set
- The active list now favors churches with strong official-source verification, strong geography/denomination anchors, and visually compelling profiles
- Ambiguous, weak, or lower-confidence records are no longer part of the active MVP seed

### 3. The seed is more honest

- The active gold set no longer depends on fake aggregate ratings
- No sample written reviews are seeded
- No sample events are seeded
- This keeps the demo from implying community activity the product has not actually earned yet

## Remaining Risks

### 1. Image rights and attribution still need a launch-grade solution

- The current MVP seed references real externally hosted cover images for demo quality
- Before any public launch beyond a controlled demo, the app should move to a clearer licensing, attribution, and hosting workflow

### 2. Legacy seed scaffolding still exists in `server/prisma/seed.ts`

- The old wider shortlist remains in the file as inactive reference data because of patch-size constraints during the pivot
- The active seed path now points only at the curated 12-church gold set, but a future cleanup pass should delete the dormant legacy list outright

## Recommended Next Step

1. Finish the live backend redeploy and smoke test so the polished gold-set profiles can be checked on the deployed product.
2. If we stay in repo work, add a source-credit pattern for profile images before expanding the dataset again.

## Related Files

- `docs/product/data/MVP_PROFILE_CURATION.md`
- `server/prisma/seed.ts`
- `server/prisma/curated-seed-churches.ts`
- `docs/process/TODO.md`
