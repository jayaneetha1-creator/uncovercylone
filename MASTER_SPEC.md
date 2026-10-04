# UNCOVERCEYLON — MASTER SPEC (v1)

> Put this file in the project root. The agent must read ALL of it, then follow Section 0.

---

## 0. HOW THE AGENT MUST WORK (read first)

1. Read this whole file in chunks of ~150 lines. Do not skip sections. Re-open the relevant section before starting each phase.
2. Before writing code, create:
   - `TASKS.md`: a checklist containing EVERY requirement in this file, grouped by phase, each with a one-line acceptance test.
   - `DECISIONS.md`: a log of every assumption or decision you make.
3. Work on a new git branch `feature/master-build`. Commit at the end of every phase.
4. Execute phases in order (Section 6). After each phase run `npm run lint`, `npx tsc --noEmit`, `npm run build`, then test at 390px, 768px and 1440px widths. Tick `TASKS.md` only when the acceptance test really passes. Then write a 5-line phase report and continue.
5. Do NOT ask the owner questions unless you are blocked by a missing secret/API key. Otherwise make the most reasonable decision, log it in `DECISIONS.md`, and continue.
6. First read `AGENTS.md`, `CLAUDE.md`, `README.md`, `DESIGN_SYSTEM.md`, `IMAGE_AUDIT.md`, `package.json`, `next.config.ts`. This project uses Next.js 16 / React 19 / Tailwind v4: follow the conventions in those files and the installed Next.js docs, not old habits.
7. If the session is cut off, the next session must start by reading `TASKS.md` and continue from the first unticked item.
8. Never claim something works without running it. If you cannot test something (e.g. Google login needs real keys), say so explicitly in the phase report.
9. **Traceability:** Appendix A lists every requirement from the owner with an ID (R01…). Create `REQUIREMENTS_TRACE.md` mapping each ID to the files, routes and tests that satisfy it. An ID is "Done" only when verified; otherwise mark it "Needs owner input" with the reason. If you notice anything the owner clearly wants that is not in this file, add it to `TASKS.md` and `DECISIONS.md` rather than ignoring it.
10. **Performance budget:** the owner is worried that new technology will make the site slow or laggy, especially on mobile. Measure Lighthouse (mobile) at the end of Phases 6, 9 and 13 and compare with the Phase 0 baseline. A drop of more than 5 points, or any new visible lag, must be fixed before moving on.

---

## 1. PROJECT CONTEXT

UncoverCeylon is a Sri Lanka travel guide (EN/SI). Current stack: Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, SQLite (`better-sqlite3`), Leaflet, Sharp, PWA. Hosted on an Ubuntu VPS with PM2 + Nginx. Existing contexts: Currency, Language, Location, Wishlist. Existing design: light-blue airy theme (`DESIGN_SYSTEM.md`).

**Design philosophy (carry over from the earlier brief, still applies to everything new):**
- Very simple, very smooth, friendly. Calm light-blue theme. Original look; Tripadvisor is only studied for *why* things work, never copied.
- Apply the Fogg Behavior Model on every screen: one target behavior, make it easy (simplicity), give honest motivation, and trigger at the right moment. No dark patterns, no fake urgency.
- Mobile and desktop are designed separately, not just shrunk.

**The site owner is not a programmer.** Everything configurable must be configurable from the admin panel, not by editing code.

### 1.1 Design rules carried over from the earlier brief (apply to every new screen, admin included)

**Behavior design (Fogg Behavior Model: behavior happens when Motivation + Ability + Trigger meet at the same moment).**
- Each screen has ONE target behavior and ONE obvious primary button.
- *Motivation* (honest only): hope (inspiring real photos, "best time to visit"), social acceptance (real ratings, saves, "Travelers' favourites"), pleasure (beautiful correct photography, vivid one-line descriptions), and gentle practical warnings ("Closed on Poya days", "Permit required"). No fake urgency, fake counters or dark patterns.
- *Ability = simplicity*: key facts visible within 2 seconds; any place reachable in 3 taps; price shown early ("Free" badge, LKR with USD); show duration/difficulty/distance when known; thumb-reach actions on mobile; at most ~6 chips visible plus "More"; familiar patterns (heart = save, standard search bar); remember filters, language, currency and favorites.
- *Triggers*: a **spark** (inspire + prompt, e.g. hero tagline + "Start exploring"), a **facilitator** (one-tap Directions, Save with a small toast, "Near me" with a clear permission message), a **signal** (saved-places badge, "Continue exploring" on return). Triggers appear after the user has seen content, never as a popup on arrival.

**Simple and friendly.** The owner wants the site to look very simple and be extremely friendly: plain everyday words (EN and SI), short sentences, large readable text (16px minimum), generous white space, at most two font weights per section, helpful empty states ("Nothing here yet. Try X"), errors that say what to do next, skeleton loaders, small friendly confirmations, icons always paired with labels, the same pattern for the same thing everywhere. When in doubt, remove something instead of adding it.

**Theme tokens (the Theme Controller in Phase 4 edits these):** background `#F5FAFF`, surface `#FFFFFF`, subtle surface `#EAF4FD`, primary `#38A9F0` (hover `#1E93DC`, tint `#DCEFFD`), deep text `#0F2A3D`, secondary text `#5B7385`, border `#DCE8F2`, warm accent `#F5A623` (only for ratings and key highlights), success `#2FB67C`, error `#E5484D`. Font: Inter with Noto Sans Sinhala fallback. 8px grid, 16px card radius, very soft shadows. Motion 150–250ms with `cubic-bezier(0.22, 1, 0.36, 1)`, animating only `transform` and `opacity`, with `prefers-reduced-motion` respected. Content must never stay invisible if JavaScript or an observer fails.

---

## 2. NON-NEGOTIABLE RULES

- TypeScript strict, no `any`, no console errors, no hydration errors.
- All new UI strings go through the existing EN/SI mechanism. Sinhala text must not overflow.
- Secrets (DB password, SMTP, Gemini key, Google OAuth, session secret) live only in `.env` / encrypted DB settings. Never commit them. Never send them to the browser. Never log them.
- Every database query is parameterized. Every input is validated server-side (zod or equivalent).
- Anything switched OFF in admin must disappear completely from the UI with NO empty gap, broken link, or leftover spacing.
- Do not add heavy dependencies. Prefer what is installed. Justify each new dependency in `DECISIONS.md`.
- Destructive actions are never silent: soft-delete, audit log, and (for non-owners) a request to the owner.
- Do not invent content. Where content is missing (About story, phone numbers, contact details), build an editable placeholder and list it in the final report.

