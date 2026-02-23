'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { LienLawPreview } from '@/components/skeleton/previews/lien-law-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LienLawPage(): React.ReactElement {
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
        <LienLawPreview />
      ) : (
        <PageSpec
          title="Lien Law Compliance Engine"
          phase="Phase 3 - Financial Power"
          planFile="docs/modules/14-lien-waivers.md"
          description="State-specific lien law compliance — deadline calendars, Notice to Owner generation, lien waiver automation, payment affidavits, retainage compliance, sub lien rights dashboard, and mechanics lien filing assistance. Never miss a deadline again."
          workflow={['Project created — state-specific lien rules auto-loaded', 'NTO deadlines calculated from first work date per sub/supplier', 'NTO documents generated and tracked (sent, receipt confirmed)', 'Each draw triggers waiver collection (conditional before, unconditional after)', 'Payment blocked until all required waivers received', 'Retainage tracked with 50% completion milestone and release conditions', 'Sub Lien Rights Dashboard shows risk level per subcontractor', 'AI monitors all deadlines and sends proactive alerts']}
          features={['State-Specific Lien Calendar (FL, NC, SC, and more)', 'Notice to Owner (NTO) Generator with auto-calculated deadlines', 'Lien Waiver Automation (conditional + unconditional tracking)', 'Payment Affidavit Generator', 'Retainage Compliance with milestone-based rate changes', 'Sub Lien Rights Dashboard with risk scoring', 'Mechanics Lien Filing Assistant']}
          connections={[
            { name: 'Lien Waivers', type: 'bidirectional', description: 'Waiver collection status feeds compliance dashboard' },
            { name: 'Accounts Payable', type: 'input', description: 'Payment data triggers waiver requirements' },
            { name: 'Contract Management', type: 'input', description: 'Contract terms define retainage and lien provisions' },
          ]}
          aiFeatures={[
            { name: 'Deadline Auto-Calculation', description: 'Calculates NTO, lien claim, and retainage deadlines per state law — 97% accuracy' },
            { name: 'Risk Assessment', description: 'Scores sub lien risk based on payment status, NTO validity, and outstanding amounts' },
            { name: 'Multi-State Support', description: 'Auto-switches rules when projects span different jurisdictions' },
          ]}
        />
      )}
    </div>
  )
}
