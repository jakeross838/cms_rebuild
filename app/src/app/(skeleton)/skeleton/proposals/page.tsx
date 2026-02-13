'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { ProposalsPreview } from '@/components/skeleton/previews/proposals-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Leads', 'Estimates', 'Proposals', 'Contracts', 'Jobs'
]

export default function ProposalsSkeleton() {
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
      {activeTab === 'preview' ? (
        <ProposalsPreview />
      ) : (
        <PageSpec
          title="Proposals"
          phase="Phase 4 - Intelligence"
          planFile="docs/modules/20-estimating-engine.md"
          description="Generate branded client-facing proposals from estimates. Present selection options at different tiers with photos, show upgrade/downgrade impacts with real-time calculators, highlight allowances, and track client engagement. Proposals support e-signature for conversion to contracts, configurable expiration, and version history."
          workflow={constructionWorkflow}
          features={[
            'Generate proposal from estimate with one click',
            'Branded presentation with builder logo, colors, and contact info',
            'Configurable detail levels: executive summary, category summary, detailed breakdown',
            'Selection presentation: Show tier options with photos per category',
            'Side-by-side tier comparison: Builder vs Standard vs Premium vs Luxury',
            'Upgrade/downgrade impact calculator shown to client',
            'Allowance items highlighted with client-friendly explanations',
            'Include selection photos, specs, manufacturer info',
            'Customizable proposal templates with builder branding',
            'Interactive web view (shareable link) or PDF download',
            'Client can mark preferences (non-binding) before contract',
            'Track proposal views, time spent per section, and engagement patterns',
            'Version history with selection changes tracked',
            'E-signature integration (DocuSign + native) for acceptance',
            'Configurable expiration with countdown and auto-alerts',
            'Contract type display (NTE, GMP, Cost-Plus, Fixed)',
            'Comparison mode: present two scope options side-by-side',
            'Pipeline board: Kanban-style tracking across stages',
            'Expired proposal resend workflow',
            'Win/loss analytics with acceptance rate tracking',
          ]}
          connections={[
            { name: 'Estimates', type: 'input', description: 'Proposal generated from estimate with selections and pricing' },
            { name: 'Selections Catalog', type: 'input', description: 'Photos, specs, tier options displayed in proposal' },
            { name: 'Contracts', type: 'output', description: 'Accepted proposal becomes contract (Module 38)' },
            { name: 'Client Portal', type: 'output', description: 'Sets expectations for portal selection experience' },
            { name: 'Leads / CRM', type: 'input', description: 'Proposal tied to lead for pipeline tracking' },
            { name: 'Email / Notifications', type: 'output', description: 'Proposal sent to client via email with preview link' },
            { name: 'E-Signature', type: 'bidirectional', description: 'DocuSign integration for proposal acceptance' },
            { name: 'Client Intelligence', type: 'bidirectional', description: 'Track what clients focus on; learn preferences for future proposals' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'estimate_id', type: 'uuid', required: true, description: 'FK to estimates' },
            { name: 'lead_id', type: 'uuid', description: 'FK to leads' },
            { name: 'client_id', type: 'uuid', required: true, description: 'FK to clients' },
            { name: 'status', type: 'string', required: true, description: 'draft | sent | viewed | accepted | declined | expired' },
            { name: 'version', type: 'integer', required: true, description: 'Proposal version number' },
            { name: 'contract_type', type: 'string', description: 'nte | gmp | cost_plus | fixed' },
            { name: 'default_tier', type: 'string', description: 'Default tier shown (standard, premium, etc.)' },
            { name: 'total_amount', type: 'decimal', description: 'Total proposal amount at selected tier' },
            { name: 'allowances_total', type: 'decimal', description: 'Total of allowance items' },
            { name: 'tier_comparison', type: 'jsonb', description: 'Total amounts at each tier level' },
            { name: 'template_id', type: 'uuid', description: 'FK to proposal_templates for branding' },
            { name: 'sent_at', type: 'timestamp', description: 'When proposal was sent' },
            { name: 'viewed_at', type: 'timestamp', description: 'When client first viewed' },
            { name: 'view_count', type: 'integer', description: 'Number of views' },
            { name: 'time_spent_seconds', type: 'integer', description: 'Total time client spent viewing' },
            { name: 'expires_at', type: 'timestamp', description: 'Proposal expiration date' },
            { name: 'esign_envelope_id', type: 'string', description: 'DocuSign envelope ID' },
            { name: 'esign_status', type: 'string', description: 'not_sent | sent | viewed | signed | declined' },
            { name: 'client_preferences', type: 'jsonb', description: 'Non-binding selection preferences marked by client' },
            { name: 'accepted_at', type: 'timestamp', description: 'When client accepted' },
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
      )}
    </div>
  )
}
