-- =====================================================================
-- RossOS Configuration Engine Migration
-- Module 02: Configuration Engine
-- Multi-tenant with Row Level Security (RLS)
-- =====================================================================

-- =====================================================================
-- SECTION 1: TENANT CONFIGS (Key-Value Store by Section)
-- =====================================================================

CREATE TABLE IF NOT EXISTS tenant_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  section TEXT NOT NULL, -- e.g., 'financial', 'regional', 'ai', 'portal'
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  data_type TEXT DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json', 'array')),
  is_sensitive BOOLEAN DEFAULT false, -- Mask in UI if true
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, section, key)
);

CREATE INDEX IF NOT EXISTS idx_tenant_configs_company ON tenant_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_tenant_configs_section ON tenant_configs(company_id, section);

-- =====================================================================
-- SECTION 2: FEATURE FLAGS
-- =====================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  flag_key TEXT NOT NULL, -- e.g., 'ai_invoice_processing', 'quickbooks_sync'
  enabled BOOLEAN DEFAULT false,
  plan_required TEXT, -- null = all plans, or 'pro', 'enterprise'
  metadata JSONB DEFAULT '{}', -- Additional config for the feature
  enabled_at TIMESTAMPTZ,
  enabled_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, flag_key)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_company ON feature_flags(company_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(flag_key);

-- =====================================================================
-- SECTION 3: WORKFLOW DEFINITIONS (Approval State Machines)
-- =====================================================================

CREATE TABLE IF NOT EXISTS workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'invoice', 'purchase_order', 'change_order', 'draw', 'selection'
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  -- State machine definition
  states JSONB NOT NULL DEFAULT '[]', -- [{name, label, color, is_initial, is_final}]
  transitions JSONB NOT NULL DEFAULT '[]', -- [{from, to, label, conditions, required_role}]
  -- Thresholds for auto-routing
  thresholds JSONB DEFAULT '{}', -- {amount_thresholds: [{min, max, auto_approve, required_approvers}]}
  -- Notification rules
  notifications JSONB DEFAULT '{}', -- {on_enter_state: {state: [roles]}, on_transition: {...}}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(company_id, entity_type, name)
);

CREATE INDEX IF NOT EXISTS idx_workflow_definitions_company ON workflow_definitions(company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_entity ON workflow_definitions(company_id, entity_type);

-- =====================================================================
-- SECTION 4: PROJECT PHASES
-- =====================================================================

CREATE TABLE IF NOT EXISTS project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1', -- Hex color
  default_duration_days INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- System phases can't be deleted
  milestone_type TEXT, -- 'start', 'completion', 'payment', null
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_project_phases_company ON project_phases(company_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_sort ON project_phases(company_id, sort_order);

-- =====================================================================
-- SECTION 5: TERMINOLOGY OVERRIDES
-- =====================================================================

CREATE TABLE IF NOT EXISTS terminology_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  term_key TEXT NOT NULL, -- e.g., 'vendor', 'job', 'client', 'invoice'
  display_value TEXT NOT NULL, -- e.g., 'Trade Partner', 'Project', 'Homeowner', 'Bill'
  plural_value TEXT, -- e.g., 'Trade Partners', 'Projects'
  context TEXT, -- Optional context: 'portal', 'internal', 'documents'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, term_key, context)
);

CREATE INDEX IF NOT EXISTS idx_terminology_company ON terminology_overrides(company_id);

-- =====================================================================
-- SECTION 6: NUMBERING PATTERNS
-- =====================================================================

CREATE TABLE IF NOT EXISTS numbering_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'job', 'invoice', 'purchase_order', 'change_order', 'draw'
  pattern TEXT NOT NULL, -- e.g., 'JOB-{YYYY}-{###}', 'INV-{JOB}-{###}'
  scope TEXT DEFAULT 'global', -- 'global', 'per_job', 'per_year'
  current_sequence INTEGER DEFAULT 0,
  prefix TEXT,
  suffix TEXT,
  padding INTEGER DEFAULT 3, -- Number of digits
  reset_yearly BOOLEAN DEFAULT false,
  last_reset_year INTEGER,
  sample_output TEXT, -- Generated example
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_numbering_patterns_company ON numbering_patterns(company_id);

