# Progress Log

> Append-only log of work done on this project. Each session adds an entry at the top. This is the project's memory.

## How to Use This File

- Add a new entry at the TOP of the log (newest first) after each work session
- Be specific about what was done, not just what was attempted
- Note anything that was started but not finished
- Link to files that were created or significantly changed

---

## Log

### 2026-03-30 - MVP Dataset Audit And Church Profile Empty-Media Polish

**Focus:** Tightened MVP demo readiness by removing the fake photo-gallery feel from church profiles and turning the current seed review into a concrete data-cleanup handoff.

**Completed:**

- **Church profile hero polish:** Replaced the old fake gallery placeholders and dead "Show all photos" chrome on church profile pages with a real visit-summary hero plus supporting cards for location, weekly rhythm, language/access details, and visit-planning links.
- **Focused client coverage:** Added a dedicated `ChurchProfileHero` component test to lock in the no-cover-image fallback behavior and normalized website/directions CTA links.
- **Seed dataset audit:** Reviewed the current `server/prisma/seed.ts` dataset and documented repo-visible MVP issues in `docs/MVP_DATASET_AUDIT.md`, including zero seeded cover images, sparse profile emails, inconsistent service labeling, and the likely bad Friendship West ZIP.
- **Project memory updates:** Marked the seeded/live dataset review task complete, linked the new audit doc from the curation tracker and agent briefing, and recorded the new empty-media profile polish in the task board.

**Remaining Notes:**

- The next data pass should verify the highest-confidence anchor churches against official public sources before editing seed facts.
- The MVP still needs at least 3 additional real San Antonio churches after the current 22 are triaged.
- Live smoke testing and public-domain readiness remain open P1 workstreams.

**Verification:**

- Ran `npm.cmd run test -- src/components/church/ChurchProfileHero.test.tsx` successfully in `client/`.
- Ran `npm.cmd run lint:client` successfully at the repo root.
- Ran `npm.cmd run typecheck:client` successfully at the repo root.

**Files Changed:**

- `client/src/components/church/ChurchProfileHero.tsx`
- `client/src/components/church/ChurchProfileHero.test.tsx`
- `client/src/pages/ChurchProfilePage.tsx`
- `docs/MVP_DATASET_AUDIT.md`
- `docs/MVP_PROFILE_CURATION.md`
- `AGENT_BRIEFING.md`
- `PROGRESS.md`
- `TODO.md`

### 2026-03-30 - Temporary MVP Demo Readiness Track

**Focus:** Shifted the project temporarily from the next milestone slices to MVP demo readiness so the current app can be shown confidently with reliable functionality, stronger church data, and a cleaner launch path.

**Completed:**

- **Baseline audit:** Verified the current root quality gates all pass for the existing codebase: `lint`, `typecheck`, `test`, and `build`.
- **Roadmap reprioritization:** Updated the task board, project context, agent briefing, and decision log so future sessions prioritize demo readiness over immediately continuing church-claim and admin-tooling work.
- **Data-work discovery:** Re-checked the seed shape and confirmed the current seed still only covers 22 churches, which reinforces the need for a curated 25-50 church MVP shortlist before the next demo push.
- **Curation tracker:** Added `docs/MVP_PROFILE_CURATION.md` with the MVP quality bar, seeded church queue, and immediate next steps for profile verification and expansion.

**Remaining Notes:**

- The next concrete MVP workstreams are live smoke testing, polishing the church dataset, and preparing the public domain/callback wiring.
- Milestone 3 claim/admin/event-discovery work is intentionally deferred for now, not canceled.

**Verification:**

- Ran `npm.cmd run lint` successfully at the repo root.
- Ran `npm.cmd run typecheck` successfully at the repo root.
- Ran `npm.cmd run test` successfully at the repo root after rerunning outside the Windows sandbox because Vitest/Vite config loading hit `spawn EPERM`.
- Ran `npm.cmd run build` successfully at the repo root after rerunning outside the Windows sandbox because Vite/esbuild process spawning was blocked in the sandbox.

**Files Changed:**

- `AGENT_BRIEFING.md`
- `DECISIONS.md`
- `PROJECT_CONTEXT.md`
- `PROGRESS.md`
- `TODO.md`
- `docs/MVP_PROFILE_CURATION.md`

### 2026-03-30 - Milestone 3 Church Events Foundation

**Focus:** Moved the roadmap into Milestone 3 by making church profiles feel alive with real upcoming event data instead of static listing information alone.

**Completed:**

- **Backend events API:** Added a public `GET /api/v1/churches/:slug/events` endpoint with validation plus server-side filtering for event type and date windows so church-profile pages can request only the upcoming slices they need.
- **Frontend events experience:** Added a dedicated client events API/hook layer and a new church-profile events section with event-type and date-range filters, an "upcoming this week" snapshot, a "next gathering" summary, and detailed event cards showing date, time, location, and recurring badges.
- **Seed/data follow-through:** Extended the Prisma seed to generate upcoming sample events across the seeded churches and also cleared `emailVerificationToken` rows during reseeds so the fixture reset stays aligned with the live auth schema.
- **Roadmap handoff:** Promoted the roadmap state into Milestone 3 in the task board, project context, decision log, and agent briefing, and recorded the user confirmation that live SMTP credentials are already configured.

**Remaining Notes:**

- Church events are currently read-only in the product; church claim requests and admin event management are still the next major Milestone 3 follow-ups.
- Recurring-event metadata is stored and surfaced, but the app does not yet expand RRULEs into generated future occurrences.
- Google OAuth and optional Sentry still depend on environment-specific live credentials where they should be active.

**Verification:**

- Ran `npm.cmd run lint:server` successfully at the repo root.
- Ran `npm.cmd run lint:client` successfully at the repo root.
- Ran `npm.cmd run typecheck:server` successfully at the repo root.
- Ran `npm.cmd run typecheck:client` successfully at the repo root.
- Ran `npm.cmd test -- --runInBand src/routes/church.routes.test.ts` successfully in `server/`.
- Ran `npm.cmd test -- src/api/events.test.ts` successfully in `client/` after rerunning outside the Windows sandbox because sandboxed Vitest config loading hit `spawn EPERM`.
- Ran `npm.cmd run build:server` successfully at the repo root.
- Ran `npm.cmd run build:client` successfully at the repo root after rerunning outside the Windows sandbox because Vite/esbuild process spawning was blocked in the sandbox.

**Files Changed:**

- `server/src/routes/church.routes.ts`
- `server/src/routes/church.routes.test.ts`
- `server/src/schemas/church.schema.ts`
- `server/src/services/event.service.ts`
- `server/src/types/event.types.ts`
- `server/prisma/seed.ts`
- `client/src/api/events.test.ts`
- `client/src/api/events.ts`
- `client/src/hooks/useEvents.ts`
- `client/src/pages/ChurchProfilePage.tsx`
- `client/src/types/event.ts`
- `AGENT_BRIEFING.md`
- `DECISIONS.md`
- `PROJECT_CONTEXT.md`
- `PROGRESS.md`
- `TODO.md`

### 2026-03-30 - Integration Readiness Health Signals

**Focus:** Made the remaining live-environment setup work easier to verify by surfacing backend integration readiness directly in the app instead of relying on guesswork or send-time failures.

**Completed:**

- **SMTP validation hardening:** Tightened the backend email config parser so partial SMTP auth values no longer count as "configured"; a missing `SMTP_PASS` or `SMTP_USER` now correctly reports a partial setup instead of silently falling back to unauthenticated delivery.
- **Health endpoint readiness summary:** Extended `GET /api/v1/health` with safe integration readiness details for SMTP email delivery, Google OAuth, and server-side Sentry using `configured` / `partial` / `disabled` states without exposing any secret values.
- **Production startup guidance:** Added backend startup warnings for production environments when SMTP, Google OAuth, or Sentry are missing or only partially configured so Render logs point directly at setup gaps.
- **Coverage + docs:** Added focused server tests for SMTP readiness edge cases, integration-status helpers, and the health endpoint response, then updated Quick Start, the agent briefing, and the task board to document the new deployment-check workflow.

**Remaining Notes:**

- Real SMTP credentials still need to be entered in each live environment before password reset and email verification will send outside local development.
- Google OAuth and Sentry still depend on environment-specific live credentials as well, but the backend now reports their readiness state clearly.

**Verification:**

- Ran `npm.cmd run lint:server` successfully at the repo root.
- Ran `npm.cmd run typecheck:server` successfully at the repo root.
- Ran `npm.cmd run test:server` successfully at the repo root after rerunning outside the Windows sandbox because sandboxed Jest worker startup hit `spawn EPERM`.
- Ran `npm.cmd run lint` successfully at the repo root.
- Ran `npm.cmd run typecheck` successfully at the repo root.
- Ran `npm.cmd run test` successfully at the repo root after rerunning outside the Windows sandbox because the client/server test runners need process spawning that the sandbox blocked.

**Files Changed:**

- `server/src/app.ts`
- `server/src/app.test.ts`
- `server/src/index.ts`
- `server/src/lib/email.test.ts`
- `server/src/lib/email.ts`
- `server/src/lib/integration-status.test.ts`
- `server/src/lib/integration-status.ts`
- `server/src/services/auth.service.ts`
- `AGENT_BRIEFING.md`
- `PROGRESS.md`
- `QUICKSTART.md`
- `TODO.md`

### 2026-03-30 - Sentry Error Monitoring Foundation

**Focus:** Landed the remaining low-priority operational follow-up by wiring optional Sentry monitoring into both the frontend and backend without disturbing the current auth/search/review flows.

**Completed:**

