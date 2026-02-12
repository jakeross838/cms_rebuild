'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { DrawsPreview } from '@/components/skeleton/previews/draws-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Budget', 'POs', 'Invoices', 'Draws', 'Cost of Sales', 'Reports'
]

export default function DrawsListSkeleton() {
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
      {activeTab === 'preview' ? <DrawsPreview /> : <PageSpec
      title="Draws"
      phase="Phase 0 - Foundation"
      planFile="views/financial/POS_DRAWS_COS.md"
      description="Construction draw requests (G702/G703 AIA format) with AI-powered completion verification. The system cross-references schedules, daily logs, invoices, and photos to validate work percentages—ensuring draws are accurate and defensible."
      workflow={constructionWorkflow}
      features={[
        'Draw list with status filtering: Draft, Submitted, Approved, Paid',
        'G702/G703 format generation with proper AIA compliance',
        'Auto-populate from approved invoices by cost code',
        'Cost code breakdown matching budget structure',
        'Previous application tracking with full history',
        'Retention calculation and tracking by line',
        'Change order integration with CO-added lines',
        'PDF export package for client/bank submission',
        'Draw approval workflow with digital signature',
        'Payment tracking against submitted draws',
        'Stored materials tracking (on-site not installed)',
        'Supporting documentation auto-assembly',
        'Lien waiver package generation',
      ]}
      connections={[
        { name: 'Invoices', type: 'input', description: 'Approved invoices bundled into draws' },
        { name: 'Budget', type: 'input', description: 'Budget lines define draw structure' },
        { name: 'Cost Codes', type: 'input', description: 'Draw lines organized by cost code' },
        { name: 'Change Orders', type: 'input', description: 'COs add lines to draw schedule' },
        { name: 'Jobs', type: 'input', description: 'Draw is scoped to a job' },
        { name: 'Schedule', type: 'input', description: 'Schedule progress validates work %' },
        { name: 'Daily Logs', type: 'input', description: 'Logs support completion claims' },
        { name: 'Photos', type: 'input', description: 'Progress photos support draw' },
        { name: 'Client Portal', type: 'output', description: 'Clients can view/approve draws in portal' },
        { name: 'QuickBooks', type: 'output', description: 'Creates AR invoice in accounting' },
        { name: 'Reports', type: 'output', description: 'Draw data feeds financial reports' },
        { name: 'Lien Waivers', type: 'input', description: 'Waivers collected before draw submission' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'draw_number', type: 'integer', required: true, description: 'Sequential draw number' },
        { name: 'application_date', type: 'date', required: true, description: 'Date of application' },
        { name: 'period_to', type: 'date', required: true, description: 'Period ending date' },
        { name: 'status', type: 'string', required: true, description: 'Draft, Submitted, Approved, Paid, Partial' },
        { name: 'scheduled_value', type: 'decimal', description: 'Total scheduled value (contract + COs)' },
        { name: 'previous_applications', type: 'decimal', description: 'Previously billed amount' },
        { name: 'this_period', type: 'decimal', description: 'Amount billed this period' },
        { name: 'stored_materials', type: 'decimal', description: 'Materials on site not installed' },
        { name: 'retention_percent', type: 'decimal', description: 'Retention percentage (typically 10%)' },
        { name: 'retention_amount', type: 'decimal', description: 'Total amount retained' },
        { name: 'total_completed', type: 'decimal', description: 'Total completed and stored to date' },
        { name: 'balance_to_finish', type: 'decimal', description: 'Remaining to complete' },
        { name: 'ai_verified', type: 'boolean', description: 'AI verified completion percentages' },
        { name: 'supporting_docs', type: 'jsonb', description: 'Auto-assembled supporting documents' },
      ]}
      aiFeatures={[
        {
          name: 'Draw Builder',
          description: 'AI suggests optimal draw based on: approved invoices, work completed per schedule, billing cycle timing. "Based on Nov work, suggest billing: Foundation 100%, Framing 75%, Plumbing Rough 50%."',
          trigger: 'On new draw creation'
        },
        {
          name: 'Completion Verification',
          description: 'Cross-references multiple data sources to verify work percentages: schedule task completion, daily log entries, manpower hours, invoice history, and progress photos. "Framing claimed 75%. Verified: Schedule shows 70%, logs confirm walls complete, roof in progress. Recommendation: 75% acceptable."',
          trigger: 'Before submission'
        },
        {
          name: 'Overbilling Detection',
          description: 'Flags potential overbilling patterns: "16000-Electrical claimed 60% but only $18K of $49K budget invoiced (37%). Cost-based completion suggests 40%. Review before submission."',
          trigger: 'On draw review'
        },
        {
          name: 'Photo Evidence Assembly',
          description: 'Auto-selects relevant progress photos to support draw: "Found 12 photos from this period tagged: Foundation (3), Framing (6), Plumbing (3). Include in draw package?"',
          trigger: 'On draw finalization'
        },
        {
          name: 'Lien Waiver Tracking',
          description: 'Shows lien waiver status for all vendors with payments in this draw: "5 of 7 vendors have submitted waivers. Missing: ABC Electric ($12,450), XYZ Plumbing ($8,200). Request waivers before submission."',
          trigger: 'Before submission'
        },
        {
          name: 'Cash Flow Projection',
          description: 'Projects cash needs based on draw timing: "Draw #4 submitted Dec 15. Historical: Client pays in 14 days. Expected receipt: Dec 29. Vendor payments due before receipt: $32,500. Cash gap: $8,200."',
          trigger: 'On draw submission'
        },
        {
          name: 'Bank/Lender Requirements',
          description: 'Ensures draw package meets lender requirements: "Construction loan requires: G702/G703, inspection report, lien waivers, photos. Inspection report missing—schedule inspector before submission."',
          trigger: 'Before submission'
        },
        {
          name: 'Historical Comparison',
          description: 'Compares draw progress to similar projects: "At Draw #4 (63% billed), similar projects averaged 58% schedule completion. You are at 65% schedule completion—draw is consistent with progress."',
          trigger: 'On draw review'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Draws - Smith Residence                       [+ New Draw] [Export]  │
├─────────────────────────────────────────────────────────────────────┤
│ Contract: $2.45M | Billed: $1.54M (63%) | Retention: $154K          │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: All | Draft | Submitted | Approved | Paid                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌──────┬────────────┬────────────┬────────────┬─────────┬────────┐ │
│ │ Draw │ Period     │ This Period│ Total Billed│ Status │ AI     │ │
│ ├──────┼────────────┼────────────┼────────────┼─────────┼────────┤ │
│ │ #5   │ Dec 2024   │ $185,000   │ $1.54M     │ ● Draft │ ⚠ Review│ │
│ │      │ AI: "Verify framing % - schedule shows 70%, claimed 80%"  │ │
│ ├──────┼────────────┼────────────┼────────────┼─────────┼────────┤ │
│ │ #4   │ Nov 2024   │ $245,000   │ $1.36M     │ ● Paid  │ ✓ Verified│
│ │ #3   │ Oct 2024   │ $312,000   │ $1.11M     │ ● Paid  │ ✓ Verified│
│ │ #2   │ Sep 2024   │ $480,000   │ $800K      │ ● Paid  │ ✓ Verified│
│ │ #1   │ Aug 2024   │ $320,000   │ $320K      │ ● Paid  │ ✓ Verified│
│ └──────┴────────────┴────────────┴────────────┴─────────┴────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Draw #5 Checklist:                                               │ │
│ │ ✓ G702/G703 generated      ⚠ Verify framing completion          │ │
│ │ ✓ 8 invoices included      ○ Lien waivers: 5/7 received         │ │
│ │ ✓ 15 photos selected       ○ Inspection report pending          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
      />}
    </div>
  )
}
