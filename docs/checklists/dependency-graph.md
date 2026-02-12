# Dependency Graph

## Module Dependencies

This table shows which modules depend on which other modules, extracted from the system connections map.

| Module | Depends On | Depended On By |
|--------|-----------|----------------|
| **Leads** | Clients, Tasks, Files, Reports | Estimates |
| **Estimates** | Leads, Cost Codes, Vendors, Templates | Proposals |
| **Proposals** | Estimates | Contracts |
| **Contracts** | Proposals | Jobs, Budget |
| **Jobs** | Contracts, Clients | Budget, Schedule, Invoices, POs, Daily Logs, Photos, Files, Tasks, Change Orders, Draws, Reports, Vendors |
| **Budget** | Contracts, Estimates, Jobs, POs, Invoices | Draws, Reports, Schedule (cash flow) |
| **Invoices** | Jobs, Vendors, Cost Codes, POs | Draws, Budget, QuickBooks/Xero |
| **POs** | Jobs, Vendors, Cost Codes, Budget | Invoices, Change Orders |
| **Draws** | Jobs, Invoices, Budget, Change Orders | Lien Releases, Retainage |
| **Schedule** | Jobs, Tasks, Daily Logs, Vendors | Reports, Notifications |
| **Daily Logs** | Jobs, Schedule, Photos, Vendors, POs, Tasks | Schedule (progress updates) |
| **Photos** | Jobs, Daily Logs | Files |
| **Change Orders** | Jobs, Budget, POs | Draws |
| **Vendors** | -- (shared service) | POs, Invoices, Estimates, Jobs, Daily Logs, Schedule, Bids |
| **Clients** | -- (shared service) | Leads, Jobs, Client Portal |
| **Cost Codes** | -- (shared service) | Estimates, Invoices, POs, Budget |
| **Users/Roles** | -- (shared service) | All modules (auth/permissions) |
| **Files** | Jobs, Leads, Invoices, POs, Draws, Contracts | All modules (document storage) |
| **Tasks** | Jobs, Schedule | Leads, Daily Logs |
| **Reports** | Jobs, Budget, Schedule, Leads, Vendors | Dashboard |
| **Notifications** | All event-producing modules | Users |
| **Client Portal** | Jobs, Photos, Draws, Selections, Schedule, Clients | -- (end-user facing) |
| **Vendor Portal** | Vendors, Bids, Schedule, POs, Daily Logs | -- (end-user facing) |
| **Bids** | Vendors, Cost Codes, Jobs | POs (winning bid becomes PO) |
| **RFIs** | Jobs, Vendors | Files |
| **Submittals** | Jobs, Vendors | Files |
| **Templates** | -- (shared service) | Estimates, Schedule, Proposals |
| **QuickBooks/Xero** | Vendors, Invoices, Cost Codes | -- (external sync) |

---

## Build Order Dependencies

Based on the build phases document, each phase depends on completion of the prior phase. Within each phase, parallelizable groups are noted.

### Phase 0: Foundation (68 views) -- No prior dependencies

**Sprint 1-2: Foundation** (must come first)
- Authentication (Login, Registration)
- Dashboard shell
- Job List and Create
- Navigation structure

**Sprint 3-4: Core Job Features** (depends on Sprint 1-2)
- Job Detail/Overview
- Vendors and Clients (parallel -- independent of each other)
- Cost Codes (parallel with Vendors/Clients)

**Sprint 5-6: Financial Core** (depends on Sprint 3-4)
- Invoices (list, detail, AI upload) -- depends on Jobs, Vendors, Cost Codes
- Budget view -- depends on Jobs
- Invoice allocation -- depends on Invoices, Cost Codes

**Sprint 7-8: Purchase Orders and Draws** (depends on Sprint 5-6)
- PO creation -- depends on Jobs, Vendors, Cost Codes, Budget
- Draws -- depends on Invoices, Budget
- PDF generation -- depends on Draws

**Sprint 9-10: Pre-Construction** (depends on Sprint 3-4; parallel with Sprints 5-8)
- Leads Pipeline -- depends on Clients
- Lead Detail -- depends on Leads
- Estimates Builder -- depends on Cost Codes, Vendors