- **Browser monitoring foundation:** Added `@sentry/react`, a first-import client instrumentation module, typed Vite env support for Sentry DSN/release values, and a root React error boundary with a member-friendly crash fallback screen.
- **Server monitoring foundation:** Added `@sentry/node`, env-gated backend initialization, request-aware exception capture inside the centralized error middleware, and fatal-process flush logic for uncaught exceptions and unhandled rejections.
- **Noise control:** Kept Sentry disabled unless DSNs are explicitly configured and intentionally skipped normal 4xx `AppError` responses so validation/auth failures do not flood monitoring with expected operational events.
- **Docs + repo memory:** Added Sentry env placeholders to the backend example env, wired optional DSNs into `render.yaml`, updated Quick Start / agent briefing / decision log / task board, and cleaned the lingering server test lint warnings while touching the monitoring pass.

**Remaining Notes:**

- Sentry is now wired in code, but each environment still needs `SENTRY_DSN` and/or `VITE_SENTRY_DSN` configured before events will actually appear in Sentry there.
- Source-map upload, tracing, session replay, and richer release automation are still optional follow-ups if the project wants deeper observability later.
- Live Google OAuth and SMTP delivery still depend on environment-specific credentials.

**Verification:**

- Ran `npm.cmd run lint` successfully at the repo root.
- Ran `npm.cmd run typecheck` successfully at the repo root.
- Ran `npm.cmd run test` successfully at the repo root after rerunning outside the Windows sandbox because the sandboxed client Vitest startup hit `spawn EPERM`.

**Files Changed:**

- `client/package-lock.json`
- `client/package.json`
- `client/src/components/layout/AppErrorFallback.tsx`
- `client/src/instrument.ts`
- `client/src/lib/sentry.test.ts`
- `client/src/lib/sentry.ts`
- `client/src/main.tsx`
- `client/src/vite-env.d.ts`
- `server/package-lock.json`
- `server/package.json`
- `server/.env.example`
- `server/src/app.ts`
- `server/src/index.ts`
- `server/src/lib/sentry.test.ts`
- `server/src/lib/sentry.ts`
- `server/src/lib/session.test.ts`
- `server/src/middleware/error-handler.ts`
- `AGENT_BRIEFING.md`
- `DECISIONS.md`
- `PROGRESS.md`
- `QUICKSTART.md`
- `TODO.md`
- `render.yaml`

### 2026-03-30 - Husky + lint-staged Workflow Polish

**Focus:** Finished the remaining local workflow-polish task by wiring real Git hooks around the repo's existing quality commands.

**Completed:**

- **Root hook tooling:** Added root `husky`, `lint-staged`, and `prettier` dev dependencies plus `prepare` / `lint-staged` package scripts so the repo can install hooks automatically and expose the staged-file checks directly.
- **Pre-commit staged-file checks:** Added a root `.lintstagedrc.mjs` that runs client staged source files through the client ESLint config with `--fix`, runs server staged source files through the server ESLint config with `--fix`, and formats staged docs/config/style files with Prettier.
- **Hook entrypoints:** Added `.husky/pre-commit` to run `lint-staged` and `.husky/pre-push` to run the existing `scripts/pre-push-check.sh` quality gate, keeping the current full-project push checks but moving them into an actual Git hook workflow.
- **Project memory updates:** Marked the workflow-polish TODO complete and documented the new local hook behavior in Quick Start and the agent briefing.

**Remaining Notes:**

- The repo now has the hook config committed, but each environment still needs a successful `npm install` at the root so Husky's `prepare` step can generate the local `.husky/_` hook shim directory.
- Live Google OAuth and SMTP delivery still depend on environment-specific credentials.

**Verification:**

- Ran `npm.cmd exec prettier --check .lintstagedrc.mjs` successfully at the repo root.
- Ran `npm.cmd run lint` successfully at the repo root.
- Ran `npm.cmd run typecheck` successfully at the repo root.
- Ran `npm.cmd run test` successfully at the repo root.
- Confirmed the staged-file commands work against sample client/server source files with explicit `--config client/eslint.config.js` and `--config server/eslint.config.js` arguments.

**Files Changed:**

- `.husky/pre-commit`
- `.husky/pre-push`
- `.lintstagedrc.mjs`
- `package-lock.json`
- `package.json`
- `AGENT_BRIEFING.md`
- `DECISIONS.md`
- `PROGRESS.md`
- `QUICKSTART.md`
- `TODO.md`

### 2026-03-30 - Mapbox Bundle Optimization

**Focus:** Closed the long-running Mapbox production bundle-size follow-up without changing the search-page UX.

**Completed:**

- **Runtime-loaded Mapbox GL:** Added a small browser loader that injects the Mapbox GL JS script and stylesheet from Mapbox's CDN only when the interactive map is opened, while preserving the existing `react-map-gl` integration and token-gated map behavior.
- **Bundle cleanup:** Aliased Vite's `mapbox-gl` resolution to a tiny local stub and passed the real runtime loader through `MapGL`'s `mapLib` prop so the client build no longer ships the 1.7 MB lazy `mapbox-gl` chunk.
- **Map component follow-through:** Removed the direct bundled Mapbox CSS import from `InteractiveMap`, updated the map container comments to reflect the new loading path, and kept the existing popup/control styling intact through the CDN stylesheet plus local overrides.
- **Project memory updates:** Marked the Mapbox bundle task complete and removed the old known-bug note from the repo status docs.

**Remaining Notes:**

- A valid `VITE_MAPBOX_TOKEN` is still required anywhere the live interactive map should be enabled.
- Live Google OAuth and SMTP delivery still depend on environment-specific credentials.

**Verification:**

- Ran `npm.cmd run typecheck` successfully in `client/`.
- Ran `npm.cmd run lint` successfully in `client/`.
- Ran `npm.cmd run build` successfully in `client/` outside the sandbox after the initial sandboxed build hit `spawn EPERM`.
- Verified the production build output no longer contains the old `mapbox-gl` 1.7 MB chunk; the build now emits a tiny `mapbox-gl-runtime` stub plus a ~23 kB `InteractiveMap` chunk.

**Files Changed:**

- `client/src/components/map/InteractiveMap.tsx`
- `client/src/components/map/MapContainer.tsx`
- `client/src/lib/load-mapbox-gl.ts`
- `client/src/lib/mapbox-gl-runtime.ts`
- `client/vite.config.ts`
- `AGENT_BRIEFING.md`
- `DECISIONS.md`
- `PROGRESS.md`
- `TODO.md`

### 2026-03-29 - Auth Email Delivery

**Focus:** Finished the remaining Milestone 2 auth transport gap by wiring real SMTP-backed delivery for password reset and email verification emails.

**Completed:**

- **Reusable mailer layer:** Added a Nodemailer-based SMTP transport helper plus dedicated auth email templates for password reset and email verification messages.
- **Auth delivery integration:** Updated the auth service so reset and verification flows now build real client URLs, send emails when SMTP is configured, preserve explicit preview-link fallback for local development, and surface configuration issues more clearly for authenticated resend requests.
- **Environment and deployment wiring:** Added `SMTP_SECURE` to the server example env file and predeclared the SMTP environment variables in the Render blueprint so live deployments have a clear configuration path.
- **Coverage + verification:** Expanded auth route tests to cover preview-only behavior, SMTP-enabled delivery, and unavailable-delivery error handling, then re-ran server typecheck, lint, and the targeted auth route suite successfully.

**Remaining Notes:**

- The code path for auth email delivery is now implemented, but each environment still needs real SMTP provider settings before those emails will send there.
- Google OAuth still depends on valid environment-specific credentials and authorized redirect URIs anywhere live sign-in should work.
- The known Mapbox chunk-size warning was resolved on 2026-03-30 by moving the runtime library out of the client bundle.

**Verification:**

- Ran `npm.cmd run typecheck` successfully in `server/`.
- Ran `npm.cmd run lint` successfully in `server/` (existing unrelated warnings remain in `server/src/lib/session.test.ts`).
- Ran `npm.cmd test -- --runInBand auth.routes.test.ts` successfully in `server/`.

**Files Changed:**

- `server/.env.example`
- `server/package-lock.json`
- `server/package.json`
- `server/src/lib/email.ts`
- `server/src/routes/auth.routes.test.ts`
- `server/src/services/auth-email.service.ts`
- `server/src/services/auth.service.ts`
- `AGENT_BRIEFING.md`
- `DECISIONS.md`
- `PROGRESS.md`
- `QUICKSTART.md`
- `TODO.md`
- `render.yaml`

### 2026-03-29 - Account Page UX Refresh

**Focus:** Reframed the signed-in account experience so it feels member-facing and useful after login instead of reading like an internal feature-status screen.

**Completed:**

- **Member-facing copy pass:** Rewrote the account hero, verification messaging, summary cards, and sidebar guidance so the page now talks about shortlists, visits, and account recovery instead of Milestone 2 implementation status.
- **Better empty states:** Upgraded the saved-churches and reviews empty states with clearer explanations, supportive wording, and direct links back into church search so a new account has an obvious next move.
- **Small action-label cleanup:** Improved a few account-page labels so actions read more naturally in context, including friendlier verification wording, a clearer saved-state removal action, and a more explicit review-delete label.
- **Verification:** Re-ran client typecheck and lint successfully, then re-ran the client production build outside the sandbox after the initial sandboxed attempt failed with `spawn EPERM`; the build completed successfully and still shows the existing `mapbox-gl` chunk-size warning.

**Remaining Notes:**

- Real transactional email delivery is now the clearest remaining Milestone 2 follow-up, with environment-specific Google OAuth credential setup still needed anywhere live Google sign-in should work.
- The known lazy-loaded `mapbox-gl` chunk-size warning was resolved on 2026-03-30 by moving the runtime library out of the client bundle.

**Verification:**

- Ran `npm.cmd run typecheck` successfully in `client/`.
- Ran `npm.cmd run lint` successfully in `client/`.
- Ran `npm.cmd run build` successfully in `client/` after rerunning with elevated execution because the sandbox blocked esbuild process spawning with `spawn EPERM`.

