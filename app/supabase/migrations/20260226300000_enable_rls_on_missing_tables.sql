-- ============================================================================
-- Enable RLS on tables that were created without it
-- Covers: configuration_engine (9 tables), notification_deliveries (1 table),
--         document child tables (3 tables)
-- ============================================================================

-- ── Configuration Engine ────────────────────────────────────────────────────

ALTER TABLE tenant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_configs FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_configs_isolation" ON tenant_configs
  FOR ALL
  USING (company_id = public.get_current_company_id())
  WITH CHECK (company_id = public.get_current_company_id());

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags FORCE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_isolation" ON feature_flags
  FOR ALL
  USING (company_id = public.get_current_company_id())
  WITH CHECK (company_id = public.get_current_company_id());

ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions FORCE ROW LEVEL SECURITY;

CREATE POLICY "workflow_definitions_isolation" ON workflow_definitions
  FOR ALL
  USING (company_id = public.get_current_company_id())
  WITH CHECK (company_id = public.get_current_company_id());

ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases FORCE ROW LEVEL SECURITY;

CREATE POLICY "project_phases_isolation" ON project_phases
  FOR ALL
  USING (company_id = public.get_current_company_id())
  WITH CHECK (company_id = public.get_current_company_id());

ALTER TABLE terminology_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminology_overrides FORCE ROW LEVEL SECURITY;

CREATE POLICY "terminology_overrides_isolation" ON terminology_overrides
  FOR ALL
  USING (company_id = public.get_current_company_id())
  WITH CHECK (company_id = public.get_current_company_id());

ALTER TABLE numbering_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbering_patterns FORCE ROW LEVEL SECURITY;

CREATE POLICY "numbering_patterns_isolation" ON numbering_patterns
  FOR ALL
  USING (company_id = public.get_current_company_id())
  WITH CHECK (company_id = public.get_current_company_id());

ALTER TABLE numbering_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbering_sequences FORCE ROW LEVEL SECURITY;

CREATE POLICY "numbering_sequences_isolation" ON numbering_sequences
  FOR ALL
  USING (company_id = public.get_current_company_id())
  WITH CHECK (company_id = public.get_current_company_id());

ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions FORCE ROW LEVEL SECURITY;

CREATE POLICY "custom_field_definitions_isolation" ON custom_field_definitions
  FOR ALL
  USING (company_id = public.get_current_company_id())
  WITH CHECK (company_id = public.get_current_company_id());

ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values FORCE ROW LEVEL SECURITY;

CREATE POLICY "custom_field_values_isolation" ON custom_field_values
  FOR ALL
  USING (company_id = public.get_current_company_id())
  WITH CHECK (company_id = public.get_current_company_id());


-- ── Notification Engine ─────────────────────────────────────────────────────

-- notification_deliveries: access controlled via parent notifications table
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries FORCE ROW LEVEL SECURITY;

CREATE POLICY "notification_deliveries_isolation" ON notification_deliveries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM notifications
      WHERE notifications.id = notification_deliveries.notification_id
        AND notifications.company_id = public.get_current_company_id()
    )
  );

-- Fix notification tables that use current_setting instead of get_current_company_id
-- Drop old policies and recreate with consistent function

DO $$ BEGIN
  -- company_notification_config
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_notification_config' AND policyname LIKE '%current_setting%') THEN
    DROP POLICY IF EXISTS "company_notification_config_select" ON company_notification_config;
    DROP POLICY IF EXISTS "company_notification_config_insert" ON company_notification_config;
    DROP POLICY IF EXISTS "company_notification_config_update" ON company_notification_config;
    DROP POLICY IF EXISTS "company_notification_config_all" ON company_notification_config;
  END IF;
END $$;

-- Recreate with correct function (use IF NOT EXISTS to be safe)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_notification_config' AND policyname = 'company_notification_config_isolation') THEN
    CREATE POLICY "company_notification_config_isolation" ON company_notification_config
      FOR ALL
      USING (company_id = public.get_current_company_id())
      WITH CHECK (company_id = public.get_current_company_id());
  END IF;
END $$;


-- ── Document Storage Child Tables ───────────────────────────────────────────

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions FORCE ROW LEVEL SECURITY;

CREATE POLICY "document_versions_isolation" ON document_versions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_versions.document_id
        AND documents.company_id = public.get_current_company_id()
    )
  );

ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags FORCE ROW LEVEL SECURITY;

CREATE POLICY "document_tags_isolation" ON document_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_tags.document_id
        AND documents.company_id = public.get_current_company_id()
    )
  );

-- document_search_content may not exist in all environments
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_search_content') THEN
    ALTER TABLE document_search_content ENABLE ROW LEVEL SECURITY;
    ALTER TABLE document_search_content FORCE ROW LEVEL SECURITY;

    CREATE POLICY "document_search_content_isolation" ON document_search_content
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM documents
          WHERE documents.id = document_search_content.document_id
            AND documents.company_id = public.get_current_company_id()
        )
      );
  END IF;
END $$;
