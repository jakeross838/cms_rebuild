# Module 3: Core Data Model

**Phase:** 1 - Foundation
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

The Core Data Model defines the foundational database schema that every other module builds upon. It establishes the patterns for multi-tenant data isolation, audit trails, soft deletes, version history, and referential integrity that are used consistently across the entire platform.

This module does not have a UI of its own. Instead, it provides the shared database tables, base entity patterns, and data access utilities that all other modules consume. Getting this right is critical -- mistakes here propagate everywhere and are expensive to fix later.

All tables follow a strict set of conventions: `builder_id` for tenant isolation, `created_at`/`updated_at`/`created_by`/`updated_by` for audit, `deleted_at` for soft delete, and Row-Level Security (RLS) policies enforcing tenant boundaries at the database level.

---

## Gap Items Addressed

### Section 35: Data Integrity & Error Handling (GAP-537 through GAP-546)

| Gap ID | Description | Sub-topic |
|--------|-------------|-----------|
| GAP-537 | Prevent data leakage between tenants at the database level | RLS Enforcement |
| GAP-538 | Data validation rules configurable per builder | Dynamic Validation |
| GAP-539 | Data migration rollback (import went wrong — undo it) | Import Rollback |
| GAP-540 | Audit trails — who changed what, when, previous value — for every entity | Audit Trail |
| GAP-541 | Concurrent editing (optimistic locking, pessimistic locking, real-time collab) | Concurrency Control |
| GAP-542 | Referential integrity — deleting a vendor cannot break invoices, POs, schedule tasks | Soft Delete & FK |
| GAP-543 | Data consistency during integration sync (reconciliation) | Sync Reconciliation |
| GAP-544 | Data corruption recovery (point-in-time restore) | Backup & Recovery |
| GAP-545 | Performance at scale (500 completed projects — pages still load fast) | Indexing Strategy |
| GAP-546 | Database indexing strategy as data grows | Index Design |

### Section 6: Data Isolation & Privacy (GAP-155 through GAP-169)

| Gap ID | Description | Sub-topic |
|--------|-------------|-----------|
| GAP-155 | Ensure Builder A cannot see Builder B's data | RLS Policies |
| GAP-156 | Shared vendors — each builder sees only their own pricing/performance | Vendor Scoping |
| GAP-158 | Employee moving between builders — no data carries over | User-Tenant Boundary |
| GAP-160 | Encryption at rest and in transit | Encryption |
| GAP-166 | Data anonymization for aggregate analytics | Anonymization |
| GAP-169 | Data retention after customer cancels | Retention Policy |

### Section 1: SaaS Architecture (GAP-001, GAP-005, GAP-010 through GAP-015)

| Gap ID | Description | Sub-topic |
|--------|-------------|-----------|
| GAP-001 | Shared tables with tenant_id filtering | Multi-Tenant Pattern |
| GAP-005 | Tenant data deletion requests (GDPR, CCPA) | Data Deletion |
| GAP-010 | Max concurrent users per tenant / platform — load testing targets | Scalability |
| GAP-011 | Tenant-level backup and restore | Tenant Backup |
| GAP-012 | Tenants export ALL their data at any time | Data Export |
| GAP-013 | Data migration FROM another platform | Data Import |
| GAP-014 | Data residency requirements (geographic regions) | Data Residency |
| GAP-015 | Tenant-level rate limiting | Rate Limiting |

---

## Detailed Requirements

### 1. Multi-Tenant Data Isolation (GAP-001, GAP-155, GAP-537)

**Strategy: Shared tables with `builder_id` column + PostgreSQL Row-Level Security**

Every tenant-scoped table includes:
```sql
builder_id UUID NOT NULL REFERENCES builders(id)
```

Every tenant-scoped table has an RLS policy:
```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON <table>
  USING (builder_id = current_setting('app.current_builder_id')::uuid);
```

**Enforcement layers (defense in depth):**
1. **Application layer:** `getBuilderId(req)` extracts tenant from JWT; all queries include it
2. **Database layer:** RLS policies block cross-tenant access even if application code has a bug
3. **API layer:** middleware validates that requested resource belongs to the authenticated tenant
4. **Test layer:** integration tests verify cross-tenant access is denied