**Files Changed:**

- `client/src/pages/AccountPage.tsx`
- `AGENT_BRIEFING.md`
- `PROGRESS.md`
- `TODO.md`

### 2026-03-29 - Search Workspace UX Pass

**Focus:** Tightened the core search experience so the directory is easier to steer, especially on mobile where the old search page hid too much state and too many controls.

**Completed:**

- **Search workspace header:** Added a new search-page toolbar with live results context, an inline search field, visible sort controls, and removable active search/filter chips so users can understand and adjust the current result set quickly.
- **Mobile search fix:** Search is now directly available inside the search workspace on small screens instead of being hidden behind the desktop-only header search UI.
- **Advanced filters sheet:** Replaced the unused legacy filter sidebar with a polished slide-over filter panel that surfaces denomination, day, time, language, and amenity refinements in a more intentional UX.
- **Map/list control cleanup:** Added an inline desktop map toggle, kept the floating mobile map/list switch, and adjusted the sidebar result grid so desktop cards stay more readable beside the map.
- **Shared search-state helpers:** Centralized active-filter token generation and shared search-parameter building to keep the search page and result list aligned.

**Remaining Notes:**

- The account page is now the clearest remaining UX polish target because it still reads more like an internal milestone status screen than a member-facing destination.
- Client build verification is still blocked in this workspace by the existing missing-`rollup` local dependency issue under `client/node_modules`, even though lint and typecheck passed cleanly.

**Verification:**

- Ran `npm.cmd run typecheck` successfully in `client/`.
- Ran `npm.cmd run lint` successfully in `client/`.
- Attempted `npm.cmd run build` in `client/`, but Vite failed before bundling because it could not resolve the local `rollup` package from `client/node_modules`.

**Files Changed:**

- `client/src/components/church/ChurchList.tsx`
- `client/src/components/search/FilterPanel.tsx`
- `client/src/hooks/useChurches.ts`
- `client/src/lib/search-state.ts`
- `client/src/pages/SearchPage.tsx`
- `PROGRESS.md`
- `TODO.md`

### 2026-03-29 - Review Moderation Follow-up

**Focus:** Closed the main remaining review-side Milestone 2 gap by shipping authenticated review reporting plus a real site-admin moderation queue.

**Completed:**

- **Backend moderation flow:** Added `POST /api/v1/reviews/:id/flag` so signed-in users can report inappropriate reviews, plus `GET /api/v1/admin/flagged-reviews` and `PATCH /api/v1/admin/flagged-reviews/:id` for site-admin moderation decisions.
- **Role-gated moderation controls:** Added `server/src/middleware/require-site-admin.ts` so site-admin-only review queue access and moderation actions follow the same session-backed auth model as the rest of the app.
- **Moderation outcomes:** Flagged reviews now leave the public listing feed while they are under review, and site admins can either restore them to public visibility or remove them entirely using the existing aggregate-safe delete path.
- **Frontend moderation UX:** Added a `Report` action on church profile reviews for non-authors, surfaced success/error notices around moderation reporting, and added a site-admin review moderation queue to the account page with "Keep live" and "Remove review" actions.
- **Coverage + verification:** Expanded server review-route coverage for reporting and moderation resolution, re-ran lint/typecheck on both apps, and re-ran the targeted server review route test suite successfully.

**Remaining Notes:**

- Real transactional email delivery is now the clearest remaining Milestone 2 follow-up, with environment-specific Google OAuth credential setup still needed anywhere live Google sign-in should work.
- The client review API test file could not be executed in this workspace because Vite/Vitest's local dependency chain is missing `rollup` under `client/node_modules`; client typecheck and lint both passed.

**Verification:**

- Ran `npm.cmd run typecheck` successfully in both `server/` and `client/`.
- Ran `npm.cmd run lint` successfully in both `server/` and `client/`.
- Ran `npm.cmd test -- review.routes.test.ts --runInBand` successfully in `server/`.
- Attempted `npm.cmd test -- --run src/api/reviews.test.ts` in `client/`, but it failed before running tests because the local Vite install could not resolve `rollup`.

**Files Changed:**

- `server/src/middleware/require-site-admin.ts`
- `server/src/routes/review.routes.test.ts`
- `server/src/routes/review.routes.ts`
- `server/src/schemas/review.schema.ts`
- `server/src/services/review.service.ts`
- `server/src/types/review.types.ts`
- `client/src/api/reviews.test.ts`
- `client/src/api/reviews.ts`
- `client/src/hooks/useReviews.ts`
- `client/src/pages/AccountPage.tsx`
- `client/src/pages/ChurchProfilePage.tsx`
- `client/src/types/review.ts`
- `PROGRESS.md`
- `TODO.md`

### 2026-03-29 - Fix Mapbox map not loading on Render

**Focus:** Diagnosed and fixed the interactive map showing the SVG placeholder ("Lightweight map preview") instead of the real Mapbox GL JS map on the deployed Render site.

**Root Cause:** The `VITE_MAPBOX_TOKEN` environment variable was present in `client/.env` locally but `.env` is gitignored (correctly). Since Vite bakes environment variables at build time, the token was absent during the Render static-site build, causing `MapContainer` to fall back to `MapPlaceholder`.

**Fix:**

- Added `VITE_MAPBOX_TOKEN` with `sync: false` to the frontend service in `render.yaml`, so Render knows the variable exists and it can be set manually in the dashboard.
- The token value (`pk.eyJ1Ijoi…`) must be pasted into the Render dashboard under the `sa-church-finder` static site → Environment → `VITE_MAPBOX_TOKEN`, then a manual deploy triggered.

**Files Changed:**

- `render.yaml`

---

### 2026-03-29 - Google OAuth

**Focus:** Finished the last planned Milestone 2 auth flow by wiring Google OAuth through the existing session-backed backend and auth screens.

**Completed:**

- **Backend Google OAuth flow:** Added `GET /api/v1/auth/google` and `GET /api/v1/auth/google/callback` with session-backed OAuth state, safe `returnTo` handling, Google token/userinfo exchange, and user creation/linking by `googleId` or verified email.
- **Frontend Google entry points:** Added reusable Google CTA UI on the login and register pages, preserved post-auth redirect targets across auth screens, and surfaced callback failure messaging when Google sign-in is canceled or expires.
- **Account and setup refresh:** Updated account-page copy to reflect that Google sign-in is now live, added Google OAuth setup guidance to the docs, and prewired Render blueprint placeholders for Google credentials plus the callback URL.
- **Coverage + verification:** Expanded `server/src/routes/auth.routes.test.ts` to cover Google OAuth start/callback success and failure cases, added client redirect-helper tests, and re-verified lint, typecheck, tests, and builds across the touched surfaces.

**Remaining Notes:**

- Google OAuth now works in-app, but each environment still needs valid `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` values and a matching authorized redirect URI in Google Cloud before live sign-in will work there.
- Real outbound email delivery is now the clearest remaining auth follow-up, with review moderation next on the product side.
- The known Mapbox chunk-size warning still appears in the client production build and remains a separate performance follow-up.

**Verification:**

- Ran `npm.cmd run lint` successfully in both `server/` and `client/`.
- Ran `npm.cmd run typecheck` successfully in both `server/` and `client/`.
- Ran `npm.cmd test -- --runInBand auth.routes.test.ts` successfully in `server/`.
- Ran `npm.cmd test -- auth.test.ts auth-redirect.test.ts` successfully in `client/` (required elevated execution in this environment because Vitest/esbuild spawning is sandbox-restricted here).
- Ran `npm.cmd run build` successfully in `server/`.
- Ran `npm.cmd run build` successfully in `client/` (required elevated execution in this environment because Vite/esbuild spawning is sandbox-restricted here). The known `mapbox-gl` chunk-size warning still appears.

**Files Changed:**

- `server/src/routes/auth.routes.test.ts`
- `server/src/routes/auth.routes.ts`
- `server/src/schemas/auth.schema.ts`
- `server/src/services/auth.service.ts`
- `server/src/types/session.d.ts`
- `client/src/components/auth/AuthPageShell.tsx`
- `client/src/components/auth/GoogleAuthButton.tsx`
- `client/src/lib/auth-redirect.test.ts`
- `client/src/lib/auth-redirect.ts`
- `client/src/pages/AccountPage.tsx`
- `client/src/pages/LoginPage.tsx`
- `client/src/pages/RegisterPage.tsx`
- `AGENT_BRIEFING.md`
- `API_SPEC.md`
- `DECISIONS.md`
- `PROJECT_CONTEXT.md`
- `PROGRESS.md`
- `QUICKSTART.md`
- `TODO.md`
- `render.yaml`

### 2026-03-28 - Email Verification Flow

**Focus:** Closed the remaining local-auth verification gap by wiring email verification from token persistence through the account and verification-page UX.

**Completed:**

- **Verification-token persistence:** Added the `EmailVerificationToken` Prisma model plus a committed SQL migration so verification tokens now have a real hashed, expiring, one-time-use backend store.
- **Backend verification flow:** Updated `server/src/services/auth.service.ts` and `server/src/routes/auth.routes.ts` so registration issues a verification token, signed-in users can request a fresh token via `POST /api/v1/auth/verify-email/resend`, and verification links can be consumed through `POST /api/v1/auth/verify-email`.
- **Opt-in local preview mode:** Added `AUTH_EXPOSE_VERIFICATION_PREVIEW` and `EMAIL_VERIFICATION_TOKEN_TTL_MINUTES`, mirroring the reset flow so local development can exercise verification safely before SMTP delivery is wired.
- **Frontend verification UX:** Added `client/src/pages/VerifyEmailPage.tsx`, wired `/verify-email` into the router, extended the auth API/hooks/types, and added an account-page resend action with preview-link surfacing when preview mode is enabled.
- **Coverage + docs:** Expanded server auth route tests and client auth API tests, updated auth/API/setup docs, and refreshed project memory files so email verification is now tracked as completed work rather than an open auth gap.

