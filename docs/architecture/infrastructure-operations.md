# RossOS Infrastructure & Operations

**Purpose:** Design decisions for data integrity, disaster recovery, and security compliance.

**Gap Coverage Index:**

| Section | Gap Items | Topic |
|---------|-----------|-------|
| 1: Data Integrity | GAP-538, GAP-539, GAP-541, GAP-543, GAP-544 | Validation, Migration, Concurrency, Sync, Corruption |
| 2: Disaster Recovery | GAP-591 through GAP-598 | RPO/RTO, Redundancy, Testing, Communication, Export, Rollback, Backups |
| 3: Security & Compliance | GAP-1109, GAP-1110, GAP-1120 through GAP-1124 | Privacy Laws, PCI, Pen Testing, Vuln Scanning, IR, BCP, DR |

---

## 1. Data Integrity

### 1.1 Per-Builder Configurable Validation Rules (GAP-538)

**GAP-538: What about data validation rules that are configurable per builder?**

**Decision:** Three-tier validation architecture -- platform-enforced rules that cannot be overridden, company-configurable rules stored in the `company_settings` JSONB column, and field-level validation defined per entity type.

**Platform-Enforced Rules (non-configurable):**
- All monetary fields use `decimal(12,2)` with non-negative constraints where applicable
- Email fields validated against RFC 5322 format
- Phone fields normalized to E.164 format
- UUID primary and foreign keys enforced at the database level
- `company_id` required on all tenant tables (enforced by RLS and NOT NULL constraints)
- Soft delete only -- `deleted_at` timestamp, never physical deletion

**Company-Configurable Rules:**

Stored in the `companies.settings` JSONB column under a `validation_rules` key:

```json
{
  "validation_rules": {
    "invoices": {
      "require_po_match": true,
      "max_amount_without_approval": 25000,
      "require_cost_code_allocation": true,
      "allowed_statuses": ["received", "needs_review", "approved", "rejected", "in_draw", "paid"]
    },
    "purchase_orders": {
      "require_budget_check": true,
      "auto_reject_over_budget": false,
      "require_dual_approval_above": 50000
    },
    "jobs": {
      "require_contract_before_active": true,
      "require_budget_before_invoicing": true,
      "job_number_format": "YYYY-NNN"
    },
    "change_orders": {
      "require_client_approval": true,
      "require_signed_document": false
    }
  }
}
```

**Implementation approach:**
- A `validate_company_rules(company_id, entity_type, data)` PostgreSQL function checks configurable rules at the database level via triggers
- Application-layer Zod schemas compose platform rules with company-specific rules loaded from the settings cache
- The Configuration Engine (Module 02) provides a UI for company admins to toggle and configure these rules
- Default rule sets are provided per company tier (Starter, Pro, Enterprise) during onboarding
- Rule changes are logged in the `activity_logs` table for audit purposes

**Custom field validation:**

Companies can define custom required fields per entity type:

```json
{
  "custom_required_fields": {
    "vendors": ["tax_id", "insurance_expiry"],
    "invoices": ["invoice_number", "invoice_date"],
    "daily_logs": ["weather_condition"]
  }
}
```

The application layer reads these at form render time and at API submission time, returning 422 errors with specific field-level messages when custom requirements are not met.

---

### 1.2 Data Migration Rollback (GAP-539)

**GAP-539: How do you handle data migration rollback?**

**Decision:** Every database migration is reversible. Migrations use a paired `up`/`down` script pattern, tested in CI before deployment. Data migrations (as opposed to schema migrations) use a staged approach with rollback snapshots.

**Schema migration rollback:**

- All migrations live in `app/supabase/migrations/` as sequentially numbered SQL files
- Each migration file contains both the forward (`-- up`) and reverse (`-- down`) SQL, separated by a comment marker
- Supabase CLI `supabase db reset` can replay migrations from scratch; `supabase migration repair` can mark a migration as rolled back
- Migrations are tested against a shadow database in CI before being applied to staging or production
- Destructive schema changes (dropping columns, changing types) follow a deprecation pattern:
  1. Migration N: Add new column, keep old column
  2. Migration N+1: Backfill new column from old column data
  3. Migration N+2 (next release cycle): Drop old column
  - This ensures the previous application version still works during rollout, and rollback does not lose data

**Data migration rollback (imports, bulk updates, sync operations):**

- Before any bulk data operation, a logical snapshot is taken:
  ```sql
  CREATE TABLE _migration_snapshot_{timestamp} AS
    SELECT * FROM {target_table} WHERE company_id = {company_id};
  ```
- Snapshot tables are retained for 72 hours, then automatically dropped by a scheduled cleanup job
- The `data_migrations` table tracks each operation:

  | Column | Type | Purpose |
  |--------|------|---------|
  | `id` | uuid | Primary key |
  | `company_id` | uuid | Tenant scope |
  | `migration_type` | text | `import`, `bulk_update`, `sync`, `schema` |
  | `entity_type` | text | Target table |
  | `rows_affected` | integer | Count of rows modified |
  | `snapshot_table` | text | Name of snapshot table, if applicable |
  | `status` | text | `pending`, `running`, `completed`, `rolled_back`, `failed` |
  | `started_at` | timestamptz | When the migration began |
  | `completed_at` | timestamptz | When it finished |
  | `rolled_back_at` | timestamptz | When it was reverted, if applicable |
  | `initiated_by` | uuid | User who triggered the operation |

- Rollback procedure: Admin clicks "Undo Import" in the UI, which replaces the current table contents (for that `company_id`) with the snapshot data, within a transaction
- Rollback is only available within the 72-hour snapshot retention window
- For tenant data imports (Module 42 -- Data Migration), the import runs in a staging schema first. The user reviews and confirms before data is promoted to the live schema.

**Safeguards:**
- All migration operations run inside explicit database transactions
- Migrations that touch more than 10,000 rows are executed in batches of 1,000 with progress tracking
- Failed migrations automatically roll back their transaction and set status to `failed`
- A migration lock prevents concurrent migrations against the same tenant

---

### 1.3 Concurrent Editing (GAP-541)

**GAP-541: How do you handle concurrent editing across the platform?**

**Decision:** Optimistic concurrency control using `updated_at` timestamps as version tokens, combined with real-time presence indicators for high-contention entities.

**Optimistic concurrency control (all entities):**

Every mutable table includes an `updated_at timestamptz` column. The update flow works as follows:

1. Client loads an entity, receiving `updated_at` as part of the response
2. Client sends a PATCH request with the updated fields and the original `updated_at` value in an `If-Unmodified-Since` header (or `version` field in the request body)
3. The API executes:
   ```sql
   UPDATE {table}
   SET field1 = $1, field2 = $2, updated_at = now()
   WHERE id = $id AND updated_at = $original_updated_at
   RETURNING *;
   ```
