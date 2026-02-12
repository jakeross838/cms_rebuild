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
| GAP-157 | Competitively sensitive data protection (pricing, markup, vendor relationships) | Sensitive Data Classification |
| GAP-158 | Employee moving between builders — no data carries over | User-Tenant Boundary |
| GAP-160 | Encryption at rest and in transit | Encryption |
| GAP-161 | Penetration testing and security audits | Security Audit |
| GAP-162 | SOC 2 compliance | Compliance Certification |
| GAP-163 | Data breach notification (legal requirements vary by state) | Breach Response |
| GAP-165 | Customer data requests ("show me everything you store about my company") | Data Subject Access |
| GAP-166 | Data anonymization for aggregate analytics | Anonymization |
| GAP-167 | Subpoena or legal requests for customer data | Legal Compliance |
| GAP-169 | Data retention after customer cancels | Retention Policy |
| GAP-1109 | State-specific data privacy laws (TX, FL, CO, VA, CT) beyond breach notification | State Privacy Compliance |
| GAP-1110 | PCI DSS compliance if handling payment card data | PCI Compliance |
| GAP-1121 | Continuous vulnerability scanning with automated patching | Vulnerability Management |

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

### Section 43: Disaster Recovery & Business Continuity (GAP-591 through GAP-598)

| Gap ID | Description | Sub-topic |
|--------|-------------|-----------|
| GAP-591 | RPO (Recovery Point Objective) — target < 1 hour | Backup & Recovery |
| GAP-592 | RTO (Recovery Time Objective) — target < 2 hours | Failover |
| GAP-593 | Geographic redundancy (multi-region failover) | Infrastructure |
| GAP-594 | Disaster recovery testing (quarterly drills) | DR Testing |
| GAP-595 | Communication during platform outages (status page, notifications) | Incident Communication |
| GAP-596 | Data export for business continuity (if platform company fails) | Data Portability |
| GAP-597 | Platform rollback (revert bad releases quickly) | Deployment |
| GAP-598 | Incremental vs. full backup strategy | Backup Strategy |

See `docs/architecture/multi-tenancy-design.md` Section 20 for full disaster recovery architecture.

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

#### Edge Cases & What-If Scenarios

1. **Soft-delete restoration after the 90-day window:** If a builder needs to restore a soft-deleted record after the 90-day configurable window has passed and the record has been moved to the archive table, the system must provide a "deep archive recovery" process accessible only to owner/admin roles. Recovery from archive is an async operation (may take minutes for large records with attachments). The system must validate referential integrity on restore — if the parent entity no longer exists or the project has been closed, the restore must warn the admin and allow them to reassign the record to a new parent. If archive data has been purged (past the retention policy), recovery is not possible and the system must clearly state this.

2. **GDPR right-to-be-forgotten requests:** The soft-delete model complicates GDPR "right to be forgotten" compliance because soft-deleted records still contain personal data. The system must support a hard-delete workflow for GDPR requests that: (a) identifies all records containing the individual's personal data across all tenant-scoped tables, (b) replaces personal identifiers (name, email, phone, address) with anonymized placeholders (e.g., "Deleted User #12345") rather than destroying records that other entities reference, (c) preserves the record structure for referential integrity (invoices still reference a contact, but the contact's personal data is scrubbed), (d) logs the GDPR deletion request itself in a compliance audit log (without personal data), and (e) is irreversible — once scrubbed, the personal data cannot be recovered. This workflow is distinct from the standard soft-delete and requires explicit owner-level approval.

3. **Cross-tenant anonymous benchmarking data:** The system must support aggregate cross-tenant analytics for features like "your electrical costs are 12% above the platform average for your region" without exposing any individual tenant's data. Required behavior:
   - A scheduled ETL job runs nightly to aggregate anonymized metrics into a `platform_benchmarks` table — no `builder_id` column, only dimensional attributes (region, project type, project size bracket, cost code category)
   - Benchmarks require a minimum of 10 contributing tenants per dimension to prevent reverse-identification
   - Tenant opt-in: each builder must explicitly enable "Contribute to Industry Benchmarks" in their settings. Opted-out tenants neither contribute nor receive benchmark data
   - Benchmark queries run against a read replica, never against the production database
   - No raw values are stored in benchmarks — only percentiles (p25, p50, p75, p90) and averages
   - Data included: cost per square foot by cost code category, project duration by phase, change order frequency, vendor performance scores
   - The benchmarking feature is gated to Professional plan and above

