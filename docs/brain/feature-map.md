# Feature Map — RossOS Construction Intelligence Platform

## Module 18: Purchase Orders (V1 Foundation)

### Database Tables
- **purchase_orders**: Core PO header table. Columns: company_id, job_id, vendor_id, po_number (VARCHAR 50), title (VARCHAR 255), status (draft/pending_approval/approved/sent/partially_received/received/closed/voided), subtotal/tax_amount/shipping_amount/total_amount (NUMERIC 15,2), budget_id, cost_code_id, delivery_date, shipping_address, terms, notes, approved_by (FK users), approved_at, sent_at, created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, vendor_id, status, po_number, compound indexes on (company_id, status) and (company_id, job_id).
- **purchase_order_lines**: Line items per PO. Columns: po_id (FK purchase_orders CASCADE), description, quantity (NUMERIC 10,3), unit (VARCHAR 20 default 'each'), unit_price (NUMERIC 15,2), amount (NUMERIC 15,2), received_quantity (NUMERIC 10,3 default 0), cost_code_id, sort_order. Indexes on po_id, cost_code_id.
- **po_receipts**: Receipt records when materials are delivered. Columns: po_id (FK purchase_orders), company_id (FK companies), received_date, received_by (FK users), notes, document_id. RLS enabled. Indexes on po_id, company_id.
- **po_receipt_lines**: Individual line items within a receipt. Columns: receipt_id (FK po_receipts CASCADE), po_line_id (FK purchase_order_lines), quantity_received (NUMERIC 10,3), notes. Indexes on receipt_id, po_line_id.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/purchase-orders | List POs filtered by job_id/vendor_id/status/q. Paginated. Excludes soft-deleted. Search matches title or po_number. |
| POST | /api/v2/purchase-orders | Create new PO. Requires job_id, vendor_id, po_number, title. Defaults to draft status. Sets created_by from auth context. |
| GET | /api/v2/purchase-orders/:id | Get PO with nested lines (sorted by sort_order) and receipts (sorted by received_date desc). Includes lines_count and receipts_count. |
| PUT | /api/v2/purchase-orders/:id | Partial update of PO fields. Only includes provided fields in update. Verifies ownership via company_id. |
| DELETE | /api/v2/purchase-orders/:id | Soft delete: sets deleted_at, changes status to voided. |
| POST | /api/v2/purchase-orders/:id/approve | Approve PO. Validates status is draft or pending_approval (409 otherwise). Sets approved_by, approved_at, status=approved. |
| POST | /api/v2/purchase-orders/:id/send | Mark PO as sent. Validates status is approved (409 otherwise). Sets sent_at, status=sent. |
| GET | /api/v2/purchase-orders/:id/lines | List PO lines paginated. Verifies PO ownership. Ordered by sort_order asc. |
| POST | /api/v2/purchase-orders/:id/lines | Add line to PO. Verifies PO ownership. Requires description. |
| PUT | /api/v2/purchase-orders/:id/lines/:lineId | Partial update of line fields. Verifies PO ownership via company_id. |
| DELETE | /api/v2/purchase-orders/:id/lines/:lineId | Hard delete line. Verifies PO ownership. |
| GET | /api/v2/purchase-orders/:id/receipts | List receipts paginated with nested receipt lines. Verifies PO ownership. Ordered by received_date desc. |
| POST | /api/v2/purchase-orders/:id/receipts | Record receipt. Validates PO status is sent/partially_received/approved (409 otherwise). Creates receipt + receipt lines. Updates received_quantity on each PO line. Auto-updates PO status to partially_received or received based on line fulfillment. |

### Type System
- 1 type union: PurchaseOrderStatus (8 values)
- 4 interfaces: PurchaseOrder, PurchaseOrderLine, PoReceipt, PoReceiptLine
- 1 constant array: PO_STATUSES with value/label pairs for UI dropdowns

### Validation Schemas (Zod)
- 1 enum schema: purchaseOrderStatusEnum
- listPurchaseOrdersSchema (page/limit/job_id/vendor_id/status/q)
- createPurchaseOrderSchema (requires job_id, vendor_id, po_number, title; defaults status=draft, amounts=0)
- updatePurchaseOrderSchema (all fields optional)
- createPurchaseOrderLineSchema (requires description; defaults quantity=1, unit=each)
- updatePurchaseOrderLineSchema (all fields optional)
- listPurchaseOrderLinesSchema (page/limit)
- createPoReceiptSchema (requires lines array min 1 with po_line_id + quantity_received)
- listPoReceiptsSchema (page/limit)
- approvePurchaseOrderSchema (optional notes)
- sendPurchaseOrderSchema (optional notes)

