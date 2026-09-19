# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Kathmandu Photographer
**Generated:** 2026-09-12 11:41:19
**Category:** Photography Studio
**Design Dials:** Variance 2/10 (Centered / Minimal) | Motion 2/10 (Subtle) | Density 3/10 (Spacious)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#18181B` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#27272A` | `--color-secondary` |
| On Secondary | `#FFFFFF` | `--color-on-secondary` |
| Accent/CTA | `#F8FAFC` | `--color-accent` |
| On Accent/CTA | `#0F172A` | `--color-on-accent` |
| Background | `#000000` | `--color-background` |
| Foreground | `#FAFAFA` | `--color-foreground` |
| Card | `#0C0C0C` | `--color-card` |
| Card Foreground | `#FAFAFA` | `--color-card-foreground` |
| Muted | `#181818` | `--color-muted` |
| Muted Foreground | `#94A3B8` | `--color-muted-foreground` |
| Border | `#3F3F46` | `--color-border` |
| Destructive | `#EF4444` | `--color-destructive` |
| On Destructive | `#000000` | `--color-on-destructive` |
| Ring | `#FFFFFF` | `--color-ring` |

**Color Notes:** Pure black + white contrast

### Typography

> **Approved override (2026-09-19):** switched from the original Minimalist
> Portfolio pairing (Archivo + Space Grotesk) to a cinematic editorial serif
> pairing, at the photographer's request for a more dramatic, film-poster feel.

