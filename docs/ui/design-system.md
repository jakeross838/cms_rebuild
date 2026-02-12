# Design System

RossOS Construction Management Platform -- UI component library and design conventions.

## Technology Stack

| Tool | Purpose |
|------|---------|
| **Tailwind CSS v4** | Utility-first CSS framework (imported via `@import "tailwindcss"` in globals.css) |
| **Lucide React** | Icon library (tree-shakeable SVG icons) |
| **clsx** | Conditional class-name concatenation |
| **tailwind-merge** | Intelligent Tailwind class deduplication (last-wins for conflicting utilities) |
| **Next.js** | App router (`usePathname`, `Link`, `'use client'` directives) |
| **Supabase** | Auth client (`createClient` from `@/lib/supabase/client`) |

---

## Utility Functions

**File:** `app/src/lib/utils.ts`

### `cn(...inputs: ClassValue[]): string`

Combines `clsx` and `twMerge` into a single helper. Every component uses this for conditional / merged class names.

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### `formatCurrency(amount: number | null | undefined): string`

Formats a number as USD currency (`$1,234.56`). Returns `$0.00` for null/undefined.

### `formatDate(date: string | Date | null | undefined): string`

Formats a date as `"MMM D, YYYY"` (e.g. `"Jan 5, 2026"`). Returns empty string for null/undefined.

### `formatRelativeDate(date: string | Date | null | undefined): string`

Returns human-friendly relative strings: `"Today"`, `"Yesterday"`, `"3 days ago"`, `"2 weeks ago"`, or falls back to `formatDate`.

### `getInitials(name: string): string`

Extracts up to two uppercase initials from a full name (e.g. `"John Smith"` -> `"JS"`).

### `getStatusColor(status: string): string`

Returns a pair of Tailwind background + text color classes for a given status key. Falls back to `bg-gray-100 text-gray-800` for unknown statuses.

---

## Status Color Mapping

Used throughout the app to colorize badges, chips, and status indicators.

| Status Key | Background | Text | Category |
|---|---|---|---|
| `pre_construction` | `bg-blue-100` | `text-blue-800` | Job |
| `active` | `bg-green-100` | `text-green-800` | Job |
| `on_hold` | `bg-yellow-100` | `text-yellow-800` | Job |
| `completed` | `bg-gray-100` | `text-gray-800` | Job |
| `warranty` | `bg-purple-100` | `text-purple-800` | Job |
| `cancelled` | `bg-red-100` | `text-red-800` | Job |
| `needs_matching` | `bg-orange-100` | `text-orange-800` | Invoice |
| `draft` | `bg-gray-100` | `text-gray-800` | Invoice |
| `pm_pending` | `bg-blue-100` | `text-blue-800` | Invoice |
| `accountant_pending` | `bg-purple-100` | `text-purple-800` | Invoice |
| `owner_pending` | `bg-red-100` | `text-red-800` | Invoice |
| `approved` | `bg-green-100` | `text-green-800` | Invoice |
| `in_draw` | `bg-teal-100` | `text-teal-800` | Invoice |
| `paid` | `bg-gray-200` | `text-gray-700` | Invoice |
| `rejected` | `bg-red-100` | `text-red-800` | Invoice |
| *(fallback)* | `bg-gray-100` | `text-gray-800` | -- |

---

## Color Palette and CSS Custom Properties

**File:** `app/src/app/globals.css`

Colors are defined as HSL values in CSS custom properties on `:root` and mapped into Tailwind's `@theme inline` block.

### Semantic Tokens

