'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { CostCodesPreview } from '@/components/skeleton/previews/cost-codes-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Settings', 'Cost Codes', 'Estimates', 'Budget', 'Invoices', 'Reports'
]

export default function CostCodesSkeleton() {
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
      {activeTab === 'preview' ? <CostCodesPreview /> : <PageSpec
      title="Cost Codes"
      phase="Phase 0 - Foundation"
      planFile="views/directory/VENDORS_CLIENTS_COSTCODES.md"
      description="Manage cost code library for budget organization. CSI-based structure with company customization. Cost codes are the backbone of financial tracking."
      workflow={constructionWorkflow}
      features={[
        'Hierarchical cost code structure (Division > Cost Code)',
        'CSI MasterFormat-based defaults',
        'Custom cost codes per company',
        'Active/Inactive status',
        'Trade association for vendor matching',
        'Default markup percentages',
        'Budget template associations',
        'Usage statistics across jobs',
        'Import/Export cost code library',
        'Merge duplicate cost codes',
      ]}
      connections={[
        { name: 'Budget', type: 'output', description: 'Budget lines organized by cost code' },
        { name: 'Estimates', type: 'output', description: 'Estimate lines tagged with cost codes' },
        { name: 'Invoices', type: 'output', description: 'Invoice allocations by cost code' },
        { name: 'Purchase Orders', type: 'output', description: 'PO line items by cost code' },
        { name: 'Vendors', type: 'bidirectional', description: 'Vendors associated with cost code trades' },
        { name: 'Reports', type: 'output', description: 'Reports grouped by cost code' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Mapped to GL accounts' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'code', type: 'string', required: true, description: 'Cost code number (e.g., 03-100)' },
        { name: 'name', type: 'string', required: true, description: 'Cost code name' },
        { name: 'division', type: 'string', required: true, description: 'Parent division (e.g., 03-Concrete)' },
        { name: 'trade', type: 'string', description: 'Associated trade' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Active or archived' },
        { name: 'default_markup', type: 'decimal', description: 'Default markup %' },
        { name: 'description', type: 'text', description: 'Description of what this code covers' },
        { name: 'qb_account_id', type: 'string', description: 'Mapped QuickBooks account' },
        { name: 'sort_order', type: 'integer', description: 'Display order' },
      ]}
      aiFeatures={[
        { name: 'Code Suggestion', description: 'AI suggests appropriate cost code based on invoice/PO description', trigger: 'On allocation' },
        { name: 'Learning from Corrections', description: 'Learns from user corrections to improve future suggestions', trigger: 'On code change' },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Cost Codes                              [+ Add Code] [Import] [▾]    │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [________________]                  [Show Inactive ☐]        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ▼ 01 - GENERAL CONDITIONS                                           │
│   ├─ 01-100  Project Management           Mgmt       Active         │
│   ├─ 01-200  Permits & Fees               Admin      Active         │
│   └─ 01-300  Temporary Facilities         General    Active         │
│                                                                     │
│ ▼ 02 - SITE WORK                                                    │
│   ├─ 02-100  Excavation                   Site       Active         │
│   ├─ 02-200  Grading                      Site       Active         │
│   └─ 02-300  Utilities                    Site       Active         │
│                                                                     │
│ ▼ 03 - CONCRETE                                                     │
│   ├─ 03-100  Footings                     Concrete   Active         │
│   ├─ 03-200  Foundation Walls             Concrete   Active         │
│   ├─ 03-300  Slab on Grade                Concrete   Active         │
│   └─ 03-400  Flatwork                     Concrete   Active         │
│                                                                     │
│ ▶ 04 - MASONRY                                                      │
│ ▶ 05 - METALS                                                       │
│ ▶ 06 - CARPENTRY                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
