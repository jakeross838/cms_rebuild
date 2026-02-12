# RossOS --- Construction Management Platform (Rebuild)

## Vision

RossOS is an all-in-one Construction Intelligence Platform for custom home builders, replacing 25+ separate applications (Buildertrend, Procore, QuickBooks, spreadsheets, etc.) with a single source of truth. Multi-tenant SaaS architecture with AI-powered document intelligence, mobile-first design, and a learning engine that makes estimates more accurate, schedules more reliable, and decisions more informed over time.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend**: To be determined (rebuild from Node/Express v1)
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **AI**: Claude API for document intelligence, cost prediction, schedule optimization
- **Deployment**: TBD

## Project Status

| Area | Status | Details |
|------|--------|---------|
| Planning | **COMPLETE** | 1,125 gap items mapped, 50 modules specified, 113 docs |
| Implementation | **NOT STARTED** | All 1,125 items status=planned |
| v1 Reference | **AVAILABLE** | `../Construction-Management-Software` (105 routes, 1,581 endpoints, 158 tests) |

---

## Build Phases

| Phase | Name | Modules | Status |
|-------|------|---------|--------|
| 1 | Foundation | 01-06: Auth, Config Engine, Core Data Model, Nav/Search, Notifications, Document Storage | Not Started |
| 2 | Construction Core | 07-12: Scheduling, Daily Logs, Budget/Cost Tracking, Vendor Mgmt, Basic Invoicing, Basic Client Portal | Not Started |
| 3 | Financial Power | 13-19: Invoice AI, Lien Waivers, Draw Requests, QuickBooks, Change Orders, Purchase Orders, Financial Reporting | Not Started |
| 4 | Intelligence | 20-25: Estimating Engine, Selection Mgmt, Vendor Performance, Price Intelligence, AI Document Processing, Schedule Intelligence | Not Started |
| 5 | Full Platform | 26-40: Bid Mgmt, RFI, Punch Lists, Full Client Portal, Vendor Portal, Warranty, Permitting, Safety, HR, Equipment, Lead/CRM, Marketing, Contracts/eSign, Advanced Reporting, Mobile App | Not Started |
| 6 | Scale & Sell | 41-50: Onboarding, Data Migration, Subscription Billing, White Label, API Marketplace, Customer Support, Training, Template Marketplace, Platform Analytics, Marketing Website | Not Started |

---

## Documentation Map

### Specs & Vision

| Document | Path | Description |
|----------|------|-------------|
| Platform Vision | [docs/specs/platform-vision.md](docs/specs/platform-vision.md) | Product vision, market positioning, strategic goals |
| Gap Analysis | [docs/specs/gap-analysis-expanded.md](docs/specs/gap-analysis-expanded.md) | 910 requirement items across 48 categories |
| Blueprint | [docs/specs/claude-code-blueprint.md](docs/specs/claude-code-blueprint.md) | Full implementation blueprint (1,125 items) |
| Spec Answers | [docs/specs/platform-spec-answers.md](docs/specs/platform-spec-answers.md) | Detailed answers to platform specification questions |

### Architecture

| Document | Path | Description |
|----------|------|-------------|
| System Architecture | [docs/architecture/system-architecture.md](docs/architecture/system-architecture.md) | Overall topology, entity model, deployment, scaling |
| Multi-Tenancy | [docs/architecture/multi-tenancy-design.md](docs/architecture/multi-tenancy-design.md) | Tenant isolation, RLS policies, data handling |
| Data Model | [docs/architecture/data-model.md](docs/architecture/data-model.md) | Entity relationships, table schemas, audit patterns |
| API Specification | [docs/architecture/api-spec.md](docs/architecture/api-spec.md) | REST endpoints, auth, error format, middleware stack |
| Configuration Engine | [docs/architecture/configuration-engine.md](docs/architecture/configuration-engine.md) | Tenant-configurable settings, feature flags, workflows |
| AI Engine | [docs/architecture/ai-engine-design.md](docs/architecture/ai-engine-design.md) | ML pipeline, document processing, cost prediction |
| Document Intelligence | [docs/architecture/document-intelligence.md](docs/architecture/document-intelligence.md) | OCR, classification, extraction, search |
| System Connections | [docs/architecture/system-connections.md](docs/architecture/system-connections.md) | External integrations, webhooks, sync strategies |

