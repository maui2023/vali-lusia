# DESIGN.md — Vali-Lusia CSAT (Andalusia Travel & Tours)

> Living design brief for Vali-Lusia Customer Satisfaction & Experience System.
> Built following antiwebslop principles: crafted, tactile, respectful of brand reality, mobile-first responsive.

## 1. Product truth
- **Users:** Umrah and travel pilgrims (jemaah) of all age groups, including senior citizens, completing surveys post-trip on mobile devices (iOS Safari and Android Chrome).
- **Purpose:** Collect structured feedback on hotel accommodations, food quality, ziarah sites, and Andalusian corporate service across Egypt, Madinah, and Mekah, computing a live customer satisfaction index (CSAT) and visual graph.
- **Constraints:** Must operate offline-first without external CDN runtime dependencies, must maintain full keyboard accessibility and touch ergonomics (minimum 44px targets), and adhere to Andalusia corporate branding.
- **Success means:** Pilgrims complete the survey in under 2 minutes without cognitive fatigue or scrolling lockups; operational officers get actionable review metrics and direct service recovery channels.
- **Real content available:** Official Andalusia Travel & Tours address, customer care numbers, verified package classifications, and structured destination datasets.

## 2. Design Read and surface types
| Surface | Type | V | M | D |
|---|---|---|---|---|
| index.html (CSAT Form) | persuade / survey | 4 | 2 | 5 |
| status.html (Verification Portal) | operate / read | 3 | 1 | 6 |
| admin_review.html (Operations Dashboard) | operate | 2 | 1 | 7 |

## 3. Visual direction and project bans
- **Direction:** High-contrast editorial typography, tactile numeric rating chips (2 / 1 / 0), solid surfaces with crisp 1px borders, and mobile thumb-zone action docks.
- **Bans:** No emoji as bullets, icons, or ratings; no purple or rainbow gradients; no decorative glassmorphism or blur orbs; no generic AI marketing copy; no transition: all; no side-stripe tab borders.
- **Allowed exceptions:** Forest emerald `#047857` and sand gold `#b45309` are official corporate brand identity colors of Andalusia Travel & Tours.

## 4. Color tokens

```design-tokens
fonts: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif
colors: #047857, #065f46, #064e3b, #ecfdf5, #a7f3d0, #0f172a, #1e293b, #334155, #475569, #64748b, #94a3b8, #b45309, #d97706, #92400e, #78350f, #854d0e, #713f12, #fef3c7, #fde68a, #fcd34d, #fbbf24, #f8fafc, #f1f5f9, #ffffff, #fafdfb, #fffaf0, #fffbeb, #fefce8, #fef08a, #e2e8f0, #cbd5e1, #10b981, #059669, #d1fae5, #6ee7b7, #f59e0b, #ef4444, #dc2626, #b91c1c, #991b1b, #f87171, #fef2f2, #fee2e2, #fecaca, #fca5a5
radii: 0, 4px, 6px, 8px, 10px, 12px, 16px, 24px, 50%, 9999px
```

| Token | Value | Job |
|---|---|---|
| `--primary` | #047857 | Primary brand emerald, key actions, high scores |
| `--primary-hover` | #065f46 | Active and hover states |
| `--primary-dark` | #064e3b | Header background surface |
| `--primary-light` | #ecfdf5 | Tinted container backgrounds |
| `--gold` | #b45309 | Royal Andalusian gold accent |
| `--bg-page` | #f8fafc | Slate off-white canvas |
| `--bg-card` | #ffffff | Crisp opaque card surface |
| `--text-main` | #0f172a | Deep charcoal high-contrast ink |
| `--text-muted` | #64748b | Secondary labels (meets WCAG AA) |
| `--border-color` | #e2e8f0 | Clean 1px hairlines |

## 5. Typography
- Display & Text: System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`). Zero extra network bytes, immediate rendering.
- Scale: 12px (helper), 14px (body-sm), 16px (body), 18px (subhead), 22px (section), 28px (display).
- Headers: `text-wrap: balance` to prevent awkward line breaks on narrow phone screens.
- Prose: `text-wrap: pretty` and capped measure (`max-width: 65ch`).

## 6. Spacing and layout
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px.
- Grid: Single column card container (max 720px), responsive 3-column tactile rating chips.
- Mobile Layout: Sticky bottom navigation bar for quick one-thumb submission on handheld devices.

## 7. Components
- Rating Chips: Segmented tactile boxes with bold numbers `2` (Cemerlang), `1` (Memuaskan), `0` (Kurang Memuaskan).
- Modal Dialog: `100dvh` responsive container with pinned header, scrollable body, and locked background scroll.
- Focus: `:focus-visible` with 2px solid brand ring and 2px offset.

## 8. Motion
- Micro-interactions only: `transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease`.
- Zero motion on reduced-motion preference (`@media (prefers-reduced-motion: reduce)`).

## 9. Decision log
- 2026-11-24: Full migration from legacy generic AI slop to handcrafted Andalusia corporate identity. Replaced emoji soup with crisp inline SVG glyphs and structured typography.
