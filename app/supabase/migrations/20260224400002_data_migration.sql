-- ============================================================================
-- Module 42: Data Migration — V1 Foundation
--
-- Tables: migration_jobs, migration_field_mappings,
--         migration_mapping_templates, migration_validation_results,
--         migration_reconciliation
-- Multi-tenant via company_id + RLS. Soft delete via deleted_at on jobs.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. migration_jobs — core migration job records
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS migration_jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  source_platform   VARCHAR(50) NOT NULL DEFAULT 'other'
                    CHECK (source_platform IN ('buildertrend','coconstruct','procore','quickbooks','excel','csv','sage','xero','other')),
  status            VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','mapping','validating','ready','running','completed','failed','rolled_back')),
  source_file_url   TEXT,
  source_file_name  VARCHAR(255),
  total_records     INT NOT NULL DEFAULT 0,
  processed_records INT NOT NULL DEFAULT 0,
  failed_records    INT NOT NULL DEFAULT 0,
  skipped_records   INT NOT NULL DEFAULT 0,
  error_log         JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  rolled_back_at    TIMESTAMPTZ,
  rolled_back_by    UUID,
  created_by        UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

ALTER TABLE migration_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY migration_jobs_tenant
  ON migration_jobs
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_migration_jobs_company ON migration_jobs(company_id);
CREATE INDEX idx_migration_jobs_status ON migration_jobs(status);
CREATE INDEX idx_migration_jobs_platform ON migration_jobs(source_platform);
CREATE INDEX idx_migration_jobs_company_status ON migration_jobs(company_id, status);
CREATE INDEX idx_migration_jobs_company_platform ON migration_jobs(company_id, source_platform);
CREATE INDEX idx_migration_jobs_created ON migration_jobs(created_at DESC);
CREATE INDEX idx_migration_jobs_deleted ON migration_jobs(deleted_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_migration_jobs_updated_at
  BEFORE UPDATE ON migration_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. migration_field_mappings — field mapping configurations per job
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS migration_field_mappings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  job_id            UUID NOT NULL REFERENCES migration_jobs(id) ON DELETE CASCADE,
  source_field      VARCHAR(200) NOT NULL,
  target_table      VARCHAR(100) NOT NULL,
  target_field      VARCHAR(100) NOT NULL,
  transform_type    VARCHAR(30) NOT NULL DEFAULT 'direct'
                    CHECK (transform_type IN ('direct','lookup','formula','default','concatenate','split','date_format','currency','skip')),
  transform_config  JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_required       BOOLEAN NOT NULL DEFAULT false,
  default_value     TEXT,
  sample_source_value TEXT,
  sample_target_value TEXT,
  sort_order        INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE migration_field_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY migration_field_mappings_tenant
  ON migration_field_mappings
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_mfm_company ON migration_field_mappings(company_id);
CREATE INDEX idx_mfm_job ON migration_field_mappings(job_id);
CREATE INDEX idx_mfm_company_job ON migration_field_mappings(company_id, job_id);
CREATE INDEX idx_mfm_target_table ON migration_field_mappings(target_table);
CREATE INDEX idx_mfm_transform_type ON migration_field_mappings(transform_type);
CREATE INDEX idx_mfm_sort_order ON migration_field_mappings(sort_order);

CREATE OR REPLACE TRIGGER set_mfm_updated_at
  BEFORE UPDATE ON migration_field_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. migration_mapping_templates — reusable mapping templates
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS migration_mapping_templates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  source_platform   VARCHAR(50) NOT NULL
                    CHECK (source_platform IN ('buildertrend','coconstruct','procore','quickbooks','excel','csv','sage','xero','other')),
  mappings          JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_system         BOOLEAN NOT NULL DEFAULT false,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_by        UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE migration_mapping_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY migration_mapping_templates_tenant
  ON migration_mapping_templates
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_mmt_company ON migration_mapping_templates(company_id);
CREATE INDEX idx_mmt_platform ON migration_mapping_templates(source_platform);
CREATE INDEX idx_mmt_company_platform ON migration_mapping_templates(company_id, source_platform);
CREATE INDEX idx_mmt_is_active ON migration_mapping_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_mmt_company_active ON migration_mapping_templates(company_id, is_active);

CREATE OR REPLACE TRIGGER set_mmt_updated_at
  BEFORE UPDATE ON migration_mapping_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. migration_validation_results — validation outcome records per job
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS migration_validation_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  job_id            UUID NOT NULL REFERENCES migration_jobs(id) ON DELETE CASCADE,
  validation_type   VARCHAR(30) NOT NULL DEFAULT 'schema'
                    CHECK (validation_type IN ('schema','data_type','required_field','uniqueness','referential','business_rule','format')),
  severity          VARCHAR(20) NOT NULL DEFAULT 'warning'
                    CHECK (severity IN ('error','warning','info')),
  field_name        VARCHAR(200),
  record_index      INT,
  source_value      TEXT,
  message           TEXT NOT NULL,
  is_resolved       BOOLEAN NOT NULL DEFAULT false,
  resolved_at       TIMESTAMPTZ,
  resolved_by       UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE migration_validation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY migration_validation_results_tenant
  ON migration_validation_results
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_mvr_company ON migration_validation_results(company_id);
CREATE INDEX idx_mvr_job ON migration_validation_results(job_id);
CREATE INDEX idx_mvr_company_job ON migration_validation_results(company_id, job_id);
CREATE INDEX idx_mvr_validation_type ON migration_validation_results(validation_type);
CREATE INDEX idx_mvr_severity ON migration_validation_results(severity);
CREATE INDEX idx_mvr_is_resolved ON migration_validation_results(is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_mvr_created ON migration_validation_results(created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. migration_reconciliation — post-migration reconciliation records
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS migration_reconciliation (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  job_id            UUID NOT NULL REFERENCES migration_jobs(id) ON DELETE CASCADE,
  entity_type       VARCHAR(50) NOT NULL,
  source_count      INT NOT NULL DEFAULT 0,
  imported_count    INT NOT NULL DEFAULT 0,
  matched_count     INT NOT NULL DEFAULT 0,
  unmatched_count   INT NOT NULL DEFAULT 0,
  discrepancies     JSONB NOT NULL DEFAULT '[]'::jsonb,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','reconciling','reconciled','discrepant')),
  reconciled_at     TIMESTAMPTZ,
  reconciled_by     UUID,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE migration_reconciliation ENABLE ROW LEVEL SECURITY;

CREATE POLICY migration_reconciliation_tenant
  ON migration_reconciliation
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_mr_company ON migration_reconciliation(company_id);
CREATE INDEX idx_mr_job ON migration_reconciliation(job_id);
CREATE INDEX idx_mr_company_job ON migration_reconciliation(company_id, job_id);
CREATE INDEX idx_mr_entity_type ON migration_reconciliation(entity_type);
CREATE INDEX idx_mr_status ON migration_reconciliation(status);
CREATE INDEX idx_mr_company_status ON migration_reconciliation(company_id, status);

CREATE OR REPLACE TRIGGER set_mr_updated_at
  BEFORE UPDATE ON migration_reconciliation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
