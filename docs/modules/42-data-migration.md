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

## Open Questions

1. Should email-based quote import (Gap #65) be a Phase 1 feature or deferred to Phase 2 with AI parsing?
2. What is the maximum file upload size for a single migration job? (Proposed: 500MB)
3. Should we offer a "white glove" managed migration as a paid service with SLA?
4. How do we handle imports from platforms that don't offer structured export (screen scraping vs. manual CSV)?
5. Should migration reconciliation reports be exportable for auditor review?
6. What is the retention period for rollback snapshots before they are purged?
