# Admin Panel Feature Audit (ADMIN_AUDIT.md)

Following the specification in **Phase 5** and **Section 5** of `MASTER_SPEC.md`, this document audits every existing administrative capability, interface component, and route, classifying each as **KEEP**, **SIMPLIFY**, or **REMOVE**.

---

## 1. Executive Summary

| Category | KEEP | SIMPLIFY | REMOVE | Total Audited |
| :--- | :---: | :---: | :---: | :---: |
| **Places & Locations** | 2 | 4 | 2 | 8 |
| **Slides & Hero Visuals** | 2 | 2 | 1 | 5 |
| **Reviews & Moderation** | 3 | 2 | 0 | 5 |
| **Media & Uploads** | 2 | 2 | 1 | 5 |
| **Logs, Backup & Database** | 3 | 2 | 1 | 6 |
| **Total Features** | **12** | **12** | **5** | **29** |

---

## 2. Feature-by-Feature Audit Matrix

### A. Places & Location Management

1. **Destinations Table (List, Sort, Filter, Pagination)**
   - *Status*: **KEEP**
   - *Audit Evaluation*: Clean, responsive table showing title, category, province, rating, and actions.
   - *Action*: Retain with standardized light-blue airy styling tokens.

2. **Destination Search & Filters**
   - *Status*: **SIMPLIFY**
   - *Audit Evaluation*: Search bar had redundant province/featured filters and overly complex cascading state.
   - *Action*: Consolidate search bar and primary filters into a clean one-line toolbar; tuck secondary filter chips behind a simple "Filters" dropdown.

3. **Multi-Tab Modal Editor (`DestinationEditorModal.tsx`)**
   - *Status*: **SIMPLIFY**
   - *Audit Evaluation*: Had 5 different tab sub-screens (Basic, Location, Media, Highlights, SEO). Hard for the owner to scan quickly on mobile or laptop.
   - *Action*: Consolidate all essential fields onto **ONE primary screen** (Title EN/SI, category, province, location address, coordinates, cover image, fee LKR/USD, description). Place advanced optional fields (custom hours, seasonal timing, difficulty, insider tips, gallery photos) behind a tidy **"＋ Additional Details"** collapsible accordion panel.

4. **Interactive Map Location Picker (`MapLocationPicker.tsx`)**
   - *Status*: **KEEP**
   - *Audit Evaluation*: Essential for pinning precise coordinates in Sri Lanka without manual lat/lng entry.
   - *Action*: Retain, ensuring clean fallback to default Colombo coordinates (6.9271, 79.8612) if geolocation permission is denied.

5. **Bulk Category Switcher**
   - *Status*: **SIMPLIFY**
   - *Audit Evaluation*: Separate bulk selector occupied redundant vertical space above the table.
   - *Action*: Show bulk action toolbar only when one or more rows are selected via checkbox.

6. **Hard Delete Endpoint (`/api/places/bulk` - delete action)**
   - *Status*: **REMOVE / RESTRICT**
   - *Audit Evaluation*: Allowed non-owners to permanently delete destinations without soft-delete protection or change requests.
   - *Action*: Restrict permanent delete to owner only; route all non-owner deletion attempts through `change_requests` and soft-delete `trash` per D14.

7. **Dummy / Repetitive Fields (Fake phone numbers, Fake "100% Verified" badges)**
   - *Status*: **REMOVE**
   - *Audit Evaluation*: Fake metadata creates distrust and clutters the editor.
   - *Action*: Remove fake badges and unverified phone placeholders; hide empty optional fields on public pages.

8. **Bulk CSV / JSON Export & Import**
   - *Status*: **KEEP**
   - *Audit Evaluation*: Highly requested capability for backing up place catalogs.
   - *Action*: Integrated into places toolbar under "＋ More Options".

---

### B. Slides & Hero Visuals