### Modules (50)

| # | Module | Phase | Path |
|---|--------|-------|------|
| 01 | Auth & Access | 1 | [docs/modules/01-auth-and-access.md](docs/modules/01-auth-and-access.md) |
| 02 | Configuration Engine | 1 | [docs/modules/02-configuration-engine.md](docs/modules/02-configuration-engine.md) |
| 03 | Core Data Model | 1 | [docs/modules/03-core-data-model.md](docs/modules/03-core-data-model.md) |
| 04 | Navigation, Search & Dashboard | 1 | [docs/modules/04-navigation-search-dashboard.md](docs/modules/04-navigation-search-dashboard.md) |
| 05 | Notification Engine | 1 | [docs/modules/05-notification-engine.md](docs/modules/05-notification-engine.md) |
| 06 | Document Storage | 1 | [docs/modules/06-document-storage.md](docs/modules/06-document-storage.md) |
| 07 | Scheduling | 2 | [docs/modules/07-scheduling.md](docs/modules/07-scheduling.md) |
| 08 | Daily Logs | 2 | [docs/modules/08-daily-logs.md](docs/modules/08-daily-logs.md) |
| 09 | Budget & Cost Tracking | 2 | [docs/modules/09-budget-cost-tracking.md](docs/modules/09-budget-cost-tracking.md) |
| 10 | Vendor Management | 2 | [docs/modules/10-vendor-management.md](docs/modules/10-vendor-management.md) |
| 11 | Basic Invoicing | 2 | [docs/modules/11-basic-invoicing.md](docs/modules/11-basic-invoicing.md) |
| 12 | Basic Client Portal | 2 | [docs/modules/12-basic-client-portal.md](docs/modules/12-basic-client-portal.md) |
| 13 | Invoice AI | 3 | [docs/modules/13-invoice-ai.md](docs/modules/13-invoice-ai.md) |
| 14 | Lien Waivers | 3 | [docs/modules/14-lien-waivers.md](docs/modules/14-lien-waivers.md) |
| 15 | Draw Requests | 3 | [docs/modules/15-draw-requests.md](docs/modules/15-draw-requests.md) |
| 16 | QuickBooks Integration | 3 | [docs/modules/16-quickbooks-integration.md](docs/modules/16-quickbooks-integration.md) |
| 17 | Change Orders | 3 | [docs/modules/17-change-orders.md](docs/modules/17-change-orders.md) |
| 18 | Purchase Orders | 3 | [docs/modules/18-purchase-orders.md](docs/modules/18-purchase-orders.md) |
| 19 | Financial Reporting | 3 | [docs/modules/19-financial-reporting.md](docs/modules/19-financial-reporting.md) |
| 20 | Estimating Engine | 4 | [docs/modules/20-estimating-engine.md](docs/modules/20-estimating-engine.md) |
| 21 | Selection Management | 4 | [docs/modules/21-selection-management.md](docs/modules/21-selection-management.md) |
| 22 | Vendor Performance | 4 | [docs/modules/22-vendor-performance.md](docs/modules/22-vendor-performance.md) |
| 23 | Price Intelligence | 4 | [docs/modules/23-price-intelligence.md](docs/modules/23-price-intelligence.md) |
| 24 | AI Document Processing | 4 | [docs/modules/24-ai-document-processing.md](docs/modules/24-ai-document-processing.md) |
| 25 | Schedule Intelligence | 4 | [docs/modules/25-schedule-intelligence.md](docs/modules/25-schedule-intelligence.md) |
| 26 | Bid Management | 5 | [docs/modules/26-bid-management.md](docs/modules/26-bid-management.md) |
| 27 | RFI Management | 5 | [docs/modules/27-rfi-management.md](docs/modules/27-rfi-management.md) |
| 28 | Punch List & Quality | 5 | [docs/modules/28-punch-list-quality.md](docs/modules/28-punch-list-quality.md) |
| 29 | Full Client Portal | 5 | [docs/modules/29-full-client-portal.md](docs/modules/29-full-client-portal.md) |
| 30 | Vendor Portal | 5 | [docs/modules/30-vendor-portal.md](docs/modules/30-vendor-portal.md) |
| 31 | Warranty & Home Care | 5 | [docs/modules/31-warranty-home-care.md](docs/modules/31-warranty-home-care.md) |
| 32 | Permitting & Inspections | 5 | [docs/modules/32-permitting-inspections.md](docs/modules/32-permitting-inspections.md) |
| 33 | Safety & Compliance | 5 | [docs/modules/33-safety-compliance.md](docs/modules/33-safety-compliance.md) |
| 34 | HR & Workforce | 5 | [docs/modules/34-hr-workforce.md](docs/modules/34-hr-workforce.md) |
| 35 | Equipment & Assets | 5 | [docs/modules/35-equipment-assets.md](docs/modules/35-equipment-assets.md) |
| 36 | Lead Pipeline & CRM | 5 | [docs/modules/36-lead-pipeline-crm.md](docs/modules/36-lead-pipeline-crm.md) |
| 37 | Marketing & Portfolio | 5 | [docs/modules/37-marketing-portfolio.md](docs/modules/37-marketing-portfolio.md) |
| 38 | Contracts & eSign | 5 | [docs/modules/38-contracts-esign.md](docs/modules/38-contracts-esign.md) |
| 39 | Advanced Reporting | 5 | [docs/modules/39-advanced-reporting.md](docs/modules/39-advanced-reporting.md) |
| 40 | Mobile App | 5 | [docs/modules/40-mobile-app.md](docs/modules/40-mobile-app.md) |
| 41 | Onboarding Wizard | 6 | [docs/modules/41-onboarding-wizard.md](docs/modules/41-onboarding-wizard.md) |
| 42 | Data Migration | 6 | [docs/modules/42-data-migration.md](docs/modules/42-data-migration.md) |
| 43 | Subscription & Billing | 6 | [docs/modules/43-subscription-billing.md](docs/modules/43-subscription-billing.md) |
| 44 | White Label | 6 | [docs/modules/44-white-label.md](docs/modules/44-white-label.md) |
| 45 | API Marketplace | 6 | [docs/modules/45-api-marketplace.md](docs/modules/45-api-marketplace.md) |
| 46 | Customer Support | 6 | [docs/modules/46-customer-support.md](docs/modules/46-customer-support.md) |
| 47 | Training Platform | 6 | [docs/modules/47-training-platform.md](docs/modules/47-training-platform.md) |
| 48 | Template Marketplace | 6 | [docs/modules/48-template-marketplace.md](docs/modules/48-template-marketplace.md) |
| 49 | Platform Analytics | 6 | [docs/modules/49-platform-analytics.md](docs/modules/49-platform-analytics.md) |
| 50 | Marketing Website | 6 | [docs/modules/50-marketing-website.md](docs/modules/50-marketing-website.md) |

