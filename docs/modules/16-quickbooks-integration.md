# Module 16: QuickBooks & Accounting Integration

**Phase:** 3 - Financial Power
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

Bi-directional sync engine connecting the construction management platform to external accounting systems. QuickBooks Online is the primary target with Xero as a supported alternative. The integration eliminates double-entry by synchronizing invoices, payments, journal entries, vendors, and customers between systems. Each builder configures their own account mapping, sync frequency, and conflict resolution rules. The architecture supports future expansion to Sage, QuickBooks Desktop, and Viewpoint.

---

## Gap Items Addressed

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 431 | Chart of accounts mapping must be configurable per builder | Account Mapping Configuration |
| 432 | Supporting multiple accounting systems (QBO, Sage, Xero, Viewpoint) | Provider abstraction layer |
| 506 | Public API (REST/GraphQL) for third-party integrations | Integration API endpoints |
| 507 | Webhooks for real-time event notifications | Outbound webhook dispatch |
| 508 | OAuth for third-party integrations | OAuth2 token management |
| 509 | Integration health monitoring | Sync dashboard & alerting |
| 510 | Integration data mapping per-tenant | Per-builder field mapping config |
| 511 | Integration marketplace | Pre-built connector model |
| 512 | Integrations that go down (queue, retry, notify) | Retry queue & dead-letter handling |
| 514 | Bulk data import/export (CSV, Excel, JSON) | Bulk sync & initial import |
| 515 | Zapier/Make integration | Webhook-based triggers for automation platforms |
| 518 | Material delivery tracking integration | Delivery status sync to PO module |
| 520 | State licensing database integration | Vendor license verification |

---

## Detailed Requirements

### 1. OAuth2 Connection Management
- Builder initiates connection from Settings > Integrations.
- OAuth2 authorization code flow with PKCE for QuickBooks Online.
- OAuth2 flow for Xero with tenant selection (Xero orgs).
- Encrypted token storage (access + refresh) per builder, per provider.
- Automatic token refresh before expiration. Alert builder if refresh fails.
- Disconnect flow that revokes tokens and clears local mapping data.
- Support for multiple simultaneous connections (e.g., QBO for accounting + a delivery tracking service).

### 2. Account Mapping Configuration
- On first connection, pull the builder's chart of accounts from QBO/Xero.
- Present a mapping UI: platform cost codes on the left, accounting accounts on the right.
- Support one-to-one and many-to-one mapping (multiple cost codes to one GL account).
- Default mapping suggestions based on account name similarity (fuzzy match).
- Unmapped cost codes are flagged; transactions for unmapped codes are held in a review queue.
- Mapping is versioned. If the builder changes a mapping, historical transactions are not retroactively altered.
- Separate mapping profiles for: Revenue accounts, Expense accounts, Asset accounts (stored materials), Liability accounts (retainage).

### 3. Transaction Types Synced

| Direction | Entity | Details |
|-----------|--------|---------|
| Push | Invoices (AR) | Draw requests and client invoices created in platform push to QBO as Invoices |
| Push | Bills (AP) | Vendor invoices approved in platform push to QBO as Bills |
| Push | Journal Entries | Manual adjustments, retainage entries, WIP adjustments |
| Push | Customers | New clients created in platform sync as QBO Customers |
| Push | Vendors | New vendors created in platform sync as QBO Vendors |
| Pull | Payments Received | Client payments recorded in QBO pull back to mark invoices paid |
| Pull | Bill Payments | Vendor payments made in QBO pull back to update AP status |
| Pull | Bank Deposits | Deposit references for payment reconciliation |
| Bi-directional | Chart of Accounts | Initial pull, then push new accounts as needed |

### 4. Sync Scheduling & Modes
- **Manual sync:** Builder clicks "Sync Now" for a specific entity type or all.
- **Scheduled sync:** Configurable interval per builder (every 15 min, hourly, daily, custom cron).
- **Real-time push:** Option to push immediately on record creation/approval (webhook-triggered).
- **Initial import:** First-time bulk sync to pull existing QBO data into the platform.
- Sync window configuration: builders can restrict sync to business hours to avoid conflicts with their bookkeeper.

### 5. Conflict Resolution
- **Last-write-wins** (default): Most recent change takes precedence, with audit log of overwritten value.
- **Platform-wins:** Platform is the source of truth; QBO changes are overwritten on next sync.
- **QBO-wins:** QBO is the source of truth; platform values are overwritten.
- **Manual review:** Conflicts are queued for human review. Builder sees a conflict resolution UI showing both values side-by-side.
- Conflict detection: compare checksums of key fields (amount, date, status) before write.
- Per-entity conflict strategy: e.g., invoices use "platform-wins" but payments use "QBO-wins."

### 6. Xero Support
- Same integration architecture with Xero-specific OAuth2 tenant flow.
- Xero uses different terminology (Bills vs Invoices, Contacts vs Customers/Vendors). Mapping layer translates.
- Xero tracking categories mapped to platform cost codes.
- Xero bank feeds provide an additional reconciliation data source.

### 7. Bank Feed Integration Concepts
- Not a direct bank connection. The platform leverages the accounting system's bank feed.
- Payments synced from QBO/Xero include bank transaction references.
- Reconciliation status visible in platform: matched, unmatched, partially matched.
- Future: direct bank feed via Plaid for builders without QBO/Xero.

### 8. Error Handling & Retry
- Transient errors (rate limits, timeouts): automatic retry with exponential backoff (max 5 retries over 2 hours).
- Permanent errors (invalid data, missing required field): queued to error log with actionable message.
- Dead-letter queue for items that fail all retries. Builder is notified via in-app alert and email.
- Error categorization: auth errors, data validation errors, rate limit errors, network errors.
- Bulk error resolution: "Retry All Failed" and "Dismiss All" actions.

