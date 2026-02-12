# RossOS MVP Roadmap

> **Goal**: Build a construction management platform that solves the top pain points for custom home builders, enabling them to manage 10,000+ companies and 1,000,000+ users.

## Roadmap Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MVP v1.0 ROADMAP                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Phase 1        Phase 2         Phase 3         Phase 4         Phase 5     │
│  ────────       ────────        ────────        ────────        ────────    │
│  Foundation     Financial       Field &         Selections      Vendors &   │
│  & Core Data    Management      Schedule        & Design        Subs        │
│                                                                              │
│  • Auth         • Invoices      • Schedule      • Selections    • Sub DB    │
│  • Companies    • Change Ords   • Daily Logs    • Allowances    • Bids      │
│  • Users        • Budget Track  • Photos        • Deadlines     • Contracts │
│  • Jobs         • Draws         • Inspections   • Designer      • Insurance │
│  • Clients      • Pay Apps      • Punch Lists   • Approvals     • Payments  │
│                                                                              │
│  Phase 6        Phase 7         Phase 8                                      │
│  ────────       ────────        ────────                                     │
│  Client         Reports &       Documents &                                  │
│  Portal         Analytics       Communication                                │
│                                                                              │
│  • Dashboard    • Financials    • Drawing Mgmt                              │
│  • Progress     • Portfolio     • RFIs                                      │
│  • Budget View  • KPIs          • Submittals                                │
│  • Approvals    • Trends        • Messaging                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation & Core Data

**Objective**: Establish core entities and basic CRUD operations for the fundamental building blocks.

### Pain Points Addressed
- #671: Project data lives in multiple systems that don't talk to each other
- #121: I have to look through multiple documents and spreadsheets
- #411: I can't find project documents quickly
- #296: I can't see all projects' status at a glance

### Database Schema

```sql
-- Core tables (in order of creation)
companies          -- Tenant accounts
users              -- User accounts with roles
clients            -- Customer/homeowner records
jobs               -- Construction projects
job_phases         -- Project phases/milestones
contacts           -- Contact information
addresses          -- Address records
notes              -- Notes on any entity
tags               -- Tagging system
```

### Features

| Feature | Priority | Pain Points |
|---------|----------|-------------|
| Company onboarding & settings | P0 | #1231-1240 |
| User management & roles (Admin, PM, Field, Viewer) | P0 | #351-360 |
| Client management (CRUD, contacts, properties) | P0 | #226-235 |
| Job/Project management (CRUD, status, phases) | P0 | #31-50, #296-310 |
| Dashboard - Project list with status indicators | P0 | #296, #1081 |
| Search across all entities | P0 | #1004, #253 |
| Basic activity log | P1 | #737 |

### API Endpoints

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/companies/:id
PATCH  /api/companies/:id

GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id

GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PATCH  /api/clients/:id
DELETE /api/clients/:id

