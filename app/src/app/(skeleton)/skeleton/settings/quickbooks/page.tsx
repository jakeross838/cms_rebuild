'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { QuickbooksPreview } from '@/components/skeleton/previews/quickbooks-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Settings', 'OAuth Connect', 'Account Mapping', 'Sync Config', 'Monitor', 'Resolve'
]

export default function QuickBooksSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? <QuickbooksPreview /> : <PageSpec
      title="QuickBooks Integration"
      phase="Phase 0 - Foundation"
      planFile="views/integrations/QUICKBOOKS.md"
      description="Bi-directional sync engine connecting to QuickBooks Online (primary) and Xero (alternative). Eliminates double-entry by synchronizing invoices, payments, journal entries, vendors, and customers. Per-builder account mapping, configurable sync frequency, conflict resolution strategies, and dead-letter queue for failed items."
      workflow={constructionWorkflow}
      features={[
        'OAuth2 connection with PKCE for QuickBooks Online',
        'OAuth2 connection for Xero with tenant selection',
        'Automatic token refresh with expiration countdown and alerts',
        'Disconnect flow with token revocation and data cleanup',
        'Configurable account mapping: cost codes to GL accounts',
        'Mapping types: expense, revenue, asset (stored materials), liability (retainage)',
        'One-to-one and many-to-one cost code mapping support',
        'AI-suggested default mappings based on account name similarity',
        'Unmapped cost codes flagged; transactions held in review queue',
        'Versioned mapping history (changes do not alter historical transactions)',
        'Push: Invoices (AR), Bills (AP), Journal Entries, Customers, Vendors',
        'Pull: Payments Received, Bill Payments, Bank Deposits',
        'Bi-directional: Chart of Accounts',
        'Journal entries for retainage, WIP adjustments',
        'Real-time push on record creation/approval',
        'Scheduled sync with configurable interval (15min, 30min, hourly, daily, custom)',
        'Sync window restriction (business hours, 24/7, custom)',
        'Manual sync per entity type or all',
        'Initial bulk import from QBO on first connection',
        'Per-entity conflict resolution: last-write-wins, platform-wins, QBO-wins, manual review',
        'Conflict detection via field checksum comparison',
        'Side-by-side conflict resolution UI with plain-language explanation',
        'External deletion detection and soft-flag handling',
        'Exponential backoff retry (max 5 retries over 2 hours)',
        'Dead-letter queue for permanently failed items with bulk retry',
        'Error categorization: auth, data validation, rate limit, network',
        'Sync dashboard with health indicator (green/yellow/red)',
        'Per-entity sync history with expandable detail rows',
        'Connection health monitoring with token expiry countdown',
        'Class/Location/Project mapping for job tracking in QBO',
        'Xero tracking categories mapped to platform cost codes',
        'Zapier/Make webhook-based automation triggers',
        'Stale sync alerting (7+ days without successful sync)',
        'Filterable error log with export capability',
      ]}
      connections={[
        { name: 'Invoices (AP)', type: 'output', description: 'Approved vendor invoices push as QBO Bills' },
        { name: 'Draws (AR)', type: 'output', description: 'Draw requests push as QBO Invoices' },
        { name: 'Journal Entries', type: 'output', description: 'Retainage, WIP adjustments push as QBO Journal Entries' },
        { name: 'Vendors', type: 'bidirectional', description: 'Two-way vendor data sync' },
        { name: 'Customers', type: 'bidirectional', description: 'Two-way client/customer sync' },
        { name: 'Payments Received', type: 'input', description: 'Client payments in QBO pull back to mark invoices paid' },
        { name: 'Bill Payments', type: 'input', description: 'Vendor payments in QBO pull back to update AP status' },
        { name: 'Bank Deposits', type: 'input', description: 'Deposit references for payment reconciliation' },
        { name: 'Chart of Accounts', type: 'bidirectional', description: 'Initial pull, then push new accounts as needed' },
        { name: 'Cost Codes', type: 'input', description: 'Platform cost codes mapped to QBO accounts' },
        { name: 'Jobs', type: 'output', description: 'Jobs mapped to QBO Classes/Locations/Projects' },
        { name: 'Purchase Orders', type: 'output', description: 'PO-linked bills synced to QBO' },
        { name: 'Budget', type: 'input', description: 'Cost code structure for mapping configuration' },
        { name: 'Zapier/Make', type: 'output', description: 'Webhook triggers for automation platforms' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key (v2_integration_connections)' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'FK to builders (multi-tenant)' },
        { name: 'provider', type: 'string', required: true, description: 'quickbooks_online, xero, sage' },
        { name: 'status', type: 'string', required: true, description: 'connected, disconnected, error, expired' },
        { name: 'access_token_encrypted', type: 'string', description: 'Encrypted OAuth access token' },
        { name: 'refresh_token_encrypted', type: 'string', description: 'Encrypted OAuth refresh token' },
        { name: 'token_expires_at', type: 'timestamp', description: 'Token expiration timestamp' },
        { name: 'provider_tenant_id', type: 'string', description: 'QBO realm_id or Xero tenant_id' },
        { name: 'provider_company_name', type: 'string', description: 'Connected company display name' },
        { name: 'sync_schedule', type: 'string', description: 'Sync frequency (15min, hourly, daily, custom)' },
        { name: 'conflict_strategy', type: 'string', description: 'Default: last_write_wins, platform_wins, qbo_wins, manual_review' },
        { name: 'last_sync_at', type: 'timestamp', description: 'Last successful sync timestamp' },
        { name: 'settings', type: 'jsonb', description: 'Provider-specific settings and per-entity config' },
        { name: 'mapping_id', type: 'uuid', description: 'v2_account_mappings FK' },
        { name: 'platform_cost_code_id', type: 'uuid', description: 'Cost code being mapped' },
        { name: 'platform_entity_type', type: 'string', description: 'cost_code, revenue, asset, liability' },
        { name: 'provider_account_id', type: 'string', description: 'QBO/Xero account ID' },
        { name: 'provider_account_name', type: 'string', description: 'QBO/Xero account display name' },
        { name: 'provider_account_type', type: 'string', description: 'Account type in provider system' },
        { name: 'mapping_direction', type: 'string', description: 'push, pull, or both' },
        { name: 'sync_log_id', type: 'uuid', description: 'v2_sync_log FK for sync operations' },
        { name: 'sync_type', type: 'string', description: 'manual, scheduled, real_time' },
        { name: 'entity_type', type: 'string', description: 'invoice, payment, vendor, customer, journal_entry' },
        { name: 'direction', type: 'string', description: 'push or pull' },
        { name: 'records_processed', type: 'integer', description: 'Total records in sync batch' },
        { name: 'records_succeeded', type: 'integer', description: 'Successfully synced count' },
        { name: 'records_failed', type: 'integer', description: 'Failed record count' },
        { name: 'sync_record_id', type: 'uuid', description: 'v2_sync_records FK for individual items' },
        { name: 'platform_entity_id', type: 'uuid', description: 'Platform record being synced' },
        { name: 'provider_entity_id', type: 'string', description: 'QBO/Xero record ID' },
        { name: 'error_message', type: 'string', description: 'Error detail for failed records' },
        { name: 'conflict_data', type: 'jsonb', description: 'Both values when conflict detected' },
        { name: 'retry_count', type: 'integer', description: 'Number of retry attempts' },
        { name: 'next_retry_at', type: 'timestamp', description: 'Scheduled next retry time' },
      ]}
      aiFeatures={[
        {
          name: 'Account Mapping Suggestions',
          description: 'AI suggests GL account mappings based on cost code name similarity. Fuzzy matching across expense, revenue, asset, and liability categories. "Cost code 03-Concrete maps to 5200-Concrete (98% match)."',
          trigger: 'On initial setup and when new cost codes are added'
        },
        {
          name: 'Sync Error Resolution',
          description: 'Analyzes sync errors and suggests fixes. "Bill for INV-1234 failed: cost code 09 (Finishes) has no mapped QBO account. Map to suggested 5800-Interior Finishes to resolve 2 queued items."',
          trigger: 'On sync error'
        },
        {
          name: 'Data Validation',
          description: 'Pre-sync validation checks data completeness, detects potential duplicates, and validates amounts. "Invoice $0.00 amount detected - likely data entry error. 3 vendors have duplicate QBO IDs."',
          trigger: 'Before each sync cycle'
        },
        {
          name: 'Conflict Pattern Detection',
          description: 'Identifies recurring conflict patterns and suggests strategy adjustments. "Vendor addresses conflict 80% of the time - consider switching to platform-wins for vendor entity. Payment amounts rarely conflict - last-write-wins is appropriate."',
          trigger: 'Weekly analysis'
        },
        {
          name: 'Sync Health Monitoring',
          description: 'Monitors sync health trends and predicts issues. "Sync error rate increased from 0.5% to 2.1% this week - primarily journal entry failures. Token expires in 7 days - schedule renewal. QBO rate limit approaching threshold."',
          trigger: 'Continuous monitoring'
        },
        {
          name: 'Stale Record Detection',
          description: 'Detects records deleted or voided in QBO that still exist in platform. "3 QBO bills voided since last sync. Matching platform invoices: INV-0821, INV-0834, INV-0847. Recommend archiving."',
          trigger: 'On sync completion'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ QuickBooks Integration                      [History] [Sync Now]     │
├─────────────────────────────────────────────────────────────────────┤
│ ┌───────────────┬──────────────┬──────────────┬──────────────────┐  │
│ │ Success Rate  │ Total Synced │ Errors       │ Token Expires    │  │
│ │ 99.2%         │ 1,247        │ 2            │ 28 days          │  │
│ └───────────────┴──────────────┴──────────────┴──────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: [Overview] [Account Mapping] [Settings]                       │
├─────────────────────────────────────────────────────────────────────┤
│ CONNECTION                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Connected to QuickBooks Online        Health: ● Healthy       │ │
│ │   Ross Built Construction LLC                                   │ │
│ │   Last Sync: 5 min ago | Auto: 30 min | Token: 28 days         │ │
│ │                           [Sync Now] [Configure] [Disconnect]   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ SYNC STATUS BY ENTITY                                               │
│ ┌─────────────┬──────────────┬──────────────┬──────────────────┐   │
│ │ Customers↔  │ Vendors↔     │ Bills(AP)→⚡ │ Invoices(AR)→⚡  │   │
│ │ 47 ✓ 5m ago │ 32 ⚠ 1 dup  │ 156 ✓       │ 89 ✓            │   │
│ ├─────────────┼──────────────┼──────────────┼──────────────────┤   │
│ │ Payments←   │ Bill Pay←    │ Journal→     │                  │   │
│ │ 234 ✓       │ 178 ✓       │ 12 ✗ 2 err  │                  │   │
│ └─────────────┴──────────────┴──────────────┴──────────────────┘   │
│                                                                     │
│ ⚠ CONFLICTS (1)                            [Resolve All]           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Vendor: ABC Lumber | Field: address | Strategy: platform-wins   │ │
│ │ RossOS: 123 Oak Street   QBO: 123 Oak St                       │ │
│ │ [Keep RossOS] [Keep QBO] [Ignore]                               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ⚠ 2 cost codes unmapped - transactions held in review queue        │
│                                              [Map Now]              │
│                                                                     │
│ SYNC HISTORY                               [Retry All Failed]      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✓ INV-1234 → QBO Bill | ABC Electric $12,500 | 5m ago          │ │
│ │ ⚠ Vendor conflict: ABC Lumber (resolved: platform-wins)         │ │
│ │ ✓ Draw #4 → QBO Invoice | Smith Residence $125K | 10m ago      │ │
│ │ ✗ Journal entry failed: code 09 unmapped | 3 retries [Retry]   │ │
│ │ ✓ Payment received: Johnson Draw #3 $85K ← QBO | 15m ago       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ AI: 2 unmapped codes blocking 2 journal entries. Auto-mapping       │
│     suggested. Token renewal in 28 days. 99.2% success rate.        │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
