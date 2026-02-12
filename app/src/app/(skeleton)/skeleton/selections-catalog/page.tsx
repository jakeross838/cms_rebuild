'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { SelectionsCatalogPreview } from '@/components/skeleton/previews/selections-catalog-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Selections Catalog', 'Estimates', 'Client Selections', 'Purchase Orders', 'Invoices'
]

export default function SelectionsCatalogSkeleton() {
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
      phase="Phase 0 - Foundation"
      planFile="views/catalog/SELECTIONS_CATALOG.md"
      description="Master library of all products, materials, and finishes available for selection. Every estimate line item requiring a choice pulls from this catalog. Includes pricing tiers (builder-grade to luxury), vendor sources, lead times, and specifications. The single source of truth for 'what can we install and what does it cost?'"
      workflow={constructionWorkflow}
      features={[
        'Organized by category: Finishes, Fixtures, Structural, MEP, Appliances',
        'Sub-categories: Flooring > Tile, Hardwood, LVP, Carpet',
        'Multiple options per selection type with tier levels',
        'Builder-grade, Standard, Premium, Luxury pricing tiers',
        'Each selection: Name, SKU, Manufacturer, Unit, Price, Lead Time',
        'Vendor assignments with preferred vendor ranking',
        'Photo and specification attachments per selection',
        'Allowance amounts for client-choice items',
        'Default selections for each tier (e.g., "Standard flooring = LVP Shaw Endura")',
        'Price history tracking with market trends',
        'Bulk import from vendor price lists',
        'Sync pricing from vendor portals (where available)',
        'Clone and customize for specific projects',
        'Active/inactive status for discontinued items',
      ]}
      connections={[
        { name: 'Estimates', type: 'output', description: 'Line items pull selections and pricing from catalog' },
        { name: 'Client Selections', type: 'output', description: 'Client portal shows catalog options for allowance items' },
        { name: 'Proposals', type: 'output', description: 'Selections included in proposal with photos' },
        { name: 'Purchase Orders', type: 'output', description: 'PO created with selection details and vendor' },
        { name: 'Vendors', type: 'bidirectional', description: 'Vendor linked to each selection, pricing synced' },
        { name: 'Cost Intelligence', type: 'bidirectional', description: 'Historical pricing and market rates' },
        { name: 'Templates', type: 'output', description: 'Assemblies reference default selections' },
        { name: 'Invoices', type: 'input', description: 'Actual prices update catalog intelligence' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'category_id', type: 'uuid', required: true, description: 'FK to selection_categories' },
        { name: 'name', type: 'string', required: true, description: 'Selection name' },
        { name: 'description', type: 'text', description: 'Detailed description' },
        { name: 'manufacturer', type: 'string', description: 'Brand/manufacturer' },
        { name: 'model', type: 'string', description: 'Model number' },
        { name: 'sku', type: 'string', description: 'Internal SKU' },
        { name: 'tier', type: 'string', required: true, description: 'builder, standard, premium, luxury' },
        { name: 'unit', type: 'string', required: true, description: 'SF, LF, EA, etc.' },
        { name: 'material_cost', type: 'decimal', required: true, description: 'Material cost per unit' },
        { name: 'labor_cost', type: 'decimal', description: 'Labor cost per unit' },
        { name: 'total_cost', type: 'decimal', description: 'Combined cost per unit' },
        { name: 'lead_time_days', type: 'integer', description: 'Typical lead time' },
        { name: 'primary_vendor_id', type: 'uuid', description: 'Preferred vendor' },
        { name: 'alternate_vendors', type: 'uuid[]', description: 'Backup vendors' },
        { name: 'specs_url', type: 'string', description: 'Link to spec sheet' },
        { name: 'photos', type: 'jsonb', description: 'Product photos' },
        { name: 'is_allowance_item', type: 'boolean', description: 'Client chooses this' },
        { name: 'allowance_amount', type: 'decimal', description: 'Default allowance value' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Currently available' },
        { name: 'coastal_rated', type: 'boolean', description: 'Suitable for coastal construction' },
        { name: 'warranty_years', type: 'integer', description: 'Manufacturer warranty' },
        { name: 'last_price_update', type: 'date', description: 'When pricing was last verified' },
      ]}
      aiFeatures={[
        {
          name: 'Price Intelligence',
          description: 'Tracks pricing trends per selection. "Cypress tongue & groove has increased 18% in 6 months. Current price may be outdated." Alerts when catalog prices diverge from invoice actuals.',
          trigger: 'On invoice processing and periodic review'
        },
        {
          name: 'Lead Time Learning',
          description: 'Learns actual lead times from PO to delivery. "Catalog says 4 weeks for impact windows, but actual average is 6.2 weeks. Update lead time?" Helps with accurate scheduling.',
          trigger: 'On delivery confirmation'
        },
        {
          name: 'Vendor Price Comparison',
          description: 'Compares pricing across vendors for same/similar products. "ABC Supply has cypress at $8.50/LF, XYZ Lumber at $7.90/LF. Consider updating primary vendor."',
          trigger: 'On new invoice or manual check'
        },
        {
          name: 'Selection Recommendations',
          description: 'When creating estimate line items, recommends selections based on project type, client tier, and past choices. "For elevated coastal homes, you typically use cypress porch ceiling (92% of projects)."',
          trigger: 'On estimate line item creation'
        },
        {
          name: 'Discontinued Item Detection',
          description: 'Monitors vendor catalogs for discontinued items. "Shaw Endura LVP in Natural Oak is being discontinued. 3 active estimates use this selection. Review alternatives?"',
          trigger: 'Periodic vendor sync and on PO creation'
        },
        {
          name: 'Allowance Accuracy',
          description: 'Compares allowance amounts to actual client choices. "Your tile allowance of $15/SF results in client upgrades 78% of the time. Average upgrade: $8/SF. Consider $18/SF allowance."',
          trigger: 'On project completion'
        },
        {
          name: 'Coastal Compliance Check',
          description: 'Flags selections that may not meet coastal requirements. "Standard aluminum windows not suitable for coastal zone. Impact-rated alternatives required within 1 mile of coast."',
          trigger: 'On estimate creation for coastal projects'
        },
        {
          name: 'Bundle Suggestions',
          description: 'Identifies frequently used selection combinations. "Cypress porch ceiling is usually paired with: stainless steel screws, Behr semi-gloss exterior, Crown Berger stain. Create bundle?"',
          trigger: 'On selection usage analysis'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Selections Catalog               [+ Add Selection] [Import Prices]  │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [_______________]  Category: [All ▾]  Tier: [All ▾]         │
├──────────────────┬──────────────────────────────────────────────────┤
│ CATEGORIES       │  PORCH CEILING (12 selections)                   │
│                  │                                                  │
│ ▼ Finishes       │  ┌─────────────────────────────────────────────┐ │
│   Flooring       │  │ [IMG] Cypress T&G 1x6                       │ │
│   Tile           │  │       $8.50/LF material + $4.00/LF labor    │ │
│   Countertops    │  │       Tier: Premium | Lead: 2 weeks         │ │
│   ► Porch Ceiling│  │       Vendor: ABC Lumber (preferred)        │ │
│   Paint          │  │       ⚠ Price up 18% in 6 months            │ │
│   Cabinets       │  │       [Edit] [View History] [Duplicate]     │ │
│                  │  └─────────────────────────────────────────────┘ │
│ ▶ Fixtures       │  ┌─────────────────────────────────────────────┐ │
│ ▶ Structural     │  │ [IMG] Hardie Soffit Panel                   │ │
│ ▶ Windows/Doors  │  │       $4.25/SF material + $3.50/SF labor    │ │
│ ▶ Roofing        │  │       Tier: Standard | Lead: 1 week         │ │
│ ▶ MEP            │  │       Vendor: XYZ Building Supply           │ │
│ ▶ Appliances     │  │       ✓ Price verified 2 weeks ago          │ │
│                  │  └─────────────────────────────────────────────┘ │
│                  │  ┌─────────────────────────────────────────────┐ │
│                  │  │ [IMG] NewTech Brazilian Hardwood            │ │
│                  │  │       $14.00/LF material + $6.00/LF labor   │ │
│                  │  │       Tier: Luxury | Lead: 6 weeks          │ │
│                  │  │       Vendor: Specialty Woods Inc           │ │
│                  │  │       🌴 Coastal rated: Yes                  │ │
│                  │  └─────────────────────────────────────────────┘ │
├──────────────────┴──────────────────────────────────────────────────┤
│ AI: "3 selections have outdated pricing (>90 days). Review needed." │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
