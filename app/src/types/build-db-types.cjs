/**
 * Build database.ts from generated Supabase types + convenience aliases
 * Only creates Table aliases for tables that actually exist in the generated types.
 * Run: node app/src/types/build-db-types.cjs
 */
const fs = require('fs');
const path = require('path');

const generatedPath = path.join(__dirname, 'generated-supabase.ts');
const outputPath = path.join(__dirname, 'database.ts');

const generated = fs.readFileSync(generatedPath, 'utf-8');

// Extract all table names from the generated types
const tableNames = new Set();
const tableRegex = /^\s{6}(\w+):\s*\{$/gm;
let match;
// Tables are defined inside public > Tables > tablename: {
const tablesSection = generated.match(/Tables:\s*\{([\s\S]*?)(?=\n\s{4}Views:)/);
if (tablesSection) {
  const inner = tablesSection[1];
  const nameRegex = /^\s{6}(\w+):\s*\{$/gm;
  while ((match = nameRegex.exec(inner)) !== null) {
    tableNames.add(match[1]);
  }
}

// Extract all enum names
const enumNames = new Set();
const enumsSection = generated.match(/Enums:\s*\{([\s\S]*?)(?=\n\s{4}CompositeTypes:)/);
if (enumsSection) {
  const inner = enumsSection[1];
  const nameRegex = /^\s{6}(\w+):/gm;
  while ((match = nameRegex.exec(inner)) !== null) {
    enumNames.add(match[1]);
  }
}

console.log(`Found ${tableNames.size} tables and ${enumNames.size} enums in generated types`);

// Define all desired aliases - Tables<> for existing tables, placeholder for future
const tableAliases = [
  // Core entities
  ['Company', 'companies'],
  ['User', 'users'],
  ['Job', 'jobs'],
  ['Client', 'clients'],
  ['Vendor', 'vendors'],
  ['CostCode', 'cost_codes'],
  ['JobAssignment', 'job_assignments'],

  // Auth & Access (Module 01)
  ['Role', 'roles'],
  ['Permission', 'permissions'],
  ['RolePermission', 'role_permissions'],
  ['RoleRow', 'roles'],
  ['RoleHierarchy', 'role_hierarchy'],
  ['AuditLog', 'audit_log'],
  ['SessionInfo', 'sessions'],

  // Configuration Engine (Module 02)
  ['TenantConfig', 'tenant_configs'],
  ['FeatureFlag', 'feature_flags'],
  ['WorkflowDefinition', 'workflow_definitions'],
  ['ProjectPhase', 'project_phases'],
  ['TerminologyOverride', 'terminology_overrides'],
  ['NumberingPattern', 'numbering_patterns'],
  ['NumberingSequence', 'numbering_sequences'],
  ['CustomFieldDefinition', 'custom_field_definitions'],
  ['CustomFieldValue', 'custom_field_values'],
  ['ConfigVersion', 'config_versions'],
  ['PlatformDefault', 'platform_defaults'],
  ['DefaultTerminology', 'default_terminology'],

  // Scheduling (Module 07)
  ['ScheduleTask', 'schedule_tasks'],
  ['TaskDependency', 'schedule_dependencies'],

  // Daily Logs (Module 08)
  ['DailyLog', 'daily_logs'],
  ['DailyLogEntry', 'daily_log_entries'],

  // Budget & Cost (Module 09)
  ['BudgetLine', 'budget_lines'],
  ['CostEntry', 'cost_transactions'],

  // Vendor Management (Module 10)
  ['VendorInsurance', 'vendor_insurance'],
  ['VendorContact', 'vendor_contacts'],

  // Accounting (Module 11)
  ['GlAccount', 'gl_accounts'],
  ['JournalEntry', 'gl_journal_entries'],
  ['JournalEntryLine', 'gl_journal_lines'],
  ['Invoice', 'invoices'],
  ['InvoiceLine', 'ar_invoice_lines'],
  ['Payment', 'ap_payments'],
  ['PaymentApplication', 'ap_payment_applications'],

  // Client Portal (Module 12)
  ['ClientPortalConfig', 'client_portal_settings'],
  ['ClientPortalMessage', 'client_messages'],
  ['ClientApproval', 'client_approvals'],

  // AI Invoice Processing (Module 13)
  ['AiInvoice', 'invoice_extractions'],

  // Lien Waivers (Module 14)
  ['LienWaiver', 'lien_waivers'],

  // Draw Requests (Module 15)
  ['DrawRequest', 'draw_requests'],
  ['DrawRequestLine', 'draw_request_lines'],

  // QuickBooks Integration (Module 16)
  ['AccountingConnection', 'accounting_connections'],
  ['AccountingSyncLog', 'sync_logs'],

  // Change Orders (Module 17)
  ['ChangeOrder', 'change_orders'],
  ['ChangeOrderLine', 'change_order_items'],

  // Purchase Orders (Module 18)
  ['PurchaseOrder', 'purchase_orders'],
  ['PurchaseOrderLine', 'purchase_order_lines'],

  // Financial Reporting (Module 19)
  ['FinancialReport', 'custom_reports'],
  ['SavedReport', 'report_snapshots'],

  // Estimating (Module 20)
  ['Estimate', 'estimates'],
  ['EstimateLine', 'estimate_line_items'],
  ['AssemblyTemplate', 'assemblies'],

  // Selections (Module 21)
  ['Selection', 'selections'],
  ['SelectionOption', 'selection_options'],
  ['SelectionChoice', 'selection_options'],

  // Vendor Performance (Module 22)
  ['VendorScorecard', 'vendor_scores'],
  ['VendorReview', 'vendor_score_history'],

  // Price Intelligence (Module 23)
  ['PriceEntry', 'price_history'],

  // AI Document Processing (Module 24)
  ['ProcessedDocument', 'document_extractions'],
  ['DocumentExtractionRule', 'extraction_rules'],

  // Schedule Intelligence (Module 25)
  ['WeatherForecast', 'schedule_weather_events'],
  ['ScheduleOptimization', 'schedule_scenarios'],

  // Bid Management (Module 26)
  ['BidPackage', 'bid_packages'],
  ['BidInvitation', 'bid_invitations'],
  ['BidResponse', 'bid_responses'],

  // RFI Management (Module 27)
  ['Rfi', 'rfis'],
  ['RfiResponse', 'rfi_responses'],

  // Punch List (Module 28)
  ['PunchItem', 'punch_items'],

  // Full Client Portal (Module 29)
  ['ClientPortalPayment', 'client_payments'],
  ['ClientSelectionApproval', 'client_approvals'],

  // Vendor Portal (Module 30)
  ['VendorPortalConfig', 'vendor_portal_settings'],

  // Warranty (Module 31)
  ['WarrantyClaim', 'warranty_claims'],
  ['WarrantyItem', 'warranties'],
  ['MaintenanceSchedule', 'maintenance_schedules'],
  ['MaintenanceTask', 'maintenance_tasks'],

  // Permitting (Module 32)
  ['Permit', 'permits'],
  ['Inspection', 'inspection_results'],

  // Safety (Module 33)
  ['SafetyIncident', 'safety_incidents'],
  ['ToolboxTalk', 'toolbox_talks'],

  // HR & Workforce (Module 34)
  ['Employee', 'employees'],
  ['Certification', 'employee_certifications'],

  // Equipment (Module 35)
  ['Equipment', 'equipment'],
  ['EquipmentMaintenance', 'equipment_maintenance'],

  // CRM (Module 36)
  ['Lead', 'leads'],
  ['LeadActivity', 'lead_activities'],

  // Marketing (Module 37)
  ['PortfolioProject', 'portfolio_projects'],
  ['ClientReview', 'client_reviews'],

  // Contracts (Module 38)
  ['Contract', 'contracts'],
  ['ContractTemplate', 'contract_templates'],
  ['SignatureRequest', 'contract_signers'],

  // Advanced Reporting (Module 39)
  ['ReportDefinition', 'report_definitions'],
  ['ReportSchedule', 'report_schedules'],

  // Time Tracking (Module 51)
  ['TimeEntry', 'time_entries'],
  ['CrewAssignment', 'crew_assignments'],

  // Inventory (Module 52)
  ['InventoryItem', 'inventory_items'],
  ['InventoryTransaction', 'inventory_transactions'],

  // Documents
  ['Document', 'documents'],
  ['DocumentFolder', 'document_folders'],

  // Notifications
  ['Notification', 'notifications'],
  ['NotificationPreference', 'user_notification_preferences'],

  // Onboarding Wizard (Module 41)
  ['OnboardingSession', 'onboarding_sessions'],
  ['OnboardingMilestone', 'onboarding_milestones'],
  ['OnboardingReminder', 'onboarding_reminders'],
  ['OnboardingChecklist', 'onboarding_checklists'],
  ['SampleDataSet', 'sample_data_sets'],

  // Data Migration (Module 42)
  ['MigrationJob', 'migration_jobs'],
  ['MigrationFieldMapping', 'migration_field_mappings'],
  ['MigrationMappingTemplate', 'migration_mapping_templates'],
  ['MigrationValidationResult', 'migration_validation_results'],
  ['MigrationReconciliation', 'migration_reconciliation'],

  // Subscription Billing (Module 43)
  ['SubscriptionPlan', 'subscription_plans'],
  ['PlanAddon', 'plan_addons'],
  ['CompanySubscription', 'company_subscriptions'],
  ['UsageMeter', 'usage_meters'],
  ['BillingEvent', 'billing_events'],

  // White Label & Branding (Module 44)
  ['BuilderBranding', 'builder_branding'],
  ['BuilderCustomDomain', 'builder_custom_domains'],
  ['BuilderEmailConfig', 'builder_email_config'],
  ['BuilderTerminology', 'builder_terminology'],
  ['BuilderContentPage', 'builder_content_pages'],

  // API & Marketplace (Module 45)
  ['ApiKey', 'api_keys'],
  ['ApiMetric', 'api_metrics'],
  ['WebhookSubscription', 'webhook_subscriptions'],
  ['WebhookDelivery', 'webhook_deliveries'],
  ['IntegrationListing', 'integration_listings'],
  ['IntegrationInstall', 'integration_installs'],

  // Customer Support (Module 46)
  ['SupportTicket', 'support_tickets'],
  ['TicketMessage', 'ticket_messages'],
  ['KbArticle', 'kb_articles'],
  ['FeatureRequest', 'feature_requests'],
  ['FeatureRequestVote', 'feature_request_votes'],

  // Training Platform (Module 47)
  ['TrainingCourse', 'training_courses'],
  ['TrainingPath', 'training_paths'],
  ['TrainingPathItem', 'training_path_items'],
  ['UserTrainingProgress', 'user_training_progress'],
  ['UserCertification', 'user_certifications'],

  // Template Marketplace (Module 48)
  ['MarketplacePublisher', 'marketplace_publishers'],
  ['MarketplaceTemplate', 'marketplace_templates'],
  ['MarketplaceTemplateVersion', 'marketplace_template_versions'],
  ['MarketplaceInstall', 'marketplace_installs'],
  ['MarketplaceReview', 'marketplace_reviews'],

  // Platform Analytics (Module 49)
  ['PlatformMetricsSnapshot', 'platform_metrics_snapshots'],
  ['TenantHealthScore', 'tenant_health_scores'],
  ['FeatureUsageEvent', 'feature_usage_events'],
  ['AbExperiment', 'ab_experiments'],
  ['DeploymentRelease', 'deployment_releases'],

  // Marketing Website (Module 50)
  ['MarketingLead', 'marketing_leads'],
  ['MarketingCampaign', 'marketing_campaigns'],
  ['MarketingReferral', 'marketing_referrals'],
  ['CampaignContact', 'campaign_contacts'],
  ['Testimonial', 'testimonials'],
  ['CaseStudy', 'case_studies'],
  ['BlogPost', 'blog_posts'],
];

// Insert/Update aliases
const insertAliases = [
  ['CompanyInsert', 'companies'],
  ['UserInsert', 'users'],
  ['JobInsert', 'jobs'],
  ['ClientInsert', 'clients'],
  ['VendorInsert', 'vendors'],
];

const updateAliases = [
  ['CompanyUpdate', 'companies'],
  ['UserUpdate', 'users'],
  ['JobUpdate', 'jobs'],
  ['ClientUpdate', 'clients'],
  ['VendorUpdate', 'vendors'],
];

let aliases = '\n// ============================================================================\n';
aliases += '// Convenience Aliases (auto-generated by build-db-types.cjs)\n';
aliases += '// ============================================================================\n\n';

let existCount = 0;
let placeholderCount = 0;

for (const [typeName, tableName] of tableAliases) {
  if (tableNames.has(tableName)) {
    aliases += `export type ${typeName} = Tables<'${tableName}'>\n`;
    existCount++;
  } else {
    aliases += `// ${typeName}: table '${tableName}' not yet in live DB\n`;
    aliases += `export type ${typeName} = { id: string; company_id: string; [key: string]: unknown }\n`;
    placeholderCount++;
  }
}

aliases += '\n// Enum convenience types\n';
const enumAliases = [
  ['JobStatus', 'job_status'],
  ['ContractType', 'contract_type'],
  ['UserRoleEnum', 'user_role'],
  ['InvoiceStatus', 'invoice_status'],
  ['DrawStatus', 'draw_status'],
  ['MaterialRequestStatus', 'material_request_status'],
  ['MaterialRequestPriority', 'material_request_priority'],
  ['InventoryLocationType', 'inventory_location_type'],
  ['InventoryTransactionType', 'inventory_transaction_type'],
];

for (const [typeName, enumName] of enumAliases) {
  if (enumNames.has(enumName)) {
    aliases += `export type ${typeName} = Enums<'${enumName}'>\n`;
  } else {
    aliases += `// ${typeName}: enum '${enumName}' not yet in live DB\n`;
    aliases += `export type ${typeName} = string\n`;
  }
}

// UserRole is the role enum (not a table)
aliases += `\n// UserRole = the user_role enum (used by settings components)\n`;
aliases += `export type UserRole = Enums<'user_role'>\n`;

aliases += '\n// Insert types\n';
for (const [typeName, tableName] of insertAliases) {
  if (tableNames.has(tableName)) {
    aliases += `export type ${typeName} = TablesInsert<'${tableName}'>\n`;
  }
}

aliases += '\n// Update types\n';
for (const [typeName, tableName] of updateAliases) {
  if (tableNames.has(tableName)) {
    aliases += `export type ${typeName} = TablesUpdate<'${tableName}'>\n`;
  }
}

// Notification enum types (manual — not DB enums)
aliases += `\n// Notification enum types (manual — not DB enums)\n`;
aliases += `export type NotificationCategory = 'financial' | 'schedule' | 'documents' | 'field_operations' | 'approvals' | 'system'\n`;
aliases += `export type NotificationUrgency = 'low' | 'normal' | 'high' | 'critical'\n`;
aliases += `export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push'\n`;
aliases += `export type DeliveryStatus = 'queued' | 'processing' | 'sent' | 'delivered' | 'failed' | 'bounced'\n`;
aliases += `export type DigestFrequency = 'hourly' | 'twice_daily' | 'daily'\n`;

// Notification complex types (manual — not DB tables)
aliases += `\n// Notification complex types (manual — not DB tables)\n`;
aliases += `export type NotificationEventType = {\n`;
aliases += `  id: string\n  event_type: string\n  module: string\n  description: string\n`;
aliases += `  default_channels: string[]\n  default_roles: string[]\n  variables: string[]\n`;
aliases += `  urgency: string\n  category: string\n  created_at: string\n  [key: string]: unknown\n}\n`;

aliases += `export type NotificationDelivery = {\n`;
aliases += `  id: string\n  notification_id: string\n  channel: NotificationChannel\n`;
aliases += `  status: DeliveryStatus\n  provider_message_id: string | null\n  attempts: number\n`;
aliases += `  last_attempt_at: string | null\n  error_message: string | null\n`;
aliases += `  created_at: string\n  updated_at: string\n  [key: string]: unknown\n}\n`;

aliases += `export type UserNotificationPreference = {\n`;
aliases += `  id: string\n  user_id: string\n  company_id: string\n  category: string\n`;
aliases += `  channel: string\n  enabled: boolean\n  created_at: string\n  updated_at: string\n`;
aliases += `  [key: string]: unknown\n}\n`;

aliases += `export type UserNotificationSetting = {\n`;
aliases += `  id: string\n  user_id: string\n  company_id: string\n`;
aliases += `  quiet_start: string\n  quiet_end: string\n  timezone: string\n`;
aliases += `  digest_mode: boolean\n  digest_frequency: string\n  digest_time: string\n`;
aliases += `  critical_bypass_quiet: boolean\n  created_at: string\n  updated_at: string\n`;
aliases += `  [key: string]: unknown\n}\n`;

// Project/entity enum types (manual — Zod enums in validation schemas)
aliases += `\n// Project/entity enum types (manual — not DB enums)\n`;
aliases += `export type ProjectType = 'new_construction' | 'renovation' | 'addition' | 'remodel' | 'commercial' | 'other'\n`;
aliases += `export type CostCodeCategory = 'labor' | 'material' | 'subcontractor' | 'equipment' | 'other'\n`;

const final = generated + '\n' + aliases + '\n';
fs.writeFileSync(outputPath, final);
console.log(`Wrote database.ts: ${final.length} chars, ${final.split('\n').length} lines`);
console.log(`  ${existCount} table aliases (live DB)`);
console.log(`  ${placeholderCount} placeholder aliases (future modules)`);