**Platform-level tables (no builder_id):** `platform_users`, `builders`, `subscriptions`, `config_templates`, `platform_audit_log`. These are only accessible via platform admin routes with service role key.

### 2. Base Entity Pattern

Every domain entity table follows this pattern:

```sql
CREATE TABLE <entity> (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),

  -- Domain fields
  -- ... entity-specific columns ...

  -- Audit trail (GAP-540)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES platform_users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID NOT NULL REFERENCES platform_users(id),

  -- Soft delete (GAP-542)
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES platform_users(id),

  -- Optimistic locking (GAP-541)
  version INT NOT NULL DEFAULT 1
);
```

**Conventions:**
- All PKs are UUIDs (no auto-increment integers -- prevents cross-tenant ID guessing)
- All timestamps are TIMESTAMPTZ (UTC stored, displayed in tenant timezone)
- `created_by`/`updated_by` always populated from the authenticated user
- `version` column incremented on every update; UPDATE fails if version mismatch (optimistic lock)

### 3. Audit Trail (GAP-540)

Two levels of audit tracking:

**Level 1 — Column-level audit (built into every table):**
- `created_at`, `created_by`, `updated_at`, `updated_by` on every row
- Provides "who last touched this" for every record

**Level 2 — Change history (separate table for entities that need it):**

```sql
CREATE TABLE entity_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  entity_type VARCHAR NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR NOT NULL,  -- 'create', 'update', 'delete', 'restore'
  changed_by UUID NOT NULL REFERENCES platform_users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  old_values JSONB,  -- previous field values (only changed fields)
  new_values JSONB,  -- new field values (only changed fields)
  change_reason TEXT,  -- optional user-provided reason
  ip_address INET,
  user_agent TEXT
);
```

**Which entities get Level 2 audit:**
- Budgets and budget line items (financial accountability)
- Change orders (contractual)
- Invoices (financial)
- Contracts (legal)
- Selections and allowances (client-facing decisions)
- User roles and permissions (security)

**Configurable per tenant (GAP-538):** Builder can enable Level 2 audit on additional entity types.

**Retention:** Change log data retained for the life of the tenant account. After cancellation, retained per the data retention policy (GAP-169, default: 90 days, then purged).

### 4. Soft Delete Pattern (GAP-542)

**No hard deletes in the application layer.** Every delete sets `deleted_at` and `deleted_by`:

```sql
UPDATE projects SET deleted_at = now(), deleted_by = :userId WHERE id = :id;
```

**Query convention:** All standard queries exclude soft-deleted rows:
```sql
SELECT * FROM projects WHERE builder_id = :builderId AND deleted_at IS NULL;
```

**Why soft delete is critical:**
- Referential integrity: a deleted vendor does not break invoices that reference them (GAP-542)
- Undo capability: accidental deletes can be restored within a configurable window
- Audit compliance: deleted records remain for audit trail
- Legal holds: records under litigation cannot be permanently destroyed

**Restore:** Admin can restore soft-deleted records within 90 days (configurable). After that, a background job moves them to an archive table and eventually purges.

**Cascade rules:** When a parent entity is soft-deleted:
- Child entities are NOT automatically soft-deleted (they retain their own state)
- Child entities show their parent as "[Deleted]" in the UI
- Some child entities may block parent deletion (e.g., cannot delete a project with open invoices)

### 5. Version History (GAP-540, GAP-541)

**Optimistic locking (GAP-541):**
```sql
UPDATE projects
SET name = :name, version = version + 1, updated_at = now(), updated_by = :userId
WHERE id = :id AND version = :expectedVersion;
-- If 0 rows affected -> concurrent modification error -> client must refresh and retry
```

**Snapshot versioning (for contractual documents):**
Some entities (contracts, change orders, proposals) need immutable point-in-time snapshots:

```sql
CREATE TABLE entity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  entity_type VARCHAR NOT NULL,
  entity_id UUID NOT NULL,
  version_number INT NOT NULL,
  snapshot_data JSONB NOT NULL,  -- full entity state at this version
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES platform_users(id),
  reason VARCHAR,  -- 'sent_to_client', 'approved', 'signed'
  UNIQUE(entity_type, entity_id, version_number)
);
```

