# Coding Conventions

> Rules that every agent session must follow when writing code in this project. Consistency across sessions is critical for long-term maintainability.

## Language & Framework

- TypeScript (strict mode) for all code — frontend and backend
- React 18 with functional components and hooks
- Express 4 for the REST API
- Prisma as the sole database access layer

## File Organization

```
client/
├── src/
│   ├── api/              ← API client functions (one file per resource)
│   ├── components/       ← Reusable UI components
│   │   ├── ui/           ← shadcn/ui primitives
│   │   ├── church/       ← Church-specific components
│   │   ├── map/          ← Map-related components
│   │   ├── review/       ← Review components
│   │   └── layout/       ← Header, Footer, Sidebar, etc.
│   ├── hooks/            ← Custom React hooks
│   ├── pages/            ← Route-level page components
│   ├── stores/           ← Zustand stores
│   ├── types/            ← Shared TypeScript types/interfaces
│   ├── utils/            ← Pure utility functions
│   └── constants/        ← App-wide constants
server/
├── src/
│   ├── routes/           ← Express route handlers (one file per resource)
│   ├── middleware/        ← Auth, validation, rate limiting, error handling
│   ├── services/         ← Business logic layer (one file per domain)
│   ├── utils/            ← Server utilities
│   └── types/            ← Server-specific types
├── prisma/
│   ├── schema.prisma     ← Database schema (single source of truth)
│   ├── migrations/       ← Auto-generated migrations
│   └── seed.ts           ← Database seeding script
```

## Naming Conventions

| Thing                 | Convention             | Example                            |
| --------------------- | ---------------------- | ---------------------------------- |
| Files (components)    | PascalCase             | `ChurchCard.tsx`                   |
| Files (non-component) | kebab-case             | `church-service.ts`                |
| Functions             | camelCase              | `getChurchById()`                  |
| Variables             | camelCase              | `currentFilters`                   |
| Constants             | UPPER_SNAKE_CASE       | `MAX_SEARCH_RADIUS`                |
| React components      | PascalCase             | `ChurchCard`                       |
| Types/Interfaces      | PascalCase with prefix | `IChurchFilters`, `TSearchParams`  |
| Database tables       | snake_case plural      | `church_services`                  |
| Database columns      | snake_case             | `created_at`                       |
| API endpoints         | kebab-case plural      | `/api/v1/churches`                 |
| Branches              | type/kebab-description | `feature/church-search`            |
| Commits               | Conventional Commits   | `feat: add church search endpoint` |
| Environment vars      | UPPER_SNAKE_CASE       | `DATABASE_URL`                     |

## Code Style

- Prettier for formatting (printWidth: 100, singleQuote: true, trailingComma: all)
- ESLint with TypeScript strict rules
- 2-space indentation
- No semicolons (Prettier default)
- Prefer `const` over `let`, never use `var`
- Prefer arrow functions for callbacks and inline functions
- Use template literals over string concatenation
- Destructure props and objects

## Error Handling

- Frontend: React Error Boundaries for component crashes; toast notifications for API errors
- Backend: Centralized error-handling middleware; all routes wrapped in async try/catch
- Custom error classes: `AppError`, `NotFoundError`, `ValidationError`, `AuthError`
- API errors follow format: `{ error: { code: string, message: string, details?: object } }`
- Never expose stack traces or internal details in production error responses

## Logging

- Use `pino` logger (structured JSON in production, pretty-print in development)
- Log levels: error, warn, info, debug
- Always log: request ID, user ID (if authenticated), endpoint, response status
- Never log: passwords, tokens, full request bodies with sensitive data

## Comments

- Use JSDoc for public functions and complex types
- Inline comments only for non-obvious logic (explain WHY, not WHAT)
- TODO comments require a ticket/issue reference: `// TODO(#42): implement pagination`
- No commented-out code — use git history instead

## Git Workflow

- Branch from `main` for all work
- Branch naming: `feature/`, `fix/`, `refactor/`, `docs/`, `test/`
- Squash merge to `main` via PR
- Commit messages: Conventional Commits format
- No direct pushes to `main`

## Dependencies

- Check existing packages before adding new ones
- Prefer well-maintained packages with TypeScript support
- Document any new dependency in the PR description with rationale
- Pin major versions in package.json

---

_Last updated: 2026-03-26_
