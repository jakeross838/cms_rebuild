# Agent Build Queue

> **Ordered work queue for autonomous agents.** Each entry lists what to build, where to find the spec, and what must be done first. Agents pick the top `not_started` item and execute.

## Current: Phase 0C — Foundation Hardening
## Next: Phase 0D — Code Quality Hardening
## Then: Module 02 — Configuration Engine

---

## Queue Rules

1. Only ONE module can be `in_progress` at a time (enforced via `MODULE_STATUS.md`)
2. Never skip ahead — complete items in queue order
3. All dependencies must be `done` before starting
4. Run `npm run validate` in `app/` before marking anything `done`
5. Update `MODULE_STATUS.md` after each completion

---

## Queue Order

### 1. Phase 0C — Foundation Hardening
- **Spec:** `docs/BUILD_PLAN.md` (lines 42-134)
- **Migration:** `app/supabase/migrations/20260220025656_0c_foundation_hardening_soft_deletes.sql` (local, not applied)
- **Tests:** Validation checklist in BUILD_PLAN.md
- **Depends on:** Module 01 (done)
- **Blocks:** Phase 0D, all Module 02+ work

**Sub-tasks (8):**
| # | Task | Priority |
|---|------|----------|
| 0C-1 | Enforce soft-delete architecture (`deleted_at` on core tables) | HIGH |
| 0C-2 | Fix RLS policies for soft-delete + remove DELETE policies | HIGH |
| 0C-3 | Add environment variable validation (`src/lib/env.ts` with Zod) | MEDIUM |
| 0C-4 | Add HydrationBoundary SSR prefetch pattern | MEDIUM |
| 0C-5 | Fix duplicate Supabase client in createApiHandler | MEDIUM |
| 0C-6 | Plan JWT-based company_id for RLS performance (doc only) | MEDIUM |
| 0C-7 | Rename Supabase env vars to new convention | LOW |
| 0C-8 | Add `loading.tsx` and `unauthorized.tsx` | LOW |

---

### 2. Phase 0D — Code Quality Hardening
- **Spec:** `docs/BUILD_PLAN.md` (lines 138-280)
- **Migration:** n/a (code-only changes)
- **Tests:** Validation checklist in BUILD_PLAN.md
- **Depends on:** Phase 0C
- **Blocks:** Module 02+

**Sub-tasks (8):**
| # | Task | Priority |
|---|------|----------|
| 0D-1 | Eliminate all `as any` type casts (6 instances) | HIGH |
| 0D-2 | Add explicit return types to all exported functions | HIGH |
| 0D-3 | Type error handlers properly (utility + catch blocks) | HIGH |
| 0D-4 | Fix type assertions in API routes | MEDIUM |
| 0D-5 | Centralize magic constants (`US_STATES`, `CONTRACT_TYPES`) | MEDIUM |
| 0D-6 | Add missing barrel exports (`components/ui/`, `components/layout/`) | MEDIUM |
| 0D-7 | Remove dead code and empty attributes | LOW |
| 0D-8 | Document code organization standards in `docs/standards.md` | LOW |

---

### 3. Module 02 — Configuration Engine
- **Spec:** `docs/3-modules/02-configuration-engine.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 02-A through 02-H)
- **Migration:** `app/supabase/migrations/20260223100000_configuration_engine.sql` (local, NOT applied)
- **Acceptance Tests:** `app/tests/acceptance/02-config-engine.acceptance.test.ts`
- **Depends on:** Module 01
- **Blocks:** Module 03, Module 05
- **Sub-tasks:** 8 (migration, config resolution engine, feature flags, terminology, numbering, custom fields, hooks/UI, tests ~40)

---

### 4. Module 03 — Core Data Model
- **Spec:** `docs/3-modules/03-core-data-model.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 03-A through 03-I)
- **Migration:** Base schema applied; enhancement migration needed (03-A)
- **Acceptance Tests:** `app/tests/acceptance/03-core-data-model.acceptance.test.ts`
- **Depends on:** Module 01, Module 02
- **Blocks:** Module 04, Module 07, Module 08, Module 09, Module 10, Module 12
- **Sub-tasks:** 9 (schema enhancement, jobs CRUD, vendors CRUD, clients CRUD, cost codes CRUD, change history, hooks, UI wiring, tests ~50)