GET    /api/jobs
POST   /api/jobs
GET    /api/jobs/:id
PATCH  /api/jobs/:id
DELETE /api/jobs/:id
GET    /api/jobs/:id/summary
```

### Success Criteria
- [ ] User can create account and set up company
- [ ] User can invite team members with appropriate roles
- [ ] User can create and manage clients
- [ ] User can create and manage jobs with basic info
- [ ] Dashboard shows all active jobs with status
- [ ] Search returns results across clients, jobs, users

---

## Phase 2: Financial Management

**Objective**: Enable complete financial tracking from budget to payment.

### Pain Points Addressed
- #1-30: Client budget visibility issues
- #121-150: PM budget management issues
- #276-295: Owner financial overview issues
- #361-410: Admin invoice processing issues

### Database Schema

```sql
-- Financial tables
cost_codes         -- Standard cost code library
budgets            -- Job budgets by cost code
budget_line_items  -- Individual budget lines
invoices           -- Vendor/sub invoices
invoice_line_items -- Invoice line items
change_orders      -- Change order requests
change_order_items -- CO line items
draws              -- Payment draw requests
draw_line_items    -- Draw breakdown
payments           -- Payment records
```

### Features

| Feature | Priority | Pain Points |
|---------|----------|-------------|
| Cost code library (customizable) | P0 | #748 |
| Job budgeting by cost code | P0 | #1, #121-130 |
| Budget vs Actual tracking | P0 | #122, #1 |
| Invoice entry & processing | P0 | #361-375 |
| Invoice approval workflow | P0 | #363, #707 |
| Change order creation & approval | P0 | #96-105, #951-970 |
| Draw/Pay application creation | P0 | #376-385, #641-650 |
| AIA G702/G703 generation | P0 | #377, #21 |
| Committed costs tracking | P0 | #123 |
| Projected final cost | P0 | #2, #125 |
| Cost to complete by line | P0 | #124 |
| Financial dashboard | P0 | #276-280 |
| Retainage tracking | P1 | #22, #142 |
| Allowance tracking | P1 | #3, #144 |

### API Endpoints

```
GET    /api/cost-codes
POST   /api/cost-codes
PATCH  /api/cost-codes/:id

GET    /api/jobs/:id/budget
POST   /api/jobs/:id/budget
PATCH  /api/jobs/:id/budget
GET    /api/jobs/:id/budget/summary

GET    /api/jobs/:id/invoices
POST   /api/jobs/:id/invoices
GET    /api/invoices/:id
PATCH  /api/invoices/:id
POST   /api/invoices/:id/approve
POST   /api/invoices/:id/reject

GET    /api/jobs/:id/change-orders
POST   /api/jobs/:id/change-orders
GET    /api/change-orders/:id
PATCH  /api/change-orders/:id
POST   /api/change-orders/:id/approve

GET    /api/jobs/:id/draws
POST   /api/jobs/:id/draws
GET    /api/draws/:id
POST   /api/draws/:id/generate-aia
```

### Success Criteria
- [ ] PM can create job budget with cost codes
- [ ] PM can enter and code invoices
- [ ] Admin can approve/reject invoices with workflow
- [ ] PM can create change orders with cost/schedule impact
- [ ] Client can approve change orders digitally
- [ ] PM can generate AIA G702/G703 pay applications
- [ ] Dashboard shows budget vs actual, projected final cost
- [ ] Owner can see portfolio financial summary

---

## Phase 3: Field Operations & Schedule

**Objective**: Enable field documentation and schedule management.

### Pain Points Addressed
- #31-50: Client schedule visibility
- #151-170: PM schedule management
- #171-190: PM daily operations
- #561-600: Superintendent field operations
- #236-250: Quality control

### Database Schema

```sql
-- Schedule tables
schedule_templates    -- Reusable schedule templates
schedule_items        -- Individual schedule activities
schedule_dependencies -- Activity dependencies

-- Field tables
daily_logs           -- Daily job site logs
daily_log_entries    -- Log entry details (weather, crews, notes)
photos               -- Photo documentation
photo_tags           -- Photo categorization
inspections          -- Inspection records
inspection_items     -- Inspection checklist items
punch_lists          -- Punch list records
punch_list_items     -- Individual punch items
```

### Features

| Feature | Priority | Pain Points |
|---------|----------|-------------|
| Schedule creation with dependencies | P0 | #151-160, #871-880 |
| Schedule templates by project type | P1 | #162, #871 |
| Critical path identification | P0 | #32, #154 |
| Gantt chart visualization | P0 | #48 |
| 2-week look-ahead generation | P0 | #159, #1084 |
| Schedule vs actual tracking | P0 | #155-158 |
| Daily log entry (mobile-friendly) | P0 | #171-175, #561-570 |
| Auto weather capture | P1 | #562 |
| Photo capture with tagging | P0 | #174, #564 |
| Inspection scheduling & tracking | P0 | #42, #240-245 |
| Inspection checklists | P0 | #571-580 |
| Punch list management | P0 | #89, #239, #971-980 |
| Milestone tracking | P0 | #37, #163 |

### API Endpoints

```
GET    /api/jobs/:id/schedule
POST   /api/jobs/:id/schedule
PATCH  /api/schedule-items/:id
GET    /api/jobs/:id/schedule/critical-path
GET    /api/jobs/:id/schedule/look-ahead

