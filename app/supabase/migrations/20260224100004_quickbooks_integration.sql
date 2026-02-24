-- =============================================================================
-- Module 16: QuickBooks & Accounting Integration — V1 Foundation
-- =============================================================================
-- Tables: accounting_connections, sync_mappings, sync_logs, sync_conflicts
-- Bi-directional sync infrastructure for QBO, Xero, and Sage
-- =============================================================================

-- ── accounting_connections ────────────────────────────────────────────────────
-- One row per provider per company. Stores encrypted OAuth tokens and sync config.
CREATE TABLE IF NOT EXISTS accounting_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  provider VARCHAR(30) NOT NULL
    CHECK (provider IN ('quickbooks_online', 'xero', 'sage')),
  status VARCHAR(20) NOT NULL DEFAULT 'disconnected'
    CHECK (status IN ('disconnected', 'connected', 'syncing', 'error')),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  external_company_id VARCHAR(100),
  external_company_name VARCHAR(200),
  last_sync_at TIMESTAMPTZ,
  sync_direction VARCHAR(20) NOT NULL DEFAULT 'bidirectional'
    CHECK (sync_direction IN ('push', 'pull', 'bidirectional')),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(company_id, provider)
);

ALTER TABLE accounting_connections ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_accounting_connections_company_id
  ON accounting_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_accounting_connections_status
  ON accounting_connections(status);
CREATE INDEX IF NOT EXISTS idx_accounting_connections_provider
  ON accounting_connections(provider);

-- ── sync_mappings ────────────────────────────────────────────────────────────
-- Maps internal entities (vendors, clients, accounts, etc.) to their external IDs
-- in the connected accounting system.
CREATE TABLE IF NOT EXISTS sync_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  connection_id UUID NOT NULL REFERENCES accounting_connections(id),
  entity_type VARCHAR(30) NOT NULL
    CHECK (entity_type IN ('vendor', 'client', 'account', 'bill', 'invoice', 'payment')),
  internal_id UUID NOT NULL,
  external_id VARCHAR(200) NOT NULL,
  external_name TEXT,
  last_synced_at TIMESTAMPTZ,
  sync_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (sync_status IN ('synced', 'pending', 'error', 'conflict')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(connection_id, entity_type, internal_id)
);

ALTER TABLE sync_mappings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sync_mappings_company_id
  ON sync_mappings(company_id);
CREATE INDEX IF NOT EXISTS idx_sync_mappings_connection_id
  ON sync_mappings(connection_id);
CREATE INDEX IF NOT EXISTS idx_sync_mappings_entity_type
  ON sync_mappings(entity_type);
CREATE INDEX IF NOT EXISTS idx_sync_mappings_sync_status
  ON sync_mappings(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_mappings_internal_id
  ON sync_mappings(internal_id);
CREATE INDEX IF NOT EXISTS idx_sync_mappings_external_id
  ON sync_mappings(external_id);

-- ── sync_logs ────────────────────────────────────────────────────────────────
-- Audit trail of every sync operation: manual, scheduled, or incremental.
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  connection_id UUID NOT NULL REFERENCES accounting_connections(id),
  sync_type VARCHAR(20) NOT NULL
    CHECK (sync_type IN ('full', 'incremental', 'manual')),
  direction VARCHAR(10) NOT NULL
    CHECK (direction IN ('push', 'pull')),
  status VARCHAR(20) NOT NULL DEFAULT 'started'
    CHECK (status IN ('started', 'completed', 'partial', 'failed')),
  entities_processed INTEGER NOT NULL DEFAULT 0,
  entities_created INTEGER NOT NULL DEFAULT 0,
  entities_updated INTEGER NOT NULL DEFAULT 0,
  entities_failed INTEGER NOT NULL DEFAULT 0,
  error_details JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sync_logs_company_id
  ON sync_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_connection_id
  ON sync_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status
  ON sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at
  ON sync_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_sync_logs_company_connection
  ON sync_logs(company_id, connection_id);

-- ── sync_conflicts ───────────────────────────────────────────────────────────
-- Records that differ between platform and external accounting system,
-- awaiting human resolution.
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  connection_id UUID NOT NULL REFERENCES accounting_connections(id),
  entity_type VARCHAR(50) NOT NULL,
  internal_id UUID NOT NULL,
  external_id VARCHAR(200) NOT NULL,
  internal_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  external_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  field_conflicts JSONB NOT NULL DEFAULT '[]'::jsonb,
  resolution VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (resolution IN ('pending', 'use_internal', 'use_external', 'manual', 'skipped')),
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_company_id
  ON sync_conflicts(company_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_connection_id
  ON sync_conflicts(connection_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_resolution
  ON sync_conflicts(resolution);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_entity_type
  ON sync_conflicts(entity_type);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_company_pending
  ON sync_conflicts(company_id, resolution) WHERE resolution = 'pending';
