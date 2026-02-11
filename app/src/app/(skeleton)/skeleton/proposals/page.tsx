'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Leads', 'Estimates', 'Proposals', 'Contracts', 'Jobs'
]

export default function ProposalsSkeleton() {
  return (
    <PageSpec
      title="Proposals"
      phase="Phase 0 - Foundation"
      planFile="views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md"
      description="Generate beautiful client-facing proposals from estimates. Show selection options at different tiers, let clients see upgrade/downgrade impacts, and present allowance items for their future choices. Proposals become the foundation for contracts and set expectations for the client portal experience."
      workflow={constructionWorkflow}
      features={[
        'Generate proposal from estimate with one click',
        'SELECTION PRESENTATION: Show tier options for each selection',
        'Client-friendly pricing: "Your porch ceiling options" with photos',
        'Side-by-side tier comparison: Builder vs Standard vs Premium vs Luxury',
        'Upgrade/downgrade impact calculator shown to client',
        'Allowance items highlighted: "You will choose these later"',
        'Include selection photos, specs, manufacturer info',
        'Customizable proposal templates with builder branding',
        'Interactive PDF or web-based proposal link',
        'Client can mark preferences (non-binding) before contract',
        'Track proposal views and time spent on each section',
        'Version history with selection changes tracked',
        'E-signature ready (converts to contract)',
        'Expiration date with countdown',
        'Send via email with preview link',
      ]}
      connections={[
        { name: 'Estimates', type: 'input', description: 'Proposal generated from estimate with selections' },
        { name: 'Selections Catalog', type: 'input', description: 'Photos, specs, tier options displayed' },
        { name: 'Contracts', type: 'output', description: 'Accepted proposal becomes contract' },
        { name: 'Client Portal', type: 'output', description: 'Sets expectations for portal selections' },
        { name: 'Leads', type: 'input', description: 'Proposal tied to lead for pipeline tracking' },
        { name: 'Email', type: 'output', description: 'Proposal sent to client via email' },
        { name: 'Client Intelligence', type: 'bidirectional', description: 'Track what clients focus on; learn preferences' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'estimate_id', type: 'uuid', required: true, description: 'FK to estimates' },
        { name: 'lead_id', type: 'uuid', description: 'FK to leads' },
        { name: 'client_id', type: 'uuid', required: true, description: 'FK to clients' },
        { name: 'status', type: 'string', required: true, description: 'Draft, Sent, Viewed, Accepted, Declined, Expired' },
        { name: 'version', type: 'integer', description: 'Proposal version number' },
        { name: 'selected_tier', type: 'string', description: 'Default tier shown (standard, premium, etc.)' },
        { name: 'total_amount', type: 'decimal', description: 'Total proposal amount at selected tier' },
        { name: 'allowances_total', type: 'decimal', description: 'Total of allowance items' },
        { name: 'sent_at', type: 'timestamp', description: 'When proposal was sent' },
        { name: 'viewed_at', type: 'timestamp', description: 'When client first viewed' },
        { name: 'view_count', type: 'integer', description: 'Number of views' },
        { name: 'time_spent_seconds', type: 'integer', description: 'Total time client spent viewing' },
        { name: 'expires_at', type: 'timestamp', description: 'Proposal expiration' },
        { name: 'client_preferences', type: 'jsonb', description: 'Non-binding selection preferences marked by client' },
        { name: 'accepted_at', type: 'timestamp', description: 'When client accepted' },
        { name: 'template_id', type: 'uuid', description: 'FK to proposal_templates' },
      ]}
      aiFeatures={[
        {
          name: 'Tier Presentation Optimization',
          description: 'Recommends which tier to default based on client profile: "Client profile suggests Premium tier. Their past homes used high-end finishes. Show Premium as default with Standard/Luxury options visible."',
          trigger: 'On proposal generation'
        },
        {
          name: 'Selection Photo Curation',
          description: 'Auto-selects best photos for each selection from catalog: "Showing lifestyle photos for flooring, detail shots for fixtures. Removed technical/installation photos not relevant to client."',
          trigger: 'On proposal generation'
        },
        {
          name: 'Allowance Explanation',
          description: 'Generates client-friendly explanations for allowance items: "Your tile allowance of $18/SF gives you excellent options. Most clients choose within allowance; some upgrade by $5-8/SF for premium stones."',
          trigger: 'For each allowance item'
        },
        {
          name: 'Engagement Analytics',
          description: 'Tracks what sections client spends time on: "Client spent 12 minutes on kitchen selections, only 2 minutes on exterior. They may have questions about exterior—consider proactive outreach."',
          trigger: 'Real-time during viewing'
        },
        {
          name: 'Preference Learning',
          description: 'If client marks preferences, learns their style: "Client selected premium on all kitchen items, standard on bathrooms. Suggest focusing sales conversation on kitchen upgrades."',
          trigger: 'On client preference marking'
        },
        {
          name: 'Competitive Comparison',
          description: 'Shows value comparison if client is reviewing multiple builders: "Your proposal includes impact windows standard. Industry standard is builder-grade. Highlight this differentiation."',
          trigger: 'On proposal review'
        },
        {
          name: 'Follow-up Timing',
          description: 'Recommends when to follow up based on engagement: "Client has viewed 3 times, last viewed yesterday, spent 45 minutes total. High engagement—recommend follow-up call today."',
          trigger: 'Based on viewing patterns'
        },
        {
          name: 'Objection Anticipation',
          description: 'Predicts likely questions based on selections: "Cypress porch ceiling is 40% more than hardie. Prepare durability and longevity justification—common client question."',
          trigger: 'On proposal review'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Proposal: Smith Residence v2                    [Send] [Preview]    │
├─────────────────────────────────────────────────────────────────────┤
│ Client: John & Sarah Smith | Status: Draft | Expires: Feb 28       │
├─────────────────────────────────────────────────────────────────────┤
│ DEFAULT TIER: [Premium ▾]    Total at Premium: $2.45M              │
│ Comparison: Builder $2.1M | Standard $2.28M | Luxury $2.85M        │
├─────────────────────────────────────────────────────────────────────┤
│ SELECTION PRESENTATION TO CLIENT:                                  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ PORCH CEILING                                                   │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │ │
│ │ │ [PHOTO]     │ │ [PHOTO]     │ │ [PHOTO]     │                │ │
│ │ │ Hardie      │ │ Cypress T&G │ │ Brazilian   │                │ │
│ │ │ Soffit      │ │ ★ Included  │ │ Hardwood    │                │ │
│ │ │ -$2,812     │ │ $5,625      │ │ +$3,375     │                │ │
│ │ │ [Standard]  │ │ [Premium]   │ │ [Luxury]    │                │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘                │ │
│ │ Your premium package includes beautiful cypress tongue &        │ │
│ │ groove with 25-year warranty. Upgrade to Brazilian for...       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⚡ ALLOWANCE: Master Bath Tile                                   │ │
│ │ Your allowance: $18/SF (120 SF = $2,160)                        │ │
│ │ "You'll choose your tile in our selection showroom. Options     │ │
│ │ range from $12-45/SF. Most clients stay within allowance."      │ │
│ │ [Browse tile options] ← Preview catalog                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ AI: "Client profile matches Premium tier. Highlight cypress        │
│ durability—common upgrade driver for coastal clients."             │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
