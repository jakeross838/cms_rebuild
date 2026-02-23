'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { AssembliesPreview } from '@/components/skeleton/previews/assemblies-preview'
import { cn } from '@/lib/utils'

const workflow = ['Create Assembly', 'Add to Estimate', 'Customize', 'Track Performance']

export default function AssembliesPage() {
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
      {activeTab === 'preview' ? <AssembliesPreview /> : <PageSpec
      title="Assemblies & Templates"
      phase="Phase 4 - Intelligence"
      planFile="docs/modules/20-estimating-engine.md"
      description="Pre-built recipe building blocks that group multiple line items. Assemblies are parameterized by quantity (e.g., LF of wall) and auto-calculate all child items. Example: 'Exterior Wall Assembly' = framing labor + material + sheathing + housewrap + insulation. Supports nested assemblies, tier-based pricing, waste factors, and cost tracking over time."
      workflow={workflow}
      features={[
        'Assembly library organized by category',
        'Parameterized assemblies: quantity input auto-calculates all child items',
        'Each assembly = group of line items with default selections',
        'Selection-based: Every line item references Selections Catalog',
        'Tier defaults: Assembly can default to any tier (Builder/Standard/Premium/Luxury)',
        'Quick swap: Change entire assembly tier with one click',
        'Per-unit pricing: $/SF, $/LF, $/EA, per room, per ton',
        'Nested assemblies: assemblies can contain other assemblies',
        'Waste factors per material automatically applied',
        'Clone and customize assemblies',
        'Version history with cost tracking over time',
        'Usage analytics: how many times used, where',
        'Import/export assemblies (CSV, shared templates)',
        'Active/inactive status for retired assemblies',
        'Cost change alerts: flag when component costs shift',
        'Favorite marking for frequently used assemblies',
      ]}
      connections={[
        { name: 'Selections Catalog', type: 'input', description: 'Line items reference selections for pricing and products' },
        { name: 'Estimates', type: 'output', description: 'Assemblies inserted into estimates with parameter input' },
        { name: 'Cost Codes', type: 'input', description: 'Line items map to builder cost code library' },
        { name: 'Price Intelligence', type: 'input', description: 'Cost change tracking from actual invoice data' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Assembly name' },
        { name: 'category', type: 'string', required: true, description: 'Kitchen, Bath, Structural, MEP, etc.' },
        { name: 'description', type: 'text', description: 'Assembly description with included items' },
        { name: 'parameter_unit', type: 'string', required: true, description: 'Unit of measure for parameterization (SF, LF, EA, etc.)' },
        { name: 'default_tier', type: 'string', description: 'Default selection tier' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Available for use or retired' },
        { name: 'total_cost', type: 'decimal', description: 'Calculated total at default tier' },
        { name: 'cost_per_unit', type: 'decimal', description: 'Cost per parameter unit' },
        { name: 'usage_count', type: 'integer', description: 'Times used in estimates' },
        { name: 'has_nested_assemblies', type: 'boolean', description: 'Contains sub-assemblies' },
      ]}
      aiFeatures={[
        {
          name: 'Assembly Suggestions',
          description: 'Suggests relevant assemblies based on project type, SF, and region.',
          trigger: 'On estimate creation'
        },
        {
          name: 'Cost Drift Alerts',
          description: 'Alerts when assembly component costs changed >5% from last review. Tracks per-item price changes.',
          trigger: 'Weekly review + on invoice processing'
        },
        {
          name: 'Missing Item Detection',
          description: 'Identifies commonly forgotten items (e.g., hurricane clips in framing package).',
          trigger: 'On assembly review'
        },
        {
          name: 'Variant Recommendation',
          description: 'Suggests creating tier variants when an assembly is heavily used (e.g., Budget Kitchen from Standard Kitchen).',
          trigger: 'When usage exceeds threshold'
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
    />}
    </div>
  )
}