**Remaining Notes:**

- Google OAuth is now the only missing auth flow from the original Milestone 2 foundation slice.
- Real outbound email delivery is still a separate follow-up; both password reset and email verification currently use explicit local preview modes for development testing.
- Review moderation remains the clearest next product follow-up after the auth foundation is fully rounded out.

**Verification:**

- Ran `npx.cmd prisma generate` successfully in `server/` (required elevated execution in this environment because Prisma client generation hit the sandbox's process-spawn restriction).
- Ran `npm.cmd test -- --runInBand auth.routes.test.ts` successfully in `server/`.
- Ran `npm.cmd run typecheck` successfully in both `server/` and `client/`.
- Ran `npm.cmd run lint` successfully in both `server/` and `client/`.
- Ran `npm.cmd test -- auth.test.ts` successfully in `client/` (required elevated execution in this environment because Vitest/esbuild spawning is sandbox-restricted here).

**Files Changed:**

- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260328231500_add_email_verification_tokens/migration.sql`
- `server/.env.example`
- `server/src/routes/auth.routes.test.ts`
- `server/src/routes/auth.routes.ts`
- `server/src/schemas/auth.schema.ts`
- `server/src/services/auth.service.ts`
- `client/src/App.tsx`
- `client/src/api/auth.test.ts`
- `client/src/api/auth.ts`
- `client/src/hooks/useAuth.ts`
- `client/src/pages/AccountPage.tsx`
- `client/src/pages/VerifyEmailPage.tsx`
- `client/src/types/auth.ts`
- `AGENT_BRIEFING.md`
- `API_SPEC.md`
- `DATA_MODELS.md`
- `DECISIONS.md`
- `PROGRESS.md`
- `QUICKSTART.md`
- `TODO.md`

### 2026-03-28 - Review Helpful Voting

**Focus:** Landed the first post-MVP review follow-up by wiring helpful voting from the API through the church profile experience.

**Completed:**

- **Helpful-vote backend flow:** Added `POST /api/v1/reviews/:id/helpful` and `DELETE /api/v1/reviews/:id/helpful` with ownership guards, duplicate-vote protection, and `helpfulCount` updates backed by the existing `review_votes` table.
- **Viewer-aware review payloads:** Updated church review responses so each review includes `viewerHasVotedHelpful`, letting the frontend render vote state without bolting on a second per-review request.
- **Church profile helpful controls:** Added live helpful/unhelpful buttons on review cards in `ChurchProfilePage`, including signed-out redirect behavior, own-review suppression, and post-mutation query refresh.
- **Client/server test coverage:** Expanded `server/src/routes/review.routes.test.ts` and added `client/src/api/reviews.test.ts` to cover helpful-vote creation/removal plus the new client request paths.

**Remaining Notes:**

- Review moderation and flagging are still the main review follow-up after this voting pass.
- Google OAuth and email verification remain the highest-priority auth gaps, with real outbound email delivery still blocking the latter.
- The Mapbox chunk-size warning remains unchanged and is still a separate performance follow-up.

**Verification:**

- Ran `npm.cmd test -- --runInBand review.routes.test.ts` successfully in `server/`.
- Ran `npm.cmd test -- reviews.test.ts` successfully in `client/` (required elevated execution in this environment because Vitest/esbuild spawning is sandbox-restricted here).
- Ran `npm.cmd run typecheck` successfully in both `server/` and `client/`.
- Ran `npm.cmd run lint` successfully in both `server/` and `client/`.

**Files Changed:**

- `server/src/routes/review.routes.test.ts`
- `server/src/routes/review.routes.ts`
- `server/src/services/review.service.ts`
- `server/src/types/review.types.ts`
- `client/src/api/reviews.test.ts`
- `client/src/api/reviews.ts`
- `client/src/hooks/useReviews.ts`
- `client/src/pages/ChurchProfilePage.tsx`
- `client/src/types/review.ts`
- `AGENT_BRIEFING.md`
- `DECISIONS.md`
- `PROGRESS.md`
- `TODO.md`

### 2026-03-28 - Forgot/Reset Password Flow

**Focus:** Finished the next Milestone 2 auth slice by wiring password recovery from backend token issuance through the frontend reset experience.

**Completed:**

- **Reset-token backend flow:** Added `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` with Zod validation, token hashing, expiry handling, token invalidation, and password replacement in `server/src/services/auth.service.ts`.
- **Opt-in local preview mode:** Added an explicit `AUTH_EXPOSE_RESET_PREVIEW` escape hatch for local development so reset URLs can be exercised without exposing preview links by default or blocking on SMTP integration.
- **Frontend recovery UX:** Added `ForgotPasswordPage` and `ResetPasswordPage`, wired their routes into `client/src/App.tsx`, extended the auth API/hooks, and linked recovery directly from the login experience.
- **Account/auth copy refresh:** Updated auth shell messaging and the account page so the UI now accurately reflects that password recovery is live while Google OAuth and email verification remain open.
- **Coverage + verification:** Expanded `server/src/routes/auth.routes.test.ts` and `client/src/api/auth.test.ts` to cover reset issuance/submission behavior, then re-ran lint and typecheck across both apps.

**Remaining Notes:**

- Password reset email delivery is still a shared follow-up with email verification; production mail transport is not wired yet.
- Google OAuth and email verification are now the main remaining Milestone 2 auth gaps.
- The Mapbox chunk-size warning remains unchanged and is still a separate performance follow-up.

**Verification:**

- Ran `npm.cmd test -- --runInBand auth.routes.test.ts` successfully in `server/`.
- Ran `npm.cmd test -- auth.test.ts` successfully in `client/` (required elevated execution in this environment because Vitest/esbuild spawning is sandbox-restricted here).
- Ran `npm.cmd run typecheck` successfully in both `server/` and `client/`.
- Ran `npm.cmd run lint` successfully in both `server/` and `client/`.

**Files Changed:**

- `server/.env.example`
- `server/src/routes/auth.routes.test.ts`
- `server/src/routes/auth.routes.ts`
- `server/src/schemas/auth.schema.ts`
- `server/src/services/auth.service.ts`
- `client/src/App.tsx`
- `client/src/api/auth.test.ts`
- `client/src/api/auth.ts`
- `client/src/components/auth/AuthPageShell.tsx`
- `client/src/hooks/useAuth.ts`
- `client/src/pages/AccountPage.tsx`
- `client/src/pages/ForgotPasswordPage.tsx`
- `client/src/pages/LoginPage.tsx`
- `client/src/pages/ResetPasswordPage.tsx`
- `client/src/types/auth.ts`
- `AGENT_BRIEFING.md`
- `DECISIONS.md`
- `PROGRESS.md`
- `QUICKSTART.md`
- `TODO.md`

### 2026-03-28 - Reviews MVP

**Focus:** Finished the next Milestone 2 product slice by making written reviews real across the backend, church profiles, and the account page.

**Completed:**

- **Review APIs + service layer:** Added `GET/POST /api/v1/churches/:churchId/reviews`, `PATCH/DELETE /api/v1/reviews/:id`, and `GET /api/v1/users/:id/reviews` with validation, auth/ownership checks, and a dedicated review service.
- **Aggregate rating updates:** Wired create/edit/delete review flows to update church `avgRating` and `reviewCount` incrementally from the existing stored aggregates so imported listing scores are preserved while real written reviews start accumulating.
- **Church profile review UX:** Added a real review section on `ChurchProfilePage` with list sorting, pagination, signed-in create/edit/delete flow, and a login CTA for signed-out visitors.
- **Account review history:** Replaced the account-page review placeholder with the user’s real review history, including direct links back to church profile review sections and inline delete actions.
- **Coverage + verification:** Added `server/src/routes/review.routes.test.ts` covering review auth, listing, create/update/delete aggregate behavior, and protected account-history access.

**Remaining Notes:**

- Helpful voting / flagging moderation are still follow-up review features rather than part of this MVP slice.
- Google OAuth, email verification, and forgot/reset password remain the main Milestone 2 auth follow-ups.
- The Mapbox chunk-size warning remains unchanged and is still a separate performance follow-up.

**Verification:**

- Ran `npm.cmd run lint` successfully.
- Ran `npm.cmd run typecheck` successfully.
- Ran `npm.cmd run test` successfully (required elevated execution in this environment because Vitest/esbuild spawning is sandbox-restricted here).
- Ran `npm.cmd run build` successfully (also required elevated execution here because Vite/esbuild spawning is sandbox-restricted). The known `mapbox-gl` chunk-size warning still appears.

**Files Changed:**

- `server/src/app.ts`
- `server/src/routes/review.routes.ts`
- `server/src/routes/review.routes.test.ts`
- `server/src/routes/users.routes.ts`
- `server/src/schemas/review.schema.ts`
- `server/src/schemas/user.schema.ts`
- `server/src/services/review.service.ts`
- `server/src/types/review.types.ts`
- `client/src/api/reviews.ts`
- `client/src/components/reviews/ReviewForm.tsx`
- `client/src/hooks/useReviews.ts`
- `client/src/pages/AccountPage.tsx`
- `client/src/pages/ChurchProfilePage.tsx`
- `client/src/types/review.ts`
- `AGENT_BRIEFING.md`
- `DECISIONS.md`
- `PROJECT_CONTEXT.md`
- `TODO.md`
- `PROGRESS.md`

### 2026-03-28 - Saved Churches MVP

**Focus:** Finished the first true account-driven Milestone 2 feature by wiring saved churches through the backend, church payloads, and the account UI.

**Completed:**

- **Protected saved-church APIs:** Added `POST /api/v1/churches/:id/save` and `GET /api/v1/users/:id/saved` with auth middleware, ownership checks, and a dedicated saved-church service so saves persist in Prisma instead of living in placeholder UI.
- **Session-aware church payloads:** Updated church search/detail responses to include `isSaved` for the current session user, which lets the frontend render the correct heart state without bolting on a second fetch per card/profile.
- **Frontend save controls:** Rewired the heart affordances in `ChurchCard` and `ChurchProfilePage` to hit the real API, redirect signed-out users into the existing login flow, and refresh cached church data after save/unsave.
- **Real account shortlist:** Replaced the account-page placeholder with the user’s saved churches list, including direct profile links and inline unsave actions.
- **Test coverage + verification:** Added `server/src/routes/saved-church.routes.test.ts`, updated the existing church card test, and re-verified the repo with lint, typecheck, tests, and production builds.

**Remaining Notes:**

- Review creation/history is now the clearest next Milestone 2 product slice.
- Google OAuth, email verification, and forgot/reset password are still open auth follow-ups.
- The Mapbox chunk-size warning remains unchanged and is still a separate performance follow-up.

**Verification:**

- Ran `npm.cmd run lint` successfully.
- Ran `npm.cmd run typecheck` successfully.
- Ran `npm.cmd run test` successfully (required elevated execution in this environment because Vitest/esbuild spawning is sandbox-restricted here).
- Ran `npm.cmd run build` successfully (also required elevated execution here because Vite/esbuild spawning is sandbox-restricted). The known `mapbox-gl` chunk-size warning still appears.

**Files Changed:**

- `server/src/app.ts`
- `server/src/middleware/require-auth.ts`
- `server/src/routes/church.routes.ts`
- `server/src/routes/saved-church.routes.test.ts`
- `server/src/routes/users.routes.ts`
- `server/src/schemas/church.schema.ts`
- `server/src/schemas/user.schema.ts`
- `server/src/services/church-detail.service.ts`
- `server/src/services/church.service.ts`
- `server/src/services/saved-church.service.ts`
- `server/src/types/church.types.ts`
- `client/src/api/churches.ts`
- `client/src/components/church/ChurchCard.test.tsx`
- `client/src/components/church/ChurchCard.tsx`
- `client/src/components/church/ChurchList.tsx`
- `client/src/hooks/useAuth.ts`
- `client/src/hooks/useChurches.ts`
- `client/src/pages/AccountPage.tsx`
- `client/src/pages/ChurchProfilePage.tsx`
- `client/src/types/church.ts`
- `AGENT_BRIEFING.md`
- `TODO.md`
- `PROGRESS.md`

### 2026-03-28 - Frontend Auth UI + Session Integration

**Focus:** Landed the first client-side Milestone 2 slice so the real session-backed auth API is usable from the frontend and visible in the app shell.

**Completed:**

- **Client auth data layer:** Added `client/src/lib/api-client.ts`, `client/src/api/auth.ts`, `client/src/hooks/useAuth.ts`, and `client/src/types/auth.ts` so the frontend can call `/auth/register`, `/auth/login`, `/auth/logout`, and `/auth/me` with `credentials: 'include'`, cache the current user in React Query, and treat unauthenticated `/auth/me` responses as a normal signed-out state.
- **Auth pages + route protection:** Added `LoginPage`, `RegisterPage`, `AccountPage`, `AuthPageShell`, and `RequireAuth`, then wired new `/login`, `/register`, and protected `/account` routes in `client/src/App.tsx`. Login/signup now redirect into the protected account area (or back to the originally requested route) after success.
- **Session-aware app shell:** Updated `client/src/components/layout/Header.tsx` so the header reflects session state and routes signed-out users to auth pages while signed-in users get a direct account entry point.
- **Account surface for next features:** Added a first-pass account page that shows live user/session info and clearly scopes the next Milestone 2 steps (saved churches, reviews, Google OAuth, verification, reset flows) without pretending those features already exist.
- **Client test coverage:** Added `client/src/api/auth.test.ts` and `client/src/components/auth/RequireAuth.test.tsx` to cover cookie-enabled auth requests and protected-route behavior.

**Remaining Notes:**

- This ships the local email/password frontend only. Google OAuth, email verification, and forgot/reset password are still open follow-ups.
- The account page is intentionally a foundation surface; saved churches and review history still need their own backend/frontend feature work.
- The Mapbox chunk-size warning remains unchanged and is still a separate performance follow-up.

**Verification:**

- Ran `npm.cmd run lint:client` and `npm.cmd run typecheck:client` successfully.
- Ran `npm.cmd run test:client` successfully (required elevated execution in this environment because Vitest/esbuild spawning is sandbox-restricted here).
- Ran `npm.cmd run build:client` successfully (also required elevated execution here because Vite/esbuild spawning is sandbox-restricted). The known `mapbox-gl` chunk-size warning still appears.

**Files Changed:**

- `client/src/App.tsx`
- `client/src/api/auth.ts`
- `client/src/api/auth.test.ts`
- `client/src/components/auth/AuthPageShell.tsx`
- `client/src/components/auth/RequireAuth.tsx`
- `client/src/components/auth/RequireAuth.test.tsx`
- `client/src/components/layout/Header.tsx`
- `client/src/hooks/useAuth.ts`
- `client/src/lib/api-client.ts`
- `client/src/pages/AccountPage.tsx`
- `client/src/pages/LoginPage.tsx`
- `client/src/pages/RegisterPage.tsx`
- `client/src/types/auth.ts`
- `AGENT_BRIEFING.md`
- `PROJECT_CONTEXT.md`
- `TODO.md`
- `PROGRESS.md`

### 2026-03-28 - Local Auth Foundation

**Focus:** Replaced the placeholder auth API with a real session-based local auth foundation so Milestone 2 has a working backend entry point.

**Completed:**

- **Server bootstrap refactor:** Split the Express app setup into `server/src/app.ts` and kept `server/src/index.ts` focused on process startup/shutdown. This makes the app import-safe for route tests and future server integrations.
- **Session middleware:** Added `server/src/lib/session.ts` with shared session configuration, cookie naming, client URL parsing, and PostgreSQL-backed session storage via `connect-pg-simple` outside test mode.
- **Real auth flow:** Replaced the stubbed `auth.routes.ts` handlers with working `register`, `login`, `logout`, and `me` endpoints backed by Prisma and bcrypt. Registration now creates real users, login verifies hashed passwords, successful auth establishes an HTTP-only session, and `/auth/me` returns `401` when no session is present.
- **Validation + types:** Added `server/src/schemas/auth.schema.ts`, `server/src/services/auth.service.ts`, `server/src/types/auth.types.ts`, and `server/src/types/session.d.ts` so auth input and session state are typed and validated.
- **Test coverage:** Added `server/src/routes/auth.routes.test.ts` covering registration, duplicate-email conflicts, login, session-backed `/auth/me`, logout, and invalid-credential handling. Also silenced server logger output in test mode and suppressed the known `ts-jest` NodeNext diagnostic in `server/jest.config.cjs`.

**Remaining Notes:**

- This is the local email/password foundation only. Google OAuth, email verification, forgot/reset password, and frontend auth screens are still open Milestone 2 follow-ups.
- Session persistence now uses PostgreSQL automatically in non-test environments and falls back to the in-memory store under Jest.
- The Mapbox chunk-size warning still remains a separate performance follow-up.

**Verification:**

- Ran `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test`, and `npm.cmd run build` successfully.
- After the logger/Jest cleanup, reran `npm.cmd run test:server`, `npm.cmd run lint:server`, and `npm.cmd run typecheck:server` successfully.

**Files Changed:**

- `server/src/app.ts`
- `server/src/index.ts`
- `server/src/lib/session.ts`
- `server/src/lib/logger.ts`
- `server/src/middleware/error-handler.ts`
- `server/src/routes/auth.routes.ts`
- `server/src/routes/auth.routes.test.ts`
- `server/src/schemas/auth.schema.ts`
- `server/src/services/auth.service.ts`
- `server/src/types/auth.types.ts`
- `server/src/types/session.d.ts`
- `server/jest.config.cjs`
- `server/tsconfig.json`
- `TODO.md`
- `PROGRESS.md`
- `AGENT_BRIEFING.md`
- `PROJECT_CONTEXT.md`

### 2026-03-28 - Dependency Upgrade Sweep

**Focus:** Cleared the open dependency-maintenance bucket and migrated the repo to ESLint 9 without leaving compatibility shims behind.

**Completed:**

- **ESLint 9 migration:** Replaced the legacy `.eslintrc.cjs` files in both `client/` and `server/` with flat-config `eslint.config.js` files, updated the lint scripts to the flat-config-friendly CLI form, and moved TypeScript linting to the `typescript-eslint` meta package plus `@eslint/js`.
- **Package upgrades:** Upgraded `eslint` to 9.39.4, `multer` to 2.1.1, and `supertest` to 7.2.2. Also refreshed the related linting packages (`typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `@eslint/js`) and updated `@types/multer` / `@types/supertest`.
- **Type alignment:** Because the stricter lint/type pass surfaced nullability drift in the server domain types, updated `server/src/types/church.types.ts` to match the actual Prisma payload shape for nullable fields.
- **Install + lockfiles:** Refreshed both `client/package-lock.json` and `server/package-lock.json` from clean installs.
- **Verification:** Ran `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test`, and `npm.cmd run build` successfully. The test/build run needed elevated execution in this environment because Vitest/Vite child-process spawning is sandbox-restricted here.