### UI & Design

| Document | Path | Description |
|----------|------|-------------|
| Design System | [docs/ui/design-system.md](docs/ui/design-system.md) | Component library, color palette, typography |
| UX Principles | [docs/ui/ux-principles.md](docs/ui/ux-principles.md) | 8 core principles, target persona |
| Navigation | [docs/ui/navigation.md](docs/ui/navigation.md) | App navigation structure and sidebar |
| Views Index | [docs/ui/views-index.md](docs/ui/views-index.md) | Master index of all UI views |
| Page Specs (30) | [docs/ui/page-specs/](docs/ui/page-specs/) | Individual page specifications |
| User Flows (6) | [docs/ui/user-flows/](docs/ui/user-flows/) | Key workflow documentation |

**Page Specs:**

| Page Spec | Path |
|-----------|------|
| Bids, RFIs & Submittals | [docs/ui/page-specs/bids-rfis-submittals.md](docs/ui/page-specs/bids-rfis-submittals.md) |
| Client Portal | [docs/ui/page-specs/client-portal.md](docs/ui/page-specs/client-portal.md) |
| Communication | [docs/ui/page-specs/communication.md](docs/ui/page-specs/communication.md) |
| Custom Dashboards | [docs/ui/page-specs/custom-dashboards.md](docs/ui/page-specs/custom-dashboards.md) |
| Email Marketing | [docs/ui/page-specs/email-marketing.md](docs/ui/page-specs/email-marketing.md) |
| Estimates, Proposals & Contracts | [docs/ui/page-specs/estimates-proposals-contracts.md](docs/ui/page-specs/estimates-proposals-contracts.md) |
| Global Settings | [docs/ui/page-specs/global-settings.md](docs/ui/page-specs/global-settings.md) |
| Integrations | [docs/ui/page-specs/integrations.md](docs/ui/page-specs/integrations.md) |
| Invoices | [docs/ui/page-specs/invoices.md](docs/ui/page-specs/invoices.md) |
| Job Budget | [docs/ui/page-specs/job-budget.md](docs/ui/page-specs/job-budget.md) |
| Job Create | [docs/ui/page-specs/job-create.md](docs/ui/page-specs/job-create.md) |
| Job Detail | [docs/ui/page-specs/job-detail.md](docs/ui/page-specs/job-detail.md) |
| Job Files & Documents | [docs/ui/page-specs/job-files-documents.md](docs/ui/page-specs/job-files-documents.md) |
| Jobs List | [docs/ui/page-specs/jobs-list.md](docs/ui/page-specs/jobs-list.md) |
| Lead Create | [docs/ui/page-specs/lead-create.md](docs/ui/page-specs/lead-create.md) |
| Lead Detail | [docs/ui/page-specs/lead-detail.md](docs/ui/page-specs/lead-detail.md) |
| Leads Pipeline | [docs/ui/page-specs/leads-pipeline.md](docs/ui/page-specs/leads-pipeline.md) |
| Payments | [docs/ui/page-specs/payments.md](docs/ui/page-specs/payments.md) |
| POs, Draws & Change Orders | [docs/ui/page-specs/pos-draws-cos.md](docs/ui/page-specs/pos-draws-cos.md) |
| Punch Lists, Docs & Warranties | [docs/ui/page-specs/punch-docs-warranties.md](docs/ui/page-specs/punch-docs-warranties.md) |
| QuickBooks | [docs/ui/page-specs/quickbooks.md](docs/ui/page-specs/quickbooks.md) |
| Reports | [docs/ui/page-specs/reports.md](docs/ui/page-specs/reports.md) |
| Schedule, Logs & Photos | [docs/ui/page-specs/schedule-logs-photos.md](docs/ui/page-specs/schedule-logs-photos.md) |
| Templates | [docs/ui/page-specs/templates.md](docs/ui/page-specs/templates.md) |
| Time Clock | [docs/ui/page-specs/time-clock.md](docs/ui/page-specs/time-clock.md) |
| To-Do Lists | [docs/ui/page-specs/todo-lists.md](docs/ui/page-specs/todo-lists.md) |
| Vendor Portal | [docs/ui/page-specs/vendor-portal.md](docs/ui/page-specs/vendor-portal.md) |
| Vendor Portal (Portal View) | [docs/ui/page-specs/vendor-portal-portal.md](docs/ui/page-specs/vendor-portal-portal.md) |
| Vendors, Clients & Cost Codes | [docs/ui/page-specs/vendors-clients-costcodes.md](docs/ui/page-specs/vendors-clients-costcodes.md) |
| Warranty Claims | [docs/ui/page-specs/warranty-claims.md](docs/ui/page-specs/warranty-claims.md) |