4. **Orphaned child entities on soft-delete:** Because child entities are NOT automatically soft-deleted when a parent is soft-deleted, the application must handle orphaned references gracefully in all query paths. Every query that joins to a parent entity must either: (a) use a LEFT JOIN and render "[Deleted]" for the parent display name, or (b) filter out orphaned children via a dedicated "orphan check" utility. Additionally, when listing child entities (e.g., invoices for a vendor), the UI must indicate when the parent is deleted and offer the option to reassign the child to a different parent. A nightly background job must scan for child entities whose parent has been soft-deleted for more than 30 days and generate a report for the admin to review and take action (reassign or archive).

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

### 12. Security Compliance & Audit Requirements (GAP-161, GAP-162, GAP-163, GAP-165, GAP-167)

**Penetration Testing & Security Audits (GAP-161):**
1. The platform must undergo annual third-party penetration testing covering: web application security (OWASP Top 10), API security, authentication and session management, multi-tenant isolation verification, and infrastructure security.
2. All findings must be triaged by severity (critical, high, medium, low) and remediated within SLA: critical within 24 hours, high within 7 days, medium within 30 days, low within 90 days.
3. Penetration test reports (redacted) must be available to Enterprise customers upon request under NDA.

**SOC 2 Compliance (GAP-162):**
1. The platform must achieve SOC 2 Type II certification covering Trust Service Criteria: Security, Availability, and Confidentiality.
2. SOC 2 audit must be conducted annually by an independent auditor.
3. SOC 2 report must be available to Enterprise and Business tier customers upon request under NDA.
4. Internal controls required: access reviews (quarterly), change management procedures, incident response documentation, vendor risk assessments, and employee security training.
5. Continuous compliance monitoring must be implemented via automated controls (access logging, configuration drift detection, vulnerability scanning).

**Data Breach Notification (GAP-163):**
1. The system must maintain a documented data breach response plan with clear roles, responsibilities, and procedures.
2. Upon detection of a confirmed data breach, the platform must: (a) contain the breach within 1 hour, (b) notify affected tenants within 72 hours (GDPR requirement) with a clear description of what data was affected, (c) notify relevant state attorneys general as required by state breach notification laws (timelines vary by state; the strictest applies), (d) provide affected tenants with a detailed incident report within 30 days, and (e) offer credit monitoring if personal financial data was compromised.
3. The breach notification system must maintain an up-to-date registry of state breach notification requirements (all 50 states have different rules) and auto-determine which notifications are legally required based on the affected tenants' locations.
4. A breach simulation drill must be conducted semi-annually.

**Customer Data Requests (GAP-165):**
1. The system must support tenant-level data subject access requests (DSARs): "Show me everything you store about my company." The response must include all tenant-scoped data across all tables, all audit logs involving that tenant's users, all stored documents and files, all integration configurations, and all support ticket history.
2. DSAR responses must be generated within 30 days (GDPR requirement) as a structured export package (JSON + CSV + file attachments).
3. A self-service DSAR initiation endpoint must be available to the tenant owner role via Settings > Privacy > Request My Data.
4. DSAR requests are logged in the compliance audit trail.

**Legal & Subpoena Requests (GAP-167):**
1. The system must have a documented process for handling subpoenas, court orders, and law enforcement requests for customer data.
2. When a legal request is received, the platform must: (a) verify the legal validity of the request (consult legal counsel), (b) notify the affected tenant unless legally prohibited from doing so (e.g., gag order), (c) produce only the minimum data responsive to the request, (d) log the request, response, and all data produced in a legal compliance log, and (e) preserve all potentially relevant data from the point of request to prevent spoliation.
3. A legal hold mechanism must be supported: when a legal hold is placed on a tenant or project, soft-deleted data cannot be purged, archived data cannot be destroyed, and the standard retention/deletion policies are suspended for the held data.

