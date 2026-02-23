'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { CostCodesPreview } from '@/components/skeleton/previews/cost-codes-preview'
import { cn } from '@/lib/utils'

const workflow = ['Define Codes', 'Map to QB', 'Use in Budgets', 'Track Costs']

export default function CostCodesPage() {
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
      planFile="views/library/COST_CODES.md"
      description="Hierarchical cost code structure for organizing budgets and tracking costs. Map to QuickBooks accounts for seamless accounting integration. Define standard codes for your business with the ability to add job-specific codes as needed."
      workflow={workflow}
      features={[
        'Hierarchical structure (Division > Category > Code) with 2-5 configurable levels',
        'CSI MasterFormat compatible (16 or 50 division)',
        'Custom codes with hybrid support (CSI for some divisions, custom for others)',
        'Configurable hierarchy style: Division>Code>Item, Phase>Trade>Item, or Category>Sub>Item',
        'QuickBooks GL account mapping per code',
        'Default unit of measure (EA, SF, LF, LS, HR, SQ, etc.)',
        'Default unit cost for estimating auto-population',
        'Default markup percentages (flat, tiered, per-line, built-in)',
        'Labor vs material split tracking',
        'Active/inactive with soft-delete (deactivated codes visible in history)',
        'Pre-deactivation check: blocks if open POs, unpaid invoices, or active budget lines exist',
        'Merge workflow: merge one code into another, reassigning all linked records',
        'Bulk import/export via CSV',
        'Usage statistics and linked record counts (budget lines, POs, invoices)',
        'Platform starter libraries that builders customize',
        'Job-specific code extensions',
      ]}
      connections={[
        { name: 'Estimates', type: 'output', description: 'Line items assigned to codes with unit pricing' },
        { name: 'Budget', type: 'output', description: 'Budget organized by codes; three-column tracking' },
        { name: 'Purchase Orders', type: 'output', description: 'PO lines coded; rate sheets auto-populate' },
        { name: 'Invoices', type: 'output', description: 'AI suggests cost codes on invoice processing' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'GL account mapping; chart of accounts sync' },
        { name: 'Reports', type: 'output', description: 'Cost reports, WIP, and profitability by code' },
        { name: 'Change Orders', type: 'output', description: 'CO line items coded to cost codes' },
        { name: 'Price Intelligence', type: 'output', description: 'Unit cost benchmarks per code across projects' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'code', type: 'string', required: true, description: 'Cost code (e.g., 06-100)' },
        { name: 'name', type: 'string', required: true, description: 'Code name' },
        { name: 'parent_id', type: 'uuid', description: 'Parent code for hierarchy (self-ref)' },
        { name: 'level', type: 'integer', description: 'Depth in hierarchy (1=division, 2=sub, etc.)' },
        { name: 'system', type: 'enum', description: 'csi, custom, or hybrid' },
        { name: 'description', type: 'text', description: 'Code description' },
        { name: 'default_unit', type: 'string', description: 'EA, SF, LF, LS, HR, SQ, etc.' },
        { name: 'default_unit_cost', type: 'decimal', description: 'Typical unit cost for estimating' },
        { name: 'gl_account_mapping', type: 'string', description: 'QuickBooks GL account' },
        { name: 'default_markup', type: 'decimal', description: 'Default markup %' },
        { name: 'track_labor', type: 'boolean', description: 'Track labor separately' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Active (soft-delete only)' },
        { name: 'sort_order', type: 'integer', description: 'Display order' },
      ]}
      aiFeatures={[
        {
          name: 'Code Suggestions',
          description: 'AI suggests appropriate cost codes based on line item description, vendor trade, and historical patterns.',
          trigger: 'On line item entry in budget, PO, or invoice'
        },
        {
          name: 'Mapping Validation',
          description: 'Ensures all active codes have QuickBooks mappings. Flags orphaned mappings when GL structure changes.',
          trigger: 'On sync and on-demand audit'
        },
        {
          name: 'Usage Analytics',
          description: 'Identifies high-usage codes that may benefit from subcategorization. Suggests splitting or merging based on usage patterns.',
          trigger: 'Monthly analysis'
        },
        {
          name: 'Benchmark Comparison',
          description: 'Compares your markup percentages against regional industry averages. Flags outliers that may affect competitiveness.',
          trigger: 'On code view'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Cost Codes                               [+ Add Code] [Import/Export]│
├─────────────────────────────────────────────────────────────────────┤
│ ▼ 01 - General Conditions                    QB: 5000-General       │
│   ├─ 01-100 Project Management               QB: 5010-PM            │
│   ├─ 01-200 Temporary Facilities             QB: 5020-Temp          │
│   └─ 01-300 Permits & Fees                   QB: 5030-Permits       │
│                                                                     │
│ ▼ 06 - Wood & Plastics                       QB: 5600-Carpentry     │
│   ├─ 06-100 Rough Carpentry                  QB: 5610-Rough         │
│   ├─ 06-200 Finish Carpentry                 QB: 5620-Finish        │
│   └─ 06-300 Millwork                         QB: 5630-Millwork      │
│                                                                     │
│ ▶ 07 - Thermal & Moisture                                           │
│ ▶ 08 - Doors & Windows                                              │
│ ▶ 09 - Finishes                                                     │
│ ▶ 15 - Mechanical                                                   │
│ ▶ 16 - Electrical                                                   │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
