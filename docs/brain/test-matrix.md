# Test Matrix — RossOS Construction Intelligence Platform

## Module 17: Change Order Management

### Acceptance Tests (33 tests in `tests/acceptance/17-change-orders.acceptance.test.ts`)

| Category | Test | Status |
|----------|------|--------|
| **Types** | ChangeType has 6 values | PASS |
| **Types** | ChangeOrderStatus has 5 values | PASS |
| **Types** | RequesterType has 3 values | PASS |
| **Types** | ChangeOrderHistoryAction has 7 values | PASS |
| **Types** | ChangeOrder interface has all required fields | PASS |
| **Types** | ChangeOrderItem interface has all required fields | PASS |
| **Types** | ChangeOrderHistory interface has all required fields | PASS |
| **Constants** | CHANGE_TYPES has 6 entries with value and label | PASS |
| **Constants** | CHANGE_ORDER_STATUSES has 5 entries with value and label | PASS |
| **Constants** | REQUESTER_TYPES has 3 entries | PASS |
| **Constants** | CHANGE_ORDER_HISTORY_ACTIONS has 7 entries | PASS |
| **Enum Schemas** | changeTypeEnum accepts all 6 change types | PASS |
| **Enum Schemas** | changeTypeEnum rejects invalid type | PASS |
| **Enum Schemas** | changeOrderStatusEnum accepts all 5 statuses | PASS |
| **Enum Schemas** | changeOrderStatusEnum rejects invalid status | PASS |
| **Enum Schemas** | requesterTypeEnum accepts all 3 types | PASS |
| **Enum Schemas** | changeOrderHistoryActionEnum accepts all 7 actions | PASS |
| **CO Schemas** | listChangeOrdersSchema accepts valid params | PASS |
| **CO Schemas** | listChangeOrdersSchema rejects limit > 100 | PASS |
| **CO Schemas** | listChangeOrdersSchema accepts filters | PASS |
| **CO Schemas** | createChangeOrderSchema accepts valid change order | PASS |
| **CO Schemas** | createChangeOrderSchema requires job_id, co_number, title | PASS |
| **CO Schemas** | createChangeOrderSchema rejects co_number > 20 chars | PASS |
| **CO Schemas** | createChangeOrderSchema rejects title > 255 chars | PASS |
| **CO Schemas** | updateChangeOrderSchema accepts partial updates | PASS |
| **Action Schemas** | submitChangeOrderSchema accepts empty object | PASS |
| **Action Schemas** | submitChangeOrderSchema accepts notes | PASS |
| **Action Schemas** | approveChangeOrderSchema accepts client_approved flag | PASS |
| **Item Schemas** | createChangeOrderItemSchema accepts valid item | PASS |
| **Item Schemas** | createChangeOrderItemSchema requires description | PASS |
| **Item Schemas** | createChangeOrderItemSchema has correct defaults | PASS |
| **Item Schemas** | updateChangeOrderItemSchema accepts partial updates | PASS |
| **Item Schemas** | listChangeOrderItemsSchema accepts valid params with defaults | PASS |

---

## Module 18: Purchase Orders

### Acceptance Tests (30 tests in `tests/acceptance/18-purchase-orders.acceptance.test.ts`)

| Category | Test | Status |
|----------|------|--------|
| **Types** | PurchaseOrderStatus has 8 values | PASS |
| **Types** | PurchaseOrder interface has all required fields | PASS |
| **Types** | PurchaseOrderLine interface has all required fields | PASS |
| **Types** | PoReceipt interface has all required fields | PASS |
| **Types** | PoReceiptLine interface has all required fields | PASS |
| **Constants** | PO_STATUSES has 8 entries with value/label | PASS |
| **Constants** | PO_STATUSES includes all expected status values | PASS |
| **Enum Schemas** | purchaseOrderStatusEnum accepts all 8 statuses | PASS |
| **Enum Schemas** | purchaseOrderStatusEnum rejects invalid status | PASS |
| **List Schemas** | listPurchaseOrdersSchema accepts valid params | PASS |
| **List Schemas** | listPurchaseOrdersSchema rejects limit > 100 | PASS |
| **List Schemas** | listPurchaseOrdersSchema accepts optional filters | PASS |
| **Create Schemas** | createPurchaseOrderSchema accepts valid PO | PASS |
| **Create Schemas** | createPurchaseOrderSchema requires job_id, vendor_id, po_number, title | PASS |
| **Create Schemas** | createPurchaseOrderSchema validates delivery_date format | PASS |
| **Update Schemas** | updatePurchaseOrderSchema accepts partial updates | PASS |
| **Update Schemas** | updatePurchaseOrderSchema rejects invalid status | PASS |
| **Line Schemas** | createPurchaseOrderLineSchema accepts valid line | PASS |
| **Line Schemas** | createPurchaseOrderLineSchema requires description | PASS |
| **Line Schemas** | createPurchaseOrderLineSchema rejects negative quantity | PASS |
| **Line Schemas** | updatePurchaseOrderLineSchema accepts partial updates | PASS |
| **Line Schemas** | listPurchaseOrderLinesSchema accepts valid params | PASS |
| **Receipt Schemas** | createPoReceiptSchema requires at least one line | PASS |
| **Receipt Schemas** | createPoReceiptSchema accepts valid receipt with lines | PASS |
| **Receipt Schemas** | createPoReceiptSchema rejects non-positive quantity_received | PASS |
| **Receipt Schemas** | listPoReceiptsSchema accepts valid params | PASS |
| **Action Schemas** | approvePurchaseOrderSchema accepts optional notes | PASS |
| **Action Schemas** | approvePurchaseOrderSchema accepts empty object | PASS |
| **Action Schemas** | sendPurchaseOrderSchema accepts optional notes | PASS |
| **Action Schemas** | sendPurchaseOrderSchema accepts empty object | PASS |