**State-Specific Data Privacy Compliance (Gap 1109):**
1. Beyond GDPR and CCPA, the platform must comply with emerging state data privacy laws including the Texas Data Privacy and Security Act (TDPSA), Florida Digital Bill of Rights, Colorado Privacy Act (CPA), Virginia Consumer Data Protection Act (VCDPA), and Connecticut Data Privacy Act (CTDPA).
2. The system must maintain a privacy compliance registry that maps each state's requirements (consumer rights, data categories, opt-out mechanisms, enforcement provisions) to platform capabilities.
3. Key requirements common across state laws: (a) right to know what data is collected and how it is used, (b) right to delete personal data, (c) right to opt out of data sales (the platform does not sell data, but must provide the opt-out mechanism), (d) data minimization (collect only what is necessary), and (e) reasonable security measures.
4. The platform's privacy policy and terms of service must be reviewed quarterly for compliance with newly enacted state laws.
5. The privacy compliance registry must be accessible to the platform legal team and automatically flag when a new tenant signs up from a state with specific privacy requirements that affect platform behavior.

**PCI DSS Compliance (Gap 1110):**
1. If the platform processes, stores, or transmits payment card data (credit card numbers for subscription billing or vendor payments), it must comply with PCI DSS Level 1 requirements.
2. Preferred approach: delegate all payment card processing to a PCI-compliant payment processor (Stripe). The platform never stores, processes, or transmits raw card numbers. This reduces the PCI scope to SAQ-A (self-assessment questionnaire for merchants who fully outsource card processing).
3. Requirements for SAQ-A compliance: (a) no card numbers stored in the platform database (only Stripe customer/payment method IDs), (b) all payment forms use Stripe Elements or Checkout (hosted by Stripe, not embedded in platform HTML), (c) no card numbers transmitted through platform servers (direct browser-to-Stripe communication), (d) annual SAQ-A self-assessment completed and documented, and (e) quarterly vulnerability scans by an ASV (Approved Scanning Vendor) on all externally-facing systems.
4. If future features require the platform to handle card data directly (e.g., vendor payment processing), a full PCI DSS assessment and compliance program must be established before launch.

**Continuous Vulnerability Scanning (Gap 1121):**
1. The platform must implement continuous automated vulnerability scanning covering: (a) application dependencies (npm audit, Snyk, or Dependabot scanning for known CVEs in Node.js packages), (b) container images (if using Docker/Kubernetes, scan base images for vulnerabilities), (c) infrastructure configuration (cloud security posture management scanning for misconfigurations in Supabase, Vercel, or cloud provider settings), and (d) web application scanning (OWASP ZAP or equivalent running against staging environment on every deployment).
2. Scanning frequency: dependency scans run on every CI/CD build and daily for existing deployments. Infrastructure scans run weekly. Web application scans run on every staging deployment.
3. Automated patching: when a dependency vulnerability is identified with severity "critical" or "high" and a patched version is available, the CI/CD pipeline must automatically create a pull request with the updated dependency. For "medium" and "low" vulnerabilities, a ticket is created for manual review.
4. Vulnerability SLAs: critical vulnerabilities must be patched within 24 hours, high within 7 days, medium within 30 days, low within 90 days (same as penetration testing findings, Section 12).
5. A vulnerability dashboard must be maintained showing current scan results, open vulnerabilities by severity, and remediation progress.

**Competitively Sensitive Data Protection (GAP-157):**
1. The system must classify certain data fields as "competitively sensitive" and enforce additional protections: builder markup percentages, internal cost data, vendor-specific pricing, profit margins, and bid strategies.
2. Competitively sensitive fields must never appear in: cross-tenant analytics or benchmarks (even anonymized), platform admin views without explicit justification, any API response to external user types, or any export accessible to non-owner roles.
3. When a platform admin accesses a tenant's financial data, the access must be logged with a mandatory justification note and the tenant owner must be notified (configurable: immediately or in weekly digest).

### 13. Disaster Recovery & Business Continuity (GAP-591 through GAP-598)

The platform must guarantee data durability and availability for builders whose businesses depend on it. The full disaster recovery architecture is specified in `docs/architecture/multi-tenancy-design.md` Section 20. Key requirements at the data model layer:

- **Recovery Point Objective** (GAP-591): RPO target is less than 1 hour. This means no more than 1 hour of data can be lost in a worst-case disaster scenario. Achieved via continuous WAL (Write-Ahead Log) archiving to a geographically separate storage location. Real-time replication to a read replica provides near-zero RPO for most scenarios.
- **Recovery Time Objective** (GAP-592): RTO target is less than 2 hours. The platform must be fully operational within 2 hours of any single infrastructure failure. Achieved via automated failover to standby instances with pre-warmed application servers.
- **Geographic redundancy** (GAP-593): the primary database runs in one AWS/cloud region with a hot standby read replica in a different geographic region. Automated failover promotes the read replica to primary if the primary region becomes unavailable. Object storage (photos, documents) uses cross-region replication.
- **DR testing** (GAP-594): disaster recovery procedures must be tested quarterly. Each drill includes: failover to the secondary region, verification that all data is accessible, verification that all application features work correctly, measurement of actual RTO, and a documented post-mortem with improvement actions.
- **Outage communication** (GAP-595): during platform outages, the system must communicate via multiple independent channels: a public status page (hosted separately from the main platform), email notifications to all tenant owners, an in-app banner (when the app is partially available), and social media updates. Status page updates must occur at minimum every 30 minutes during an active incident.
- **Data portability guarantee** (GAP-596): if the platform company ceases operations, builders must be able to export all their data. The full data export feature (Section 8) must always be functional. Enterprise contracts must include a data escrow clause. The export format must be documented and non-proprietary (JSON, CSV, standard file formats) so builders can use the data without the platform.
- **Platform rollback** (GAP-597): the deployment strategy must support rapid rollback of bad releases. Blue-green deployment ensures the previous version is available for instant rollback. Target: rollback to the previous release within 30 minutes of identifying a critical issue. Database migrations must be backward-compatible so that a code rollback does not break the database schema.
- **Backup strategy** (GAP-598): the backup strategy combines continuous WAL archiving (point-in-time recovery to any moment), daily full database snapshots (retained for 30 days), weekly full snapshots archived to cold storage (retained for 1 year), and per-tenant logical backups available on demand for tenant-level restore.

#### Edge Cases & What-If Scenarios

1. **Partial data corruption requiring selective restore.** If a database operation or application bug corrupts data for a specific tenant or specific table (not the entire database), the system must support tenant-level or table-level point-in-time restore without affecting other tenants. The `entity_change_log` (Section 3) enables entity-level rollback for audited entities. For non-audited entities, the WAL-based point-in-time recovery can restore a logical backup to a temporary database, extract the needed tenant's data, and merge it back into production. This process must be documented as a runbook for the platform operations team.

### 14. Rate Limiting (GAP-015)

- Per-tenant rate limits configurable by subscription plan:
  - Starter: 100 req/min
  - Professional: 500 req/min
  - Enterprise: 2000 req/min
- Per-user rate limits: 60 req/min (prevents a single user from consuming tenant quota)
- Rate limit headers returned on every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Implemented via Redis sliding window counter

### 15. Platform Technology Edge Cases

These scenarios address platform-wide technology challenges that affect data integrity, performance, and reliability across the entire system (not just mobile — see Module 40 for mobile-specific edge cases).

1. **Browser compatibility (GAP-831).** The platform must provide a consistent experience across Chrome, Safari, Firefox, and Edge (current version and one prior). Requirements: (a) automated cross-browser testing in CI/CD pipeline for all UI components, (b) a browser support matrix published in documentation and checked at login, (c) graceful degradation for unsupported browsers (show a message directing the user to a supported browser rather than a broken experience), and (d) no browser-specific CSS hacks — use standards-compliant code with polyfills where necessary.

2. **Print formatting (GAP-832).** Reports, schedules, budgets, and contracts must print cleanly on standard paper (US Letter 8.5x11 and A4). Requirements: (a) every printable page has a dedicated print stylesheet with appropriate margins, page breaks, and header/footer, (b) budget spreadsheets handle page overflow with repeated column headers and proper page numbering, (c) Gantt charts print at configurable scales (fit to page, actual size, or custom), (d) print preview is available before sending to printer, and (e) PDF export is available as an alternative to printing for all printable views.

3. **Email deliverability (GAP-833).** Automated notifications, draw request submissions, and vendor communications must not be flagged as spam. Requirements: (a) all outbound email uses a dedicated sending domain with proper SPF, DKIM, and DMARC configuration, (b) email sending volume is warmed up gradually for new domains, (c) bounce handling removes invalid email addresses automatically, (d) unsubscribe links are included on all non-transactional emails (CAN-SPAM compliance), (e) email deliverability is monitored with alerts when delivery rates drop below 95%, and (f) critical transactional emails (password resets, signature requests, payment notifications) are sent through a separate high-reputation sending path.

