# Project Context - RossOS

> **IMPORTANT**: Read this file at the START of every session to restore context.
> Update this file at the END of every session or after completing a phase.

## Project Overview

**Name**: RossOS - Construction Management SaaS
**Goal**: Multi-tenant platform for 10,000+ companies, 1,000,000+ users
**Stack**: Next.js 14, React 19, Supabase, TypeScript, Tailwind CSS

## Current State

### Active Milestone
```
Version: MVP v1.0
Status: Phase 1 - Foundation & Core Data
Roadmap: docs/MVP_ROADMAP.md
```

### Last Completed Work
```
Date: 2024-02-12
Summary:
- Created 78 skeleton pages with UI Preview tabs
- Set up scalability infrastructure (RLS, caching, rate limiting, job queue)
- Created comprehensive development standards documentation
- Applied database migrations to Supabase (RossOS project)
- Set up autonomous development safeguards (.claude/ context system)
- Imported 1,320 pain points and 1,050+ connection mappings
- Created MVP roadmap with 8 phases
- COMPLETED GAP ANALYSIS: Validated all 1,320 pain points against roadmap
  - Added basic safety features to Phase 3 & 5
  - Added 4 new post-MVP phases (Safety, Lender Portal, Data Migration, Platform Features)
  - See docs/requirements/GAP_ANALYSIS.md for full analysis
```

### Current Phase
```
Phase: 1 - Foundation & Core Data
Status: Ready to Begin
Goal: Auth, Companies, Users, Clients, Jobs - basic CRUD
See: .claude/CURRENT_PHASE.md for detailed tasks
```

### Next Up
```
After Phase 1: Phase 2 - Financial Management
- Budgets, Invoices, Change Orders, Draws, AIA Pay Apps
```

## MVP Roadmap Summary

### MVP Phases (1-8)
| Phase | Name | Key Features | Priority |
|-------|------|--------------|----------|
| 1 | Foundation & Core Data | Auth, Users, Clients, Jobs | P0 |
| **1.5** | **DATA MIGRATION** ⭐ | Buildertrend, CoConstruct, QuickBooks, Excel | **P0** |
| 2 | Financial Management | Budget, Invoices, COs, Draws, AIA | P0 |
| 3 | Field & Schedule | Schedule, Daily Logs, Photos, Punch, **Basic Safety** | P0 |
| 4 | Selections & Design | Selections, Allowances, Designer Portal | P1 |
| 5 | Vendors & Subs | Vendor DB, Bids, Contracts, Insurance, **Sub Safety** | P1 |
| 6 | Client Portal | Dashboard, Progress, Approvals | P0 |
| 7 | Reports & Analytics | Financial, Portfolio, WIP Reports | P1 |
| 8 | Documents & Communication | Docs, RFIs, Submittals, Messaging | P1 |

> ⭐ **Phase 1.5 is CRITICAL** - Migration is #1 barrier to customer acquisition. See `docs/MIGRATION_STRATEGY.md`

### Post-MVP Phases (9-16) — Added from Gap Analysis
| Phase | Name | Key Features |
|-------|------|--------------|
| 9 | AI & Automation | NLP Queries, Predictions, Invoice OCR |
| 10 | **Safety & Compliance** ⚠️ | Full Safety Plans, OSHA, Environmental |
| 11 | Home Care & Warranty | Claims, Maintenance, Digital Manual |
| 12 | Sales & Pre-Con | Pipeline, Budgeting, Proposals, **+Realtor** |
| 13 | Advanced Features | Coastal, Multi-entity, **+Equipment** |
| 13.5 | **HR & Time Mgmt** ⚠️ | Hours by Project, Onboarding, Labor Rates |
| 14 | **Lender Portal** ⚠️ | Draw Verification, Risk Assessment |
| 15 | **Data & Migration** ⚠️ | Import/Export, API, Competitor Import |
| 16 | **Platform Features** ⚠️ | White-label, Benchmarking, Workflows |

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | Supabase (Postgres) | RLS for multi-tenancy, real-time, auth built-in |
| Caching | Vercel KV + in-memory fallback | Edge-compatible, tenant isolation |
| Auth | Supabase Auth | Integrated with RLS policies |
| Styling | Tailwind + shadcn/ui | Consistent, fast development |
| State | React Query | Server state caching, optimistic updates |
| Background Jobs | DB queue + Vercel Cron | No external dependencies |

