# AcademIQ LMS — Design Tokens

## Extraction Status

| Method | Result |
|---|---|
| WebFetch HTML scrape | Stripped by tool — no CSS visible |
| Next.js static chunk fetch | 404 (hashed filenames) |
| Build manifest fetch | 404 |
| Web manifest / site.webmanifest | 404 |
| GitHub repo search | Repo is private |
| Google Fonts link detection | Stripped by tool |

**All values below marked `[INFERRED]` are best-guess harmonisation based on:**
- shadcn/ui defaults (dominant Next.js UI library, 2024–2026)
- Academic/institutional portal conventions
- Confirmed: light mode, clean layout, Next.js stack, "AcademIQ" branding

**Values marked `[CONFIRMED]` were directly observable from the HTML content.**

---

## Confirmed (from HTML)

| Token | Value | Source |
|---|---|---|
| Color mode | Light | `[CONFIRMED]` — no dark-mode classes observed |
| Brand name | AcademIQ | `[CONFIRMED]` |
| Product type | Student Enrolment & Academic Portal | `[CONFIRMED]` |
| Framework | Next.js (App Router) | `[CONFIRMED]` — URL structure, /_next paths |
| Layout | Card-based, two-option split | `[CONFIRMED]` |

---

## Font Families `[INFERRED]`

shadcn/ui projects almost universally use Geist (Vercel's own typeface, default since Next.js 15) or Inter. Given this is hosted on Vercel:

| Role | Font | Fallback | Notes |
|---|---|---|---|
| Heading | `Geist` | `Inter`, `system-ui` | Default Next.js 15 + Vercel stack |
| Body / UI | `Geist` | `Inter`, `sans-serif` | Same family, different weight |
| Monospace | `Geist Mono` | `monospace` | For code/IDs if used |

**TO VERIFY:** Open DevTools → Elements → select `<html>` → Computed → scroll to `font-family`

---

## Color Palette `[INFERRED — shadcn/ui academic-blue customisation]`

### Background & Surface
| Token | Hex | HSL (shadcn format) | Usage |
|---|---|---|---|
| `--background` | `#ffffff` | `hsl(0 0% 100%)` | Page background |
| `--surface` | `#f8fafc` | `hsl(210 40% 98.04%)` | Subtle section bg |
| `--card` | `#ffffff` | `hsl(0 0% 100%)` | Card background |
| `--card-foreground` | `#0f172a` | `hsl(222.2 84% 4.9%)` | Card text |
| `--popover` | `#ffffff` | `hsl(0 0% 100%)` | Dropdown bg |
| `--muted` | `#f1f5f9` | `hsl(210 40% 96.1%)` | Muted bg areas |

### Primary Brand
| Token | Hex | HSL | Notes |
|---|---|---|---|
| `--primary` | `#1d4ed8` | `hsl(221.2 83.2% 53.3%)` | Blue-700 — academic trust |
| `--primary-foreground` | `#f8fafc` | `hsl(210 40% 98%)` | Text on primary |
| `--primary-hover` | `#1e40af` | `hsl(221 83% 43%)` | Button hover |

### Text
| Token | Hex | Usage |
|---|---|---|
| `--foreground` | `#0f172a` | Primary body text (slate-900) |
| `--muted-foreground` | `#64748b` | Secondary text, labels (slate-500) |
| `--subtle-foreground` | `#94a3b8` | Placeholder, disabled (slate-400) |

### Borders & Dividers
| Token | Hex | Usage |
|---|---|---|
| `--border` | `#e2e8f0` | Default borders (slate-200) |
| `--input` | `#e2e8f0` | Input borders |
| `--ring` | `#1d4ed8` | Focus ring (matches primary) |

### Semantic
| Token | Hex | Usage |
|---|---|---|
| `--destructive` | `#ef4444` | Error/delete (red-500) |
| `--destructive-foreground` | `#fef2f2` | Text on destructive |
| `--accent` | `#f1f5f9` | Hover/subtle highlight |
| `--accent-foreground` | `#0f172a` | Text on accent |

---

## Border Radius `[INFERRED]`

shadcn/ui default `--radius: 0.5rem`. Academic portals typically use:

| Element | Value | Notes |
|---|---|---|
| Card | `0.75rem` (12px) | Slightly softer than default |
| Button | `0.5rem` (8px) | shadcn default |
| Input | `0.5rem` (8px) | shadcn default |
| Badge | `9999px` | Pill |
| Dialog | `0.75rem` (12px) | |

---

## Spacing Rhythm `[INFERRED]`

Based on Tailwind 4px base unit, shadcn standard:

| Level | Value | Usage |
|---|---|---|
| xs | `4px` | Tight gaps, icon padding |
| sm | `8px` | Compact spacing |
| md | `16px` | Standard component padding |
| lg | `24px` | Section gaps |
| xl | `32px` | Page section padding |
| 2xl | `48px` | Hero/large section padding |

---

## Shadow / Elevation `[INFERRED]`

shadcn/ui uses minimal shadows:

| Level | Value |
|---|---|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |

Cards likely use `shadow-sm` or `shadow`.

---

## Overall Mood

- **Light mode** — white/off-white, clean
- **Cool-neutral** — slate grays, academic blue primary
- **Professional / institutional** — not playful, not corporate-aggressive
- **Airy** — generous whitespace, clear hierarchy
- **Modern flat** — minimal shadows, clean borders
- **Font character** — geometric sans-serif, high legibility

Comparable to: Notion, Linear, Vercel dashboard — clean tool aesthetic applied to academia.

---

## How RemoteLab Harmonises

RemoteLab is intentionally dark (instrument panel). Inside an iframe, it creates contrast — which is expected for lab hardware interfaces. The harmonisation targets:

1. **Font** — RemoteLab labels/UI text adopts `Inter` / `Geist` to match LMS body text
2. **Blue accent** — LMS primary (`#1d4ed8`) referenced in RemoteLab's info colour and link styles
3. **Border** — the iframe container in the LMS will use `--border: #e2e8f0`; RemoteLab's own internal borders stay dark
4. **Status bar** — matches LMS card surface for the top strip, softening the dark→light transition

---

## TO VERIFY (open DevTools on academiq-five.vercel.app)

Run this in the browser console and paste the output back:
```js
const root = document.documentElement;
const styles = getComputedStyle(root);
const vars = [...document.styleSheets]
  .flatMap(s => { try { return [...s.cssRules] } catch(e) { return [] } })
  .filter(r => r.selectorText === ':root')
  .flatMap(r => r.cssText.match(/--[\w-]+:\s*[^;]+/g) || []);
console.log(vars.join('\n'));
console.log('Font:', styles.fontFamily);
console.log('BG:', styles.backgroundColor);
```
