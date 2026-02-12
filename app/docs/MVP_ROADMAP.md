# RossOS MVP Roadmap

> **Goal**: Build a construction management platform that solves the top pain points for custom home builders, enabling them to manage 10,000+ companies and 1,000,000+ users.

## Roadmap Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MVP v1.0 ROADMAP (Phases 1-8)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Phase 1        Phase 1.5 ⭐    Phase 2         Phase 3         Phase 4     │
│  ────────       ────────        ────────        ────────        ────────    │
│  Foundation     DATA MIGRATION  Financial       Field &         Selections  │
│  & Core Data    (CRITICAL)      Management      Schedule        & Design    │
│                                                                              │
│  • Auth         • Buildertrend  • Invoices      • Schedule      • Select    │
│  • Companies    • CoConstruct   • Change Ords   • Daily Logs    • Allowance │
│  • Users        • QuickBooks    • Budget Track  • Photos        • Deadlines │
│  • Jobs         • Procore       • Draws         • Inspections   • Designer  │
│  • Clients      • Excel/CSV     • Pay Apps      • Punch Lists   • Approvals │
│                 • AI Mapping                    • SAFETY ⚠️                 │
│                                                                              │
│  Phase 5        Phase 6         Phase 7         Phase 8                      │
│  ────────       ────────        ────────        ────────                     │
│  Vendors &      Client          Reports &       Documents &                  │
│  Subs           Portal          Analytics       Communication                │
│                                                                              │
│  • Sub DB       • Dashboard     • Financials    • Drawing Mgmt              │
│  • Bids         • Progress      • Portfolio     • RFIs                      │
│  • Contracts    • Budget View   • KPIs          • Submittals                │
│  • Insurance    • Approvals     • Trends        • Messaging                 │
│  • Safety ⚠️                                                                │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│               ENTERPRISE INFRASTRUCTURE (Build During MVP) 🏢               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Phase 17 🔒    Phase 18 💳     Phase 19 📊     Phase 20 ⚖️                  │
│  ────────       ────────        ────────        ────────                     │
│  Enterprise     Billing &       Operations &    Legal &                      │
│  Security       Subscriptions   Reliability     Compliance                   │
│                                                                              │
│  • MFA          • Stripe        • Sentry        • GDPR                      │
│  • SSO/SAML     • Plans/Seats   • Health API    • ToS Track                 │
│  • SCIM         • Invoicing     • Status Page   • Consent                   │
│  • Security     • Usage-Based   • Backups       • Retention                 │
│    Policies     • Dunning       • Feature Flags • Accessibility             │
│                                                                              │
│  Phase 21 🎧    Phase 22 ⚙️                                                  │
│  ────────       ────────                                                     │
│  Support        Admin                                                        │
│  Infrastructure Back-Office                                                  │
│                                                                              │
│  • Help Desk    • Super Admin                                               │
│  • Ticketing    • Impersonation                                             │
│  • Knowledge    • Tenant Mgmt                                               │
│    Base         • Analytics                                                 │
│  • Status Page                                                              │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                    MOBILE & OFFLINE (Field Workers) 📱                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Phase 23 📱    Phase 24 📴     Phase 25 🔔                                  │
│  ────────       ────────        ────────                                     │
│  Mobile App     Offline-First   Push                                         │
│  Foundation     Architecture    Notifications                                │
│                                                                              │
│  • React Native • WatermelonDB  • FCM/APNs                                  │
│  • iOS/Android  • Sync Engine   • Task Alerts                               │
│  • Quick Photo  • Conflict Res  • Approvals                                 │
│  • Daily Log    • Photo Upload  • Reminders                                 │
│  • Punch List   • Background    • Schedule                                  │
│  • Time Clock   • Queue         • Changes                                   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                      POST-MVP PHASES (9-16)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Phase 9        Phase 10 ⚠️     Phase 11        Phase 12                     │
│  ────────       ────────        ────────        ────────                     │
│  AI &           Safety &        Home Care &     Sales &                      │
│  Automation     Compliance      Warranty        Pre-Con                      │
│                                                                              │
│  Phase 13       Phase 13.5 ⚠️   Phase 14 ⚠️     Phase 15         Phase 16 ⚠️│
│  ────────       ────────        ────────        ────────        ────────    │
│  Advanced       HR & Time       Lender          API & Dev       Platform    │
│  Features       Management      Portal          Tools           Features    │
│                                                                              │
│  ⭐ = Critical for Customer Acquisition    ⚠️ = Added from Gap Analysis     │
│  🏢 = Enterprise Infrastructure (Required for Scale)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Enterprise Infrastructure Phases

