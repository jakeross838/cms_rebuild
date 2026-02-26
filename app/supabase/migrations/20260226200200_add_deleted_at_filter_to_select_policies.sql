-- =====================================================================
-- Add deleted_at IS NULL filter to 34 SELECT RLS policies
-- =====================================================================
-- These tables have a deleted_at column but the SELECT policy doesn't
-- filter it, allowing soft-deleted records to leak to users.
-- =====================================================================

-- Group 1: company_id = get_user_company_id() pattern (20 tables)

DROP POLICY IF EXISTS "builder_content_pages_select" ON builder_content_pages;
CREATE POLICY "builder_content_pages_select" ON builder_content_pages
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "builder_custom_domains_select" ON builder_custom_domains;
CREATE POLICY "builder_custom_domains_select" ON builder_custom_domains
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "builder_terminology_select" ON builder_terminology;
CREATE POLICY "builder_terminology_select" ON builder_terminology
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "employee_documents_select" ON employee_documents;
CREATE POLICY "employee_documents_select" ON employee_documents
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "feature_requests_select" ON feature_requests;
CREATE POLICY "feature_requests_select" ON feature_requests
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "migration_jobs_select" ON migration_jobs;
CREATE POLICY "migration_jobs_select" ON migration_jobs
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "mobile_devices_select" ON mobile_devices;
CREATE POLICY "mobile_devices_select" ON mobile_devices
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "offline_sync_queue_select" ON offline_sync_queue;
CREATE POLICY "offline_sync_queue_select" ON offline_sync_queue
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "portfolio_projects_select" ON portfolio_projects;
CREATE POLICY "portfolio_projects_select" ON portfolio_projects
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "push_notification_tokens_select" ON push_notification_tokens;
CREATE POLICY "push_notification_tokens_select" ON push_notification_tokens
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "safety_incidents_select" ON safety_incidents;
CREATE POLICY "safety_incidents_select" ON safety_incidents
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "safety_inspections_select" ON safety_inspections;
CREATE POLICY "safety_inspections_select" ON safety_inspections
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "support_tickets_select" ON support_tickets;
CREATE POLICY "support_tickets_select" ON support_tickets
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "ticket_messages_select" ON ticket_messages;
CREATE POLICY "ticket_messages_select" ON ticket_messages
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "vendor_messages_select" ON vendor_messages;
CREATE POLICY "vendor_messages_select" ON vendor_messages
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "vendor_portal_access_select" ON vendor_portal_access;
CREATE POLICY "vendor_portal_access_select" ON vendor_portal_access
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "vendor_portal_invitations_select" ON vendor_portal_invitations;
CREATE POLICY "vendor_portal_invitations_select" ON vendor_portal_invitations
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "vendor_portal_settings_select" ON vendor_portal_settings;
CREATE POLICY "vendor_portal_settings_select" ON vendor_portal_settings
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "vendor_submissions_select" ON vendor_submissions;
CREATE POLICY "vendor_submissions_select" ON vendor_submissions
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "webhook_subscriptions_select" ON webhook_subscriptions;
CREATE POLICY "webhook_subscriptions_select" ON webhook_subscriptions
  FOR SELECT USING (company_id = get_user_company_id() AND deleted_at IS NULL);

-- Group 2: company_id = get_current_company_id() pattern (3 tables)

DROP POLICY IF EXISTS "custom_field_definitions_select" ON custom_field_definitions;
CREATE POLICY "custom_field_definitions_select" ON custom_field_definitions
  FOR SELECT USING (company_id = get_current_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "project_phases_select" ON project_phases;
CREATE POLICY "project_phases_select" ON project_phases
  FOR SELECT USING (company_id = get_current_company_id() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "workflow_definitions_select" ON workflow_definitions;
CREATE POLICY "workflow_definitions_select" ON workflow_definitions
  FOR SELECT USING (company_id = get_current_company_id() AND deleted_at IS NULL);

-- Group 3: Subquery pattern (4 tables)

DROP POLICY IF EXISTS "employees_select" ON employees;
CREATE POLICY "employees_select" ON employees
  FOR SELECT USING (
    company_id = (SELECT u.company_id FROM users u WHERE u.id = (SELECT auth.uid()))
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "equipment_select" ON equipment;
CREATE POLICY "equipment_select" ON equipment
  FOR SELECT USING (
    company_id = (SELECT u.company_id FROM users u WHERE u.id = (SELECT auth.uid()))
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "inventory_items_select" ON inventory_items;
CREATE POLICY "inventory_items_select" ON inventory_items
  FOR SELECT USING (
    company_id = (SELECT u.company_id FROM users u WHERE u.id = (SELECT auth.uid()))
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "warranties_select" ON warranties;
CREATE POLICY "warranties_select" ON warranties
  FOR SELECT USING (
    company_id = (SELECT u.company_id FROM users u WHERE u.id = (SELECT auth.uid()))
    AND deleted_at IS NULL
  );

-- Group 4: Public tables — add deleted_at filter (5 tables)

DROP POLICY IF EXISTS "blog_posts_select" ON blog_posts;
CREATE POLICY "blog_posts_select" ON blog_posts
  FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "case_studies_select" ON case_studies;
CREATE POLICY "case_studies_select" ON case_studies
  FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "marketing_leads_select" ON marketing_leads;
CREATE POLICY "marketing_leads_select" ON marketing_leads
  FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "marketplace_reviews_read" ON marketplace_reviews;
CREATE POLICY "marketplace_reviews_read" ON marketplace_reviews
  FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "marketplace_templates_read" ON marketplace_templates;
CREATE POLICY "marketplace_templates_read" ON marketplace_templates
  FOR SELECT USING (deleted_at IS NULL);

-- Group 5: Compound pattern (2 tables)

DROP POLICY IF EXISTS "kb_articles_select" ON kb_articles;
CREATE POLICY "kb_articles_select" ON kb_articles
  FOR SELECT USING ((company_id IS NULL OR company_id = get_user_company_id()) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "training_courses_select" ON training_courses;
CREATE POLICY "training_courses_select" ON training_courses
  FOR SELECT USING ((company_id IS NULL OR company_id = get_user_company_id()) AND deleted_at IS NULL);
