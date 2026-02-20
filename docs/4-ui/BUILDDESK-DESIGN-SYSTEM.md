# BuildDesk Design System v2.0

**The definitive style guide for RossOS Construction Management Platform**

---

## Core Philosophy

### RESTRAINED COLOR

Color is **precious and purposeful**. Only status badges, alerts, and attention-required items get color. Everything else uses warm gray neutrals for a sophisticated, professional appearance.

> "The best interface is one that disappears. Color should inform, not decorate."

---

## Color Palette

### Stone Blue — Primary (CTAs & Active States)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `stone-50` | #f4f7f8 | 244,247,248 | Hover backgrounds, subtle accents |
| `stone-100` | #e2eaed | 226,234,237 | Light borders, dividers |
| `stone-200` | #c5d5db | 197,213,219 | Input borders |
| `stone-300` | #9db5c0 | 157,181,192 | Focus rings |
| `stone-400` | #7499a8 | 116,153,168 | Muted actions |
| `stone-500` | #537d8d | 83,125,141 | Secondary buttons |
| `stone-600` | #456878 | 69,104,120 | Active states |
| `stone-700` | #3b5564 | 59,85,100 | **PRIMARY CTAs** |
| `stone-800` | #354854 | 53,72,84 | Hover on primary |
| `stone-900` | #2f3d48 | 47,61,72 | Headings, strong text |
| `stone-950` | #1b272f | 27,39,47 | Maximum contrast |

### Warm Sand — Accent (Secondary Actions)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `sand-50` | #faf8f5 | 250,248,245 | Accent backgrounds |
| `sand-100` | #f2ede6 | 242,237,230 | Light accent panels |
| `sand-200` | #e4d9cb | 228,217,203 | Accent borders |
| `sand-300` | #d3c0aa | 211,192,170 | — |
| `sand-400` | #c1a488 | 193,164,136 | — |
| `sand-500` | #b5906f | 181,144,111 | — |
| `sand-600` | #a87d63 | 168,125,99 | **SECONDARY ACCENT** |
| `sand-700` | #8c6553 | 140,101,83 | Hover on accent |
| `sand-800` | #735447 | 115,84,71 | — |
| `sand-900` | #5e463c | 94,70,60 | — |

### Warm Gray — Neutrals (Backgrounds, Text, Borders)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `warm-0` | #ffffff | 255,255,255 | Cards, inputs, modals |
| `warm-25` | #fdfcfb | 253,252,251 | Subtle tint |
| `warm-50` | #faf9f7 | 250,249,247 | **PAGE BACKGROUNDS** |
| `warm-100` | #f3f2ef | 243,242,239 | Hover states, sections |
| `warm-200` | #e8e6e1 | 232,230,225 | **BORDERS** |
| `warm-300` | #d4d1cb | 212,209,203 | Disabled states |
| `warm-400` | #b5b1a9 | 181,177,169 | Placeholder text |
| `warm-500` | #96918a | 150,145,138 | Secondary text |
| `warm-600` | #7a766f | 122,118,111 | Body text (light) |
| `warm-700` | #64615b | 100,97,91 | Body text (default) |
| `warm-800` | #4a4843 | 74,72,67 | **PRIMARY TEXT** |
| `warm-900` | #33312e | 51,49,46 | Strong headings |
| `warm-950` | #1e1d1b | 30,29,27 | Maximum emphasis |

### Status Colors — USE SPARINGLY

Only for badges, alerts, and status indicators. Never for backgrounds or decorative elements.

| Status | Background | Text | Dot/Icon |
|--------|------------|------|----------|
| Success | `success-bg` #f0f7f1 | `success` #3d8b4d | `success` #3d8b4d |
| Warning | `warning-bg` #fdf6ec | `warning` #b8860b | `warning` #b8860b |
| Danger | `danger-bg` #fdf1f0 | `danger` #c4463a | `danger` #c4463a |
| Info | `info-bg` #eff5fa | `info` #4a7fa5 | `info` #4a7fa5 |

---

## Typography

### Font Families

| Purpose | Font | Fallback Stack |
|---------|------|----------------|
| Headings | Source Serif 4 | Georgia, serif |
| Body | IBM Plex Sans | -apple-system, BlinkMacSystemFont, sans-serif |
| Code | SF Mono | Menlo, Consolas, monospace |

### Type Scale

```css
--text-2xs: 0.6875rem;  /* 11px - Tiny labels */
--text-xs: 0.75rem;     /* 12px - Small labels, badges */
--text-sm: 0.8125rem;   /* 13px - Secondary text */
--text-base: 0.875rem;  /* 14px - Body text */
--text-md: 0.9375rem;   /* 15px - Emphasis */
--text-lg: 1.0625rem;   /* 17px - Section titles */
--text-xl: 1.25rem;     /* 20px - Page titles */
--text-2xl: 1.5rem;     /* 24px - Headers */
--text-3xl: 1.875rem;   /* 30px - Large headers */
--text-4xl: 2.375rem;   /* 38px - Hero text */
```

---

## Component Patterns

### Buttons

```tsx
// Primary CTA - Stone Blue
<button className="bg-stone-700 text-white hover:bg-stone-600 px-4 py-2 rounded-md">
  Primary Action
</button>

// Secondary - Sand Accent
<button className="bg-sand-600 text-white hover:bg-sand-700 px-4 py-2 rounded-md">
  Secondary Action
</button>

// Ghost Button
<button className="text-warm-700 hover:bg-warm-100 px-4 py-2 rounded-md">
  Ghost Action
</button>

// Outline Button
<button className="border border-warm-200 text-warm-700 hover:bg-warm-50 px-4 py-2 rounded-md">
  Outline Action
</button>
```