**Remaining Notes:**

- Vite still warns that the lazy-loaded `mapbox-gl` chunk is very large (~1.7 MB minified). That remains a performance follow-up rather than a release blocker.
- `npm install` reduced the vulnerability counts, but the client still reports 4 moderate vulnerabilities and the server still reports 1 moderate vulnerability.

**Files Changed:**

- `client/package.json`
- `client/package-lock.json`
- `client/eslint.config.js`
- `client/.eslintrc.cjs` (removed)
- `server/package.json`
- `server/package-lock.json`
- `server/eslint.config.js`
- `server/.eslintrc.cjs` (removed)
- `server/src/types/church.types.ts`
- `TODO.md`
- `PROGRESS.md`
- `AGENT_BRIEFING.md`

### 2026-03-28 - Search Accessibility Polish

**Focus:** Tightened keyboard accessibility and search interaction semantics after deployment so the core discovery flow is easier to navigate without a mouse.

**Completed:**

- **Keyboard-accessible result cards:** Reworked `ChurchCard` from a clickable `div` into a real button-based interaction pattern with focus styling, preserved hover-sync behavior, and a separate save button that no longer interferes with navigation.
- **Search results semantics:** Added list semantics and a screen-reader status message in `ChurchList` so result navigation is announced more clearly.
- **Search submit controls:** Converted the shared `SearchBar` submit affordance and the header search pill submit affordance into real buttons, and removed the invalid nested interactive markup in the header search form.
- **Popup text cleanup:** Updated the interactive map popup to use icon-based rating/profile affordances and consistent distance formatting, which also removed visible mojibake in the UI.
- **Server typing cleanup:** Added explicit return types for the church detail/lookup helpers and aligned nullable server church/service types with the actual Prisma payload shape so root lint/typecheck are clean again.
- **Verification:** Added `client/src/components/church/ChurchCard.test.tsx` to cover keyboard focus and save-button behavior. Ran `npm.cmd run lint`, `npm.cmd run typecheck`, and `npm.cmd run test` successfully. The test run required elevated execution in this environment because sandboxed Vitest/esbuild spawning is blocked here.