> **CRITICAL**: These phases are required for enterprise sales, compliance, and sustainable operations.
> See `docs/ENTERPRISE_INFRASTRUCTURE.md` for complete specifications.

| Phase | Name | Priority | Why Required |
|-------|------|----------|--------------|
| 17 | Enterprise Security | P0 | MFA/SSO required for enterprise sales |
| 18 | Billing & Subscriptions | P0 | Generate revenue |
| 19 | Operations & Reliability | P0 | Production stability |
| 20 | Legal & Compliance | P0 (EU), P1 (US) | GDPR, accessibility |
| 21 | Support Infrastructure | P1 | Customer success |
| 22 | Admin Back-Office | P1 | Internal operations |

### When to Build Enterprise Phases

| Timeline | Build These | Reason |
|----------|-------------|--------|
| **During Phase 1** | 17.1 (MFA), 18.1 (Stripe), 19.1 (Sentry) | Day-1 requirements |
| **During Phase 2** | 17.2 (SSO), 20.2 (ToS) | Enterprise readiness |
| **Before Launch** | 19.2 (Status Page), 20.1 (GDPR basics) | Legal/trust |
| **After Launch** | 21, 22 (Support, Admin) | Scale support |

---

## Mobile & Offline Phases

> **CRITICAL**: Construction happens in the field with poor connectivity. Field workers need offline access.
> See `docs/MOBILE_OFFLINE_STRATEGY.md` for complete specifications.

| Phase | Name | Priority | Why Required |
|-------|------|----------|--------------|
| 23 | Mobile App Foundation | P1 | Field workers need mobile access |
| 24 | Offline-First Architecture | P0 (mobile) | Job sites have poor connectivity |
| 25 | Push Notifications | P0 (mobile) | Real-time alerts for field staff |

### Mobile-Specific Features

| Feature | Phase | Description |
|---------|-------|-------------|
| Quick Photo Capture | 23 | One-tap photo with auto-tagging |
| Offline Daily Logs | 24 | Create logs without connectivity |
| GPS Time Tracking | 23 | Clock in/out with location verification |
| Punch List Walkthrough | 23 | Photo + annotation per item |
| Voice Notes | 23 | Dictate and transcribe |
| Push Notifications | 25 | Task assignments, approvals, schedule changes |

### When to Build Mobile Phases

| Timeline | Build These | Reason |
|----------|-------------|--------|
| **After Phase 8** | 23 (Mobile Foundation) | Core features first |
| **With Phase 23** | 24 (Offline), 25 (Push) | Mobile requires offline |
| **Or Parallel** | Start 23 during Phase 4+ | If resources allow |

---

## Phase 1: Foundation & Core Data

**Objective**: Establish core entities and basic CRUD operations for the fundamental building blocks.

---

## Phase 1.5: Data Migration System ⚠️ CRITICAL

> **Priority Elevated**: Migration is the #1 barrier to customer acquisition. Must be ready at MVP launch.
> **Full Details**: See `docs/MIGRATION_STRATEGY.md`

**Objective**: Enable painless data migration from competitor systems.

### Pain Points Addressed
- #1221-1230: Data portability and migration
- Builders won't switch if they lose historical data
- Manual re-entry = months of work = no sale

### Database Schema

```sql
migrations              -- Migration job tracking
migration_batches       -- Batch processing for large imports
migration_staging       -- Staging area for validation
migration_field_mappings -- Custom field mappings
migration_cost_code_mappings -- Cost code translation
migration_id_mappings   -- Maintain relationships between systems
```

### Features

| Feature | Priority | Source Systems |
|---------|----------|----------------|
| Migration wizard UI | P0 | All |
| CSV/Excel universal import | P0 | All |
| Buildertrend adapter | P0 | Buildertrend exports |
| CoConstruct adapter | P0 | CoConstruct exports |
| QuickBooks Online API | P0 | QBO OAuth2 |
| QuickBooks Desktop IIF | P0 | QB Desktop files |
| AI-assisted field mapping | P0 | All |
| Data validation & preview | P0 | All |
| Rollback capability | P0 | All |
| Procore API adapter | P1 | Procore API |
| Document/photo migration | P1 | Dropbox, Drive |
| Two-way QuickBooks sync | P1 | QBO |