---

## Module 17: Change Order Management (V1 Foundation)

### Database Tables
- **change_orders**: Core change order records. Columns: id, company_id, job_id, co_number (varchar 20), title (varchar 255), description (text), change_type (owner_requested/field_condition/design_change/regulatory/allowance/credit), status (draft/pending_approval/approved/rejected/voided), requested_by_type (builder/client/vendor), requested_by_id, amount (numeric 15,2), cost_impact (numeric 15,2), schedule_impact_days (int default 0), approval_chain (jsonb), approved_by, approved_at, client_approved (boolean default false), client_approved_at, document_id, budget_id, created_by, created_at, updated_at, deleted_at (soft delete). RLS enabled. Indexes on company_id, job_id, status, (company_id, co_number), created_at DESC, deleted_at partial.
- **change_order_items**: Line items for cost breakdown on a change order. Columns: id, change_order_id (FK cascade), description (text), cost_code_id, quantity (numeric 10,3 default 1), unit_price (numeric 15,2), amount (numeric 15,2), markup_pct (numeric 5,2 default 0), markup_amount (numeric 15,2 default 0), total (numeric 15,2 default 0), vendor_id, sort_order (int default 0), created_at, updated_at. RLS enabled. Indexes on change_order_id, cost_code_id, vendor_id.
- **change_order_history**: Audit trail for change order state transitions. Columns: id, change_order_id (FK cascade), action (created/submitted/approved/rejected/voided/revised/client_approved), previous_status, new_status, details (jsonb), performed_by, created_at. RLS enabled. Indexes on change_order_id, action.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/change-orders | List change orders filtered by job_id/status/change_type/q. Paginated. Excludes soft-deleted. Searches title and co_number via OR ilike. |
| POST | /api/v2/change-orders | Create new change order in draft status. Records "created" history entry. Returns 201. |
| GET | /api/v2/change-orders/:id | Get change order with items_count and full history array. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/change-orders/:id | Update change order. Only draft or pending_approval COs can be updated (403 otherwise). Records "revised" history entry with list of updated fields. |
| DELETE | /api/v2/change-orders/:id | Soft delete. Only draft COs can be deleted (403 otherwise). Sets deleted_at timestamp. |
| POST | /api/v2/change-orders/:id/submit | Transition draft -> pending_approval. Validates current status is draft (403 otherwise). Records "submitted" history entry. Optional notes in details. |
| POST | /api/v2/change-orders/:id/approve | Transition pending_approval -> approved. Validates current status is pending_approval (403 otherwise). Sets approved_by, approved_at. Optional client_approved flag. Records "approved" history entry. |
| GET | /api/v2/change-orders/:id/items | List items for a change order. Verifies CO belongs to company. Ordered by sort_order asc. Paginated. |
| POST | /api/v2/change-orders/:id/items | Add item to change order. Only draft or pending_approval COs (403 otherwise). Returns 201. |
| PUT | /api/v2/change-orders/:id/items/:itemId | Update item. Only draft or pending_approval COs (403 otherwise). Partial update. |
| DELETE | /api/v2/change-orders/:id/items/:itemId | Hard delete item. Only draft or pending_approval COs (403 otherwise). |

### Type System
- 4 type unions: ChangeType (6 values), ChangeOrderStatus (5 values), RequesterType (3 values), ChangeOrderHistoryAction (7 values)
- 3 interfaces: ChangeOrder, ChangeOrderItem, ChangeOrderHistory
- 4 constant arrays with value/label pairs: CHANGE_TYPES, CHANGE_ORDER_STATUSES, REQUESTER_TYPES, CHANGE_ORDER_HISTORY_ACTIONS

### Validation Schemas (Zod)
- 4 enum schemas: changeTypeEnum, changeOrderStatusEnum, requesterTypeEnum, changeOrderHistoryActionEnum
- listChangeOrdersSchema (page/limit/job_id/status/change_type/q)
- createChangeOrderSchema (job_id/co_number/title required + optional description/change_type/status/amounts/etc, defaults: status=draft, change_type=owner_requested, amount=0, schedule_impact_days=0)
- updateChangeOrderSchema (all fields optional)
- submitChangeOrderSchema (optional notes)
- approveChangeOrderSchema (optional notes, optional client_approved boolean)
- listChangeOrderItemsSchema (page/limit, limit defaults to 50)
- createChangeOrderItemSchema (description required + optional quantity/unit_price/amount/markup_pct/markup_amount/total/vendor_id/sort_order/cost_code_id, defaults: quantity=1, all amounts=0)
- updateChangeOrderItemSchema (all fields optional)

