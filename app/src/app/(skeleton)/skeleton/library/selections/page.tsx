'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { SelectionsCatalogPreview } from '@/components/skeleton/previews/selections-catalog-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const workflow = ['Catalog Setup', 'Estimate Creation', 'Client Selection', 'Procurement']

export default function SelectionsCatalogPage() {
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
      {activeTab === 'preview' ? <SelectionsCatalogPreview /> : <PageSpec
      title="Selections Catalog"
      phase="Phase 4 - Intelligence"
      planFile="docs/modules/21-selection-management.md"
      description="Master library of all products, materials, and finishes available for selection. Includes pricing tiers (Builder through Luxury), vendor sources, lead times, availability status, SKU tracking, and specifications. Supports builder-defined categories, allowance items, default selections per tier, and integration with price intelligence for real-time cost tracking."
      workflow={workflow}
      features={[
        'Organized by builder-defined categories and subcategories',
        'Multiple options per selection type with 4 tier levels',
        'Each selection: Name, SKU, Manufacturer, Model, Unit, Material/Labor Cost, Lead Time',
        'Availability status: In Stock, Low Stock, Backordered, Discontinued, Special Order',
        'Source tracking: builder-added, designer-recommended, client-requested, catalog-imported',
        'Vendor assignments with preferred vendor ranking',
        'Photo and specification attachments per selection',
        'Allowance items with default allowance amounts',
        'Default selection flags per tier level',
        'Price history tracking with market trend alerts',
        'Bulk import from vendor price lists (CSV)',
        'Active/inactive status for retired/discontinued items',
        'Coastal rating and compliance flags',
        'Usage tracking: how many estimates/jobs reference each item',
        'Clone and customize for specific projects',
        'SKU management with manufacturer model cross-reference',
      ]}
      connections={[
        { name: 'Estimates', type: 'output', description: 'Line items pull selections and pricing' },
        { name: 'Job Selections', type: 'output', description: 'Client portal shows catalog options' },
        { name: 'Proposals', type: 'output', description: 'Selections included with photos in proposals' },
        { name: 'Purchase Orders', type: 'output', description: 'PO created with selection details' },
        { name: 'Vendors', type: 'bidirectional', description: 'Vendor linked to each selection' },
        { name: 'Assemblies', type: 'output', description: 'Assembly templates reference selections' },
        { name: 'Invoices', type: 'input', description: 'Actual prices update price intelligence' },
        { name: 'Price Intelligence', type: 'bidirectional', description: 'Price trend tracking and anomaly detection' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'category_id', type: 'uuid', required: true, description: 'FK to selection_categories' },
        { name: 'name', type: 'string', required: true, description: 'Selection name' },
        { name: 'description', type: 'text', description: 'Detailed description' },
        { name: 'manufacturer', type: 'string', description: 'Brand/manufacturer' },
        { name: 'model', type: 'string', description: 'Model number' },
        { name: 'sku', type: 'string', description: 'Internal SKU' },
        { name: 'tier', type: 'string', required: true, description: 'builder | standard | premium | luxury' },
        { name: 'unit', type: 'string', required: true, description: 'SF, LF, EA, etc.' },
        { name: 'material_cost', type: 'decimal', required: true, description: 'Material cost per unit' },
        { name: 'labor_cost', type: 'decimal', description: 'Labor cost per unit' },
        { name: 'total_cost', type: 'decimal', description: 'Combined cost per unit' },
        { name: 'lead_time_days', type: 'integer', description: 'Typical lead time' },
        { name: 'primary_vendor_id', type: 'uuid', description: 'Preferred vendor' },
        { name: 'is_allowance_item', type: 'boolean', description: 'Client chooses this' },
        { name: 'allowance_amount', type: 'decimal', description: 'Default allowance value' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Currently available' },
        { name: 'is_default_for_tier', type: 'boolean', description: 'Default option for its tier' },
        { name: 'availability_status', type: 'string', description: 'in_stock | low_stock | backordered | discontinued | special_order' },
        { name: 'source', type: 'string', description: 'builder | designer | client | catalog' },
        { name: 'coastal_rated', type: 'boolean', description: 'Suitable for coastal construction' },
        { name: 'usage_count', type: 'integer', description: 'Times used in estimates/jobs' },
        { name: 'photos', type: 'jsonb', description: 'Product photos array' },
      ]}
      aiFeatures={[
        {
          name: 'Price Intelligence',
          description: 'Tracks pricing trends and alerts when catalog prices diverge from invoice actuals. "Cypress T&G has increased 18% in 6 months."',
          trigger: 'On invoice processing'
        },
        {
          name: 'Lead Time Learning',
          description: 'Learns actual lead times from PO to delivery. "Catalog says 4 weeks, actual average is 6.2 weeks."',
          trigger: 'On delivery confirmation'
        },
        {
          name: 'Vendor Price Comparison',
          description: 'Compares pricing across vendors for same product. "ABC Supply: $8.50/LF, XYZ Lumber: $7.90/LF."',
          trigger: 'On new invoice'
        },
        {
          name: 'Discontinued Detection',
          description: 'Monitors for discontinued items referenced in active estimates/selections and suggests replacements.',
          trigger: 'Periodic sync + vendor notification'
        },
        {
          name: 'Alternative Suggestions',
          description: 'When an item has a price increase, suggests comparable alternatives at lower cost.',
          trigger: 'On price change detection'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Selections Catalog                    [+ Add Selection] [Import]    │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [_______________]  Category: [All ▾]  Tier: [All ▾]         │
├──────────────────┬──────────────────────────────────────────────────┤
│ CATEGORIES       │  PORCH CEILING (12 selections)                   │
│                  │                                                  │
│ ▼ Finishes       │  ┌─────────────────────────────────────────────┐ │
│   Flooring       │  │ [IMG] Cypress T&G 1x6                       │ │
│   Tile           │  │       $8.50/LF mat + $4.00/LF labor          │ │
│   ► Porch Ceiling│  │       Tier: Premium | Lead: 2 weeks         │ │
│   Paint          │  │       Vendor: ABC Lumber                     │ │
│                  │  │       [Edit] [Duplicate] [Deactivate]       │ │
│ ▶ Fixtures       │  └─────────────────────────────────────────────┘ │
│ ▶ Structural     │                                                  │
│ ▶ Windows/Doors  │  ┌─────────────────────────────────────────────┐ │
│ ▶ Appliances     │  │ [IMG] Hardie Soffit Panel                   │ │
│                  │  │       $4.25/SF mat + $3.50/SF labor          │ │
│                  │  │       Tier: Standard | Lead: 1 week         │ │
│                  │  └─────────────────────────────────────────────┘ │
└──────────────────┴──────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
