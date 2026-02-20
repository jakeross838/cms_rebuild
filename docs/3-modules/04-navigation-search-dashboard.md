# Module 4: Navigation, Search & Dashboard

**Phase:** 1 - Foundation
**Status:** TODO
**Priority:** High -- this module defines the daily user experience for every role

---

## Overview

This module provides the primary application shell that every user interacts with on every session. It encompasses the sidebar/top navigation, global search, customizable dashboard with role-based widget defaults, breadcrumb context, command palette, keyboard shortcuts, and the "My Day" aggregated task view. Because the platform serves builders ranging from a one-person operation to a 50-person multi-division company, the UX must support progressive disclosure -- simple by default, powerful when needed.

---

## Gap Items Addressed

| Gap # | Summary |
|-------|---------|
| 521 | UI scaling from 1-person builder to 50-person builder |
| 522 | Progressive disclosure -- simple by default, power features available but not overwhelming |
| 523 | First-time user experience vs. power user experience (different guidance levels) |
| 524 | Customizable navigation -- builder rearranges modules in preferred order |
| 525 | Multi-project context switching without losing context |
| 526 | Global search across all projects and data types |
| 527 | Keyboard-first navigation for data entry |
| 528 | Personalized "My Day" view across all projects |
| 529 | Notification center / inbox as central attention hub |
| 530 | Recently viewed items for quick access |
| 531 | Breadcrumb navigation -- always know where you are |
| 532 | Command palette / quick actions (Cmd+K) |
| 533 | Empty states with guidance, not emptiness |
| 534 | Data density preferences (compact vs. comfortable) |
| 535 | WCAG 2.1 AA accessibility compliance |
| 536 | Localization architecture (English V1, Spanish/French future) |

Also references from Section 35 (Data Integrity):
| 537 | Tenant data isolation enforced at query level (search must respect builder_id) |
| 545 | Performance at scale -- search and dashboard must remain fast with 500+ projects |
| 546 | Database indexing strategy for search and dashboard queries |
| 1028 | "My Day" dashboard — everything I need to address today across all projects, sorted by priority | Enhanced "My Day" view with cross-project priority aggregation |
| 1029 | Overnight alert review — what happened since I left yesterday | Overnight event summary: emails, vendor messages, inspection results, weather changes |
| 1030 | Daily cash position — what's in the bank, due out today/this week, draws pending | Cash position widget linking to Module 9 financial data |
| 1034 | Client communication queue — messages needing response, scheduled meetings today | Client communication widget with response aging and meeting schedule |
| 1035 | Vendor follow-up queue — outstanding bids, overdue invoices, unanswered RFIs, expired insurance | Vendor follow-up widget with categorized action items |
| 1057 | Team meeting preparation — auto-generated agenda from project data | Meeting agenda generator pulling from active project data |

Also references from UX Principles (Section 3.3):
| -- | Progressive disclosure: simple by default, power when needed | Aligned with Gap 522 |
| -- | Context-aware interface: show relevant content based on role, time, phase, device | Role-based and time-aware dashboard layout |
| -- | Three-click rule: 20 most common tasks completable in 3 clicks or less | Quick-action design principle for all common workflows |
| -- | Smart defaults: pre-fill everything possible | Intelligent default values on all data entry forms |
| -- | Never lose work: auto-save, offline queue, undo, recycle bin | Data protection architecture across all modules |
| -- | One place to look: global search finds anything, single-screen summaries | Unified search and summary views |
| -- | Beautiful without trying: auto-formatted reports, professional portal | Design system delivering polished output without configuration |
| -- | Inclusive design: works for all skill levels, devices, languages, abilities | WCAG 2.1 AA, responsive, multi-language architecture |

---

## Detailed Requirements

### 4.1 Application Shell & Navigation (Gap 521, 522, 524, 531)

**Sidebar Navigation**
- Collapsible sidebar (expanded / icon-only / hidden on mobile).
- Top-level modules rendered as icon + label. Collapsed mode shows icons only with tooltip on hover.
- Module ordering is configurable per builder (`nav_config` in `builder_settings`). Defaults provided per subscription tier.
- Sections that are not enabled for the builder's subscription or role are hidden entirely (not greyed out).
- Active section highlighted; current page indicated within section.

**Top Navigation Bar**
- Builder logo (left), global search (center), notification bell + user avatar (right).
- Project context selector dropdown when inside a project -- shows project name, address, status badge.
- Quick-switch: clicking the project selector shows a searchable list of recent projects (Gap 525).

