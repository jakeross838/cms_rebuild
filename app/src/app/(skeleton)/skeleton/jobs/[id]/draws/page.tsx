'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { JobDrawsPreview } from '@/components/skeleton/previews/job-draws-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobDrawsPage() {
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
      {activeTab === 'preview' ? <JobDrawsPreview /> : <PageSpec
        title="Job Draws"
        phase="Phase 0 - Foundation"
        planFile="views/jobs/DRAWS.md"
        description="Manage draw requests and payments for this job. Create draws based on completed work, track approval status, and monitor cash flow. See full draw history and remaining contract balance."
        workflow={['Calculate Progress', 'Create Draw', 'Client Review', 'Approved', 'Payment Received']}
        features={[
          'Draw schedule with milestone and progress-based billing',
          'Full lifecycle: Draft, Internal Review, Submitted, Lender Review, Revision, Approved, Disbursed',
          'AIA G702/G703 format with PDF preview and generation',
          'Custom and lender-specific format templates',
          'Schedule of Values (SOV) editor with line-by-line detail',
          'SOV expandable preview showing top lines per draw',
          'Auto-generation from approved invoices and schedule progress',
          'Retainage tracking per line with milestone-based reduction',
          'Change order integration (CO count and SOV line additions)',
          'Supporting documentation auto-assembly with completeness check',
          'Lien waiver package completeness indicator per draw',
          'Progress photo linking per SOV line',
          'Lender interaction tracking (inspector, review, disbursement)',
          'Disbursement reconciliation (applied vs approved vs disbursed)',
          'Revision tracking (Rev A, Rev B) with lender notes',
          'Stored materials tracking (on-site not installed)',
          'G702 summary bar (original, COs, current contract sum)',
          'Net amount calculation (amount minus retainage)',
          'Draw history with expandable detail rows',
          'Multi-step internal and external approval workflow',
        ]}
        connections={[
          { name: 'Budget', type: 'input', description: 'SOV source data, progress by cost code' },
          { name: 'Schedule', type: 'input', description: 'Milestone completion validates work %' },
          { name: 'Photos', type: 'input', description: 'Progress photos per SOV line' },
          { name: 'Daily Logs', type: 'input', description: 'Logs support completion claims' },
          { name: 'Invoices', type: 'input', description: 'Approved invoices included in draw' },
          { name: 'Change Orders', type: 'input', description: 'COs modify SOV lines and contract sum' },
          { name: 'Lien Waivers', type: 'input', description: 'Waiver package completeness per draw' },
          { name: 'Inspections', type: 'input', description: 'Inspection reports for lender package' },
          { name: 'Accounts Receivable', type: 'output', description: 'AR tracking and aging' },
          { name: 'Cash Flow', type: 'output', description: 'Expected receipt dates for forecasting' },
          { name: 'Client Portal', type: 'output', description: 'Client/lender view and approval' },
          { name: 'QuickBooks', type: 'output', description: 'Creates AR invoice in accounting' },
        ]}
        dataFields={[
          { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
          { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
          { name: 'sov_id', type: 'uuid', required: true, description: 'Schedule of values' },
          { name: 'lender_id', type: 'uuid', description: 'Lender for this draw' },
          { name: 'draw_number', type: 'integer', required: true, description: 'Sequential number' },
          { name: 'revision_number', type: 'integer', description: 'Revision suffix (Rev A, B, etc.)' },
          { name: 'application_date', type: 'date', required: true, description: 'Application date' },
          { name: 'period_from', type: 'date', description: 'Work period start' },
          { name: 'period_to', type: 'date', description: 'Work period end' },
          { name: 'contract_sum_original', type: 'decimal', description: 'Original contract amount' },
          { name: 'net_change_orders', type: 'decimal', description: 'Net change order amount' },
          { name: 'contract_sum_current', type: 'decimal', description: 'Current contract sum' },
          { name: 'total_completed_stored', type: 'decimal', description: 'Total completed and stored to date' },
          { name: 'total_retainage', type: 'decimal', description: 'Total retainage held' },
          { name: 'retainage_percent', type: 'decimal', description: 'Retainage percentage' },
          { name: 'current_payment_due', type: 'decimal', description: 'Net amount due this period' },
          { name: 'stored_materials', type: 'decimal', description: 'Materials stored not installed' },
          { name: 'status', type: 'string', required: true, description: 'draft, internal_review, submitted, lender_review, revision_requested, approved, disbursed' },
          { name: 'format_template_id', type: 'uuid', description: 'AIA G702 or custom template' },
          { name: 'submitted_method', type: 'string', description: 'portal, email, physical' },
          { name: 'lender_approved_amount', type: 'decimal', description: 'Lender-approved amount' },
          { name: 'disbursed_amount', type: 'decimal', description: 'Amount actually received' },
          { name: 'variance_amount', type: 'decimal', description: 'Applied vs disbursed variance' },
          { name: 'auto_generated', type: 'boolean', description: 'AI auto-generated draft' },
          { name: 'sov_line_count', type: 'integer', description: 'Number of SOV lines' },
          { name: 'included_invoices', type: 'integer', description: 'Number of invoices included' },
        ]}
        aiFeatures={[
          {
            name: 'Auto-Draw Generation',
            description: 'AI generates draft draw from approved invoices and schedule progress. Shows calculation source per line ("from schedule", "from invoices", "field-entered %").',
            trigger: 'On new draw creation'
          },
          {
            name: 'Completion Verification',
            description: 'Cross-references schedule tasks, daily logs, manpower hours, and photos to verify work %. "Framing claimed 75%. Schedule: 70%, logs confirm walls complete. 75% acceptable."',
            trigger: 'Before submission'
          },
          {
            name: 'Overbilling Detection',
            description: 'Flags cost-based vs progress-based discrepancies. "Electrical claimed 60% but only $18K of $49K invoiced (37%). Review before submission."',
            trigger: 'On draw review'
          },
          {
            name: 'Documentation Assembly',
            description: 'Auto-assembles supporting docs and checks completeness. "Lien waivers: 6/8 received. Inspection: pending. 18 photos selected for package."',
            trigger: 'On draw finalization'
          },
          {
            name: 'Draw Timing Optimization',
            description: 'Suggests optimal submission timing for cash flow. "Submit by Friday for 10-day payment cycle before Feb 15 payables. Historical: lender approves in 5 days."',
            trigger: 'Cash flow analysis'
          },
          {
            name: 'Lender Pattern Analysis',
            description: 'Tracks lender behavior. "First National typically adjusts roofing completion by 5-10%. Provide additional photos for this scope."',
            trigger: 'Before submission'
          },
        ]}
        mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Draws - Smith Residence                        Contract: $2,400,000 │
├─────────────────────────────────────────────────────────────────────┤
│ SUMMARY                                                             │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐      │
│ │ Billed       │ Received     │ Retainage    │ Remaining    │      │
│ │ $985,000     │ $800,000     │ $98,500      │ $1,415,000   │      │
│ │ 41%          │              │ 10%          │ 59%          │      │
│ └──────────────┴──────────────┴──────────────┴──────────────┘      │
├─────────────────────────────────────────────────────────────────────┤
│ IN PROGRESS                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Draw #5 - February 2025                    Status: DRAFT        │ │
│ │ Period: Feb 1-28 | Estimated: $185,000                          │ │
│ │ Completion: 52% (+11% this period)                              │ │
│ │ ⚠ Needs: Progress photos, updated schedule                      │ │
│ │ [Edit Draw] [Preview] [Submit to Client]                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ AWAITING PAYMENT                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Draw #4 - January 2025      $185,000       Approved: Jan 20     │ │
│ │ Due: Jan 30 | 5 days overdue                                    │ │
│ │ [Send Reminder] [Log Payment]                                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ HISTORY                                                             │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Draw #3  Dec 2024  $200,000  ✓ Paid Dec 28                      │ │
│ │ Draw #2  Nov 2024  $250,000  ✓ Paid Nov 25                      │ │
│ │ Draw #1  Oct 2024  $350,000  ✓ Paid Oct 20                      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
      />}
    </div>
  )
}