---

### 5. Module 05 — Notification Engine
- **Spec:** `docs/3-modules/05-notification-engine.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 05-A through 05-G)
- **Migration:** `applied` (notification_engine)
- **Acceptance Tests:** `app/tests/acceptance/05-notification-engine.acceptance.test.ts`
- **Depends on:** Module 01, Module 02
- **Blocks:** Module 06
- **Sub-tasks:** 7 (service core, in-app notifications + SSE, email channel, user prefs, storm protection, tests ~30)

---

### 6. Module 04 — Navigation, Search & Dashboard
- **Spec:** `docs/3-modules/04-navigation-search-dashboard.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 04-A through 04-F)
- **Migration:** Needs search infrastructure (views, GIN indexes)
- **Acceptance Tests:** `app/tests/acceptance/04-search.acceptance.test.ts`
- **Depends on:** Module 03
- **Blocks:** None directly (quality-of-life for all subsequent modules)
- **Sub-tasks:** 6 (search infrastructure, Cmd+K palette, widget framework, 5 dashboard widgets, breadcrumbs + project switcher, tests ~25)

---

### 7. Module 06 — Document Storage
- **Spec:** `docs/3-modules/06-document-storage.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 06-A through 06-G)
- **Migration:** `applied` (document_storage)
- **Acceptance Tests:** `app/tests/acceptance/06-document-storage.acceptance.test.ts`
- **Depends on:** Module 01, Module 02, Module 05
- **Blocks:** Module 07, Module 08, Module 10, Module 13, Module 24, Module 26, Module 27, Module 28
- **Sub-tasks:** 7 (upload + storage API, folder management, version control, expiration tracking, hooks + UI, tests ~25)

---

### 8. Module 07 — Scheduling & Calendar
- **Spec:** `docs/3-modules/07-scheduling.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 07-A through 07-H)
- **Migration:** `applied` (scheduling)
- **Acceptance Tests:** `app/tests/acceptance/07-scheduling.acceptance.test.ts`
- **Depends on:** Module 03, Module 05, Module 06
- **Blocks:** Module 22, Module 25, Module 32
- **Sub-tasks:** 8 (task CRUD, Gantt chart, calendar views, weather integration, templates, hooks + UI, tests ~40)

---

### 9. Module 08 — Daily Logs
- **Spec:** `docs/3-modules/08-daily-logs.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 08-A through 08-F)
- **Migration:** `applied` (daily_logs)
- **Acceptance Tests:** `app/tests/acceptance/08-daily-logs.acceptance.test.ts`
- **Depends on:** Module 03, Module 05, Module 06
- **Sub-tasks:** 6 (CRUD API, voice-to-text, PDF generation, hooks + UI, tests ~25)

---

### 10. Module 09 — Budget & Cost Tracking
- **Spec:** `docs/3-modules/09-budget-cost-tracking.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 09-A through 09-F)
- **Migration:** `applied` (trigger_function_and_budget)
- **Acceptance Tests:** `app/tests/acceptance/09-budget-cost.acceptance.test.ts`
- **Depends on:** Module 02, Module 03
- **Blocks:** Module 11, Module 13, Module 15, Module 16, Module 17, Module 18, Module 19, Module 20, Module 35
- **Sub-tasks:** 6 (CRUD API, cost tracking engine, budget views, hooks + UI, tests ~35)

---

### 11. Module 10 — Vendor Management
- **Spec:** `docs/3-modules/10-vendor-management.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 10-A through 10-E)
- **Migration:** `applied` (vendor_management)
- **Acceptance Tests:** `app/tests/acceptance/10-vendor-management.acceptance.test.ts`
- **Depends on:** Module 03, Module 05, Module 06
- **Blocks:** Module 30
- **Sub-tasks:** 5 (enhancement migration, compliance API, portal prep, hooks + UI, tests ~25)

---

### 12. Module 11 — Native Accounting (GL/AP/AR)
- **Spec:** `docs/3-modules/11-native-accounting.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 11-A through 11-F)
- **Migration:** `applied` (native_accounting)
- **Acceptance Tests:** `app/tests/acceptance/11-accounting.acceptance.test.ts`
- **Depends on:** Module 03, Module 05, Module 09
- **Blocks:** Module 13, Module 14, Module 16, Module 19, Module 23
- **Sub-tasks:** 6 (invoice CRUD, approval workflow engine, invoice views, hooks + UI, tests ~35)

