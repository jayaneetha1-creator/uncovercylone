# UncoverCeylon Master Task Checklist (TASKS.md)

This checklist covers every requirement specified in `MASTER_SPEC.md`, broken down by phase. Each item has a concrete, verifiable one-line acceptance test. Items are ticked only after actual verification.

---

## Phase 0: Recon & Safety Net
- [x] **T0.1 Branch Setup**: Create and switch to git branch `feature/master-build`.
  *Acceptance Test*: `git branch --show-current` returns `feature/master-build`.
- [x] **T0.2 Safe Backup**: Create snapshot of `data/` and `public/uploads/` in `backup_phase0/`.
  *Acceptance Test*: `backup_phase0/data/uncoverceylon.db` and all uploaded images exist and match checksums.
- [x] **T0.3 Architecture Summary**: Write 15-line architecture overview in `docs/ARCHITECTURE_CURRENT.md`.
  *Acceptance Test*: File exists and contains exactly 15 numbered summary points.
- [x] **T0.4 Cleanup Inventory**: Write audit of stray files, unused components, and logs in `CLEANUP_REPORT.md`.
  *Acceptance Test*: File lists stray root files, scripts, and logs without executing premature deletion.
- [x] **T0.5 Foundations Documents**: Create `DECISIONS.md` and `REQUIREMENTS_TRACE.md`.
  *Acceptance Test*: Both documents exist, tracking all architectural decisions and requirements R01–R41.
- [x] **T0.6 Baseline Performance & Build Check**: Verify baseline build with `npm run build` and measure initial load.
  *Acceptance Test*: `npm run build` exits with code 0 and all 23 baseline routes compile.

---

## Phase 1: Database Migration (SQLite → MySQL)
- [ ] **T1.1 MySQL DAL Architecture**: Create MySQL connection pool and unified data access layer in `src/lib/db.ts` with submodules `src/lib/db/users.ts` and `src/lib/db/locations.ts`.
  *Acceptance Test*: Querying both user and location modules succeeds without circular dependencies.
- [ ] **T1.2 Versioned Migrations**: Create `db/migrations/001_init.sql` with full schema (users, places, reviews, slides, settings, logs) using `utf8mb4_unicode_ci`.
  *Acceptance Test*: Running migration runner `npm run db:migrate` creates all required tables and foreign key indexes.
- [ ] **T1.3 Data Migration Script**: Create `scripts/migrate-sqlite-to-mysql.js` transferring all data from SQLite into MySQL with row-count verification.
  *Acceptance Test*: Script outputs matching row counts for places (61), reviews, hero slides, and settings.
- [ ] **T1.4 Dual-Engine Compatibility Fallback**: Allow switching between SQLite (local development fallback) and MySQL via `DATABASE_URL` / `DB_TYPE` env flag.
  *Acceptance Test*: App compiles and serves data correctly regardless of configured database engine.
- [ ] **T1.5 Owner SQL Console & Table Browser**: Implement secure SQL console in Admin with password re-entry, DROP protection, automatic pre-backup, and row-level browser.
  *Acceptance Test*: Non-owner cannot access SQL console; write queries create an automatic backup entry before running.
- [ ] **T1.6 Database Setup Documentation**: Create `docs/DB_SETUP.md` with instructions for local MySQL installation, Docker command, and VPS deployment.
  *Acceptance Test*: Documentation provides working copy-paste setup commands for Ubuntu and Windows.

---

## Phase 2: Authentication & Profile
- [ ] **T2.1 Users Table & Role Architecture**: Establish 4 user roles (`owner`, `developer`, `uploader`, `user`) with bcrypt password hashing.
  *Acceptance Test*: Password hashes verified against bcrypt; role column restricted to the 4 valid enum values.
- [ ] **T2.2 Email Registration & Verification Flow**: Build registration endpoint sending 24h single-use signed verification tokens via `nodemailer`.
  *Acceptance Test*: Registering an account generates token; clicking link changes status from `unverified` to `active`.
