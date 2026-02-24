# Intent Log — RossOS Construction Intelligence Platform

## 2026-02-23: Module 18 — Purchase Orders V1 Foundation

### Why
Module 18 provides the purchase order lifecycle management for construction projects. This is Phase 3 (Financial Power). POs are central to construction procurement -- they track what is ordered from vendors, at what price, and whether materials have been received. Committed costs from open POs feed directly into budget forecasting and cash flow projections, making this a prerequisite for accurate financial reporting (Module 19).

### What was built
- **Migration** (`20260224100006_purchase_orders.sql`): 4 tables (purchase_orders, purchase_order_lines, po_receipts, po_receipt_lines) with RLS on tenant tables, comprehensive indexes on filter/join columns, proper FK relationships with CASCADE on child line tables. Soft delete via deleted_at on purchase_orders.
- **Types** (`types/purchase-orders.ts`): PurchaseOrderStatus type union (8 values), 4 interfaces matching DB schema, PO_STATUSES constant array for UI dropdowns.
- **Validation** (`lib/validation/schemas/purchase-orders.ts`): 11 Zod schemas covering all CRUD operations. Date fields validated with YYYY-MM-DD regex. Receipt schema requires at least 1 line. Quantity fields are positive-only.
- **API Routes** (7 route files under `api/v2/purchase-orders/`): Full CRUD for POs and lines. Approve/send status transitions with conflict detection (409 for invalid state transitions). Receipt recording auto-updates line received_quantity and PO status (partially_received vs received).
- **Tests** (`tests/acceptance/18-purchase-orders.acceptance.test.ts`): 30 pure function tests covering types, constants, all enum schemas, and all CRUD schemas.

### Design decisions
1. **V1 scope**: Core PO lifecycle only (draft->approve->send->receive->close). No blanket POs, amendments/versioning, three-way matching, or cross-project aggregation -- those are V2 features per the spec.
2. **8 statuses (not 10)**: Simplified from the spec's 10 statuses. Dropped "acknowledged" (optional vendor-side step) and "invoiced" (handled by Module 13 AI Invoice Processing integration). Renamed "cancelled" to "voided" for consistency with accounting terminology.
3. **Soft delete on POs only**: PO header uses soft delete (deleted_at) since POs are legal documents. Line items and receipt lines use CASCADE delete from parent since they have no independent lifecycle.
4. **Receipt auto-updates PO status**: When a receipt is recorded, the API automatically updates received_quantity on each PO line and recalculates whether the PO should be partially_received or received. This saves a second API call.
5. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 18 tables yet. This avoids modifying the shared database.ts types file.

---

## 2026-02-23: Module 17 — Change Order Management V1 Foundation

### Why
Module 17 is the change order management system for Phase 3 (Financial Power). Change orders are central to construction project management -- they track scope changes, approval workflows, cost/schedule impacts, and cascade to contract values, budgets, and draw schedules. This V1 builds the core data model, type system, validation schemas, CRUD + workflow API routes, and acceptance tests. The full lifecycle features (configurable approval chains, client portal e-signatures, negotiation tracking, budget cascade, CO templates, PDF generation, and analytics) will be added in V2.

### What was built
- **Migration** (`20260224100005_change_orders.sql`): 3 tables with RLS and 13 indexes. change_orders is the core table with 6 change types, 5 statuses, requester tracking, amount/cost_impact/schedule_impact fields, approval chain JSONB, client approval tracking, and soft delete. change_order_items stores line-item cost breakdown with quantity, unit_price, markup, and vendor reference. change_order_history provides an immutable audit trail of 7 action types (created/submitted/approved/rejected/voided/revised/client_approved).
- **Types** (`types/change-orders.ts`): 4 type unions (ChangeType 6 values, ChangeOrderStatus 5 values, RequesterType 3 values, ChangeOrderHistoryAction 7 values), 3 interfaces, 4 constant arrays with value/label pairs.
- **Validation** (`lib/validation/schemas/change-orders.ts`): 4 enum schemas, 9 CRUD/workflow schemas. createChangeOrderSchema requires job_id, co_number, title with sensible defaults (draft status, owner_requested type, zero amounts). updateChangeOrderSchema allows partial updates. submitChangeOrderSchema and approveChangeOrderSchema support optional notes. Item schemas support full line-item CRUD with quantity/price/markup fields.
- **API Routes** (6 route files under `api/v2/change-orders/`): Full CRUD for change orders (GET list, POST create, GET/PUT/DELETE by ID), workflow transitions (POST submit draft->pending, POST approve pending->approved), and item management (GET/POST items list, PUT/DELETE items by ID). All routes enforce status-based access control -- only draft COs can be deleted, only draft/pending COs can be updated or have items modified.
- **Tests** (`tests/acceptance/17-change-orders.acceptance.test.ts`): 33 pure function tests covering all type unions, interfaces, constants, enum schemas, and CRUD schemas including edge cases (required fields, max lengths, defaults, partial updates).

### Design decisions
1. **V1 scope**: Core CRUD and simple workflow transitions only. No configurable approval chains, no negotiation state machine, no client portal e-signatures, no budget/contract cascade, no CO templates or PDF generation. Those are V2+ features requiring additional modules (Module 9 Budget, Module 15 Draws, Module 29 Client Portal).
2. **Simplified status model**: The spec defines an 8-status negotiation flow (draft/internal_review/client_presented/negotiation/approved/rejected/withdrawn/voided). V1 uses a 5-status model (draft/pending_approval/approved/rejected/voided) suitable for internal builder workflows. The full negotiation flow will be added when the client portal (Module 29) is built.
3. **History table instead of versions**: The spec has both change_order_versions (snapshot-based) and change_order_approvals (step-based). V1 uses a single change_order_history table with action/previous_status/new_status/details that serves as an audit trail. Full version tracking and multi-step approval workflows will be added in V2.
4. **Soft delete on change_orders only**: Items and history cascade-delete with the parent CO (ON DELETE CASCADE). This is safe because only draft COs can be deleted, and draft COs have no financial implications.
5. **Status-based access control**: PUT and item mutations check the CO status and return 403 if the CO is approved/rejected/voided. DELETE only works on draft COs. This prevents accidental modification of financially-committed change orders.
6. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 17 tables yet. This avoids modifying the shared database.ts types file.