---

### 13. Module 12 — Basic Client Portal
- **Spec:** `docs/3-modules/12-basic-client-portal.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 12-A through 12-F)
- **Migration:** `applied` (client_portal)
- **Acceptance Tests:** `app/tests/acceptance/12-client-portal.acceptance.test.ts`
- **Depends on:** Module 01, Module 03, Module 06
- **Blocks:** Module 21, Module 29, Module 44
- **Sub-tasks:** 6 (portal auth, portal API, portal UI shell, hooks + UI, tests ~25)

---

### 14. Module 51 — Time Tracking & Labor
- **Spec:** `docs/3-modules/51-time-tracking.md`
- **Build Plan:** Phase 2 module
- **Migration:** `applied` (time_tracking)
- **Acceptance Tests:** `app/tests/acceptance/51-time-tracking.acceptance.test.ts`
- **Depends on:** Module 03
- **Sub-tasks:** GPS clock in/out, crew time entry, overtime, payroll export

---

### 15. Module 13 — AI Invoice Processing
- **Spec:** `docs/3-modules/13-invoice-ai.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 13-A through 13-F)
- **Migration:** `applied` (ai_invoice_processing)
- **Acceptance Tests:** `app/tests/acceptance/13-invoice-processing.acceptance.test.ts`
- **Depends on:** Module 06, Module 09, Module 11
- **Blocks:** Module 24
- **Sub-tasks:** 6 (AI processing migration, OCR pipeline, auto-matching, review UI, hooks, tests ~30)

---

### 16. Module 14 — Lien Waivers
- **Spec:** `docs/3-modules/14-lien-waivers.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 14-A through 14-E)
- **Migration:** `applied` (lien_waivers)
- **Acceptance Tests:** `app/tests/acceptance/14-lien-waivers.acceptance.test.ts`
- **Depends on:** Module 03, Module 11, Module 06
- **Blocks:** Module 15
- **Sub-tasks:** 5 (waiver API, compliance dashboard, hooks + UI, tests ~20)

---

### 17. Module 15 — Draw Requests
- **Spec:** `docs/3-modules/15-draw-requests.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 15-A through 15-F)
- **Migration:** `applied` (draw_requests)
- **Acceptance Tests:** `app/tests/acceptance/15-draw-requests.acceptance.test.ts`
- **Depends on:** Module 09, Module 14
- **Blocks:** Module 19
- **Sub-tasks:** 6 (draw API, workflow, AIA PDF generation, hooks + UI, tests ~25)

---

### 18. Module 16 — QuickBooks Integration
- **Spec:** `docs/3-modules/16-quickbooks-integration.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 16-A through 16-F)
- **Migration:** `applied` (quickbooks_integration)
- **Acceptance Tests:** `app/tests/acceptance/16-integrations.acceptance.test.ts`
- **Depends on:** Module 09, Module 11, Module 03
- **Sub-tasks:** 6 (OAuth flow, entity sync engine, sync config UI, hooks, tests ~25)

---

### 19. Module 17 — Change Orders
- **Spec:** `docs/3-modules/17-change-orders.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 17-A through 17-E)
- **Migration:** `applied` (change_orders)
- **Acceptance Tests:** `app/tests/acceptance/17-change-orders.acceptance.test.ts`
- **Depends on:** Module 09, Module 03, Module 05
- **Blocks:** Module 29
- **Sub-tasks:** 5 (CO API, workflow, hooks + UI, tests ~25)

---