### Status Badges

```tsx
// Success Badge
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success-bg text-success">
  <span className="w-1.5 h-1.5 rounded-full bg-success" />
  Approved
</span>

// Warning Badge
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning-bg text-warning">
  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
  Pending
</span>

// Danger Badge
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger-bg text-danger">
  <span className="w-1.5 h-1.5 rounded-full bg-danger" />
  Overdue
</span>

// Neutral Badge (most common)
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warm-100 text-warm-600">
  <span className="w-1.5 h-1.5 rounded-full bg-warm-400" />
  Draft
</span>
```

### Cards

```tsx
<div className="bg-warm-0 border border-warm-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
  <h3 className="font-display text-lg font-semibold text-stone-900">Card Title</h3>
  <p className="text-warm-600 text-sm mt-1">Card description</p>
</div>
```

### Panels & Sections

```tsx
// DO: Neutral background
<div className="bg-warm-50 border border-warm-200 rounded-lg p-4">
  Content here
</div>

// DON'T: Colorful background
<div className="bg-gradient-to-r from-purple-50 to-indigo-50">
  ❌ Never do this
</div>
```

### Tables

```tsx
<table className="w-full">
  <thead>
    <tr className="bg-warm-50 border-b border-warm-200">
      <th className="text-left text-xs font-semibold text-warm-500 uppercase tracking-wide px-4 py-2">
        Column
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-warm-100 hover:bg-warm-25">
      <td className="px-4 py-3 text-sm text-warm-700">
        Cell content
      </td>
    </tr>
  </tbody>
</table>
```

### Inputs

```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-warm-200 rounded-md
             bg-warm-0 text-warm-800 placeholder:text-warm-400
             focus:border-stone-400 focus:ring-2 focus:ring-stone-300/30"
  placeholder="Enter value..."
/>
```

---

## Do's and Don'ts

### ✅ DO

- Use `bg-warm-50` for page backgrounds
- Use `bg-warm-0` (white) for cards and inputs
- Use `border-warm-200` for all borders
- Use `text-warm-800` for primary text
- Use `text-warm-500` for secondary text
- Use `bg-stone-700` for primary CTAs
- Use status colors ONLY on badges and alerts
- Keep icons in `text-warm-500` or `text-stone-600`

### ❌ DON'T

- Never use gradient backgrounds (`bg-gradient-to-*`)
- Never use colorful panel backgrounds (`bg-blue-50`, `bg-purple-100`)
- Never use multiple competing accent colors
- Never use blue/purple/pink for non-status elements
- Never use gray instead of warm (cold vs warm)
- Never use colorful icons (keep them neutral or stone)

---

## CSS Custom Properties

All BuildDesk colors are defined in `globals.css` and available as Tailwind classes:

```css
/* Stone Blue (primary) */
bg-stone-{50-950}
text-stone-{50-950}
border-stone-{50-950}

/* Sand (accent) */
bg-sand-{50-900}
text-sand-{50-900}
border-sand-{50-900}

/* Warm Gray (neutrals) */
bg-warm-{0-950}
text-warm-{0-950}
border-warm-{0-950}

/* Status colors */
bg-success-bg, text-success, text-success-dark
bg-warning-bg, text-warning, text-warning-dark
bg-danger-bg, text-danger, text-danger-dark
bg-info-bg, text-info, text-info-dark
```

---

## Spacing Scale

```css
--sp-0: 0;
--sp-px: 1px;
--sp-0-5: 2px;
--sp-1: 4px;
--sp-1-5: 6px;
--sp-2: 8px;
--sp-2-5: 10px;
--sp-3: 12px;
--sp-4: 16px;
--sp-5: 20px;
--sp-6: 24px;
--sp-8: 32px;
--sp-10: 40px;
--sp-12: 48px;
--sp-16: 64px;
```

---

## Border Radius Scale

```css
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 10px;
--radius-xl: 14px;
--radius-2xl: 18px;
--radius-full: 9999px;
```

---

## Shadow Scale

```css
--shadow-xs: 0 1px 2px rgba(30,29,27,.04);
--shadow-sm: 0 1px 3px rgba(30,29,27,.05), 0 1px 2px rgba(30,29,27,.03);
--shadow-md: 0 4px 6px -1px rgba(30,29,27,.06), 0 2px 4px -2px rgba(30,29,27,.04);
--shadow-lg: 0 10px 15px -3px rgba(30,29,27,.07), 0 4px 6px -4px rgba(30,29,27,.03);
--shadow-xl: 0 20px 25px -5px rgba(30,29,27,.08), 0 8px 10px -6px rgba(30,29,27,.03);
--shadow-focus: 0 0 0 2px #ffffff, 0 0 0 4px #9db5c0;
```

---

## Animation Tokens

```css
--ease-out: cubic-bezier(.16,1,.3,1);
--ease-spring: cubic-bezier(.34,1.56,.64,1);
--dur-fast: 100ms;
--dur-norm: 180ms;
--dur-slow: 300ms;
```

---

## File Reference

| File | Purpose |
|------|---------|
| `app/src/app/globals.css` | All CSS custom properties and animations |
| `app/src/components/ui/button.tsx` | Button variants (default, accent, ghost, etc.) |
| `app/src/components/ui/badge.tsx` | Badge variants |
| `app/src/components/ui/card.tsx` | Card compound component |
| `app/src/lib/utils.ts` | `cn()` utility, `getStatusColor()` |
| `docs/ui/BUILDDESK-DESIGN-SYSTEM.md` | This file |

---

*BuildDesk Design System v2.0 — Last updated February 2026*
