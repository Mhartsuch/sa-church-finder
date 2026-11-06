# Features

The site does a few things well: help someone in San Antonio find a church to visit.

## Browse (`/`)

- Airbnb-style grid of church cards: square swipeable photos, wishlist heart, name,
  neighborhood · denomination, rating (site reviews, falling back to Google), next service.
- Search pill in the header: keyword, service day, time of day.
- Category bar: one-tap presets (Sunday morning, Top rated, major denominations,
  En español, Great for kids, Accessible, Evening services).
- Filters modal: sort, denomination (multi), service day, service time, language,
  kids / accessible / groups, minimum rating, neighborhood, with a live "Show N churches" count.
- "Show map" toggles a split list + map view. Moving the map searches that area.
- All state lives in the URL, so every view can be shared.

## Church profile (`/churches/:slug`)

- Title row with rating, location, Share, and Save.
- Five-photo mosaic with a full "Show all photos" gallery.
- Highlights, about, service times by day, "What this church offers", reviews, and a location map.
- Sticky "Plan a visit" card (next service, directions, website, phone), plus a mobile bottom bar.
- JSON-LD `Church` structured data.

## Accounts

- Email/password and Google sign-in, email verification, password reset.
- Wishlists (`/wishlists`): every saved church.
- Account (`/account`): change name and password, see your reviews, delete your account.

## Reviews

- 1–5 stars plus text, one per member per church; edit or delete any time.
- Church `avgRating` / `reviewCount` stay in sync.

## Data

Churches are imported from Google Places and enriched from church websites by the
pipeline in `server/src/scripts` (see `docs/engineering/DATA_PIPELINE.md`).