| Token | HSL Value | Approximate Color | Usage |
|---|---|---|---|
| `--primary` | `221.2 83.2% 53.3%` | Blue (#3B82F6) | Primary actions, active nav items, brand accent |
| `--primary-foreground` | `210 40% 98%` | Near-white | Text on primary backgrounds |
| `--secondary` | `210 40% 96.1%` | Light gray-blue | Secondary buttons, muted fills |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | Dark navy | Text on secondary backgrounds |
| `--muted` | `210 40% 96.1%` | Light gray-blue | Muted/subdued backgrounds |
| `--muted-foreground` | `215.4 16.3% 46.9%` | Medium gray | Descriptions, placeholder text |
| `--accent` | `210 40% 96.1%` | Light gray-blue | Hover states (ghost/outline buttons) |
| `--accent-foreground` | `222.2 47.4% 11.2%` | Dark navy | Text on accent backgrounds |
| `--destructive` | `0 84.2% 60.2%` | Red (#EF4444) | Destructive actions, error states |
| `--destructive-foreground` | `210 40% 98%` | Near-white | Text on destructive backgrounds |
| `--background` | `0 0% 100%` | White | Page background |
| `--foreground` | `222.2 84% 4.9%` | Near-black | Default body text |
| `--card` | `0 0% 100%` | White | Card backgrounds |
| `--card-foreground` | `222.2 84% 4.9%` | Near-black | Card text |
| `--popover` | `0 0% 100%` | White | Popover/dropdown backgrounds |
| `--popover-foreground` | `222.2 84% 4.9%` | Near-black | Popover text |
| `--border` | `214.3 31.8% 91.4%` | Light gray | All borders (also applied globally via `*`) |
| `--input` | `214.3 31.8% 91.4%` | Light gray | Input borders |
| `--ring` | `221.2 83.2% 53.3%` | Blue | Focus ring color |
| `--radius` | `0.5rem` (8px) | -- | Base border radius |

### Radius Scale

Derived from `--radius` (0.5rem):

| Token | Value | Pixels |
|---|---|---|
| `--radius-sm` | `calc(var(--radius) - 4px)` | 4px |
| `--radius-md` | `var(--radius)` | 8px |
| `--radius-lg` | `calc(var(--radius) + 4px)` | 12px |
| `--radius-xl` | `calc(var(--radius) + 8px)` | 16px |

---

## Typography

### Font Family

- **Sans-serif:** Geist Sans (`--font-geist-sans`) -- loaded by Next.js font system, applied to `body` via `var(--font-sans)`
- **Monospace:** Geist Mono (`--font-geist-mono`) -- available as `--font-mono`
- **Fallback:** `system-ui, sans-serif`

### Text Sizes Used in Components

| Context | Classes | Effective Size |
|---|---|---|
| Body text, nav items, menu items | `text-sm` | 14px / 0.875rem |
| Small labels, descriptions, user roles | `text-xs` | 12px / 0.75rem |
| Card title | `font-semibold leading-none tracking-tight` | Inherits parent size |
| Card description | `text-sm text-muted-foreground` | 14px, muted gray |
| Button default | `text-sm font-medium` | 14px, medium weight |
| Button small | `text-xs` | 12px |
| Badge | `text-xs font-semibold` | 12px, semibold |

---

## Spacing and Sizing Conventions

### Component Heights

| Element | Height | Class |
|---|---|---|
| TopNav header | 64px | `h-16` |
| Sidebar logo area | 64px | `h-16` |
| Button (default) | 36px | `h-9` |
| Button (sm) | 32px | `h-8` |
| Button (lg) | 40px | `h-10` |
| Button (icon) | 36x36px | `h-9 w-9` |
| Input | 36px | `h-9` |
| User avatar (sidebar) | 32px | `h-8 w-8` |
| Logo icon | 36px | `h-9 w-9` |
| Nav icons | 20px | `h-5 w-5` |
| Chevron icons | 16px | `h-4 w-4` |

### Padding Patterns

| Context | Padding | Class |
|---|---|---|
| Card header | 24px all | `p-6` |
| Card content | 24px sides/bottom, 0 top | `p-6 pt-0` |
| Card footer | 24px sides/bottom, 0 top | `p-6 pt-0` |
| Sidebar nav area | 12px | `p-3` |
| TopNav | 24px horizontal | `px-6` |
| Nav link | 12px horiz, 8px vert | `px-3 py-2` |
| Input | 12px horiz, 4px vert | `px-3 py-1` |
| Badge | 10px horiz, 2px vert | `px-2.5 py-0.5` |
| Button (default) | 16px horiz, 8px vert | `px-4 py-2` |
| Button (sm) | 12px horiz | `px-3` |
| Button (lg) | 32px horiz | `px-8` |

### Sidebar Width

- Fixed 256px: `w-64`

---

## Components

### Button

**File:** `app/src/components/ui/button.tsx`

A polymorphic button using `React.forwardRef`. Supports six visual variants and four size options.

#### Variants

| Variant | Classes | Description |
|---|---|---|
| `default` | `bg-primary text-primary-foreground shadow hover:bg-primary/90` | Solid blue, primary CTA |
| `destructive` | `bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90` | Solid red, dangerous actions |
| `outline` | `border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground` | Bordered, transparent fill |
| `secondary` | `bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80` | Light gray fill |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | No background until hover |
| `link` | `text-primary underline-offset-4 hover:underline` | Styled as an inline link |

#### Sizes

| Size | Classes | Dimensions |
|---|---|---|
| `default` | `h-9 px-4 py-2` | 36px tall, 16px horizontal padding |
| `sm` | `h-8 rounded-md px-3 text-xs` | 32px tall, 12px padding, 12px text |
| `lg` | `h-10 rounded-md px-8` | 40px tall, 32px padding |
| `icon` | `h-9 w-9` | 36x36px square |

#### Base Classes (all variants)

```
inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium
transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
disabled:pointer-events-none disabled:opacity-50
```

#### Usage

```tsx
import { Button } from '@/components/ui/button'

<Button>Save</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
```

---

### Card

**File:** `app/src/components/ui/card.tsx`

A compound component with five sub-components, all using `React.forwardRef`.

| Sub-component | Element | Classes | Purpose |
|---|---|---|---|
| `Card` | `<div>` | `rounded-xl border bg-card text-card-foreground shadow` | Outer container |
| `CardHeader` | `<div>` | `flex flex-col space-y-1.5 p-6` | Title + description area |
| `CardTitle` | `<h3>` | `font-semibold leading-none tracking-tight` | Heading |
| `CardDescription` | `<p>` | `text-sm text-muted-foreground` | Subtitle / supporting text |
| `CardContent` | `<div>` | `p-6 pt-0` | Main body |
| `CardFooter` | `<div>` | `flex items-center p-6 pt-0` | Actions / bottom bar |

#### Usage

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Job Summary</CardTitle>
    <CardDescription>Overview of current project</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

---

### Badge

**File:** `app/src/components/ui/badge.tsx`

An inline status indicator. Renders a `<div>` (not a `<span>`).

#### Variants

| Variant | Classes | Description |
|---|---|---|
| `default` | `border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80` | Solid blue |
| `secondary` | `border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80` | Light gray |
| `destructive` | `border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80` | Solid red |
| `outline` | `text-foreground` | Border only (inherits global border color) |

#### Base Classes (all variants)

```
inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold
transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
```

#### Usage

```tsx
import { Badge } from '@/components/ui/badge'

<Badge>Active</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="outline">Draft</Badge>
```

**Note:** For status-colored badges, combine with `getStatusColor()`:

```tsx
<Badge className={getStatusColor(job.status)}>
  {job.status}
</Badge>
```

---

### Input

**File:** `app/src/components/ui/input.tsx`

A styled `<input>` element using `React.forwardRef`. Passes through all native input attributes.

#### Base Classes

```
flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm
transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium
file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none
focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50
```

#### Features

- Full-width by default (`w-full`)
- Transparent background (inherits parent)
- File input styling (removes default file button border)
- Placeholder uses muted-foreground color
- Focus ring matches `--ring` (primary blue)
- Disabled state: `cursor-not-allowed` + 50% opacity

#### Usage

```tsx
import { Input } from '@/components/ui/input'

<Input type="text" placeholder="Enter job name..." />
<Input type="email" disabled />
<Input type="search" className="pl-10 bg-gray-50" />  {/* With icon offset */}
```

---

## Layout Components

### Sidebar

**File:** `app/src/components/layout/sidebar.tsx`

A fixed-width left sidebar (`w-64` / 256px) with white background and right border. Structured in four vertical sections:

#### Structure

```
<aside w-64 bg-white border-r>
  +-- Logo Area (h-16, border-b)
  |     Building2 icon (blue square) + "RossOS" / "Construction CMS"
  |
  +-- Navigation (flex-1, overflow-y-auto, p-3)
  |     Flat links and collapsible groups
  |
  +-- Bottom Nav (p-3, border-t)
  |     Settings link
  |
  +-- User Info (p-3, border-t)
        Avatar circle + name + role
</aside>
```

#### Navigation Items

Top-level items are either direct links or collapsible groups:

| Item | Type | Icon | Children |
|---|---|---|---|
| Dashboard | Link | `LayoutDashboard` | -- |
| Jobs | Link | `Briefcase` | -- |
| Pre-Construction | Group | `HardHat` | Leads, Estimates, Proposals |
| Financial | Group | `DollarSign` | Invoices, Purchase Orders, Draws, Change Orders |
| Field | Group | `Wrench` | Schedule, Daily Logs, Photos |
| Closeout | Group | `CheckSquare` | Punch Lists, Warranties, Final Docs |
| Directory | Group | `Users` | Vendors, Clients, Cost Codes |
| Reports | Link | `BarChart3` | -- |
| Files | Link | `FolderOpen` | -- |
| Settings | Link (bottom) | `Settings` | -- |

#### Active State

- Active link: `bg-blue-50 text-blue-700 font-medium` with icon in `text-blue-600`
- Inactive link: `text-gray-700 hover:bg-gray-100` with icon in `text-gray-500`
- Detection: exact pathname match or starts-with for nested routes

#### Collapsible Groups

- Default open: `Financial` and `Field`
- Toggle via chevron icon (ChevronDown when open, ChevronRight when closed)
- Children indented with `ml-8`

#### Props

```ts
interface SidebarProps {
  user: {
    name: string
    role: string
    companies?: { name: string }
  } | null
}
```

---

### TopNav

**File:** `app/src/components/layout/top-nav.tsx`

A horizontal header bar (`h-16` / 64px) with white background and bottom border.

#### Structure

```
<header h-16 bg-white border-b px-6>
  +-- Search (left, flex-1, max-w-md)
  |     Search icon + Input
  |
  +-- Right Side (flex, gap-4)
        +-- Notification Bell (ghost icon button + red dot)
        +-- User Menu (avatar + name + role + dropdown)
</header>
```

#### Search Bar

- Positioned with `relative` wrapper
- `Search` icon absolutely positioned inside the input (`left-3`)
- Input has `pl-10` to accommodate the icon
- Styled with `bg-gray-50 border-gray-200`
- Placeholder: `"Search jobs, invoices, vendors..."`

#### Notification Button

- Ghost variant, icon size
- Red indicator dot: `absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full`

#### User Menu Dropdown

- Trigger: avatar circle (blue-100 bg, blue-600 text) + name/role + ChevronDown
- Name/role hidden on small screens: `hidden sm:block`
- Dropdown: `w-56`, white, shadow-lg, ring border
- Items: Profile, Settings, Sign out (red text with red hover)
- Backdrop: `fixed inset-0 z-10` click-to-close overlay
- Dropdown z-index: `z-20`

#### Props

```ts
interface TopNavProps {
  user: {
    name: string
    email?: string
    role: string
  } | null
}
```

---

## Icon Usage

All icons come from `lucide-react`. Common sizing patterns:

| Context | Size Class | Pixels |
|---|---|---|
| Nav icons, notification bell | `h-5 w-5` | 20px |
| Chevrons, menu item icons, search icon | `h-4 w-4` | 16px |
| Logo icon | `h-5 w-5` (inside 36px container) | 20px |

Icons used across the codebase:

`Building2`, `LayoutDashboard`, `Briefcase`, `Users`, `FileText`, `Receipt`, `ClipboardList`, `Calendar`, `Camera`, `FolderOpen`, `BarChart3`, `Settings`, `ChevronDown`, `ChevronRight`, `HardHat`, `Wrench`, `DollarSign`, `CheckSquare`, `Shield`, `Bell`, `Search`, `LogOut`, `User`

---

## Design Conventions

### General Patterns

- **Component architecture:** All primitives use `React.forwardRef` for ref forwarding
- **Class merging:** Every component accepts a `className` prop merged via `cn()`
- **Prop spreading:** Components spread remaining props onto the root element (`...props`)
- **Display names:** Every `forwardRef` component sets `.displayName` for DevTools
- **No dark mode:** Only light-mode CSS variables are defined (no `.dark` or `prefers-color-scheme`)
- **Border convention:** Global `*` selector sets `border-color: hsl(var(--border))`

### Color Usage in Practice

- **Primary blue:** CTAs, active nav state, focus rings, brand logo background, user avatar accent
- **Gray scale:** Borders (`gray-200`), hover states (`gray-100`), muted text (`gray-500`/`gray-600`), inactive icons (`gray-400`/`gray-500`)
- **Red:** Destructive actions, notification dot, sign-out button, error/rejected statuses
- **Status palette:** Blue, green, yellow, gray, purple, red, orange, teal for various workflow states

### Responsive Patterns

- User name/role in TopNav: `hidden sm:block` (hidden on mobile)
- Sidebar: fixed width, no responsive collapse currently implemented
- Search bar: `max-w-md` constrains width on large screens

---

## TODO: Missing Components

The following components are needed but do not yet exist in the design system.

### Form Components

- [ ] **Label** -- `<label>` with consistent styling (`text-sm font-medium`)
- [ ] **Textarea** -- Multi-line text input matching Input styling
- [ ] **Select** -- Styled dropdown (native or custom)
- [ ] **Checkbox** -- Styled checkbox with label support
- [ ] **Radio** -- Styled radio buttons
- [ ] **Switch/Toggle** -- Boolean toggle control
- [ ] **Form** -- Form wrapper with validation state and error messages
- [ ] **DatePicker** -- Calendar-based date selection
- [ ] **FileUpload** -- Drag-and-drop or click-to-upload area

### Data Table

- [ ] **Table** -- Sortable, filterable data table
- [ ] **TableHeader / TableRow / TableCell** -- Compound table components
- [ ] **Pagination** -- Page navigation for large data sets
- [ ] **Column visibility toggle** -- Show/hide columns
- [ ] **Bulk actions** -- Select multiple rows for batch operations
- [ ] **Empty state** -- Placeholder when table has no data

### Modal / Dialog

- [ ] **Dialog** -- Accessible modal overlay (title, description, actions)
- [ ] **AlertDialog** -- Confirmation dialog for destructive actions
- [ ] **Sheet** -- Slide-in panel (sidebar overlay for mobile or detail views)

### Toast Notifications

- [ ] **Toast** -- Ephemeral success/error/info messages
- [ ] **Toaster** -- Toast container with stacking and auto-dismiss
- [ ] **useToast hook** -- Programmatic toast trigger

### Skeleton Loaders

- [ ] **Skeleton** -- Animated placeholder shapes (line, circle, rectangle)
- [ ] **CardSkeleton** -- Card-shaped loading placeholder
- [ ] **TableSkeleton** -- Table rows loading placeholder
- [ ] **DashboardSkeleton** -- Full-page loading state

### Charts / Graphs

- [ ] **BarChart** -- Vertical/horizontal bar charts (budget vs. actual)
- [ ] **LineChart** -- Trend lines (cash flow over time)
- [ ] **PieChart / DonutChart** -- Proportional breakdowns (cost categories)
- [ ] **ProgressBar** -- Linear progress indicator (job completion %)
- [ ] **KPI Card** -- Metric card with value, label, and trend arrow

### Navigation

- [ ] **Breadcrumb** -- Page path breadcrumbs
- [ ] **Tabs** -- Tab navigation within a page
- [ ] **MobileNav** -- Responsive sidebar collapse / hamburger menu

### Feedback

- [ ] **Alert** -- Inline alert banner (info, warning, error, success)
- [ ] **EmptyState** -- Illustration + message + CTA for empty pages
- [ ] **LoadingSpinner** -- Circular loading indicator
- [ ] **Tooltip** -- Hover tooltip for icon buttons and truncated text
- [ ] **Popover** -- Click-triggered floating content panel

### Miscellaneous

- [ ] **Avatar** -- Reusable avatar component (initials or image)
- [ ] **Separator** -- Horizontal/vertical divider line
- [ ] **ScrollArea** -- Custom scrollbar wrapper
- [ ] **DropdownMenu** -- Multi-level dropdown menu (replace raw TopNav dropdown)
- [ ] **CommandPalette** -- Cmd+K search dialog