4. **Data export volume at scale (GAP-834).** A builder with 5 years of data may have millions of records, thousands of documents, and terabytes of photos. Full data export must: (a) run as an async background job with progress indication, (b) stream data to compressed archive files (ZIP) to manage file size, (c) support incremental exports (only data since last export) in addition to full exports, (d) handle exports up to 100 GB without timeout or memory issues, (e) provide the export as a secure download link valid for 72 hours, and (f) allow the builder to choose what to include (all data, specific projects, specific date ranges, with or without documents/photos).

5. **API rate limiting for integrations (GAP-835).** Third-party integrations (QuickBooks, DocuSign, weather APIs) have their own rate limits. The system must: (a) implement per-service rate limiting that respects each third party's published limits, (b) queue and retry requests that are rate-limited (HTTP 429) with exponential backoff, (c) provide integration health monitoring that shows current usage vs. rate limits, (d) alert builders when their integration usage is approaching the third party's limits, and (e) batch API calls where possible to minimize request count (e.g., batch QuickBooks journal entries rather than posting one at a time).

6. **File format handling (GAP-836).** The system receives files in many formats — PDFs, DWGs, Excel, Word, images (JPEG, PNG, HEIC, TIFF), and videos (MP4, MOV). Requirements: (a) all common image formats are accepted and converted to standard formats (JPEG/PNG) for viewing, with originals preserved, (b) PDF viewing is built into the platform (no external viewer required), (c) DWG files are rendered via a server-side conversion to PDF/SVG for in-browser viewing (no AutoCAD required), (d) Excel and Word files can be previewed in-browser, (e) video files are transcoded to web-friendly formats with streaming support, (f) HEIC photos from iPhones are automatically converted to JPEG for cross-platform viewing, and (g) file size limits are clearly communicated (recommended: 100 MB per file, 1 GB per batch upload).

7. **Character set and internationalization (GAP-837).** Construction teams are diverse — many field workers speak Spanish, and names and addresses may include accented characters. Requirements: (a) the database uses UTF-8 encoding for all text fields, (b) the UI renders accented characters (e.g., Jose Martinez, Munoz Electric) correctly everywhere, (c) search is accent-insensitive (searching "Jose" finds "Jose"), (d) address fields support international characters, and (e) the notification engine handles non-ASCII characters in email subjects and SMS messages correctly. Note: full internationalization (multi-language UI) is deferred to Phase 3+; this requirement is about data handling, not UI translation.

8. **Concurrent user performance (GAP-840).** A large builder may have 50+ users logged in simultaneously — PMs reviewing budgets, supers entering daily logs, office staff processing invoices. Requirements: (a) the system must handle 50 concurrent users per tenant with < 500ms response times for standard operations, (b) real-time features (live updates, notification delivery) must scale to 50 concurrent WebSocket connections per tenant, (c) database connection pooling must prevent connection exhaustion under load, (d) long-running operations (report generation, data export) must not block other users' requests, and (e) load testing must validate these targets before each major release.

9. **Search performance at scale (GAP-841).** Full-text search across millions of documents and records must be fast. Requirements: (a) search results must return within 300ms for queries against up to 1 million records per tenant, (b) search is powered by PostgreSQL full-text search with trigram indexes for partial matching, (c) search covers all AI-extracted text fields (OCR text, daily log transcripts, email content, document text), (d) search results are ranked by relevance and recency, (e) search supports filters (by project, by entity type, by date range), and (f) if PostgreSQL search performance degrades at scale, the architecture supports migration to a dedicated search service (Elasticsearch/Typesense) without application code changes. See also Section 7 (Indexing Strategy).

10. **Notification delivery timing (GAP-842).** Urgent alerts (safety incidents, critical budget overages, approval requests with deadlines) must be delivered within 30 seconds of the triggering event — not queued for batch delivery. Requirements: (a) notifications are categorized by urgency (urgent, standard, low), (b) urgent notifications bypass any batching/digest logic and are delivered immediately via push notification and/or SMS, (c) standard notifications may be batched into a 5-minute digest, (d) low-priority notifications can be batched hourly or into a daily digest, and (e) notification delivery latency is monitored with alerts when urgent notifications exceed 60 seconds.

