'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { ContractsPreview } from '@/components/skeleton/previews/contracts-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Leads', 'Estimates', 'Proposals', 'Contracts', 'Jobs'
]

export default function ContractsSkeleton() {
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
      {activeTab === 'preview' ? <ContractsPreview /> : <PageSpec
        title="Contracts"
        phase="Phase 0 - Foundation"
        planFile="views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md"
        description="Contract template management, clause library, state-specific language, e-signature integration, and contract lifecycle tracking. Supports cost-plus, GMP, fixed-price, T&M, and hybrid structures for owner contracts, subcontracts, pre-con agreements, and vendor POs."
        workflow={constructionWorkflow}
        features={[
          'Contract list with status pipeline (Draft > Internal Review > Sent > Signed > Active > Closeout)',
          'Contract types: Fixed Price, Cost-Plus, GMP, T&M, Hybrid',
          'Party types: Owner, Subcontractor, Vendor, Pre-Construction',
          'Template library with WYSIWYG editor and variable field placeholders',
          'Clause library with categories, tags, drag-and-drop assembly',
          'State-specific language inserts (mechanic lien, right-to-cure, retainage, deposits)',
          'E-signature via DocuSign with multi-party routing and bulk send',
          'Subcontract workflow with insurance verification gate',
          'Verbal change directive capture with formalize to change order',
          'Amendment workflow for contract term modifications',
          'Draw schedule builder (percentage, milestone, hybrid)',
          'Financing coordination (construction loan, appraisal, lender requirements)',
          'Lender draw format manager with AIA G702/G703 support',
          'Title company coordination (commitment, closing, earnest money)',
          'Builder Risk insurance tracking with expiration alerts',
          'NTO management with state-specific deadlines',
          'Pre-construction meeting management',
          'Deposit tracking with jurisdiction compliance',
          'Retainage configuration per contract and per trade',
          'Warranty obligations per contract feeding Module 31',
          'Closeout checklist per contract type',
          'Litigation hold and dispute tracking',
          'PDF generation with branding and version history',
        ]}
        connections={[
          { name: 'Core Data Model', type: 'input', description: 'Project and contact context (Module 3)' },
          { name: 'Document Storage', type: 'output', description: 'Signed contracts stored (Module 6)' },
          { name: 'Contact/Vendor Management', type: 'input', description: 'Counterparty data (Module 10)' },
          { name: 'Change Orders', type: 'bidirectional', description: 'Change directives to change orders (Module 17)' },
          { name: 'Financial Reporting', type: 'output', description: 'Contract type drives financial rules (Module 19)' },
          { name: 'Warranty & Home Care', type: 'output', description: 'Warranty terms feed warranty module (Module 31)' },
          { name: 'Notification Engine', type: 'output', description: 'Signature reminders, closeout alerts (Module 5)' },
          { name: 'DocuSign', type: 'bidirectional', description: 'E-signature provider integration' },
        ]}
        dataFields={[
          { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
          { name: 'builder_id', type: 'uuid', required: true, description: 'FK to builders (multi-tenant)' },
          { name: 'project_id', type: 'uuid', description: 'FK to projects' },
          { name: 'template_id', type: 'uuid', description: 'FK to contract_templates' },
          { name: 'contract_type', type: 'string', required: true, description: 'cost_plus, gmp, fixed_price, t_and_m, hybrid' },
          { name: 'party_type', type: 'string', required: true, description: 'owner, subcontractor, vendor, precon' },
          { name: 'counterparty_id', type: 'uuid', description: 'FK to counterparty record' },
          { name: 'contract_number', type: 'string', description: 'Contract reference number' },
          { name: 'title', type: 'string', description: 'Contract title' },
          { name: 'amount', type: 'decimal', required: true, description: 'Total contract value' },
          { name: 'retainage_pct', type: 'decimal', description: 'Retainage percentage' },
          { name: 'start_date', type: 'date', description: 'Project start date' },
          { name: 'end_date', type: 'date', description: 'Expected completion date' },
          { name: 'status', type: 'string', required: true, description: 'draft, internal_review, sent, signed, active, complete, amended' },
          { name: 'signed_date', type: 'timestamp', description: 'When fully executed' },
          { name: 'esign_envelope_id', type: 'string', description: 'DocuSign envelope ID' },
          { name: 'esign_status', type: 'string', description: 'DocuSign status' },
          { name: 'warranty_terms', type: 'jsonb', description: 'Per-category warranty terms (structural, systems, finishes)' },
          { name: 'deposit_amount', type: 'decimal', description: 'Client deposit amount' },
          { name: 'deposit_received_date', type: 'date', description: 'When deposit received' },
          { name: 'closeout_status', type: 'string', description: 'Closeout checklist status' },
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
      />}
    </div>
  )
}