## Multi-Tenancy Pattern

Every tenant table has:
- `company_id UUID NOT NULL REFERENCES companies(id)`
- RLS policy: `USING (company_id = get_current_company_id())`
- Index on `company_id`

## Key File Locations

| Purpose | Location |
|---------|----------|
| Main App Pages | `src/app/(dashboard)/` |
| Skeleton/Preview Pages | `src/app/(skeleton)/skeleton/` |
| API Routes | `src/app/api/` |
| Components | `src/components/` |
| Hooks | `src/hooks/` |
| Utilities | `src/lib/` |
| Types | `src/types/` |
| Migrations | `supabase/migrations/` |
| Documentation | `docs/` |
| Standards | `docs/standards/` |
| Requirements | `docs/requirements/` |
| MVP Roadmap | `docs/MVP_ROADMAP.md` |
| Context Files | `.claude/` |

## Database Tables (Current)

### Existing (from infrastructure setup)
```
companies     - Tenant/organization accounts
users         - User accounts (linked to company)
clients       - Customer records per company
jobs          - Construction projects
vendors       - Supplier/subcontractor records
invoices      - Financial invoices
draws         - Payment draw requests
job_queue     - Background job processing
audit_log     - Audit trail for sensitive actions
api_metrics   - API performance tracking
```