## 2026-02-23: Module 16 — QuickBooks & Accounting Integration V1 Foundation

### Why
Module 16 provides the sync infrastructure for builders who use external accounting systems (QuickBooks Online, Xero, Sage) alongside RossOS. This is Phase 3 (Financial Power) and is marked as OPTIONAL -- it is only needed when a builder wants to keep an external accounting system running in parallel with RossOS native accounting (Module 11).

### What was built
- **Migration** (`20260224100004_quickbooks_integration.sql`): 4 tables with RLS, indexes, constraints. accounting_connections has UNIQUE(company_id, provider) to enforce one connection per provider. sync_mappings has UNIQUE(connection_id, entity_type, internal_id) to prevent duplicate mappings.
- **Types** (`types/integrations.ts`): Complete type system with 9 type unions, 4 interfaces, 9 constant arrays.
- **Validation** (`lib/validation/schemas/integrations.ts`): Zod schemas for all CRUD operations. triggerSyncSchema defaults to manual/push. resolveConflictSchema explicitly excludes "pending" as a valid resolution.
- **API Routes** (8 route files under `api/v2/integrations/`): Full CRUD for connections, mappings, sync-logs, and conflicts. Sync trigger returns 202 Accepted. Conflict resolution prevents re-resolving already-resolved conflicts.
- **Tests** (`tests/acceptance/16-integrations.acceptance.test.ts`): 57 pure function tests covering types, constants, all enum schemas, and all CRUD schemas.

### Design decisions
1. **V1 scope**: Sync infrastructure only. No actual OAuth flow or API calls to QBO/Xero/Sage -- that requires external API keys and background job processing (V2).
2. **Soft delete on connections only**: Connections use soft delete (deleted_at) since they contain historical audit data. Mappings use hard delete since they can be recreated.
3. **Sync trigger returns 202**: The sync endpoint creates a log entry and returns immediately. Actual sync work would be dispatched to a background job queue in V2.
4. **No "pending" in resolveConflictSchema**: Resolving a conflict means choosing a resolution; setting it back to "pending" is not a valid resolution action.
5. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 16 tables yet. This avoids modifying the shared database.ts types file.

## 2026-02-23: Module 19 — Financial Reporting V1 Foundation

### Why
Module 19 is the financial reporting engine for Phase 3 (Financial Power). It provides the foundation for all financial reports -- P&L, balance sheet, cash flow, WIP, job cost, AR/AP aging, budget vs actual, retainage, and custom reports. Builders need to generate, schedule, and snapshot financial data for their accountants, lenders, and internal review. Period locking ensures month-end/quarter-end data integrity. This V1 builds the data model, types, validation, and API routes; the actual report calculation engine will be wired in later phases.

### What was built
- **Migration** (`20260224100007_financial_reporting.sql`): 4 tables with RLS, indexes, constraints. report_definitions supports 10 report types. report_snapshots stores immutable point-in-time report data. report_schedules enables automated delivery with frequency/day/recipient config. financial_periods tracks fiscal periods with open/closed/locked status and UNIQUE on (company_id, period_name).
- **Types** (`types/financial-reporting.ts`): 3 type unions (ReportType with 10 values, ScheduleFrequency with 4 values, PeriodStatus with 3 values), 5 interfaces, 3 constant arrays with value/label pairs.
- **Validation** (`lib/validation/schemas/financial-reporting.ts`): 14 Zod schemas covering all CRUD operations. generateReportSchema requires YYYY-MM-DD dates. createReportScheduleSchema enforces min 1 recipient with email validation. Financial period schemas validate date format, fiscal year range (2000-2100), and quarter range (1-4).
- **API Routes** (10 route files under `api/v2/reports/` and `api/v2/financial-periods/`): Full CRUD for definitions (GET/POST list, GET/PUT/DELETE by ID), report generation (POST generate creates snapshot), snapshots (GET list, GET by ID), schedules (GET/POST list, PUT/DELETE by ID), financial periods (GET/POST list, GET/PUT by ID, POST close).
- **Tests** (`tests/acceptance/19-financial-reporting.acceptance.test.ts`): 41 pure function tests covering types, constants, all enum schemas, all CRUD schemas, and edge cases.

### Design decisions
1. **V1 scope**: Data model and API infrastructure only. Report generation creates a snapshot with placeholder data. The actual calculation engine (P&L aggregation, WIP computation, aging bucket calculation) will be wired in when dependent modules (budgets, invoicing, cost transactions) have real data.
2. **Soft delete via is_active on report_definitions**: Rather than adding a deleted_at column, definitions use is_active=false. This preserves existing snapshots that reference the definition while hiding it from active lists.
3. **Hard delete on schedules**: Schedules can be cleanly removed since they don't have immutable audit requirements. If needed, the schedule can be recreated.
4. **Period close is one-way (open -> closed)**: The close endpoint only transitions from open to closed. Locked status and reopening would be handled by separate admin endpoints in V2. The PUT endpoint prevents updates to locked periods.
5. **Generate validates is_active**: Cannot generate a report from an inactive definition (403). This prevents orphaned snapshots from deactivated report templates.
6. **`as any` casts on Supabase queries**: Required because the Supabase client types don't include Module 19 tables yet.