GET    /api/jobs/:id/daily-logs
POST   /api/jobs/:id/daily-logs
GET    /api/daily-logs/:id
PATCH  /api/daily-logs/:id

POST   /api/jobs/:id/photos
GET    /api/jobs/:id/photos
GET    /api/photos/:id
PATCH  /api/photos/:id

GET    /api/jobs/:id/inspections
POST   /api/jobs/:id/inspections
PATCH  /api/inspections/:id

GET    /api/jobs/:id/punch-lists
POST   /api/jobs/:id/punch-lists
PATCH  /api/punch-list-items/:id
```

### Success Criteria
- [ ] PM can create schedule with dependencies
- [ ] System identifies critical path automatically
- [ ] PM can generate 2-week look-ahead
- [ ] Field can log daily activities from mobile in < 10 min
- [ ] Photos auto-tag with date, location, phase
- [ ] PM can schedule and track inspections
- [ ] Punch lists can be created, assigned, tracked
- [ ] Client can see schedule and progress

---

## Phase 4: Selections & Design

**Objective**: Manage client selections, allowances, and design team coordination.

### Pain Points Addressed
- #51-70: Client selection issues
- #471-500: Interior designer issues
- #431-470: Architect coordination

### Database Schema

```sql
-- Selection tables
selection_categories  -- Selection category definitions
selections           -- Individual selections
selection_options    -- Options for each selection
selection_approvals  -- Client approval records

-- Allowance tables
allowances           -- Allowance budgets
allowance_usage      -- Actual spend against allowances

-- Design tables
design_packages      -- Designer mood boards/packages
specifications       -- Product specifications
```

### Features

| Feature | Priority | Pain Points |
|---------|----------|-------------|
| Selection category setup | P0 | #51 |
| Selection tracking with deadlines | P0 | #51-55 |
| Selection options comparison | P0 | #57 |
| Allowance budget vs actual | P0 | #56, #491-495 |
| Selection approval workflow | P0 | #52, #59 |
| Lead time tracking | P0 | #60, #40 |
| Designer portal access | P1 | #471-490 |
| Specification management | P1 | #63, #496-500 |
| Selection impact on schedule | P1 | #46, #169 |
| Selection cost impact preview | P1 | #53, #70 |

### API Endpoints

```
GET    /api/jobs/:id/selections
POST   /api/jobs/:id/selections
GET    /api/selections/:id
PATCH  /api/selections/:id
POST   /api/selections/:id/approve

GET    /api/jobs/:id/allowances
POST   /api/jobs/:id/allowances
PATCH  /api/allowances/:id

GET    /api/jobs/:id/specifications
POST   /api/jobs/:id/specifications
```

### Success Criteria
- [ ] PM can set up selections with deadlines
- [ ] Client can view and approve selections
- [ ] System tracks allowance budget vs actual
- [ ] Designer can submit selections with specs
- [ ] Overdue selections trigger notifications
- [ ] Selection changes create change orders automatically

---

## Phase 5: Vendors & Subcontractors

**Objective**: Manage trade partners, bidding, contracts, and compliance.

### Pain Points Addressed
- #191-210: PM trade management
- #251-265: Procurement
- #601-640: Subcontractor issues
- #341-350: Compliance

### Database Schema

```sql
-- Vendor tables
vendors              -- Vendor/subcontractor master
vendor_contacts      -- Vendor contact people
vendor_categories    -- Trade categories
vendor_ratings       -- Performance ratings
vendor_documents     -- Insurance, licenses, W9s