### Needed for Phase 1
```
job_phases    - Project phases/milestones
contacts      - Contact information
addresses     - Address records
notes         - Notes on any entity
tags          - Tagging system
```

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
KV_REST_API_URL (optional)
KV_REST_API_TOKEN (optional)
CRON_SECRET
```

## Supabase Project

```
Project ID:  yprbbomuhugtgyqmrnhr
Name:        RossOS
Region:      us-east-1
```

## Quick Commands

```bash
npm run dev          # Start development
npm run build        # Production build
npm run lint         # Check code quality
npm run validate     # Full validation (lint + typecheck + test)
npm run db:generate  # Regenerate Supabase types
```

## Reference Documents

### Core Planning
- `docs/MVP_ROADMAP.md` - Full MVP roadmap with all phases (v1.4)
- `docs/MIGRATION_STRATEGY.md` - **Data migration system design** ⭐ CRITICAL
- `docs/requirements/PAIN_POINTS.md` - 1,320 pain points to solve
- `docs/requirements/CONNECTION_MAP.md` - 1,050+ data connections
- `docs/requirements/GAP_ANALYSIS.md` - Gap analysis results

### Database & Execution
- `docs/DATABASE_SCHEMA.md` - Phases 1-2 tables (~29 tables)
- `docs/DATABASE_SCHEMA_EXTENDED.md` - Phases 3-8 tables (~56 tables)
- `docs/EXECUTION_PLAN.md` - Atomic tasks for Phases 1-2
- `docs/EXECUTION_PLAN_EXTENDED.md` - Atomic tasks for Phases 3-8

### Enterprise & Mobile
- `docs/ENTERPRISE_INFRASTRUCTURE.md` - **Phases 17-22** (~45 tables)
- `docs/MOBILE_OFFLINE_STRATEGY.md` - **Phases 23-25** (~6 tables + local DB)

### Vision & Strategy
- `docs/vision/ROSSOS_MASTER_VISION.md` - **THE MASTER VISION** ⭐ Core product philosophy
- `docs/vision/AI_INTEGRATION_STRATEGY.md` - AI architecture across all modules
- `docs/vision/SYSTEM_CONNECTIONS.md` - Data flow mappings (1,050+ connections)
- `docs/vision/SYSTEM_DESIGN.md` - Overall system architecture

### Research & Analysis
- `docs/research/AUDIT_REPORT.md` - Initial system audit findings
- `docs/research/BUILDERTREND_COMPARISON.md` - Competitor analysis
- `docs/research/ROSSOS_MARKETING_FEATURES.md` - Marketing positioning

### Design & UX
- `docs/design/NAVIGATION.md` - Navigation structure
- `docs/design/VIEWS_INDEX.md` - Index of all UI views
- `docs/design/views/` - Detailed view specifications per module
- `docs/design/DOCUMENT_INTELLIGENCE.md` - Document processing strategy

### Technical Implementation
- `docs/TECHNICAL_ARCHITECTURE.md` - Search, caching, files, PDF generation
- `docs/TESTING_STRATEGY.md` - Unit, component, integration, E2E testing
- `docs/DEVOPS_PIPELINE.md` - CI/CD, deployment, monitoring
- `docs/API_DESIGN_STANDARDS.md` - API versioning, pagination, errors
- `docs/INTEGRATIONS_GUIDE.md` - E-signature, calendar, accounting, payments
- `docs/ESTIMATING_SYSTEM.md` - Cost database, assemblies, takeoffs
- `docs/PROCUREMENT_SYSTEM.md` - POs, receiving, material tracking
- `docs/USER_ONBOARDING.md` - Wizard, tours, help system

### Standards
- `docs/standards/` - All coding standards
- `.claude/RULES.md` - Autonomous operation rules

---

## Autonomous Execution Documentation

Complete documentation for autonomous development is now available:

| Document | Purpose | Phases |
|----------|---------|--------|
| `docs/DATABASE_SCHEMA.md` | Complete table definitions | 1, 1.5, 2 |
| `docs/DATABASE_SCHEMA_EXTENDED.md` | Extended table definitions | 3, 4, 5, 6, 7, 8 |
| `docs/EXECUTION_PLAN.md` | Atomic task breakdown | 1, 1.5, 2 |
| `docs/EXECUTION_PLAN_EXTENDED.md` | Extended task breakdown | 3, 4, 5, 6, 7, 8 |
| `docs/MIGRATION_STRATEGY.md` | Data migration architecture | 1.5 |

**Total Tables Defined**: ~85 across all phases
**Execution Tasks**: ~300+ atomic checkboxes

---

## Session Log

### 2026-02-12 Session 5
- **CONSOLIDATED PROJECT FOLDERS** ✅
  - Merged 3 folders (cms_rebuild, cms-audit, cms-rebuild-design) into single project
  - Created organized doc structure: `docs/vision/`, `docs/research/`, `docs/design/`
  - Moved master vision docs (ROSSOS_MASTER_VISION.md, AI_INTEGRATION_STRATEGY.md)
  - Moved system design docs (SYSTEM_CONNECTIONS.md, SYSTEM_DESIGN.md)
  - Moved research docs (AUDIT_REPORT.md, BUILDERTREND_COMPARISON.md)
  - Moved design specs (NAVIGATION.md, VIEWS_INDEX.md, views/ folder)
  - Deleted cms-audit (different architecture - not used)
  - Deleted cms-rebuild-design (content migrated)

- **CREATED 8 TECHNICAL DOCUMENTATION FILES** ✅
  - `docs/TECHNICAL_ARCHITECTURE.md` - Search, caching, files, PDF
  - `docs/TESTING_STRATEGY.md` - Vitest, Playwright, Testing Library
  - `docs/DEVOPS_PIPELINE.md` - GitHub Actions, deployment, monitoring
  - `docs/ESTIMATING_SYSTEM.md` - Cost database, assemblies, bids
  - `docs/PROCUREMENT_SYSTEM.md` - POs, receiving, material tracking
  - `docs/INTEGRATIONS_GUIDE.md` - DocuSign, QuickBooks, Stripe, Twilio
  - `docs/API_DESIGN_STANDARDS.md` - Versioning, auth, pagination, errors
  - `docs/USER_ONBOARDING.md` - Setup wizard, tours, help system

### 2026-02-12 Session 4
- **COMPLETED AUTONOMOUS EXECUTION DOCUMENTATION** ✅
  - Added complete database schemas for Phase 6 (Client Portal): 4 tables
  - Added complete database schemas for Phase 7 (Reports): 5 tables
  - Added complete database schemas for Phase 8 (Documents/Communication): 12 tables
  - Updated `docs/DATABASE_SCHEMA_EXTENDED.md` to v2.0
  - Total: ~56 additional tables for Phases 3-8, ~85 tables overall
- Documentation now ready for autonomous phase-by-phase execution
- All execution plans have atomic tasks with file paths and acceptance criteria

- **ENTERPRISE INFRASTRUCTURE AUDIT & DOCUMENTATION** ✅
  - Identified major gaps in enterprise SaaS infrastructure
  - Created `docs/ENTERPRISE_INFRASTRUCTURE.md` with 6 new phases (17-22)
  - Added ~45 new enterprise tables for:
    - Phase 17: Security (MFA, SSO/SAML, SCIM, security policies)
    - Phase 18: Billing (Stripe, subscriptions, usage metering)
    - Phase 19: Operations (monitoring, health checks, feature flags)
    - Phase 20: Legal (GDPR, consent, ToS tracking, accessibility)
    - Phase 21: Support (ticketing, knowledge base, announcements)
    - Phase 22: Admin (super admin, impersonation, tenant management)
  - Updated MVP_ROADMAP.md to v1.3 with enterprise phases

- **MOBILE APP & OFFLINE MODE DOCUMENTATION** ✅
  - Created `docs/MOBILE_OFFLINE_STRATEGY.md` with 3 new phases (23-25)
  - Added ~6 new server tables + WatermelonDB local schema for:
    - Phase 23: Mobile App Foundation (React Native, Expo, iOS/Android)
    - Phase 24: Offline-First Architecture (sync engine, conflict resolution)
    - Phase 25: Push Notifications (FCM, APNs, triggers)
  - Mobile-specific features: quick photo, daily logs, punch lists, GPS time clock
  - Updated MVP_ROADMAP.md to v1.4 with mobile phases
  - **TOTAL SCHEMA NOW: ~136 tables (server) + local mobile schema**

### 2024-02-12 Session 3
- Completed comprehensive gap analysis of all 1,320 pain points
- Validated coverage against MVP roadmap
- Identified 94 pain points not covered in original roadmap
- Added basic safety features to Phase 3 (safety observations, incident logging)
- Added sub safety compliance to Phase 5
- Added 5 new post-MVP phases (10, 13.5, 14, 15, 16)
- Enhanced existing phases (12, 13)
- **ALL 94 GAPS NOW ADDRESSED** ✅
- **CREATED PHASE 1.5: DATA MIGRATION** ⭐
  - Elevated migration from Phase 15 (post-MVP) to Phase 1.5 (MVP P0)
  - Created comprehensive `docs/MIGRATION_STRATEGY.md`
  - Covers: Buildertrend, CoConstruct, QuickBooks, Procore, Excel
  - Includes: Migration wizard UI, AI field mapping, validation, rollback
  - Service tiers: Self-service (free), Assisted ($500), White-glove ($2k+)
- Updated MVP_ROADMAP.md to v1.2

### 2024-02-12 Session 2
- Imported pain points (1,320 items) and connection map (1,050+ connections)
- Created MVP roadmap with 8 phases
- Set up Phase 1 task tracking
- Ready to begin Phase 1 implementation

### 2024-02-12 Session 1
- Added UI Preview tabs to 78 skeleton pages
- Fixed job navigation dropdown issue
- Created scalability infrastructure
- Created development standards documentation
- Set up autonomous safeguards (.claude/ system)

---

*Last Updated: 2024-02-12*