### 6. Core Entity Tables

#### Builders (Tenants)
```sql
CREATE TABLE builders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  legal_name VARCHAR,
  license_number VARCHAR,
  ein VARCHAR,
  logo_url VARCHAR,
  primary_color VARCHAR(7),  -- hex color for white-labeling
  timezone VARCHAR DEFAULT 'America/New_York',
  address_line1 VARCHAR,
  address_line2 VARCHAR,
  city VARCHAR,
  state VARCHAR(2),
  zip VARCHAR(10),
  phone VARCHAR,
  email VARCHAR,
  website VARCHAR,
  subscription_plan VARCHAR,
  subscription_status VARCHAR DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### Projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  project_number VARCHAR,  -- from numbering engine
  name VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'preconstruction',  -- from workflow engine
  project_type VARCHAR,  -- custom_home, renovation, addition, etc.

  -- Location
  address_line1 VARCHAR,
  address_line2 VARCHAR,
  city VARCHAR,
  state VARCHAR(2),
  zip VARCHAR(10),
  county VARCHAR,
  parcel_number VARCHAR,
  lot_number VARCHAR,
  subdivision VARCHAR,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),

  -- Financial summary (denormalized for performance)
  contract_amount NUMERIC(14,2),
  budget_total NUMERIC(14,2),
  cost_to_date NUMERIC(14,2),
  invoiced_to_date NUMERIC(14,2),
  paid_to_date NUMERIC(14,2),
  change_order_total NUMERIC(14,2),
  current_contract_amount NUMERIC(14,2),  -- contract + approved COs

  -- Dates
  estimated_start DATE,
  actual_start DATE,
  estimated_completion DATE,
  actual_completion DATE,
  contract_date DATE,
  closing_date DATE,

  -- Relationships
  primary_client_id UUID REFERENCES contacts(id),
  project_manager_id UUID REFERENCES platform_users(id),
  superintendent_id UUID REFERENCES platform_users(id),

  -- Phase tracking
  current_phase VARCHAR,
  percent_complete NUMERIC(5,2) DEFAULT 0,

  -- Metadata
  square_footage INT,
  num_bedrooms INT,
  num_bathrooms NUMERIC(3,1),
  num_stories INT,
  garage_type VARCHAR,
  foundation_type VARCHAR,

  -- Standard audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES platform_users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID NOT NULL REFERENCES platform_users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES platform_users(id),
  version INT NOT NULL DEFAULT 1
);
```

#### Contacts (Clients, Vendor Companies, Individuals)
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  contact_type VARCHAR NOT NULL,  -- 'client', 'vendor', 'architect', 'engineer', 'designer', 'lender', 'realtor', 'inspector', 'other'
  company_name VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  display_name VARCHAR NOT NULL,  -- computed: company_name or first+last
  email VARCHAR,
  phone VARCHAR,
  mobile VARCHAR,
  address_line1 VARCHAR,
  address_line2 VARCHAR,
  city VARCHAR,
  state VARCHAR(2),
  zip VARCHAR(10),
  website VARCHAR,
  notes TEXT,

  -- Vendor-specific
  license_number VARCHAR,
  insurance_expiry DATE,
  w9_on_file BOOLEAN DEFAULT false,
  default_cost_code_id UUID REFERENCES cost_codes(id),
  payment_terms VARCHAR,  -- 'net_30', 'net_15', 'due_on_receipt'
  tax_id VARCHAR,

  -- Client-specific
  client_source VARCHAR,  -- referral, website, realtor, repeat
  referred_by_id UUID REFERENCES contacts(id),

  -- Tags for flexible categorization
  tags VARCHAR[],

  -- Standard audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES platform_users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID NOT NULL REFERENCES platform_users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES platform_users(id),
  version INT NOT NULL DEFAULT 1
);
```

#### Contact-Project Junction (which vendors/clients are on which projects)
```sql
CREATE TABLE project_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  role VARCHAR,  -- 'client', 'general_contractor', 'electrical', 'plumbing', etc.
  is_primary BOOLEAN DEFAULT false,
  scope_description TEXT,
  contract_amount NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES platform_users(id),
  UNIQUE(project_id, contact_id, role)
);
```

### 7. Indexing Strategy (GAP-545, GAP-546)

**Standard indexes on every tenant-scoped table:**
```sql
CREATE INDEX idx_<table>_builder ON <table>(builder_id);
CREATE INDEX idx_<table>_builder_deleted ON <table>(builder_id, deleted_at);
CREATE INDEX idx_<table>_created ON <table>(created_at);
```

**Composite indexes for common query patterns:**
```sql
-- Projects: list by status
CREATE INDEX idx_projects_builder_status ON projects(builder_id, status) WHERE deleted_at IS NULL;