-- Bidding tables
bid_packages         -- Bid package definitions
bids                 -- Submitted bids
bid_comparisons      -- Bid leveling data

-- Contract tables
contracts            -- Subcontracts
contract_items       -- Contract line items
contract_changes     -- Sub change orders

-- Compliance tables
insurance_policies   -- Insurance certificates
lien_waivers         -- Lien waiver records
```

### Features

| Feature | Priority | Pain Points |
|---------|----------|-------------|
| Vendor database with categories | P0 | #193, #806-815 |
| Insurance tracking with expiration alerts | P0 | #194, #392, #711 |
| License & W9 tracking | P0 | #342, #208 |
| Bid package creation & distribution | P0 | #195, #551-560 |
| Bid comparison/leveling | P0 | #196, #554 |
| Subcontract generation | P0 | #198, #386-395 |
| Sub payment tracking | P0 | #200, #611-620 |
| Lien waiver management | P0 | #369, #410 |
| Sub portal (invoice submission, payment status) | P1 | #209, #611-612 |
| Vendor performance scoring | P1 | #191, #201 |
| Back-charge tracking | P1 | #137, #618 |

### API Endpoints

```
GET    /api/vendors
POST   /api/vendors
GET    /api/vendors/:id
PATCH  /api/vendors/:id
GET    /api/vendors/:id/documents
POST   /api/vendors/:id/documents

GET    /api/jobs/:id/bid-packages
POST   /api/jobs/:id/bid-packages
GET    /api/bid-packages/:id/bids
POST   /api/bid-packages/:id/bids

GET    /api/jobs/:id/contracts
POST   /api/jobs/:id/contracts
GET    /api/contracts/:id
PATCH  /api/contracts/:id

GET    /api/contracts/:id/lien-waivers
POST   /api/contracts/:id/lien-waivers
```

### Success Criteria
- [ ] PM can manage vendor database with insurance tracking
- [ ] System alerts 30 days before insurance expiration
- [ ] PM can create and distribute bid packages
- [ ] PM can compare bids side-by-side
- [ ] PM can generate subcontracts from bids
- [ ] Subs can submit invoices through portal
- [ ] Lien waivers tracked with payments

---

## Phase 6: Client Portal

**Objective**: Provide clients with transparent access to their project.

### Pain Points Addressed
- #1-30: Client financial visibility
- #31-50: Client schedule visibility
- #71-95: Client communication
- #1111-1120: Client daily experience
- #1291-1320: Client experience

### Features

| Feature | Priority | Pain Points |
|---------|----------|-------------|
| Client dashboard (simplified view) | P0 | #84, #1111, #1301 |
| Budget summary (spent, remaining, projected) | P0 | #1-5 |
| Schedule with milestones | P0 | #31-37 |
| Photo gallery by phase | P0 | #1304 |
| Change order approval | P0 | #101, #1115 |
| Selection management | P0 | #51-70 |
| Draw/payment schedule | P0 | #9, #17 |
| Document access | P0 | #84 |
| Message center | P0 | #71-85 |
| Weekly progress digest | P1 | #50, #78, #1089 |
| Mobile-optimized experience | P0 | #1268 |

### API Endpoints

```
-- Client-specific endpoints (scoped access)
GET    /api/client/dashboard
GET    /api/client/budget-summary
GET    /api/client/schedule
GET    /api/client/photos
GET    /api/client/change-orders
POST   /api/client/change-orders/:id/approve
GET    /api/client/selections
POST   /api/client/selections/:id/approve
GET    /api/client/messages
POST   /api/client/messages
```

### Success Criteria
- [ ] Client can log in and see simple dashboard
- [ ] Client sees budget spent vs remaining
- [ ] Client sees projected completion date
- [ ] Client can view photos by date/phase
- [ ] Client can approve change orders digitally
- [ ] Client can make/approve selections
- [ ] Client can message PM through system
- [ ] Works well on mobile

---

## Phase 7: Reports & Analytics

**Objective**: Provide actionable insights for decision-making.

### Pain Points Addressed
- #276-295: Owner portfolio visibility
- #691-705: Reporting issues
- #1041-1080: AI & analytics

### Features

| Feature | Priority | Pain Points |
|---------|----------|-------------|
| Job financial report | P0 | #134, #1083 |
| Budget variance report | P0 | #24, #126 |
| Portfolio dashboard | P0 | #276-280, #1101 |
| Cash flow forecast | P0 | #140, #279, #1102 |
| WIP report (for bonding/banking) | P0 | #287, #1107 |
| Schedule performance report | P0 | #165 |
| Change order summary | P0 | #100, #961-970 |
| Vendor performance report | P1 | #191, #308 |
| PM performance comparison | P1 | #283, #1104 |
| Profitability by project type | P1 | #293, #331 |
| Custom report builder | P2 | #694 |
| Scheduled report delivery | P2 | #696 |

### API Endpoints

```
GET    /api/reports/job-financial/:jobId
GET    /api/reports/budget-variance/:jobId
GET    /api/reports/portfolio-summary
GET    /api/reports/cash-flow-forecast
GET    /api/reports/wip
GET    /api/reports/schedule-performance/:jobId
GET    /api/reports/change-order-summary/:jobId
GET    /api/reports/vendor-performance
```

### Success Criteria
- [ ] PM can generate job financial report in < 5 min
- [ ] Owner sees portfolio dashboard on login
- [ ] Cash flow forecast shows 90-day projection
- [ ] WIP report matches banking requirements
- [ ] Reports export to PDF/Excel

---

## Phase 8: Documents & Communication

**Objective**: Centralize documents and streamline communication.

### Pain Points Addressed
- #211-225: Document management
- #71-85: Communication
- #911-930: RFI/Submittal management
- #731-740: Collaboration

### Database Schema

```sql
-- Document tables
documents            -- Document records
document_versions    -- Version history
document_folders     -- Folder structure
document_permissions -- Access control