**Files Changed:**

- `client/src/components/church/ChurchCard.tsx`
- `client/src/components/church/ChurchList.tsx`
- `client/src/components/church/ChurchCard.test.tsx`
- `client/src/components/layout/Header.tsx`
- `client/src/components/search/SearchBar.tsx`
- `client/src/components/map/InteractiveMap.tsx`
- `server/src/index.ts`
- `server/src/services/church-detail.service.ts`
- `server/src/services/church.service.ts`
- `server/src/types/church.types.ts`
- `TODO.md`
- `PROGRESS.md`
- `AGENT_BRIEFING.md`

### 2026-03-28 - Render Deployment Verified Live

**Focus:** Closed the loop on the Render deployment after the live frontend showed `Failed to fetch` on church search.

**Completed:**

- **Root-cause isolation:** Confirmed the backend root 404 was expected for this API and narrowed the real production issue to frontend/backend wiring rather than an Express crash.
- **Frontend hardening:** Added `client/src/lib/api-url.ts` so production prefers `VITE_API_URL`, keeps local Vite proxy behavior in dev, and infers the sibling `-api` Render host as a safety net on `*.onrender.com`.
- **Clearer runtime errors:** Updated `client/src/api/churches.ts` to normalize fetch and parse failures into deployment-focused messages instead of generic browser errors.
- **Blueprint defaults:** Updated `render.yaml` so the default Render service names prefill `CLIENT_URL=https://sa-church-finder.onrender.com` and `VITE_API_URL=https://sa-church-finder-api.onrender.com`.
- **Verification:** Ran `npm.cmd run typecheck:client`, `npm.cmd run test:client`, and `npm.cmd run build:client` successfully. After redeploying with the corrected env wiring, the live site worked.

**Files Changed:**

- `client/src/lib/api-url.ts`
- `client/src/lib/api-url.test.ts`
- `client/src/api/churches.ts`
- `render.yaml`
- `QUICKSTART.md`
- `AGENT_BRIEFING.md`
- `TODO.md`
- `PROGRESS.md`

### 2026-03-28 - Render Deployment Troubleshooting Hardening

**Focus:** Investigated the live Render failure mode and reduced the two most likely configuration gaps: missing frontend API URL wiring and backend/frontend origin mismatch.

**Completed:**

- **Frontend API resolution:** Added `client/src/lib/api-url.ts` so production builds still prefer `VITE_API_URL`, keep local dev on the Vite `/api` proxy, and infer the sibling `-api` Render host as a safety net when the env var is missing on `*.onrender.com`.
- **Clearer fetch errors:** Wrapped church API requests so browser-level network failures now point directly at the likely Render misconfig (`VITE_API_URL` and `CLIENT_URL`), and HTML/non-JSON responses point at a bad API base URL instead of surfacing a generic parse failure.
- **Blueprint defaults:** Updated `render.yaml` to preconfigure `CLIENT_URL=https://sa-church-finder.onrender.com` and `VITE_API_URL=https://sa-church-finder-api.onrender.com`, removing a manual deployment step for the default service names.
- **Docs:** Updated `QUICKSTART.md` so the Render section reflects the new blueprint defaults and calls out when those URLs still need manual changes.

**Remaining Notes:**

- `DATABASE_URL` still must be supplied manually in Render.
- The live services need a redeploy or blueprint sync before these config changes take effect.
- I could not fully probe the live Render headers from this environment because outbound requests to the public service were unreliable here, so the CORS/header diagnosis is still based on code paths and the browser symptom.

**Files Changed:**

- `client/src/lib/api-url.ts`
- `client/src/lib/api-url.test.ts`
- `client/src/api/churches.ts`
- `render.yaml`
- `QUICKSTART.md`
- `PROGRESS.md`

### 2026-03-28 - Repo Baseline Stabilization + Docs Refresh

**Focus:** Re-established a trustworthy local baseline after the Prisma/Render work, then refreshed stale onboarding docs to match the actual codebase state.

**Completed:**

- **Client cleanup:** Fixed stale lint/type issues in `ChurchCard`, `MapPlaceholder`, `CategoryFilter`, `SearchBar`, and `Header`. Restored a real hover effect on cards and switched browser-side timeout refs away from `NodeJS.Timeout`.
- **Server cleanup:** Fixed the server ESLint config typo for `@typescript-eslint/explicit-function-return-type`, corrected `pino` / `pino-http` imports for NodeNext typing, cleaned unused params in `server/src/index.ts`, tightened error payload construction in `error-handler.ts`, and made church route handlers return `void` consistently.
- **Verification:** Confirmed `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` all pass. `test` and `build` required elevated execution in this environment because the sandbox blocked child-process spawning for esbuild/Vitest.
- **Build warning fix:** Removed the Vite CSS warning by moving the Google Fonts import ahead of Tailwind directives in `client/src/index.css`.
- **Docs refresh:** Updated `AGENT_BRIEFING.md` and `QUICKSTART.md` so they no longer describe the project as pre-scaffold / in-memory-only.

**Remaining Notes:**

- Vite still warns that the lazy-loaded `mapbox-gl` chunk is large (~1.7 MB minified). The app already code-splits the interactive map, so this is currently a performance warning rather than a release blocker.
- Render deployment remains the main outstanding manual step.

**Files Changed:**

- `client/src/components/church/ChurchCard.tsx`
- `client/src/components/map/MapPlaceholder.tsx`
- `client/src/components/search/CategoryFilter.tsx`
- `client/src/components/search/SearchBar.tsx`
- `client/src/components/layout/Header.tsx`
- `client/src/index.css`
- `server/.eslintrc.cjs`
- `server/src/index.ts`
- `server/src/lib/logger.ts`
- `server/src/middleware/error-handler.ts`
- `server/src/routes/church.routes.ts`
- `AGENT_BRIEFING.md`
- `QUICKSTART.md`

**Next Steps for Codex/Next Session:**

1. Finish the manual Render deploy flow and verify the live URLs are wired correctly
2. Decide whether to tackle dependency upgrades next (`eslint` 9, `multer` 2, `supertest` 7) or begin Milestone 2 feature work
3. Optionally reduce the size of the lazy-loaded Mapbox chunk if production performance becomes a concern

### 2026-03-28 — Supabase Cloud DB + Prisma Data Layer + Render Deployment (IN PROGRESS)

**Focus:** Got the database live on Supabase cloud, swapped in-memory data layer to Prisma+PostGIS, and started deploying to Render.

**Completed:**

- **Supabase cloud database:** Connected to Supabase PostgreSQL (us-west-2) with PostGIS 3.3. Uses Session Pooler URL for IPv4 compatibility (`aws-0-us-west-2.pooler.supabase.com:5432`). Direct connection is IPv6-only. Password has special chars that need URL-encoding.
- **Prisma data layer swap:** Replaced all in-memory data with Prisma client. Created `server/src/lib/prisma.ts` (singleton pattern). Rewrote `server/src/services/church.service.ts` to use `$queryRaw` with PostGIS spatial functions (`ST_DWithin`, `ST_Distance`, `ST_MakePoint`). Updated routes to be async with `await`.
- **Database seeded:** 22 churches, admin user, test user, 5 reviews, 3 saved churches. PostGIS spatial queries verified working.
- **Render deployment config:** Created `render.yaml` blueprint. Made `client/src/api/churches.ts` use configurable `VITE_API_URL`.

**In Progress — Render Deployment:**

- Backend Web Service (`sa-church-finder-api`): Created on Render with Git Provider connected to GitHub. Configuration:
  - Root directory: `server`
  - Build command: `npm install && npx prisma generate && npm run build`
  - Start command: `npm start`
  - Instance: Free tier ($0/month)
  - Env vars set: `DATABASE_URL`, `NODE_ENV=production`, `SESSION_SECRET` (auto-generated), `CLIENT_URL=*`
  - **Status: "Deploy Web Service" button NOT YET clicked — deployment not started**
- Frontend Static Site: Not yet created on Render
- After both deploy: update `CLIENT_URL` on backend to frontend URL, set `VITE_API_URL` on frontend to backend URL

**Files Changed:**