### 9. Sync Dashboard
- Real-time status: last sync time, records synced, errors, warnings.
- Per-entity sync history with expandable detail rows.
- Health indicator: green (all syncs successful), yellow (warnings present), red (errors or stale sync).
- Filterable error log with export capability.
- Connection status with days until token expiration.

---

## Database Tables

```sql
-- Accounting provider connections
CREATE TABLE v2_integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  provider TEXT NOT NULL CHECK (provider IN ('quickbooks_online', 'xero', 'sage')),
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'expired')),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  provider_tenant_id TEXT,          -- QBO realm_id or Xero tenant_id
  provider_company_name TEXT,
  sync_schedule TEXT DEFAULT 'hourly',
  conflict_strategy TEXT DEFAULT 'last_write_wins',
  last_sync_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',      -- provider-specific settings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(builder_id, provider)
);

-- Account mapping: platform cost codes <-> accounting system accounts
CREATE TABLE v2_account_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  connection_id UUID NOT NULL REFERENCES v2_integration_connections(id),
  platform_cost_code_id UUID,
  platform_entity_type TEXT NOT NULL,   -- 'cost_code', 'revenue', 'asset', 'liability'
  provider_account_id TEXT NOT NULL,
  provider_account_name TEXT,
  provider_account_type TEXT,
  mapping_direction TEXT DEFAULT 'both' CHECK (mapping_direction IN ('push', 'pull', 'both')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync log for every sync operation
CREATE TABLE v2_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  connection_id UUID NOT NULL REFERENCES v2_integration_connections(id),
  sync_type TEXT NOT NULL,            -- 'manual', 'scheduled', 'real_time'
  entity_type TEXT NOT NULL,          -- 'invoice', 'payment', 'vendor', 'customer', 'journal_entry'
  direction TEXT NOT NULL,            -- 'push', 'pull'
  status TEXT NOT NULL,               -- 'started', 'completed', 'partial', 'failed'
  records_processed INTEGER DEFAULT 0,
  records_succeeded INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_summary TEXT
);

-- Individual record sync tracking
CREATE TABLE v2_sync_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_log_id UUID NOT NULL REFERENCES v2_sync_log(id),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  platform_entity_type TEXT NOT NULL,
  platform_entity_id UUID NOT NULL,
  provider_entity_id TEXT,
  direction TEXT NOT NULL,
  status TEXT NOT NULL,               -- 'synced', 'conflict', 'error', 'skipped'
  error_message TEXT,
  conflict_data JSONB,                -- both values when conflict detected
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/integrations/providers` | List available providers and connection status |
| GET | `/api/v1/integrations/connections` | List builder's active connections |
| POST | `/api/v1/integrations/connect/:provider` | Initiate OAuth flow, return redirect URL |
| GET | `/api/v1/integrations/callback/:provider` | OAuth callback handler |
| DELETE | `/api/v1/integrations/connections/:id` | Disconnect and revoke tokens |
| GET | `/api/v1/integrations/connections/:id/accounts` | Fetch provider's chart of accounts |
| GET | `/api/v1/integrations/mappings` | Get current account mappings |
| PUT | `/api/v1/integrations/mappings` | Save/update account mappings (bulk) |
| POST | `/api/v1/integrations/sync` | Trigger manual sync (body: entity types, direction) |
| GET | `/api/v1/integrations/sync/status` | Current sync status and health |
| GET | `/api/v1/integrations/sync/log` | Paginated sync history |
| GET | `/api/v1/integrations/sync/errors` | Unresolved sync errors |
| POST | `/api/v1/integrations/sync/errors/:id/retry` | Retry a failed sync record |
| POST | `/api/v1/integrations/sync/errors/retry-all` | Retry all failed records |
| DELETE | `/api/v1/integrations/sync/errors/:id` | Dismiss an error |
| GET | `/api/v1/integrations/conflicts` | List unresolved conflicts |
| POST | `/api/v1/integrations/conflicts/:id/resolve` | Resolve a conflict (body: chosen_value) |

---

## UI Components

1. **IntegrationsDashboard** - Overview of all connected services with health indicators.
2. **ConnectProviderWizard** - Step-by-step OAuth connection with provider selection.
3. **AccountMappingEditor** - Two-column drag-and-drop mapping of cost codes to GL accounts.
4. **SyncStatusPanel** - Real-time sync progress bar with entity-level breakdown.
5. **SyncHistoryTable** - Paginated log of past syncs with expandable detail rows.
6. **ErrorQueuePanel** - List of failed records with error messages, retry and dismiss actions.
7. **ConflictResolutionDialog** - Side-by-side comparison of conflicting values with resolution buttons.
8. **SyncSettingsForm** - Schedule, conflict strategy, and entity-level toggle configuration.

---

## Dependencies

- **Module 9:** Budget & Cost Tracking (cost codes for account mapping)
- **Module 10:** Contact/Vendor Management (vendor and customer data to sync)
- **Module 11:** Basic Invoicing (invoices and payments to sync)
- **Module 18:** Purchase Orders (bills/AP to sync)
- **External:** QuickBooks Online API, Xero API
- **Infrastructure:** Encrypted credential storage, background job processor (Bull/BullMQ)

---

## Open Questions

1. Should the initial QBO import include historical transactions, or only sync going forward?
2. What is the maximum acceptable sync latency for "real-time" mode? (Target: under 60 seconds)
3. Do we support QuickBooks Desktop via Web Connector in V1, or defer to V2?
4. Should bank feed reconciliation data be surfaced in the platform, or only in the accounting system?
5. How do we handle builders who switch from QBO to Xero mid-project? (Re-mapping, historical data)
6. What is the Zapier/Make trigger set for V1? (Invoice created, payment received, vendor added?)
