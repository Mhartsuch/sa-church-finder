# AI_CONTEXT (Legacy)

> **DEPRECATED:** This file is retained for historical reference only.
> New agent sessions should use `AGENTS.md` (shared repo brain) and `CLAUDE.md` (Claude-specific).

## AGENT_RULES (legacy)

- Read AGENTS.md instead of this file.
- Ignore markdown sprawl unless the current task explicitly needs it.
- Default to source/config over docs.
- Ignore `.github`, `.husky`, `docs`, `node_modules`, and `server/dist` first.

## Stack And Framework

- Repo shape: single repo with `client/` and `server/`.
- Client: React 18, TypeScript, Vite, React Router 6, TanStack Query, Zustand, Tailwind CSS.
- Server: Express 4, TypeScript, Prisma 5, PostgreSQL with PostGIS, express-session, Passport local + Google OAuth, Zod.
- Observability/logging: Sentry packages present, Pino + `pino-http`.

## Dev Build Test Commands

- Root dev: `npm run dev`
- Root build: `npm run build`
- Root test: `npm run test`
- Client only: `cd client && npm run dev|build|test|typecheck|lint`
- Server only: `cd server && npm run dev|build|test|typecheck|lint`
- DB helpers: `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`, `npm run db:refresh-curated-data`

## Route Map

### Client routes

- `/` -> `HomePage`
- `/search` -> `SearchPage`
- `/churches/:slug` -> `ChurchProfilePage`
- `/login` -> `LoginPage`
- `/register` -> `RegisterPage`
- `/forgot-password` -> `ForgotPasswordPage`
- `/reset-password` -> `ResetPasswordPage` (expects `?token=...`)
- `/verify-email` -> `VerifyEmailPage` (expects `?token=...`)
- `/account` -> `AccountPage` behind `RequireAuth`
- No client catch-all route is defined in `client/src/App.tsx`.

### API surface

- `GET /api/v1/health`
- `GET /api/v1/churches`
- `GET /api/v1/churches/:slug`
- `GET /api/v1/churches/:slug/events`
- `POST /api/v1/churches/:id/save`
- `POST /api/v1/churches/:id/claim`
- `GET /api/v1/churches/:churchId/reviews`
- `POST /api/v1/churches/:churchId/reviews`
- `PATCH /api/v1/reviews/:id`
- `DELETE /api/v1/reviews/:id`
- `POST /api/v1/reviews/:id/helpful`
- `DELETE /api/v1/reviews/:id/helpful`
- `POST /api/v1/reviews/:id/flag`
- `GET /api/v1/auth/google`
- `GET /api/v1/auth/google/callback`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/verify-email/resend`
- `GET /api/v1/users/:id/saved`
- `GET /api/v1/users/:id/claims`
- `GET /api/v1/users/:id/reviews`
- Admin APIs live under `/api/v1/admin/claims` and `/api/v1/admin/flagged-reviews`.

## Data Model Summary

- Enums:
  - `Role`: `USER`, `CHURCH_ADMIN`, `SITE_ADMIN`
  - `ClaimStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `User`: email/password or Google auth, role, email verification, avatar, review/save/claim/event relationships.
- `Church`: listing core fields, slug, geo (`latitude`, `longitude`, PostGIS `location`), contact info, languages, amenities, claim state, cover image, rating aggregates.
- `ChurchService`: service schedule rows per church.
- `ChurchPhoto`: gallery assets with uploader and display order.
- `Event`: church events with recurrence support.
- `Review`: one review per `(userId, churchId)`, rating plus optional subratings and moderation flags.
- `ReviewVote`: helpful-vote join table.
- `ChurchClaim`: church ownership/admin claim workflow with reviewer and status.
- `PasswordResetToken` and `EmailVerificationToken`: token tables with expiry and used timestamps.
- `UserSavedChurch`: saved-church join table.

## Important Env Vars

- `DATABASE_URL`: required for Prisma and server-backed sessions outside test mode.
- `CLIENT_URL`: allowed browser origins for CORS; `server/src/lib/session.ts` supports comma-separated values or `*`.
- `SESSION_SECRET`: session signing secret.
- `SESSION_COOKIE_SAME_SITE`: explicit cookie same-site override; defaults to `lax` in dev and `none` in production.
- `NODE_ENV`: changes trust proxy, cookie security, and session behavior.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`: Google OAuth.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: email delivery.
- `PASSWORD_RESET_TOKEN_TTL_MINUTES`, `EMAIL_VERIFICATION_TOKEN_TTL_MINUTES`: auth token lifetimes.
- `AUTH_EXPOSE_RESET_PREVIEW`, `AUTH_EXPOSE_VERIFICATION_PREVIEW`: dev-preview links for auth email flows.
- `VITE_API_URL`: client-side override if the frontend is not using the Vite `/api -> http://localhost:3001` dev proxy.
- `LOG_LEVEL`: server logging level.

## Known Broken Or Incomplete User-Facing Flows

- Unknown client URLs have no dedicated 404 route; the router only defines the paths listed above.
- Church claim approval does not yet unlock listing editing or event-management UI. `ChurchProfilePage` explicitly says those tools are a future Milestone 3 slice.

## Ignore First

- `docs/`
- `.github/`
- `.husky/`
- `node_modules/`
- `server/dist/`
- `scripts/` unless the task is about seed/refresh automation
- Most root markdown files after this one