- [ ] **T2.3 Mailer Abstraction (Gmail / SMTP)**: Create `src/lib/mailer.ts` supporting Gmail App Passwords and custom SMTP with test email sender.
  *Acceptance Test*: Calling mailer test endpoint sends email successfully or reports clear SMTP configuration guidance.
- [ ] **T2.4 Session Management**: Secure HTTP-only SameSite cookie sessions (`uc_session`) with server-side DB session tracking.
  *Acceptance Test*: Logging in sets secure cookie; logging out invalidates session in database.
- [ ] **T2.5 User Profile Page (`/profile`)**: Build user profile allowing name, country, password changes, and displaying saved places and trips.
  *Acceptance Test*: Logged-in user sees avatar in nav; visiting `/profile` allows updating profile data.
- [ ] **T2.6 Google OAuth Backend**: Implement Google OAuth 2.0 flow with feature flag (enabled only when client keys are configured).
  *Acceptance Test*: Button appears when keys are present; OAuth exchange links or creates user account.
- [ ] **T2.7 Staff Login (`/admin/login`)**: Dedicated staff login with role-based routing (staff to `/admin`, standard users to `/profile`).
  *Acceptance Test*: Logging in with staff credentials routes to `/admin`; standard user routes to `/`.
- [ ] **T2.8 Password Reset Flow**: Forgot password request sends time-limited reset link to verified email.
  *Acceptance Test*: Submitting reset form updates password and invalidates previous session tokens.

---

## Phase 3: Permissions, Requests, Notifications & Audit
- [ ] **T3.1 Permissions Matrix**: Implement single source of truth in `src/lib/permissions.ts` enforcing Section 4.4 capability matrix.
  *Acceptance Test*: Server-side API guard rejects unauthorized role operations with HTTP 403.
- [ ] **T3.2 Deletion Request Workflow**: Enforce owner-only deletion; developer/uploader delete actions create pending `change_requests`.
  *Acceptance Test*: Developer clicking delete creates a change request; item remains active until owner approves.
- [ ] **T3.3 Soft Deletion & 30-Day Trash**: Implement `trash` table with 30-day retention and one-click restore for the owner.
  *Acceptance Test*: Approved delete moves item to Trash; clicking Restore returns it to active places without data loss.
- [ ] **T3.4 Version History & Revert**: Store revision snapshots in `versions` table for edits made by staff with one-click rollback.
  *Acceptance Test*: Editing a destination logs previous state; clicking Revert restores previous content.
- [ ] **T3.5 Notification Engine**: In-app bell notification dropdown with unread badge counter, mark-as-read, and 15s polling.
  *Acceptance Test*: Triggering a system event (e.g. new user or delete request) increments unread badge.
- [ ] **T3.6 Audit Logging**: Log every state-changing administrative action (user, action, target, timestamp, IP) in `audit_log`.
  *Acceptance Test*: Admin actions create an audit log entry viewable in Admin Audit tab.

---

## Phase 4: Admin Shell, Folder Manager & File Map
- [ ] **T4.1 Modern Admin Shell**: Build responsive admin layout with sidebar, mobile bottom bar, and tidy "+" popovers for secondary actions.
  *Acceptance Test*: All 16 admin tabs render with consistent header, breadcrumb, and clean hierarchy.
- [ ] **T4.2 Folder Manager (`site_nodes`)**: Tree-view controller for all main pages and sections with drag-reorder and on/off switches.
  *Acceptance Test*: Reordering or disabling a node in Admin updates `site_nodes` and revalidates cache.
- [ ] **T4.3 Zero-Gap DOM Unmounting**: Ensure disabled nodes render nothing on public pages (no empty containers, margins, or dead links).
  *Acceptance Test*: Inspecting DOM of disabled section confirms 0 elements and no orphaned layout gaps.
- [ ] **T4.4 Theme Controller**: In-browser design token editor modifying CSS variables (colors, fonts, radius, seasonal presets) with AA contrast check.
  *Acceptance Test*: Changing primary color updates CSS variables instantly; low contrast triggers a visual warning.