-- Per-job sequences (when scope = 'per_job')
CREATE TABLE IF NOT EXISTS numbering_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES numbering_patterns(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  year INTEGER,
  current_value INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pattern_id, job_id, year)
);

CREATE INDEX IF NOT EXISTS idx_numbering_sequences_pattern ON numbering_sequences(pattern_id);

-- =====================================================================
-- SECTION 7: CUSTOM FIELD DEFINITIONS (EAV Schema)
-- =====================================================================

CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'job', 'vendor', 'client', 'invoice', etc.
  field_key TEXT NOT NULL, -- Internal key: 'lot_number', 'hoa_name'
  field_label TEXT NOT NULL, -- Display label: 'Lot Number', 'HOA Name'
  field_type TEXT NOT NULL CHECK (field_type IN (
    'text', 'number', 'currency', 'percent', 'date', 'datetime',
    'boolean', 'select', 'multiselect', 'textarea', 'url', 'email', 'phone'
  )),
  description TEXT,
  placeholder TEXT,
  default_value JSONB,
  options JSONB, -- For select/multiselect: [{value, label, color}]
  validation JSONB DEFAULT '{}', -- {required, min, max, pattern, min_length, max_length}
  -- Conditional visibility
  show_conditions JSONB, -- [{field, operator, value}] - show if all match
  -- UI placement
  section TEXT, -- Group fields by section
  sort_order INTEGER DEFAULT 0,
  -- Access control
  visible_to_roles TEXT[], -- null = all roles
  editable_by_roles TEXT[], -- null = all roles
  show_in_portal BOOLEAN DEFAULT false,
  show_in_list_view BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(company_id, entity_type, field_key)
);

CREATE INDEX IF NOT EXISTS idx_custom_field_defs_company ON custom_field_definitions(company_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_defs_entity ON custom_field_definitions(company_id, entity_type);

-- =====================================================================
-- SECTION 8: CUSTOM FIELD VALUES (EAV Data)
-- =====================================================================

CREATE TABLE IF NOT EXISTS custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  field_definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(field_definition_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_field ON custom_field_values(field_definition_id);

-- =====================================================================
-- SECTION 9: CONFIG VERSIONS (Snapshots for Rollback)
-- =====================================================================

CREATE TABLE IF NOT EXISTS config_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  section TEXT NOT NULL, -- 'company', 'workflows', 'phases', 'terminology', etc.
  version_number INTEGER NOT NULL,
  snapshot_data JSONB NOT NULL,
  change_summary TEXT,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, section, version_number)
);

CREATE INDEX IF NOT EXISTS idx_config_versions_company ON config_versions(company_id);
CREATE INDEX IF NOT EXISTS idx_config_versions_section ON config_versions(company_id, section, version_number DESC);

-- =====================================================================
-- SECTION 10: PLATFORM DEFAULTS (Seed Data Reference)
-- =====================================================================

CREATE TABLE IF NOT EXISTS platform_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  data_type TEXT DEFAULT 'string',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section, key)
);

-- =====================================================================
-- SECTION 11: ROW LEVEL SECURITY
-- =====================================================================

-- Enable RLS on all new tables
ALTER TABLE tenant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminology_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbering_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbering_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_versions ENABLE ROW LEVEL SECURITY;

-- Tenant Configs - all users can read, admin/owner can write
CREATE POLICY "tenant_configs_select" ON tenant_configs
  FOR SELECT USING (company_id = public.get_current_company_id());

CREATE POLICY "tenant_configs_insert" ON tenant_configs
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

CREATE POLICY "tenant_configs_update" ON tenant_configs
  FOR UPDATE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']))
  WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "tenant_configs_delete" ON tenant_configs
  FOR DELETE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

-- Feature Flags - all users can read, owner can write
CREATE POLICY "feature_flags_select" ON feature_flags
  FOR SELECT USING (company_id = public.get_current_company_id());