-- Contacts: search by type
CREATE INDEX idx_contacts_builder_type ON contacts(builder_id, contact_type) WHERE deleted_at IS NULL;

-- Contacts: text search on name
CREATE INDEX idx_contacts_display_name_trgm ON contacts USING gin(display_name gin_trgm_ops);

-- Change log: lookup by entity
CREATE INDEX idx_change_log_entity ON entity_change_log(entity_type, entity_id, changed_at DESC);
```

**Partitioning (for high-volume tables):**
- `entity_change_log`: partitioned by `created_at` (monthly)
- `auth_audit_log`: partitioned by `created_at` (monthly)
- Partitions older than retention period are dropped (not queried)

**Performance targets (GAP-545):**
- List pages: < 200ms for up to 10,000 rows per tenant
- Detail pages: < 100ms
- Dashboard aggregations: < 500ms
- Search: < 300ms

### 8. Data Export (GAP-012)

Every tenant can export all their data at any time:
- Export formats: CSV (per table), JSON (full database), SQL dump (for migration)
- Export is an async job (can take minutes for large datasets)
- Export file delivered via secure download link (expires in 24h)
- Includes all entities, custom field values, documents (as file links), audit history
- Export does NOT include: other tenants' data, platform-level config, encrypted secrets

### 9. Data Deletion (GAP-005, GAP-169)

**GDPR/CCPA compliance:**
- Tenant requests full data deletion
- 30-day grace period (data is marked for deletion but still recoverable)
- After grace period, hard delete all tenant data across all tables
- Deletion cascades through all tenant-scoped tables using `builder_id`
- Audit log of the deletion request itself is retained for compliance (without personal data)
- Shared resources (e.g., vendor who works for multiple builders) -- only this tenant's association is deleted, not the vendor's platform account

### 10. Data Import / Migration (GAP-013, GAP-539)

**Import framework:**
- CSV import for all major entity types (projects, contacts, cost codes, budget items)
- Each import creates an `import_batch` record tracking source, row count, error count
- Import validation runs in "dry run" mode first -- shows errors without committing
- On commit, all rows are inserted within a single database transaction
- Rollback (GAP-539): delete all rows from the import batch by `import_batch_id`

```sql
CREATE TABLE import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  entity_type VARCHAR NOT NULL,
  source_file VARCHAR,
  source_system VARCHAR,  -- 'csv', 'buildertrend', 'coconstruct', 'quickbooks'
  status VARCHAR DEFAULT 'pending',  -- pending, validating, importing, complete, failed, rolled_back
  total_rows INT,
  success_rows INT,
  error_rows INT,
  error_log JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES platform_users(id),
  completed_at TIMESTAMPTZ,
  rolled_back_at TIMESTAMPTZ
);
```

### 11. Encryption (GAP-160)

- **At rest:** PostgreSQL Transparent Data Encryption (TDE) via Supabase. All data on disk is encrypted with AES-256.
- **In transit:** TLS 1.3 enforced on all connections (API, database, Redis, external services).
- **Application-level encryption:** Sensitive fields (SSN, tax ID, bank account numbers) encrypted at the application layer before storage using envelope encryption with tenant-specific keys.
- **Key management:** Encryption keys managed via cloud KMS (AWS KMS or equivalent). Tenant-specific keys allow data deletion by key destruction.

### 12. Rate Limiting (GAP-015)

- Per-tenant rate limits configurable by subscription plan:
  - Starter: 100 req/min
  - Professional: 500 req/min
  - Enterprise: 2000 req/min
- Per-user rate limits: 60 req/min (prevents a single user from consuming tenant quota)
- Rate limit headers returned on every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Implemented via Redis sliding window counter

---

## Database Tables Summary

| Table | Scoped To | Purpose |
|---|---|---|
| builders | platform | Tenant/company records |
| platform_users | platform | User identity (cross-tenant) |
| user_tenant_memberships | platform | User-to-tenant mapping |
| projects | builder_id | Core project entity |
| contacts | builder_id | Clients, vendors, all people/companies |
| project_contacts | builder_id | Project-contact junction |
| cost_codes | builder_id | Cost code hierarchy |
| entity_change_log | builder_id | Level 2 audit trail |
| entity_snapshots | builder_id | Immutable version snapshots |
| import_batches | builder_id | Data import tracking |

See also: Module 1 tables (auth, roles, API keys), Module 2 tables (config, workflows, custom fields).

---

## API Endpoints

The Core Data Model itself exposes limited APIs. Most data access goes through domain-specific modules. The shared endpoints are:

```
-- Data Export (GAP-012)
POST   /api/v1/export                          -- initiate full data export
GET    /api/v1/export/:jobId                   -- check export job status
GET    /api/v1/export/:jobId/download          -- download export file