- [ ] **T4.5 File Map Viewer**: Read-only interactive file tree in Admin with plain-English descriptions loaded from `docs/FILE_MAP.json`.
  *Acceptance Test*: Admin File Map displays directory tree; sensitive files (.env, secrets) are completely hidden.
- [ ] **T4.6 Collapsible Folder UI Primitive**: Build accessible `Folder` component with chevron indicator and smooth height animation.
  *Acceptance Test*: Clicking folder header toggles content smoothly with proper `aria-expanded` attributes.

---

## Phase 5: Places, Media Optimizer, Approvals & Customer Chat
- [ ] **T5.1 Admin Audit & Places Manager**: Write `ADMIN_AUDIT.md` and rebuild Places tab with search, filters, and modal editor.
  *Acceptance Test*: Editing a destination opens modal with essential fields; advanced fields toggle behind "+".
- [ ] **T5.2 Slides Manager**: Rebuild Hero and Region slides manager with drag reorder, photo replacement, and EN/SI text fields.
  *Acceptance Test*: Reordering slides updates `sort_order` and reflects in homepage hero slideshow.
- [ ] **T5.3 One-Button Image Optimizer**: Sharp batch optimizer generating responsive WebPs (480/960/1600), stripping EXIF, and storing dimensions.
  *Acceptance Test*: Clicking "Optimize All" converts images to WebP and reports before/after file sizes.
- [ ] **T5.4 Public "Add a Place" & Approvals**: Verified users can submit destinations via `/submit-place` into Admin Approvals queue.
  *Acceptance Test*: Submitted place appears in Admin Approvals; approving it publishes it to the live directory.
- [ ] **T5.5 User Reviews with Photos & Staff Replies**: Full review system with 1–5 stars, up to 5 photos, helpful votes, and official staff responses.
  *Acceptance Test*: Verified user submits review with photo; staff posts reply marked with "Team" badge.
- [ ] **T5.6 Q&A System**: Place Q&A thread allowing visitors to ask questions and staff/users to post answers.
  *Acceptance Test*: Posting question triggers notification; answering question displays with verified user badge.
- [ ] **T5.7 Customer Chat**: Lightweight 1-on-1 messaging thread between logged-in users and staff inside Admin.
  *Acceptance Test*: User messages via floating Help button; message appears in Admin Customer Chat tab for reply.

---

## Phase 6: Public Site Restructure
- [ ] **T6.1 Dynamic Homepage (`/`)**: Rebuild Home from `site_nodes` folders (Hero, Interests, Curated rows, Teasers) without the full grid.
  *Acceptance Test*: Homepage renders only curated sections; disabling a section in Folder Manager removes it cleanly.
- [ ] **T6.2 Destinations Directory (`/destinations`)**: Rebuild listing page per Sec 4.6-B with sticky left filter bar and ranked list rows.
  *Acceptance Test*: Filters update URL query parameters; ranked rows display photo, ratings, season pill, and review snippet.
- [ ] **T6.3 Destination Detail Page (`/places/[id]`)**: Rebuild detail page per Sec 4.6-C with photo mosaic, plan visit card, and collapsible folders.
  *Acceptance Test*: Detail page renders all 11 specified folders; "See all photos" opens lightbox modal.
- [ ] **T6.4 Mobile Viewports & Bottom Sheet Filters**: Mobile layout with bottom tab bar, swipe carousels, and filter drawer.
  *Acceptance Test*: At 390px, filter opens in slide-up bottom sheet with "Apply (N results)" button.
- [ ] **T6.5 Visual & Content Remediation**: Fix issues from Section 3 (remove fake phone numbers, fake verification badges, broken images).
  *Acceptance Test*: Place pages display real validated data; missing photos show branded light-blue fallback.

---

## Phase 7: Analytics & Recommendation Algorithm
- [ ] **T7.1 Event Tracking Engine**: Privacy-conscious event logger tracking views, clicks, saves, directions, and searches in `events`.
  *Acceptance Test*: Interacting with place triggers lightweight beacon saving event without collecting PII.
