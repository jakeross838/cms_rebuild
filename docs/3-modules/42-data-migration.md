# Module 42: Data Migration Tools

**Phase:** 6 - Scale & Sell
**Status:** SPEC COMPLETE
**Covers Gap Items:** 61-75 (Section 2: Data Migration)

---

## Overview

Data migration is the single biggest friction point for competitive switching. This module provides self-service and assisted import tools for bringing data from Buildertrend, CoConstruct, Procore, JobTread, UDA, Newstar, QuickBooks (Desktop and Online), Excel/CSV, Google Sheets, Airtable, Monday.com, and email. It includes field mapping, validation, duplicate detection, reconciliation reporting, rollback capability, and parallel-run support so builders can verify accuracy before cutting over.

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 61 | Import from Buildertrend -- what maps, what doesn't | Buildertrend adapter with documented field mapping matrix; unmapped fields flagged |
| 62 | Import from CoConstruct, Procore, JobTread, UDA, Newstar | Dedicated adapters per platform with export-format parsers |
| 63 | Import from QuickBooks Desktop AND Online | QB Desktop: IIF/QBW file parser. QB Online: OAuth API direct pull |
| 64 | Import from Excel/CSV -- "I track everything in spreadsheets" | Universal CSV/XLSX importer with column-mapping UI |
| 65 | Import from email (parse vendor quotes from history) | Email forwarding address + AI-powered quote extraction (Phase 2 enhancement) |
| 66 | Import from Google Sheets, Airtable, Monday.com | OAuth connectors for each; map columns to platform entities |
| 67 | Data mapping when source uses different codes/categories | Interactive field mapping UI with suggested mappings and custom transform rules |
| 68 | Data quality issues during import (duplicates, missing, inconsistent) | Validation engine runs pre-import checks; issues shown in review screen |
| 69 | Typical migration timeline (hours, days, weeks?) | Dashboard shows estimated time; small imports <1hr, large imports staged overnight |
| 70 | Self-service vs. team-required migration | Both: self-service wizard for standard imports, managed migration service for complex cases |
| 71 | Partial migrations (vendors and budgets but not daily logs) | Entity-level toggle: select which data types to import |
| 72 | Imported data that doesn't pass validation | Three modes: skip invalid rows, log errors and continue, or reject entire batch |
| 73 | Import photos and documents with metadata | Document import with metadata mapping; photos linked to projects/phases by filename convention |
| 74 | Migration accuracy verification | Reconciliation report: source record count vs. imported count, financial totals comparison |
| 75 | Active projects vs. completed projects migration priority | Priority toggle: import active projects first, completed projects queued as background job |

---

## Detailed Requirements

### Platform-Specific Adapters

Each adapter handles the unique export format of its source system:

| Source Platform | Export Format | Supported Entities |
|----------------|---------------|-------------------|
| Buildertrend | CSV export bundle | Projects, budgets, schedules, vendors, clients, change orders, selections |
| CoConstruct | CSV/API | Projects, estimates, selections, specs, vendors |
| Procore | API + CSV | Projects, budgets, RFIs, submittals, daily logs, vendors, photos |
| JobTread | CSV export | Projects, estimates, contacts, vendors |
| UDA ConstructionSuite | XML/CSV | Projects, estimates, schedules, contacts |
| Newstar | CSV export | Projects, budgets, contacts |
| QuickBooks Desktop | IIF / QBW / CSV | Chart of accounts, vendors, customers, invoices, bills, payments |
| QuickBooks Online | OAuth API | Same as Desktop, pulled via live API |
| Excel/CSV | .xlsx / .csv | Any entity via column mapping |
| Google Sheets | OAuth API | Any entity via column mapping |
| Airtable | OAuth API | Any entity via field mapping |
| Monday.com | OAuth API | Projects, tasks, contacts |

### Field Mapping Interface

- Source columns displayed on left, target fields on right
- Auto-suggested mappings based on column name similarity
- Custom transform rules: concatenate fields, split fields, value mapping (e.g., "Active" -> "in_progress")
- Unmapped source columns shown with "ignore" or "store as custom field" options
- Mapping templates saveable and reusable for recurring imports

#### Edge Cases & What-If Scenarios

1. **Field mapping complexity across source systems:** Different source systems use fundamentally different data models, and the mapping interface must handle non-trivial transformations. Required behavior: (a) support many-to-one mapping (concatenate source "First Name" + "Last Name" into target "display_name"), (b) support one-to-many mapping (split source "Full Address" into target "address_line1", "city", "state", "zip"), (c) support value transformation with lookup tables (source status "Active" maps to target "in_progress", source status "On Hold" maps to target "paused"), (d) provide an expression builder for complex transforms (e.g., "if source.type == 'Sub' then 'vendor' else 'client'"), (e) show a live preview of the first 5 mapped rows so the builder can verify the transform is correct before committing, (f) warn when a required target field has no source mapping and no default value, and (g) support "store as custom field" for source columns that have no natural target field, preserving data that would otherwise be lost.