**Sprint 11-12: Proposals and Contracts** (depends on Sprint 9-10)
- Proposal Editor -- depends on Estimates
- E-signatures -- depends on Proposals
- Selections -- parallel with Proposals

**Sprint 13-14: Field Operations** (depends on Sprint 3-4; parallel with Sprints 5-12)
- Schedule (Gantt) -- depends on Jobs
- Daily Logs -- depends on Jobs
- Photos -- depends on Jobs

**Parallel build opportunities within Phase 0:**
```
Sprint 1-2 (Foundation)
    |
    v
Sprint 3-4 (Core Job Features)
    |
    +-----------------------------+-----------------------------+
    |                             |                             |
    v                             v                             v
Sprint 5-6 (Financial)     Sprint 9-10 (Pre-Con)      Sprint 13-14 (Field Ops)
    |                             |
    v                             v
Sprint 7-8 (POs & Draws)   Sprint 11-12 (Proposals)
```

### Phase 1: Core Communication (8 views) -- Depends on Phase 0 Jobs, Users

**Can be built in parallel:**
- To-Do Lists (TD1-TD4) -- depends on Jobs, Users
- Comments System (CM1-CM2) -- depends on Jobs, Users (parallel with To-Dos)
- Internal Messaging (MSG1-MSG2) -- depends on Users only (parallel with above)

### Phase 2: Vendor Collaboration (10 views) -- Depends on Phase 0 Vendors, Jobs; Phase 1 Communication

**Sequential within phase:**
- Bid Management (BID1-BID4) -- depends on Vendors, Jobs, Cost Codes (build first)
- Vendor Portal (VP1-VP6) -- depends on Bids, POs, Schedule, Daily Logs (build after Bids)

### Phase 3: Advanced Project Management (8 views) -- Depends on Phase 0 Jobs, Vendors; Phase 2 Vendor Portal

**Can be built in parallel:**
- RFIs (RFI1-RFI3) -- depends on Jobs, Vendors (parallel with Submittals)
- Submittals (SUB1-SUB3) -- depends on Jobs, Vendors (parallel with RFIs)
- Templates (TM1-TM2) -- depends on Estimates, Schedule (parallel with above)

### Phase 4: Time and Payments (6 views) -- Depends on Phase 0 Jobs, Invoices

**Can be built in parallel:**
- Time Clock (TC1-TC4) -- depends on Jobs, Users, Vendors
- Online Payments (PAY1-PAY2) -- depends on Invoices, Draws (parallel with Time Clock)

### Phase 5: Enhanced Portals (6 views) -- Depends on Phase 0 Client Portal; Phase 4 Payments

**Can be built in parallel:**
- Warranty Claims (WC1-WC3) -- depends on Jobs, Vendors, Clients
- Enhanced Client Portal (CP6-CP8) -- depends on Client Portal, Warranty Claims (must follow WC)

### Phase 6: Advanced Features (6 views) -- Depends on all prior phases

**All can be built in parallel:**
- Email Marketing (EM1-EM2) -- depends on Leads, Clients
- Custom Dashboards (CD1-CD2) -- depends on Reports, all data modules
- Additional Integrations (INT1-INT2) -- depends on Vendors, Invoices, Cost Codes

---

## Critical Path

The longest chain of sequential dependencies from project start to finish:

```
Authentication/Login (Sprint 1-2)
    |
    v
Jobs + Vendors + Clients + Cost Codes (Sprint 3-4)
    |
    v
Invoices + Budget (Sprint 5-6)
    |
    v
POs + Draws (Sprint 7-8)
    |
    v
Communication: To-Dos + Comments (Phase 1, Sprint 15-16)
    |
    v
Bid Management (Phase 2, Sprint 17-18)
    |
    v
Vendor Portal (Phase 2, Sprint 17-18)
    |
    v
RFIs + Submittals (Phase 3, Sprint 19-20)
    |
    v
Client Portal + Warranty Claims (Phase 5, Sprint 21-22)
    |
    v
Online Payments + QuickBooks Integration (Phase 4/Sprint 23-24)
    |
    v
Reports + Templates (Sprint 27-28)
    |
    v
Custom Dashboards + Email Marketing + Integrations (Phase 6, Sprint 29-30)
```

