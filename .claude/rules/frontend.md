---
description: Rules for client/ frontend code
globs: client/**
---

- Functional components with hooks only — no class components
- Named exports preferred (page components use default; `AuthPages.tsx` groups the small auth pages as named exports)
- Use TanStack Query for all server state; browse filters live in the URL (`useFilters`); local UI state uses React state
- Tailwind for styling — no CSS modules or styled-components
- Mapbox GL JS is loaded from CDN at runtime, not bundled
- Test with Vitest; component tests use React Testing Library
- API client functions go in `src/api/`, one file per resource
- Custom hooks go in `src/hooks/`, one per concern
- Types go in `src/types/`, not co-located with components