---

## Module 16: QuickBooks & Accounting Integration

### Acceptance Tests (57 tests in `tests/acceptance/16-integrations.acceptance.test.ts`)

| Category | Test | Status |
|----------|------|--------|
| **Types** | AccountingProvider has 3 providers | PASS |
| **Types** | ConnectionStatus has 4 statuses | PASS |
| **Types** | SyncDirection has 3 directions | PASS |
| **Types** | SyncEntityType has 6 entity types | PASS |
| **Types** | SyncStatus has 4 statuses | PASS |
| **Types** | SyncLogStatus has 4 values | PASS |
| **Types** | ConflictResolution has 5 values | PASS |
| **Types** | AccountingConnection interface has all required fields | PASS |
| **Types** | SyncMapping interface has all required fields | PASS |
| **Types** | SyncLog interface has all required fields | PASS |
| **Types** | SyncConflict interface has all required fields | PASS |
| **Constants** | ACCOUNTING_PROVIDERS has 3 entries with value/label | PASS |
| **Constants** | CONNECTION_STATUSES has 4 entries | PASS |
| **Constants** | SYNC_DIRECTIONS has 3 entries | PASS |
| **Constants** | SYNC_ENTITY_TYPES has 6 entries | PASS |
| **Constants** | SYNC_STATUSES has 4 entries | PASS |
| **Constants** | SYNC_LOG_STATUSES has 4 entries | PASS |
| **Constants** | SYNC_LOG_TYPES has 3 entries | PASS |
| **Constants** | SYNC_LOG_DIRECTIONS has 2 entries | PASS |
| **Constants** | CONFLICT_RESOLUTIONS has 5 entries | PASS |
| **Enum Schemas** | accountingProviderEnum accepts 3 providers | PASS |
| **Enum Schemas** | accountingProviderEnum rejects invalid provider | PASS |
| **Enum Schemas** | connectionStatusEnum accepts 4 statuses | PASS |
| **Enum Schemas** | syncDirectionEnum accepts 3 directions | PASS |
| **Enum Schemas** | syncEntityTypeEnum accepts 6 types | PASS |
| **Enum Schemas** | syncEntityTypeEnum rejects invalid type | PASS |
| **Enum Schemas** | syncStatusEnum accepts 4 statuses | PASS |
| **Enum Schemas** | syncLogStatusEnum accepts 4 statuses | PASS |
| **Enum Schemas** | syncLogTypeEnum accepts 3 types | PASS |
| **Enum Schemas** | syncLogDirectionEnum accepts push/pull | PASS |
| **Enum Schemas** | conflictResolutionEnum accepts 5 values | PASS |
| **Enum Schemas** | conflictResolutionEnum rejects invalid resolution | PASS |
| **Connection Schemas** | listConnectionsSchema accepts valid params | PASS |
| **Connection Schemas** | listConnectionsSchema accepts provider filter | PASS |
| **Connection Schemas** | listConnectionsSchema rejects invalid provider | PASS |
| **Connection Schemas** | listConnectionsSchema rejects limit > 100 | PASS |
| **Connection Schemas** | createConnectionSchema requires provider | PASS |
| **Connection Schemas** | createConnectionSchema accepts valid connection | PASS |
| **Connection Schemas** | createConnectionSchema defaults sync_direction | PASS |
| **Connection Schemas** | updateConnectionSchema accepts partial updates | PASS |
| **Connection Schemas** | updateConnectionSchema rejects invalid status | PASS |
| **Mapping Schemas** | listMappingsSchema accepts valid params with filters | PASS |
| **Mapping Schemas** | createMappingSchema requires mandatory fields | PASS |
| **Mapping Schemas** | createMappingSchema accepts valid mapping | PASS |
| **Mapping Schemas** | createMappingSchema rejects invalid entity type | PASS |
| **Mapping Schemas** | updateMappingSchema accepts partial update | PASS |
| **Mapping Schemas** | updateMappingSchema allows null error_message | PASS |
| **Sync Schemas** | listSyncLogsSchema accepts all filters | PASS |
| **Sync Schemas** | triggerSyncSchema defaults to manual push | PASS |
| **Sync Schemas** | triggerSyncSchema accepts entity type filter | PASS |
| **Sync Schemas** | triggerSyncSchema rejects invalid entity types | PASS |
| **Conflict Schemas** | listConflictsSchema accepts resolution filter | PASS |
| **Conflict Schemas** | listConflictsSchema accepts entity_type filter | PASS |
| **Conflict Schemas** | resolveConflictSchema requires resolution | PASS |
| **Conflict Schemas** | resolveConflictSchema accepts valid resolutions | PASS |
| **Conflict Schemas** | resolveConflictSchema rejects pending as resolution | PASS |
| **Conflict Schemas** | resolveConflictSchema rejects invalid resolution | PASS |