- `server/src/lib/prisma.ts` (new — Prisma client singleton)
- `server/src/services/church.service.ts` (rewritten — Prisma+PostGIS queries)
- `server/src/services/church-detail.service.ts` (updated — async)
- `server/src/routes/church.routes.ts` (updated — async await)
- `server/src/index.ts` (updated — Prisma import, graceful shutdown, CORS wildcard)
- `server/src/services/church.service.test.ts` (updated — mocks Prisma)
- `client/src/api/churches.ts` (updated — configurable VITE_API_URL)
- `render.yaml` (new — Render deployment blueprint)
- `server/.env` (updated — Supabase connection string)

**Next Steps for Codex/Next Session:**

1. Click "Deploy Web Service" on Render dashboard (backend is fully configured, just needs the button click)
2. Create a Render Static Site for the frontend (root dir: `client`, build cmd: `npm install && npm run build`, publish dir: `dist`)
3. Set `VITE_API_URL` on frontend to the backend URL (e.g., `https://sa-church-finder-api.onrender.com`)
4. Update `CLIENT_URL` on backend to the frontend URL
5. Test the live site end-to-end

### 2026-03-27 — PostGIS Database Migration & Loading Skeletons

**Focus:** Prepared the full PostGIS database layer (schema, migration, seed) so that spinning up Docker is all that's needed to go live with persistent data. Also added polished loading skeletons.

**Completed:**

- **Prisma schema update:** Added `postgresqlExtensions` preview feature, `postgis` extension, and `location Unsupported("geography(Point,4326)")?` column to Church model. Prisma now knows the column exists even though it manages it via raw SQL.
- **Initial migration SQL:** Created `server/prisma/migrations/20260327000000_init/migration.sql` — full DDL for all 10 tables, enums, foreign keys, unique constraints, and indexes. Includes PostGIS-specific additions: `CREATE EXTENSION IF NOT EXISTS "postgis"`, `geography(Point, 4326)` column on `churches`, GIST spatial index on `location`, and a `BEFORE INSERT OR UPDATE` trigger (`churches_location_sync`) that auto-populates the geography column from `latitude`/`longitude` on every write.
- **Seed script rewrite:** Completely rewrote `server/prisma/seed.ts` with proper `Prisma.Decimal` types for all numeric fields, an admin user in addition to the test user, 5 sample reviews (up from 2), PostGIS verification on startup (checks PostGIS version, validates location column population, runs a test `ST_DWithin` spatial query), and graceful fallback warnings if PostGIS isn't available.
- **ChurchCardSkeleton component:** Created `client/src/components/church/ChurchCardSkeleton.tsx` with a CSS shimmer gradient animation (not just `animate-pulse`). The skeleton matches the exact layout dimensions of `ChurchCard` (aspect ratio, text line heights, spacing) so there's zero layout shift on load. Includes a `ChurchCardSkeletonGrid` wrapper that matches both `grid` and `sidebar` variants. Updated `ChurchList` to use the new component.
- **Tailwind config:** Added `shimmer` keyframe animation to `tailwind.config.ts`.

**Files Changed:**

- `server/prisma/schema.prisma` (updated — PostGIS extension + location column)
- `server/prisma/migrations/20260327000000_init/migration.sql` (new — full initial migration)
- `server/prisma/migrations/migration_lock.toml` (new — Prisma migration lock)
- `server/prisma/seed.ts` (rewritten — PostGIS-aware, better types, more seed data)
- `client/src/components/church/ChurchCardSkeleton.tsx` (new — shimmer skeleton)
- `client/src/components/church/ChurchList.tsx` (updated — uses ChurchCardSkeletonGrid)
- `client/tailwind.config.ts` (updated — shimmer keyframe)

**To activate the database:**

```bash
# From the project root
docker compose up -d
cd server
npx prisma migrate deploy
npx prisma db seed
```

**Next Steps:**

- Run `docker compose up` on host machine to start PostgreSQL
- Apply migration and seed the database
- Swap the in-memory data layer for Prisma queries (church.service.ts)
- Begin Milestone 2 (User Accounts & Reviews)

---

### 2026-03-27 — Mapbox GL JS Integration with Clustering & Viewport Querying

**Focus:** Built the full interactive map — the biggest remaining M1 feature. Covers three P1 tasks at once.

**Completed:**

- **InteractiveMap component:** Full Mapbox GL JS map using `react-map-gl`. Features Airbnb-style name-bubble pins (white with text halo at rest, dark on hover). Pins sync hover state with the ChurchList. Clicking a pin opens a popup card with church name, denomination, rating, distance, next service, and "View profile →" link. Map includes NavigationControl (zoom buttons) and GeolocateControl.
- **Clustering:** GeoJSON source with `cluster: true`, `clusterMaxZoom: 14`, `clusterRadius: 60`. Dark circle clusters show abbreviated count, with three size tiers (18/22/28px radius). Clicking a cluster zooms in to its expansion zoom. Individual pins use `text-allow-overlap: false` to declutter automatically.
- **Viewport-based querying:** Map reports its bounds (sw/ne corners) to the Zustand store via `setMapBounds`. Both the ChurchList and InteractiveMap use the `bounds` query parameter when available, so the list and map always show the same churches. Bounds updates are debounced (300ms) to avoid excessive API calls while panning.
- **Graceful fallback:** Created `MapContainer` that lazy-loads the InteractiveMap only when `VITE_MAPBOX_TOKEN` is set. Without a token, the existing SVG `MapPlaceholder` renders as before. The mapbox-gl bundle is code-split via `React.lazy`.
- **Store update:** Added `mapBounds` and `setMapBounds` to the Zustand search store. ChurchList now uses bounds for filtering when the map viewport is available.
- **Popup styling:** Added Mapbox popup CSS overrides in `index.css` matching the Airbnb card aesthetic (rounded corners, shadow, clean close button).

**Files Changed:**

- `client/src/components/map/InteractiveMap.tsx` (new — full Mapbox map with clustering, viewport querying, popups)
- `client/src/components/map/MapContainer.tsx` (new — smart switcher: real map vs placeholder)
- `client/src/stores/search-store.ts` (updated — added MapBounds type, mapBounds state, setMapBounds action)
- `client/src/components/church/ChurchList.tsx` (updated — uses mapBounds for viewport-based list filtering)
- `client/src/pages/SearchPage.tsx` (updated — uses MapContainer instead of MapPlaceholder)
- `client/src/index.css` (updated — Mapbox popup styling)

**To activate the map:**

- Set `VITE_MAPBOX_TOKEN=pk.your_token_here` in `client/.env`
- Run `npm run dev` — the map will load automatically

**Next Steps:**

- Get a Mapbox token and test the live map
- Start Docker PostgreSQL + Prisma migrations for persistent data
- Begin Milestone 2 (User Accounts & Reviews)

---

### 2026-03-27 — URL Search State, Responsive Layout & No-Results UX

**Focus:** Three P1/P2 improvements to close out remaining Milestone 1 polish items.

**Completed:**

- **URL-based search state (P1):** Created `useURLSearchState` hook that syncs the Zustand search store with URL search parameters. On page load, URL params (`q`, `denomination`, `day`, `time`, `language`, `amenities`, `sort`, `page`) initialize the store. When the user changes filters, the URL updates in real-time (via `replace` to keep history clean). Search URLs are now shareable and bookmarkable (e.g., `/search?q=baptist&day=0&sort=rating`).
- **Responsive layout (P2):** SearchPage now detects mobile viewport (<768px). On mobile: map is hidden by default (list-first experience), list uses the full-width grid layout instead of sidebar, and the map toggle switches between full-screen map and full-screen list. On desktop: side-by-side layout preserved as before.
- **No-results suggestions (P2):** Replaced the generic "No churches found" empty state with a contextual `NoResults` component. Shows a map-pin icon, an explanation tailored to what's active (query, filters, or both), and up to 3 actionable suggestion buttons (e.g., "Clear filters and keep search", "Remove 'Sunday' filter", "Reset everything"). Primary action is styled with the dark Airbnb-style pill button.

**Files Changed:**

- `client/src/hooks/useURLSearchState.ts` (new — URL ↔ store sync hook)
- `client/src/components/search/NoResults.tsx` (new — contextual empty state)
- `client/src/pages/SearchPage.tsx` (updated — responsive layout + URL state hook)
- `client/src/components/church/ChurchList.tsx` (updated — uses NoResults component)

**Next Steps:**

- Push to GitHub (host-side) and verify CI passes
- Integrate Mapbox GL JS when token is available
- Start Docker PostgreSQL + Prisma migrations for persistent data
- Begin Milestone 2 (User Accounts & Reviews)

---

### 2026-03-27 — CI Pipeline Fix

**Focus:** Fixed GitHub Actions CI pipeline failures — multiple missing configs and dependencies.

**Root Causes Identified:**

1. Missing ESLint plugin devDependencies (never installed — `@typescript-eslint/*`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)
2. No vitest config — `vitest run` failed with no config file
3. No jest config — `jest` failed with no config file
4. No test files in source code — test runners exited with failure
5. CI test job required Prisma migrations that don't exist yet (no `migrations/` directory)

**Completed:**

- Added missing ESLint plugin devDependencies to both client and server `package.json`
- Created `client/vitest.config.ts` with jsdom environment, path aliases, and `passWithNoTests`
- Created `server/jest.config.cjs` with ESM support via ts-jest and `passWithNoTests`
- Added real smoke tests: `client/src/utils/format.test.ts` (format utilities) and `server/src/services/church.service.test.ts` (slug/id lookup)
- Simplified CI test job — removed PostgreSQL service container and Prisma migration step (not needed while using in-memory data layer)
- Updated `client/tsconfig.node.json` to include `vitest.config.ts`

**Files Changed:**