-- Data Import (GAP-013)
POST   /api/v1/import/:entityType              -- upload import file
POST   /api/v1/import/:batchId/validate        -- dry-run validation
POST   /api/v1/import/:batchId/commit          -- commit import
POST   /api/v1/import/:batchId/rollback        -- rollback import (GAP-539)
GET    /api/v1/import/history                   -- list past imports

-- Change History (GAP-540)
GET    /api/v1/history/:entityType/:entityId    -- get change history for an entity

-- Health / Schema
GET    /api/v1/health                           -- platform health check
GET    /api/v1/schema/version                   -- current database schema version
```

---

## Dependencies

- **Module 1: Auth & Access** -- provides `builder_id` and `user_id` for all operations
- **Module 2: Configuration Engine** -- provides custom fields, dynamic validation rules (GAP-538), numbering
- **PostgreSQL 15+** -- RLS, partitioning, JSONB, trigram indexes
- **Supabase** -- managed PostgreSQL with RLS, Auth integration, realtime subscriptions
- **Redis** -- rate limiting counters, query caching
- **Cloud KMS** -- encryption key management (GAP-160)

---

## Open Questions

1. **GAP-541 (Concurrency):** Optimistic locking is the default. Should any entities use pessimistic locking (SELECT FOR UPDATE)? Budget editing by multiple PMs simultaneously might need it. Recommend optimistic locking everywhere with clear conflict resolution UI.
2. **GAP-544 (Point-in-time restore):** Supabase provides daily backups. Is per-tenant point-in-time restore needed at a granular level (e.g., "restore this project to yesterday")? This requires continuous WAL archiving and is expensive. Recommend relying on entity_change_log + entity_snapshots for entity-level "undo" and platform backups for disaster recovery.
3. **GAP-014 (Data residency):** Do we need multi-region deployment from day one, or is US-only acceptable for launch? Recommend US-only for launch with architecture that supports multi-region later (no hardcoded region assumptions).
4. **GAP-156 (Shared vendors):** Should the platform maintain a "global vendor directory" that builders can search, or should every builder maintain their own contacts independently? Recommend independent contacts initially with optional "vendor network" feature later.
5. **GAP-166 (Anonymization):** Aggregate analytics across tenants (e.g., "your electrical costs are 12% above average") requires anonymized cross-tenant queries. This needs a separate read replica with anonymized/aggregated views. Defer to Intelligence Engine module.
6. **Custom field indexing:** Should frequently-queried custom fields be materialized into actual columns via automated migrations? This improves query performance but adds schema complexity. Recommend starting with EAV + JSONB indexes and revisiting if performance is insufficient.
7. **DATABASE_SCHEMA.md:** A comprehensive schema reference document (DATABASE_SCHEMA.md) should be generated from the actual migration files once they are written. This module spec defines the patterns and core tables; the schema doc will be the complete reference.