- [ ] **T7.2 Visitor Journey Paths (JSON)**: Record ordered destination views per session as JSON array; exportable in Admin Analytics.
  *Acceptance Test*: Viewing 3 destinations creates ordered JSON path; Admin allows downloading journey dataset.
- [ ] **T7.3 Admin Analytics Dashboard**: Visual charts for top visited places, weekly trends, search terms with 0 results, and device split.
  *Acceptance Test*: Analytics tab renders responsive charts with time-range filtering (7d/30d/90d).
- [ ] **T7.4 Recommendation Pipeline (`src/lib/recommend.ts`)**: Fast multi-factor engine combining proximity, co-occurrence, and category affinity.
  *Acceptance Test*: Place page renders "Nearby & you might like" carousel with human-readable reason tag.

---

## Phase 8: Ad Manager (5 Placements & AdSense)
- [ ] **T8.1 5 Non-Disruptive Ad Slots**: Implement Sponsored Card, Homepage Slim Banner, Sidebar Partner Card, Carousel Slot, and Footer Strip.
  *Acceptance Test*: Each slot renders only when active; zero DOM elements rendered when switched off.
- [ ] **T8.2 Google AdSense Integration**: Script loader and `public/ads.txt` support, disabled by default via feature flag.
  *Acceptance Test*: AdSense scripts load only when master toggle enabled in Admin Settings.
- [ ] **T8.3 Admin Ad Manager Tab**: CRUD interface for ads with image upload, link, date range, device targeting, and impression tracking.
  *Acceptance Test*: Creating an ad renders it in the specified slot; impressions counter increments on view.

---

## Phase 9: AI Chatbot (Gemini)
- [ ] **T9.1 Server-Side Gemini Client**: Secure API handler with configurable model (default `gemini-2.5-flash`) and encrypted key storage.
  *Acceptance Test*: API endpoint streams responses without exposing API key to browser.
- [ ] **T9.2 Editable System Prompt & Test Console**: Admin interface to modify system instruction with version history and live test chat.
  *Acceptance Test*: Saving prompt updates instructions; bot refuses off-topic queries outside Sri Lanka tourism.
- [ ] **T9.3 Read-Only Parameterized DB Tools**: Whitelisted function calling (search places, get details, nearby, category filter).
  *Acceptance Test*: Bot queries real places data; cannot access user tables, passwords, or write operations.
- [ ] **T9.4 Left Slide-In UI & Page Context**: Desktop left drawer and mobile sheet with `@place` autocomplete and example chips.
  *Acceptance Test*: Clicking "Plan with AI" on Sigiriya page automatically passes Sigiriya as context to bot.
- [ ] **T9.5 Rate Limiting & Guest Limits**: Enforce 2-message limit for guests and daily quotas for signed-in users.
  *Acceptance Test*: Third message from guest shows friendly "Sign in to continue" modal.
- [ ] **T9.6 AI Trip Itinerary Proposals**: Bot generates structured itinerary cards with "Add to my trip" button.
  *Acceptance Test*: Clicking "Add to my trip" calls authenticated trip API to save places into user's planner.

---

## Phase 10: AI News Page (Sri Lanka Tourism)
- [ ] **T10.1 Public News Hub (`/news`) & Home Teaser**: Clean news page with category chips, source badges, and light-blue styling.
  *Acceptance Test*: Visiting `/news` renders published articles with source attribution and date.
- [ ] **T10.2 Scheduled Gemini News Crawler**: Crawler running 3x/day using Search grounding for verified tourism updates.
  *Acceptance Test*: Triggering news crawler fetches real news items, summarizes in own words, and links related places.
- [ ] **T10.3 Admin News Moderation**: Review queue with toggle for "auto-publish vs review first", pin, hide, and schedule editor.
  *Acceptance Test*: Admin can edit, pin, or hide news items; failure alerts sent to notifications.

---

## Phase 11: Trip Planner (Trip To-Do List)
- [ ] **T11.1 Dedicated Planner Page (`/trips`)**: Manage multiple trips with custom dates, reorderable places, notes, and visited checkboxes.
  *Acceptance Test*: User creates trip, adds places, drags to reorder, and marks destinations as visited.