4. If zero rows are returned, the record was modified by another user since it was loaded. The API returns `409 Conflict` with the current version of the entity so the client can present a merge/overwrite UI.

**Client-side conflict resolution:**

When a 409 is received, the UI displays a conflict dialog:
- Shows the user's changes alongside the current server state
- Highlights which fields differ
- Offers three options: "Keep Mine" (force overwrite with new `updated_at`), "Keep Theirs" (reload), or "Merge" (for entities with independent fields like daily logs where both sets of changes can coexist)

**Real-time presence (high-contention entities):**

For entities where multiple users commonly work simultaneously (budgets, estimates, draws), the system uses Supabase Realtime Presence:

- When a user opens an entity for editing, a presence event is broadcast to the entity's channel: `entity:{type}:{id}`
- Other users viewing the same entity see an avatar indicator showing who else is currently editing
- Presence events include which field/section the user is actively editing (e.g., "Jake is editing line item 5")
- Presence automatically clears on disconnect or after 30 seconds of inactivity

**Entity-specific concurrency rules:**

| Entity | Strategy | Rationale |
|--------|----------|-----------|
| Budget lines | Optimistic + presence | Multiple team members update different lines |
| Estimates | Optimistic + presence | Estimators collaborate on line items |
| Invoices | Optimistic, single-editor | Typically one person processes an invoice at a time |
| Daily logs | Last-write-wins per section | Field workers update different sections (weather vs. labor vs. notes) |
| Draws | Pessimistic lock during submission | Draw submission must be atomic; lock the draw during submit-to-approve transition |
| Schedule tasks | Optimistic + presence | PM and superintendent may adjust tasks simultaneously |

**Pessimistic locking (draw submission, approval workflows):**

For state transitions that must be atomic (approving an invoice, submitting a draw), a short-lived advisory lock is acquired:

```sql
SELECT pg_advisory_xact_lock(hashtext('draw:' || $draw_id::text));
```

This lock is held only for the duration of the transaction (typically < 500ms) and prevents two users from simultaneously approving or submitting the same entity. If the lock cannot be acquired within 5 seconds, the API returns `423 Locked` with a message indicating another user is currently processing the same action.

---

### 1.4 Data Consistency During Integration Sync (GAP-543)

**GAP-543: How do you handle data consistency during integration sync?**

**Decision:** Integration syncs (primarily QuickBooks, Module 16) use an idempotent, transactional sync engine with conflict detection, entity-level locking, and a sync ledger that tracks every change.

**Sync architecture:**

```
RossOS Database
      |
      v
  Sync Engine (server/integrations/sync-engine.ts)
      |
      ├── Entity Mapper (qb_entity_map table)
      ├── Conflict Resolver
      ├── Retry Queue
      └── Sync Ledger (qb_sync_log + qb_sync_detail tables)
      |
      v
  QuickBooks API
```

**Sync process (per entity):**

1. **Lock**: Acquire an advisory lock on `sync:{company_id}:{entity_type}` to prevent concurrent syncs of the same entity type for the same tenant
2. **Snapshot**: Record current state of entities to be synced in the sync ledger
3. **Diff**: Compare RossOS state with QuickBooks state using `last_synced_at` timestamps from `qb_entity_map`
4. **Resolve conflicts**: When both sides have changed since last sync:
   - For financial data (invoices, payments): QuickBooks is the system of record -- QB wins
   - For project data (vendors, jobs): RossOS is the system of record -- RossOS wins
   - For ambiguous conflicts: flag for manual resolution, do not sync that entity
5. **Apply**: Execute changes within a database transaction. If any entity in the batch fails, the entire batch rolls back
6. **Confirm**: Update `qb_entity_map.last_synced_at` and write success/failure to `qb_sync_log`
7. **Release lock**

**Idempotency guarantees:**

- Every sync operation has a unique `sync_id` (UUID)
- The sync engine checks whether a `sync_id` has already been processed before executing
- Retried syncs (due to network failures) reuse the same `sync_id` and skip already-completed entities
- QuickBooks webhook deliveries are deduplicated by `intuit_event_id`

**Consistency rules:**

| Scenario | Behavior |
|----------|----------|
| RossOS entity created, not yet in QB | Push to QB, store mapping in `qb_entity_map` |
| QB entity created, not yet in RossOS | Pull from QB, create in RossOS with `company_id`, store mapping |
| Both modified since last sync (financial) | QB value wins, RossOS updated, conflict logged |
| Both modified since last sync (project) | RossOS value wins, QB updated, conflict logged |
| Entity deleted in RossOS (soft delete) | Mark inactive in QB (vendors) or void (invoices) |
| Entity deleted in QB | Flag in RossOS for review, do not auto-delete |
| QB API returns 429 (rate limited) | Exponential backoff, retry queue with max 5 retries |
| QB API returns 5xx | Retry after 60 seconds, up to 3 times, then mark sync as `warning` |
| RossOS transaction fails mid-sync | Full rollback, sync status set to `failed`, retry on next cycle |

**Sync detail table:**

```sql
qb_sync_detail (
  id UUID PRIMARY KEY,
  sync_log_id UUID REFERENCES qb_sync_log NOT NULL,
  entity_type TEXT NOT NULL,
  cms_id UUID NOT NULL,
  qb_id TEXT,
  action TEXT NOT NULL,        -- 'push', 'pull', 'conflict_resolve', 'skip'
  status TEXT NOT NULL,        -- 'success', 'failed', 'conflict'
  conflict_detail JSONB,      -- if conflict, stores both versions
  error_detail TEXT,
  processed_at TIMESTAMPTZ DEFAULT now()
)
```

**Manual conflict resolution UI:**

When conflicts are flagged for manual resolution, they appear in the Integrations settings page (Module 16). The user sees both the RossOS and QuickBooks values side by side and chooses which to keep. The resolution is recorded in `conflict_detail` for audit purposes.

---

### 1.5 Data Corruption Recovery (GAP-544)

**GAP-544: What about data corruption recovery?**

**Decision:** Multi-layer corruption detection and recovery, combining database-level integrity checks, application-level consistency verification, and automated repair for known corruption patterns.

**Layer 1: Database-level integrity (prevention)**

- All foreign keys are enforced with `ON DELETE CASCADE` or `ON DELETE RESTRICT` as appropriate
- `CHECK` constraints on critical fields (e.g., `CHECK (total >= 0)` on invoice amounts, `CHECK (percent_complete BETWEEN 0 AND 100)`)
- `UNIQUE` constraints on business keys (e.g., `UNIQUE(company_id, code)` on cost_codes, `UNIQUE(job_id, draw_number)` on draws)
- Triggers maintain calculated fields (budget totals, job financial summaries) rather than relying on application-layer math
- All writes use explicit transactions -- partial updates are not possible

**Layer 2: Application-level consistency checks (detection)**

A scheduled job (`integrity-checker`) runs nightly and verifies:

