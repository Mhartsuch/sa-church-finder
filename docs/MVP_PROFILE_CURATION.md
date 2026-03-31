# MVP Church Profile Curation

## Goal

Build a polished, trustworthy MVP church dataset for demo use.

Target:

- Minimum: 25 real San Antonio church profiles
- Preferred: 25-50 real San Antonio church profiles
- Quality bar: every included profile should feel intentional, accurate, and presentation-ready

Current starting point:

- The seed currently contains 22 church records
- The seed also contains non-church records for `Test User` and `Site Admin`; those are not part of this queue
- We need at least 3 additional churches to hit the minimum 25-profile target

## Profile Quality Bar

Each MVP church profile should meet all of these standards before we call it demo-ready:

- Exact church name matches the official public-facing name
- Website points to the official church site
- Address, zip code, and neighborhood are correct
- Denomination and denomination family are reasonable and consistent
- Description is neutral, polished, and specific rather than generic filler copy
- Main service times are current enough to be believable for a demo
- Languages are explicit when applicable
- Amenities are useful, consistent, and not padded with weak filler
- Pastor name and year established are included only when verified
- Cover image strategy is defined so the profile does not feel empty or broken
- Notes include where the profile still needs verification or enrichment

## Curation Workflow

1. Verify the current seeded 22 churches and raise each one to the MVP quality bar.
2. Add at least 3 more real San Antonio churches to reach the 25-profile minimum.
3. Expand toward 50 only after the first 25 feel consistently strong.
4. Do not keep weak profiles just to hit the count target.

## Status Labels

- `needs-audit`: seeded, but not yet reviewed against the MVP quality bar
- `needs-verification`: likely real, but core facts still need source verification
- `needs-enrichment`: verified but still thin, generic, or visually weak
- `ready`: strong enough to show in the MVP demo

## Current Seed Queue

| Church                                | Status      | Notes                                                                        |
| ------------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| Cathedral of Saint Ferdinand          | needs-audit | Historic downtown flagship profile; likely strong demo candidate             |
| First Baptist Church of San Antonio   | needs-audit | Should verify branding, website, and service schedule                        |
| Covenant Church San Antonio           | needs-audit | Good north-side candidate; verify current name and service times             |
| Cornerstone Church                    | needs-audit | Large recognizable profile; verify official branding and pastor info         |
| Travis Park United Methodist Church   | needs-audit | Strong downtown/inclusive profile candidate                                  |
| New Life Church                       | needs-audit | Verify official site, service language mix, and branding specificity         |
| Alamo Heights Baptist Church          | needs-audit | Likely good neighborhood balance candidate                                   |
| Grace Church San Antonio              | needs-audit | Verify official capitalization/branding and contact details                  |
| Holy Spirit Episcopal Church          | needs-audit | Good Anglican/Episcopal coverage candidate                                   |
| Southside Baptist Church              | needs-audit | Verify current website and profile depth                                     |
| Mission Concepcion                    | needs-audit | Verify naming convention and how to represent it in church-search UX         |
| Dominion Church                       | needs-audit | Verify whether branding should stay this generic or use fuller official name |
| Lakewood Church San Antonio           | needs-audit | Verify official identity and whether this is the best representative listing |
| Broadway Baptist Church               | needs-audit | Strong central-city candidate if data quality is high                        |
| San Antonio Korean Church             | needs-audit | Important multilingual/community representation candidate                    |
| Friendship West Baptist Church        | needs-audit | Verify exact church identity and San Antonio fit                             |
| Bethel Lutheran Church                | needs-audit | Good denominational diversity candidate                                      |
| Victory Church                        | needs-audit | Verify official branding and whether profile stands out enough for MVP       |
| San Antonio Chinese Baptist Church    | needs-audit | Important multilingual/community representation candidate                    |
| Pentecostal Church of God in Christ   | needs-audit | Verify exact official name and whether a fuller branded name exists          |
| St. Mary's University Catholic Center | needs-audit | Good campus/Catholic representation candidate                                |
| Christ's Church of the Valley         | needs-audit | Strong non-denominational/family-ministry candidate                          |

## Immediate Next Steps

- Audit the live product manually so we know whether any current flows fail outside automated tests
- Verify the 22 seeded churches against official public sources
- Add at least 3 new San Antonio churches with strong coverage across geography and denomination
- Decide on the MVP image approach for profiles that do not yet have trustworthy visuals
