# RossOS - Navigation Structure

## Overview

The app is **job-centric**. Jobs are the primary workspace, with a persistent sidebar for quick job switching.

---

## Main Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ☰  RossOS                                    🔔  👤 John      │
│      [Menu]                                       Notifications     │
├───────────────┬─────────────────────────────────────────────────────┤
│               │                                                     │
│  JOB SIDEBAR  │  JOB NAV (dropdowns)                                │
│               │  ┌────────┬────────────┬──────────┬─────────────┐   │
│  [Search...]  │  │Overview│ Financial ▼│ Field ▼  │ Documents ▼ │   │
│               │  └────────┴────────────┴──────────┴─────────────┘   │
│  ● ACTIVE     │  ───────────────────────────────────────────────    │
│  ─────────    │                                                     │
│  Smith Home   │                                                     │
│  123 Oak St   │        CONTENT AREA                                 │
│               │                                                     │
│  Johnson Res  │        (changes based on nav selection)             │
│  456 Pine Ave │                                                     │
│               │                                                     │
│  ● PRE-CON    │                                                     │
│  ─────────    │                                                     │
│  Wilson Proj  │                                                     │
│  789 Elm Rd   │                                                     │
│               │                                                     │
│  ● ON HOLD    │                                                     │
│  ─────────    │                                                     │
│  Brown House  │                                                     │
│               │                                                     │
│  ─────────────│                                                     │
│  + New Job    │                                                     │
│               │                                                     │
└───────────────┴─────────────────────────────────────────────────────┘
```

---

## Top Bar

### Left Side
- **Menu button (☰)** - Opens menu for non-job areas
- **Logo/Company name**

### Right Side
- **Notifications** - Bell icon with badge
- **User menu** - Avatar dropdown with profile, settings, logout

---

## Menu (☰) Contents

Clicking the menu button opens a slide-out or dropdown with:

| Area | Icon | Description |
|------|------|-------------|
| Dashboard | 📊 | Company-wide overview |
| Leads | 🎯 | Sales pipeline |
| Vendors | 🏗️ | Subcontractor directory |
| Clients | 👥 | Customer directory |
| Reports | 📈 | Financial reports |
| Settings | ⚙️ | Company & user settings |

---

## Job Sidebar

### Sections
Jobs grouped by status:
- **Active** - Currently in construction
- **Pre-construction** - Estimating/proposal phase
- **On Hold** - Paused projects
- **Completed** - Finished projects (collapsed by default)
- **Warranty** - In warranty period (collapsed by default)

### Job Entry
```
┌─────────────────────┐
│ Smith Residence     │  ← Job name
│ 123 Oak Street      │  ← Address
└─────────────────────┘
```

### Features
- **Search** - Filter jobs by name/address
- **Filter by assignment** - "My Jobs" toggle
- **+ New Job** - Button at bottom
- **Click job** - Selects job, loads in content area
- **Active job** - Highlighted in sidebar

---

## Job Navigation (Top Nav)

When a job is selected, the top nav shows:

### Overview Tab
- Job dashboard (default view)

### Financial Dropdown
- Budget
- Invoices
- Purchase Orders
- Draws
- Change Orders

### Field Dropdown
- Schedule
- Daily Logs
- Photos

### Documents Dropdown
- Files
- Plans

### Pre-Con Dropdown (shows if job.status = pre-construction)
- Estimate
- Proposal
- Contract
- Selections

### Closeout Dropdown (shows if job.status = completed/warranty)
- Punch List
- Final Docs
- Warranty

### Settings (gear icon)
- Job details edit
- Team assignments
- Notifications

---

## Default View by Status

| Job Status | Default Section |
|------------|-----------------|
| Pre-construction | Estimate |
| Active | Overview or Schedule |
| On Hold | Overview |
| Completed | Punch List |
| Warranty | Warranty |

---

## URL Structure

```
/                           → Dashboard (no job selected)
/jobs/:id                   → Job Overview
/jobs/:id/budget            → Budget
/jobs/:id/invoices          → Invoices
/jobs/:id/purchase-orders   → Purchase Orders
/jobs/:id/draws             → Draws
/jobs/:id/change-orders     → Change Orders
/jobs/:id/schedule          → Schedule
/jobs/:id/daily-logs        → Daily Logs
/jobs/:id/photos            → Photos
/jobs/:id/files             → Files
/jobs/:id/estimate          → Estimate
/jobs/:id/proposal          → Proposal
/jobs/:id/contract          → Contract
/jobs/:id/selections        → Selections
/jobs/:id/punch-list        → Punch List
/jobs/:id/final-docs        → Final Docs
/jobs/:id/warranty          → Warranty
/jobs/:id/settings          → Job Settings

/leads                      → Leads Pipeline
/leads/:id                  → Lead Detail

/vendors                    → Vendors List
/vendors/:id                → Vendor Detail

/clients                    → Clients List
/clients/:id                → Client Detail

/reports                    → Reports Hub
/reports/profitability      → Profitability Report
/reports/cash-flow          → Cash Flow Report

/settings                   → Settings Hub
/settings/company           → Company Settings
/settings/users             → User Management
/settings/cost-codes        → Cost Codes
/settings/integrations      → Integrations (QuickBooks)
```

---

## Mobile Layout

```
┌─────────────────────────────┐
│ ☰  Smith Residence    🔔 👤 │  ← Job selector in menu
├─────────────────────────────┤
│ Overview | Financial ▼ | ▼  │  ← Scrollable nav
├─────────────────────────────┤
│                             │
│                             │
│       CONTENT               │
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

- Menu (☰) opens job sidebar + other areas
- Job nav is horizontal scrollable tabs/dropdowns
- Selected job name shown in header

---

## Component Structure

```
components/layout/
├── AppLayout.tsx           (Main layout wrapper)
├── TopBar.tsx              (Logo, menu button, notifications, user)
├── MainMenu.tsx            (Slide-out menu for non-job areas)
├── JobSidebar.tsx          (Job list with search and filters)
├── JobSidebarItem.tsx      (Individual job entry)
├── JobNav.tsx              (Top navigation for job sections)
├── JobNavDropdown.tsx      (Dropdown menu for nav sections)
└── MobileNav.tsx           (Mobile-specific navigation)
```

---

## State Management

### Global State
- `selectedJobId` - Currently selected job
- `currentSection` - Current job section (budget, invoices, etc.)
- `user` - Current user with role

### URL Sync
- Job selection and section stored in URL
- Browser back/forward works naturally
- Deep linking to specific job sections works

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from planning session |
