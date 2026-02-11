'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Leads', 'Estimates', 'Proposals', 'Contracts', 'Jobs'
]

export default function ContractsSkeleton() {
  return (
    <PageSpec
      title="Contracts"
      phase="Phase 0 - Foundation"
      planFile="views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md"
      description="Generate contracts from accepted proposals with e-signature capability. Templates auto-populate from proposal data including selections, allowances, and payment schedules. Track signature status and convert to job on execution."
      workflow={constructionWorkflow}
      features={[
        'Contract list with status filtering',
        'Generate from accepted proposal with one click',
        'Template library with customizable clauses',
        'Auto-populate: Client info, selections, pricing, allowances',
        'Selection schedule: List all selections with deadlines',
        'Payment/draw schedule based on milestones',
        'Allowance terms clearly defined',
        'Change order provisions',
        'E-signature via DocuSign/Adobe Sign integration',
        'Track signature status (sent, viewed, signed)',
        'Counter-signature workflow',
        'PDF generation with branding',
        'Version history and audit trail',
        'Convert to Job on full execution',
        'Amendment/addendum support',
      ]}
      connections={[
        { name: 'Proposals', type: 'input', description: 'Contract generated from accepted proposal' },
        { name: 'Selections Catalog', type: 'input', description: 'Selection details included in contract' },
        { name: 'Jobs', type: 'output', description: 'Executed contract creates job' },
        { name: 'Budget', type: 'output', description: 'Contract amount becomes budget baseline' },
        { name: 'Schedule', type: 'output', description: 'Payment schedule feeds draw timing' },
        { name: 'Clients', type: 'input', description: 'Client information auto-filled' },
        { name: 'Documents', type: 'output', description: 'Executed contract stored in job files' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'proposal_id', type: 'uuid', required: true, description: 'FK to proposals' },
        { name: 'client_id', type: 'uuid', required: true, description: 'FK to clients' },
        { name: 'template_id', type: 'uuid', description: 'FK to contract_templates' },
        { name: 'status', type: 'string', required: true, description: 'Draft, Sent, Viewed, Signed, Executed, Amended' },
        { name: 'contract_number', type: 'string', description: 'Contract reference number' },
        { name: 'contract_amount', type: 'decimal', required: true, description: 'Total contract value' },
        { name: 'allowances_total', type: 'decimal', description: 'Total allowance amount' },
        { name: 'start_date', type: 'date', description: 'Project start date' },
        { name: 'estimated_completion', type: 'date', description: 'Estimated completion date' },
        { name: 'sent_at', type: 'timestamp', description: 'When sent for signature' },
        { name: 'client_signed_at', type: 'timestamp', description: 'When client signed' },
        { name: 'builder_signed_at', type: 'timestamp', description: 'When builder counter-signed' },
        { name: 'executed_at', type: 'timestamp', description: 'When fully executed' },
        { name: 'job_id', type: 'uuid', description: 'FK to jobs (after conversion)' },
        { name: 'document_url', type: 'string', description: 'URL to signed PDF' },
      ]}
      aiFeatures={[
        {
          name: 'Clause Recommendations',
          description: 'Recommends clauses based on project type: "Coastal elevated home—recommend adding: Hurricane provisions, pile warranty clause, flood insurance requirements."',
          trigger: 'On contract generation'
        },
        {
          name: 'Risk Assessment',
          description: 'Analyzes contract for potential issues: "Allowance for tile ($15/SF) historically results in 78% upgrade rate. Consider clarifying upgrade terms."',
          trigger: 'Before sending'
        },
        {
          name: 'Selection Schedule Generation',
          description: 'Auto-generates selection deadline schedule based on construction timeline: "Tile must be selected by Week 8 for lead time. Cabinet selection by Week 4."',
          trigger: 'On contract generation'
        },
        {
          name: 'Payment Schedule Optimization',
          description: 'Suggests payment milestones aligned with typical cost curves: "For $2.4M coastal home, recommend 6 draws: Foundation 15%, Frame 25%, Dry-in 20%, Rough 15%, Trim 15%, Final 10%."',
          trigger: 'On contract generation'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Contracts                                    [+ New] [Templates]    │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: All | Draft | Awaiting Signature | Executed                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Smith Residence                                    ● Awaiting   │ │
│ │ Contract #2024-047 | $2.45M                        Sent 2d ago  │ │
│ │ Client viewed: Yesterday | Not yet signed                       │ │
│ │ [Resend] [View] [Download PDF]                                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Johnson Beach House                                ✓ Executed   │ │
│ │ Contract #2024-046 | $1.85M                        Jan 15       │ │
│ │ Job Created: JOB-2024-046                                       │ │
│ │ [View Contract] [Go to Job]                                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ─────────────────── CONTRACT DETAIL PANEL ─────────────────────    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ SELECTIONS INCLUDED:                                            │ │
│ │ • Porch Ceiling: Cypress T&G (Premium) - $5,625                │ │
│ │ • Windows: PGT Impact (Standard) - $45,000                     │ │
│ │ • Flooring: LVP Shaw Endura - $12,500                          │ │
│ │                                                                 │ │
│ │ ALLOWANCES:                                                     │ │
│ │ • Tile: $18/SF (Master Bath, Guest Bath) - $4,320              │ │
│ │ • Lighting Fixtures: $8,500                                     │ │
│ │ • Appliances: $15,000                                          │ │
│ │                                                                 │ │
│ │ PAYMENT SCHEDULE:                                               │ │
│ │ Draw 1 - Foundation: $367,500 (15%)                            │ │
│ │ Draw 2 - Framing: $612,500 (25%)                               │ │
│ │ ... more                                                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