-- Communication tables
messages             -- Message threads
message_recipients   -- Thread participants
notifications        -- System notifications

-- RFI/Submittal tables
rfis                 -- Request for information
rfi_responses        -- RFI responses
submittals           -- Submittal records
submittal_reviews    -- Review/approval records
```

### Features

| Feature | Priority | Pain Points |
|---------|----------|-------------|
| Document repository with folders | P0 | #211, #216 |
| Version control | P0 | #212, #732 |
| Drawing management | P0 | #211, #901-910 |
| RFI tracking | P0 | #179, #911-920 |
| Submittal management | P0 | #182, #921-930 |
| Internal messaging | P0 | #71-85 |
| @mentions and notifications | P0 | #734, #1031-1040 |
| Comment threads on items | P1 | #733 |
| Meeting notes | P1 | #74, #221 |
| Transmittal generation | P1 | #415 |

### API Endpoints

```
GET    /api/jobs/:id/documents
POST   /api/jobs/:id/documents
GET    /api/documents/:id
GET    /api/documents/:id/versions
POST   /api/documents/:id/versions

GET    /api/jobs/:id/rfis
POST   /api/jobs/:id/rfis
GET    /api/rfis/:id
POST   /api/rfis/:id/respond

GET    /api/jobs/:id/submittals
POST   /api/jobs/:id/submittals
PATCH  /api/submittals/:id