### API Endpoints

```
POST   /api/migrations                    -- Start migration
GET    /api/migrations/:id                -- Get status
POST   /api/migrations/:id/upload         -- Upload files
POST   /api/migrations/:id/connect        -- API connection (QB, Procore)
GET    /api/migrations/:id/mappings       -- Get field mappings
PATCH  /api/migrations/:id/mappings       -- Update mappings
POST   /api/migrations/:id/validate       -- Run validation
GET    /api/migrations/:id/preview        -- Preview data
POST   /api/migrations/:id/execute        -- Execute import
POST   /api/migrations/:id/rollback       -- Rollback
```

### Success Criteria
- [ ] Builder can import from Buildertrend in < 2 hours
- [ ] Builder can import from CoConstruct in < 2 hours
- [ ] QuickBooks Online connects via OAuth2
- [ ] Financial totals match source system within 0.5%
- [ ] Historical projects available for reporting
- [ ] Self-service completion rate > 80%

---

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
- #246-250: Basic safety documentation ⚠️ GAP FILLED

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

-- Safety tables (basic - full system in Phase 10)
safety_observations  -- Safety observation records
safety_incidents     -- Incident/near-miss reports
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
| **Basic safety observations** | P1 | #248, #933 ⚠️ GAP FILLED |
| **Incident/near-miss logging** | P1 | #250, #178, #934 ⚠️ GAP FILLED |

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
- #202, #210: Sub safety compliance ⚠️ GAP FILLED

### Database Schema