**Breadcrumbs (Gap 531)**
- Always visible below top nav: `Home > Project X > Budget > Electrical`.
- Each breadcrumb segment is a clickable link.
- Breadcrumb data derived from route hierarchy; modules register their breadcrumb labels.

**Progressive Disclosure (Gap 522, 523)**
- First-login onboarding tour (driven by `user_onboarding_state` flags).
- "Getting Started" checklist widget on dashboard for new tenants.
- Advanced features (bulk actions, keyboard shortcuts, custom filters) revealed via "More options" or settings toggle.
- Tooltip hints on first encounter of complex features, dismissible and tracked per user.

#### Edge Cases & What-If Scenarios

1. **Large project count in project switcher:** When a builder has a very large number of projects (100+), the project switcher dropdown must not become unusable. Required behavior: (a) show only the 10 most recently accessed projects by default, (b) provide a search/filter input at the top of the dropdown for instant filtering by project name, address, or number, (c) group projects by status (Active, Pre-Construction, Warranty, Closed) with collapsible sections, (d) lazy-load additional projects as the user scrolls or types, and (e) ensure the dropdown renders in under 200ms regardless of total project count. The project list query must be indexed and paginated server-side.

### 4.2 Global Search (Gap 526, 537, 545, 546)

**What Is Indexed**
- Projects (name, address, lot number, status)
- Contacts (name, company, email, phone)
- Invoices (number, vendor name, amount, status)
- Documents (filename, tags, OCR-extracted text -- leverages Module 6)
- Change Orders (number, description, status)
- Daily Logs (notes, tags)
- RFIs (subject, description)
- Selections (item name, category, vendor)
- Schedule Tasks (name, phase, assigned trade)

**Search Architecture**
- PostgreSQL `tsvector` / `tsquery` full-text search on a unified `search_index` materialized view.
- Each searchable entity writes to `search_index` via database trigger on INSERT/UPDATE/DELETE.
- Search query hits a single endpoint; results grouped by entity type with relevance scoring.
- All queries include `builder_id` filter (Gap 537) -- enforced at the database view level via RLS or explicit WHERE clause.
- Dedicated GIN indexes on `search_index.tsv_content` and `search_index.builder_id` (Gap 546).
- Typeahead: debounced 250ms, minimum 2 characters, returns top 5 per category.
- Full results page with filters by entity type, project, date range.

**Performance (Gap 545)**
- Search index limited to active + recent (last 2 years) data by default; "Search archived" toggle for full history.
- Response target: < 200ms for typeahead, < 500ms for full results.
- Pagination: 25 results per page with infinite scroll or explicit pagination.

#### Edge Cases & What-If Scenarios

1. **Search must respect all permission levels:** Search results must be filtered based on the current user's role and permissions. A field worker must not see search results for financial data (budgets, invoices) they lack permission to view. A vendor must only see results from projects they are assigned to. In `open` permission mode, all internal users see all results; in `standard` and `strict` modes, the search query must join against the user's permission set. The `search_index` queries must include permission filtering as part of the database query (not post-query filtering, which would leak result counts). The search endpoint must never return a result the user cannot navigate to — if a result would lead to an access-denied page, it must be excluded from search results entirely.

### 4.3 Dashboard Framework (Gap 521, 528, 533, 534)

**Widget System**
- Dashboard is a responsive grid layout (CSS Grid). Widgets occupy 1x1, 2x1, or 2x2 grid cells.
- Widgets are contributed by other modules and registered in a central widget registry.
- Each widget declares: `id`, `title`, `component`, `defaultSize`, `requiredPermission`, `defaultRoles`.
- Users can add/remove/reorder widgets via a "Customize Dashboard" panel.
- Widget configuration stored in `user_dashboard_config` (JSON column).

**Role-Based Defaults**
- Owner/Admin: Financial summary, project status overview, approval queue, cash flow chart.
- Project Manager: My active projects, upcoming tasks, pending RFIs, recent daily logs.
- Field Superintendent: Today's schedule, weather, open punch items, safety checklist status.
- Client (portal): Project progress, recent photos, upcoming selections, next milestone.
- Defaults are overridable per builder (`builder_dashboard_defaults` setting).