**User Flows:**

| Flow | Path |
|------|------|
| Change Order | [docs/ui/user-flows/change-order.md](docs/ui/user-flows/change-order.md) |
| Daily Field Operations | [docs/ui/user-flows/daily-field-operations.md](docs/ui/user-flows/daily-field-operations.md) |
| Draw Request | [docs/ui/user-flows/draw-request.md](docs/ui/user-flows/draw-request.md) |
| Invoice Processing | [docs/ui/user-flows/invoice-processing.md](docs/ui/user-flows/invoice-processing.md) |
| Lead to Project | [docs/ui/user-flows/lead-to-project.md](docs/ui/user-flows/lead-to-project.md) |
| New Project Creation | [docs/ui/user-flows/new-project-creation.md](docs/ui/user-flows/new-project-creation.md) |

### Checklists & Tracking

| Document | Path | Description |
|----------|------|-------------|
| Gap Tracker | [docs/checklists/gap-tracker.json](docs/checklists/gap-tracker.json) | 1,125 items, all status=planned, priority P0-P3 |
| Build Phases | [docs/checklists/build-phases.md](docs/checklists/build-phases.md) | Implementation roadmap |
| Dependency Graph | [docs/checklists/dependency-graph.md](docs/checklists/dependency-graph.md) | Module dependencies, build order, critical path |
| Test Plan | [docs/checklists/test-plan.md](docs/checklists/test-plan.md) | Testing strategy (to be expanded during build) |
| Edge Cases | [docs/checklists/edge-cases.md](docs/checklists/edge-cases.md) | 247 edge cases across Sections 44-48 |
| Audit Report | [docs/checklists/audit-report.md](docs/checklists/audit-report.md) | Documentation audit results |

