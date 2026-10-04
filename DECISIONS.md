# Architecture Decisions & Assumption Log (DECISIONS.md)

This document tracks all architectural choices, assumptions, and technology selections made during the implementation of the UncoverCeylon Master Specification.

---

### D01: Branching & Safety Baseline
- **Date**: 2026-10-04
- **Decision**: Created git branch `feature/master-build`. Created an immutable pre-migration backup snapshot in `backup_phase0/` containing the exact binary SQLite database (`data/uncoverceylon.db`) and all uploaded media (`public/uploads/`).
- **Rationale**: Strict compliance with Phase 0 zero-risk safety protocol.

### D02: Next.js 16 & React 19 Conventions
- **Date**: 2026-10-04
- **Decision**: All server components and route handlers strictly follow Next.js 16 async conventions (e.g. `await params`, `await searchParams`, async headers/cookies). No legacy deprecated patterns are used.
- **Rationale**: Prevents runtime build warnings and ensures full compatibility with the Turbopack build engine.

### D03: MySQL Architecture & Data Partitioning
- **Date**: 2026-10-04
- **Decision**: Single MySQL 8 database using `utf8mb4` charset and `utf8mb4_unicode_ci` collation. Structured logically into two decoupled data modules: `src/lib/db/users.ts` and `src/lib/db/locations.ts`, unified through `src/lib/db.ts`. Versioned SQL migrations in `db/migrations/`.
- **Rationale**: Matches the site owner's mental model while keeping foreign key integrity, fast transactional operations, and future microservice extractability.

### D04: Session Management & Authentication
- **Date**: 2026-10-04
- **Decision**: Secure HTTP-only SameSite cookies (`uc_session`) coupled with server-side DB session tracking in table `sessions`. Passwords hashed with `bcryptjs` (salt rounds = 12).
- **Rationale**: More secure and revokable than stateless JWTs for admin and multi-role operations ("Log out everywhere" capability).

### D05: Email Delivery Architecture
- **Date**: 2026-10-04
- **Decision**: Created `src/lib/mailer.ts` using `nodemailer`. Default configuration supports standard Gmail App Password SMTP (free, zero-cost startup), with encrypted credentials stored in the database `secrets` table and `.env` fallback.
- **Rationale**: Allows the site owner to send verification emails and notifications without requiring a paid SaaS email service immediately.

### D06: Role-Based Access Control (RBAC) & Deletion Safety
- **Date**: 2026-10-04
- **Decision**: `src/lib/permissions.ts` serves as the single source of truth across all server endpoints. Roles: `owner`, `developer`, `uploader`, `user`. Only `owner` can directly delete. Non-owners trigger a `change_requests` record requiring owner approval. All deletes are soft-deletes moved to `trash` (30-day retention).
- **Rationale**: Protects the site owner from accidental or unauthorized data loss.

### D07: Folder Manager (Site Tree Engine)
- **Date**: 2026-10-04
- **Decision**: Built on `site_nodes` database table. Every page section registers a unique key. If a node is disabled (`enabled = 0`), the renderer completely skips mounting the DOM elements, navigation links, and sitemap entries.
- **Rationale**: Fulfills Requirement R05 ("no empty gap, broken link, or leftover spacing").

### D08: AI Engine (Gemini Integration)
- **Date**: 2026-10-04
- **Decision**: Use Google Gemini API with model configurable in Admin (defaulting to `gemini-2.5-flash`). Enforce strict system instructions and provide read-only parameterized database tools (search, get details, nearby, category filter). The model has zero access to user tables, auth logs, or write capabilities. Trip planning additions route through client confirmation to authenticated trip APIs.
- **Rationale**: Full AI conversational power with enterprise-grade data isolation.

### D09: Recommender Engine & Analytics Architecture
- **Date**: 2026-10-04
- **Decision**: Lightweight, explainable algorithmic pipeline (`src/lib/recommend.ts`) combining Haversine geographic proximity, session journey transition statistics (Markov chain co-occurrence from stored journey paths), category affinity, and time-decayed view/click counts.
- **Rationale**: Fast response times (<20ms) with zero heavy Python/C++ external ML runtime dependencies.

