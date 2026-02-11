# RossOS Information Architecture Analysis

## Current Problems

### 1. Job Filter Mismatch
The sidebar filters by job, but many top nav items don't make sense in a job context:
- **Leads** - Pre-job, no job exists yet
- **Estimates** - Pre-job (though can reference a lead)
- **Proposals** - Pre-job
- **Selections Catalog** - Company library, not job-specific
- **Assemblies/Templates** - Company library
- **Cost Codes** - Company library
- **Vendors** - Company directory
- **Clients** - Company directory
- **Settings** - Company configuration
- **Email Marketing** - Company-wide
- **Dashboards** - Can be either
- **Notifications** - Mixed

### 2. Missing Business Functions
Critical elements for running a construction business that appear to be missing:

#### People & Resources
- [ ] **Employees/Team Management** - Staff directory, roles, permissions, certifications, emergency contacts
- [ ] **Crew Scheduling** - Who works where, which days, crew assignments to jobs
- [ ] **Equipment/Assets** - Tools, vehicles, trailers, equipment tracking, maintenance schedules
- [ ] **Subcontractor Agreements** - Master agreements separate from per-job POs

#### Compliance & Safety
- [ ] **Insurance Tracking** - COIs from subs (expiration alerts), your company policies
- [ ] **Lien Waivers** - Conditional/unconditional, partial/final - CRITICAL for draws
- [ ] **Permit Management** - Dedicated tracking, not just files (application, fees, inspections, expiration)
- [ ] **Inspection Scheduling** - Building dept inspections, internal QC inspections
- [ ] **Safety/OSHA** - Toolbox talks, incident reports, safety certifications
- [ ] **Licensing** - Contractor licenses, trade licenses, renewal tracking

#### Financial Gaps
- [ ] **Accounts Receivable Overview** - All outstanding client balances across jobs
- [ ] **Accounts Payable Overview** - All outstanding vendor balances
- [ ] **Cash Flow Forecasting** - Dedicated view, not just in reports
- [ ] **Retainage Tracking** - Both held by you and held from you
- [ ] **Job Costing Summary** - Cross-job profitability analysis

#### Communication & Scheduling
- [ ] **Company Calendar** - All deadlines, milestones, inspections across jobs
- [ ] **Communication Log** - Unified log of all client/vendor communications
- [ ] **Meeting Notes** - Client meetings, site meetings, documentation

#### Quality & Delivery
- [ ] **Quality Control Checklists** - Pre-drywall, rough-in, final inspections
- [ ] **Material Tracking** - Ordered → Delivered → Installed status
- [ ] **Delivery Schedule** - What's arriving when at which job

---

## Proposed Information Architecture

### Core Concept: Context-Aware Navigation

Instead of one flat navigation, use **two contexts**:

1. **Company Context** (No job selected) - Company-wide functions
2. **Job Context** (Job selected) - Job-specific functions

---

## COMPANY CONTEXT (No job selected)

### 1. SALES & PRE-CONSTRUCTION
Everything before a job exists.

| View | Purpose | Key Features |
|------|---------|--------------|
| **Leads** | Track prospects | Pipeline stages, AI scoring, source tracking, follow-up tasks |
| **Estimates** | Build pricing | Selection-based, assemblies, tier comparison, version history |
| **Proposals** | Present to clients | Generate from estimate, selection presentation, e-signature |
| **Contracts** | Close the deal | Templates, e-signature, converts to Job on execution |

### 2. LIBRARY (Company Resources)
Reusable company assets that apply across all jobs.

| View | Purpose | Key Features |
|------|---------|--------------|
| **Selections Catalog** | Products & materials | Pricing tiers, vendors, lead times, photos, specs |
| **Assemblies** | Estimate templates | Groups of line items with default selections |
| **Cost Codes** | Budget categories | Hierarchical codes, mapping to QuickBooks |
| **Specification Library** | Standard specs | Reusable specification sections |
| **Document Templates** | Standard forms | Contract templates, PO templates, etc. |

### 3. DIRECTORY (People & Companies)
All contacts and relationships.

| View | Purpose | Key Features |
|------|---------|--------------|
| **Clients** | Client management | Contact info, preferences, project history, AI intelligence |
| **Vendors** | Vendor management | Scorecards, trade assignments, insurance tracking, pricing history |
| **Team** | Employee management | Roles, permissions, certifications, emergency contacts |
| **Contacts** | General contacts | Architects, engineers, inspectors, realtors, anyone else |

### 4. OPERATIONS (Company-Wide)
Cross-job operational views.

| View | Purpose | Key Features |
|------|---------|--------------|
| **Jobs Dashboard** | All active jobs | Status cards, health scores, key metrics |
| **Company Calendar** | Master calendar | All milestones, inspections, deadlines across jobs |
| **Crew Schedule** | Resource allocation | Who's working where, capacity planning |
| **Equipment** | Asset tracking | Location, maintenance, availability |
| **Deliveries** | Incoming materials | What's arriving when at which job |

### 5. FINANCIAL (Company-Wide)
Company financial overview.

| View | Purpose | Key Features |
|------|---------|--------------|
| **Financial Dashboard** | Overview | AR, AP, cash position, profitability |
| **Accounts Receivable** | Client balances | Outstanding draws, aging, collection status |
| **Accounts Payable** | Vendor balances | Outstanding invoices, payment scheduling |
| **Cash Flow** | Forecasting | Projected inflows/outflows, runway |
| **Job Profitability** | Cross-job analysis | Margin comparison, cost trends |

### 6. COMPLIANCE
Regulatory and insurance tracking.

