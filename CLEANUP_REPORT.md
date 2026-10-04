# UncoverCeylon Cleanup Audit Report (Phase 0 Baseline)

> **Important:** Per Phase 0 specifications, this document is an inventory and assessment list ONLY. No deletions are performed during Phase 0. Cleanup will be executed systematically during Phase 13 after all feature implementations are verified.

---

## 1. Stray Files in Repository Root
The following files in the project root are non-essential artifacts or historical temporary outputs:

| File Path | File Size | Classification | Recommendation |
| :--- | :--- | :--- | :--- |
| `ceylon.db` | 0 bytes | Stray empty database file | Mark for removal in Phase 13 |
| `page_output.html` | ~25 KB | Temporary server-rendered test dump | Mark for removal in Phase 13 |
| `address_bar_local.png` | ~45 KB | Temporary screenshot asset | Mark for removal in Phase 13 |
| `address_bar_skynet.png` | ~48 KB | Temporary screenshot asset | Mark for removal in Phase 13 |

---

## 2. Redundant & One-Off Scripts (`scripts/`)
| Script Name | Purpose / Current State | Recommendation |
| :--- | :--- | :--- |
| `scripts/seed-more-destinations.js` | Legacy destination seeder (superseded by `seed-expanded-destinations.js`) | Deprecated; preserve until MySQL migration in Phase 1 |
| `scripts/fix-shadows.js` | One-off regex replacement script for CSS classes | Completed; schedule removal in Phase 13 |
| `scripts/update-colors.js` | One-off Tailwind palette batch script | Completed; schedule removal in Phase 13 |
| `scripts/generate-pwa-icons.js` | Generates PWA PNG icons from SVG | KEEP as active utility script |
| `scripts/seed-expanded-destinations.js` | Comprehensive 61-place destination seeder | KEEP as reference for MySQL seeding |

---

## 3. Component & Route Usage Audit
- **Dead Routes**: None currently. All 8 routes (`/`, `/about`, `/admin`, `/favorites`, `/map`, `/offline`, `/privacy`, `/terms`, `/places/[id]`) are active.
- **Unused Components**:
  - `src/components/AnimatedReveal.tsx`: Replaced by standard CSS transitions and progressive reveal components; verify usage before Phase 13.
  - `src/components/OfflineGuideButton.tsx`: Currently embedded inside `OfflineGuideModal`; review for consolidation.
- **Legacy Dependencies to Review in Phase 13**:
  - `better-sqlite3`: To be replaced by `mysql2` connection pool in Phase 1. Once MySQL migration is fully verified, SQLite dependencies will be cleanly uninstalled in Phase 13.

---

## 4. Console Logging Inventory (`console.log`, `warn`, `error`)
- `PWARegister.tsx:17`: `console.log('[PWA] Service Worker registered...')` -> To be replaced with logger or removed in production.
- `PWARegister.tsx:20`: `console.warn('[PWA] Service Worker registration failed...')` -> Retain graceful error logging.
- `src/app/api/**`: Error boundary logs in `try/catch` blocks currently write raw `console.error(...)`. These will be routed through the unified `audit_log` / server error viewer in Phase 3.

---

## 5. Summary & Action Plan
- **Phase 0 Status**: Audited and documented.
- **Retention**: All data files, backups (`backup_phase0/`), and uploads (`public/uploads/`) are protected and preserved.
- **Execution**: Physical file removal will take place strictly during Phase 13 as mandated by the master specification.