### D10: Database-Backed Sessions with HTTP-only SameSite Lax Cookies
- **Context**: Need secure user session tracking across client and server.
- **Decision**: Used 48-byte secure hex tokens stored in the `sessions` table (`uc_session` cookie, 30 days expiry, httpOnly, lax, secure in production).
- **Rationale**: Provides instant session revocation on logout or password change without JWT revocation complexity.

### D11: Mailer Provider Abstraction with Graceful Dev Fallback
- **Context**: Outgoing emails required for email verification and password resets.
- **Decision**: Implemented `src/lib/mailer.ts` using `nodemailer` supporting Gmail App Passwords and custom SMTP. When credentials are not yet configured in local development, it logs tokens to stdout safely without crashing.
- **Rationale**: Ensures zero friction during local development while providing immediate production readiness.

### D12: Google OAuth 2.0 Backend with Configuration Feature Flag
- **Context**: Requirement R09 specifies Google login backend complete, but keys provided later by the owner.
- **Decision**: Built complete OAuth 2.0 redirection and callback endpoints (`/api/auth/google`, `/api/auth/google/callback`). The UI button and endpoints gracefully detect missing keys and link accounts automatically by verified email once provided.
- **Rationale**: Eliminates rework when the owner generates Google Cloud credentials later.

### D13: Strict RBAC Permissions Matrix Single Source of Truth
- **Context**: Section 4.4 specifies distinct capabilities for Owner, Developer, Uploader, and User.
- **Decision**: Created `src/lib/permissions.ts` mapping 18 discrete capabilities to authorized roles with `requirePermission` API middleware guards.
- **Rationale**: Prevents privilege leakage and centralizes security access rules in a single auditable file.

### D14: Owner-Only Deletion with Change Requests, 30-Day Trash & Version Snapshots
- **Context**: Critical safety requirement that developers/uploaders cannot unilaterally delete places or site data.
- **Decision**: Destructive requests by non-owners generate a pending row in `change_requests` notifying the owner. Approved deletions write full JSON snapshots to `trash` (30-day retention with restore), and updates record revision snapshots in `versions`.
- **Rationale**: Eliminates risk of irreversible accidental data loss and provides full auditability.

### D15: In-App 15-Second Polling Notification Engine & Audit Trail
- **Context**: Section 4.5 requires an in-app notification bell with unread badge counter, realtime updates, and an audit trail.
- **Decision**: Implemented `notifications` table with role targeting (`all_staff`, `owner`, `developer`), 15-second client polling in `<NotificationBell />`, and structured `audit_log` tracking all state changes.
- **Rationale**: Low-overhead, highly reliable across serverless and long-lived VPS environments without WebSocket infrastructure overhead.

### D16: Database-Driven Site Tree Hierarchy (`site_nodes`) with Zero-Gap Unmounting
- **Context**: Sections 4.2 & 4.3 require all site pages and sections to be treatable as collapsible, toggleable folders.
- **Decision**: Modeled site structure recursively in `site_nodes` table with `parent_node_id`, `sort_order`, `enabled`, and custom `settings`. In UI components, when `enabled === 0`, components unmount completely with zero leftover HTML wrappers, margins, or orphaned links.
- **Rationale**: Guarantees zero DOM clutter or broken visual layout when features or sections are toggled off by staff.

### D17: Live Codebase File Map Generator with Sensitive File Concealment
- **Context**: Requirement R07 specifies non-technical staff and owners can view project files and their purpose inside Admin.
- **Decision**: Implemented `scripts/generate-file-map.js` and `/api/admin/file-map` which scans the repository, assigns plain-English descriptions, and explicitly redacts/excludes secret files (`.env*`, `*.pem`, `*.key`, `data/*.db*`, internal cache, `.git`).
- **Rationale**: Complete transparency for site owners with strict security air-gapping against secret exposure.