| Check | Query | Corrective Action |
|-------|-------|-------------------|
| Budget line totals match budget header | `SUM(budget_lines.revised_amount) = budgets.revised_amount` | Auto-recalculate header from lines |
| Invoice allocation totals match invoice total | `SUM(invoice_allocations.amount) = invoices.total` | Flag for review, do not auto-fix (user intent unclear) |
| Draw completion percentages are monotonically increasing | Current draw `total_completed >= previous draw total_completed` | Flag for review |
| Orphaned records | Entities referencing deleted parents | Soft-delete orphans, log in activity_logs |
| Company_id consistency | Child entity `company_id` matches parent entity `company_id` | Block at insert via trigger; if found, flag as critical |
| Job financial summary accuracy | Recalculate `invoiced_total`, `paid_total` from source records | Auto-recalculate, log discrepancy |

Results are written to an `integrity_check_results` table and surfaced in the admin dashboard (Module 49). Critical issues trigger an immediate notification to the RossOS operations team.

**Layer 3: Point-in-time recovery (repair)**

When corruption is detected that cannot be auto-repaired:

1. **Identify scope**: Determine which `company_id` and which entities are affected
2. **Isolate**: If corruption is spreading (e.g., a bad trigger cascading incorrect values), disable the trigger and halt sync operations for the affected tenant
3. **Recover from WAL**: Use Supabase point-in-time recovery (PITR) to identify the last known good state:
   ```sql
   -- Supabase PITR allows recovery to any point within the retention window
   -- Restore the affected table(s) to a recovery schema for comparison
   CREATE SCHEMA recovery;
   -- Supabase support restores target tables into recovery schema
   ```
4. **Selective restore**: Copy only the affected rows from the recovery schema back to the live schema, within a transaction
5. **Verify**: Re-run the integrity checker against the affected tenant to confirm repair
6. **Root cause**: Investigate and fix the cause of corruption (bug in trigger, race condition, etc.)
7. **Post-mortem**: Document the incident, root cause, and fix in the incident log

**Corruption from external sources (file uploads, API integrations):**

- All data entering the system passes through the AI processing layer (per architecture decision in CLAUDE.md), which includes format validation and sanitization
- QuickBooks sync data is validated against Zod schemas before being written to the database
- File uploads are scanned for malware (ClamAV via Supabase Storage hooks on Enterprise tier) and validated for expected MIME types
- CSV/Excel imports are parsed in a sandboxed process, validated row-by-row, and rejected in full if more than 5% of rows fail validation

---

## 2. Disaster Recovery

> Note: Initial decisions for GAP-591 through GAP-598 were established in `docs/architecture/multi-tenancy-design.md` Section 20. This section expands those decisions into operational procedures and implementation details.

### 2.1 Recovery Point Objective (GAP-591)

**GAP-591: What's the RPO -- how much data can you lose?**

**Decision: RPO < 1 hour for all tiers. Effective RPO is near-zero for database writes.**

**How this is achieved:**

| Layer | RPO | Mechanism |
|-------|-----|-----------|
| Database (PostgreSQL) | ~0 (continuous) | Supabase continuous WAL archiving. Every committed transaction is streamed to durable storage in near-real-time. Point-in-time recovery (PITR) can restore to any second within the retention window. |
| File storage (Supabase Storage) | < 1 hour | Supabase Storage is backed by S3-compatible object storage with cross-AZ replication. Objects are durable immediately upon successful upload response. |
| Application state (sessions, caches) | N/A (ephemeral) | Session data and caches are reconstructable. Loss of cache causes temporary performance degradation, not data loss. |
| Realtime channels | N/A (ephemeral) | Presence and broadcast data is transient by design. Clients reconnect and re-establish state. |

**Retention windows:**

| Tier | PITR Retention | Daily Snapshot Retention |
|------|----------------|--------------------------|
| Starter | 7 days | 7 days |
| Pro | 14 days | 30 days |
| Enterprise | 30 days | 90 days |

**What "< 1 hour" means in practice:** Because Supabase uses continuous WAL archiving, the actual data loss window for a database failure is typically seconds, not minutes. The "< 1 hour" commitment is a worst-case guarantee that accounts for edge cases like WAL shipping delays during extreme load. Under normal operations, RPO is effectively zero.

---

### 2.2 Recovery Time Objective (GAP-592)

**GAP-592: What's the RTO -- how long can the system be down?**

**Decision: RTO < 4 hours for full platform recovery. < 15 minutes for single-component failures.**

**Recovery time by failure type:**

| Failure Scenario | Target RTO | Recovery Procedure |
|-----------------|------------|-------------------|
| Single application server crash | < 2 minutes | Auto-restart via process manager (PM2/systemd). Health check detects failure, load balancer routes to healthy instances. |
| Database primary failure | < 15 minutes | Supabase automated failover promotes read replica to primary. Connection strings update via DNS. Application reconnects automatically. |
| Full region outage (us-east-1) | < 2 hours | Failover to us-west-2 read replica promoted to primary. Application deployment redirected to secondary region. DNS updated. |
| Full database corruption requiring PITR | < 4 hours | Restore from PITR to new Supabase instance. Update connection strings. Verify data integrity. Resume service. |
| Storage (S3) outage | < 30 minutes | S3 has 99.999999999% durability. If unavailable, file uploads are queued in the application layer. Existing files served from CDN cache. |
| Third-party integration outage (QuickBooks) | 0 (graceful degradation) | Sync operations are queued and retried. All RossOS functionality continues. Sync resumes when integration recovers. |

**Automated recovery infrastructure:**

- **Health checks**: Every application instance exposes a `/health` endpoint checked every 10 seconds by the load balancer. Three consecutive failures trigger automatic restart.
- **Database monitoring**: Supabase provides built-in monitoring. Custom alerts fire when connection pool utilization exceeds 80%, query latency exceeds 2 seconds, or replication lag exceeds 30 seconds.
- **Alerting escalation**:
  1. 0-5 minutes: PagerDuty alert to on-call engineer
  2. 5-15 minutes: Escalate to engineering lead
  3. 15-30 minutes: Escalate to CTO
  4. 30+ minutes: All-hands incident response

---

### 2.3 Geographic Redundancy (GAP-593)

**GAP-593: How do you handle geographic redundancy?**

**Decision: Active-passive multi-region with automated failover for database, multi-AZ for application.**

**Architecture:**

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   CDN + DNS     │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌────────▼────────┐
     │  us-east-1      │          │  us-west-2      │
     │  (PRIMARY)      │          │  (STANDBY)      │
     │                 │          │                 │
     │  App Server x3  │          │  App Server x1  │
     │  (multi-AZ)     │          │  (cold standby) │
     │                 │          │                 │
     │  Supabase       │ ──WAL──► │  Supabase       │
     │  Primary DB     │  stream  │  Read Replica   │
     │                 │          │                 │
     │  Supabase       │ ──sync─► │  Supabase       │
     │  Storage (S3)   │          │  Storage (S3)   │
     └─────────────────┘          └─────────────────┘
