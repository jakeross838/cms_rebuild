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
  ['TaskDependency', 'task_dependencies'],

  // Daily Logs (Module 08)
  ['DailyLog', 'daily_logs'],
  ['DailyLogEntry', 'daily_log_entries'],

  // Budget & Cost (Module 09)
  ['BudgetLine', 'budget_lines'],
  ['CostEntry', 'cost_entries'],

  // Vendor Management (Module 10)
  ['VendorInsurance', 'vendor_insurance'],
  ['VendorContact', 'vendor_contacts'],

  // Accounting (Module 11)
  ['GlAccount', 'gl_accounts'],
  ['JournalEntry', 'journal_entries'],
  ['JournalEntryLine', 'journal_entry_lines'],
  ['Invoice', 'invoices'],
  ['InvoiceLine', 'invoice_lines'],
  ['Payment', 'payments'],
  ['PaymentApplication', 'payment_applications'],
  ['BankAccount', 'bank_accounts'],
  ['BankTransaction', 'bank_transactions'],
  ['BankReconciliation', 'bank_reconciliations'],

  // Client Portal (Module 12)
  ['ClientPortalConfig', 'client_portal_configs'],
  ['ClientPortalMessage', 'client_portal_messages'],
  ['ClientApproval', 'client_approvals'],

  // AI Invoice Processing (Module 13)
  ['AiInvoice', 'ai_invoices'],

  // Lien Waivers (Module 14)
  ['LienWaiver', 'lien_waivers'],

  // Draw Requests (Module 15)
  ['DrawRequest', 'draw_requests'],
  ['DrawRequestLine', 'draw_request_lines'],

  // QuickBooks Integration (Module 16)
  ['AccountingConnection', 'accounting_connections'],
  ['AccountingSyncLog', 'accounting_sync_logs'],

  // Change Orders (Module 17)
  ['ChangeOrder', 'change_orders'],
  ['ChangeOrderLine', 'change_order_lines'],

  // Purchase Orders (Module 18)
  ['PurchaseOrder', 'purchase_orders'],
  ['PurchaseOrderLine', 'purchase_order_lines'],

  // Financial Reporting (Module 19)
  ['FinancialReport', 'financial_reports'],
  ['SavedReport', 'saved_reports'],

  // Estimating (Module 20)
  ['Estimate', 'estimates'],
  ['EstimateLine', 'estimate_lines'],
  ['AssemblyTemplate', 'assembly_templates'],

  // Selections (Module 21)
  ['Selection', 'selections'],
  ['SelectionOption', 'selection_options'],
  ['SelectionChoice', 'selection_choices'],

  // Vendor Performance (Module 22)
  ['VendorScorecard', 'vendor_scorecards'],
  ['VendorReview', 'vendor_reviews'],

  // Price Intelligence (Module 23)
  ['PriceEntry', 'price_entries'],
  ['PriceAlert', 'price_alerts'],

  // AI Document Processing (Module 24)
  ['ProcessedDocument', 'processed_documents'],
  ['DocumentExtractionRule', 'document_extraction_rules'],

  // Schedule Intelligence (Module 25)
  ['WeatherForecast', 'weather_forecasts'],
  ['ScheduleOptimization', 'schedule_optimizations'],

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
  ['ClientPortalPayment', 'client_portal_payments'],
  ['ClientSelectionApproval', 'client_selection_approvals'],

  // Vendor Portal (Module 30)
  ['VendorPortalConfig', 'vendor_portal_configs'],

  // Warranty (Module 31)
  ['WarrantyClaim', 'warranty_claims'],
  ['WarrantyItem', 'warranty_items'],
  ['MaintenanceSchedule', 'maintenance_schedules'],
  ['MaintenanceTask', 'maintenance_tasks'],

  // Permitting (Module 32)
  ['Permit', 'permits'],
  ['Inspection', 'inspections'],

  // Safety (Module 33)
  ['SafetyIncident', 'safety_incidents'],
  ['ToolboxTalk', 'toolbox_talks'],

  // HR & Workforce (Module 34)
  ['Employee', 'employees'],
  ['Certification', 'certifications'],

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
  ['SignatureRequest', 'signature_requests'],

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
  ['NotificationPreference', 'notification_preferences'],
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

const final = generated + '\n' + aliases + '\n';
fs.writeFileSync(outputPath, final);
console.log(`Wrote database.ts: ${final.length} chars, ${final.split('\n').length} lines`);
console.log(`  ${existCount} table aliases (live DB)`);
console.log(`  ${placeholderCount} placeholder aliases (future modules)`);
