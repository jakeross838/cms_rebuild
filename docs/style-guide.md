# RossOS Style Guide

**Full UI & code standards are in `docs/standards.md`.** This file covers the design system foundation.

---

## Design System

- **Component library:** shadcn/ui (new-york style)
- **Base color:** Neutral
- **CSS framework:** Tailwind CSS v4
- **Dark mode:** Supported via `next-themes` (class strategy)
- **Typography:** Geist Sans / Geist Mono
- **Icons:** Lucide React

## Adding Components

```bash
cd app
npx shadcn@latest add <component-name>
```

Components are installed to `src/components/ui/`. Configuration lives in `app/components.json`.

Browse available components: https://ui.shadcn.com/docs/components

## Color Tokens

Always use semantic tokens for theme-dependent UI. Never use hardcoded Tailwind color classes (e.g., `bg-gray-200`, `text-blue-600`) for chrome/layout.

### Background

| Token | Light | Dark | Usage |
|---|---|---|---|
| `bg-background` | White | Near-black | Page background |
| `bg-card` | White | Near-black | Card surfaces |
| `bg-popover` | White | Near-black | Dropdowns, menus |
| `bg-muted` | Light gray | Dark gray | Subtle backgrounds, footers |
| `bg-accent` | Light gray | Dark gray | Hover states, active nav items |
| `bg-primary` | Near-black | White | Primary buttons |
| `bg-secondary` | Light gray | Dark gray | Secondary buttons |
| `bg-destructive` | Red | Dark red | Delete buttons, error badges |

### Text

| Token | Usage |
|---|---|
| `text-foreground` | Primary text (headings, body) |
| `text-muted-foreground` | Secondary text (descriptions, labels, placeholders) |
| `text-accent-foreground` | Text on accent backgrounds |
| `text-primary-foreground` | Text on primary backgrounds |
| `text-destructive` | Error text |
| `text-destructive-foreground` | Text on destructive backgrounds |

### Border

| Token | Usage |
|---|---|
| `border-border` | Standard borders |
| `border-input` | Form input borders |

### Focus

| Token | Usage |
|---|---|
| `ring-ring` | Focus ring color |

### Sidebar

| Token | Usage |
|---|---|
| `bg-sidebar-background` | Sidebar container |
| `text-sidebar-foreground` | Sidebar primary text |
| `bg-sidebar-accent` | Sidebar active/hover state |
| `text-sidebar-accent-foreground` | Text on sidebar accent |
| `text-sidebar-primary` | Active icon color |
| `border-sidebar-border` | Sidebar borders |

## Status Color Exceptions

Status indicator colors are **exempt** from the semantic token rule. These are data-driven, not theme colors. See `docs/standards.md` Section 7 for the full color convention table.

Key rules:
- Use `amber-` for warnings/pending — **never** `yellow-`
- Text intensity: always `-700`
- Background intensity: `-100` for status badges, `-50` for connection badges

## Component Variants

Use the built-in variant system instead of overriding with color classes:

```tsx
// Good
<Button variant="default">Primary action</Button>
<Button variant="outline">Secondary action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon"><Moon /></Button>

// Bad - don't override primary color
<Button className="bg-blue-600 hover:bg-blue-700">Action</Button>
```

## Dark Mode

Toggle is available via `ThemeToggle` component. Theme wraps the app in `layout.tsx` via `ThemeProvider`.

```tsx
import { ThemeToggle } from "@/components/theme-toggle"

// Place in nav or settings
<ThemeToggle />
```

## File Organization

```
src/components/
  ui/          # shadcn/ui components (auto-generated, don't modify)
  layout/      # App layout (sidebar, top-nav)
  skeleton/    # Skeleton prototype components
  theme-provider.tsx
  theme-toggle.tsx
```