### 20. Module 18 — Purchase Orders
- **Spec:** `docs/3-modules/18-purchase-orders.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 18-A through 18-E)
- **Migration:** `applied` (purchase_orders)
- **Acceptance Tests:** `app/tests/acceptance/18-purchase-orders.acceptance.test.ts`
- **Depends on:** Module 09, Module 03, Module 05
- **Blocks:** Module 23
- **Sub-tasks:** 5 (PO API, workflow + budget gate, hooks + UI, tests ~25)

---

### 21. Module 19 — Financial Reporting
- **Spec:** `docs/3-modules/19-financial-reporting.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 19-A through 19-E)
- **Migration:** `applied` (financial_reporting)
- **Acceptance Tests:** `app/tests/acceptance/19-financial-reporting.acceptance.test.ts`
- **Depends on:** Module 09, Module 11, Module 15
- **Blocks:** Module 39
- **Sub-tasks:** 5 (report engine, report views, export, hooks + UI, tests ~20)

---

### 22. Module 52 — Inventory & Materials
- **Spec:** `docs/3-modules/52-inventory-management.md`
- **Build Plan:** Phase 3 module
- **Migration:** `applied` (inventory_materials)
- **Acceptance Tests:** `app/tests/acceptance/52-inventory.acceptance.test.ts`
- **Depends on:** Module 03
- **Sub-tasks:** Warehouse/job site inventory, receiving, transfers, consumption tracking

---

### 23. Module 20 — Estimating Engine
- **Spec:** `docs/3-modules/20-estimating-engine.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 20-A through 20-G)
- **Migration:** `applied` (estimating_engine)
- **Acceptance Tests:** `app/tests/acceptance/20-estimating.acceptance.test.ts`
- **Depends on:** Module 03, Module 09, Module 02
- **Blocks:** Module 48
- **Sub-tasks:** 7 (CRUD API, estimate-to-budget, assembly library, estimate presentation, hooks + UI, tests ~35)

---

### 24. Module 21 — Selection Management
- **Spec:** `docs/3-modules/21-selection-management.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 21-A through 21-E)
- **Migration:** `applied` (selections)
- **Acceptance Tests:** `app/tests/acceptance/21-selections.acceptance.test.ts`
- **Depends on:** Module 09, Module 12, Module 06
- **Blocks:** Module 29
- **Sub-tasks:** 5 (selection API, client portal view, hooks + UI, tests ~25)

---

### 25. Module 22 — Vendor Performance
- **Spec:** `docs/3-modules/22-vendor-performance.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 22-A through 22-E)
- **Migration:** `applied` (vendor_performance)
- **Acceptance Tests:** `app/tests/acceptance/22-vendor-performance.acceptance.test.ts`
- **Depends on:** Module 03, Module 07, Module 09, Module 28
- **Sub-tasks:** 5 (score engine, performance API, hooks + UI, tests ~20)

---

### 26. Module 23 — Price Intelligence
- **Spec:** `docs/3-modules/23-price-intelligence.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 23-A through 23-E)
- **Migration:** `applied` (price_intelligence_tables)
- **Acceptance Tests:** `app/tests/acceptance/23-price-intelligence.acceptance.test.ts`
- **Depends on:** Module 03, Module 11, Module 18
- **Blocks:** Module 25
- **Sub-tasks:** 5 (price tracking engine, anomaly detection, hooks + UI, tests ~20)

---

### 27. Module 24 — AI Document Processing
- **Spec:** `docs/3-modules/24-ai-document-processing.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 24-A through 24-E)
- **Migration:** `applied` (ai_document_processing)
- **Acceptance Tests:** `app/tests/acceptance/24-ai-document-processing.acceptance.test.ts`
- **Depends on:** Module 06, Module 13
- **Sub-tasks:** 5 (classification pipeline, photo intelligence, hooks + UI, tests ~20)

---

### 28. Module 26 — Bid Management
- **Spec:** `docs/3-modules/26-bid-management.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 26-A through 26-E)
- **Migration:** `applied` (bid_management)
- **Acceptance Tests:** `app/tests/acceptance/26-bid-management.acceptance.test.ts`
- **Depends on:** Module 03, Module 06, Module 05
- **Sub-tasks:** 5 (bid API, comparison component, hooks + UI, tests ~20)

---

