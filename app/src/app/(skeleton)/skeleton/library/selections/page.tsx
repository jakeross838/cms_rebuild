'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function SelectionsCatalogPage() {
  return (
    <PageSpec
      title="Selections Catalog"
      phase="Phase 0 - Foundation"
      planFile="views/library/SELECTIONS_CATALOG.md"
      description="Master library of all products, materials, and finishes available for selection. Every estimate line item requiring a choice pulls from this catalog. Includes pricing tiers (builder-grade to luxury), vendor sources, lead times, and specifications. The single source of truth for 'what can we install and what does it cost?'"
      workflow={['Catalog Setup', 'Estimate Creation', 'Client Selection', 'Procurement']}
      features={[
        'Organized by category: Finishes, Fixtures, Structural, MEP, Appliances',
        'Sub-categories: Flooring > Tile, Hardwood, LVP, Carpet',
        'Multiple options per selection type with tier levels',
        'Builder-grade, Standard, Premium, Luxury pricing tiers',
        'Each selection: Name, SKU, Manufacturer, Unit, Price, Lead Time',
        'Vendor assignments with preferred vendor ranking',
        'Photo and specification attachments per selection',
        'Allowance amounts for client-choice items',
        'Default selections for each tier',
        'Price history tracking with market trends',
        'Bulk import from vendor price lists',
        'Sync pricing from vendor portals',
        'Clone and customize for specific projects',
        'Active/inactive status for discontinued items',
        'Coastal rating and compliance flags',
      ]}
      connections={[
        { name: 'Estimates', type: 'output', description: 'Line items pull selections and pricing' },
        { name: 'Job Selections', type: 'output', description: 'Client portal shows catalog options' },
        { name: 'Proposals', type: 'output', description: 'Selections included with photos' },
        { name: 'Purchase Orders', type: 'output', description: 'PO created with selection details' },
        { name: 'Vendors', type: 'bidirectional', description: 'Vendor linked to each selection' },
        { name: 'Assemblies', type: 'output', description: 'Templates reference selections' },
        { name: 'Invoices', type: 'input', description: 'Actual prices update intelligence' },
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
        { name: 'is_allowance_item', type: 'boolean', description: 'Client chooses this' },
        { name: 'allowance_amount', type: 'decimal', description: 'Default allowance value' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Currently available' },
        { name: 'coastal_rated', type: 'boolean', description: 'Suitable for coastal' },
        { name: 'photos', type: 'jsonb', description: 'Product photos' },
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
          description: 'Compares pricing across vendors. "ABC Supply: $8.50/LF, XYZ Lumber: $7.90/LF."',
          trigger: 'On new invoice'
        },
        {
          name: 'Discontinued Detection',
          description: 'Monitors for discontinued items with active estimates.',
          trigger: 'Periodic sync'
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
    />
  )
}