```

**Primary region (us-east-1):**
- 3 application server instances across 2 availability zones
- Supabase primary database instance with automatic daily snapshots
- Supabase Storage for file uploads (backed by AWS S3 with cross-AZ replication)

**Standby region (us-west-2):**
- 1 application server instance (cold standby, scaled up during failover)
- Supabase read replica receiving continuous WAL stream from primary
- Storage replicated via S3 cross-region replication

**Failover procedure:**
1. Automated detection: Cloudflare health checks detect primary region unavailability
2. DNS failover: Cloudflare routes traffic to standby region (TTL: 30 seconds)
3. Replica promotion: Supabase read replica promoted to primary (automated or via support ticket, depending on failure type)
4. Scale up: Standby app servers scaled from 1 to 3 instances
5. Verify: Automated smoke tests confirm platform functionality
6. Communicate: Status page updated, email notifications sent (see GAP-595)

**Data sovereignty:** All data remains within the United States. Both regions are US-based. If a future customer requires data to remain in a specific region (e.g., EU data residency), a dedicated Supabase project in the required region would be provisioned as a premium tier offering.

---

### 2.4 Disaster Recovery Testing (GAP-594)

**GAP-594: What about disaster recovery testing?**

**Decision: Quarterly DR drills on a rotating schedule, with results documented and reviewed.**

**Annual testing calendar:**

| Quarter | Test Type | Scope | Success Criteria |
|---------|-----------|-------|-----------------|
| Q1 (Jan) | Full database restore | Restore from PITR to a test environment. Verify all tenant data, RLS policies, and triggers function correctly. | Restore completes within RTO target. Data matches expected state. All 50+ integrity checks pass. |
| Q2 (Apr) | Application failover | Simulate primary region failure. Execute failover to standby. Run full E2E test suite against failover environment. | Traffic reroutes within 15 minutes. All critical user flows (login, create invoice, submit draw) succeed. |
| Q3 (Jul) | Tenant data export/import | Export a test tenant's full data. Import into a fresh environment. Verify completeness and referential integrity. | Export completes within 30 minutes for largest tenant. Import produces identical data. |
| Q4 (Oct) | Communication and escalation | Simulate an outage. Verify status page updates, email notifications, SMS alerts, and PagerDuty escalation chain all fire correctly. | All notification channels deliver within 5 minutes. Escalation reaches correct personnel at each tier. |

**DR test documentation:**

Each test produces a report stored in the internal engineering wiki containing:
- Date and participants
- Exact steps executed
- Actual recovery time vs. target
- Any failures or surprises encountered
- Action items for improvement
- Sign-off from engineering lead and CTO

**Tabletop exercises:**

In addition to live tests, the team conducts a tabletop disaster scenario exercise every 6 months. Scenarios include:
- Ransomware attack on infrastructure
- Accidental deletion of a production database
- Supabase platform-wide outage
- Insider threat (compromised admin credentials)
- Major customer demanding immediate full data export

---

### 2.5 Outage Communication (GAP-595)

**GAP-595: How do you handle communication during platform outages?**

**Decision: Dedicated status page plus multi-channel proactive notification, with pre-written templates for rapid response.**

**Communication channels:**

| Channel | Audience | Trigger | SLA |
|---------|----------|---------|-----|
| Status page (status.rossos.com) | Public | Any component degradation | Updated within 5 minutes of detection |
| In-app banner | Active users | Partial availability | Immediate (served from CDN, independent of app servers) |
| Email | All company owners + admins | Platform-wide outage | Sent within 15 minutes of confirmed outage |
| SMS (Enterprise tier) | Designated emergency contacts | Platform-wide outage lasting > 15 minutes | Sent within 20 minutes |
| Twitter/X (@RossOSstatus) | Public | Major outages | Posted within 30 minutes |

**Status page components monitored:**

- Web Application
- API
- Database
- File Storage
- AI Processing (Claude API)
- QuickBooks Integration
- Client Portal
- Email Notifications

**Pre-written communication templates:**

Templates are maintained for each severity level so that on-call engineers can publish updates quickly without drafting from scratch:

- **Investigating**: "We are investigating reports of [component] issues. Some users may experience [symptom]. We will provide an update within 30 minutes."
- **Identified**: "We have identified the cause of the [component] issue. [Brief description]. Our team is working on a fix. Estimated resolution: [time]."
- **Monitoring**: "A fix has been deployed for the [component] issue. We are monitoring to confirm stability. If you continue to experience issues, please contact support."
- **Resolved**: "The [component] issue has been resolved. The incident lasted [duration]. Root cause: [brief description]. We will publish a full post-mortem within 48 hours."

**Post-incident:**

Every outage lasting more than 15 minutes produces a public post-mortem within 48 hours, published to the status page blog. The post-mortem includes: timeline, root cause, impact scope (number of affected tenants), corrective actions taken, and preventive measures planned.

---

### 2.6 Data Export for Business Continuity (GAP-596)

**GAP-596: What about data export for business continuity?**

**Decision: Full tenant data export available at any time in standard open formats. No lock-in, no proprietary formats, no export fees.**

**This is a core product principle:** RossOS will never hold customer data hostage. This directly differentiates us from competitors like Buildertrend who make data export difficult or impossible.

**Export formats:**

| Data Type | Format | Details |
|-----------|--------|---------|
| Structured data (jobs, invoices, budgets, etc.) | CSV + JSON | One CSV file per table. One JSON file containing full relational graph with foreign key references preserved. |
| Documents and files | Original format (PDF, DOCX, images) | Organized in folders matching the RossOS folder structure. |
| Photos | Original resolution (JPEG, PNG) | With EXIF metadata preserved. Organized by job. |
| Reports | PDF | All generated reports included as PDFs. |
| Audit trail | JSON | Complete activity log for the tenant. |

**Export mechanisms:**

1. **Self-service export (Settings > Company > Export Data)**:
   - Company owner or admin initiates export
   - System generates a ZIP archive containing all tenant data
   - Download link sent via email, valid for 72 hours
   - Large exports (> 5 GB) are split into multiple ZIP files
   - Export includes a `README.txt` describing the file structure and a `schema.json` documenting all table schemas

2. **Scheduled automatic exports (Enterprise tier)**:
   - Weekly full export to customer-provided S3 bucket or SFTP server
   - Configured in Settings > Integrations > Data Export
   - Encrypted in transit (TLS) and at rest (AES-256)

3. **API-based export**:
   - All data accessible via the public API (Module 45)
   - Paginated endpoints with bulk export support
   - Rate-limited but not artificially throttled for export purposes

**Business continuity guarantee (contractual):**

- Terms of service guarantee: If RossOS ceases operations, all tenant data will be maintained and accessible for export for a minimum of 90 days
- Export links are emailed to all company owners automatically
- Data format documentation is published publicly so that data remains usable without RossOS software
- For Enterprise tier: formal third-party data escrow arrangement available (using Iron Mountain or equivalent provider)

---

### 2.7 Platform Rollback (GAP-597)

**GAP-597: How do you handle platform rollback?**

**Decision: Blue-green deployment for instant application rollback. Feature flags for granular feature rollback. Reversible migrations for database rollback.**

**Application rollback (< 5 minutes):**

```
                    ┌──────────────┐
                    │ Load Balancer │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────▼────────┐      ┌────────▼────────┐
     │   Blue (v2.3)   │      │  Green (v2.4)   │
     │   (previous)    │      │  (current)      │
     │                 │      │                 │
     │  ┌───────────┐  │      │  ┌───────────┐  │
     │  │ App x3    │  │      │  │ App x3    │  │
     │  └───────────┘  │      │  └───────────┘  │
     └─────────────────┘      └─────────────────┘