## Module 16: QuickBooks & Accounting Integration (V1 Foundation)

### Database Tables
- **accounting_connections**: Stores OAuth connection state per provider per company. Columns: provider (quickbooks_online/xero/sage), status (disconnected/connected/syncing/error), encrypted tokens, external company identifiers, sync_direction (push/pull/bidirectional), settings JSONB. UNIQUE constraint on (company_id, provider). Soft delete via deleted_at.
- **sync_mappings**: Links internal entity UUIDs to external system IDs. Supports vendor/client/account/bill/invoice/payment entity types. UNIQUE constraint on (connection_id, entity_type, internal_id). Tracks sync_status (synced/pending/error/conflict) per mapping.
- **sync_logs**: Immutable audit trail of every sync operation. Tracks entities_processed/created/updated/failed counts, sync_type (full/incremental/manual), direction (push/pull), status (started/completed/partial/failed).
- **sync_conflicts**: Records where platform and external data differ. Stores both internal_data and external_data as JSONB plus field_conflicts array. Resolution options: pending/use_internal/use_external/manual/skipped. Tracks resolver and resolution timestamp.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/integrations/connections | List connections filtered by provider/status. Paginated. Excludes soft-deleted. |
| POST | /api/v2/integrations/connections | Create new connection. Checks for duplicate provider per company (409 if exists). Defaults status to disconnected. |
| GET | /api/v2/integrations/connections/:id | Get connection with mapping counts, recent sync logs (last 5), pending conflict count. |
| PUT | /api/v2/integrations/connections/:id | Update connection settings, status, sync_direction. Verifies ownership. |
| DELETE | /api/v2/integrations/connections/:id | Soft delete: clears tokens, sets status=disconnected, sets deleted_at. |
| POST | /api/v2/integrations/connections/:id/sync | Trigger manual sync. Validates connection is not disconnected or already syncing (409). Creates sync_log entry with status=started. Returns 202 with sync_log_id. |
| GET | /api/v2/integrations/mappings | List mappings filtered by connection_id/entity_type/sync_status. Paginated. |
| POST | /api/v2/integrations/mappings | Create mapping. Validates connection ownership. Checks for duplicate (409). Sets initial sync_status=pending. |
| PUT | /api/v2/integrations/mappings/:id | Update external_id, external_name, sync_status, error_message. |
| DELETE | /api/v2/integrations/mappings/:id | Hard delete mapping record. |
| GET | /api/v2/integrations/sync-logs | List sync logs filtered by connection_id/sync_type/direction/status. Ordered by started_at desc. Paginated. |
| GET | /api/v2/integrations/conflicts | List conflicts filtered by connection_id/entity_type/resolution. Paginated. |
| POST | /api/v2/integrations/conflicts/:id/resolve | Resolve conflict. Rejects if already resolved (409). Rejects "pending" as resolution value. Sets resolved_by and resolved_at. |

### Type System
- 9 type unions: AccountingProvider, ConnectionStatus, SyncDirection, SyncEntityType, SyncStatus, SyncLogStatus, SyncLogType, SyncLogDirection, ConflictResolution
- 4 interfaces: AccountingConnection, SyncMapping, SyncLog, SyncConflict
- 9 constant arrays with value/label pairs for UI dropdowns

### Validation Schemas (Zod)
- 9 enum schemas mapping to type unions
- listConnectionsSchema, createConnectionSchema, updateConnectionSchema
- listMappingsSchema, createMappingSchema, updateMappingSchema
- listSyncLogsSchema, triggerSyncSchema (defaults: manual, push)
- listConflictsSchema, resolveConflictSchema (excludes "pending" from valid resolutions)

## Module 19: Financial Reporting (V1 Foundation)

