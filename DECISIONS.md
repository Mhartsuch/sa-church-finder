# Decision Log

> Records significant decisions made during this project. Prevents future sessions from re-litigating settled questions or unknowingly contradicting past choices.

## How to Use This File
- Add a new entry when a meaningful decision is made (architecture, tool choice, scope change, etc.)
- Include the reasoning — future agents need to understand WHY, not just WHAT
- Mark decisions as `ACTIVE`, `SUPERSEDED`, or `REVISIT`

---

## Decisions

### DEC-011: Keep auth preview links as an explicit fallback even after SMTP delivery is added
- **Date:** 2026-03-29
- **Status:** ACTIVE
- **Decision:** Add real SMTP-backed delivery for password reset and email verification emails, but keep the existing opt-in preview-link flags as a local-development fallback instead of replacing them outright.
- **Alternatives Considered:** Remove preview links entirely once SMTP existed; keep preview-only auth email flows and postpone SMTP again; fail every auth-email request whenever SMTP delivery throws, including forgot-password.
- **Reasoning:** The preview-link flow was already useful for local development and QA, especially when a developer is not pointing at a real mail provider. Keeping it explicit and disabled by default preserves that speed without normalizing insecure behavior in shared environments. The forgot-password endpoint also needs to preserve its generic anti-enumeration response shape, so SMTP failures there should not change the public API contract per-account.
- **Consequences:** Auth flows now support real SMTP delivery and safer local fallbacks at the same time. Live environments still need SMTP credentials configured, and authenticated resend requests will surface a configuration problem when neither SMTP nor preview fallback is available.

### DEC-010: Layer Google OAuth onto the existing custom session flow instead of adding Passport session state
- **Date:** 2026-03-29
- **Status:** ACTIVE
- **Decision:** Implement Google sign-in as a server-initiated OAuth authorization-code flow on top of the app's existing `express-session` user session, with callback state stored in session, safe `returnTo` redirects, and automatic account linking when a verified Google email matches an existing user.
- **Alternatives Considered:** Wire in Passport's Google strategy plus serialize/deserialize session handling; move Google auth to a frontend token-first flow with Google Identity Services; require a separate manual account-linking step for existing local users.
- **Reasoning:** The live auth stack was already custom and session-based, so adding Passport session lifecycle on top would have introduced duplicate auth plumbing for a single feature. A direct backend OAuth flow matches the existing `/auth/google` and `/auth/google/callback` API shape, keeps Google login consistent with the app's current cookie session model, and lets existing local users sign in with Google without creating duplicate accounts.
- **Consequences:** Each environment now needs valid Google OAuth credentials and a matching authorized redirect URI before live sign-in will work there. Login and register screens use a full-page redirect to the backend, and callback failures return users to the frontend login page with query-based messaging.

### DEC-009: Ship email verification now with a safe local preview resend path before SMTP is wired
- **Date:** 2026-03-28
- **Status:** ACTIVE
- **Decision:** Implement persisted email-verification tokens, register-time issuance, resend and consume endpoints, and a real `/verify-email` frontend flow now, while exposing preview verification links only through an opt-in development flag (`AUTH_EXPOSE_VERIFICATION_PREVIEW=true`).
- **Alternatives Considered:** Keep email verification blocked until full SMTP delivery existed; expose verification preview URLs by default in non-production responses; postpone token issuance until a separate mail subsystem was finished.
- **Reasoning:** Email verification was one of the last major Milestone 2 auth gaps, and most of its product and security value comes from the token lifecycle and UI flow rather than the transport itself. Shipping the token model, resend controls, and verification page now lets the app exercise the real behavior locally, keeps preview-link exposure explicit, and avoids stalling progress on unrelated third-party email wiring.
- **Consequences:** Registration now creates a verification token immediately, but local developers should use the account resend action to surface preview links intentionally. Real SMTP delivery remains a shared follow-up for both password reset and verification.

### DEC-008: Embed viewer helpful-vote state directly in church review payloads
- **Date:** 2026-03-28
- **Status:** ACTIVE
- **Decision:** Include `viewerHasVotedHelpful` on each review returned by church review listing endpoints instead of making the client perform a separate vote-state lookup per review card.
- **Alternatives Considered:** Add a dedicated endpoint for the current viewer's helpful votes; make the client infer vote state only from mutation responses until a refresh.
- **Reasoning:** Helpful voting needed to feel immediate on church profile pages without turning every review list into an N+1 fetch problem on the frontend. Returning viewer-specific vote state alongside the reviews keeps the UI simple, preserves a single source of truth for the button state, and works cleanly with the existing React Query invalidation pattern.
- **Consequences:** Review payloads are now session-aware, so server tests and client types need to keep this extra boolean in sync. Account review history keeps the field but defaults it to `false` because those screens do not currently expose helpful-vote actions.

### DEC-007: Ship password recovery now with an opt-in local preview before SMTP is wired
- **Date:** 2026-03-28
- **Status:** ACTIVE
- **Decision:** Implement the forgot/reset password flow now with persisted reset tokens, real reset pages, and an opt-in development preview link (`AUTH_EXPOSE_RESET_PREVIEW=true`) instead of waiting for a production-grade SMTP integration before shipping the feature foundation.
- **Alternatives Considered:** Block the entire password recovery feature until SMTP delivery was fully integrated; expose reset tokens by default in non-production responses.
- **Reasoning:** Password recovery was the highest-value remaining Milestone 2 auth slice that could be completed locally without third-party credentials. Shipping the backend token lifecycle and frontend reset UX now unblocks real app progress, while keeping preview-link exposure explicit and disabled by default avoids normalizing insecure behavior in shared environments.
- **Consequences:** Real outbound email delivery remains a follow-up shared with email verification, but password reset now has stable API/UI contracts and can already be exercised safely in local development when preview mode is intentionally enabled.

