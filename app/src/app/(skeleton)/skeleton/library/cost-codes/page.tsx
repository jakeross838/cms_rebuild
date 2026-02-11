'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function CostCodesPage() {
  return (
    <PageSpec
      title="Cost Codes"
      phase="Phase 0 - Foundation"
      planFile="views/library/COST_CODES.md"
      description="Hierarchical cost code structure for organizing budgets and tracking costs. Map to QuickBooks accounts for seamless accounting integration. Define standard codes for your business with the ability to add job-specific codes as needed."
      workflow={['Define Codes', 'Map to QB', 'Use in Budgets', 'Track Costs']}
      features={[
        'Hierarchical structure (Division > Category > Code)',
        'CSI MasterFormat compatible',
        'Custom codes for your business',
        'QuickBooks account mapping',
        'Default markup percentages',
        'Labor vs material split tracking',
        'Active/inactive status',
        'Bulk import/export',
        'Usage statistics',
        'Job-specific code extensions',
      ]}
      connections={[
        { name: 'Estimates', type: 'output', description: 'Line items assigned to codes' },
        { name: 'Budget', type: 'output', description: 'Budget organized by codes' },
        { name: 'Purchase Orders', type: 'output', description: 'PO lines coded' },
        { name: 'Invoices', type: 'output', description: 'Invoice allocations coded' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Account mapping' },
        { name: 'Reports', type: 'output', description: 'Cost reports by code' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'code', type: 'string', required: true, description: 'Cost code (e.g., 06-100)' },
        { name: 'name', type: 'string', required: true, description: 'Code name' },
        { name: 'parent_id', type: 'uuid', description: 'Parent code for hierarchy' },
        { name: 'description', type: 'text', description: 'Code description' },
        { name: 'qb_account_id', type: 'string', description: 'QuickBooks account' },
        { name: 'default_markup', type: 'decimal', description: 'Default markup %' },
        { name: 'track_labor', type: 'boolean', description: 'Track labor separately' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Available for use' },
        { name: 'sort_order', type: 'integer', description: 'Display order' },
      ]}
      aiFeatures={[
        {
          name: 'Code Suggestions',
          description: 'Suggests appropriate cost codes based on line item description.',
          trigger: 'On line item entry'
        },
        {
          name: 'Mapping Validation',
          description: 'Ensures QuickBooks mappings are complete and valid.',
          trigger: 'On sync'
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
    />
  )
}