---

## 3. KNOWN ISSUES TO FIX (found in the current site)

1. Many places show wrong/duplicate/broken images (New Zealand tree for Nine Arch Bridge, Kerala houseboat for Pidurangala, Himalaya photos on Sri Lankan places, grey/black placeholders). Use `IMAGE_AUDIT.md`; show a branded fallback where an image is wrong or missing; never hot-link random stock images. The admin media tool (Phase 5) must make replacing images easy.
2. Fake-looking trust signals: dummy phone number on place pages, "100% Verified Destination", "Verified Visit" badge on reviews. Remove or make real. A "Verified" badge may only appear if a real verification rule exists (e.g. logged-in, email-verified user). Otherwise remove.
3. Truncated titles, inconsistent price formats, odd category labels.
4. Possible slowness/lag on mobile (see Phase 13).

---

## 4. DECIDED ARCHITECTURE

### 4.1 Database: migrate SQLite → MySQL
MySQL is NOT installed anywhere yet (neither the local PC nor the VPS). The build must include setting it up.
- Use MySQL 8, charset `utf8mb4`, collation `utf8mb4_unicode_ci` (Sinhala must work perfectly).
- Driver: `mysql2` with a connection pool. Write a thin data-access layer in `src/lib/db.ts` so pages never write raw connection code.
- Migrations: plain versioned SQL files in `db/migrations/` (`001_init.sql`, `002_...`) plus a small runner script `npm run db:migrate`. Also `npm run db:seed`.
- Write `scripts/migrate-sqlite-to-mysql.js`: copies ALL existing data (places, reviews, hero/region slides, settings, logs) from `data/uncoverceylon.db` into MySQL, then verifies row counts. Keep the old SQLite file untouched as a backup.
- Local setup: document both options in `docs/DB_SETUP.md`: (a) install MySQL on Windows/Mac, (b) Docker one-liner. Provide `.env.example`.
- VPS setup: document exact Ubuntu commands in `docs/DEPLOY.md`: install `mysql-server`, secure it, create database + dedicated user with least privilege, bind to 127.0.0.1 only (never exposed publicly), `.env` on the server, PM2 restart, Nginx unchanged.
- **Decided: ONE MySQL database** (simplest backups, foreign keys and transactions), organized as two clearly separated table groups, each accessed through its own module (`src/lib/db/users.ts`, `src/lib/db/locations.ts`) so they could be split later without rewriting pages. The two groups (the owner's mental model):
  1. **users**: everyone who signs in (all roles).
  2. **locations**: all place data.
  Plus supporting tables listed in Section 7.
- **Admin SQL console (owner only)**: a page where the owner can run SQL to change data. Safeguards: owner-only, requires re-entering password, blocks `DROP DATABASE`/`DROP TABLE`/`TRUNCATE` unless a second explicit confirmation is typed, automatically creates a backup before any write statement, shows affected rows, and logs the statement in the audit log. Also provide a friendly table browser (view/search/edit rows) for owner so SQL is optional.
- Automatic daily DB backup (mysqldump via cron/PM2 job), keep last 14, download from admin (owner only).

### 4.2 Images
- Files stay on disk (`public/uploads/` or a configurable directory), referenced from MySQL by path. Keep the secure `uploads/[...path]` serving route.
- **Image optimizer tool (inside admin, one button)**: on upload (and via a "Optimize all existing images" bulk button) it must: auto-rotate by EXIF then strip EXIF, resize down to sensible maximums (never upscale), generate responsive sizes (e.g. 480 / 960 / 1600 wide, long edge capped), convert everything to **WebP** (quality ~75–80, tuned to keep files small but sharp), de-duplicate by hash, validate type/size/magic bytes, and store width/height for zero layout shift. Show before/after size in the UI. Use Sharp.
- Reject non-image uploads and files above a configurable size limit.

### 4.3 Authentication
- One `users` table with a `role` column: `owner | developer | uploader | user`.
- Sessions: secure httpOnly SameSite cookies (signed/encrypted session or DB-backed sessions; pick the simplest robust option and log it). Passwords hashed with argon2id or bcrypt. Rate-limit login, register, resend-verification and password-reset. CSRF protection on state-changing requests.
- **Email + password registration**: fields email, name, country, password (+ confirm). Account is `unverified` until the user clicks the emailed verification link (signed, single-use token, expires in 24h). Unverified users cannot post reviews, submit places, or use AI chat beyond the guest limit.
- **Email sending (decided)**: use SMTP via `nodemailer`. Start with a **Gmail account + App Password** (free, needs 2-step verification on the Gmail account; works without a domain; limited to a few hundred emails per day, which is fine at the start). Build it behind a provider abstraction (`src/lib/mailer.ts`) so it can later be switched to Brevo/other SMTP by changing settings only. SMTP host/user/password are entered by the owner in admin (stored encrypted) with a "Send test email" button. Document in `docs/EMAIL_SETUP.md` with step-by-step instructions for creating the Gmail App Password and a note that mail may land in spam until a real domain + SPF/DKIM is set up.
- **Google login**: build the complete backend (OAuth 2.0 / OIDC flow, account linking by verified email, create user on first login with role `user`). The button appears only when `GOOGLE_CLIENT_ID/SECRET` are configured (feature flag). Document exact steps in `docs/GOOGLE_LOGIN_SETUP.md` (Google Cloud console, redirect URIs for localhost and production). The owner will add the keys later.
- **Password reset** by emailed link. **Change password** and **change email** (re-verify) from the profile.
- Staff (owner/developer/uploader) sign in at `/admin/login` (not linked from the public nav). Normal users sign in at `/login` or via the header. After login, route by role.
- Seed script creates the first **owner** from env variables (`OWNER_EMAIL`, `OWNER_INITIAL_PASSWORD`) and forces a password change on first login. Migrate away from the old admin-password mechanism safely.
- Optional but recommended: TOTP 2-step login for the owner (can be a later toggle).

### 4.4 Roles & permissions (single source of truth: `src/lib/permissions.ts`)

| Capability | Owner | Developer | Uploader | User |
|---|---|---|---|---|
| Create / remove staff accounts, change roles | ✅ | – | – | – |
| API keys & secrets (Gemini, SMTP, Google) | ✅ write | – | – | – |
| SQL console, table browser, backups restore | ✅ | – | – | – |
| AI system prompt, chatbot rules | ✅ | ✅ | – | – |
| Site tree ("folders"), theme, ads, news settings | ✅ | ✅ | – | – |
| Project file map viewer | ✅ | ✅ | – | – |
| Create / edit places, upload & optimize images | ✅ | ✅ | ✅ | submit only |
| Approve user accounts / user-submitted places | ✅ | ✅ | ✅ | – |
| Customer chat (reply) | ✅ | ✅ | ✅ | own thread |
| View analytics (clicks/views) | ✅ | ✅ | ✅ | – |
| **Delete anything** | ✅ | request | request | – |

**Deletion rule (important):** only the owner can delete. When a developer or uploader presses "Delete", the system does NOT delete; it creates a **delete request** to the owner (with reason). The owner gets a notification and can approve or reject. Approved deletes are **soft deletes** (move to Trash, restorable for 30 days; only the owner can empty the Trash). Editing is allowed for developer/uploader, with full **version history and one-click revert**.

### 4.5 Notification system (used everywhere)
- Table `notifications` (recipient, type, title, body, link, payload, read_at, created_at).
- In-app: bell icon with unread count, dropdown list, "mark all read", realtime via SSE or 15-second polling (choose the simplest reliable one).
- Email notification (optional per user, uses the mailer) for important events to the owner.
- Events that MUST notify: new user registered; user submitted a place; new approval request; delete request created / approved / rejected; customer chat message; a staff member changed a sensitive setting (ads, theme, section on/off); failed-login bursts; new staff account created; backup finished/failed; AI/news job failed or API quota error; news published; an ad about to expire.
- Targeting: owner gets everything; developer/uploader get only what concerns them.

---

### 4.6 REFERENCE LAYOUTS (from the owner's screenshots and sketch)

Copy the *structure and usability* only. Use our own light-blue theme, fonts, icons and wording. No Tripadvisor colors, owl logo, green buttons or wording. No fake sponsored items, no fake review counts, no fake "open now" if we have no opening-hours data. Anything that needs data we do not have is hidden, not faked.

**A. The owner's sketch → every page block is a collapsible "folder".**
Each block is a slim header row (title + a chevron/dropdown arrow that invites a tap; the blue line ending in a "v" mark in the sketch is exactly this cue) followed by its content. Order drawn in the sketch: (1) a gallery carousel with the neighbouring slides peeking at both sides, (2) description text, (3) a short key-facts list, (4) a row of thumbnails, (5) text + image (tips/location). Rules: smooth height animation, `aria-expanded`, keyboard accessible, important folders open by default (`default_open`, controlled in the Folder Manager), on mobile only the top 2 are open by default. Each folder is a `site_nodes` entry, so the owner can switch it off.

**B. Destinations list page ← "Restaurants in Singapore" structure (desktop ≥1024px).**
- Breadcrumb, big H1 ("Destinations in Sri Lanka", or "Beaches in Sri Lanka" when a type is chosen), result count, **Sort** dropdown (Top rated, Most popular, Nearest to me, Newest), and a **Map** button that switches to a list + map split view.
- **Left sticky filter sidebar**, each group collapsible with a chevron and "Show more": Type (with counts), Province/District, Best season (months), Entry fee (Free / Paid), Rating (3+/4+/4.5+), Duration, Difficulty, Features (only those that exist in the data), "Hidden gems", "Editor's pick". Applied filters appear as removable chips above the list with "Clear all". All filters live in the URL (`?type=beaches&page=2`) so Back works and links are shareable.
- **Ranked list rows**: left = image carousel (4:3, dots, heart); right = number + name ("1. Nine Arch Bridge"), rating + review count (link to reviews), tag line (type · fee · district · distance), 2 short real review snippets if reviews exist, best-season pill, a primary "View" button and a secondary "Add to trip". Rows are one reusable component.
- Between rows (not too often): a horizontal strip such as "Hidden gems" or "Popular this month" (from real analytics), and clearly labeled Sponsored slots from the Ad Manager (Phase 8) only when switched on.
- **Numbered pagination** with "Showing 1–30 of N" (no infinite scroll), 12–30 per page.
- Mobile (<768px): rows become vertical cards (image on top), filters open in a bottom sheet with "Apply (N results)", sticky bottom bar with "Filters" and "Map".
- Each filter group, strip and the sidebar itself is a Folder Manager node.

**C. Destination detail page ← "Hotel Boss" structure.** Build exactly these blocks, each a collapsible folder where it makes sense:
1. Breadcrumb, title row (name, **Save**, **Write a review**), rating row (score, circles, review count, rank "#N of M in {district/type}"), "View location" link, primary button **Add to trip** (replaces "Check availability"), and **Directions**.
2. **Photo mosaic**: 1 large + 4 small images, "See all photos" opens a lightbox; on mobile a swipe carousel with the neighbours peeking.
3. **"Plan your visit" card** (replaces the price-comparison box): entry fee (LKR/USD toggle), best season, opening hours, duration, difficulty, Directions, Add to trip. No fake booking. Optional "Partner deals" row only if an ad/affiliate is switched on (labeled).
4. **"Why travelers love this place"**: horizontal row of recent real review cards ("Read more"). Hidden if there are no reviews.
5. **About**: big rating + label (Excellent / Very good / Average / Poor / Terrible), rank, sub-rating bars (Scenery, Accessibility, Facilities, Value, Cleanliness; shown only when enough ratings exist), description, "Good to know" (suitable for, languages, duration, difficulty), features list with "Show more", and the existing curated "Insider tips".
6. **"Have questions about {place}?"** box with 3 suggested questions and an input: it opens the AI panel (4.6-D) with this place as context.
7. **"You may also like"**: Nearby / Popular nearby carousel (recommender, Phase 7).
8. **Location**: address, map with pin, **Getting there** (distance from Colombo / nearest airport / nearest town, simple transport notes), and **Nearby attractions within a few km** with distance (Haversine) from our own data.
9. **Reviews** (see Phase 5 for the full feature list): rating overview with distribution bars and counts, sub-ratings, "Write a review", search, filters (rating, trip type, month, with photos), sort (most recent, highest, lowest, most helpful), "Popular mentions" chips (simple keyword frequency, no AI), review cards, staff replies, numbered pagination "Showing 1–10 of N".
10. **Q&A**: questions and answers list with "Ask a question".
11. **Traveller photos** strip (all photos from reviews) with "Add photos".
12. Remove from the current page: fake phone number, "100% Verified", fake weather matrix if not backed by real data (keep real seasonal info), and anything that repeats the same information twice.

**D. AI chatbot UI ← Tripadvisor "AI Assistant" panel.**
- Desktop: a panel that slides in from the **left** (~400px, overlays or pushes content). Header: "AI Assistant", **New chat**, close (X). Mobile: full-screen sheet.
- Empty state: heading "Let's plan your next trip", one line of explanation, three chips (**Season/Dates**, **Travelers** (solo / couple / family / friends), **Recents** (past chats for signed-in users)), a large input with placeholder like "e.g., Plan a 4-day trip to the south coast", a small tip "Use @ to mention a place" (autocomplete from our places), and an **"Ask anything"** list of 4 tappable example questions (editable in admin, EN/SI).
- Entry points: a **"Plan with AI"** button in the header and a floating button on mobile; "Have questions about this place?" on detail pages.

---

## 5. ADMIN PANEL — GENERAL DESIGN

Route `/admin` (staff only, role-based menu). Goal: **very simple on the surface, powerful underneath.**
- Left sidebar (bottom bar on mobile) with these tabs; each tab shows only the 3–5 most used actions. Everything else lives behind a **"＋ More options"** button that opens a tidy popover/drawer, so the screen never looks crowded. Same pattern in every tab.
- Tabs: Dashboard · Places · Approvals · Customer Chat · Folder Manager (site tree) · Media · Theme · Ads · AI Chatbot · News · Analytics · Users & Roles (owner) · File Map (owner/developer) · Database (owner) · Trash & Requests · Notifications · Settings & API Keys (owner) · Audit Log.
- Editing a place, ad, section etc. opens in a **popup modal** (not a new page), so the owner never loses context. Normal users can only *add* places via the public site's "Add a place" flow (goes to Approvals as pending); editing is only available to staff logged in with an admin account.
- Everything works well on a phone (owner will often manage from a mobile).
- **The admin panel interface is English only** (decided by the owner); use plain, simple English with short labels and no jargon. The public site stays EN/SI, and content fields entered in admin (place titles, descriptions, section names, ads, announcements) keep both an English and a Sinhala input.
- Every change writes to the audit log (who, what, when, before/after).

---

### 5.1 Extra admin features (the owner asked for anything useful he did not think of)

Build these too, in the same simple style (main actions visible, the rest behind ＋):
- **Dashboard:** counts, pending approvals, unread notifications, last backup, status of scheduled jobs (news, recommender, backup), site health (database reachable, disk space, errors in the last 24h), quick actions.
- **User management:** search users; status (unverified / active / suspended); suspend or reactivate; resend verification email; force log-out; change role (owner only); export (owner only).
- **Maintenance mode** (friendly "We'll be back soon" page, EN/SI) and an **Announcement bar** (EN/SI text, color, start/end dates, on/off).
- **Site settings:** site name, contact email/phone/WhatsApp, social links, default language, default currency, exchange rate (automatic with manual override).
- **SEO basics:** per-place title/description/share image (auto-generated, editable), automatic sitemap and robots, structured data (JSON-LD) for places.
- **Translation manager:** edit EN/SI interface texts from admin, search, and a "missing translations" list.
- **Legal pages editor:** Privacy, Terms, cookie notice.
- **Bulk import/export:** import places from CSV/JSON with a preview, validation errors shown row by row, and imported items saved as drafts; export places (and users, owner only) to CSV/JSON.
- **Scheduled jobs page:** every job (backup, news, recommender, cleanup) with last run, status and a "Run now" button.
- **Error log viewer:** server errors, failed emails, failed AI calls; never shows secrets.
- **Staff sessions:** see active sessions, "log out everywhere"; optional 2-step login for the owner.
- **Help hints:** a small "?" on every admin tab explaining it in plain English.

---

## 6. PHASES

### PHASE 0 — Recon & safety net
- Summarize the current architecture in 15 lines (`docs/ARCHITECTURE_CURRENT.md`). Create the branch. Make a full backup copy of `data/` and `public/uploads/`.
- Produce `CLEANUP_REPORT.md` (a list ONLY, no deletion yet): unused files, unused components, unused dependencies, dead routes, stray root files (e.g. `page_output.html`, `address_bar_*.png`, root `ceylon.db` if unused), duplicate scripts, console logs. Use tools like `knip`/`depcheck` as dev-only helpers and verify manually.
- Create `TASKS.md` and `DECISIONS.md`.

### PHASE 1 — Database: MySQL + migration
Implement Section 4.1 completely, including migrations, the SQLite→MySQL copy script with verification, docs, and backups. All existing API routes must work against MySQL with identical behavior. Acceptance: whole site works exactly as before, reading from MySQL; row counts match.

### PHASE 2 — Authentication & profile
Implement Section 4.3. Build:
- Register (email + password), verify email, login, logout, forgot/reset password, Google login backend (flagged).
- **User profile page** (`/profile`): the header shows the user's avatar/name instead of a "Sign in" button once logged in; clicking opens their profile. They can change name, country, avatar, email (re-verify), password; see their saved places, their trips (Phase 11), their reviews and their submitted places with status.
- Staff login page and role-based redirect.
Acceptance: full register→verify→login→reset flow works locally with a real SMTP test; passwords never stored in plain text; rate limits verified.

### PHASE 3 — Permissions, requests, notifications, audit
Implement 4.4 and 4.5: `permissions.ts`, server-side guards on every admin API, the delete-request/approval workflow, trash with restore, version history, notification system, audit log. Acceptance: a developer cannot delete, can request deletion; owner receives a notification, approves, item goes to Trash; restore works.

### PHASE 4 — Admin shell + Folder Manager + File Map
**Admin shell:** per Section 5.

**Folder Manager (site tree) — the most important admin feature.** The whole website is a tree of "folders" (nodes):
- Top level = main pages: **Home, Destinations, Map, About** (plus any the owner adds, e.g. News, Trips).
- Under each page = its sub-sections. Example under Home: "Hero", "What kind of island trip do you imagine?", "Travelers' favourites", "Hidden gems", "Best right now", "Explore by region", "Latest news" etc. Under Destinations: the filter bar, results grid, and **one folder per destination type** (Beaches, Waterfalls, Wildlife, Ancient Sites, Mountains, Hidden Gems, Religious Places, Historical…).
- Implement as a DB table `site_nodes` (id, parent_id, key, type, title_en, title_si, enabled, sort_order, default_open, priority, device_visibility {mobile, desktop}, config JSON). Each real UI section component registers a `key` in a code registry so the tree controls what renders.
- Admin UI: tree view with drag-to-reorder, ON/OFF switch per node, rename, "open by default" toggle, show on mobile/desktop toggle, and per-node settings (e.g. how many items to show). A "＋" opens advanced options.
- **Turning a node OFF removes it from the UI completely** (including nav links, footer links, sitemap entries and any gap). Turning a parent OFF turns off all its children. Add a safety rule: the owner cannot accidentally disable the last remaining page, and a "Restore defaults" button exists.
- Changes apply immediately (revalidate cache tags) without redeploy.
- The most important folders open by default; the admin chooses which via `default_open` / `priority`.
- Layout rule for the Destinations page and the destination detail page: follow Section 4.6 exactly (collapsible "folders" with chevrons from the owner's sketch, the filter-sidebar + ranked-list structure for the list page, the block order for the detail page). Do NOT dump everything at once; the page must stay short, scannable and friendly. Match the existing light-blue theme.
- **Home page change:** remove the large "all destinations" grid from Home (the Destinations page already has it). Home keeps the hero, interest section, a few curated rows and teasers with "View all" links. Rebuild Home from folders so the owner can toggle each piece.

**Theme Controller (owner + developer):** one simple page that changes how the whole site looks without code.
- Stored in the `themes` table and injected server-side as CSS variables (no flash of the old theme).
- Controls: primary and accent colors (with an automatic contrast check that warns or blocks combinations that fail AA), logo and favicon upload (run through the image optimizer), site name and tagline (EN/SI), font choice from a short safe list (Sinhala-compatible), corner roundness (Soft / Rounder), shadow level, hero overlay strength, optional seasonal presets (Default, Vesak, Avurudu, Christmas…) that can be scheduled by date.
- Live preview before saving, "Save", "Reset to default", and version history. Advanced options live behind the ＋ button.

**File Map (owner + developer, read-only):** a page that shows the project's file/folder structure as a tree with a plain-language description of what each file/folder does (generate descriptions from a maintained `docs/FILE_MAP.json`, and include a script that updates it). Never show `.env`, secrets, `node_modules`, or file contents of sensitive files. Read-only, no editing or running anything.

### PHASE 5 — Places management, media tool, approvals, customer chat
- **Audit the existing admin first** (`src/app/admin`, `DestinationEditorModal`, `MapLocationPicker`, the upload, slides and log features). Write `ADMIN_AUDIT.md` listing every existing feature as KEEP / SIMPLIFY / REMOVE. Remove anything unused, duplicated, or that does nothing useful. The owner wants it very simple but still fully capable: no scattered options; everything essential for a task is visible on ONE screen, in a sensible order; rarely used options are tucked behind a **＋** button that opens a tidy panel.
- Places tab: list, search, filter, sort, bulk actions. Add/edit in a popup modal (all essential fields on one screen, extras behind ＋). Fields: EN/SI titles and descriptions, category/type, province/district, GPS (map picker), fee (LKR + USD), best season, hours, duration, difficulty, images (ordered gallery), tips, status (draft/pending/published). Replace dummy data fields with real, optional ones; hide fields that are empty on the public page.
- **Slides manager:** keep and simplify the existing hero slides and region slides (add, reorder by drag, replace image, edit EN/SI text, on/off), using the same popup + ＋ pattern.
- Media library with the one-button optimizer from 4.2 and a "images needing attention" view driven by `IMAGE_AUDIT.md` (wrong / missing / duplicate).
- Public "Add a place" form for logged-in, email-verified users (title, description, location pin, photos). Submission goes to **Approvals** with status pending. Any of owner/developer/uploader can approve or reject (with a reason shown to the user). Approved items appear on the site; the submitter gets a notification.
- Approvals tab also covers new user accounts that need review, if the owner enables that mode.
- **Reviews (public + admin):**
  - Only logged-in, email-verified users can write a review; one review per user per place (they can edit their own). Fields: rating 1–5, title, text, date of visit, trip type (solo / couple / family / friends), optional sub-ratings (Scenery, Accessibility, Facilities, Value, Cleanliness), and **up to 5 photos** per review. Photos go through the same optimizer (4.2), are validated, and appear in the review and in the "Traveller photos" strip.
  - Helpful vote (👍) once per user per review; "Report" button; a review shows the author's name, country, and number of contributions (computed honestly).
  - **Staff replies:** owner/developer/uploader can post one public reply per review, shown as "Response from the UncoverCeylon team" (with date); the author is notified. Staff can edit their own reply. Deleting a review or reply follows the delete-request rule.
  - Moderation tab: new reviews and reported reviews, hide/unhide, with notifications. Optional setting "review photos need approval first".
- **Q&A (public + admin):**
  - Logged-in, verified users can ask a question on a place; any logged-in user or staff member can answer; staff answers carry a "Team" badge; the asker is notified when an answer arrives; "No answers yet" empty state; "Report" and basic moderation in admin; rate-limited.
- **Customer Chat:** each logged-in user can message the site team from a small "Help" button; staff see threads in the admin, reply, mark resolved. Notifications for new messages. Keep it simple (threads + messages, polling or SSE; no external service).

### PHASE 6 — Public site restructure (uses the Folder Manager)
Rebuild Home, Destinations, Map and About to render from `site_nodes`. Keep all existing features working (favorites, search, filters, GPS near-me, map, currency, language). Rebuild the **Destinations list page** per Section 4.6-B and the **destination detail page** per Section 4.6-C, including collapsible folders (4.6-A), filters stored in the URL, numbered pagination, Map toggle, and the mobile versions. Build the shared components once and reuse them (`DestinationRow`, `FilterSidebar`, `FilterSheet`, `Folder`, `PhotoMosaic`, `RatingOverview`, `ReviewCard`, `QAList`). Fix the issues in Section 3.

### PHASE 7 — Analytics + recommendation algorithm
**Tracking** (privacy-friendly, with a small cookie/consent notice; no personal data in event rows):
- Table `events`: place_id, user_id (nullable) or anonymous session id, event type (view, click, save, directions, share, search), source (home row, search, map, nearby, recommendation), timestamp, optional dwell time.
- **Click/view count is a primary signal** and is shown to staff per place (and trend over time) in Analytics.
- Store each visitor's **journey path** (the ordered list of places viewed in a session, for signed-in users linked to their account) as **JSON** (a JSON column per session/user), kept for recommendation only. Staff can download the journeys as a `.json` file from the Analytics tab for review. The recommender reads these JSON paths to learn which places people tend to visit after one another.
- Admin Analytics tab: top places, trending this week, most saved, search terms with no results, device split, per-section clicks. Simple charts, light-blue theme.

**Recommendation engine (`src/lib/recommend.ts`)**, explainable and fast, no heavy ML library at first:
1. **Proximity**: if a user views/visits a place, suggest the nearest relevant places (Haversine distance on lat/lng, cached).
2. **Journey-based (collaborative)**: build a "viewed A → then viewed B" transition table from stored journey paths; suggest what other people with similar paths clicked next.
3. **Category/interest affinity**: from the user's own clicks/saves.
4. **Popularity**: click count with time decay so new places are not buried.
5. Final score = weighted sum, weights editable in admin (with safe defaults), plus a diversity rule so the list is not 6 near-identical places.
6. Each suggestion carries a short human reason ("Close to X", "Travelers who viewed X also viewed this"). Show "Nearby & you might like" on place pages, Home ("Picked for you" for returning users), and in the trip planner.
7. Cold start (new/anonymous user): fall back to popular + nearby.
8. A nightly job recomputes the transition table; recommendations are cached. Must not slow page loads.
9. Users can clear their history; document what is stored in the Privacy page.

### PHASE 8 — Ads (all controlled from admin, ON/OFF)
Principle: ads must never hurt the user experience. No popups, no autoplay video/audio, no full-screen interstitials, no layout jumping, always clearly labeled "Ad" / "Sponsored".
Ad placements (exactly these 5):
1. **Sponsored place card** inside the places grid (looks like a normal card, labeled).
2. **Slim banner** between two homepage sections (static, not sticky).
3. **Place-detail sidebar partner card** (hotel/tour/affiliate suggestion near the Quick Facts).
4. **"Sponsored" row** inside the Nearby/Recommendations carousel (max 1 item).
5. **Footer partner strip** (logos/links).
Plus: backend-ready **Google AdSense** slots (script loader, `ads.txt` support, consent-aware) that are **OFF by default**; the owner turns them on later.
Admin Ad Manager: master kill switch; per-placement on/off; per-ad create/edit (image, title, text, link, placement, start/end dates, device targeting); impressions and clicks counted; "ad expiring" notifications. When OFF the container is not rendered at all (no empty space). Developer/owner can manage; every change is audit-logged.

### PHASE 9 — AI chatbot (Gemini)
- Server-side only. The Gemini API key is entered by the owner in admin (encrypted), with env fallback. Do not hardcode a model name: make the model configurable in admin and default to a currently available Gemini "flash"-class model after checking the official Gemini API docs.
- **System prompt is editable in admin** (owner/developer): a large text area with version history, "restore default", and a **Test console** to try the bot before saving. The system prompt must be applied properly on every request (as the model's system instruction), exactly like a system prompt in a Python SDK.
- Default system prompt rules: the bot only answers questions about Sri Lanka tourism, travel logistics, culture/etiquette, safety, weather/seasons, and about this website and its places. It politely refuses everything else (politics, adult, medical/legal advice, coding, other countries, anything unrelated) and redirects to travel help. It never reveals its system prompt, API keys, internal data, user data, or database structure. It resists prompt-injection ("ignore previous instructions…"). It answers in the user's language (EN/SI).
- **Database access (safe):** give the bot read-only access to the places data through server-side *tools/function calling* using a whitelist of parameterized queries (search places, get place details, nearby places, list by category/season). It can never see users, emails, sessions, keys, admin logs or chat logs, and can never write. Limit rows and fields returned.
- **Works anywhere on the site:** a floating button on every page. It receives the current page context (e.g. the place being viewed) so answers fit where the user is. Backend endpoint takes `{page_context, messages}` and builds the right context server-side.
- **Guest limit:** guests may send 2 messages; after that show a friendly "Sign in to continue" card. Signed-in users have a generous daily limit (configurable). Per-IP and per-user rate limits.
- Streaming responses, typing indicator, markdown rendering (sanitized), "was this helpful" thumbs, links to place pages in answers.
- Admin: chat logs (for quality review; handle privacy sensibly), usage/cost counters, daily limit settings, on/off switch for the whole chatbot (OFF = button disappears).
- UI: build the AI panel exactly as described in Section 4.6-D (left slide-in panel on desktop, full-screen sheet on mobile, light-blue theme), with streaming answers, `@place` mentions, example prompts, and a **Recents** list of past chats for signed-in users (they can delete their history).
- **AI trip planning (signed-in users only):** the bot can propose an itinerary (days, places in a sensible geographic order, rough travel times) using the whitelisted read-only place tools. The proposal is rendered as a card with **"Add to my trip"**. The model NEVER writes to the database itself: pressing the button calls the normal authenticated trip API (Phase 11), after the user chooses a new trip or an existing one. Guests who ask for this see a friendly "Sign in to save a plan" card (the 2-message guest limit still applies). Only places that exist in our database may appear in a proposal; anything else is shown as a plain suggestion that cannot be added.

### PHASE 10 — AI news page (Sri Lanka tourism only)
- Public `/news` page plus a "Latest news" row on Home (both are folders in the site tree). Design it beautifully but simply: one featured story on top, clean cards below, category chips, source name and date on every card, calm light-blue look, fast on mobile.
- A scheduled job runs **3 times per day** (default 06:00, 13:00, 20:00 Asia/Colombo; times configurable in admin) using node-cron inside the PM2 process or a secured cron-triggered endpoint (choose the more reliable and document it).
- Uses Gemini **with Google Search grounding** so items are real and sourced. Each news item stores: title, short summary in the model's own words (never copy articles), source name and URL, image if safely available (otherwise a branded fallback), date, category, and a link to related places when matched.
- Strict filters: only Sri Lanka tourism-related (events, festivals, new attractions, travel advisories that are practical, transport, seasons/weather useful for travelers, openings/closures). Avoid crime, tragedies, graphic or negative-sensational stories; calm, helpful tone. Deduplicate similar items. If sources are weak, publish nothing rather than inventing.
- Admin News tab: run now, see job history/errors, hide/pin/delete (delete = request flow for non-owners), toggle "auto-publish vs review first", edit schedule, on/off switch. Failures notify the owner.
- API key reuse from the Gemini setting in admin.

### PHASE 11 — Trip To-Do List (trip planner)
A friendly planner that connects everything:
- **Where it lives:** its own top-level page `/trips` (a main folder in the site tree with a nav entry "My Trips", switchable in the Folder Manager). The **Map page has a side panel** (right side on desktop, bottom sheet on mobile) showing the active trip's to-do list, so people can tick places off and see the route on the map at the same time.
- A user creates one or more **trips** (name, dates optional). They add places from anywhere with one tap ("Add to trip"), reorder them (drag on desktop, up/down on mobile), mark visited/checked, and add notes, plus free custom to-dos ("buy tickets", "book hotel").
- **Connections (the agent must make these explicit in code and docs):** Trip ↔ Favorites (saved places can be added in bulk) ↔ Map (trip shown as a numbered route with distances) ↔ Recommender (suggestions inside the trip) ↔ Profile (all trips listed) ↔ Place pages (badge "In your trip").
- Guests can build a trip locally; when they sign in it syncs to their account.
- **AI link:** the AI panel's "Add to my trip" button (Phase 9) saves into these same trips through the authenticated trip API. Show a small "Planned with AI" tag on such trips, and let the user edit or remove anything afterwards.
- **Suggestions:** in a trip, show "People who planned similar trips also added…" and nearby places on the route. Implement with the same recommender, plus co-occurrence from many users' trips (which places appear together). Start with simple statistics and keep the code ready to plug in a stronger model later. Explain suggestions with a reason.
- Share a read-only trip link (optional, user-controlled). Export/print view. Estimated total distance and rough days.
- Owner can see aggregate trip stats in Analytics (no personal details).

### PHASE 12 — About page
Rebuild the About page as editable blocks (hero image, story text, photos, values, team/credits, contact) that the owner edits from the admin (a Folder Manager node). The owner will provide the real story about his village; until then use clearly marked placeholder text and list it as "content needed" in the final report. Keep the "SERANDIB CO." credit.

### PHASE 13 — Performance, mobile, full clean-up
**Performance (the site must feel instant on a mid-range phone):**
- Measure first (Lighthouse mobile + bundle analyzer), record the baseline, fix the biggest problems, record the result in `docs/PERFORMANCE.md`.
- Use Server Components wherever possible; keep client JS small. Dynamically import heavy parts (Leaflet map, charts, chat widget, editor) so they load only when needed. Lazy-load below-the-fold. Responsive WebP images with correct `sizes` and fixed aspect ratios (CLS < 0.05). Preload only what matters. Subset fonts. Cache aggressively with proper headers and revalidation tags. Add database indexes for every filter/sort used. Avoid N+1 queries. Paginate everything. Debounce search. Ensure animations only use transform/opacity and respect reduced-motion.
- Targets: Lighthouse mobile Performance ≥ 90, Accessibility ≥ 95, LCP < 2.5 s on 4G, no long main-thread tasks from our code.

**Mobile pass:** every new screen (admin included) tested at 390×844; tap targets ≥ 44px; no horizontal scroll; bottom sheets instead of tiny dropdowns; inputs ≥ 16px.

**Full clean-up (only now, after features work):** go through `CLEANUP_REPORT.md`, delete confirmed-unused files, components, dependencies and scripts, remove console logs and dead code, make sure `data/*.db*` and `.env` are git-ignored. Build, test every flow again. Never delete `data/` backups, `public/uploads/`, or anything referenced by the database.

### PHASE 14 — Deployment guide & final report
- `docs/DEPLOY.md`: VPS steps (MySQL install/secure, `.env`, migrate, seed owner, build, PM2, cron jobs for backup/news/recommender, Nginx, HTTPS with Let's Encrypt, log rotation, how to update safely, how to roll back).
- `docs/OWNER_GUIDE.md`: a short, friendly, non-technical guide (with Sinhala headings where practical) for the owner: how to add a place, optimize images, approve submissions, turn sections/ads on and off, edit the AI prompt, read analytics, handle delete requests, restore from trash, take and restore backups.
- Final report: what was built, what is untested (e.g. Google login without keys), what the owner must provide (Gmail App Password, Gemini API key, Google OAuth keys, About story, real contact details, replacement photos), known limitations, and next suggestions.

---

## 7. DATA MODEL OVERVIEW (adjust names as needed; log changes)

`users`, `user_profiles`, `email_tokens`, `password_resets`, `sessions`, `oauth_accounts`, `locations` (places), `location_translations`, `location_images`, `categories`, `media_assets`, `reviews`, `review_photos`, `review_votes`, `review_replies`, `review_reports`, `place_questions`, `place_answers`, `ai_trip_proposals`, `submissions`, `approvals`, `change_requests` (delete requests), `trash`, `versions` (history), `notifications`, `audit_log`, `site_nodes`, `site_settings`, `secrets` (encrypted), `themes`, `ads`, `ad_stats`, `events`, `journeys`, `place_transitions`, `recommendation_cache`, `trips`, `trip_items`, `chat_threads`, `chat_messages`, `ai_chat_logs`, `ai_prompts` (versions), `news_items`, `news_runs`, `backups`.

Add indexes on every foreign key and every column used for filtering/sorting (category, province, status, lat/lng, created_at, event timestamps).

---

## 8. SECURITY CHECKLIST (verify before finishing)

- [ ] Passwords hashed (argon2id/bcrypt); no plain-text secrets anywhere; `.env` ignored by git.
- [ ] All admin APIs check role server-side (never trust the UI).
- [ ] Parameterized SQL only; SQL console owner-only with password re-entry, auto-backup, and audit log.
- [ ] Rate limiting on login/register/reset/AI chat/uploads; CSRF protection; secure cookie flags.
- [ ] Upload validation (type, size, magic bytes), random file names, no path traversal.
- [ ] HTML from users/AI is sanitized; no stored XSS.
- [ ] AI bot has read-only whitelisted data access and cannot leak secrets or user data; prompt-injection tests pass.
- [ ] The AI model can never write to the database; trip changes happen only through a user-confirmed, authenticated API call.
- [ ] Review photos, review text, Q&A and staff replies are validated, sanitized, rate-limited, reportable and moderatable; one review per user per place is enforced server-side.
- [ ] MySQL listens only on 127.0.0.1 with a least-privilege user.
- [ ] Security headers set (CSP where practical, X-Frame-Options, Referrer-Policy).
- [ ] Privacy page and cookie notice updated for analytics and AI.

---

## 9. DEFINITION OF DONE

- Every item in `TASKS.md` is ticked with a passed acceptance test, or explicitly listed as "needs owner input" with the reason.
- `REQUIREMENTS_TRACE.md` covers every ID in Appendix A, each marked Done (with file/route/test) or "Needs owner input" (with the reason).
- `npm run lint`, `npx tsc --noEmit`, `npm run build` all pass.
- All flows tested on mobile (390), tablet (768) and desktop (1440): register/verify/login/reset, profile, add place → approve → visible, delete request → approve → trash → restore, site node ON/OFF with no gaps, image optimize, ad ON/OFF, chatbot (guest limit, refusal of off-topic, tool-based answers), news job (run now), trip planner, recommendations, review with photos + staff reply, Q&A ask/answer/notify, Destinations list (filters in URL, sort, numbered pagination, Map toggle, mobile filter sheet), destination detail page blocks and collapsible folders, AI panel (left slide-in, `@place`, Recents) with trip proposal → confirm → saved to trip (signed-in only), language switch, currency switch, favorites, map, near-me.
- Lighthouse mobile targets met and documented.
- Docs delivered: `DEPLOY.md`, `DB_SETUP.md`, `EMAIL_SETUP.md`, `GOOGLE_LOGIN_SETUP.md`, `OWNER_GUIDE.md`, `PERFORMANCE.md`, `FILE_MAP.json`, updated `DESIGN_SYSTEM.md`.

---

## APPENDIX A — OWNER REQUIREMENTS CHECKLIST (every item must appear in `REQUIREMENTS_TRACE.md`)

| ID | Requirement (normalized from the owner's notes) | Phase |
|---|---|---|
| R01 | The admin panel is the most important part; it is separate from the normal public site | 3–5 |
| R02 | Four login types: owner (unlimited access), developer, uploader, user (normal users, linked to the user data in the database) | 2, 3 |
| R03 | Admin tabs: customer chat; customer approval requests; folder manager; main theme controller; ad manager | 4, 5, 8 |
| R04 | Folder manager: the site is treated as folders and sub-folders; any of them can be switched on/off from admin | 4 |
| R05 | Switching a folder off leaves no trace in the UI (no gap, no link, no empty box) | 4, 6 |
| R06 | Simplify the existing location-upload and admin features: remove useless ones, keep it very simple but capable; all essentials on one screen; extra options behind a ＋ button | 5 |
| R07 | File Map: owner and developer can see how the site's files are organised and what each one is for | 4 |
| R08 | Email sign-up (email, name, country, password etc.) with a verification link; free email-sending method; real sending can be set up later | 2 |
| R09 | Google login: complete backend now, keys added later | 2 |
| R10 | User profile: after login the user's avatar/name is shown at the top; it opens a profile where login details and password can be changed | 2 |
| R11 | Main folders Home, Destinations, Map, About, each with sub-folders (e.g. "What kind of island trip do you imagine?") | 4, 6 |
| R12 | Home: remove the destinations grid (it exists on its own page) | 6 |
| R13 | Destinations page: its parts become folders; each destination type is a folder; the important ones open by default; controlled from the folder manager; the page does not show everything at once; matches the theme | 4, 6 |
| R14 | All text data moves to MySQL (existing data migrated); the owner can run SQL commands to change data | 1 |
| R15 | Two main data parts, users and locations, kept separate | 1 |
| R16 | Images stored in folders and linked through the database | 1, 5 |
| R17 | Admin image tool: one button resizes every image to the smallest sensible size and converts to WebP, high quality with small file size | 5 |
| R18 | Algorithm: count clicks per place, visible in admin; views/click count is the main signal | 7 |
| R19 | For a logged-in user viewing a place, suggest the nearest places and the places others clicked after it | 7 |
| R20 | Each visitor's path is saved (JSON) and used to suggest places people like | 7 |
| R21 | Ads: 5 non-disruptive methods, each switchable on/off from admin, nothing left behind when off | 8 |
| R22 | Google Ads/AdSense: backend ready, switched OFF for now | 8 |
| R23 | AI chatbot (Gemini): system prompt works properly and is editable from admin; guests get 2 chats then must sign in; full database access with limits and no data leaks; usable anywhere on the site with page context; UI like the reference photo; refuses anything unrelated to Sri Lanka tourism and the site | 9 |
| R24 | AI news page: Gemini runs 3 times a day, posts only Sri Lanka tourism news, avoids awful/negative content, looks nice; API keys managed in admin | 10 |
| R25 | Full clean-up of everything unused in the site | 13 |
| R26 | New technology must not slow or lag the site; check mobile speed carefully | 0, 6, 9, 13 |
| R27 | Everything is mobile-optimised | all |
| R28 | Trip To-Do List as its own section, linked with the map; suggestions personalised per user from what common users do (ML-style) | 11 |
| R29 | Access levels split carefully between roles (owner / developer / uploader / user) | 3 |
| R30 | A normal user can add a place from the main site; editing is only for staff, in a popup, without changing the UI | 5 |
| R31 | Extra admin features the owner did not think of (Section 5.1) | 4, 5 |
| R32 | The final site must contain everything listed here; follow the owner's vision | all |
| R33 | The site looks very simple and is extremely friendly | all |
| R34 | About page rebuilt around the owner's idea about his village (content from the owner; editable blocks until then) | 12 |
| R35 | Follow the earlier introduction and the Fogg Behavior Model paper (Section 1.1) | all |
| R36 | Destinations list page structured like the Tripadvisor restaurants list (Section 4.6-B) | 6 |
| R37 | Destination detail page structured like the Tripadvisor hotel page, with reviews (photos, staff replies) and Q&A (Section 4.6-C) | 5, 6 |
| R38 | AI panel structured like the Tripadvisor AI Assistant; signed-in users can have trips planned and added to their trip list (Section 4.6-D) | 9, 11 |
| R39 | The owner's sketch: page blocks as collapsible folders with a chevron cue (Section 4.6-A) | 4, 6 |
| R40 | Only the owner can delete; developer and uploader send a delete request; notifications for all important events | 3 |
| R41 | The whole job runs from one long prompt that reads this spec in pieces and completes everything (Section 0) | 0 |