9. **Hero Slide Upload & Direct Storage**
   - *Status*: **KEEP**
   - *Audit Evaluation*: Used for full-width homepage visual backdrop.
   - *Action*: Retain and route newly uploaded slide images through the automated Sharp WebP optimizer.

10. **Hero Slide List & Sort Order**
    - *Status*: **SIMPLIFY**
    - *Audit Evaluation*: Manual numeric input for `sort_order` was confusing.
    - *Action*: Provide simple drag-and-drop or Up/Down move buttons for one-click reordering.

11. **Region Slide Explorer**
    - *Status*: **SIMPLIFY**
    - *Audit Evaluation*: Region slides shared identical form logic with hero slides but had separate redundant code paths.
    - *Action*: Unify into a shared Slides Manager tab with sub-tabs for "Hero Slides" and "Region Slides", supporting bilingual title inputs.

12. **Unvalidated Webpage URL Pasting in Image Fields**
    - *Status*: **REMOVE**
    - *Audit Evaluation*: Users occasionally pasted tripadvisor webpage URLs directly into image inputs, causing broken rendering.
    - *Action*: Validate image extensions and magic bytes server-side and reject HTML/page URLs.

---

### C. Reviews & Moderation

13. **Review Status Filtering (Pending / Approved / Spam)**
    - *Status*: **KEEP**
    - *Audit Evaluation*: Essential for content moderation before traveler reviews go live.
    - *Action*: Retain with quick-action approval buttons.

14. **Review Photo Validation & Traveler Photo Strip**
    - *Status*: **SIMPLIFY**
    - *Audit Evaluation*: Existing system lacked multi-photo upload (up to 5 photos per review) and image optimization.
    - *Action*: Enable up to 5 photos with Sharp thumbnail and WebP generation.

15. **Staff Response Capability**
    - *Status*: **KEEP**
    - *Audit Evaluation*: Critical requirement R37: staff can post official responses with "Response from the UncoverCeylon Team".
    - *Action*: Implement single-reply per review workflow for staff in Admin Reviews tab.

16. **Anonymous Unverified Reviews**
    - *Status*: **REMOVE**
    - *Audit Evaluation*: Unauthenticated visitors posting spam reviews.
    - *Action*: Restrict review submissions strictly to verified logged-in users with one review per place limit.

---

### D. Media & Storage

17. **Disk-Based Image Storage (`public/uploads`)**
    - *Status*: **KEEP**
    - *Audit Evaluation*: Reliable, fast local file storage with zero external S3 lock-in.
    - *Action*: Maintained per R16.

18. **One-Button Batch Image Optimizer**
    - *Status*: **KEEP / NEW**
    - *Audit Evaluation*: Requirement R17 / Section 4.2 requires one-click optimization using Sharp (WebP conversion, EXIF stripping, responsive widths 480/960/1600).
    - *Action*: Build `src/lib/optimizer.ts` and `/api/admin/media/optimize`.

19. **Uncompressed Raw PNG/JPEG Uploads**
    - *Status*: **SIMPLIFY**
    - *Audit Evaluation*: Large multi-megabyte user photos slow down mobile loading.
    - *Action*: Automatically optimize on upload and provide bulk retro-optimizer.

---

### E. Logs, Database & Safety

20. **Administrative Activity Logs**
    - *Status*: **KEEP**
    - *Audit Evaluation*: Provides full operational visibility into staff changes.
    - *Action*: Retain and synchronize with immutable `audit_log` governance table.

21. **Database One-Click Download Backup**
    - *Status*: **KEEP**
    - *Audit Evaluation*: Essential for owner safety before applying schema migrations or major updates.
    - *Action*: Retain, adding automated 14-day retention cycle.

22. **Unauthenticated Public API Access to Administrative Endpoints**
    - *Status*: **REMOVE**
    - *Audit Evaluation*: Security risk.
    - *Action*: Enforce `requirePermission` middleware on all state-changing endpoints.