```

- Both the current and previous version run simultaneously
- The load balancer routes 100% of traffic to the active (green) environment
- Rollback: Switch the load balancer to route traffic to blue. Takes < 5 minutes including DNS propagation
- The previous version is kept running for 24 hours after each deployment
- Rollback is a one-click operation in the deployment dashboard

**Feature flag rollback (< 1 minute):**

- Every new feature is behind a feature flag (Module 02 -- Configuration Engine)
- Feature flags are evaluated at runtime, not compile time
- Disabling a flag takes effect immediately for all users without a deployment
- Flags can be toggled per company (for beta testing) or globally
- The feature flag system itself is independent of the main application -- it is a simple key-value lookup backed by a CDN-cached configuration endpoint

**Database rollback (15-60 minutes):**

- Schema migrations include `down` scripts (see GAP-539)
- Before applying a migration to production, it is tested on a staging database clone
- If a migration must be rolled back:
  1. Halt the application deployment (revert to blue)
  2. Execute the `down` migration script
  3. Verify schema matches the previous version
  4. Resume traffic to the blue (previous version) environment

**Rollback decision criteria:**

| Severity | Threshold | Action |
|----------|-----------|--------|
| P0 -- Data loss or corruption | Immediate | Full rollback (app + DB migration) within 30 minutes |
| P1 -- Feature broken for all users | < 1 hour | Feature flag disable first. Full rollback if flag does not resolve. |
| P2 -- Feature broken for some users | < 4 hours | Feature flag disable. Investigate and fix forward. |
| P3 -- Minor visual or UX regression | Next business day | Fix forward in next release. No rollback. |

---

### 2.8 Incremental vs. Full Backups (GAP-598)

**GAP-598: What about incremental backups vs. full backups?**

**Decision: Continuous incremental (WAL archiving) plus daily full snapshots. Tenant-level logical exports supplement infrastructure backups.**

**Infrastructure-level backups (managed by Supabase):**

| Backup Type | Frequency | Retention | Mechanism |
|-------------|-----------|-----------|-----------|
| WAL archiving (continuous incremental) | Continuous -- every committed transaction | Matches PITR retention (7/14/30 days by tier) | PostgreSQL write-ahead log streamed to durable object storage. Enables point-in-time recovery to any second. |
| Daily full snapshot | Once daily (02:00 UTC) | 7/30/90 days by tier | `pg_dump`-equivalent logical backup of the entire database. Stored compressed in S3. |
| Storage backup (files) | Continuous | Indefinite (S3 durability) | S3 cross-region replication. Objects are durable upon write. Versioning enabled for accidental delete protection. |

**Why both incremental and full:**

- WAL archiving provides near-zero RPO and fine-grained recovery -- you can restore to "2:47:32 PM yesterday"
- Daily full snapshots provide a known-good baseline that does not depend on replaying a chain of WAL segments. They are faster to restore from when the full database is needed.
- The combination ensures that even if WAL archiving has a gap (extremely unlikely but theoretically possible during infrastructure issues), the daily snapshot limits data loss to at most 24 hours

**Tenant-level backups (application-managed):**

In addition to infrastructure backups, the application maintains tenant-level logical exports:

- **Automatic**: For Enterprise tier, a weekly `pg_dump` filtered to the tenant's `company_id` is generated and stored in the tenant's designated S3 bucket
- **On-demand**: Any company owner can trigger a full data export (see GAP-596)
- **Pre-migration**: Before any data migration or bulk operation, a tenant-scoped snapshot is taken (see GAP-539)

**Backup verification:**

- Daily: Automated check that the latest daily snapshot exists and is the expected size (within 10% of previous day)
- Weekly: Automated restore of the latest daily snapshot to a test environment, run the integrity checker (see GAP-544) against the restored data
- Monthly: Manual verification that PITR works by restoring to a random point in the past week and spot-checking data

---

## 3. Security & Compliance

### 3.1 State-Specific Data Privacy Laws (GAP-1109)

**GAP-1109: State-specific data privacy laws -- emerging laws in TX, FL, CO, VA, CT.**

**Decision: Build a privacy compliance framework that satisfies the strictest current state law (currently Colorado Privacy Act) so that all other state requirements are automatically met. Monitor legislative changes quarterly.**

**Relevant state laws and their effective dates:**

| State | Law | Effective | Key Requirements |
|-------|-----|-----------|-----------------|
| Virginia | VCDPA | Jan 2023 | Consumer rights (access, delete, correct, portability), data protection assessments, opt-out of sale/targeted advertising |
| Colorado | CPA | Jul 2023 | All of VCDPA plus universal opt-out mechanism, purpose limitation, data minimization |
| Connecticut | CTDPA | Jul 2023 | Similar to CPA, consent for sensitive data processing |
| Texas | TDPSA | Jul 2024 | Consumer rights, data protection assessments, no revenue threshold (applies to all businesses) |
| Florida | FDBR | Jul 2024 | Narrower scope (revenue > $1B or specific data activities), but includes children's data protections |

**RossOS compliance approach:**

1. **Data minimization**: Collect only data necessary for the stated purpose. The schema does not include fields that are not used by the application. No tracking pixels, no third-party analytics cookies on tenant data.

2. **Purpose limitation**: Data collected for construction project management is used only for construction project management. Tenant data is never used for advertising, cross-tenant profiling, or sold to third parties.

3. **Consumer rights implementation:**

   | Right | Implementation |
   |-------|---------------|
   | Right to access | Full data export (GAP-596). API endpoint `GET /privacy/data-request` returns all PII for a specified individual. |
   | Right to delete | `DELETE /privacy/data-request` triggers anonymization of PII fields for the specified individual. Construction records are retained (required for lien rights, warranty obligations, tax records) but PII is replaced with "[REDACTED]". |
   | Right to correct | Standard entity update endpoints (PATCH). No special privacy endpoint needed. |
   | Right to portability | Data export in machine-readable JSON format (GAP-596). |
   | Right to opt-out of sale | N/A -- RossOS does not sell data. Privacy policy states this explicitly. |

4. **Data Protection Assessments**: Required by CPA/VCDPA for processing that presents a heightened risk of harm. RossOS conducts and documents a DPA for:
   - AI-powered document processing (processes PII in invoices, contracts)
   - Client portal (processes homeowner PII)
   - QuickBooks integration (transfers PII to third party)

5. **Sensitive data**: RossOS processes limited sensitive data categories:
   - Tax IDs (EINs for vendors) -- encrypted at rest with AES-256, access logged
   - Social Security Numbers -- NOT stored in RossOS. If present in uploaded documents, the AI processing layer detects and redacts before storage.
   - Financial account information -- NOT stored. Payment processing uses Stripe tokenization (see GAP-1110).

6. **Compliance monitoring**: Legal counsel reviews state privacy law changes quarterly. The privacy compliance matrix is updated accordingly. Engineering receives a prioritized list of any new technical requirements.

---

### 3.2 PCI DSS Compliance (GAP-1110)

**GAP-1110: PCI DSS compliance -- if handling payment card data.**

**Decision: RossOS does NOT handle, store, process, or transmit payment card data. All payment processing is fully delegated to Stripe, which is a PCI DSS Level 1 certified service provider. This reduces RossOS's PCI scope to SAQ-A (the lightest compliance level).**

**Architecture for payment flows:**

```
   Client Portal                    RossOS Server              Stripe
       │                                │                        │
       │  1. "Pay Draw" clicked         │                        │
       │──────────────────────────────►│                        │
       │                                │  2. Create PaymentIntent│
       │                                │───────────────────────►│
       │                                │  3. Return client_secret│
       │                                │◄───────────────────────│
       │  4. Render Stripe Elements    │                        │
       │◄──────────────────────────────│                        │
       │                                │                        │
       │  5. Card details entered       │                        │
       │  (directly to Stripe, never    │                        │
       │   touches RossOS server)       │                        │
       │───────────────────────────────────────────────────────►│
       │                                │                        │
       │                                │  6. Webhook: payment   │
       │                                │     succeeded          │
       │                                │◄───────────────────────│
       │                                │  7. Update draw status │
       │  8. Confirmation displayed     │                        │
       │◄──────────────────────────────│                        │
