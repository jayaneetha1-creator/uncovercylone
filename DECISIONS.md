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
