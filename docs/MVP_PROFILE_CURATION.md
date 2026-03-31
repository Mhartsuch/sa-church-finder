# MVP Church Profile Curation

## Goal

Build a small, premium-quality MVP dataset for demo use.

Target:

- 12 real San Antonio church profiles
- Every profile should feel intentionally chosen, source-backed, and visually strong
- Every included church should have at least one real cover image

Current state:

- The active seed now uses 12 curated church records
- Every seeded church profile includes a real `coverImageUrl`
- The seed no longer relies on synthetic review aggregates, written reviews, or upcoming events to make the dataset feel fuller than it is
- See `docs/MVP_DATASET_AUDIT.md` for the current gold-set snapshot and remaining follow-ups

## Profile Quality Bar

Each gold-set profile should meet all of these standards:

- The church is clearly real and currently active in San Antonio
- The name matches the church's public-facing identity closely enough for demo trust
- Website, address, phone, and service details come from official public sources
- Description is polished, neutral, and specific
- Neighborhood and denomination feel consistent and useful in search
- Amenities and languages are helpful, not padded
- The profile has a real cover photo that makes the page feel intentional
- We avoid synthetic social proof until the app earns real user activity

## Active Gold Set

| Church                                               | Status | Notes                                                                                        |
| ---------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| San Fernando Cathedral                               | ready  | Downtown cathedral anchor with full bilingual weekend Mass rhythm and real cover image       |
| First Baptist Church of San Antonio                  | ready  | Verified plan-a-visit schedule with multiple Sunday worship expressions and real cover image |
| Travis Park United Methodist Church                  | ready  | Official 9:45 a.m. downtown worship and strong inclusive identity                            |
| Mission Concepcion                                   | ready  | Verified Sunday Mass times from official site; image and copy now feel demo-ready            |
| First Presbyterian Church of San Antonio             | ready  | Downtown Presbyterian anchor with verified 9:30 and 11:00 worship options                    |
| Episcopal Church of the Holy Spirit                  | ready  | Verified Sunday and Wednesday Eucharist schedule with polished imagery                       |
| Mission San Jose Catholic Church                     | ready  | Historic South Side mission parish with verified bilingual weekend Masses                    |
| Basilica of the National Shrine of the Little Flower | ready  | West Side basilica with verified bilingual Mass schedule and strong exterior image           |
| St. Mark's Episcopal Church                          | ready  | Downtown Episcopal profile with current Sunday schedule and polished hero image              |
| Our Lady of the Atonement Catholic Church            | ready  | Ordinariate parish with distinctive liturgy profile and verified current Mass times          |
| St. Joseph Catholic Church                           | ready  | Downtown landmark church with current Mass times and strong hero photography                 |
| St. Anthony Mary Claret Catholic Church              | ready  | Large Far West Side parish with full Sunday schedule, livestreams, and real cover image      |

## Explicitly Out Of The Gold Set

- Ambiguous or low-confidence records such as Friendship West Baptist Church, Lakewood Church San Antonio, and similarly generic listings are no longer part of the active MVP seed
- Thin or visually weak profiles like First Chinese Baptist Church of San Antonio were removed from the active seed so the demo optimizes for trust and quality over breadth

## Remaining Follow-Ups

- Add a true attribution/licensing workflow before any public launch that depends on third-party hosted images
- Revisit whether the app should surface photo-source credit in the UI
- Expand beyond 12 only after a new church can meet the same gold-set standard