- **Heading Font:** Cormorant Garamond (400–700, italic available; set at 500)
- **Body Font:** Inter (variable)
- **Mood:** cinematic, quiet, editorial — a film-title serif over a plain sans
- **Google Fonts:** [Cormorant Garamond + Inter](https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@100..900&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@100..900&display=swap');
```

> Superseded the Playfair Display + Source Serif 4 pairing (2026-09-19, same
> day) — that read as heavy on a photo-first page; this is lighter and simpler.

### Spacing Variables

*Density: 3/10 — Spacious*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `24px` / `1.5rem` | Standard padding |
| `--space-lg` | `32px` / `2rem` | Section padding |
| `--space-xl` | `48px` / `3rem` | Large gaps |
| `--space-2xl` | `64px` / `4rem` | Section margins |
| `--space-3xl` | `96px` / `6rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #F8FAFC;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #18181B;
  border: 2px solid #18181B;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #000000;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #18181B;
  outline: none;
  box-shadow: 0 0 0 3px #18181B20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Minimalism & Swiss Style

**Keywords:** Clean, simple, spacious, functional, white space, high contrast, geometric, sans-serif, grid-based, essential

**Best For:** Enterprise apps, dashboards, documentation sites, SaaS platforms, professional tools

**Key Effects:** Subtle hover (200-250ms), smooth transitions, sharp shadows if any, clear type hierarchy, fast loading

### Page Pattern

**Pattern Name:** Scroll-Triggered Storytelling

- **Conversion Strategy:** Keep the narrative understandable without scroll-driven effects. Use progress indicator. Mobile: simplify animations. Keep DOM reading order complete; disable parallax and scroll-scrub under reduced motion. Pause scroll animation when offscreen or hidden and render each chapter in its final readable state under reduced motion.
- **CTA Placement:** End of each chapter (mini) + Final climax CTA
- **Section Order:** Intro hook > Chapter 1 (problem) > Chapter 2 (journey) > Chapter 3 (solution) > Climax CTA

---

## Motion

**Scroll Reveal** (Subtle) — Trigger: scroll (viewport enter) | Duration: 300-400ms | Easing: `power1.out`

```js
gsap.from(el, { opacity: 0, y: 12, duration: 0.35, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' } });
```

**Framework notes:** Requires the ScrollTrigger plugin registered once via gsap.registerPlugin(ScrollTrigger); Use matchMedia('(prefers-reduced-motion: reduce)') to skip non-essential motion and render the final state immediately

- ✅ Keep the y offset small (8-16px) so it reads as a fade, not a slide
- ❌ Don't reveal below-the-fold content needed for SEO/crawlers as invisible-by-default without a no-JS fallback
- ⚡ toggleActions 'play none none reverse' avoids re-triggering on every scroll direction change

---

## Anti-Patterns (Do NOT Use)

- ❌ Heavy text
- ❌ Poor image showcase

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile

---

## Approved overrides

These are deliberate, approved departures from the generated output above. Where
this section and the generated output disagree, this section wins.

### 1. Pattern — Portfolio Grid, not Scroll-Triggered Storytelling

The generator resolved the landing pattern to *Scroll-Triggered Storytelling*
(intro hook → three chapters → climax CTA). That pattern is scroll-scrub
choreography and the brief explicitly rules out heavy parallax and entrance
animations that delay the first image; it also does not describe a five-page
site. Replaced with two other exact database rows, both named by the
Photography Studio product row itself:

- `portfolio-grid` — Hero (name/role) → project grid → about/philosophy →
  contact. "Neutral background, let the work shine. Fast loading essential."
- `hero-centric-design` — full-bleed hero, one dominant CTA, sticky nav CTA.

### 2. Colour — light chrome, dark lightbox

The Photography Studio palette in the database is dark-background
(`#000000` / `#FAFAFA`, "Pure black + white contrast"). There is **no**
light-mode Photography Studio row. The brief requires light mode primary, so:

- **Site chrome** uses the *Architecture / Interior* row (an exact database row,
  light background): bg `#FFFFFF`, fg `#171717`, secondary `#404040`,
  muted `#E8ECF0`, muted-fg `#475569`, border `#E5E5E5`, ring `#171717`.
  Its gold accent (`#A16207`) is **dropped** — the photographs supply the colour.
- **Lightbox** keeps the Photography Studio dark surface: `#000000` at 95%,
  `#FAFAFA` foreground, `#3F3F46` borders.

**Superseded:** a light/dark toggle was later added at the author's request. The
site now ships both palettes:

- **Light** — the Architecture / Interior row, as above. Default.
- **Dark** — the Photography Studio row: bg `#000000`, fg `#FAFAFA`,
  muted `#181818`, muted-fg `#94A3B8`, line `#3F3F46`, ring `#FFFFFF`,
  destructive `#EF4444`.

Two dark values deliberately depart from the database row, because contrast
required it:

| Token | Database | Shipped | Why |
|---|---|---|---|
| `--color-secondary` | `#27272A` | `#D4D4D8` | The token also carries body prose (Story page). `#27272A` on black is 1.41:1. |
| `--color-field` | — | `#71717A` | New token for form-control borders, which need 3:1. The divider colour gives 2.0:1 on black — and 1.26:1 on white, so light mode needed it too. |

The theme is resolved before first paint by an inline script writing
`data-theme` onto `<html>`; an explicit choice is stored in `localStorage` and
beats `prefers-color-scheme`. `color-scheme` follows, so native form controls
match. The lightbox stays black in both modes.

### 3. Icons — Lucide, not Phosphor

The icon database indexes Phosphor (`@phosphor-icons/react`). The brief requires
Heroicons or Lucide, so the project uses **Lucide**. This is a brief
requirement, not a database match. The *semantic* rules from the icon rows are
still followed: `aria-hidden="true"` on decorative icons that sit beside visible
text, and an accessible name on every icon-only control.

### 4. Spacing tokens — numeric utilities, not t-shirt names

The density 3/10 scale is unchanged (4 / 8 / 24 / 32 / 48 / 64 / 96px) but is
expressed through Tailwind's numeric spacing utilities (`1 / 2 / 6 / 8 / 12 /
16 / 24`). Defining `--spacing-md`, `--spacing-3xl` and friends in Tailwind v4
also redefines `max-w-md`, `max-w-3xl` and every other width utility that shares
that namespace, which silently collapses layout containers.

### 5. Motion — CSS and a position check, no GSAP

The generated Scroll Reveal (Subtle) preset is implemented as described —
opacity plus a 12px rise, 350ms, ease-out, triggered near the viewport edge —
but in CSS rather than GSAP: it is a single effect and does not justify the
bundle. Two rules apply:

- The hero image is never revealed. It is the LCP element and must not wait.
- The reveal is gated behind a `.js` class set before first paint, so content is
  simply visible when scripting is unavailable. Pricing must never depend on an
  observer having run.