```

**Key design rules:**

- Card numbers, CVVs, and expiration dates NEVER touch RossOS servers, logs, or databases
- Stripe Elements (client-side iframe) handles all card input directly to Stripe
- RossOS stores only Stripe customer IDs, payment intent IDs, and transaction amounts -- never card data
- All communication with Stripe uses TLS 1.2+ and API keys stored in encrypted environment variables
- Stripe webhook signatures are verified on every callback to prevent forgery

**PCI SAQ-A compliance checklist:**

| Requirement | Status |
|-------------|--------|
| Cardholder data not stored, processed, or transmitted by RossOS | Enforced by architecture |
| All payment pages served over HTTPS | Enforced by Cloudflare + HSTS |
| Stripe.js loaded directly from js.stripe.com (no self-hosting) | Enforced in CSP headers |
| Quarterly ASV (Approved Scanning Vendor) scan | Scheduled (see GAP-1121) |
| Annual SAQ-A self-assessment | Completed annually, filed with acquiring bank |

**Subscription billing (Module 43):**

Subscription payments for RossOS itself also use Stripe Billing. Customers enter payment methods in Stripe's hosted checkout or customer portal. RossOS never sees the card data.

---

### 3.3 Penetration Testing (GAP-1120)

**GAP-1120: Penetration testing -- quarterly; results documented.**

**Decision: Quarterly external penetration tests conducted by a third-party security firm, plus continuous automated security testing in CI/CD.**

**Penetration testing program:**

| Aspect | Detail |
|--------|--------|
| Frequency | Quarterly (January, April, July, October) |
| Provider | Retained third-party CREST-certified firm (selected via RFP process; rotated every 2 years to ensure fresh perspective) |
| Scope | Full application (web app, API, client portal, vendor portal), infrastructure (Supabase configuration, network, DNS), and social engineering (phishing simulation for team members) |
| Methodology | OWASP Testing Guide v4, PTES (Penetration Testing Execution Standard) |
| Output | Formal report with findings classified by CVSS score, reproduction steps, and remediation recommendations |

**Remediation SLAs:**

| CVSS Score | Severity | Remediation SLA |
|------------|----------|----------------|
| 9.0 - 10.0 | Critical | 24 hours (emergency patch) |
| 7.0 - 8.9 | High | 7 days |
| 4.0 - 6.9 | Medium | 30 days |
| 0.1 - 3.9 | Low | 90 days (next quarterly release) |

**Documentation and transparency:**

- All penetration test reports are stored in a secure, access-controlled repository (not in the application codebase)
- A summary of findings (number of issues by severity, remediation status) is shared with Enterprise customers upon request
- Penetration test results feed into the vulnerability management dashboard (see GAP-1121)
- Year-over-year trends are tracked to measure security posture improvement

**Internal security testing (continuous):**

In addition to external pen tests, the CI/CD pipeline includes:
- `npm audit` on every build -- fails the build on critical vulnerabilities
- SAST (Static Application Security Testing) via Semgrep -- scans for common vulnerability patterns (SQL injection, XSS, insecure deserialization)
- Dependency scanning via Dependabot -- automated PRs for vulnerable dependencies
- CSP (Content Security Policy) header validation on every deployment
- Supabase RLS policy tests -- automated tests that attempt cross-tenant data access and verify denial

---

### 3.4 Vulnerability Scanning (GAP-1121)

**GAP-1121: Vulnerability scanning -- continuous; automated patching.**

**Decision: Continuous automated vulnerability scanning across all layers (dependencies, containers, infrastructure, application). Automated patching for low-risk updates; human-reviewed patching for breaking changes.**

**Scanning layers:**

| Layer | Tool | Frequency | Scope |
|-------|------|-----------|-------|
| NPM dependencies | Dependabot + `npm audit` | On every commit + daily scan | All `package.json` dependencies (production and dev) |
| Container images | Trivy (or Snyk Container) | On every image build + weekly full scan | Base images, OS packages, application dependencies |
| Infrastructure | Supabase security advisories + AWS Inspector | Continuous | Database configuration, network ACLs, storage bucket policies |
| Application code | Semgrep (SAST) | On every PR + nightly full scan | Source code patterns (injection, auth bypass, sensitive data exposure) |
| Secrets | GitGuardian (or truffleHog) | On every commit | Source code and git history scanned for accidentally committed credentials |
| External attack surface | Qualys (ASV-certified) or equivalent | Quarterly | Public-facing endpoints, SSL/TLS configuration, open ports |

**Automated patching policy:**

| Update Type | Automation Level | Process |
|-------------|-----------------|---------|
| Patch version (e.g., 1.0.1 -> 1.0.2) | Fully automated | Dependabot PR auto-merged if CI passes (tests green, no breaking changes) |
| Minor version (e.g., 1.0 -> 1.1) | Semi-automated | Dependabot PR created. Auto-merged if CI passes AND no API surface changes detected. Otherwise, human review. |
| Major version (e.g., 1.x -> 2.x) | Manual | Dependabot PR created. Requires human review, testing, and approval. Scheduled for next sprint. |
| Critical security patch (any version) | Emergency | PR created immediately. Fast-tracked review. Deployed within 24 hours. |

**Vulnerability management dashboard:**

A centralized dashboard (part of Module 49 -- Platform Analytics) tracks:
- Total open vulnerabilities by severity
- Mean time to remediate (MTTR) by severity
- Aging vulnerabilities (past SLA)
- Vulnerability trend over time (target: fewer open vulns each quarter)
- Compliance status for ASV scanning requirements

**Supabase-specific security monitoring:**

- Database extensions reviewed quarterly (only approved extensions enabled)
- RLS policies audited via automated tests (every table must have RLS enabled and at least one policy)
- Connection pool configuration reviewed monthly (connection limits, SSL enforcement)
- Supabase project settings reviewed quarterly (MFA enabled for dashboard access, API keys rotated)

---

### 3.5 Incident Response Plan (GAP-1122)

**GAP-1122: Incident response plan -- documented and tested.**

**Decision: Formal incident response plan following NIST SP 800-61 framework (Preparation, Detection, Containment, Eradication, Recovery, Lessons Learned). Tested semi-annually via tabletop exercises.**

**Incident severity classification:**

| Severity | Definition | Examples | Response Time |
|----------|-----------|----------|--------------|
| SEV-1 (Critical) | Active data breach, complete platform outage, or ransomware | Unauthorized access to tenant data, database encryption by attacker, all customers unable to access platform | Immediate (all-hands) |
| SEV-2 (High) | Partial data exposure, significant feature outage affecting multiple tenants | RLS bypass discovered, API authentication bypass, QuickBooks sync exposing cross-tenant data | < 1 hour |
| SEV-3 (Medium) | Vulnerability discovered (not yet exploited), single-tenant impact | XSS vulnerability found in pen test, one tenant's data export fails, suspicious login patterns | < 4 hours |
| SEV-4 (Low) | Minor security finding, no data impact | Expired SSL certificate on non-production environment, failed login brute-force attempt (blocked by rate limiting) | Next business day |

**Incident response team:**

| Role | Responsibility | Primary | Backup |
|------|---------------|---------|--------|
| Incident Commander (IC) | Overall coordination, communication, decision-making | CTO | Engineering Lead |
| Technical Lead | Investigation, containment, remediation | On-call Senior Engineer | Engineering Lead |
| Communications Lead | Customer/public communication, status page updates | Head of Customer Success | CEO |
| Legal/Compliance | Regulatory notification assessment, evidence preservation | Legal Counsel (external) | CEO |

**Response procedure (SEV-1 and SEV-2):**

1. **Detection** (0-5 minutes):
   - Automated alert fires (from monitoring, WAF, or anomaly detection)
   - OR manual report from customer, employee, or security researcher
   - On-call engineer acknowledges alert within 5 minutes

2. **Triage** (5-15 minutes):
   - Assess severity using classification table above
   - Open incident channel (dedicated Slack channel or equivalent)
   - Page Incident Commander if SEV-1 or SEV-2

3. **Containment** (15-60 minutes):
   - Isolate affected systems (e.g., disable compromised API key, block IP, revoke session)
   - Preserve forensic evidence (snapshot logs, database state, network captures)
   - For data breach: determine scope of exposed data, identify affected tenants

4. **Eradication** (1-24 hours):
   - Remove attacker access (rotate all credentials, patch vulnerability)
   - Verify no persistence mechanisms (backdoors, new accounts)
   - Deploy fix to all environments

5. **Recovery** (1-48 hours):
   - Restore affected systems from known-good state if necessary
   - Gradually restore service with monitoring
   - Verify integrity of all tenant data (run integrity checker -- GAP-544)

6. **Notification** (within regulatory timelines):
   - Affected tenants notified within 72 hours (GDPR standard, adopted as baseline even for US-only operations)
   - State attorney general notifications where required (varies by state -- see GAP-1109 for applicable laws)
   - If payment data involved (unlikely per GAP-1110 architecture): Stripe handles PCI breach notification

7. **Post-incident** (within 1 week):
   - Root cause analysis documented
   - Incident timeline published internally
   - Customer-facing post-mortem for SEV-1 incidents
   - Action items created and tracked to completion
   - Lessons learned shared with full team

**Testing cadence:**

- Tabletop exercise: Semi-annually (simulated breach scenario, full team walkthrough)
- Live drill: Annually (controlled red team exercise against staging environment)
- After any real incident: Retrospective and plan update within 1 week

---

### 3.6 Business Continuity Plan (GAP-1123)

**GAP-1123: Business continuity plan -- documented and tested.**

**Decision: Comprehensive BCP covering technology failures, vendor failures, personnel loss, and natural disasters. Tested annually via tabletop exercise.**

**Business impact analysis:**

| Business Function | Maximum Tolerable Downtime | Dependencies | Priority |
|-------------------|--------------------------|--------------|----------|
| Core platform (CRUD, data access) | 4 hours | Supabase, Vercel/hosting, Cloudflare | P0 |
| Invoice processing (AI) | 24 hours | Anthropic Claude API, Supabase Storage | P1 |
| QuickBooks sync | 48 hours | Intuit API | P2 |
| Email notifications | 24 hours | Email provider (Resend/Postmark) | P1 |
| Client portal | 8 hours | Same as core platform | P0 |
| Reporting and analytics | 48 hours | Supabase (read replica) | P2 |
| File uploads/downloads | 8 hours | Supabase Storage (S3) | P1 |

**Continuity strategies by risk:**

**1. Cloud provider failure (Supabase):**
- Mitigation: Daily database exports to independent S3 bucket (not Supabase-managed)
- Recovery: Stand up PostgreSQL on AWS RDS or Neon from latest export. Update connection strings. Estimated recovery: 4-8 hours.
- Prevention: Supabase runs on AWS with multi-AZ. Historical uptime > 99.95%.

**2. Cloud provider failure (hosting/Vercel):**
- Mitigation: Application is containerized and can be deployed to any cloud (AWS ECS, Google Cloud Run, Railway)
- Recovery: Deploy latest container image to alternate provider. Update DNS. Estimated recovery: 2-4 hours.
- Prevention: Vercel runs on AWS with global edge network. Historical uptime > 99.99%.

**3. Third-party API failure (Anthropic/Claude):**
- Mitigation: AI invoice processing degrades gracefully. Users can manually enter invoice data. Queue AI processing for retry when API recovers.
- Recovery: No action needed -- automatic retry with exponential backoff.

**4. Third-party API failure (QuickBooks/Intuit):**
- Mitigation: All sync operations are queued. RossOS continues to function as standalone. Sync resumes automatically.
- Recovery: No action needed -- automatic retry.

**5. Key personnel loss:**
- Mitigation: All systems documented (this document + architecture docs). No single person holds exclusive credentials. All secrets in centralized vault (e.g., HashiCorp Vault or AWS Secrets Manager) with at least two authorized personnel.
- Recovery: Cross-training program ensures at least two engineers can perform any operational task.

**6. Office/facility loss (natural disaster):**
- Mitigation: Fully remote-capable team. All development on cloud-hosted infrastructure. No on-premise servers.
- Recovery: No action needed for platform operations. Business operations continue from any location with internet access.

**BCP testing:**
- Annual tabletop exercise simulating simultaneous failure of primary hosting and a key team member
- Results documented with gaps identified and remediation tracked

---

### 3.7 Disaster Recovery Targets (GAP-1124)

**GAP-1124: Disaster recovery -- RPO < 1 hour, RTO < 4 hours.**

**Decision: Confirmed. RPO < 1 hour and RTO < 4 hours are the committed targets, with infrastructure designed to significantly exceed these targets under normal failure scenarios.**

This section consolidates the DR targets from GAP-591 and GAP-592 and provides the implementation verification approach.

**Target confirmation:**

| Metric | Committed Target | Designed Capability | Verification Method |
|--------|-----------------|--------------------|--------------------|
| RPO | < 1 hour | Near-zero (continuous WAL archiving) | Quarterly PITR restore test (see GAP-594 Q1 drill) |
| RTO | < 4 hours | < 15 minutes for single-component; < 2 hours for region failover | Quarterly failover test (see GAP-594 Q2 drill) |

**RPO implementation details:**

- Supabase continuous WAL archiving streams every committed transaction to durable storage
- The effective RPO for database writes is seconds, not minutes
- File storage (Supabase Storage / S3) has immediate durability -- a successful upload response means the file is already replicated across multiple AZs
- The "< 1 hour" commitment is the contractual guarantee accounting for extreme edge cases. The engineering target is "< 5 minutes" and the design achieves "near-zero"

**RTO implementation details:**

- Application layer: Auto-scaling group with health checks. Failed instances replaced in < 2 minutes.
- Database layer: Automated failover to standby replica in < 15 minutes. Supabase manages this.
- Full region loss: Manual failover procedure (documented in runbook) targeting < 2 hours. Involves promoting read replica, repointing DNS, and scaling up standby application servers.
- Full database restore from PITR: < 4 hours. This is the worst-case scenario requiring Supabase support involvement.

**Contractual SLA (by tier):**

| Tier | Uptime SLA | RPO Guarantee | RTO Guarantee | Credits for Breach |
|------|-----------|--------------|--------------|-------------------|
| Starter | 99.5% (43.8 hrs/yr downtime) | < 24 hours | < 24 hours | None |
| Pro | 99.9% (8.76 hrs/yr downtime) | < 1 hour | < 4 hours | 10% monthly credit per 0.1% below SLA |
| Enterprise | 99.95% (4.38 hrs/yr downtime) | < 1 hour | < 2 hours | 25% monthly credit per 0.1% below SLA |

**Monitoring and alerting for SLA compliance:**

- Uptime tracked via external monitoring (UptimeRobot or Pingdom) checking the `/health` endpoint every 30 seconds from 5 geographic locations
- Monthly uptime report generated automatically and published to the admin dashboard
- SLA breach triggers automatic notification to the customer success team and engineering lead

**Annual DR review:**

Every January, the DR plan is reviewed and updated:
- Verify all targets are being met (review quarterly test results)
- Assess whether targets should be tightened based on growth and customer expectations
- Update runbooks for any infrastructure changes made during the year
- Renew or update contracts with third-party DR service providers

---

## Appendix: Gap Item Cross-Reference

| Gap ID | Section | Status | Summary |
|--------|---------|--------|---------|
| GAP-538 | 1.1 | Decided | Three-tier validation: platform-enforced, company-configurable (JSONB), custom required fields |
| GAP-539 | 1.2 | Decided | Paired up/down migration scripts, pre-operation snapshots, 72-hour rollback window |
| GAP-541 | 1.3 | Decided | Optimistic concurrency (updated_at), real-time presence for high-contention entities, advisory locks for state transitions |
| GAP-543 | 1.4 | Decided | Transactional sync engine with entity locking, conflict rules (QB wins for financial, RossOS wins for project), sync ledger |
| GAP-544 | 1.5 | Decided | Database constraints, nightly integrity checker, PITR for selective restore, external input validation |
| GAP-591 | 2.1 | Decided | RPO < 1 hour (effective near-zero via continuous WAL archiving) |
| GAP-592 | 2.2 | Decided | RTO < 4 hours (< 15 min for single component, < 2 hours for region failover) |
| GAP-593 | 2.3 | Decided | Active-passive multi-region (us-east-1 primary, us-west-2 standby), Cloudflare CDN |
| GAP-594 | 2.4 | Decided | Quarterly DR drills on rotating schedule (restore, failover, export, communication) |
| GAP-595 | 2.5 | Decided | Status page + in-app banner + email + SMS (enterprise) + pre-written templates |
| GAP-596 | 2.6 | Decided | Full data export at any time, open formats (CSV/JSON), 90-day post-dissolution guarantee |
| GAP-597 | 2.7 | Decided | Blue-green deployment (< 5 min rollback), feature flags (< 1 min), reversible migrations |
| GAP-598 | 2.8 | Decided | Continuous WAL + daily snapshots, tenant-level exports, weekly automated restore verification |
| GAP-1109 | 3.1 | Decided | Comply with strictest state law (CPA), quarterly legal review, data minimization, consumer rights endpoints |
| GAP-1110 | 3.2 | Decided | No card data touches RossOS -- Stripe Elements + webhooks, SAQ-A compliance |
| GAP-1120 | 3.3 | Decided | Quarterly external pen test (CREST-certified firm), CVSS-based remediation SLAs, continuous SAST in CI |
| GAP-1121 | 3.4 | Decided | Continuous scanning (Dependabot, Trivy, Semgrep, GitGuardian, Qualys), automated patching policy |
| GAP-1122 | 3.5 | Decided | NIST 800-61 IRP, four severity levels, defined roles, semi-annual tabletop exercises |
| GAP-1123 | 3.6 | Decided | BCP covering all vendor/personnel/facility risks, annual tabletop, no single points of failure |
| GAP-1124 | 3.7 | Decided | RPO < 1 hour, RTO < 4 hours confirmed, tiered SLA with credits, annual review |
