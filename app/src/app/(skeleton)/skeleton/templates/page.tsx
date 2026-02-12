'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { TemplatesPreview } from '@/components/skeleton/previews/templates-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Selections Catalog', 'Assemblies/Templates', 'Estimates', 'Proposals'
]

export default function TemplatesSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <TemplatesPreview />
      ) : (
        <PageSpec
          title="Assemblies & Templates"
      phase="Phase 0 - Foundation"
      planFile="views/catalog/ASSEMBLIES_TEMPLATES.md"
      description="Reusable estimate building blocks with default selections. Create assemblies like 'Standard Kitchen Package' or 'Coastal Bathroom' that include all line items with pre-selected products from the Selections Catalog. Dramatically speeds up estimating while ensuring consistency."
      workflow={constructionWorkflow}
      features={[
        'Assembly library organized by category',
        'Each assembly = group of line items with default selections',
        'Selection-based: Every line item references Selections Catalog',
        'Tier defaults: Assembly can default to Standard, Premium, etc.',
        'Quick swap: Change entire assembly to different tier with one click',
        'Clone and customize assemblies',
        'Version history for assemblies',
        'Cost tracking: See assembly cost change over time',
        'Usage analytics: Which assemblies used most',
        'Import/export assemblies',
        'Share assemblies across company',
        'Mark assemblies as favorites',
        'Assembly categories: Kitchen, Bath, Exterior, Foundation, etc.',
        'Nested assemblies: Assembly can include other assemblies',
      ]}
      connections={[
        { name: 'Selections Catalog', type: 'input', description: 'Every line item references a catalog selection' },
        { name: 'Estimates', type: 'output', description: 'Assemblies inserted into estimates' },
        { name: 'Cost Codes', type: 'input', description: 'Line items map to cost codes' },
        { name: 'Cost Intelligence', type: 'bidirectional', description: 'Assembly costs tracked over time' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Assembly name' },
        { name: 'description', type: 'text', description: 'Assembly description' },
        { name: 'category', type: 'string', required: true, description: 'Assembly category' },
        { name: 'default_tier', type: 'string', description: 'Default selection tier' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Currently available' },
        { name: 'is_favorite', type: 'boolean', description: 'Marked as favorite' },
        { name: 'usage_count', type: 'integer', description: 'Times used in estimates' },
        { name: 'total_cost', type: 'decimal', description: 'Current total at default tier' },
        { name: 'last_cost_update', type: 'timestamp', description: 'When costs last recalculated' },
        { name: 'created_by', type: 'uuid', description: 'User who created' },
        { name: 'version', type: 'integer', description: 'Version number' },
      ]}
      aiFeatures={[
        {
          name: 'Assembly Suggestions',
          description: 'When creating estimate, suggests relevant assemblies: "For 3,500 SF coastal home, commonly used assemblies: Coastal Foundation Package, Hurricane-Rated Shell, Premium Kitchen..."',
          trigger: 'On estimate creation'
        },
        {
          name: 'Cost Drift Alerts',
          description: 'Alerts when assembly cost has changed significantly: "Standard Kitchen Package now costs $45K, up 12% from 6 months ago. Primary driver: Cabinet selection +18%."',
          trigger: 'Weekly review and on assembly use'
        },
        {
          name: 'Missing Item Detection',
          description: 'Identifies commonly forgotten items: "Your Bathroom assembly doesn\'t include exhaust fan or GFI outlets. Add based on code requirements?"',
          trigger: 'On assembly review'
        },
        {
          name: 'Optimization Suggestions',
          description: 'Suggests assembly improvements based on job feedback: "Jobs using this assembly average 8% over on tile. Consider increasing tile allowance from $15 to $18/SF."',
          trigger: 'On assembly review'
        },
      ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Assemblies & Templates                      [+ New Assembly]        │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [_______________]  Category: [All ▾]  Tier: [All ▾]        │
├──────────────────┬──────────────────────────────────────────────────┤
│ CATEGORIES       │  KITCHEN (8 assemblies)                          │
│                  │                                                  │
│ ► All (24)       │  ┌─────────────────────────────────────────────┐ │
│ ► Kitchen (8)    │  │ ★ Standard Kitchen Package                  │ │
│   Bathroom (6)   │  │   12 line items | Default: Premium          │ │
│   Exterior (4)   │  │   Total: $42,500 (↑ 8% from 6mo ago)        │ │
│   Foundation (2) │  │   Used: 34 times | Last: 2 weeks ago        │ │
│   Electrical (2) │  │                                             │ │
│   Plumbing (2)   │  │   Includes:                                 │ │
│                  │  │   • Cabinets: [Kraftmaid Premium ▾]         │ │
│                  │  │   • Countertops: [Quartz Level 2 ▾]         │ │
│                  │  │   • Sink: [Kohler Undermount ▾]             │ │
│                  │  │   • Faucet: [Delta Leland ▾]                │ │
│                  │  │   • ... 8 more items                        │ │
│                  │  │                                             │ │
│                  │  │   [Edit] [Clone] [Use in Estimate]          │ │
│                  │  └─────────────────────────────────────────────┘ │
│                  │  ┌─────────────────────────────────────────────┐ │
│                  │  │ Luxury Kitchen Package                      │ │
│                  │  │   15 line items | Default: Luxury           │ │
│                  │  │   Total: $125,000                           │ │
│                  │  │   Sub-Zero, Wolf, custom cabinetry...       │ │
│                  │  └─────────────────────────────────────────────┘ │
├──────────────────┴──────────────────────────────────────────────────┤
│ AI: "Standard Kitchen Package cost up 8%. Cabinets +12%, counters   │
│ +6%. Consider updating estimate defaults or creating new tier."     │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