### Research

| Document | Path | Description |
|----------|------|-------------|
| Apps We Replace | [docs/research/apps-we-replace.md](docs/research/apps-we-replace.md) | 25 app categories being consolidated |
| State Regulations | [docs/research/state-regulations.md](docs/research/state-regulations.md) | Tax, insurance, liens, permits across 8 states |
| Construction Workflows | [docs/research/construction-workflows.md](docs/research/construction-workflows.md) | 14 lifecycle phases, daily ops, personas |
| Competitor Analysis | [docs/research/competitor-analysis.md](docs/research/competitor-analysis.md) | BuilderTrend comparison |
| Marketing Features | [docs/research/marketing-features.md](docs/research/marketing-features.md) | Feature marketing positioning |

### Other

| Document | Path | Description |
|----------|------|-------------|
| Planning Summary | [docs/planning-summary.md](docs/planning-summary.md) | Overview of planning phase output |

---

## Gap Tracker Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0 (Critical) | 110 | Must-have for launch |
| P1 (High) | 155 | Important for competitive parity |
| P2 (Medium) | 567 | Valuable features, can phase |
| P3 (Low) | 293 | Nice-to-have, future iterations |
| **Total** | **1,125** | **All status: planned** |

---

## v1 Reference

The existing app at `../Construction-Management-Software` serves as implementation reference:

- **105 route files** (~1,581 API endpoints)
- **199 database migrations** (full schema with multi-tenancy + RLS)
- **59 client pages**, 235 components
- **158 passing tests** across 7 suites
- Key proven patterns documented in module docs under "Proven Patterns from v1" sections
- Key v1 services: invoice-helpers.js (27KB), variance-detector.js (40KB), document-intelligence.js (24KB), proposal-generator.js (14KB), schedule-pdf-generator.js (15KB), contract-pdf-generator.js (14KB), notifications.js (17KB), reconciliation.js (17KB)

---

## Skeleton Preview

Run the Next.js app to see the planned UI layout:

```bash
cd app && npm install && npm run dev
# Visit http://localhost:3000/skeleton
```

---

## Quick Links

| Need to... | Go to... |
|------------|----------|
| Understand the product | [Platform Vision](docs/specs/platform-vision.md) |
| See all requirements | [Gap Tracker](docs/checklists/gap-tracker.json) |
| Understand the data model | [Data Model](docs/architecture/data-model.md) |
| See API design | [API Spec](docs/architecture/api-spec.md) |
| Check build order | [Dependency Graph](docs/checklists/dependency-graph.md) |
| Start building a module | [docs/modules/](docs/modules/) (pick by number) |
| Design a page | [docs/ui/page-specs/](docs/ui/page-specs/) |
| See what v1 already does | `../Construction-Management-Software` |

---

*113 documents. 1,125 tracked items. 50 modules. 0 lines of production code written yet.*