- `client/package.json` (updated — added 4 ESLint plugin devDependencies)
- `server/package.json` (updated — added 2 ESLint plugin devDependencies)
- `client/vitest.config.ts` (new — test runner config)
- `server/jest.config.cjs` (new — test runner config)
- `client/src/utils/format.test.ts` (new — unit tests for format utilities)
- `server/src/services/church.service.test.ts` (new — unit tests for church service)
- `.github/workflows/ci.yml` (updated — removed Postgres/Prisma from test job)
- `client/tsconfig.node.json` (updated — added vitest.config.ts to includes)

**Action Required:**

- Run `npm install` in both `client/` and `server/` to install new ESLint deps and update lockfiles
- Then push to trigger CI

---

### 2026-03-27 — Church Profile Page (F1.3)

**Focus:** Built the Church Profile Page — the last major feature for Milestone 1.

**Completed:**

- Created `ChurchProfilePage` component with all spec'd sections:
  - Hero section with gradient header, denomination badge, star rating, claimed badge, address
  - About section with description, pastor name, year established
  - Service schedule grouped by day with formatted times, service type, and language
  - Languages and amenities sections with styled badges
  - Location section with address, map placeholder, and Google Maps directions link
  - Contact section with clickable phone, email, and website links
  - Loading skeleton for smooth UX while data fetches
  - 404 error state with back-to-search navigation
- Added `/churches/:slug` route in App.tsx
- Wired ChurchCard clicks (list view) to navigate to profile page via React Router
- Wired MapPlaceholder pin clicks to navigate to profile page
- Updated Header with React Router `<Link>` for proper SPA navigation (logo + Search link)

**Files Changed:**

- `client/src/pages/ChurchProfilePage.tsx` (new — full profile page with all sections)
- `client/src/App.tsx` (updated — added profile route)
- `client/src/components/church/ChurchList.tsx` (updated — navigate on card click)
- `client/src/components/map/MapPlaceholder.tsx` (updated — navigate on pin click)
- `client/src/components/layout/Header.tsx` (updated — React Router links)

**Next Steps:**

- Test end-to-end on host machine (npm run dev)
- Integrate Mapbox GL JS (replace placeholder map)
- Add responsive layout / mobile breakpoints
- Start on Milestone 2 (User Accounts & Reviews)

---

### 2026-03-27 — GitHub Repository Setup

**Focus:** Created the GitHub repo and pushed all project code.

**Completed:**

- Created public GitHub repo at https://github.com/Mhartsuch/sa-church-finder
- Fixed broken `.git` reference (pointed to expired Cowork session)
- Reinitialized local git repo on `main` branch
- Created README.md with project overview and tech stack summary
- Added GitHub CI/CD workflows (`ci.yml`, `deploy.yml`), PR template, and branching strategy docs
- Created setup script (`scripts/setup-github.bat`) for Windows to push initial commit
- Pushed all 72 project files to GitHub as initial commit
- Updated PROJECT_CONTEXT.md with GitHub link and current status

**Discovered / Notes:**

- Cowork VM cannot push to GitHub (proxy blocks HTTPS git operations) — must push from host machine
- Windows host does not have WSL installed — use `.bat` scripts, not `.sh`
- Project folder is at: `C:\Users\mhart\Documents\Claude\Projects\Project Configurator\sa-church-finder`
- GitHub username: Mhartsuch

**Files Changed:**

- `PROJECT_CONTEXT.md` (updated — added GitHub link, updated status)
- `PROGRESS.md` (updated — added this session log)
- `TODO.md` (updated — marked GitHub tasks complete)
- `README.md` (new — created on GitHub)
- `scripts/setup-github.bat` (new — Windows setup script)
- `scripts/setup-github.sh` (new — Linux/Mac setup script)
- `.github/workflows/ci.yml` (already existed from prior session)
- `.github/workflows/deploy.yml` (already existed from prior session)
- `.github/pull_request_template.md` (already existed from prior session)
- `docs/BRANCHING_STRATEGY.md` (already existed from prior session)

**Next Steps:**

- Build Church Profile Page (F1.3)
- Integrate Mapbox GL JS (replace placeholder map)
- Start Docker PostgreSQL and run Prisma migrations when ready for persistent data

---

### 2026-03-27 — Install, Build Verification & Bug Fixes

**Focus:** Got the project running end-to-end on local machine for the first time.

**Completed:**

- Installed all npm dependencies (root, client, server) — everything resolved successfully
- Both dev servers start and run together via `npm run dev` (concurrently)
  - Vite frontend at http://localhost:5173
  - Express backend at http://localhost:3001
- Created `server/.env` with DATABASE_URL matching docker-compose.yml
- Fixed ChurchList onClick type mismatch (was passing `() => void` where `(slug: string) => void` was expected)
- Fixed sort dropdown using `as any` — now calls typed `setSort` action from Zustand store
- Audited all config files (tsconfig, vite, tailwind, postcss, eslint) — all correct
- Verified all server imports use `.js` extensions for NodeNext module resolution
- Confirmed server runs without Postgres (in-memory data layer with 22 churches)
- App loads and is functional in the browser

**Discovered / Notes:**

- Some npm deprecation warnings (eslint 8, multer 1.x CVE, inflight) — non-blocking, can upgrade later
- 13 moderate vulns in client, 30 vulns in server (mostly transitive dep issues) — not urgent
- Docker not needed for initial dev — in-memory data layer works standalone
- Sandbox environment (Cowork VM) cannot run npm install or Docker — must be done on host machine

**Files Changed:**

- `server/.env` (new — created from .env.example with Docker DB URL)
- `client/src/components/church/ChurchList.tsx` (fixed onClick type + sort dropdown)

**Next Steps:**

- Build Church Profile Page (F1.3)
- Integrate Mapbox GL JS (replace placeholder map)
- Start Docker PostgreSQL and run Prisma migrations when ready for persistent data
- Polish UI/UX (loading skeletons, responsive layout, no-results state)

---

### 2026-03-26 — Milestone 1: Search + Map + List View

**Focus:** Built the core Milestone 1 features — search API, map placeholder, and list view.

**Completed:**

- Built full search API with in-memory data layer (22 San Antonio churches)
  - Haversine distance calculation, text search, denomination/day/time/language/amenities filters
  - Sorting (distance, rating, name) and pagination
  - Bounding box support for viewport-based queries
  - Zod validation schemas for all query params
- Built frontend SearchPage with three-panel layout:
  - SearchBar with 300ms debounce
  - FilterPanel with collapsible denomination/day/time/language/amenities filters
  - MapPlaceholder with SVG-rendered pins (interactive hover/select)
  - ChurchList with cards showing name, denomination, rating, distance, next service, amenities
  - Pagination and sort controls
- Created Zustand store for search state (query, filters, sort, page, hovered/selected church, map center)
- Created React Query hooks with 60s stale time
- Created API client layer with proper response envelope handling
- Created utility functions (formatDistance, formatRating, formatServiceTime, getNextService)
- Added proper TypeScript types for both frontend and backend

**In Progress (not finished):**

- npm dependencies not yet installed (requires npm registry access)
- Mapbox integration deferred (placeholder map in use)
- Church Profile Page (Milestone 1, Feature F1.3) not yet started

**Files Changed:**

- `server/src/types/church.types.ts` (new)
- `server/src/data/churches.ts` (new — 22 churches with services)
- `server/src/services/church.service.ts` (new)
- `server/src/services/church-detail.service.ts` (new)
- `server/src/schemas/church.schema.ts` (new)
- `server/src/routes/church.routes.ts` (updated — real search logic)
- `server/src/routes/auth.routes.ts` (updated — fixed unused vars)
- `client/src/types/church.ts` (new)
- `client/src/constants/index.ts` (new)
- `client/src/api/churches.ts` (new)
- `client/src/hooks/useChurches.ts` (new)
- `client/src/stores/search-store.ts` (new)
- `client/src/utils/format.ts` (new)
- `client/src/components/layout/Header.tsx` (new)
- `client/src/components/church/ChurchCard.tsx` (new)
- `client/src/components/church/ChurchList.tsx` (new)
- `client/src/components/map/MapPlaceholder.tsx` (new)
- `client/src/components/search/SearchBar.tsx` (new)
- `client/src/components/search/FilterPanel.tsx` (new)
- `client/src/pages/SearchPage.tsx` (new)
- `client/src/App.tsx` (updated)
- `QUICKSTART.md` (updated)

**Next Steps:**

- Run `npm install` in client/ and server/
- Start Docker PostgreSQL, run migrations and seed
- Start dev servers and verify end-to-end
- Add Mapbox when token is available
- Build Church Profile Page (F1.3)

---

### 2026-03-26 — Project Planning & Configuration

**Focus:** Set up the complete planning documentation suite for the SA Church Finder project.

**Completed:**

- Created full project scaffold with all planning documents
- Defined system architecture (React + Express + PostgreSQL/PostGIS + Mapbox)
- Wrote detailed feature specifications across 4 milestones
- Designed complete data model with 9 tables and relationships
- Specified REST API with all endpoints, params, and response formats
- Established coding conventions and naming standards
- Documented 5 key architectural decisions with rationale
- Created recommended project instructions for Cowork

**In Progress (not finished):**

- Nothing — planning phase complete

**Discovered / Notes:**

- PostGIS is well-supported on Railway and Render managed PostgreSQL
- Mapbox free tier (50K loads/month) should be sufficient through beta
- Church dataset for San Antonio estimated at 2,000–5,000 listings
- Consider Google Places API or Data.sa.gov for initial seed data

**Files Changed:**

- All files in `sa-church-finder/` (created)

**Next Steps:**

- Set up monorepo with `client/` and `server/` directories
- Initialize React + Vite + TypeScript frontend
- Initialize Express + TypeScript + Prisma backend
- Create Prisma schema from DATA_MODELS.md
- Write database seed script with sample San Antonio church data

---
