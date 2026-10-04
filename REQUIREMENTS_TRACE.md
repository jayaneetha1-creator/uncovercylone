# Requirements Traceability Matrix (REQUIREMENTS_TRACE.md)

This matrix maps every requirement ID from **Appendix A** of `MASTER_SPEC.md` to its implementation files, routes, acceptance tests, and current status.

Status Definitions:
- **Planned / In Progress**: Scheduled in respective phase; undergoing active development.
- **Done**: Fully implemented, compiled, and verified via automated or visual tests.
- **Needs Owner Input**: Fully implemented with fallback, waiting only on external secrets or credentials (e.g. real Google OAuth Client ID, live Gemini API Key, Gmail App Password).

---

| ID | Requirement Summary | Target Phase | Implementation Files & Routes | Acceptance Test & Verification | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R01** | Admin panel separate from public site | Phase 3–5 | `src/app/admin/layout.tsx`, `src/app/admin/page.tsx` | Admin panel accessible only at `/admin`, public site has independent layout | Done (Phase 5) |
| **R02** | 4 login types (owner, developer, uploader, user) | Phase 2, 3 | `src/lib/permissions.ts`, `src/lib/auth.ts`, `src/app/login/`, `src/app/admin/login/` | Each role receives strictly bounded capabilities and redirected correctly | Done (Phase 2) |
| **R03** | Core admin tabs (Chat, Approvals, Folders, Theme, Ads) | Phase 4, 5, 8 | `src/app/admin/components/*`, `src/app/admin/page.tsx` | Tabs present in admin sidebar & nav bar; modern modular components | Done (Phase 4) |
| **R04** | Folder Manager: site treated as collapsible folders | Phase 4 | `src/lib/db/nodes.ts`, `src/app/admin/components/FolderManagerTab.tsx` | All sections in DB `site_nodes`; toggle on/off dynamically updates page | Done (Phase 4) |
| **R05** | Turning folder off leaves zero UI gap or broken link | Phase 4, 6 | `src/components/Folder.tsx`, `src/app/page.tsx` | When section disabled in admin, DOM element is completely unmounted | Done (Phase 4) |
| **R06** | Simplify location editor: essentials on one screen, extras behind "+" | Phase 5 | `src/components/DestinationEditorModal.tsx` | Modal opens cleanly with core fields; advanced fields toggle in tidy panel | Done (Phase 5) |
| **R07** | File Map: owner/developer view project files and roles | Phase 4 | `src/app/admin/components/FileMapTab.tsx`, `docs/FILE_MAP.json` | Read-only tree view rendered with friendly descriptions; secrets hidden | Done (Phase 4) |
| **R08** | Email signup + verification link + free SMTP method | Phase 2 | `src/lib/mailer.ts`, `src/app/api/auth/register/`, `src/app/verify-email/` | Registration sends signed token link via Nodemailer Gmail/SMTP | Done (Phase 2) |
| **R09** | Google login backend complete, keys added later | Phase 2 | `src/app/api/auth/google/`, `docs/GOOGLE_LOGIN_SETUP.md` | OAuth endpoint implemented; button conditionally shown when keys present | Done (Phase 2) |
| **R10** | User profile: avatar at top, manage profile, trips, favorites | Phase 2 | `src/app/profile/page.tsx`, `src/components/Navbar.tsx` | Logged-in user sees avatar in nav; can edit name/password, view trips & saves | Done (Phase 2) |
| **R11** | Main folders Home, Destinations, Map, About with sub-folders | Phase 4, 6 | `src/lib/db/nodes.ts`, `src/components/Folder.tsx` | `site_nodes` seed contains top pages and sub-sections; reorderable | Done (Phase 4) |
| **R12** | Home: remove all-destinations grid (moved to Destinations page) | Phase 6 | `src/app/page.tsx`, `src/app/destinations/page.tsx` | Homepage features curated teaser rows; full grid lives at `/destinations` | Done (Phase 6) |
| **R13** | Destinations page: folders per type, filters, ranked list | Phase 4, 6 | `src/app/destinations/page.tsx`, `src/components/DestinationRow.tsx` | Sticky left filter bar, ranked list rows, collapsible folder groups | Done (Phase 6) |
| **R14** | Text data in MySQL; owner SQL console with safeguards | Phase 1 | `src/lib/db.ts`, `scripts/migrate-sqlite-to-mysql.js`, `src/lib/db/admin.ts`, `db/migrations/001_init.sql` | MySQL connection pool works; SQL console checks password & auto-backups | Done (Phase 1) |
| **R15** | Two main data partitions: users and locations | Phase 1 | `src/lib/db/users.ts`, `src/lib/db/locations.ts` | Clean separation of user models and destination models in data access layer | Done (Phase 1) |
| **R16** | Images stored on disk, linked via DB paths | Phase 1, 5 | `src/app/uploads/[...path]/route.ts`, `public/uploads/` | Image files served securely via relative paths stored in MySQL/SQLite | Done (Phase 1) |
| **R17** | One-button Admin Image Optimizer (WebP, resize, strip EXIF) | Phase 5 | `src/lib/optimizer.ts`, `src/app/api/admin/media/optimize/` | Sharp batch optimization shrinks images to responsive WebP with 0 CLS | Done (Phase 5) |
| **R18** | Click/view tracking per place visible in Admin Analytics | Phase 7 | `src/lib/analytics.ts`, `src/app/admin/components/AnalyticsTab.tsx` | Place views/clicks tracked in `events` table; top charts in admin | Done (Phase 7) |
| **R19** | Proximity and co-viewed place recommendations | Phase 7 | `src/lib/recommend.ts`, `src/components/RecommendationCarousel.tsx` | "Nearby & you might like" carousel renders Haversine & co-occurrence suggestions | Done (Phase 7) |
| **R20** | Visitor journey paths saved as JSON for recommendations | Phase 7 | `src/lib/db/analytics.ts`, `src/app/api/events/route.ts` | Ordered place views stored as JSON array; downloadable in admin | Done (Phase 7) |
| **R21** | 5 non-disruptive ad placements, switchable in admin | Phase 8 | `src/components/AdPlacement.tsx`, `src/app/admin/components/AdManagerTab.tsx` | 5 designated slots render only when enabled; disappear completely when OFF | Done (Phase 8) |
| **R22** | Google AdSense backend ready, disabled by default | Phase 8 | `src/components/AdSenseScript.tsx`, `public/ads.txt` | AdSense integration present; remains inactive until toggle enabled | Done (Phase 8) |
| **R23** | AI Chatbot (Gemini): editable prompt, guest limits, place tools | Phase 9 | `src/lib/gemini.ts`, `src/components/AIChatPanel.tsx`, `src/app/api/chat/` | Left slide-in panel; 2-message guest limit; read-only DB tools; refuse off-topic | Done (Phase 9) |
| **R24** | AI News: Gemini 3x daily, tourism-focused, calm tone | Phase 10 | `src/lib/news/crawler.ts`, `src/lib/db/news.ts`, `src/app/news/page.tsx`, `src/app/api/news/`, `src/app/admin/components/NewsManagerTab.tsx` | Scheduled crawler with Google Search grounding, 8 category chips, admin moderation, zero-gap rule | Done (Phase 10) |
| **R25** | Full clean-up of unused files and dependencies | Phase 13 | `CLEANUP_REPORT.md`, project root, `package.json` | Stray test files removed; no dead imports; build passes cleanly | Planned (Phase 13) |
| **R26** | Performance budget: no mobile lag, Lighthouse check | Phase 0, 6, 9, 13 | `docs/PERFORMANCE.md` | Mobile Lighthouse ≥ 90; bundle size tracked; zero CLS | Planned (Phase 0, 6, 9, 13) |
| **R27** | Everything mobile-optimized (touch targets ≥ 44px) | All | All components | Tested at 390px, 768px, 1440px with responsive sheets and tab bar | Done (Phase 6) |
| **R28** | Trip To-Do List (`/trips`) with Map side-panel & suggestions | Phase 11 | `src/app/trips/page.tsx`, `src/components/TripMapSidePanel.tsx`, `src/lib/db/trips.ts`, `src/context/TripContext.tsx` | Multi-trip manager, guest localStorage sync, Leaflet route map, co-occurrence recommender, share link | Done (Phase 11) |
| **R29** | Strict RBAC permissions table | Phase 3 | `src/lib/permissions.ts` | Matrix enforced on all API routes; non-owners blocked from destructive calls | Done (Phase 3) |
| **R30** | Public user "Add a place" form with approval workflow | Phase 5 | `src/app/submit-place/page.tsx`, `src/app/admin/tabs/ApprovalsTab.tsx` | Normal users submit places to Pending; staff review and approve | Done (Phase 5) |
| **R31** | Extra admin features (Maintenance mode, Announcement, SEO, Backup) | Phase 4, 5 | `src/app/admin/tabs/SettingsTab.tsx`, `src/app/admin/tabs/JobsTab.tsx` | Maintenance banner, sitemap settings, error viewer, jobs runner active | Planned (Phase 4, 5) |
| **R32** | Final site contains everything listed in master spec | All | All routes & components | End-to-end verification checklist passes across all phases | Planned (All) |
| **R33** | Simple and friendly UI/UX throughout | All | `src/app/globals.css`, `DESIGN_SYSTEM.md` | Clear typography, friendly empty states, soft shadows, 0 clutter | Planned (All) |
| **R34** | About page with editable village story blocks | Phase 12 | `src/app/about/page.tsx`, `src/app/admin/tabs/AboutEditor.tsx` | Editable story blocks in admin; placeholder text with SERANDIB CO. credit | Planned (Phase 12) |
| **R35** | Fogg Behavior Model applied to every screen | All | All pages | Motivation, Ability (Simplicity), Triggers (Spark, Facilitator, Signal) clear | Planned (All) |
| **R36** | Destinations list page structured like Tripadvisor restaurants | Phase 6 | `src/app/destinations/page.tsx` | Left filter bar, ranked cards, review snippets, pagination | Done (Phase 6) |
| **R37** | Destination detail page structured like Tripadvisor hotel page | Phase 5, 6 | `src/app/places/[id]/page.tsx`, `src/components/PhotoMosaic.tsx` | Photo mosaic, plan visit card, traveler love row, reviews with photos & replies | Done (Phase 6) |
| **R38** | AI panel like Tripadvisor AI Assistant with trip proposals | Phase 9, 11 | `src/components/AIChatPanel.tsx`, `src/components/AITripProposalCard.tsx` | Left drawer, `@place` autocomplete, propose itinerary -> "Add to trip" | Done (Phase 9) |
| **R39** | Page blocks as collapsible folders with chevron cue | Phase 4, 6 | `src/components/Folder.tsx` | Smooth expand/collapse, chevron cue, accessible ARIA attributes | Done (Phase 6) |
| **R40** | Only owner can delete; delete request workflow + notifications | Phase 3 | `src/app/api/admin/requests/`, `src/app/admin/tabs/TrashTab.tsx` | Delete action queues request; owner approves -> moves to trash (30d) | Done (Phase 3) |
| **R41** | Long prompt phased execution with continuous verification | Phase 0 | `TASKS.md`, `DECISIONS.md`, `REQUIREMENTS_TRACE.md` | Phases 0–14 executed systematically with automated build tests | Done (Phase 0) |
