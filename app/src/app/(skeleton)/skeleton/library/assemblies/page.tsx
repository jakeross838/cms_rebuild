'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function AssembliesPage() {
  return (
    <PageSpec
      title="Assemblies & Templates"
      phase="Phase 0 - Foundation"
      planFile="views/library/ASSEMBLIES.md"
      description="Reusable estimate building blocks with default selections. Create assemblies like 'Standard Kitchen Package' or 'Coastal Bathroom' that include all line items with pre-selected products from the Selections Catalog. Dramatically speeds up estimating while ensuring consistency."
      workflow={['Create Assembly', 'Add to Estimate', 'Customize', 'Track Performance']}
      features={[
        'Assembly library organized by category',
        'Each assembly = group of line items with default selections',
        'Selection-based: Every line item references Catalog',
        'Tier defaults: Assembly can default to any tier',
        'Quick swap: Change entire assembly tier with one click',
        'Clone and customize assemblies',
        'Version history',
        'Cost tracking over time',
        'Usage analytics',
        'Import/export assemblies',
        'Nested assemblies support',
        'Per-unit pricing (e.g., per bathroom, per SF)',
      ]}
      connections={[
        { name: 'Selections Catalog', type: 'input', description: 'Line items reference selections' },
        { name: 'Estimates', type: 'output', description: 'Assemblies inserted into estimates' },
        { name: 'Cost Codes', type: 'input', description: 'Line items map to cost codes' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Assembly name' },
        { name: 'category', type: 'string', required: true, description: 'Kitchen, Bath, etc.' },
        { name: 'description', type: 'text', description: 'Assembly description' },
        { name: 'default_tier', type: 'string', description: 'Default selection tier' },
        { name: 'unit_type', type: 'string', description: 'Per each, per SF, per room' },
        { name: 'line_items', type: 'jsonb', required: true, description: 'Array of line items' },
        { name: 'total_cost', type: 'decimal', description: 'Calculated total' },
        { name: 'usage_count', type: 'integer', description: 'Times used' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Available for use' },
      ]}
      aiFeatures={[
        {
          name: 'Assembly Suggestions',
          description: 'Suggests relevant assemblies based on project type.',
          trigger: 'On estimate creation'
        },
        {
          name: 'Cost Drift Alerts',
          description: 'Alerts when assembly cost changed significantly.',
          trigger: 'Weekly review'
        },
        {
          name: 'Missing Item Detection',
          description: 'Identifies commonly forgotten items.',
          trigger: 'On assembly review'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Assemblies & Templates                         [+ New Assembly]     │
├─────────────────────────────────────────────────────────────────────┤
│ Categories: Kitchen (8) | Bathroom (6) | Exterior (4) | MEP (5)    │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ★ Standard Kitchen Package                                      │ │
│ │   12 line items | Default: Premium | $42,500                    │ │
│ │   Used: 34 times | Last: 2 weeks ago                            │ │
│ │   Includes: Cabinets, Counters, Sink, Faucet, Backsplash...    │ │
│ │   [Edit] [Clone] [Use in Estimate]                              │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Coastal Master Bathroom                                         │ │
│ │   18 line items | Default: Premium | $28,000                    │ │
│ │   Double vanity, walk-in shower, freestanding tub...            │ │
│ │   [Edit] [Clone] [Use in Estimate]                              │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