**"My Day" View (Gaps 528, 1028)**
- Aggregated cross-project view of items needing the current user's attention today.
- Sections: Overdue items, Due today, Upcoming (next 3 days), Recently assigned.
- Pulls from: tasks, approvals, RFIs, inspections, selection deadlines, invoice approvals.
- Each item links directly to its detail page with one click.
- Configurable: user can hide sections or reorder priority.
- Priority sorting: items ranked by urgency across all projects, not grouped by project (Gap 1028)
- Time-of-day awareness: morning view emphasizes planning (schedule, inspections, deliveries); afternoon view emphasizes review (logs, invoices, updates)

**Overnight Alert Review (Gap 1029)**
- Summary widget showing all events that occurred since the user's last session:
  - Emails received (linked to projects via AI classification)
  - Vendor messages and portal activity
  - Inspection results logged after hours
  - Weather forecast changes affecting tomorrow's schedule
  - System alerts: budget thresholds crossed, permits expiring, insurance certificates lapsing
- Alert categorization: action required, informational, resolved
- One-click acknowledge/dismiss for informational alerts; action required items link to their workflows

**Daily Cash Position Widget (Gap 1030)**
- Dashboard widget showing real-time financial snapshot (data from Module 9):
  - Current bank balance (or last known balance from bank feed)
  - Payments due out today and this week (approved invoices, scheduled payments)
  - Draw requests submitted and pending funding
  - Net cash position: balance minus committed outflows plus expected inflows
- Drill-down to full cash flow detail in Module 9
- Color-coded status: green (comfortable), yellow (tight), red (action needed)

**Client Communication Queue (Gap 1034)**
- Dashboard widget listing client messages awaiting response, sorted by wait time
- Unread client portal messages with project context and preview
- Scheduled client meetings for today with agenda and join links
- Response time tracking: visual indicator of how long each message has been waiting
- One-click navigate to message thread or meeting detail

**Vendor Follow-Up Queue (Gap 1035)**
- Dashboard widget aggregating vendor items needing attention:
  - Outstanding bids past due date
  - Overdue vendor invoices (received but not processed)
  - Unanswered RFIs from vendors
  - Expired or expiring insurance certificates
  - Unacknowledged bid invitations
- Each item shows vendor name, project, days overdue, and one-click action
- Filterable by urgency level and category

**Team Meeting Preparation (Gap 1057)**
- Auto-generated meeting agenda from project data for weekly team meetings
- Agenda sections: project status summary per active job, schedule health, budget alerts, pending decisions, upcoming milestones
- Customizable agenda template: builder defines standard meeting topics
- One-click generation: pull agenda data, format as a shareable document
- Meeting minutes template pre-populated with agenda items for note-taking during meeting

**Empty States (Gap 533)**
- Every widget and every list page has a designed empty state.
- Empty states include: illustration/icon, explanation text, primary action button ("Create your first project").
- Onboarding empty states are distinct from "filtered to nothing" empty states.

**Data Density (Gap 534)**
- Global preference: Compact / Default / Comfortable (stored in `user_preferences`).
- Compact: smaller fonts, tighter row spacing, more data visible.
- Comfortable: larger fonts, more whitespace, touch-friendly.
- Tables, cards, and list views all respect the density setting.

#### Edge Cases & What-If Scenarios

1. **Dashboard breakage from platform update:** When a platform update removes, renames, or changes a widget that a user has placed on their customized dashboard, the dashboard must not break or render a blank space. Required behavior: (a) each widget is rendered inside an error boundary that catches failures and displays a graceful fallback ("This widget is temporarily unavailable"), (b) when a widget is deprecated, the system migrates the user's `user_dashboard_config` to replace the old widget ID with its successor (or removes it if no successor exists), (c) after any platform update that affects widgets, a migration script must run to update all affected `user_dashboard_config` records, and (d) users are notified if their dashboard layout was automatically adjusted. Widget versioning must be tracked so that rollback is possible.

### 4.4 Command Palette & Keyboard Shortcuts (Gap 527, 532)

**Command Palette (Gap 532)**
- Activated via `Ctrl+K` (Windows/Linux) / `Cmd+K` (Mac).
- Fuzzy-match search across: navigation targets, recent items, quick actions.
- Quick actions: "Create Project", "New Invoice", "Add Daily Log", "Go to [Project Name]".
- Results prioritized: recent items > navigation > actions.
- Extensible: modules register their commands and navigation targets.