CREATE POLICY "feature_flags_insert" ON feature_flags
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner']));

CREATE POLICY "feature_flags_update" ON feature_flags
  FOR UPDATE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner']))
  WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "feature_flags_delete" ON feature_flags
  FOR DELETE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner']));

-- Workflow Definitions - all users can read, admin/owner can write
CREATE POLICY "workflow_definitions_select" ON workflow_definitions
  FOR SELECT USING (company_id = public.get_current_company_id());

CREATE POLICY "workflow_definitions_insert" ON workflow_definitions
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

CREATE POLICY "workflow_definitions_update" ON workflow_definitions
  FOR UPDATE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']))
  WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "workflow_definitions_delete" ON workflow_definitions
  FOR DELETE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

-- Project Phases - all users can read, admin/owner can write
CREATE POLICY "project_phases_select" ON project_phases
  FOR SELECT USING (company_id = public.get_current_company_id());

CREATE POLICY "project_phases_insert" ON project_phases
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

CREATE POLICY "project_phases_update" ON project_phases
  FOR UPDATE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']))
  WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "project_phases_delete" ON project_phases
  FOR DELETE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

-- Terminology Overrides - all users can read, admin/owner can write
CREATE POLICY "terminology_overrides_select" ON terminology_overrides
  FOR SELECT USING (company_id = public.get_current_company_id());

CREATE POLICY "terminology_overrides_insert" ON terminology_overrides
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

CREATE POLICY "terminology_overrides_update" ON terminology_overrides
  FOR UPDATE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']))
  WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "terminology_overrides_delete" ON terminology_overrides
  FOR DELETE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

-- Numbering Patterns - all users can read, admin/owner can write
CREATE POLICY "numbering_patterns_select" ON numbering_patterns
  FOR SELECT USING (company_id = public.get_current_company_id());

CREATE POLICY "numbering_patterns_insert" ON numbering_patterns
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

CREATE POLICY "numbering_patterns_update" ON numbering_patterns
  FOR UPDATE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']))
  WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "numbering_patterns_delete" ON numbering_patterns
  FOR DELETE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

-- Numbering Sequences - all users can read, system can write
CREATE POLICY "numbering_sequences_select" ON numbering_sequences
  FOR SELECT USING (company_id = public.get_current_company_id());

CREATE POLICY "numbering_sequences_all" ON numbering_sequences
  FOR ALL USING (company_id = public.get_current_company_id());

-- Custom Field Definitions - all users can read, admin/owner can write
CREATE POLICY "custom_field_definitions_select" ON custom_field_definitions
  FOR SELECT USING (company_id = public.get_current_company_id());

CREATE POLICY "custom_field_definitions_insert" ON custom_field_definitions
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

CREATE POLICY "custom_field_definitions_update" ON custom_field_definitions
  FOR UPDATE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']))
  WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "custom_field_definitions_delete" ON custom_field_definitions
  FOR DELETE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

-- Custom Field Values - all users can read, based on role can write
CREATE POLICY "custom_field_values_select" ON custom_field_values
  FOR SELECT USING (company_id = public.get_current_company_id());

CREATE POLICY "custom_field_values_insert" ON custom_field_values
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "custom_field_values_update" ON custom_field_values
  FOR UPDATE USING (company_id = public.get_current_company_id())
  WITH CHECK (company_id = public.get_current_company_id());

CREATE POLICY "custom_field_values_delete" ON custom_field_values
  FOR DELETE USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

-- Config Versions - admin/owner can read
CREATE POLICY "config_versions_select" ON config_versions
  FOR SELECT USING (company_id = public.get_current_company_id() AND public.user_has_role(ARRAY['owner', 'admin']));

CREATE POLICY "config_versions_insert" ON config_versions
  FOR INSERT WITH CHECK (company_id = public.get_current_company_id());

