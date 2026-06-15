# AcademIQ LMS — Design Tokens

## Status: CONFIRMED from screenshot analysis (2026-06-15)

---

## Fonts

| Role | Family | Source |
|---|---|---|
| Heading / Brand | `DM Serif Display` | CONFIRMED — bold serif, high contrast strokes, distinctive in screenshot |
| Body / UI | `DM Sans` | CONFIRMED — clean geometric sans used for body and labels |
| Data / Numbers | `Share Tech Mono` | RemoteLab addition (engineering numbers) |

---

## Color Palette (CONFIRMED)

### Background & Surface
| Token | Value | Usage |
|---|---|---|
| `--lms-bg` | `#f0edf9` | Page background — light lavender |
| `--lms-surface` | `#f8f5fe` | Elevated surface (status bar bg) |
| `--lms-card` | `#ffffff` | Card/panel background |
| `--lms-card-border` | `#e5dff5` | Card borders |
| `--lms-primary-muted` | `#ede8f9` | Icon badge backgrounds |

### Brand / Primary
| Token | Value | Usage |
|---|---|---|
| `--lms-primary` | `#6D28D9` | Main violet — buttons, links, active states |
| `--lms-primary-dark` | `#5B21B6` | Logo hex, hover states |
| `--lms-primary-light` | `#7C3AED` | Lighter violet for accents |
| `--lms-primary-fg` | `#ffffff` | Text on primary |

### Text
| Token | Value | Usage |
|---|---|---|
| `--lms-foreground` | `#1a1233` | Headings — near-black with violet undertone |
| `--lms-body` | `#4a4168` | Body text — medium dark purple-gray |
| `--lms-muted-fg` | `#9990b0` | Muted/placeholder text |

### Geometry
| Token | Value |
|---|---|
| Border radius (card) | `16px` |
| Border radius (button/input) | `8px` |
| Border radius (badge) | `9999px` |
| Card shadow | `0 1px 3px 0 rgb(109 40 217 / 0.08)` |

---

## How RemoteLab Harmonises

- **Status bar** uses LMS background (#f8f5fe) and violet brand color — acts as visual bridge
- **DM Sans** replaces Inter for all UI text labels in RemoteLab
- **Violet (#6D28D9)** replaces generic blue (#00b0ff) as the info/data color in graphs
- **Dark panels** contrast intentionally — expected for hardware control interfaces
- Focus rings and interactive states use LMS violet

---

## DevTools Verification

Run this in browser console on academiq-five.vercel.app to dump actual CSS variables:

```js
const vars = [...document.styleSheets]
  .flatMap(s => { try { return [...s.cssRules] } catch(e) { return [] } })
  .filter(r => r.selectorText === ':root')
  .flatMap(r => r.cssText.match(/--[\w-]+:\s*[^;]+/g) || [])
console.log(vars.join('\n'))
const s = getComputedStyle(document.documentElement)
console.log('font:', s.fontFamily, 'bg:', s.backgroundColor)
```
