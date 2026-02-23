'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { ContractLegalPreview } from '@/components/skeleton/previews/contract-legal-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ContractLegalPage(): React.ReactElement {
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
        <ContractLegalPreview />
      ) : (
        <PageSpec
          title="Contract & Legal Management"
          phase="Phase 3 - Financial Power"
          planFile="docs/modules/38-contracts-e-signature.md"
          description="AI-powered contract creation, clause library, redline comparison, subcontract generation, lien law compliance, and contract milestone tracking. From template selection to e-signature, every contract is built smarter."
          workflow={['Select contract template (Cost-Plus, Fixed-Price, GMP, T&M, Sub, CO)', 'AI auto-fills from project data (client, scope, allowances, schedule)', 'PM reviews and adjusts — clause library available for swaps', 'Attorney redline comparison flags risky changes', 'Subcontracts auto-generated from awarded bids', 'Lien law compliance dashboard tracks NTOs, waivers, retainage', 'Contract milestones tracked with deadline alerts', 'E-signature workflow for execution']}
          features={['Contract Template Library (6 standard types)', 'AI Contract Builder with auto-fill from project data', 'Clause Library with 8+ swappable clause categories', 'Contract Comparison Tool (your version vs attorney redline)', 'Subcontract Generator from bid awards', 'Lien Law Compliance Engine with state-specific rules', 'Preliminary Notice (NTO) Tracking with deadline alerts', 'Payment Affidavit Generator', 'Contract Milestone Tracker', 'Dispute Documentation Log', 'Contract Amendment Tracker', 'Insurance Requirements Matrix']}
          connections={[
            { name: 'Bid Management', type: 'input', description: 'Awarded bids flow into subcontract generation' },
            { name: 'Lien Waivers', type: 'bidirectional', description: 'Waiver status feeds compliance dashboard' },
            { name: 'Client Portal', type: 'output', description: 'Contracts available for client review and signature' },
          ]}
          aiFeatures={[
            { name: 'AI Contract Drafting', description: 'Auto-fills contract from project data — scope, allowances, schedule, payment terms' },
            { name: 'Clause Risk Analysis', description: 'Flags risky changes in attorney redlines with HIGH/MEDIUM/LOW severity' },
            { name: 'Redline Comparison', description: 'Side-by-side diff of contract versions with change categorization' },
          ]}
        />
      )}
    </div>
  )
}
