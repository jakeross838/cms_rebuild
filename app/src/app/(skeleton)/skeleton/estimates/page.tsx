'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Leads', 'Estimates', 'Proposals', 'Contracts', 'Jobs', 'Budget'
]

export default function EstimatesListSkeleton() {
  return (
    <PageSpec
      title="Estimates"
      phase="Phase 0 - Foundation"
      planFile="views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md"
      description="Create detailed construction estimates using selection-based pricing. Every line item requiring a material/product choice pulls from the Selections Catalog. Choose cypress vs. hardie board for porch ceilings, LVP vs. tile for flooring—pricing auto-populates. The system learns from actual costs on every completed job."
      workflow={constructionWorkflow}
      features={[
        'Selection-based line items: Pick product/material, pricing auto-fills',
        'Catalog integration: All selections pull from Selections Catalog',
        'Tier options: See builder-grade, standard, premium, luxury prices side-by-side',
        'Allowance items: Mark as client-choice with default allowance amount',
        'Assembly templates: Pre-built groups with default selections',
        'Override pricing: Manual adjustment with reason tracking',
        'Quantity takeoff: Enter quantity, unit price calculated from selection',
        'Labor + material split: Selection defines both, shown separately',
        'Vendor association: Each selection linked to preferred vendor',
        'Lead time awareness: Selections include lead time for scheduling',
        'Version history with selection change tracking',
        'Clone estimates with different selection tiers',
        'Export to PDF with selection details and photos',
        'Convert to Proposal with client-facing selection options',
        'Compare estimates: Same scope, different selection tiers',
      ]}
      connections={[
        { name: 'Selections Catalog', type: 'input', description: 'All product/material choices and pricing' },
        { name: 'Leads', type: 'input', description: 'Estimate created from qualified lead' },
        { name: 'Cost Codes', type: 'input', description: 'Line items assigned to cost codes' },
        { name: 'Assemblies', type: 'input', description: 'Template assemblies with default selections' },
        { name: 'Proposals', type: 'output', description: 'Estimate converts to client proposal' },
        { name: 'Budget', type: 'output', description: 'Approved estimate becomes job budget baseline' },
        { name: 'Vendors', type: 'input', description: 'Selection-linked vendors for ordering' },
        { name: 'Cost Intelligence', type: 'bidirectional', description: 'Historical pricing informs selections, actuals feed back' },
        { name: 'Plans', type: 'input', description: 'Plan parsing for quantities' },
        { name: 'Client Selections', type: 'output', description: 'Allowance items go to client for final choice' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Estimate name/version' },
        { name: 'lead_id', type: 'uuid', description: 'Associated lead' },
        { name: 'client_id', type: 'uuid', description: 'Client for estimate' },
        { name: 'status', type: 'string', required: true, description: 'Draft, In Review, Approved, Converted' },
        { name: 'default_tier', type: 'string', description: 'Default selection tier for this estimate' },
        { name: 'project_sf', type: 'integer', description: 'Total square footage' },
        { name: 'project_type', type: 'string', description: 'New construction, renovation, addition' },
        { name: 'subtotal', type: 'decimal', description: 'Sum of all line items' },
        { name: 'markup_percent', type: 'decimal', description: 'Overall markup percentage' },
        { name: 'contingency_percent', type: 'decimal', description: 'Risk contingency percentage' },
        { name: 'total', type: 'decimal', description: 'Final estimate amount' },
        { name: 'cost_per_sf', type: 'decimal', description: 'Calculated $/SF' },
        { name: 'version', type: 'integer', description: 'Version number' },
        { name: 'allowances_total', type: 'decimal', description: 'Total of all allowance items' },
        { name: 'selections_confirmed', type: 'integer', description: 'Count of confirmed selections' },
        { name: 'selections_pending', type: 'integer', description: 'Count of pending client choices' },
        { name: 'valid_until', type: 'date', description: 'Estimate expiration date' },
        { name: 'ai_confidence', type: 'decimal', description: 'AI confidence in estimate accuracy' },
      ]}
      aiFeatures={[
        {
          name: 'Selection Recommendations',
          description: 'When adding a line item (e.g., "Porch Ceiling"), AI recommends selections based on project type and client tier. "For coastal elevated homes, you typically use: Cypress T&G (67%), Hardie Soffit (23%), Brazilian Hardwood (10%). Current pricing shown."',
          trigger: 'On line item category selection'
        },
        {
          name: 'Tier Comparison',
          description: 'Shows all tier options side-by-side when selecting. "Porch Ceiling 450 SF: Builder ($2,812) | Standard ($3,487) | Premium ($5,625) | Luxury ($9,000). Premium is your most common choice for this client type."',
          trigger: 'On selection picker open'
        },
        {
          name: 'Allowance Accuracy Check',
          description: 'For allowance items, compares your default allowance to actual client choices. "Your $15/SF tile allowance results in upgrades 78% of the time. Avg upgrade: $8/SF. Consider $20/SF for this client profile."',
          trigger: 'On allowance line item add'
        },
        {
          name: 'Lead Time Warnings',
          description: 'Flags selections with long lead times. "Brazilian hardwood porch ceiling has 6-week lead time. If project starts in 4 weeks, order now or consider cypress (2-week lead)."',
          trigger: 'On selection and on schedule review'
        },
        {
          name: 'Price Staleness Alert',
          description: 'Warns when selection pricing may be outdated. "Impact windows pricing is 90+ days old and material costs have increased ~12%. Recommend verifying with vendor before finalizing."',
          trigger: 'On estimate review and before conversion'
        },
        {
          name: 'Completeness by Selection',
          description: 'Ensures all selection categories have choices. "Missing selections: Porch Ceiling, Exterior Paint, Front Door. These items have no selection assigned—add from catalog or mark as allowance."',
          trigger: 'Before finalization'
        },
        {
          name: 'Actual vs. Estimated Feedback',
          description: 'After job completion, shows how selected items compared to actuals. "Cypress porch ceiling: Estimated $5,625, Actual $5,890 (+4.7%). Difference due to: waste factor higher than expected. Update catalog waste factor?"',
          trigger: 'On job completion'
        },
        {
          name: 'Bundle Suggestions',
          description: 'Recommends related selections when one is chosen. "You selected cypress porch ceiling. Typically paired with: exterior stain ($X), stainless steel screws ($Y), crown molding ($Z). Add bundle?"',
          trigger: 'On selection confirmed'
        },
        {
          name: 'Client Preference Learning',
          description: 'For returning clients, pre-populates based on past choices. "Client previously selected premium tier on all finishes. Auto-apply premium selections? Also preferred: Kohler fixtures, Sub-Zero appliances, Anderson windows."',
          trigger: 'On estimate creation for existing client'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Estimate: Smith Residence v2                    [Save] [→ Proposal] │
├─────────────────────────────────────────────────────────────────────┤
│ Client: Smith | 3,500 SF | Coastal Elevated | Default Tier: Premium │
├─────────────────────────────────────────────────────────────────────┤
│ EXTERIOR                                          Subtotal: $245,000│
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Porch Ceiling                                                   │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ Selection: [Cypress T&G 1x6          ▾] ← Click to change   │ │ │
│ │ │            Other options: Hardie Soffit, Brazilian HW        │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │ Qty: 450 SF × $12.50/SF (mat $8.50 + labor $4.00) = $5,625     │ │
│ │ Lead Time: 2 weeks | Vendor: ABC Lumber                        │ │
│ │ AI: "Your most common choice for coastal homes (67%)"          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Exterior Paint                                                  │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ Selection: [Sherwin-Williams Duration ▾]                     │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │ Qty: 3,500 SF × $4.50/SF = $15,750                             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⚡ ALLOWANCE: Tile - Master Bath Floor                          │ │
│ │ Allowance: $18/SF × 120 SF = $2,160                            │ │
│ │ AI: "Based on client profile, likely to upgrade +$600"         │ │
│ │ [Client will select from: Porcelain, Natural Stone, Designer]  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Subtotal: $2.1M | Markup 18%: $378K | Contingency 5%: $105K        │
│ TOTAL: $2.45M ($700/SF)        Allowances: $85K (client choices)   │
├─────────────────────────────────────────────────────────────────────┤
│ AI: "3 selections missing. 2 allowances may need adjustment.       │
│     Lead time concern: Impact windows (8 wks) vs start date."      │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