-- Force RLS
ALTER TABLE tenant_configs FORCE ROW LEVEL SECURITY;
ALTER TABLE feature_flags FORCE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions FORCE ROW LEVEL SECURITY;
ALTER TABLE project_phases FORCE ROW LEVEL SECURITY;
ALTER TABLE terminology_overrides FORCE ROW LEVEL SECURITY;
ALTER TABLE numbering_patterns FORCE ROW LEVEL SECURITY;
ALTER TABLE numbering_sequences FORCE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions FORCE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values FORCE ROW LEVEL SECURITY;
ALTER TABLE config_versions FORCE ROW LEVEL SECURITY;

-- =====================================================================
-- SECTION 12: UPDATED_AT TRIGGERS
-- =====================================================================

CREATE TRIGGER set_tenant_configs_updated_at BEFORE UPDATE ON tenant_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_workflow_definitions_updated_at BEFORE UPDATE ON workflow_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_project_phases_updated_at BEFORE UPDATE ON project_phases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_terminology_overrides_updated_at BEFORE UPDATE ON terminology_overrides FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_numbering_patterns_updated_at BEFORE UPDATE ON numbering_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_numbering_sequences_updated_at BEFORE UPDATE ON numbering_sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_custom_field_definitions_updated_at BEFORE UPDATE ON custom_field_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_custom_field_values_updated_at BEFORE UPDATE ON custom_field_values FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================================
-- SECTION 13: HELPER FUNCTIONS
-- =====================================================================