| View | Purpose | Key Features |
|------|---------|--------------|
| **Insurance** | COI tracking | Sub COIs, company policies, expiration alerts |
| **Licenses** | License tracking | Contractor, trade licenses, renewals |
| **Safety** | Safety program | Toolbox talks, incidents, certifications |

### 7. COMPANY
Settings and configuration.

| View | Purpose | Key Features |
|------|---------|--------------|
| **Settings** | Configuration | Company info, integrations, preferences |
| **Reports** | Reporting hub | Standard reports, custom queries, AI insights |
| **Dashboards** | Custom dashboards | Build your own dashboard views |
| **Email Marketing** | Client outreach | Campaigns, templates, automation |

---

## JOB CONTEXT (Job selected)

When a job is selected, the interface shifts to show job-specific views.

### JOB HEADER
Always visible: Job name, client, status, % complete, key metrics

### JOB NAVIGATION

| View | Purpose | Key Features |
|------|---------|--------------|
| **Overview** | Job dashboard | Progress, budget health, schedule status, recent activity |
| **Budget** | Financial tracking | Cost codes, committed, actual, projected, variance |
| **Schedule** | Timeline | Gantt chart, dependencies, weather, milestones |
| **Daily Logs** | Field updates | Voice-to-text, photos, manpower, activities |
| **Photos** | Documentation | AI-curated gallery, tagging, client sharing |
| **Documents** | File management | Plans, permits, contracts, organized folders |
| **Selections** | Client choices | Allowance items, client selections, approval status |
| **Purchase Orders** | Job POs | All POs for this job, status, receiving |
| **Invoices** | Job invoices | All invoices for this job, allocation, approval |
| **Draws** | Payment requests | Draw schedule, lien waivers, client approval |
| **Change Orders** | Scope changes | CO requests, approval, budget impact |
| **RFIs** | Questions | RFI log, responses, status |
| **Submittals** | Product approval | Submittal register, review status |
| **Punch List** | Closeout items | Deficiencies, assignments, completion |
| **Permits** | Permit tracking | Applications, inspections, fees |
| **Inspections** | Inspection log | Scheduled, results, re-inspections |
| **Lien Waivers** | Payment tracking | Conditional/unconditional, by vendor |
| **Team** | Job assignments | Who's assigned, roles, contact info |
| **Communications** | Message log | All communications for this job |
| **Warranties** | Product warranties | Installed products, coverage, expiration |

---

## PORTAL VIEWS (External Users)

### Client Portal
What clients see for their project(s).

| View | Purpose |
|------|---------|
| Dashboard | Progress overview, AI summaries |
| Photos | Curated progress photos |
| Selections | Make selection choices |
| Documents | Shared documents |
| Draws | Payment requests, online payment |
| Schedule | Milestone visibility |
| Messages | Communication with builder |

### Vendor Portal
What vendors/subs see.

| View | Purpose |
|------|---------|
| Dashboard | Their active jobs overview |
| Bids | Bid requests, submissions |
| Purchase Orders | POs issued to them |
| Invoices | Submit/track invoices |
| Documents | Shared plans, specs |
| Compliance | Insurance, lien waivers |
| Schedule | Their scheduled work |

---

## Navigation Interaction Design

### Option A: Mode Toggle
- Top-level toggle: "Company" vs "Jobs"
- Company mode: Shows company-wide nav
- Jobs mode: Shows job selector + job-specific nav

### Option B: Hub & Spoke
- Always start at company dashboard (hub)
- Click into a job to enter job context (spoke)
- Easy way to return to company level

### Option C: Unified with Smart Filtering
- Single navigation
- Context banner shows "All Jobs" or specific job
- Views adapt: Company-wide when no job selected, filtered when job selected
- Some views only appear in one context

### Recommendation: Option B (Hub & Spoke)
- Clearest mental model
- Matches how users think: "I'm either doing company stuff or job stuff"
- Job sidebar becomes job-switcher when in job context
- Breadcrumb: Company > Jobs > Smith Residence > Budget

---

## View Priority Matrix

### Phase 0 - Core (Must have for MVP)
**Company Context:**
- Leads, Estimates, Proposals, Contracts
- Selections Catalog, Assemblies, Cost Codes
- Clients, Vendors
- Jobs Dashboard
- Settings (basic)

**Job Context:**
- Overview, Budget, Schedule
- Daily Logs, Photos, Documents
- Purchase Orders, Invoices, Draws
- Punch List

### Phase 1 - Essential Operations
- Team management
- Company Calendar
- Change Orders
- Lien Waivers
- Inspections/Permits

### Phase 2 - Collaboration
- Client Portal
- Vendor Portal
- RFIs, Submittals
- Bids

### Phase 3 - Advanced
- Insurance/Compliance tracking
- Equipment management
- Crew scheduling
- Time tracking
- Cash flow forecasting

### Phase 4 - Intelligence
- Advanced reporting
- Custom dashboards
- Email marketing
- Warranty claims

---

## Questions to Resolve

1. **How does the job sidebar work in company context?**
   - Hide it? Show recent jobs? Show job health summary?

2. **What's the default landing page?**
   - Company dashboard? Jobs list? Last viewed?

3. **How do notifications work across contexts?**
   - Always visible? Filtered by context?

4. **How do todos/tasks span contexts?**
   - Company tasks vs job tasks? Or unified?

5. **Mobile experience?**
   - Same structure or simplified?

---

## Next Steps

1. [ ] Validate this architecture with user feedback
2. [ ] Create detailed view specs for each area
3. [ ] Design the context-switching UX
4. [ ] Prioritize and phase the build
5. [ ] Deep-dive into each view's requirements
