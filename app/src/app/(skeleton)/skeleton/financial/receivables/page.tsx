'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { ReceivablesPreview } from '@/components/skeleton/previews/receivables-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const receivablesWorkflow = ['Draw Approved', 'Invoice Sent', 'Payment Due', 'Follow Up', 'Payment Received']

export default function AccountsReceivablePage() {
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
      {activeTab === 'preview' ? <ReceivablesPreview /> : <PageSpec
      title="Accounts Receivable"
      phase="Phase 0 - Foundation"
      planFile="views/financial/ACCOUNTS_RECEIVABLE.md"
      description="Track all money owed to you by clients. View outstanding draws by job and client, aging analysis, collection status, and payment history. Prioritize collection efforts and maintain healthy cash flow."
      workflow={receivablesWorkflow}
      features={[
        'AR summary by client',
        'AR summary by job',
        'Aging buckets (current, 30, 60, 90+)',
        'Outstanding draw details',
        'Payment history',
        'Collection status tracking',
        'Automated payment reminders',
        'Manual follow-up logging',
        'Payment links',
        'Partial payment tracking',
        'Write-off management',
        'DSO (Days Sales Outstanding) tracking',
        'Export for accounting',
        'Lien rights tracking',
      ]}
      connections={[
        { name: 'Draws', type: 'input', description: 'Outstanding draws' },
        { name: 'Clients', type: 'input', description: 'Client payment history' },
        { name: 'Jobs', type: 'input', description: 'Job-level AR' },
        { name: 'Payments', type: 'input', description: 'Payments received' },
        { name: 'Financial Dashboard', type: 'output', description: 'Summary metrics' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Sync receivables' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'client_id', type: 'uuid', required: true, description: 'Client' },
        { name: 'job_id', type: 'uuid', required: true, description: 'Job' },
        { name: 'draw_id', type: 'uuid', required: true, description: 'Source draw' },
        { name: 'invoice_number', type: 'string', description: 'Invoice number' },
        { name: 'amount', type: 'decimal', required: true, description: 'Amount due' },
        { name: 'amount_paid', type: 'decimal', description: 'Amount received' },
        { name: 'balance', type: 'decimal', description: 'Remaining balance' },
        { name: 'due_date', type: 'date', required: true, description: 'Payment due date' },
        { name: 'days_outstanding', type: 'integer', description: 'Days since due' },
        { name: 'status', type: 'string', required: true, description: 'Current, 30 day, 60 day, 90+, Paid, Written Off' },
        { name: 'collection_status', type: 'string', description: 'No action, Reminder sent, Called, Escalated' },
        { name: 'last_contact', type: 'date', description: 'Last collection contact' },
        { name: 'notes', type: 'text', description: 'Collection notes' },
      ]}
      aiFeatures={[
        {
          name: 'Collection Priority',
          description: 'Ranks receivables for collection focus. "Priority: Smith $185K (5 days over, usually pays quick) vs Johnson $45K (30 days, slow payer)."',
          trigger: 'Daily ranking'
        },
        {
          name: 'Payment Prediction',
          description: 'Predicts when payment will arrive. "Based on client history, Smith typically pays within 7 days of reminder. Expected: Feb 5."',
          trigger: 'On overdue'
        },
        {
          name: 'Escalation Recommendations',
          description: 'Suggests escalation actions. "Johnson 60 days overdue. Historical: paid after lien notice. Consider escalation."',
          trigger: 'At thresholds'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Accounts Receivable                           Total: $485,000       │
├─────────────────────────────────────────────────────────────────────┤
│ View: [By Client] [By Job] [Aging]    Status: [All]                │
├─────────────────────────────────────────────────────────────────────┤
│ AGING SUMMARY                                                       │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐           │
│ │ Current  │ 1-30 Days│ 31-60    │ 61-90    │ 90+      │           │
│ │ $320,000 │ $95,000  │ $45,000  │ $15,000  │ $10,000  │           │
│ │ 66%      │ 20%      │ 9%       │ 3%       │ 2%       │           │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘           │
├─────────────────────────────────────────────────────────────────────┤
│ ACTION NEEDED                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Smith Residence - Draw #5                          $185,000     │ │
│ │ Due: Jan 23 | 5 days overdue | Status: Reminder sent           │ │
│ │ Client: Usually pays within 7 days of reminder                  │ │
│ │ [Send 2nd Reminder] [Log Call] [View Payment Link]              │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Johnson Beach House - Draw #3                      $45,000      │ │
│ │ Due: Dec 28 | 31 days overdue | Status: Called 1/15            │ │
│ │ AI: "Client has history of 45-day payments. Escalate?"          │ │
│ │ [Send Final Notice] [Escalate] [Log Call]                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ DSO: 28 days (Industry avg: 35) | Collection Rate: 94%             │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