### DEC-006: Ship reviews for signed-in users first and preserve imported aggregates incrementally
- **Date:** 2026-03-28
- **Status:** ACTIVE
- **Decision:** Launch the reviews MVP for any authenticated session-backed user now, before the email verification flow is finished, and update church `avgRating` / `reviewCount` incrementally from the stored aggregate values instead of recomputing from only the small written-review table.
- **Alternatives Considered:** Block review creation until email verification is complete; recompute church aggregates exclusively from rows in the `reviews` table on every write.
- **Reasoning:** Review creation/history was the clearest next Milestone 2 product slice and was already scaffolded in the schema, account page, and church profile page. Waiting on email verification would keep the feature unusable, while recomputing aggregates from the current `reviews` table would immediately wipe out the imported rating/count baselines that still power discovery surfaces. This approach lets real written reviews go live now without collapsing the existing score signals.
- **Consequences:** Email verification remains a follow-up tightening step rather than a launch blocker for reviews. Public church pages need to distinguish written SA Church Finder reviews from the broader imported aggregate score/count when those numbers differ.

### DEC-001: React + Node.js/Express over Next.js
- **Date:** 2026-03-26
- **Status:** ACTIVE
- **Decision:** Use separate React SPA (Vite) and Express API server instead of a full-stack Next.js app.
- **Alternatives Considered:** Next.js 14 with App Router and API routes; Remix; Astro.
- **Reasoning:** Cleaner separation of frontend and backend for independent scaling and deployment. Express gives more control over middleware, session management, and the Passport.js auth flow. The team has stronger Express experience. Next.js SSR/RSC adds complexity that isn't needed for the MVP — Mapbox rendering is client-side anyway.
- **Consequences:** No built-in SSR for SEO. Will need to add pre-rendering or a meta-tag service for church profile pages. Frontend and backend deploy as separate services.

### DEC-002: PostgreSQL + PostGIS for geospatial queries
- **Date:** 2026-03-26
- **Status:** ACTIVE
- **Decision:** Use PostgreSQL with PostGIS extension for all spatial search operations.
- **Alternatives Considered:** MongoDB with geospatial indexes; Elasticsearch for search; separate geocoding API.
- **Reasoning:** PostGIS is the gold standard for geospatial queries and integrates natively with PostgreSQL. Keeps the stack simpler (one database). Prisma supports PostgreSQL well. Avoids adding a separate search service for the MVP — PostgreSQL full-text search with trigram indexes is sufficient for the initial dataset size (~2,000–5,000 churches in SA metro).
- **Consequences:** Requires PostGIS extension on managed database (supported on Railway/Render). Some Prisma operations may need raw SQL for advanced PostGIS functions.

### DEC-003: Mapbox over Google Maps
- **Date:** 2026-03-26
- **Status:** ACTIVE
- **Decision:** Use Mapbox GL JS for all mapping functionality.
- **Alternatives Considered:** Google Maps JavaScript API; Leaflet + OpenStreetMap; deck.gl.
- **Reasoning:** Mapbox offers better customization (map styles that match the app's brand), built-in clustering, smoother WebGL rendering, and more generous free tier (50,000 map loads/month). Geocoding API included. The Airbnb-style aesthetic is easier to achieve with Mapbox's design tools.
- **Consequences:** Requires Mapbox account and API token. Need `react-map-gl` wrapper for React integration. Geocoding accuracy should be tested against San Antonio addresses specifically.

### DEC-004: Session-based auth over JWT
- **Date:** 2026-03-26
- **Status:** ACTIVE
- **Decision:** Use server-side sessions with HTTP-only cookies instead of JWT tokens.
- **Alternatives Considered:** JWT with refresh tokens; Auth0/Clerk managed auth.
- **Reasoning:** Sessions are simpler to implement securely, support immediate invalidation (logout works instantly), and avoid the common JWT pitfalls (token storage in localStorage, refresh token rotation complexity). The app has a single backend server, so session state is straightforward. Managed auth (Auth0) was overkill for the MVP budget.
- **Consequences:** Session store needs PostgreSQL adapter (`connect-pg-simple`). CORS configuration requires `credentials: include` on frontend. Not suitable for a multi-server setup without a shared session store (Redis) — but not needed for MVP scale.

### DEC-005: Cloudinary for image hosting
- **Date:** 2026-03-26
- **Status:** ACTIVE
- **Decision:** Use Cloudinary for all church photo storage, optimization, and delivery.
- **Alternatives Considered:** AWS S3 + CloudFront; Imgur API; self-hosted.
- **Reasoning:** Cloudinary provides automatic image optimization (WebP/AVIF), responsive transformations (thumbnail generation), and global CDN — all critical for an image-heavy listing app. Free tier (25GB storage, 25GB bandwidth) is sufficient for MVP. Upload widget simplifies the church admin photo management.
- **Consequences:** External dependency for all images. Need Cloudinary SDK on the backend for secure uploads. Should store both the Cloudinary public_id and the full URL in the database for flexibility.

---