**Keyboard Shortcuts (Gap 527)**
- Global: `Ctrl+K` (palette), `Ctrl+/` (shortcut help), `Esc` (close modal/palette).
- Navigation: `G then P` (go to projects), `G then D` (go to dashboard), `G then S` (go to schedule).
- Data entry: `Tab` / `Shift+Tab` through form fields, `Enter` to submit, `Esc` to cancel.
- Table navigation: arrow keys to move between cells, `Enter` to edit, `Escape` to exit edit.
- Shortcut reference sheet accessible via `Ctrl+/` or `?` key.

### 4.5 Recently Viewed & Context Switching (Gap 525, 530)

**Recently Viewed (Gap 530)**
- Track last 20 viewed entities per user (stored in `user_recent_items`).
- Displayed in: command palette results, sidebar "Recent" section, search suggestions.
- Each entry: entity type icon, title, subtitle (e.g., project name), timestamp.

**Multi-Project Context (Gap 525)**
- When navigating from Project A's budget to Project B's budget, the navigation state (which tab, which filters) is preserved per-project in session storage.
- Project switcher dropdown always accessible in top nav when inside any project context.
- "Open in new tab" support for comparing across projects.

### 4.6 Accessibility & Localization (Gap 535, 536)

**Accessibility (Gap 535)**
- WCAG 2.1 AA compliance target.
- All interactive elements keyboard-focusable with visible focus indicators.
- ARIA labels on all icons, buttons, and dynamic regions.
- Color contrast ratio >= 4.5:1 for normal text, >= 3:1 for large text.
- Screen reader announcements for dynamic content updates (live regions).
- Skip-to-content link on every page.
- Automated accessibility testing in CI (axe-core).

**Localization (Gap 536)**
- All user-facing strings extracted to locale files (`en-US.json` for V1).
- Architecture uses `react-intl` or `i18next` for string interpolation and pluralization.
- Date, currency, and number formatting locale-aware.
- RTL layout support deferred post-V1 but CSS architecture must not preclude it.

---

## Database Tables

```sql
-- Unified search index (materialized or table with triggers)
CREATE TABLE search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  entity_type TEXT NOT NULL,        -- 'project', 'contact', 'invoice', etc.
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,               -- primary display text
  subtitle TEXT,                     -- secondary context (project name, vendor, etc.)
  body TEXT,                         -- full searchable text
  tsv_content TSVECTOR,             -- generated from title + subtitle + body
  url_path TEXT NOT NULL,            -- deep link path
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(builder_id, entity_type, entity_id)
);
CREATE INDEX idx_search_tsv ON search_index USING GIN(tsv_content);
CREATE INDEX idx_search_builder ON search_index(builder_id);

-- User dashboard configuration
CREATE TABLE user_dashboard_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  builder_id UUID NOT NULL REFERENCES builders(id),
  layout JSONB NOT NULL DEFAULT '[]',  -- [{widgetId, position, size, config}]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, builder_id)
);

-- Recently viewed items
CREATE TABLE user_recent_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  builder_id UUID NOT NULL REFERENCES builders(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  url_path TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_recent_user ON user_recent_items(user_id, builder_id, viewed_at DESC);

-- User preferences (density, locale, shortcuts enabled, etc.)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  builder_id UUID NOT NULL REFERENCES builders(id),
  data_density TEXT DEFAULT 'default' CHECK (data_density IN ('compact', 'default', 'comfortable')),
  locale TEXT DEFAULT 'en-US',
  keyboard_shortcuts_enabled BOOLEAN DEFAULT true,
  sidebar_collapsed BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, builder_id)
);

-- Builder-level navigation and dashboard defaults
-- (stored in existing builder_settings table as JSON keys)
-- nav_module_order: ["dashboard","projects","schedule","budget",...]
-- dashboard_defaults: {role: [{widgetId, position, size}]}
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v2/search?q=&type=&project_id=&limit=` | Global search with optional filters |
| GET | `/api/v2/search/suggestions?q=` | Typeahead suggestions (fast path) |
| GET | `/api/v2/dashboard/config` | Get current user's dashboard layout |
| PUT | `/api/v2/dashboard/config` | Save dashboard layout |
| GET | `/api/v2/dashboard/widgets` | List available widgets for user's role |
| GET | `/api/v2/dashboard/my-day` | Aggregated "My Day" items |
| GET | `/api/v2/recent-items` | User's recently viewed items |
| POST | `/api/v2/recent-items` | Record a viewed item |
| GET | `/api/v2/user/preferences` | Get user preferences |
| PUT | `/api/v2/user/preferences` | Update user preferences |
| GET | `/api/v2/navigation/config` | Get builder's nav module order |
| PUT | `/api/v2/navigation/config` | Update nav module order (admin only) |

