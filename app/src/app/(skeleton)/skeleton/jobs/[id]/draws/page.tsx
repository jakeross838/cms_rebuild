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
          'Draw schedule',
          'Progress-based billing',
          'Milestone-based billing',
          'Draw creation wizard',
          'Work completed summary',
          'Photo documentation',
          'Client approval workflow',
          'Retainage tracking',
          'Payment tracking',
          'Draw history',
          'Remaining balance',
          'AIA format support',
          'Custom draw formats',
          'Lender requirements',
        ]}
        connections={[
          { name: 'Budget', type: 'input', description: 'Progress by line' },
          { name: 'Schedule', type: 'input', description: 'Milestone completion' },
          { name: 'Photos', type: 'input', description: 'Progress photos' },
          { name: 'Accounts Receivable', type: 'output', description: 'AR tracking' },
          { name: 'Cash Flow', type: 'output', description: 'Expected receipts' },
          { name: 'Client Portal', type: 'output', description: 'Client approval' },
        ]}
        dataFields={[
          { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
          { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
          { name: 'draw_number', type: 'integer', required: true, description: 'Sequential number' },
          { name: 'period_start', type: 'date', description: 'Work period start' },
          { name: 'period_end', type: 'date', description: 'Work period end' },
          { name: 'gross_amount', type: 'decimal', required: true, description: 'Total billed' },
          { name: 'retainage', type: 'decimal', description: 'Retainage held' },
          { name: 'net_amount', type: 'decimal', description: 'Net due' },
          { name: 'previous_billed', type: 'decimal', description: 'Prior draws' },
          { name: 'total_completed', type: 'decimal', description: 'Total to date' },
          { name: 'remaining', type: 'decimal', description: 'Contract remaining' },
          { name: 'status', type: 'string', required: true, description: 'Draft, Submitted, Approved, Paid' },
          { name: 'submitted_at', type: 'timestamp', description: 'Submit date' },
          { name: 'approved_at', type: 'timestamp', description: 'Approval date' },
          { name: 'paid_at', type: 'timestamp', description: 'Payment date' },
          { name: 'paid_amount', type: 'decimal', description: 'Amount received' },
        ]}
        aiFeatures={[
          {
            name: 'Draw Preparation',
            description: 'Calculates progress. "Based on budget and schedule, Draw #5 estimated at $185,000. 3 line items need progress update."',
            trigger: 'On draw creation'
          },
          {
            name: 'Timing Optimization',
            description: 'Suggests draw timing. "Submit Draw #5 by Friday for typical 10-day payment cycle before Feb 15 payables."',
            trigger: 'Cash flow analysis'
          },
          {
            name: 'Documentation Check',
            description: 'Ensures completeness. "Draw #5 missing: 2 progress photos, foundation inspection report. Required for lender."',
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
