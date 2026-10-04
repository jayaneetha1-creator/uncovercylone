# Current Architecture Summary (Baseline)

1. **Framework & Runtime**: Next.js 16 (App Router with Turbopack), React 19, TypeScript strict mode on Node.js 22 LTS.
2. **Styling & Design System**: Tailwind CSS v4 with custom CSS variable design tokens and a light-blue airy theme (#F5FAFF, #38A9F0).
3. **Data Storage**: Local SQLite database (`data/uncoverceylon.db`) accessed via `better-sqlite3` using Write-Ahead Logging (WAL) mode.
4. **Data Models**: 6 core tables (`places`, `hero_slides`, `region_slides`, `reviews`, `site_settings`, `admin_logs`).
5. **App Routing**: 8 public page routes (`/`, `/about`, `/favorites`, `/map`, `/offline`, `/privacy`, `/terms`, `/places/[id]`).
6. **Admin Module**: Single-page administration dashboard at `/admin` utilizing modal editors (`DestinationEditorModal`).
7. **Image System**: Local storage in `public/uploads/`, compressed via Sharp, served through `/api/uploads/[...path]`.
8. **Mapping & Geolocation**: Leaflet and React-Leaflet with client-side Supercluster point clustering.
9. **State Contexts**: 4 React contexts (`CurrencyContext`, `LanguageContext`, `LocationContext`, `WishlistContext`).
10. **Bilingual Support**: Dual language support (English and Sinhala) with synchronous dictionary and context switching.
11. **Offline & PWA**: Progressive Web App configured via `public/manifest.json` and client service worker `public/sw.js`.
12. **Security & Auth**: Basic single admin password verification endpoint (`/api/admin/verify`) without role-based access control.
13. **Backend APIs**: Next.js route handlers in `src/app/api/` for destinations, reviews, file upload, and database backup.
14. **Discovery & Filtering**: Client-side filtering by keyword, interest category, sort options, and browser GPS proximity.
15. **Infrastructure & Hosting**: Running on Ubuntu 22.04 LTS VPS orchestrated by PM2 process daemon behind Nginx reverse proxy.
