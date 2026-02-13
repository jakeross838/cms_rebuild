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
        'AR summary by client and by job with drill-down',
        'Aging buckets with visual bar (current, 1-30, 31-60, 61-90, 90+)',
        'Outstanding draw details with draw number reference',
        'Client payment history tracking (good/slow/poor)',
        'Collection status workflow (none > reminder > called > escalated > lien notice)',
        'Automated payment reminders with escalation rules',
        'Manual follow-up logging (calls, emails)',
        'Payment links with view tracking',
        'Partial payment tracking with progress bar',
        'Retainage receivable as separate line with release dates',
        'Lien waiver status tracking per receivable (not_required/pending/received)',
        'AI collection probability scoring per receivable',
        'DSO (Days Sales Outstanding) tracking with industry benchmark',
        'Write-off management with approval workflow',
        'Lien rights tracking with deadline alerts',
        'Preferred payment method display per client',
        'Sort by collection probability, retainage, amount, days outstanding',
        'Export for accounting (PDF, Excel)',
      ]}
      connections={[
        { name: 'Draws', type: 'input', description: 'Outstanding draws with amounts' },
        { name: 'Clients', type: 'input', description: 'Client payment history and preferences' },
        { name: 'Jobs', type: 'input', description: 'Job-level AR breakdown' },
        { name: 'Payments', type: 'input', description: 'Payments received and partial payments' },
        { name: 'Lien Waivers', type: 'input', description: 'Waiver status affecting collections' },
        { name: 'Cash Flow', type: 'output', description: 'Expected inflow projections' },
        { name: 'Financial Dashboard', type: 'output', description: 'Summary AR metrics and DSO' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Sync receivables and payments' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'client_id', type: 'uuid', required: true, description: 'Client' },
        { name: 'job_id', type: 'uuid', required: true, description: 'Job' },
        { name: 'draw_id', type: 'uuid', required: true, description: 'Source draw' },
        { name: 'invoice_number', type: 'string', description: 'Invoice/draw number' },
        { name: 'amount', type: 'decimal', required: true, description: 'Amount due' },
        { name: 'amount_paid', type: 'decimal', description: 'Amount received so far' },
        { name: 'balance', type: 'decimal', description: 'Remaining balance (amount - paid)' },
        { name: 'retainage_amount', type: 'decimal', description: 'Retainage held on this draw' },
        { name: 'retainage_release_date', type: 'date', description: 'Expected retainage release' },
        { name: 'due_date', type: 'date', required: true, description: 'Payment due date' },
        { name: 'days_outstanding', type: 'integer', description: 'Days since due' },
        { name: 'aging_bucket', type: 'string', required: true, description: 'current | 1-30 | 31-60 | 61-90 | 90+' },
        { name: 'collection_status', type: 'string', description: 'none | reminder_sent | called | escalated | lien_notice' },
        { name: 'payment_history', type: 'string', description: 'good | slow | poor' },
        { name: 'payment_method', type: 'string', description: 'Preferred payment method' },
        { name: 'lien_waiver_status', type: 'string', description: 'not_required | pending | received' },
        { name: 'ai_collection_probability', type: 'decimal', description: 'AI-predicted collection likelihood (0-100)' },
        { name: 'last_contact', type: 'date', description: 'Last collection contact' },
        { name: 'notes', type: 'text', description: 'Collection notes' },
      ]}
      aiFeatures={[
        {
          name: 'Collection Priority Ranking',
          description: 'Ranks receivables with probability scoring. "Priority: Smith $185K (92% likely, 5 days over) vs Wilson $60K (45% likely, 38 days, lien notice sent)."',
          trigger: 'Daily ranking'
        },
        {
          name: 'Payment Prediction',
          description: 'Predicts when payment will arrive based on client history. "Smith typically pays within 7 days of reminder. Expected: Feb 14."',
          trigger: 'On overdue'
        },
        {
          name: 'Escalation Recommendations',
          description: 'Suggests escalation actions based on history. "Johnson 60 days overdue. Historical: paid after lien notice. Recommend escalation."',
          trigger: 'At configurable thresholds'
        },
        {
          name: 'Lien Waiver Impact',
          description: 'Flags collections blocked by missing lien waivers. "Miller Addition $42K - payment may be delayed until lien waiver is provided."',
          trigger: 'On collection attempt'
        },
        {
          name: 'DSO Trend Analysis',
          description: 'Tracks collection efficiency over time. "DSO improved from 32 to 28 days this quarter. Collection rate: 94% above 90% target."',
          trigger: 'Weekly analysis'
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