-- Get next number in sequence
CREATE OR REPLACE FUNCTION get_next_sequence_number(
  p_company_id UUID,
  p_entity_type TEXT,
  p_job_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_pattern numbering_patterns%ROWTYPE;
  v_sequence INTEGER;
  v_result TEXT;
  v_year INTEGER;
BEGIN
  -- Get the pattern for this entity type
  SELECT * INTO v_pattern
  FROM numbering_patterns
  WHERE company_id = p_company_id AND entity_type = p_entity_type;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

  -- Handle yearly reset
  IF v_pattern.reset_yearly AND (v_pattern.last_reset_year IS NULL OR v_pattern.last_reset_year < v_year) THEN
    UPDATE numbering_patterns
    SET current_sequence = 0, last_reset_year = v_year
    WHERE id = v_pattern.id;
    v_pattern.current_sequence := 0;
  END IF;

  -- Handle per-job sequences
  IF v_pattern.scope = 'per_job' AND p_job_id IS NOT NULL THEN
    INSERT INTO numbering_sequences (company_id, pattern_id, job_id, year, current_value)
    VALUES (p_company_id, v_pattern.id, p_job_id, v_year, 1)
    ON CONFLICT (pattern_id, job_id, year) DO UPDATE
    SET current_value = numbering_sequences.current_value + 1
    RETURNING current_value INTO v_sequence;
  ELSE
    -- Global or per-year sequence
    UPDATE numbering_patterns
    SET current_sequence = current_sequence + 1
    WHERE id = v_pattern.id
    RETURNING current_sequence INTO v_sequence;
  END IF;

  -- Build the result using the pattern
  v_result := v_pattern.pattern;
  v_result := REPLACE(v_result, '{YYYY}', v_year::TEXT);
  v_result := REPLACE(v_result, '{YY}', RIGHT(v_year::TEXT, 2));
  v_result := REPLACE(v_result, '{###}', LPAD(v_sequence::TEXT, v_pattern.padding, '0'));
  v_result := REPLACE(v_result, '{##}', LPAD(v_sequence::TEXT, 2, '0'));
  v_result := REPLACE(v_result, '{#}', v_sequence::TEXT);

  -- Handle job number token if we have a job
  IF p_job_id IS NOT NULL THEN
    v_result := REPLACE(v_result, '{JOB}', COALESCE(
      (SELECT job_number FROM jobs WHERE id = p_job_id),
      ''
    ));
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Get config value with fallback
CREATE OR REPLACE FUNCTION get_config_value(
  p_company_id UUID,
  p_section TEXT,
  p_key TEXT,
  p_default JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_value JSONB;
BEGIN
  -- Try company config first
  SELECT value INTO v_value
  FROM tenant_configs
  WHERE company_id = p_company_id AND section = p_section AND key = p_key;

  IF FOUND THEN
    RETURN v_value;
  END IF;

  -- Fall back to platform defaults
  SELECT value INTO v_value
  FROM platform_defaults
  WHERE section = p_section AND key = p_key;

  IF FOUND THEN
    RETURN v_value;
  END IF;

  -- Return provided default
  RETURN p_default;
END;
$$ LANGUAGE plpgsql;

-- Check feature flag
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_company_id UUID,
  p_flag_key TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_flag feature_flags%ROWTYPE;
  v_company companies%ROWTYPE;
BEGIN
  -- Get the flag
  SELECT * INTO v_flag
  FROM feature_flags
  WHERE company_id = p_company_id AND flag_key = p_flag_key;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if enabled
  IF NOT v_flag.enabled THEN
    RETURN false;
  END IF;

  -- Check plan requirement
  IF v_flag.plan_required IS NOT NULL THEN
    SELECT * INTO v_company FROM companies WHERE id = p_company_id;
    IF v_company.subscription_tier NOT IN (v_flag.plan_required, 'enterprise') THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- SECTION 14: SEED PLATFORM DEFAULTS
-- =====================================================================

INSERT INTO platform_defaults (section, key, value, description, data_type) VALUES
  -- Financial defaults
  ('financial', 'default_markup_percent', '18', 'Default markup percentage', 'number'),
  ('financial', 'default_retainage_percent', '10', 'Default retainage percentage', 'number'),
  ('financial', 'invoice_approval_threshold', '25000', 'Amount requiring owner approval', 'number'),
  ('financial', 'po_approval_threshold', '10000', 'PO amount requiring approval', 'number'),
  ('financial', 'default_payment_terms', '"Net 30"', 'Default payment terms', 'string'),
  ('financial', 'fiscal_year_start_month', '1', 'Month fiscal year starts (1-12)', 'number'),

  -- Regional defaults
  ('regional', 'timezone', '"America/Chicago"', 'Default timezone', 'string'),
  ('regional', 'date_format', '"MM/DD/YYYY"', 'Date display format', 'string'),
  ('regional', 'currency', '"USD"', 'Currency code', 'string'),
  ('regional', 'measurement_system', '"imperial"', 'imperial or metric', 'string'),

  -- AI defaults
  ('ai', 'auto_match_confidence', '85', 'Confidence threshold for auto-matching (0-100)', 'number'),
  ('ai', 'cost_code_suggestion_enabled', 'true', 'Enable cost code suggestions', 'boolean'),
  ('ai', 'risk_detection_enabled', 'true', 'Enable risk detection', 'boolean'),
  ('ai', 'invoice_auto_route_threshold', '5000', 'Auto-route invoices below this amount', 'number'),

  -- Portal defaults
  ('portal', 'client_portal_enabled', 'false', 'Enable client portal by default', 'boolean'),
  ('portal', 'vendor_portal_enabled', 'false', 'Enable vendor portal by default', 'boolean'),
  ('portal', 'allow_client_photo_upload', 'true', 'Allow clients to upload photos', 'boolean'),
  ('portal', 'show_budget_to_clients', 'false', 'Show budget details to clients', 'boolean'),

  -- Notifications defaults
  ('notifications', 'email_notifications_enabled', 'true', 'Enable email notifications', 'boolean'),
  ('notifications', 'push_notifications_enabled', 'true', 'Enable push notifications', 'boolean'),
  ('notifications', 'digest_frequency', '"daily"', 'Digest email frequency', 'string')
ON CONFLICT (section, key) DO NOTHING;

-- =====================================================================
-- SECTION 15: SEED DEFAULT TERMINOLOGY
-- =====================================================================

-- These are the ~50 customizable terms with their defaults
-- Companies can override any of these
CREATE TABLE IF NOT EXISTS default_terminology (
  term_key TEXT PRIMARY KEY,
  default_singular TEXT NOT NULL,
  default_plural TEXT NOT NULL,
  description TEXT
);

INSERT INTO default_terminology (term_key, default_singular, default_plural, description) VALUES
  ('job', 'Job', 'Jobs', 'A construction project'),
  ('project', 'Project', 'Projects', 'Alternative name for job'),
  ('vendor', 'Vendor', 'Vendors', 'Subcontractor or supplier'),
  ('subcontractor', 'Subcontractor', 'Subcontractors', 'Trade partner'),
  ('trade_partner', 'Trade Partner', 'Trade Partners', 'Alternative for vendor'),
  ('client', 'Client', 'Clients', 'Customer/homeowner'),
  ('homeowner', 'Homeowner', 'Homeowners', 'Alternative for client'),
  ('customer', 'Customer', 'Customers', 'Alternative for client'),
  ('invoice', 'Invoice', 'Invoices', 'Bill from vendor'),
  ('bill', 'Bill', 'Bills', 'Alternative for invoice'),
  ('draw', 'Draw', 'Draws', 'Draw request'),
  ('draw_request', 'Draw Request', 'Draw Requests', 'Payment request to lender'),
  ('progress_billing', 'Progress Billing', 'Progress Billings', 'Alternative for draw'),
  ('change_order', 'Change Order', 'Change Orders', 'Scope change'),
  ('co', 'CO', 'COs', 'Short for change order'),
  ('variation', 'Variation', 'Variations', 'Alternative for change order'),
  ('purchase_order', 'Purchase Order', 'Purchase Orders', 'PO'),
  ('po', 'PO', 'POs', 'Short for purchase order'),
  ('estimate', 'Estimate', 'Estimates', 'Project estimate'),
  ('quote', 'Quote', 'Quotes', 'Alternative for estimate'),
  ('proposal', 'Proposal', 'Proposals', 'Client proposal'),
  ('bid', 'Bid', 'Bids', 'Vendor bid'),
  ('rfi', 'RFI', 'RFIs', 'Request for information'),
  ('submittal', 'Submittal', 'Submittals', 'Document submittal'),
  ('daily_log', 'Daily Log', 'Daily Logs', 'Daily field report'),
  ('field_report', 'Field Report', 'Field Reports', 'Alternative for daily log'),
  ('punch_list', 'Punch List', 'Punch Lists', 'Completion list'),
  ('snag_list', 'Snag List', 'Snag Lists', 'Alternative for punch list'),
  ('deficiency_list', 'Deficiency List', 'Deficiency Lists', 'Alternative for punch list'),
  ('selection', 'Selection', 'Selections', 'Product selection'),
  ('allowance', 'Allowance', 'Allowances', 'Budget allowance'),
  ('cost_code', 'Cost Code', 'Cost Codes', 'Budget category'),
  ('phase', 'Phase', 'Phases', 'Project phase'),
  ('milestone', 'Milestone', 'Milestones', 'Project milestone'),
  ('task', 'Task', 'Tasks', 'Work item'),
  ('activity', 'Activity', 'Activities', 'Alternative for task'),
  ('budget', 'Budget', 'Budgets', 'Project budget'),
  ('contract', 'Contract', 'Contracts', 'Agreement'),
  ('agreement', 'Agreement', 'Agreements', 'Alternative for contract'),
  ('lien_waiver', 'Lien Waiver', 'Lien Waivers', 'Lien release'),
  ('warranty', 'Warranty', 'Warranties', 'Product/work warranty'),
  ('inspection', 'Inspection', 'Inspections', 'Building inspection'),
  ('permit', 'Permit', 'Permits', 'Building permit'),
  ('document', 'Document', 'Documents', 'File/document'),
  ('photo', 'Photo', 'Photos', 'Project photo'),
  ('note', 'Note', 'Notes', 'Comment/note'),
  ('team_member', 'Team Member', 'Team Members', 'Company employee'),
  ('employee', 'Employee', 'Employees', 'Alternative for team member'),
  ('superintendent', 'Superintendent', 'Superintendents', 'Field supervisor'),
  ('project_manager', 'Project Manager', 'Project Managers', 'PM')
ON CONFLICT (term_key) DO NOTHING;