---

## Module 19: Financial Reporting

### Acceptance Tests (41 tests in `tests/acceptance/19-financial-reporting.acceptance.test.ts`)

| Category | Test | Status |
|----------|------|--------|
| **Types** | ReportType has 10 values | PASS |
| **Types** | ScheduleFrequency has 4 values | PASS |
| **Types** | PeriodStatus has 3 values | PASS |
| **Types** | ReportDefinition interface has all required fields | PASS |
| **Types** | ReportSnapshot interface has all required fields | PASS |
| **Types** | ReportSchedule interface has all required fields | PASS |
| **Types** | FinancialPeriod interface has all required fields | PASS |
| **Constants** | REPORT_TYPES has 10 entries with value/label | PASS |
| **Constants** | REPORT_TYPES includes all spec report types | PASS |
| **Constants** | SCHEDULE_FREQUENCIES has 4 entries with value/label | PASS |
| **Constants** | PERIOD_STATUSES has 3 entries with value/label | PASS |
| **Definition Schemas** | reportTypeEnum accepts all 10 types | PASS |
| **Definition Schemas** | reportTypeEnum rejects invalid type | PASS |
| **Definition Schemas** | listReportDefinitionsSchema accepts valid params | PASS |
| **Definition Schemas** | listReportDefinitionsSchema rejects limit > 100 | PASS |
| **Definition Schemas** | createReportDefinitionSchema accepts valid definition | PASS |
| **Definition Schemas** | createReportDefinitionSchema requires name and report_type | PASS |
| **Definition Schemas** | createReportDefinitionSchema rejects name > 200 chars | PASS |
| **Definition Schemas** | updateReportDefinitionSchema accepts partial updates | PASS |
| **Generation Schemas** | generateReportSchema accepts valid date range | PASS |
| **Generation Schemas** | generateReportSchema requires valid date format | PASS |
| **Generation Schemas** | generateReportSchema accepts optional parameters | PASS |
| **Snapshot Schemas** | listReportSnapshotsSchema accepts valid params | PASS |
| **Snapshot Schemas** | listReportSnapshotsSchema rejects invalid UUID | PASS |
| **Schedule Schemas** | scheduleFrequencyEnum accepts all 4 frequencies | PASS |
| **Schedule Schemas** | createReportScheduleSchema accepts valid schedule | PASS |
| **Schedule Schemas** | createReportScheduleSchema requires at least one recipient | PASS |
| **Schedule Schemas** | createReportScheduleSchema validates recipient email | PASS |
| **Schedule Schemas** | createReportScheduleSchema validates day_of_week range 0-6 | PASS |
| **Schedule Schemas** | createReportScheduleSchema validates day_of_month range 1-31 | PASS |
| **Schedule Schemas** | updateReportScheduleSchema accepts partial updates | PASS |
| **Period Schemas** | periodStatusEnum accepts all 3 statuses | PASS |
| **Period Schemas** | periodStatusEnum rejects invalid status | PASS |
| **Period Schemas** | listFinancialPeriodsSchema accepts valid params | PASS |
| **Period Schemas** | createFinancialPeriodSchema accepts valid period | PASS |
| **Period Schemas** | createFinancialPeriodSchema requires all mandatory fields | PASS |
| **Period Schemas** | createFinancialPeriodSchema validates date format | PASS |
| **Period Schemas** | createFinancialPeriodSchema validates fiscal_quarter range | PASS |
| **Period Schemas** | updateFinancialPeriodSchema accepts partial updates | PASS |
| **Period Schemas** | closeFinancialPeriodSchema accepts optional notes | PASS |
| **Period Schemas** | closeFinancialPeriodSchema accepts empty body | PASS |