11. **Third-party dependency management (GAP-844).** The platform depends on external services (Google Maps, weather APIs, OCR services, email providers, payment processors). The system must: (a) implement circuit breaker patterns for all external service calls — if a service is down, fail gracefully rather than blocking the user, (b) maintain fallback strategies where possible (e.g., if the primary weather API is down, use cached data or a secondary provider), (c) monitor all third-party service health and alert the ops team when a dependency is degraded, (d) abstract third-party services behind internal interfaces so that providers can be swapped without application-level changes, and (e) maintain a dependency register documenting each external service, its SLA, its cost model, and the fallback strategy.

12. **Data anonymization for demo and sales (GAP-845).** The platform needs realistic demo data for sales presentations and marketing without exposing actual customer data. Requirements: (a) a data anonymization pipeline that takes a real tenant's data and produces a demo-safe copy with: all personal names replaced, all company names replaced, all addresses replaced, all financial amounts randomized within realistic ranges, all photos replaced with stock construction photos, and all documents replaced with sample documents, (b) anonymization must be irreversible — the demo dataset cannot be traced back to the source tenant, (c) the anonymized dataset must maintain referential integrity (vendor names are consistent across invoices, POs, and lien waivers), and (d) demo accounts are clearly marked in the platform as "[DEMO]" to prevent confusion.

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

---

## Unusual Business Scenarios — Data Model Edge Cases

### Multiple Builders on Same Subdivision (GAP-616)
When multiple builders on the platform work on projects in the same subdivision, the system must handle shared context without breaking tenant isolation:
- **Shared infrastructure costs:** Subdivisions often have shared infrastructure costs (roads, utilities, stormwater, common area landscaping, HOA formation) that are split among builders. The system must support: (a) a "subdivision" entity that multiple projects across different tenants can reference (by subdivision name and location, not by cross-tenant FK), (b) each builder tracks their share of shared costs within their own budget as a cost category, and (c) no cross-tenant data sharing occurs — each builder independently records their cost share. If both builders are on the platform, there is no automatic reconciliation between them; each manages their own budget independently.
- **HOA formation tracking:** When builders in a subdivision are responsible for HOA formation, the system must support tracking HOA-related deliverables as project tasks: governing documents, common area completion, reserve fund establishment, and turnover to the homeowner association. These are tracked within each builder's project scope.
- **Lot identification:** The `projects` table `lot_number` and `subdivision` fields must support cross-referencing projects within the same subdivision for the builder's own reporting (e.g., "show me all my projects in Oak Haven subdivision") without exposing other tenants' projects.
- **No cross-tenant data leakage:** Even when two builders work in the same subdivision, RLS policies ensure complete isolation. Subdivision names are just text fields — there is no shared subdivision entity that would create a cross-tenant data dependency.

### ADU Alongside Main Home (GAP-617)
When a client wants to build an accessory dwelling unit (ADU) alongside a main home — which may involve different permits, different code requirements, and potentially different budgets — the system must support flexible project structuring:
- **Single project with sub-scopes:** The recommended approach for most ADU situations is a single project with the ADU tracked as a distinct scope within it. The project has one contract (which includes ADU scope), one schedule (with ADU tasks as a sub-section), and one budget (with ADU cost codes grouped under an "ADU" division or phase).
- **Separate project with parent-child linking:** For complex ADU situations (separate permits, separate contractor, separate financing, or ADU built significantly after the main home), the system must support creating the ADU as a separate project linked to the parent project. The `projects` table must include a `parent_project_id` field (nullable, FK to projects) that enables this linkage. Child projects inherit the parent's address and client but maintain independent budgets, schedules, and permits.
- **Separate permit tracking:** ADUs frequently require their own building permits, especially when they have separate utility connections. The permitting module must support multiple permit sets per project (already supported via `permits` table with `project_id` FK), and when a parent-child project structure is used, each project manages its own permits independently.
- **Consolidated client view:** Regardless of whether the ADU is tracked as a sub-scope or a separate project, the client portal must present a unified view showing both the main home and ADU progress. When parent-child linking is used, the client portal aggregates both projects into a single view with clear section separation.
- **Budget allocation flexibility:** The builder must be able to allocate costs to the main home or ADU with clear separation for: (a) accurate cost-per-SF reporting on each structure, (b) separate draw schedules if the ADU has different financing, and (c) separate closeout documentation if required by the jurisdiction.
- **Code requirement differences:** ADUs may be subject to different code requirements than the main home (different occupancy classification, different energy code path, different fire separation requirements). The inspection checklist and permit tracking must support per-structure code references within the same project.