### Database Tables
- **report_definitions**: Stores saved report definitions per company. Columns: name VARCHAR(200), report_type (profit_loss/balance_sheet/cash_flow/wip/job_cost/ar_aging/ap_aging/budget_vs_actual/retainage/custom), description TEXT, config JSONB, is_system BOOLEAN (for system-provided templates), is_active BOOLEAN (soft delete mechanism). Indexes on company_id, (company_id, report_type), (company_id, is_active). RLS enabled.
- **report_snapshots**: Immutable snapshot of a generated report. Links to report_definition_id. Stores period_start/period_end DATE, snapshot_data JSONB (full report output), generated_by UUID, generated_at TIMESTAMPTZ. Indexes on company_id, (company_id, report_definition_id), (company_id, period_start, period_end). RLS enabled.
- **report_schedules**: Configures automatic report generation. Links to report_definition_id. frequency (daily/weekly/monthly/quarterly), day_of_week INT (0-6), day_of_month INT (1-31), recipients JSONB array of {email, name}, is_active BOOLEAN, last_run_at/next_run_at timestamps. Indexes on company_id, (company_id, report_definition_id), (company_id, is_active), next_run_at WHERE is_active=true. RLS enabled.
- **financial_periods**: Tracks fiscal periods with lock status. period_name VARCHAR(50), period_start/period_end DATE, status (open/closed/locked), fiscal_year INT, fiscal_quarter INT (1-4), closed_by UUID, closed_at TIMESTAMPTZ. UNIQUE on (company_id, period_name). Indexes on company_id, (company_id, period_start, period_end), (company_id, status), (company_id, fiscal_year, fiscal_quarter). RLS enabled.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/reports/definitions | List report definitions. Filterable by report_type, is_active, q (name search). Paginated. |
| POST | /api/v2/reports/definitions | Create report definition. Requires name and report_type. Sets created_by to current user. Returns 201. |
| GET | /api/v2/reports/definitions/:id | Get single report definition by ID. Scoped to company_id. |
| PUT | /api/v2/reports/definitions/:id | Update report definition fields (name, report_type, description, config, is_active). Partial updates supported. |
| DELETE | /api/v2/reports/definitions/:id | Soft delete: sets is_active=false. |
| POST | /api/v2/reports/definitions/:id/generate | Generate a report snapshot. Requires period_start/period_end. Verifies definition exists and is active (403 if inactive). Creates report_snapshots row. Returns 201. V1: stores placeholder snapshot data. |
| GET | /api/v2/reports/snapshots | List report snapshots. Filterable by report_definition_id, period_start (gte), period_end (lte). Ordered by generated_at desc. Paginated. |
| GET | /api/v2/reports/snapshots/:id | Get single snapshot by ID. Scoped to company_id. |
| GET | /api/v2/reports/schedules | List report schedules. Filterable by report_definition_id, is_active. Paginated. |
| POST | /api/v2/reports/schedules | Create schedule. Requires report_definition_id, frequency, recipients (min 1). Validates definition exists. Returns 201. |
| PUT | /api/v2/reports/schedules/:id | Update schedule (frequency, day_of_week, day_of_month, recipients, is_active). Partial updates. |
| DELETE | /api/v2/reports/schedules/:id | Hard delete schedule record. |
| GET | /api/v2/financial-periods | List financial periods. Filterable by status, fiscal_year. Ordered by period_start desc. Paginated. |
| POST | /api/v2/financial-periods | Create financial period. Requires period_name, period_start, period_end, fiscal_year. Always created with status=open. Returns 201. |
| GET | /api/v2/financial-periods/:id | Get single financial period by ID. |
| PUT | /api/v2/financial-periods/:id | Update period fields. Rejects if status=locked (403). Partial updates. |
| POST | /api/v2/financial-periods/:id/close | Close a financial period. Rejects if already closed or locked (403). Sets status=closed, closed_by, closed_at. |

### Type System
- 3 type unions: ReportType (10 values), ScheduleFrequency (4 values), PeriodStatus (3 values)
- 5 interfaces: ReportDefinition, ReportSnapshot, ReportSchedule, ReportRecipient, FinancialPeriod
- 3 constant arrays with value/label pairs: REPORT_TYPES (10), SCHEDULE_FREQUENCIES (4), PERIOD_STATUSES (3)

### Validation Schemas (Zod)
- 3 enum schemas: reportTypeEnum, scheduleFrequencyEnum, periodStatusEnum
- listReportDefinitionsSchema, createReportDefinitionSchema, updateReportDefinitionSchema
- generateReportSchema (requires YYYY-MM-DD date range, optional parameters)
- listReportSnapshotsSchema (with UUID validation on report_definition_id)
- listReportSchedulesSchema, createReportScheduleSchema (min 1 recipient, email validation, day_of_week 0-6, day_of_month 1-31), updateReportScheduleSchema
- listFinancialPeriodsSchema, createFinancialPeriodSchema (YYYY-MM-DD dates, fiscal_year 2000-2100, fiscal_quarter 1-4), updateFinancialPeriodSchema
- closeFinancialPeriodSchema (optional notes)