### 29. Module 27 — RFI Management
- **Spec:** `docs/3-modules/27-rfi-management.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 27-A through 27-D)
- **Migration:** `applied` (rfi_management)
- **Acceptance Tests:** `app/tests/acceptance/27-rfi-management.acceptance.test.ts`
- **Depends on:** Module 03, Module 05, Module 06
- **Sub-tasks:** 4 (RFI API, hooks + UI, tests ~15)

---

### 30. Module 28 — Punch List & Quality
- **Spec:** `docs/3-modules/28-punch-list-quality.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 28-A through 28-F)
- **Migration:** `applied` (punch_list_quality)
- **Acceptance Tests:** `app/tests/acceptance/28-punch-list.acceptance.test.ts`
- **Depends on:** Module 03, Module 06, Module 05
- **Blocks:** Module 22 (vendor performance uses punch data)
- **Sub-tasks:** 6 (punch API, quality checklists, walkthrough mode, hooks + UI, tests ~25)

---

### 31. Module 25 — Schedule Intelligence
- **Spec:** `docs/3-modules/25-schedule-intelligence.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 25-A through 25-E)
- **Migration:** `applied` (schedule_intelligence)
- **Acceptance Tests:** `app/tests/acceptance/25-schedule-intelligence.acceptance.test.ts`
- **Depends on:** Module 07, Module 23
- **Sub-tasks:** 5 (duration prediction, risk analysis, hooks + UI, tests ~20)

---

### 32. Module 29 — Full Client Portal
- **Spec:** `docs/3-modules/29-full-client-portal.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 29-A through 29-D)
- **Migration:** `applied` (full_client_portal)
- **Acceptance Tests:** `app/tests/acceptance/29-client-portal.acceptance.test.ts`
- **Depends on:** Module 12, Module 21, Module 17
- **Sub-tasks:** 4 (portal enhancement, features, UI, tests ~20)

---

### 33. Module 30 — Vendor Portal
- **Spec:** `docs/3-modules/30-vendor-portal.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 30-A through 30-D)
- **Migration:** `applied` (vendor_portal)
- **Acceptance Tests:** `app/tests/acceptance/30-vendor-portal.acceptance.test.ts`
- **Depends on:** Module 10, Module 06
- **Sub-tasks:** 4 (portal features, UI, tests ~20)

---

### 34. Module 31 — Warranty & Home Care
- **Spec:** `docs/3-modules/31-warranty-home-care.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 31-A through 31-E)
- **Migration:** `applied` (warranty)
- **Acceptance Tests:** `app/tests/acceptance/31-warranty.acceptance.test.ts`
- **Depends on:** Module 03, Module 05
- **Sub-tasks:** 5 (warranty API, homeowner portal, hooks + UI, tests ~15)

---

### 35. Module 32 — Permitting & Inspections
- **Spec:** `docs/3-modules/32-permitting-inspections.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 32-A through 32-E)
- **Migration:** `applied` (permitting)
- **Acceptance Tests:** `app/tests/acceptance/32-permitting.acceptance.test.ts`
- **Depends on:** Module 03, Module 07, Module 02
- **Sub-tasks:** 5 (permit API, inspection workflow, hooks + UI, tests ~20)

---

### 36. Module 33 — Safety & Compliance
- **Spec:** `docs/3-modules/33-safety-compliance.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 33-A through 33-D)
- **Migration:** `applied` (safety)
- **Acceptance Tests:** `app/tests/acceptance/33-safety.acceptance.test.ts`
- **Depends on:** Module 03, Module 05, Module 06
- **Sub-tasks:** 4 (safety API, hooks + UI, tests ~15)

---

### 37. Module 34 — HR & Workforce
- **Spec:** `docs/3-modules/34-hr-workforce.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 34-A through 34-D)
- **Migration:** `applied` (hr_workforce)
- **Acceptance Tests:** `app/tests/acceptance/34-hr-workforce.acceptance.test.ts`
- **Depends on:** Module 01, Module 07
- **Sub-tasks:** 4 (time tracking API, hooks + UI, tests ~20)

---

### 38. Module 35 — Equipment & Assets
- **Spec:** `docs/3-modules/35-equipment-assets.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 35-A through 35-D)
- **Migration:** `applied` (equipment)
- **Acceptance Tests:** `app/tests/acceptance/35-equipment.acceptance.test.ts`
- **Depends on:** Module 03, Module 09
- **Sub-tasks:** 4 (equipment API, hooks + UI, tests ~15)