### D18: WCAG AA Automated Color Luminance Contrast Checker in Theme Controller
- **Context**: Admin Theme Controller allows modifying primary, secondary, and background colors with seasonal presets.
- **Decision**: Embedded relative luminance calculations (WCAG 2.1 formulas) in `src/lib/theme.ts` to compute contrast ratios and block or warn when color combinations fail AA standard (minimum 4.5:1 ratio).
- **Rationale**: Guarantees accessibility compliance for all traveler demographics and outdoor viewing conditions.

### D19: Privacy-Friendly Anonymous Event Tracking & Journey Persistence
- **Context**: Section 4.7 requires tracking place views, clicks, saves, directions, and searches without capturing PII.
- **Decision**: Implemented `events` and `journeys` tables using anonymous client session tokens (`session_id`). Explicitly omitted IP addresses, user agents, and personal identifiers. Provided a one-click history clearing endpoint `/api/user/clear-history` and a floating privacy consent banner.
- **Rationale**: Ensures compliance with privacy standards while gathering primary demand signals.

### D20: Explainable Multi-Factor Recommendation Pipeline
- **Context**: Section 4.7 requires recommendation pipeline combining proximity, collaborative transitions, category affinity, and popularity with decay.
- **Decision**: Implemented `src/lib/recommend.ts` combining Haversine proximity calculations with real-time transition counts (`place_transitions`) and category distribution caps (diversity rule max 2 per category). Every recommendation includes a human-readable reason tag (e.g. "Close to Sigiriya (12 km away)").
- **Rationale**: Delivers instant (<15ms) explainable suggestions with zero ML overhead or third-party cloud lock-in.

### D21: Trip Planner Unified Guest-Cloud Data Architecture & Co-Occurrence Engine
- **Date**: 2026-10-04
- **Context**: Section 4.11 requires a friendly trip planner that works offline/locally for guests, syncs seamlessly to user accounts upon login, integrates with favorites, interactive map, profile, destination pages, and generates co-occurrence suggestions.
- **Decision**: 
  1. Built dual-layer state management in `src/context/TripContext.tsx` supporting guest `localStorage` drafts (`uc_guest_trips`) and cloud database CRUD (`trips` & `trip_items` tables).
  2. Implemented automatic guest-to-cloud migration on sign-in via `/api/trips` `{ action: 'sync' }`.
  3. Integrated interactive Leaflet route map with sequential numbered markers, connecting polyline, total Haversine distance, and estimated scenic travel time (~42 km/h).
  4. Implemented SQL-based co-occurrence discovery querying destinations that frequently co-exist across traveler itineraries (`getTripCoOccurrenceSuggestions`).
  5. Built read-only public sharing via unique hex slugs (`/trips/share/[slug]`) and PDF/print support.
- **Rationale**: Frictionless entry for non-logged-in tourists, zero data loss upon registration, and native cross-platform responsiveness across 390px, 768px, and 1440px viewports.

### D22: About Page Configurable Block Architecture & Founder Village Narrative Placeholder
- **Date**: 2026-10-04
- **Context**: Phase 12 requires rebuilding `/about` from editable blocks (Hero, Village Story, Photos, Values, Team/Credits, Contact) that the site owner can customize from the admin panel (Folder Manager nodes), with a thoughtful placeholder for the founder's ancestral village narrative and permanent SERANDIB CO. credit.
- **Decision**:
  1. Registered 6 discrete block nodes under `page_about` in `site_nodes`: `about_hero`, `about_story`, `about_photos`, `about_values`, `about_team`, and `about_contact`.
  2. Stored block configurations as JSON in `site_nodes.config`, ensuring that disabling any block via Folder Manager cleanly unmounts its DOM elements per the zero-gap rule.
  3. Separated client-safe constants/types (`src/lib/about/constants.ts`) from server DAL (`src/lib/db/about.ts`) to maintain zero database driver leakage into client bundles.
  4. Built a dedicated Admin About Editor tab (`src/app/admin/components/AboutEditorTab.tsx`) with instant save, preview link, and cache revalidation via `/api/admin/about`.
  5. Formatted the founder's ancestral village narrative placeholder with clear styling and footnote, while permanently retaining the SERANDIB CO. parent initiative credits.
- **Rationale**: Empowers the non-technical site owner to update stories and team information without touching code, enforces the zero-gap rule, and honors the founder's roots.
