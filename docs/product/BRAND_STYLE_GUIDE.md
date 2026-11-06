# Brand & Style Guide

The interface follows the classic Airbnb website: photography first, quiet chrome,
generous whitespace, and one accent color.

## Principles

1. **Photos sell the visit.** Cards are square photos with rounded corners; profiles open
   with a full-width mosaic. Never crop photos into small thumbnails when a large one fits.
2. **Filters stay out of the way.** The category bar is the fast path; the Filters modal
   holds everything else. Active filters are always reflected in the URL.
3. **Plain, warm copy.** "Plan a visit", "Everyone is welcome", "Great for kids".

## Color

| Token            | Value               | Use                             |
| ---------------- | ------------------- | ------------------------------- |
| `brand`          | `#FF385C`           | Search button, hearts, pins     |
| `brand-gradient` | `#E61E4D → #D70466` | Primary CTAs (directions, auth) |
| `gray-900`       | Tailwind gray-900   | Text, secondary buttons, chips  |
| `gray-500`       | Tailwind gray-500   | Supporting text                 |
| `gray-200/300`   | Tailwind            | Borders and dividers            |

## Type

Inter, 400–800. Page titles 26–32px semibold; section titles 22px semibold; body 15–16px.

## Components

- **Buttons:** primary = brand gradient, white text, `rounded-lg`; secondary = `gray-900`
  fill or a 1px `gray-900` outline. Text links are underlined and semibold.
- **Chips:** `rounded-full`, 1px gray-300 border; selected = gray-900 fill.
- **Cards:** `rounded-xl`, no border or shadow; the photo carries the card.
- **Modals:** centered sheet (`rounded-2xl`), title bar with a left close button, footer
  with "Clear all" on the left and the primary action on the right.
- **Icons:** lucide-react, 1.5 stroke for category icons.