---

### 39. Module 36 — Lead Pipeline & CRM
- **Spec:** `docs/3-modules/36-lead-pipeline-crm.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 36-A through 36-E)
- **Migration:** `applied` (crm)
- **Acceptance Tests:** `app/tests/acceptance/36-crm.acceptance.test.ts`
- **Depends on:** Module 03, Module 05, Module 02
- **Sub-tasks:** 5 (lead API, pipeline view, hooks + UI, tests ~20)

---

### 40. Module 37 — Marketing & Portfolio
- **Spec:** `docs/3-modules/37-marketing-portfolio.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 37-A through 37-D)
- **Migration:** `applied` (marketing)
- **Acceptance Tests:** `app/tests/acceptance/37-marketing.acceptance.test.ts`
- **Depends on:** Module 03, Module 06
- **Sub-tasks:** 4 (portfolio API, hooks + UI, tests ~10)

---

### 41. Module 38 — Contracts & E-Signature
- **Spec:** `docs/3-modules/38-contracts-esign.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 38-A through 38-E)
- **Migration:** `applied` (contracts)
- **Acceptance Tests:** `app/tests/acceptance/38-contracts.acceptance.test.ts`
- **Depends on:** Module 06, Module 03
- **Sub-tasks:** 5 (contract generation, e-signature integration, hooks + UI, tests ~20)

---

### 42. Module 39 — Advanced Reporting
- **Spec:** `docs/3-modules/39-advanced-reporting.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 39-A through 39-E)
- **Migration:** `applied` (advanced_reporting)
- **Acceptance Tests:** `app/tests/acceptance/39-advanced-reporting.acceptance.test.ts`
- **Depends on:** Module 19
- **Sub-tasks:** 5 (report builder, executive dashboard, hooks + UI, tests ~20)

---

### 43. Module 40 — Mobile App
- **Spec:** `docs/3-modules/40-mobile-app.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 40-A through 40-D)
- **Migration:** `applied` (mobile_app)
- **Acceptance Tests:** `app/tests/acceptance/40-mobile-app.acceptance.test.ts`
- **Depends on:** ALL previous modules
- **Sub-tasks:** 4 (React Native setup, offline-first, field features, tests ~30)

---

### 44. Module 41 — Onboarding Wizard
- **Spec:** `docs/3-modules/41-onboarding-wizard.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 41-A through 41-D)
- **Migration:** `app/supabase/migrations/20260224400001_onboarding_wizard.sql` (local, NOT applied)
- **Acceptance Tests:** `app/tests/acceptance/41-onboarding.acceptance.test.ts`
- **Depends on:** Module 02, Module 03
- **Sub-tasks:** 4 (wizard steps, progressive disclosure, tests ~10)

---

### 45. Module 42 — Data Migration
- **Spec:** `docs/3-modules/42-data-migration.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 42-A through 42-D)
- **Migration:** `app/supabase/migrations/20260224400002_data_migration.sql` (local, NOT applied)
- **Acceptance Tests:** `app/tests/acceptance/42-data-migration.acceptance.test.ts`
- **Depends on:** Module 02, Module 03
- **Sub-tasks:** 4 (migration framework, source adapters, mapping UI, tests ~20)

---

### 46. Module 43 — Subscription Billing
- **Spec:** `docs/3-modules/43-subscription-billing.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 43-A through 43-E)
- **Migration:** `app/supabase/migrations/20260224400003_subscription_billing.sql` (local, NOT applied)
- **Acceptance Tests:** `app/tests/acceptance/43-subscription-billing.acceptance.test.ts`
- **Depends on:** Module 01, Module 02
- **Blocks:** Module 50
- **Sub-tasks:** 5 (Stripe integration, plan management UI, feature gating, tests ~20)

---