GET    /api/messages
POST   /api/messages
GET    /api/messages/:threadId
POST   /api/messages/:threadId/reply
```

### Success Criteria
- [ ] All documents in one searchable location
- [ ] Drawing revisions tracked with comparison
- [ ] RFIs submitted and tracked with response time
- [ ] Submittals routed for approval
- [ ] Team can message within system
- [ ] Relevant notifications delivered appropriately

---

## Post-MVP: Future Phases

### Phase 9: AI & Automation
- Natural language queries (#1051-1060)
- Predictive cost forecasting (#1041-1050)
- Automated invoice data extraction (#719, #1071)
- Smart schedule suggestions (#721)
- Anomaly detection and alerts (#699, #1061-1070)

### Phase 10: Home Care & Warranty
- Warranty claim management (#816-840)
- Home maintenance scheduling (#826-835)
- Digital home manual (#1311)
- Post-construction client portal (#106-120)

### Phase 11: Sales & Pre-Construction
- Lead/prospect pipeline (#311-325)
- Preliminary budgeting (#318)
- Proposal generation (#861-870)
- Digital estimating (#526-560)

### Phase 12: Advanced Features
- Coastal/elevated construction compliance (#751-785)
- Multi-entity/multi-office support (#1233, #1236)
- Advanced procurement (#786-815)
- Equipment management (#359, #896)

---

## Implementation Priority Matrix

### P0 — Must Ship for MVP
| Phase | Features |
|-------|----------|
| 1 | Auth, Companies, Users, Clients, Jobs |
| 2 | Budgets, Invoices, Change Orders, Draws, AIA Pay Apps |
| 3 | Schedule, Daily Logs, Photos, Punch Lists |
| 6 | Client Portal (basic) |

### P1 — Should Ship for MVP
| Phase | Features |
|-------|----------|
| 4 | Selections, Allowances |
| 5 | Vendors, Contracts, Insurance, Lien Waivers |
| 7 | Core Reports (Financial, Portfolio, WIP) |
| 8 | Documents, RFIs |

### P2 — Nice to Have for MVP
| Phase | Features |
|-------|----------|
| 3 | Schedule templates, auto-weather |
| 5 | Bid management, sub portal |
| 7 | Custom reports, scheduled delivery |
| 8 | Submittals, messaging |

---

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CORE ENTITIES                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  companies ─────┬───── users                                                │
│       │         │                                                            │
│       │         └───── jobs ─────────┬───── clients                         │
│       │                   │          │                                       │
│       │                   │          ├───── budgets ──── budget_line_items  │
│       │                   │          │                                       │
│       │                   │          ├───── invoices ─── invoice_line_items │
│       │                   │          │                                       │
│       │                   │          ├───── change_orders ── co_items       │
│       │                   │          │                                       │
│       │                   │          ├───── draws ────── draw_line_items    │
│       │                   │          │                                       │
│       │                   │          ├───── schedule_items                  │
│       │                   │          │                                       │
│       │                   │          ├───── daily_logs ── photos            │
│       │                   │          │                                       │
│       │                   │          ├───── selections                      │
│       │                   │          │                                       │
│       │                   │          ├───── contracts ─── vendors           │
│       │                   │          │                                       │
│       │                   │          ├───── documents                       │
│       │                   │          │                                       │
│       │                   │          └───── punch_lists                     │
│       │                                                                      │
│       └───── cost_codes (library)                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Success Metrics

### MVP Launch Criteria
- [ ] 5 construction companies can run full projects in the system
- [ ] Financial data matches QuickBooks within 1%
- [ ] AIA pay applications accepted by lenders
- [ ] < 3 second page load times
- [ ] 99.5% uptime
- [ ] Mobile usable for field operations

### Key Performance Indicators
| Metric | Target |
|--------|--------|
| Time to create daily log | < 10 minutes |
| Time to generate pay app | < 5 minutes |
| Client satisfaction score | > 4.5/5 |
| PM time saved per week | > 5 hours |
| Invoice processing time | < 2 minutes |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Scope creep | Strict phase boundaries, P0 focus |
| Performance at scale | Load testing each phase, caching strategy |
| Data migration | Build import tools early, offer migration service |
| User adoption | Simple UX, training materials, gradual rollout |
| Competition | Focus on AI differentiation, custom home niche |

---

*Last Updated: 2024-02-12*
*Version: 1.0*
