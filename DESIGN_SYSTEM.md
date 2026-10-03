# UncoverCeylon Design System

## 1. Brand Philosophy
**UncoverCeylon** is a serene, reliable, and deeply respectful guide to the island of Sri Lanka.
Our design identity is **light-blue, airy, clean, and honest**. We avoid noisy travel-agency clutter, aggressive marketing badges, and dark heavy blocks. Every screen gives travelers breathing room, crystal-clear facts in seconds, and effortless paths to discovery.

---

## 2. Color Tokens

### Core Palette (Light-Blue Airy Theme)
| Token Name | Hex Code | Role / Usage |
| :--- | :--- | :--- |
| `--background` | `#F5FAFF` | Very light blue-white page canvas |
| `--surface` | `#FFFFFF` | Cards, elevated sheets, content panels |
| `--surface-subtle` | `#EAF4FD` | Section backgrounds, pill tags, filter bars |
| `--primary` | `#38A9F0` | Brand light-blue for primary links, accents, icons |
| `--primary-hover` | `#1E93DC` | Hover & active states for primary buttons |
| `--primary-tint` | `#DCEFFD` | Soft background for badges, active chips, icon pills |
| `--text-deep` | `#0F2A3D` | High-contrast body text and headings (WCAG AAA compliant) |
| `--text-secondary` | `#5B7385` | Subtitles, captions, metadata labels |
| `--border` | `#DCE8F2` | Subtle hairline borders separating content |
| `--accent-sunset` | `#F5A623` | Warm amber used strictly for key triggers / best-time highlights |

### Feedback Tokens
- **Success**: `#2FB67C` (Active seasons, verified pins, positive confirmations)
- **Warning**: `#F5A623` (Advisory notes, timing warnings)
- **Error**: `#E5484D` (Network errors, missing items)

### Rules on Colors
- **Max 1 warm accent per screen section**: Sunset amber is reserved for specific motivational sparks (e.g., "Best time right now" or active CTA).
- **No heavy dark-navy blocks**: Navy is eliminated in favor of clean light surfaces with soft borders.

---

## 3. Typography & Hierarchy

Font Family: **Inter** (with system fallback and Sinhala Unicode support for Noto Sans Sinhala).

| Scale | Size / Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- |
| **Hero Title** | 44px (mobile 32px) / 1.15 | -0.025em | Main hero headlines |
| **Section H2** | 32px (mobile 24px) / 1.25 | -0.02em | Section titles |
| **Subheading H3** | 24px (mobile 20px) / 1.3 | -0.015em | Card clusters, modal headings |
| **Card Title H4** | 18px (mobile 16px) / 1.35 | -0.01em | Destination card headings (max 2 lines) |
| **Body Large** | 16px / 1.6 | 0 | Lead paragraphs, intro copy |
| **Body Regular** | 14px (mobile min 14px) / 1.6 | 0 | Card descriptions, body copy |
| **Caption / Pill** | 12px / 1.4 | +0.02em | Badges, distance pills, entry fees |

**Mobile Constraint**: Minimum 16px on form inputs to prevent automatic iOS safari viewport zooming.

---

## 4. Spacing & Shape (8px Grid)

- **Cards Radius**: `16px` (`rounded-2xl`)
- **Buttons / Chips**: `12px` (`rounded-xl`) or fully rounded (`rounded-full`)
- **Shadows**:
  - `shadow-soft`: `0 2px 8px -2px rgba(15, 42, 61, 0.04), 0 8px 24px -4px rgba(56, 169, 240, 0.08)`
  - `shadow-hover`: `0 12px 32px -6px rgba(15, 42, 61, 0.08), 0 4px 12px -2px rgba(56, 169, 240, 0.12)`
- **Container Max-Width**: `1200px` (`max-w-7xl` centered)
- **Vertical Section Spacing**: Desktop `64px–80px` / Mobile `40px`

---

## 5. Motion & Transitions

- **Durations**: `150ms – 250ms`
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)`
- **Permitted Properties**: Only `transform` and `opacity` are animated to ensure GPU acceleration and 0 lag.
- **Card Hover (Desktop only)**: `translateY(-4px)` with shadow softening; image zoom max `scale(1.04)`.
- **Progressive Disclosure**: All content is visible by default so that if JavaScript or an intersection observer is slow, zero content is hidden.
- **Accessibility**: Full support for `@media (prefers-reduced-motion: reduce)`.

---

## 6. Behavior Design Framework (Fogg Model)

Every screen orchestrates **Motivation + Ability + Trigger**:

### A. Motivation (Desire)
- **Hope**: Inspiring imagery, "Great right now" seasonal badges calculated from real travel data.
- **Social Proof**: Honest rating score and traveler review counts without fake counters.
- **Pleasure**: Authentic photography and crisp 1-sentence descriptions.

### B. Ability (Friction Removal)
- **Time**: All critical place facts (location, distance from Colombo/user, rating, price, best season) visible within 2 seconds.
- **Money**: Dual LKR/USD currency display, transparent entry fee chip.
- **Physical Effort**: One-tap directions, sticky thumb-friendly action bar on mobile.
- **Cognitive Load**: Maximum 6 visible category chips + "More", 1 primary action per screen.

### C. Triggers (Action)
- **Spark**: "Start exploring" in hero, curated gems carousel.
- **Facilitator**: "Open in Google Maps", "Save to wishlist", "Near me" GPS locator.
- **Signal**: Header wishlist badge with count, sticky CTA on scroll.

---

## 7. Responsive Matrix

| Feature | Desktop ($\ge 1024\text{px}$) | Tablet ($640–1023\text{px}$) | Mobile ($< 640\text{px}$) |
| :--- | :--- | :--- | :--- |
| **Navigation** | Sticky translucent top bar | Top bar with horizontal scroll | Compact top bar + Bottom Tab Bar |
| **Grid** | 3 or 4 columns | 2 columns | 1 column full-width (16px padding) |
| **Filters** | Horizontal bar with instant sort | Scrollable chip row | Sticky bar + Filter Bottom Sheet |
| **Primary Action** | Sticky sidebar card | Embedded prominent card | Sticky bottom thumb bar |
| **Touch Targets** | Standard mouse targets | $\ge 40\text{px}$ targets | $\ge 44\text{px}$ touch targets |

---

## 8. Do's & Don'ts

### DO
- Use light-blue tinted backgrounds (`#F5FAFF`) and clean white cards.
- Show entry fee early and clearly ("Free" or localized price).
- Provide descriptive Sinhala/English alt text on all imagery.
- Ensure all text has $\ge 4.5:1$ contrast against its background.

### DON'T
- Do not use dark navy slabs, dark footers, or dark map headers.
- Do not use fake scarcity ("3 rooms left!", "5 travelers viewing now").
- Do not use mid-word truncated titles.
- Do not place multiple competing primary buttons in the same viewport.