- [ ] **T11.2 Interactive Map Integration**: Split-screen map side panel showing active trip route, numbered pins, and travel distances.
  *Acceptance Test*: Adding a destination plots a connecting route line on the map with estimated distances.
- [ ] **T11.3 Guest LocalStorage to Cloud Sync**: Unauthenticated users can draft trips locally; signing in syncs trip to user account.
  *Acceptance Test*: Creating trip as guest and logging in transfers trip data into database.
- [ ] **T11.4 Co-Occurrence Trip Recommendations**: Suggest places based on co-occurrence in other travelers' itineraries.
  *Acceptance Test*: Trip planner displays "Travelers who planned this trip also added..." suggestions.
- [ ] **T11.5 Shareable Link & Export View**: Generate read-only trip URLs and print-friendly itinerary view.
  *Acceptance Test*: Opening shared link in incognito mode displays read-only trip without editing controls.

---

## Phase 12: About Page Rebuild
- [ ] **T12.1 Editable Block Architecture**: Rebuild `/about` from configurable blocks (Hero, Village Story, Photos, Values, Team, Contact).
  *Acceptance Test*: Updating story text in Admin About Editor reflects immediately on `/about`.
- [ ] **T12.2 Founder Village Story Placeholder**: Thoughtful placeholder honoring founder's village with "SERANDIB CO." credit.
  *Acceptance Test*: About page displays village narrative placeholder and team credits cleanly.

---

## Phase 13: Performance, Mobile Pass & Full Cleanup
- [ ] **T13.1 Dynamic Imports & Code Splitting**: Lazy-load Leaflet map, charts, rich text editor, and chat panel.
  *Acceptance Test*: Initial JavaScript bundle size reduced; heavy libraries load only on trigger.
- [ ] **T13.2 Zero-CLS Image & Font Optimization**: Ensure all images use fixed aspect ratio containers; subset fonts.
  *Acceptance Test*: Cumulative Layout Shift (CLS) remains < 0.05 across mobile and desktop.
- [ ] **T13.3 Mobile 390px Viewport Audit**: Verify every screen has touch targets ≥ 44px, inputs ≥ 16px, and zero horizontal scroll.
  *Acceptance Test*: Visual verification at 390px, 768px, and 1440px passes without overflow or clipping.
- [ ] **T13.4 Final Cleanup Execution**: Delete verified stray files (`page_output.html`, `address_bar_*.png`, unused scripts) per `CLEANUP_REPORT.md`.
  *Acceptance Test*: Project root is clean; no dead imports remain; `.env` and `data/*.db*` properly git-ignored.
- [ ] **T13.5 Lighthouse Audit Report**: Record final mobile performance scores in `docs/PERFORMANCE.md`.
  *Acceptance Test*: Mobile Performance ≥ 90, Accessibility ≥ 95 on mobile simulation.

---

## Phase 14: Documentation & Final Delivery
- [ ] **T14.1 Deployment Runbook (`docs/DEPLOY.md`)**: Complete guide covering Ubuntu setup, MySQL, PM2, cron jobs, Nginx, and SSL.
  *Acceptance Test*: Followable step-by-step VPS instructions with exact terminal commands.
- [ ] **T14.2 Non-Technical Owner's Guide (`docs/OWNER_GUIDE.md`)**: Friendly guide with Sinhala headings explaining everyday management.
  *Acceptance Test*: Clear, jargon-free guide with screenshots or UI references for all admin tabs.
- [ ] **T14.3 Configuration References**: Finalize `docs/DB_SETUP.md`, `docs/EMAIL_SETUP.md`, and `docs/GOOGLE_LOGIN_SETUP.md`.
  *Acceptance Test*: All credential setup procedures fully documented.
- [ ] **T14.4 Final Engineering Report**: Detailed summary of deliverables, test outcomes, owner action items, and next steps.
  *Acceptance Test*: Comprehensive report delivered and signed off.
