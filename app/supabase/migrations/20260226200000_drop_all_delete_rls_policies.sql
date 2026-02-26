-- =====================================================================
-- Drop ALL DELETE RLS policies to enforce soft-delete architecture
-- =====================================================================
-- Architecture rule: "Soft delete only — Nothing is permanently deleted."
-- All user-facing deletes use UPDATE (set deleted_at).
-- System cleanup (session pruning, etc.) uses service_role which bypasses RLS.
-- =====================================================================

DROP POLICY IF EXISTS "api_keys_delete" ON public.api_keys;
DROP POLICY IF EXISTS "billing_events_delete" ON public.billing_events;
DROP POLICY IF EXISTS "blog_posts_delete" ON public.blog_posts;
DROP POLICY IF EXISTS "builder_branding_delete" ON public.builder_branding;
DROP POLICY IF EXISTS "builder_content_pages_delete" ON public.builder_content_pages;
DROP POLICY IF EXISTS "builder_custom_domains_delete" ON public.builder_custom_domains;
DROP POLICY IF EXISTS "builder_email_config_delete" ON public.builder_email_config;
DROP POLICY IF EXISTS "builder_terminology_delete" ON public.builder_terminology;
DROP POLICY IF EXISTS "campaign_contacts_delete" ON public.campaign_contacts;
DROP POLICY IF EXISTS "case_studies_delete" ON public.case_studies;
DROP POLICY IF EXISTS "client_reviews_delete" ON public.client_reviews;
DROP POLICY IF EXISTS "company_notification_config_delete" ON public.company_notification_config;
DROP POLICY IF EXISTS "company_subscriptions_delete" ON public.company_subscriptions;
DROP POLICY IF EXISTS "cost_codes_delete" ON public.cost_codes;
DROP POLICY IF EXISTS "custom_field_definitions_delete" ON public.custom_field_definitions;
DROP POLICY IF EXISTS "custom_field_values_delete" ON public.custom_field_values;
DROP POLICY IF EXISTS "departments_delete" ON public.departments;
DROP POLICY IF EXISTS "deployment_releases_delete" ON public.deployment_releases;
DROP POLICY IF EXISTS "draws_delete_own_company" ON public.draws;
DROP POLICY IF EXISTS "employee_certifications_delete" ON public.employee_certifications;
DROP POLICY IF EXISTS "employee_documents_delete" ON public.employee_documents;
DROP POLICY IF EXISTS "employees_delete" ON public.employees;
DROP POLICY IF EXISTS "equipment_delete" ON public.equipment;
DROP POLICY IF EXISTS "feature_flags_delete" ON public.feature_flags;
DROP POLICY IF EXISTS "feature_request_votes_delete" ON public.feature_request_votes;
DROP POLICY IF EXISTS "feature_requests_delete" ON public.feature_requests;
DROP POLICY IF EXISTS "integration_installs_delete" ON public.integration_installs;
DROP POLICY IF EXISTS "inventory_items_delete" ON public.inventory_items;
DROP POLICY IF EXISTS "invoices_delete_own_company" ON public.invoices;
DROP POLICY IF EXISTS "kb_articles_delete" ON public.kb_articles;
DROP POLICY IF EXISTS "marketing_campaigns_delete" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "marketing_leads_delete" ON public.marketing_leads;
DROP POLICY IF EXISTS "marketplace_installs_delete" ON public.marketplace_installs;
DROP POLICY IF EXISTS "marketplace_publishers_delete" ON public.marketplace_publishers;
DROP POLICY IF EXISTS "marketplace_reviews_delete" ON public.marketplace_reviews;
DROP POLICY IF EXISTS "marketplace_template_versions_delete" ON public.marketplace_template_versions;
DROP POLICY IF EXISTS "marketplace_templates_delete" ON public.marketplace_templates;
DROP POLICY IF EXISTS "migration_field_mappings_delete" ON public.migration_field_mappings;
DROP POLICY IF EXISTS "migration_jobs_delete" ON public.migration_jobs;
DROP POLICY IF EXISTS "migration_mapping_templates_delete" ON public.migration_mapping_templates;
DROP POLICY IF EXISTS "migration_reconciliation_delete" ON public.migration_reconciliation;
DROP POLICY IF EXISTS "migration_validation_results_delete" ON public.migration_validation_results;
DROP POLICY IF EXISTS "mobile_app_settings_delete" ON public.mobile_app_settings;
DROP POLICY IF EXISTS "mobile_devices_delete" ON public.mobile_devices;
DROP POLICY IF EXISTS "mobile_sessions_delete" ON public.mobile_sessions;
DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
DROP POLICY IF EXISTS "numbering_patterns_delete" ON public.numbering_patterns;
DROP POLICY IF EXISTS "offline_sync_queue_delete" ON public.offline_sync_queue;
DROP POLICY IF EXISTS "portfolio_photos_delete" ON public.portfolio_photos;
DROP POLICY IF EXISTS "portfolio_projects_delete" ON public.portfolio_projects;
DROP POLICY IF EXISTS "positions_delete" ON public.positions;
DROP POLICY IF EXISTS "project_phases_delete" ON public.project_phases;
DROP POLICY IF EXISTS "push_notification_tokens_delete" ON public.push_notification_tokens;
DROP POLICY IF EXISTS "safety_incidents_delete" ON public.safety_incidents;
DROP POLICY IF EXISTS "safety_inspection_items_delete" ON public.safety_inspection_items;
DROP POLICY IF EXISTS "safety_inspections_delete" ON public.safety_inspections;
DROP POLICY IF EXISTS "support_tickets_delete" ON public.support_tickets;
DROP POLICY IF EXISTS "tenant_configs_delete" ON public.tenant_configs;
DROP POLICY IF EXISTS "terminology_overrides_delete" ON public.terminology_overrides;
DROP POLICY IF EXISTS "ticket_messages_delete" ON public.ticket_messages;
DROP POLICY IF EXISTS "toolbox_talk_attendees_delete" ON public.toolbox_talk_attendees;
DROP POLICY IF EXISTS "toolbox_talks_delete" ON public.toolbox_talks;
DROP POLICY IF EXISTS "training_courses_delete" ON public.training_courses;
DROP POLICY IF EXISTS "training_path_items_delete" ON public.training_path_items;
DROP POLICY IF EXISTS "training_paths_delete" ON public.training_paths;
DROP POLICY IF EXISTS "usage_meters_delete" ON public.usage_meters;
DROP POLICY IF EXISTS "user_certifications_delete" ON public.user_certifications;
DROP POLICY IF EXISTS "user_notification_preferences_delete" ON public.user_notification_preferences;
DROP POLICY IF EXISTS "user_notification_settings_delete" ON public.user_notification_settings;
DROP POLICY IF EXISTS "user_training_progress_delete" ON public.user_training_progress;
DROP POLICY IF EXISTS "vendor_messages_delete" ON public.vendor_messages;
DROP POLICY IF EXISTS "vendor_portal_access_delete" ON public.vendor_portal_access;
DROP POLICY IF EXISTS "vendor_portal_invitations_delete" ON public.vendor_portal_invitations;
DROP POLICY IF EXISTS "vendor_portal_settings_delete" ON public.vendor_portal_settings;
DROP POLICY IF EXISTS "vendor_submissions_delete" ON public.vendor_submissions;
DROP POLICY IF EXISTS "warranties_delete" ON public.warranties;
DROP POLICY IF EXISTS "webhook_deliveries_delete" ON public.webhook_deliveries;
DROP POLICY IF EXISTS "webhook_subscriptions_delete" ON public.webhook_subscriptions;
DROP POLICY IF EXISTS "workflow_definitions_delete" ON public.workflow_definitions;