```sql
-- Vendor tables
vendors              -- Vendor/subcontractor master
vendor_contacts      -- Vendor contact people
vendor_categories    -- Trade categories
vendor_ratings       -- Performance ratings
vendor_documents     -- Insurance, licenses, W9s, safety agreements

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
safety_agreements    -- Signed sub safety agreements ⚠️ GAP FILLED
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
| **Sub safety agreement tracking** | P1 | #202, #210 ⚠️ GAP FILLED |
| **Sub OSHA compliance status** | P2 | #210, #347 ⚠️ GAP FILLED |

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

### Phase 10: Safety & Compliance ⚠️ NEW
> **Added from Gap Analysis**: Critical for liability and regulatory compliance
- Site-specific safety plans (#931)
- Toolbox talk documentation (#246, #581)
- OSHA compliance tracking (#247, #347)
- Safety observations and incident reporting (#248-250, #582-590)
- Worker safety certifications (#249, #932-940)
- SDS (Safety Data Sheet) management (#935)
- Environmental compliance - SWPPP, erosion control (#941-950)

### Phase 11: Home Care & Warranty
- Warranty claim management (#816-840)
- Home maintenance scheduling (#826-835)
- Digital home manual (#1311)
- Post-construction client portal (#106-120)

### Phase 12: Sales & Pre-Construction
- Lead/prospect pipeline (#311-325)
- Preliminary budgeting (#318)
- Proposal generation (#861-870)
- Digital estimating (#526-560)
- **Realtor/agent lot management** (#656-657) ⚠️ GAP FILLED
- **Prospect preliminary budgets** (#657-658) ⚠️ GAP FILLED
- **Builder capacity visibility for agents** (#658) ⚠️ GAP FILLED
- **Commission agreement tracking** (#663) ⚠️ GAP FILLED
- **Design configurator for prospects** (#660) ⚠️ GAP FILLED

### Phase 13: Advanced Features
- Coastal/elevated construction compliance (#751-785)
- Multi-entity/multi-office support (#1233, #1236)
- Advanced procurement (#786-815)
- **Equipment & tool tracking by site** (#187, #600) ⚠️ GAP DETAILED
- **Equipment scheduling across projects** (#896) ⚠️ GAP DETAILED
- **Company vehicle assignments** (#359) ⚠️ GAP DETAILED
- **Tool/equipment location tracking** (#600) ⚠️ GAP DETAILED

### Phase 13.5: HR & Time Management ⚠️ NEW
> **Added from Gap Analysis**: Critical for accurate job costing
- Employee hours by project for cost allocation (#421)
- Employee onboarding paperwork (#422)
- Vehicle mileage and expense reports (#423)
- Workers' comp classification tracking (#424)
- Labor burden rates for estimating (#425)
- Time and attendance integrated with costing (#357)

### Phase 14: Lender Portal ⚠️ NEW
> **Added from Gap Analysis**: Enables lender integration for draws
- Lender-specific login with limited access (#641-655)
- Draw verification dashboard (#641-643)
- Progress photos tied to draws (#643)
- Lien waiver status verification (#644)
- Project financial summary for lenders (#645-647)
- Insurance compliance dashboard (#648)
- Risk indicator alerts (#651)

### Phase 15: API & Developer Tools
> **Note**: Core migration moved to Phase 1.5. This phase covers advanced API features.
- Public API documentation (#1224, #1241)
- Webhook system for integrations (#1244)
- API rate limiting and quotas
- Developer portal and sandbox
- Third-party app marketplace preparation
- Advanced data export (custom queries)

### Phase 16: Advanced Platform Features ⚠️ NEW
> **Added from Gap Analysis**: Enterprise scalability
- White-label client portal (#1234)
- Multi-office management (#1233)
- Custom workflow builder (#1235, #1242)
- Industry benchmarking (#1237, #309)
- Advanced API and webhooks (#1241, #1244)
- Custom dashboard builder (#1248)
- Multi-language support (#1239)

---

## Implementation Priority Matrix

### P0 — Must Ship for MVP
| Phase | Features |
|-------|----------|
| 1 | Auth, Companies, Users, Clients, Jobs |
| **1.5** | **DATA MIGRATION** ⭐ Buildertrend, CoConstruct, QuickBooks, Excel |
| 2 | Budgets, Invoices, Change Orders, Draws, AIA Pay Apps |
| 3 | Schedule, Daily Logs, Photos, Punch Lists, **Basic Safety** |
| 6 | Client Portal (basic) |

### P1 — Should Ship for MVP
| Phase | Features |
|-------|----------|
| 4 | Selections, Allowances |
| 5 | Vendors, Contracts, Insurance, Lien Waivers, **Sub Safety Compliance** |
| 7 | Core Reports (Financial, Portfolio, WIP) |
| 8 | Documents, RFIs |

### P2 — Nice to Have for MVP
| Phase | Features |
|-------|----------|
| 3 | Schedule templates, auto-weather |
| 5 | Bid management, sub portal |
| 7 | Custom reports, scheduled delivery |
| 8 | Submittals, messaging |

### Post-MVP Priority Order
| Priority | Phase | Features |
|----------|-------|----------|
| 1 | 9 | AI & Automation |
| 2 | 10 | **Safety & Compliance** ⚠️ |
| 3 | 11 | Home Care & Warranty |
| 4 | 12 | Sales & Pre-Construction (+Realtor features) |
| 5 | 13 | Advanced Features (Coastal, Multi-entity, +Equipment) |
| 6 | 13.5 | **HR & Time Management** ⚠️ |
| 7 | 14 | **Lender Portal** ⚠️ |
| 8 | 15 | API & Developer Tools |
| 9 | 16 | **Advanced Platform Features** ⚠️ |

> **Note**: Core Data Migration moved to **Phase 1.5** (MVP) - it's critical for customer acquisition.

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

---

## Gap Analysis Reference

See `docs/requirements/GAP_ANALYSIS.md` for detailed analysis of all 1,320 pain points and coverage mapping.

### Summary of Gap Analysis Results
- **Total Pain Points**: 1,320
- **Covered in MVP (Phases 1-8)**: ~1,100
- **Covered in Post-MVP (Phases 9-16)**: ~126
- **Identified Gaps Filled**: 94 (added to roadmap)

### New Phases Added from Gap Analysis
- Phase 10: Safety & Compliance (was missing entirely)
- Phase 14: Lender Portal (was missing entirely)
- Phase 15: Data & Migration Tools (was missing entirely)
- Phase 16: Advanced Platform Features (was missing entirely)

---

*Last Updated: 2024-02-12*
*Version: 1.1 (Gap Analysis Update)*
