# RossOS — UI & Code Standards

**This is the single source of truth for all frontend and backend patterns. Read before writing ANY code.**

Referenced from: `CLAUDE.md`, `docs/style-guide.md`

---

## Table of Contents

1. [Frontend Component Patterns](#1-frontend-component-patterns)
2. [FilterBar & Filtering](#2-filterbar--filtering)
3. [Stats / Summary Bars](#3-stats--summary-bars)
4. [AI Insights Bar](#4-ai-insights-bar)
5. [Status Badges](#5-status-badges)
6. [Cross-Module Connection Badges](#6-cross-module-connection-badges)
7. [Color Conventions](#7-color-conventions)
8. [Icons](#8-icons)
9. [Mock Data Standards](#9-mock-data-standards)
10. [Skeleton Preview File Structure](#10-skeleton-preview-file-structure)
11. [PageSpec Format](#11-pagespec-format)
12. [TypeScript Conventions](#12-typescript-conventions)
13. [Database Conventions](#13-database-conventions)
14. [API Conventions](#14-api-conventions)
15. [Testing Conventions](#15-testing-conventions)

---

## 1. Frontend Component Patterns

### Imports
```tsx
'use client'

import { useState } from 'react'
import { Icon1, Icon2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
```

- Always use `@/` path alias — never relative `../`
- Always `'use client'` as first line for interactive components
- Group imports: React → lucide-react → local utilities → local components

### Conditional Classes
Always use `cn()` from `@/lib/utils`:
```tsx
<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  variant === 'primary' ? 'primary-classes' : 'default-classes'
)} />
```

### Lucide Icon Props
Never pass `title` directly to Lucide icons (causes TypeScript error). Wrap in a `<span>`:
```tsx
// WRONG
<Zap className="h-4 w-4" title="Real-time" />

// RIGHT
<span title="Real-time"><Zap className="h-4 w-4" /></span>
```

---

## 2. FilterBar & Filtering

Every list/grid view MUST use the shared `FilterBar` component. No custom filter implementations.

### Required Setup
```tsx
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

const filter = useFilterState({ defaultTab: 'all', defaultSort: 'name' })
```

### FilterBar Props (use as needed)
```tsx
<FilterBar
  search={filter.search}
  onSearchChange={filter.setSearch}
  searchPlaceholder="Search tasks..."
  tabs={tabs}
  activeTab={filter.activeTab}
  onTabChange={filter.setActiveTab}
  dropdowns={dropdowns}
  sortOptions={sortOptions}
  activeSort={filter.activeSort}
  onSortChange={filter.setActiveSort}
  sortDirection={filter.sortDirection}
  onSortDirectionChange={filter.toggleSortDirection}
  viewMode={filter.viewMode}
  onViewModeChange={filter.setViewMode}
  actions={actions}
  resultCount={filtered.length}
  totalCount={allItems.length}
>
  {/* Optional inline children for extra controls */}
</FilterBar>
```

### Rules
- Primary navigation tabs go through FilterBar's `tabs` prop — never build custom tab buttons
- Extra inline controls (toggles, specialized filters) use FilterBar's `children` prop
- Schedule-specific toolbars are the ONLY exception (a separate toolbar for zoom/expand controls is OK alongside FilterBar)

---

## 3. Stats / Summary Bars

Every preview should have a stats bar below the header. Standard pattern:

### Container
```tsx
<div className="grid grid-cols-{N} gap-3 mb-4">
```
Where N = number of stat cards (typically 5-7).

### Stat Card
```tsx
<div className="bg-gray-50 rounded-lg p-3">
  <div className="flex items-center gap-2 text-gray-600 text-xs">
    <Icon className="h-3.5 w-3.5" />
    Label
  </div>
  <div className="text-xl font-bold text-gray-900 mt-1">Value</div>
</div>
```

### Colored Stat Card (for emphasis)
```tsx
<div className="bg-{color}-50 rounded-lg p-3">
  <div className="flex items-center gap-2 text-{color}-600 text-xs">
    <Icon className="h-3.5 w-3.5" />
    Label
  </div>
  <div className="text-xl font-bold text-{color}-700 mt-1">Value</div>
</div>
```

### Rules
- Padding is always `p-3` — never p-2, p-2.5, or p-4
- Use `rounded-lg` for cards — never `rounded-full`
- Label text: `text-xs`
- Value text: `text-xl font-bold`
- Grid gap: `gap-3`
- Sub-metric: `<div className="text-xs text-gray-500 mt-0.5">sub-info</div>`

---

## 4. AI Insights Bar

Every preview with AI features should have an AI Insights bar at the bottom. Standard pattern:

```tsx
<div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
  <div className="flex items-start gap-3">
    <div className="flex items-center gap-2 flex-shrink-0">
      <Sparkles className="h-4 w-4 text-amber-600" />
      <span className="font-medium text-sm text-amber-800">AI Insights:</span>
    </div>
    <div className="text-sm text-amber-700">
      Insight text here...
    </div>
  </div>
</div>
```

### Rules
- **Always** `from-amber-50 to-orange-50` gradient — never blue, green, or purple
- **Always** `border-amber-200`
- **Always** `px-4 py-3` padding
- Icon: `Sparkles h-4 w-4 text-amber-600`
- Label: `font-medium text-sm text-amber-800`
- Body text: `text-sm text-amber-700`
- Position: bottom of the component (last element)
- Only exception: portal previews (client/vendor) may use different styling for external-facing context

---

## 5. Status Badges

### Standard Badge
```tsx
<span className={cn(
  'text-xs px-2 py-0.5 rounded font-medium',
  statusConfig[status].className
)}>
  {statusConfig[status].label}
</span>
```

### Rules
- Shape: `rounded` — **NEVER** `rounded-full` for status badges
- `rounded-full` is ONLY for avatars, dot indicators, and circular icon containers
- Sizing: `text-xs px-2 py-0.5`
- Font: `font-medium`
- Text color intensity: always `-700` (not `-600` or `-800`)
- Background intensity: always `-100`

### Status Color Config Pattern
```tsx
const statusConfig: Record<Status, { label: string; className: string; icon: LucideIcon }> = {
  draft:     { label: 'Draft',     className: 'bg-gray-100 text-gray-700',    icon: FileText },
  pending:   { label: 'Pending',   className: 'bg-amber-100 text-amber-700',  icon: Clock },
  active:    { label: 'Active',    className: 'bg-blue-100 text-blue-700',    icon: Play },
  approved:  { label: 'Approved',  className: 'bg-green-100 text-green-700',  icon: CheckCircle },
  rejected:  { label: 'Rejected',  className: 'bg-red-100 text-red-700',     icon: XCircle },
  on_hold:   { label: 'On Hold',   className: 'bg-orange-100 text-orange-700', icon: Pause },
  complete:  { label: 'Complete',  className: 'bg-emerald-100 text-emerald-700', icon: Check },
  archived:  { label: 'Archived',  className: 'bg-gray-100 text-gray-700',    icon: Archive },
}
```

---

## 6. Cross-Module Connection Badges

Used to show linked records from other modules (e.g., an invoice linked to a PO).

### Standard Pattern
```tsx
<span className="text-xs px-2 py-0.5 rounded bg-{color}-50 text-{color}-700 flex items-center gap-1">
  <Icon className="h-3 w-3" />
  REF-ID
</span>
```

### Rules
- No border — never add `border border-{color}-200`
- Background: `-50` (lighter than status badges which use `-100`)
- Text: `-700`
- Icon size: `h-3 w-3`
- Padding: `px-2 py-0.5`
- Shape: `rounded`

### Color by Module Type
| Module Type | Color | Example |
|-------------|-------|---------|
| Financial (invoices, POs, budgets) | `blue` | `bg-blue-50 text-blue-700` |
| Schedule/field ops | `purple` | `bg-purple-50 text-purple-700` |
| Documents/files | `gray` | `bg-gray-50 text-gray-700` |
| Vendors/contacts | `teal` | `bg-teal-50 text-teal-700` |
| Inspections/permits | `cyan` | `bg-cyan-50 text-cyan-700` |
| Client/portal | `emerald` | `bg-emerald-50 text-emerald-700` |
| AI/automated | `amber` | `bg-amber-50 text-amber-700` |

---

## 7. Color Conventions

### Semantic Status Colors (hardcoded — exempt from theme tokens)

| Semantic | Background | Text | When to Use |
|----------|-----------|------|-------------|
| Success/Approved | `bg-green-100` | `text-green-700` | Approved, complete, active, passing |
| Warning/Pending | `bg-amber-100` | `text-amber-700` | Pending, under review, expiring soon |
| Error/Rejected | `bg-red-100` | `text-red-700` | Rejected, overdue, expired, critical, failed |
| Info/Active | `bg-blue-100` | `text-blue-700` | In progress, submitted, informational |
| Neutral/Draft | `bg-gray-100` | `text-gray-700` | Draft, default, inactive, archived |
| Hold/Amended | `bg-orange-100` | `text-orange-700` | On hold, amended, paused |
| Special/Signed | `bg-purple-100` | `text-purple-700` | Signed, e-signature, calibration |
| Complete/Done | `bg-emerald-100` | `text-emerald-700` | Fully complete, verified |

### NEVER use `yellow-` — always use `amber-` for warnings/pending states.

### Text Color Intensity
- Badge text: `-700` (always)
- Badge background: `-100` for status badges, `-50` for connection badges
- Stat card value: `-700` or `-900`
- Stat card label: `-600`

### Theme Tokens (for chrome/layout — NOT data colors)
Use semantic tokens from `docs/style-guide.md` for:
- Page backgrounds: `bg-background`
- Card surfaces: `bg-card`
- Primary text: `text-foreground`
- Secondary text: `text-muted-foreground`
- Borders: `border-border`

---

## 8. Icons

### Library
Lucide React only — `import { IconName } from 'lucide-react'`

### Standard Sizes
| Context | Size | Example |
|---------|------|---------|
| Inline with text | `h-4 w-4` | Status badge icons, nav icons |
| Stats bar labels | `h-3.5 w-3.5` | Stat card label icons |
| Connection badges | `h-3 w-3` | Cross-module ref icons |
| Large/header | `h-5 w-5` | Section headers, action buttons |
| Action buttons | `h-4 w-4` | Toolbar buttons |

### No `title` prop — wrap in `<span title="...">` instead.

---

## 9. Mock Data Standards

### IDs
- Use simple string numbers for `id` field: `'1'`, `'2'`, `'3'`
- Use prefixed format for display/reference numbers: `'CO-001'`, `'INV-2026-0847'`, `'PO-0142'`
- The `id` is internal, the display number is user-facing

### Dates
- Always ISO format in mock data objects: `'2026-01-15'`
- Never pre-formatted display strings in data: ~~`'Jan 15, 2026'`~~
- Format for display using `formatDate()` helper or `date-fns`
- Date range: 2025-2026 (matches app context of Feb 2026)
- Never use 2024 dates

### Currency
- Use raw numbers in data: `amount: 45000`
- Format for display: `formatCurrency(amount)` or `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
- Abbreviated for stats: `$45K`, `$1.2M`

### Names & Companies
- Use realistic construction industry names
- Vendor names: "ABC Framing", "Deep South Pilings", "Smith Electric", "Jones Plumbing"
- Client names: "Smith Residence", "Harbor View Condos", "Johnson Custom Build"
- Employee names: realistic mix of backgrounds

### Status Distribution
- Mock data should cover ALL statuses defined in the type
- At least one item per status state
- Include edge cases: overdue, blocked, archived items

---

## 10. Skeleton Preview File Structure

Every preview file follows this structure, with section comments:

```tsx
'use client'

// ── Imports ────────────────────────────────────────────────────────────
import { useState } from 'react'
import { ... } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ── Types ──────────────────────────────────────────────────────────────
type Status = 'draft' | 'pending' | 'approved' | 'rejected'
interface Item { ... }

// ── Constants & Config ─────────────────────────────────────────────────
const statusConfig = { ... }
const TASK_TYPES = { ... }

// ── Mock Data ──────────────────────────────────────────────────────────
const items: Item[] = [ ... ]

// ── Helpers ────────────────────────────────────────────────────────────
function computeStats(items: Item[]) { ... }

// ── Sub-Components ─────────────────────────────────────────────────────
function ItemCard({ item }: { item: Item }) { ... }
function StatsBar({ items }: { items: Item[] }) { ... }

// ── Main Component ─────────────────────────────────────────────────────
export function ModuleNamePreview() {
  // State
  const filter = useFilterState(...)

  // Filtering
  const filtered = ...

  // Render
  return (
    <div className="space-y-0">
      {/* Stats Bar */}
      {/* FilterBar */}
      {/* Content (list/grid/chart) */}
      {/* AI Insights Bar */}
    </div>
  )
}
```

### Section Comment Style
Use the em-dash style:
```
// ── Section Name ───────────────────────────────────────────────────────
```
Total line length: ~76 characters. Pattern: `// ── {Name} ` followed by `─` to fill.

### Export
- Named export: `export function ModuleNamePreview()`
- Never default export for preview components

---

## 11. PageSpec Format

Every page.tsx follows this structure:

```tsx
'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { ModuleNamePreview } from '@/components/skeleton/previews/module-name-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Step 1', 'Step 2', 'Step 3', 'Step 4'
]

export default function ModuleNameSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {activeTab === 'preview' ? (
        <ModuleNamePreview />
      ) : (
        <PageSpec
          title="Module Name"
          phase="Phase N - Phase Name"
          planFile="docs/modules/XX-module-name.md"
          description="..."
          workflow={constructionWorkflow}
          features={[ ... ]}
          connections={[
            { name: 'Module', type: 'input' | 'output' | 'bidirectional', description: '...' },
          ]}
          dataFields={[
            { name: 'field', type: 'uuid' | 'string' | 'enum' | ..., required: boolean, description: '...' },
          ]}
          aiFeatures={[
            { name: 'Feature', description: '...', trigger: '...' },
          ]}
        />
      )}
    </div>
  )
}
```

### Rules
- Workflow arrays: defined as named constants before the component
- Multi-line formatted JSX — never compressed single-line
- All PageSpec props present: title, phase, planFile, description, workflow, features, connections, dataFields, aiFeatures

---

## 12. TypeScript Conventions

- No `any` types — ever
- Explicit return types on exported functions
- Use `type` imports for type-only imports: `import type { Props } from '...'`
- Use union types for status enums: `type Status = 'draft' | 'pending' | 'approved'`
- Use interfaces for data shapes: `interface Item { ... }`
- Use `Record<K, V>` for config maps: `Record<Status, { label: string; className: string }>`
- No unused variables or imports

---

## 13. Database Conventions

### Multi-Tenancy (CRITICAL)
- Every tenant table: `company_id UUID NOT NULL REFERENCES companies(id)`
- Every query filters by `company_id`
- RLS on all tenant tables: `USING (company_id = get_current_company_id())`
- Cache keys include `company_id`
- Indexes on `company_id` for every tenant table

### Table Naming
- Snake_case: `v2_purchase_orders`, `v2_schedule_items`
- Prefix with `v2_` for new tables
- Junction tables: `v2_{table1}_{table2}` (e.g., `v2_project_contacts`)

### Column Naming
- Snake_case: `created_at`, `is_active`, `company_id`
- Foreign keys: `{referenced_table}_id` (e.g., `vendor_id`, `job_id`)
- Booleans: prefix with `is_` or `has_` (e.g., `is_critical_path`, `has_photos`)
- Timestamps: suffix `_at` (e.g., `created_at`, `approved_at`, `deleted_at`)
- JSON columns: type `jsonb`, suffix with context (e.g., `distribution_list`, `review_stamps`)

### Soft Delete
- Every table has `deleted_at TIMESTAMPTZ DEFAULT NULL`
- Never hard delete — always set `deleted_at = NOW()`
- Queries filter: `WHERE deleted_at IS NULL`
- Archive = soft delete with restore capability

### Audit Fields (every table)
```sql
created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
created_by    UUID REFERENCES auth.users(id),
updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_by    UUID REFERENCES auth.users(id),
deleted_at    TIMESTAMPTZ DEFAULT NULL,
version       INTEGER NOT NULL DEFAULT 1
```

---

## 14. API Conventions

### Route Structure
```
app/src/app/api/v1/{resource}/route.ts     → GET (list), POST (create)
app/src/app/api/v1/{resource}/[id]/route.ts → GET (detail), PATCH (update), DELETE (soft delete)
```

### Handler Pattern
```tsx
import { createApiHandler } from '@/lib/api/handler'
import { z } from 'zod'

const schema = z.object({ ... })

export const POST = createApiHandler({
  schema,
  rateLimit: { window: '1m', max: 30 },
  handler: async ({ body, user, companyId }) => {
    // ...
  }
})
```

### Rules
- All inputs validated with Zod
- Rate limiting on all endpoints
- `company_id` always from auth context — never from request body
- Return standard response shape: `{ data, error, pagination }`
- HTTP status codes: 200 (success), 201 (created), 400 (validation), 401 (auth), 403 (permission), 404 (not found), 429 (rate limit), 500 (server error)

---

## 15. Testing Conventions

### File Locations
| Directory | Purpose | Runner |
|-----------|---------|--------|
| `tests/acceptance/` | Spec adherence — does it match the module spec? | Vitest |
| `tests/unit/` | Individual functions, hooks, utils | Vitest |
| `tests/integration/` | Components with mocked data | Vitest |
| `tests/e2e/` | Browser flows against running app | Playwright |

### Naming
- Test files: `{module-name}.test.ts`
- Acceptance tests: `{module-number}-{module-name}.acceptance.test.ts`
- E2E tests: `{flow-name}.e2e.test.ts`

### Commands
```bash
cd app
npx tsc --noEmit                    # Type check
npx vitest run tests/acceptance/    # Spec adherence
npx vitest run tests/unit/          # Unit tests
npx vitest run tests/integration/   # Integration tests
npx playwright test tests/e2e/     # Browser tests
```

---

## Quick Reference Card

| Pattern | Standard | Never |
|---------|----------|-------|
| Status badge shape | `rounded` | `rounded-full` |
| Warning color | `amber-` | `yellow-` |
| Badge text intensity | `-700` | `-600` or `-800` |
| Stats card padding | `p-3` | p-2, p-2.5, p-4 |
| AI bar gradient | `from-amber-50 to-orange-50` | blue, green, purple |
| AI bar padding | `px-4 py-3` | px-6 py-4 |
| Connection badge border | none | `border border-{color}-200` |
| Mock data dates | ISO `'2026-01-15'` | Display format `'Jan 15, 2026'` |
| Mock data date range | 2025-2026 | 2024 or earlier |
| Section comments | `// ── Name ──────` | `// --------` or `// ========` |
| Icon title | `<span title="">` | `title` prop on icon |
| Imports | `@/` path alias | Relative `../` |
| Delete operation | Soft delete (archive) | Hard delete |
