'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { QuickbooksPreview } from '@/components/skeleton/previews/quickbooks-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Settings', 'QuickBooks Connect', 'Data Mapping', 'Sync', 'Reports'
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
      description="Connect and sync with QuickBooks Online. Map accounts, sync vendors, push invoices as bills, and create customer invoices from draws."
      workflow={constructionWorkflow}
      features={[
        'OAuth connection to QuickBooks Online',
        'Account mapping: GL accounts to cost codes',
        'Vendor sync: Two-way vendor data sync',
        'Bill sync: Approved invoices push as QBO bills',
        'Invoice sync: Draws push as QBO invoices',
        'Payment sync: Track payments in both systems',
        'Class/Location mapping for job tracking',
        'Manual and automatic sync options',
        'Sync history and error logs',
        'Disconnect and reconnect capability',
      ]}
      connections={[
        { name: 'Invoices', type: 'output', description: 'Approved invoices become QBO bills' },
        { name: 'Draws', type: 'output', description: 'Draws become QBO invoices' },
        { name: 'Vendors', type: 'bidirectional', description: 'Two-way vendor sync' },
        { name: 'Cost Codes', type: 'input', description: 'Mapped to QBO accounts' },
        { name: 'Jobs', type: 'output', description: 'Jobs mapped to QBO classes' },
        { name: 'Payments', type: 'bidirectional', description: 'Payment status sync' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'company_id', type: 'uuid', required: true, description: 'FK to companies' },
        { name: 'qbo_realm_id', type: 'string', description: 'QuickBooks company ID' },
        { name: 'access_token', type: 'string', description: 'OAuth access token (encrypted)' },
        { name: 'refresh_token', type: 'string', description: 'OAuth refresh token (encrypted)' },
        { name: 'token_expires_at', type: 'timestamp', description: 'Token expiration' },
        { name: 'account_mappings', type: 'jsonb', description: 'Cost code to account mappings' },
        { name: 'class_mappings', type: 'jsonb', description: 'Job to class mappings' },
        { name: 'sync_settings', type: 'jsonb', description: 'Auto-sync preferences' },
        { name: 'last_sync_at', type: 'timestamp', description: 'Last successful sync' },
        { name: 'is_connected', type: 'boolean', description: 'Connection status' },
      ]}
      aiFeatures={[
        { name: 'Account Mapping Suggestions', description: 'AI suggests account mappings based on cost code names', trigger: 'On initial setup' },
        { name: 'Sync Error Resolution', description: 'Suggests fixes for common sync errors', trigger: 'On sync error' },
        { name: 'Data Validation', description: 'Validates data before sync to prevent errors', trigger: 'Before sync' },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ QuickBooks Integration                           [Sync Now] [History]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ CONNECTION STATUS                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Connected to QuickBooks Online                                │ │
│ │   Company: Ross Built Construction LLC                          │ │
│ │   Last Sync: 5 minutes ago                                      │ │
│ │                                           [Disconnect] [Refresh]│ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ SYNC SETTINGS                                                       │
│ ────────────────────────────────────────────────────────────────── │
│ ☑ Auto-sync approved invoices to QBO bills                         │
│ ☑ Auto-sync submitted draws to QBO invoices                        │
│ ☑ Two-way vendor sync                                              │
│ ☐ Auto-sync payments (requires confirmation)                       │
│                                                                     │
│ ACCOUNT MAPPING                                                     │
│ ┌────────────────────┬────────────────────────────────────────────┐ │
│ │ Cost Code          │ QuickBooks Account                         │ │
│ ├────────────────────┼────────────────────────────────────────────┤ │
│ │ 01 - General       │ [5000 - Cost of Goods Sold          ▾]    │ │
│ │ 02 - Site Work     │ [5100 - Site Work                   ▾]    │ │
│ │ 03 - Concrete      │ [5200 - Concrete                    ▾]    │ │
│ └────────────────────┴────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