### Validation Engine

Pre-import validation checks:
- Required field completeness
- Data type validation (dates, numbers, emails)
- Referential integrity (vendor referenced in budget exists in vendor import)
- Duplicate detection (name + address matching, fuzzy matching threshold configurable)
- Financial reconciliation (imported totals match source system totals)
- Character encoding normalization (UTF-8)

### Import Execution

- **Preview Mode**: First 50 rows processed and displayed for review before committing
- **Batch Processing**: Large imports broken into batches of 500 records
- **Progress Tracking**: Real-time progress bar with records processed / total / errors
- **Error Handling**: Configurable per import -- skip, log, or abort on error
- **Background Processing**: Large imports run as background jobs with email notification on completion

#### Edge Cases & What-If Scenarios

1. **Mid-process migration failure:** When a data migration fails mid-process (database timeout, network failure, source file corruption mid-read, or server restart), the system must handle the partial state gracefully. Required behavior: (a) each batch of 500 records is committed in its own database transaction — if a batch fails, previously committed batches remain intact, (b) the migration job status is updated to `failed` with a detailed error log indicating which batch failed and why, (c) the system records the last successfully processed row number so the migration can be resumed from that point (not restarted from the beginning), (d) a "Resume" action is available on failed jobs that picks up from the last successful batch, (e) if the failure is unrecoverable (source file corrupted), the admin can roll back all completed batches for that job, and (f) the builder is notified via email and in-app notification when a background migration fails, with a link to the job status page showing the error details and recommended next steps.

2. **Corrupt or inconsistent source data:** When the data from the source system is corrupt or internally inconsistent (e.g., invoices referencing non-existent vendors, budgets with negative totals that should be positive, date fields in mixed formats, duplicate records with conflicting data), the validation engine must: (a) detect and categorize each issue by severity (error = blocks import, warning = allows import with flag, info = informational note), (b) present all issues in a review screen grouped by entity type and severity before the builder commits, (c) provide a suggested fix for each issue where possible (e.g., "Vendor 'ABC Plumbing' referenced in 12 invoices does not exist in the vendor import — create a placeholder vendor?"), (d) allow the builder to fix issues in the mapping UI without re-uploading the source file, (e) support a "best effort" import mode that imports clean records and quarantines problematic records for manual review, and (f) generate a downloadable error report (CSV) listing every skipped or quarantined record with the reason, so the builder can fix the source data and re-import.

### Rollback Capability

- Each import creates a rollback snapshot (import_batch_id on all created records)
- Full rollback deletes all records from a specific import batch
- Partial rollback: select specific entity types to roll back
- Rollback window: 30 days after import (configurable)

### Parallel-Run Support (Gap #60)

- Side-by-side comparison mode: enter data in both systems for a defined period
- Comparison report highlights discrepancies between old system and new platform
- Checklist for cutover readiness: all active projects migrated, financial totals reconciled, team trained

---

## Database Tables

```
migration_jobs
  id              UUID PK
  builder_id      UUID FK -> builders
  initiated_by    UUID FK -> users
  source_platform VARCHAR(50)  -- 'buildertrend', 'coconstruct', 'csv', etc.
  status          VARCHAR(20)  -- 'mapping', 'validating', 'importing', 'complete', 'failed', 'rolled_back'
  entity_types    TEXT[]       -- ['projects', 'vendors', 'budgets']
  total_records   INT
  imported_count  INT DEFAULT 0
  skipped_count   INT DEFAULT 0
  error_count     INT DEFAULT 0
  started_at      TIMESTAMPTZ
  completed_at    TIMESTAMPTZ NULL
  rollback_at     TIMESTAMPTZ NULL
  error_log       JSONB
  metadata        JSONB  -- source file names, mapping template used

migration_field_mappings
  id              UUID PK
  job_id          UUID FK -> migration_jobs
  entity_type     VARCHAR(50)
  source_column   VARCHAR(100)
  target_field    VARCHAR(100) NULL  -- NULL if unmapped/ignored
  transform_rule  JSONB NULL  -- {type: 'value_map', map: {'Active': 'in_progress'}}
  is_ignored      BOOLEAN DEFAULT false

migration_mapping_templates
  id              UUID PK
  builder_id      UUID FK -> builders
  name            VARCHAR(100)
  source_platform VARCHAR(50)
  entity_type     VARCHAR(50)
  mappings        JSONB
  created_at      TIMESTAMPTZ

migration_validation_results
  id              UUID PK
  job_id          UUID FK -> migration_jobs
  row_number      INT
  entity_type     VARCHAR(50)
  severity        VARCHAR(10)  -- 'error', 'warning', 'info'
  field_name      VARCHAR(100)
  message         TEXT
  source_value    TEXT
  suggested_fix   TEXT NULL

migration_reconciliation
  id              UUID PK
  job_id          UUID FK -> migration_jobs
  entity_type     VARCHAR(50)
  source_count    INT
  imported_count  INT
  source_total    DECIMAL(15,2) NULL  -- for financial entities
  imported_total  DECIMAL(15,2) NULL
  discrepancies   JSONB
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/migration/jobs` | Create a new migration job |
| GET | `/api/v1/migration/jobs` | List migration jobs for current builder |
| GET | `/api/v1/migration/jobs/:id` | Get job status and details |
| POST | `/api/v1/migration/jobs/:id/upload` | Upload source files for the job |
| GET | `/api/v1/migration/jobs/:id/mappings` | Get auto-suggested field mappings |
| PUT | `/api/v1/migration/jobs/:id/mappings` | Save customized field mappings |
| POST | `/api/v1/migration/jobs/:id/validate` | Run validation on mapped data |
| GET | `/api/v1/migration/jobs/:id/validation-results` | Get validation results |
| POST | `/api/v1/migration/jobs/:id/preview` | Preview first 50 records |
| POST | `/api/v1/migration/jobs/:id/execute` | Execute the import |
| POST | `/api/v1/migration/jobs/:id/rollback` | Roll back an import |
| GET | `/api/v1/migration/jobs/:id/reconciliation` | Get reconciliation report |
| GET | `/api/v1/migration/templates` | List saved mapping templates |
| POST | `/api/v1/migration/templates` | Save a mapping template |