### 47. Module 44 — White-Label & Branding
- **Spec:** `docs/3-modules/44-white-label.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 44-A through 44-D)
- **Migration:** `app/supabase/migrations/20260224400004_white_label.sql` (local, NOT applied)
- **Acceptance Tests:** `app/tests/acceptance/44-white-label.acceptance.test.ts`
- **Depends on:** Module 02, Module 12
- **Sub-tasks:** 4 (theming engine, custom domain support, tests ~10)

---

### 48. Module 46 — Customer Support
- **Spec:** `docs/3-modules/46-customer-support.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 46-A through 46-D)
- **Migration:** `app/supabase/migrations/20260224400006_customer_support.sql` (local, NOT applied)
- **Acceptance Tests:** `app/tests/acceptance/46-customer-support.acceptance.test.ts`
- **Depends on:** Module 01, Module 05
- **Blocks:** Module 47
- **Sub-tasks:** 4 (ticket system, knowledge base, tests ~15)

---

### 49. Module 47 — Training Platform
- **Spec:** `docs/3-modules/47-training-platform.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 47-A through 47-D)
- **Migration:** `app/supabase/migrations/20260224400007_training_platform.sql` (local, NOT applied)
- **Acceptance Tests:** `app/tests/acceptance/47-training.acceptance.test.ts`
- **Depends on:** Module 01, Module 46
- **Sub-tasks:** 4 (training API, course viewer, tests ~10)

---

### 50. Module 48 — Template Marketplace
- **Spec:** `docs/3-modules/48-template-marketplace.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 48-A through 48-C)
- **Migration:** `app/supabase/migrations/20260224400008_template_marketplace.sql` (local, NOT applied)
- **Acceptance Tests:** `app/tests/acceptance/48-template-marketplace.acceptance.test.ts`
- **Depends on:** Module 20
- **Sub-tasks:** 3 (marketplace API, tests ~10)

---

### 51. Module 45 — API & Marketplace
- **Spec:** `docs/3-modules/45-api-marketplace.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 45-A through 45-E)
- **Migration:** `app/supabase/migrations/20260224400005_api_marketplace.sql` (local, NOT applied)
- **Acceptance Tests:** `app/tests/acceptance/45-api-marketplace.acceptance.test.ts`
- **Depends on:** ALL modules
- **Sub-tasks:** 5 (public API, webhooks, API docs, marketplace, tests ~20)

---

### 52. Module 49 — Platform Analytics
- **Spec:** `docs/3-modules/49-platform-analytics.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 49-A through 49-D)
- **Migration:** `app/supabase/migrations/20260224400009_platform_analytics.sql` (local, NOT applied)
- **Acceptance Tests:** `app/tests/acceptance/49-platform-analytics.acceptance.test.ts`
- **Depends on:** ALL modules
- **Sub-tasks:** 4 (analytics pipeline, admin dashboard, tests ~15)

---

### 53. Module 50 — Marketing Website
- **Spec:** `docs/3-modules/50-marketing-website.md`
- **Build Plan:** `docs/BUILD_PLAN.md` (sub-tasks 50-A through 50-C)
- **Migration:** `app/supabase/migrations/20260224400010_marketing_website.sql` (local, NOT applied)
- **Acceptance Tests:** `app/tests/acceptance/50-marketing-website.acceptance.test.ts`
- **Depends on:** Module 43
- **Sub-tasks:** 3 (marketing site, signup flow, tests ~10)

---

## Dependency Graph Reference

```
Phase 1: 01 → 02 → 03 → 04
              ↘ 05 → 06

Phase 2: 03 → 07 → 08
         03 + 02 → 09 → 11
         03 → 10
         01 + 03 → 12

Phase 3: 06 + 09 + 11 → 13
         03 + 11 → 14
         09 + 14 → 15
         09 + 11 + 03 → 16
         09 + 03 → 17, 18
         09 + 11 + 15 → 19

Phase 4: 03 + 09 → 20
         09 + 12 → 21
         03 + 07 + 09 → 22
         03 + 11 + 18 → 23
         06 + 13 → 24
         07 + 23 → 25
         03 + 06 → 26, 27
         03 + 06 → 28

Phase 5: 12 + 21 → 29
         10 + 06 → 30
         03 → 31, 32, 33, 34, 35, 36, 37
         06 + 03 → 38
         19 → 39
         ALL → 40

Phase 6: 02 + 03 → 41, 42
         01 + 02 → 43
         02 + 12 → 44
         ALL → 45, 49
         01 → 46, 47
         20 → 48
         43 → 50
```
