'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { DrawsPreview } from '@/components/skeleton/previews/draws-preview'
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
          'Multi-project draw list with status pipeline',
          'Full draw lifecycle: Draft, Internal Review, Submitted, Lender Review, Revision, Approved, Disbursed',
          'G702/G703 AIA format generation with PDF preview',
          'Custom and lender-specific format templates',
          'Auto-populate from approved invoices by cost code',
          'Schedule of Values (SOV) management with versioning',
          'Previous application tracking with full history',
          'Retainage calculation per line with milestone reduction and explicit release tracking',
          'Change order integration with CO-added SOV lines',
          'PDF export package for lender submission',
          'Multi-step approval workflow (internal then lender)',
          'Lender interaction tracking (inspector, review, disbursement)',
          'Disbursement reconciliation (applied vs approved vs disbursed)',
          'Revision tracking with lender rejection notes',
          'Stored materials tracking (on-site not installed)',
          'Supporting documentation auto-assembly with completeness check',
          'Lien waiver package completeness indicator',
          'Progress photo linking per SOV line',
          'Auto-draw generation from schedule progress and invoices',
          'Draw schedule calendar with submission deadlines',
          'Multiple lenders per project support',
          'Cash flow impact projection',
        ]}
        connections={[
          { name: 'Invoices', type: 'input', description: 'Approved invoices bundled into draws' },
          { name: 'Budget', type: 'input', description: 'SOV source data and cost tracking' },
          { name: 'Cost Codes', type: 'input', description: 'Draw lines organized by cost code' },
          { name: 'Change Orders', type: 'input', description: 'COs modify SOV lines and amounts' },
          { name: 'Jobs', type: 'input', description: 'Draw scoped to a project' },
          { name: 'Schedule', type: 'input', description: 'Schedule progress validates work %' },
          { name: 'Daily Logs', type: 'input', description: 'Logs support completion claims' },
          { name: 'Photos', type: 'input', description: 'Progress photos linked per SOV line' },
          { name: 'Inspections', type: 'input', description: 'Inspection reports for draw package' },
          { name: 'Client Portal', type: 'output', description: 'Clients view/approve draws' },
          { name: 'QuickBooks', type: 'output', description: 'Creates AR invoice in accounting' },
          { name: 'Reports', type: 'output', description: 'Draw, retainage, and WIP reports' },
          { name: 'Lien Waivers', type: 'input', description: 'Waiver package completeness check' },
          { name: 'Cash Flow', type: 'output', description: 'Expected receipt dates for forecasting' },
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