---

## Dependencies

- **Module 3: Core Data Model** -- target schema for all imported entities
- **Module 10: Contact/Vendor Management** -- vendor and client import targets
- **Module 9: Budget & Cost Tracking** -- financial data import targets
- **Module 6: Document Storage** -- photo and document import storage
- **Module 41: Onboarding Wizard** -- import path triggered from wizard step 7
- **Module 5: Notification Engine** -- completion/failure notifications

---

## Unusual Business Scenarios — Migration Edge Cases

### Mid-Stream Project Acquisition (GAP-600)
When a builder acquires another builder's in-progress project (not a full company acquisition), the system must support onboarding a project mid-stream:
- **Project import without tenant merge:** The acquired project is imported into the acquiring builder's tenant as a new project. This is a data import, not a tenant merge.
- **Source data flexibility:** The source data may come from another platform (Buildertrend, CoConstruct, spreadsheets), from the selling builder's RossOS export, or from a combination of paper records and digital files. The migration wizard must support importing partial data sets — whatever the acquiring builder can obtain.
- **Mid-project state capture:** Unlike a new project import, a mid-stream acquisition requires capturing the current state: work completed to date, costs incurred, invoices paid, active subcontracts, pending change orders, active RFIs, permit status, inspection history, and schedule progress. The import wizard must support populating these "current state" fields, not just starting from zero.
- **Vendor relationship onboarding:** Vendors from the acquired project may be new to the acquiring builder. The import process must create vendor records for unknown vendors and prompt the builder to verify and enrich them (compliance documents, payment terms, performance baseline).
- **Budget reconciliation:** The acquiring builder needs to establish a new budget baseline reflecting: original contract value, approved changes to date, costs incurred by the previous builder, and remaining scope. The system must support creating a budget that starts from a mid-project snapshot rather than from an estimate.
- **Document import:** All project documents (plans, contracts, permits, inspection records, photos, correspondence) must be importable and organized into the project's folder structure. AI classification assists with auto-filing.

### Builder Sells the Business (GAP-615)
When a builder decides to sell their entire business, the system must support comprehensive business documentation for due diligence:
- **Business overview export:** Generate a complete business data package: total projects (active + completed), total revenue by year, client list, vendor relationships, employee roster, equipment inventory, and pipeline value.
- **Financial history:** Export multi-year financial summaries: revenue, costs, margins by project and in aggregate. WIP schedules, backlog reports, and profitability trends. This data is critical for business valuation.
- **Active project status:** Comprehensive status report for every active project: contract value, % complete, costs to date, projected final cost, projected margin, pending change orders, open RFIs, permit status, and schedule status.
- **Relationship data:** Export vendor performance scores, client satisfaction scores, referral sources, and communication history — these represent business goodwill that a buyer values.
- **Data portability guarantee:** The system must provide a full data export (per Module 3, GAP-012) in a format that allows the new owner to continue operations on the platform (with a new tenant) or migrate to another system. No data is held hostage.
- **Tenant transfer:** If the buyer is also on the platform or plans to be, support a "tenant ownership transfer" that reassigns the builder tenant to the new owner's platform account without data loss.

---

## Open Questions

1. Should email-based quote import (Gap #65) be a Phase 1 feature or deferred to Phase 2 with AI parsing?
2. What is the maximum file upload size for a single migration job? (Proposed: 500MB)
3. Should we offer a "white glove" managed migration as a paid service with SLA?
4. How do we handle imports from platforms that don't offer structured export (screen scraping vs. manual CSV)?
5. Should migration reconciliation reports be exportable for auditor review?
6. What is the retention period for rollback snapshots before they are purged?