---

## Dependencies

| Module | Reason |
|--------|--------|
| Module 1: Auth & Access | Role-based menu visibility, permission checks on widgets |
| Module 2: Multi-Tenant Core | `builder_id` filtering on all queries, builder settings |
| Module 3: Core Data Model | All searchable entities, project context |
| Module 5: Notification Engine | Notification bell count and dropdown in top nav (Gap 529) |
| Module 6: Document Storage | Document search results include file metadata |
| All other modules | Each module registers widgets, search indexers, and command palette actions |

---

## Open Questions

1. **Search technology**: Should we start with PostgreSQL full-text search and migrate to a dedicated engine (Typesense, Meilisearch) later, or invest in a dedicated engine from day one? PostgreSQL FTS is sufficient for < 100K documents per tenant but may need upgrading at scale.
2. **Widget marketplace**: Should third-party or builder-created widgets be supported in V1, or only platform-provided widgets?
3. **"My Day" data sources**: Which modules contribute to "My Day" in V1 vs. later phases? Recommended V1: tasks, approvals, RFIs. Phase 2: inspections, selections, invoice approvals.
4. **Offline dashboard**: Should the dashboard have any offline capability (cached last-known state) for field users with poor connectivity, or is that deferred to the PWA/mobile module?
5. **Command palette extensibility**: Should the command palette support builder-defined custom actions (e.g., "Run weekly report"), or only platform-defined actions?
6. **Accessibility audit**: When should the formal WCAG 2.1 AA audit be conducted -- at end of Phase 1 or as a continuous process?

---

## UX Design Principles (Blueprint Section 3.3)

These principles apply across the entire platform and are documented here as the module responsible for the primary user experience.

### Principle 1: Progressive Disclosure
Simple by default. Power when needed. New users see simplified views with guided workflows. As users learn, they unlock more detailed views. Power features are always available but never forced. Every screen must support a "simple" and "detailed" toggle where applicable.

### Principle 2: Context-Aware Interface
Show what is relevant NOW based on: user's role (PM sees different priorities than Owner), time of day (morning = planning view, afternoon = review view), project phase (preconstruction shows different tools than construction), device (desktop = full data, mobile = action-oriented), and usage patterns (frequently used features surface first).

### Principle 3: Three-Click Rule for Common Tasks
The 20 most common daily tasks must be completable in 3 clicks or less: create daily log, take/upload photo, approve invoice, check project budget, view today's schedule, send vendor message, create punch list item, log inspection result, check delivery status, create RFI, update task status, review client portal, generate report, check cash flow, view vendor compliance, create change order, log safety observation, schedule inspection, review/approve bid, send client update.

### Principle 4: Smart Defaults
Pre-fill everything possible: daily log auto-populates date, weather, and yesterday's vendors on site. New project auto-populates from project template. Invoice AI suggests cost codes from vendor history. Schedule auto-suggests durations from historical data. Change order auto-calculates markup from settings. PO auto-populates from contract terms. Lien waiver auto-fills from payment data.

### Principle 5: Never Lose Work
Auto-save every field change (no "save" button needed). Offline mode queues changes for sync. "Undo" available for every action for 30 days. Deleted items go to recycle bin, not permanent delete. Version history on every document and record.

### Principle 6: One Place to Look
Global search finds ANYTHING (vendor name, invoice number, address, document content). "What's happening on [project]?" produces a one-page comprehensive summary. "What do I need to do?" produces a priority-sorted action queue across all projects. "Where's my money?" produces cash position + pending draws + outstanding invoices on one screen.

### Principle 7: Beautiful Without Trying
Auto-formatted reports that look professional without configuration. Client portal that impresses without builder effort. Photo galleries that look curated automatically. Financial reports that are clear to non-accountants. Proposals that close deals with beautiful templates included.

### Principle 8: Inclusive Design
Works for tech-savvy PM AND technophobe superintendent. Works in English AND Spanish (field staff). Works on $200 Android AND $1,500 iPhone. Works on 5" phone AND 27" monitor. Works for 25-year-old AND 65-year-old. Works with slow rural internet AND fast city connection. WCAG 2.1 AA compliant (accessibility).