**Critical path length:** 15 sprints (30 weeks at 2-week sprints)

**Alternate critical path (data-centric):**

The longest data dependency chain through the full business cycle:

```
Lead --> Estimate --> Proposal --> Contract --> Job --> Budget --> PO --> Invoice --> Draw --> Payment
```

This 10-step chain (from system-connections Path 1) is the core business workflow and must be built in sequence. Each link depends on the prior entity existing in the database.

---

## Data Flow Dependencies

These show which database tables must be populated before dependent tables can contain data. Arrows mean "must exist before."

### Shared Services (no prerequisites)
```
Users/Roles        (standalone)
Cost Codes         (standalone)
Templates          (standalone)
```

### Directory Layer (depends on shared services)
```
Vendors            (standalone)
Clients            (standalone)
```

### Sales Pipeline
```
Clients ──────> Leads
Leads ────────> Estimates
Cost Codes ───> Estimates
Vendors ──────> Estimates
Estimates ────> Proposals
Proposals ────> Contracts
```

### Job Execution
```
Contracts ────> Jobs
Clients ──────> Jobs
Jobs ─────────> Budget          (budget initialized from contract/estimate)
Jobs ─────────> Schedule        (schedule created from template)
Jobs ─────────> Tasks
Jobs ─────────> Daily Logs
Jobs ─────────> Photos
Jobs ─────────> Files (job folders)
```

### Financial Chain
```
Jobs ─────────> POs
Vendors ──────> POs
Cost Codes ───> POs
Budget ───────> POs             (POs reserve budget)

Jobs ─────────> Invoices
Vendors ──────> Invoices
Cost Codes ───> Invoices
POs ──────────> Invoices        (invoices match to POs)

Invoices ─────> Draws           (draws compile approved invoices)
Budget ───────> Draws           (draws tracked against budget)
Change Orders > Draws           (approved COs included in draws)

Jobs ─────────> Change Orders
Budget ───────> Change Orders   (COs tracked against budget)
POs ──────────> Change Orders   (COs may modify POs)
```

### Field Operations
```
Jobs ─────────> Daily Logs
Schedule ─────> Daily Logs      (logs update schedule progress)
Vendors ──────> Daily Logs      (crew tracking)
Daily Logs ───> Photos          (photos attached to logs)
```

### Closeout
```
Jobs ─────────> Punch Lists
Jobs ─────────> Final Docs
Jobs ─────────> Warranties
Vendors ──────> Warranties
Vendors ──────> Punch Lists     (items assigned to vendors)
```

### Portals
```
Clients ──────> Client Portal
Jobs ─────────> Client Portal
Photos ───────> Client Portal
Draws ────────> Client Portal
Selections ───> Client Portal

Vendors ──────> Vendor Portal
Bids ─────────> Vendor Portal
POs ──────────> Vendor Portal
Schedule ─────> Vendor Portal
```

### External Integrations
```
Vendors ──────> QuickBooks/Xero
Invoices ─────> QuickBooks/Xero
Cost Codes ───> QuickBooks/Xero
Jobs ─────────> Procore
Vendors ──────> Procore
Daily Logs ───> Procore
```

### Complete Data Dependency Tree (visual)

```
Users/Roles    Cost Codes    Templates    Vendors    Clients
     |              |            |           |          |
     |              +-----+------+           |          |
     |              |     |      |           |          |
     |              v     v      v           v          v
     |          Estimates <------+--------  Leads <--- Clients
     |              |                        |
     |              v                        |
     |          Proposals <------------------+
     |              |
     |              v
     |          Contracts
     |              |
     |              v
     +----------> Jobs <----- Clients
                    |
        +-----------+-----------+-----------+-----------+
        |           |           |           |           |
        v           v           v           v           v
     Budget     Schedule     Tasks     Daily Logs    Files
        |           |           |         |
        v           |           |         v
       POs <--------+           |      Photos
        |                       |
        v                       |
    Invoices <------------------+
        |
        v
    Change Orders
        |
        v
      Draws
        |
        v
    Punch Lists / Warranties / Final Docs (Closeout)
```

---

*All dependencies in this document are extracted from system-connections.md and build-phases.md. No invented dependencies have been added.*
