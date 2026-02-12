'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { PayablesPreview } from '@/components/skeleton/previews/payables-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const payablesWorkflow = ['Invoice Received', 'Approved', 'Scheduled', 'Paid', 'Reconciled']

export default function AccountsPayablePage() {
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
      {activeTab === 'preview' ? <PayablesPreview /> : <PageSpec
      title="Accounts Payable"
      phase="Phase 0 - Foundation"
      planFile="views/financial/ACCOUNTS_PAYABLE.md"
      description="Track all money you owe to vendors and subcontractors. View outstanding invoices, payment schedules, aging analysis, and optimize payment timing to manage cash flow while maintaining vendor relationships."
      workflow={payablesWorkflow}
      features={[
        'AP summary by vendor',
        'AP summary by job',
        'Aging buckets',
        'Invoice approval status',
        'Payment scheduling',
        'Early payment discounts',
        'Batch payment processing',
        'Payment method management',
        'Lien waiver tracking',
        'Retainage tracking',
        '1099 preparation',
        'Cash flow impact preview',
        'Vendor payment terms',
        'Export for accounting',
      ]}
      connections={[
        { name: 'Invoices', type: 'input', description: 'Approved invoices' },
        { name: 'Vendors', type: 'input', description: 'Vendor payment terms' },
        { name: 'Jobs', type: 'input', description: 'Job-level AP' },
        { name: 'Lien Waivers', type: 'bidirectional', description: 'Waiver status before payment' },
        { name: 'Financial Dashboard', type: 'output', description: 'Summary metrics' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Sync payables' },
        { name: 'Cash Flow', type: 'output', description: 'Payment impact' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'vendor_id', type: 'uuid', required: true, description: 'Vendor' },
        { name: 'job_id', type: 'uuid', description: 'Job if applicable' },
        { name: 'invoice_id', type: 'uuid', required: true, description: 'Source invoice' },
        { name: 'amount', type: 'decimal', required: true, description: 'Amount owed' },
        { name: 'amount_paid', type: 'decimal', description: 'Amount paid' },
        { name: 'balance', type: 'decimal', description: 'Remaining balance' },
        { name: 'due_date', type: 'date', required: true, description: 'Payment due' },
        { name: 'payment_terms', type: 'string', description: 'Net 30, etc.' },
        { name: 'early_pay_discount', type: 'decimal', description: 'Discount if paid early' },
        { name: 'discount_deadline', type: 'date', description: 'Discount deadline' },
        { name: 'status', type: 'string', required: true, description: 'Pending, Scheduled, Paid' },
        { name: 'scheduled_date', type: 'date', description: 'Scheduled payment date' },
        { name: 'lien_waiver_received', type: 'boolean', description: 'Waiver on file' },
        { name: 'retainage_held', type: 'decimal', description: 'Retainage amount' },
      ]}
      aiFeatures={[
        {
          name: 'Payment Optimization',
          description: 'Optimizes payment timing. "Pay ABC Lumber by Feb 1 for 2% discount ($480 savings). Cash available."',
          trigger: 'Daily review'
        },
        {
          name: 'Cash Flow Balancing',
          description: 'Balances payments with cash position. "Defer XYZ payment 5 days to after Draw #5 expected receipt."',
          trigger: 'On scheduling'
        },
        {
          name: 'Lien Waiver Alerts',
          description: 'Blocks payment without waiver. "Cannot pay ABC Electric - conditional lien waiver not received."',
          trigger: 'Before payment'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Accounts Payable                              Total: $312,000       │
├─────────────────────────────────────────────────────────────────────┤
│ View: [By Vendor] [By Job] [Aging]    Due: [This Week ▾]           │
├─────────────────────────────────────────────────────────────────────┤
│ PAYMENT SCHEDULE - This Week                                        │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ □ ABC Lumber                    Due: Feb 1      $24,000         │ │
│ │   Smith Residence - Framing lumber                              │ │
│ │   2% discount if paid by Jan 30 (save $480)                     │ │
│ │   Lien waiver: Received                                         │ │
│ │   [Pay Now] [Schedule] [View Invoice]                           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ □ XYZ Electric                  Due: Feb 3      $12,450         │ │
│ │   Smith Residence - Rough-in                                    │ │
│ │   Lien waiver: Pending                                          │ │
│ │   AI: "Request waiver before payment"                           │ │
│ │   [Request Waiver] [Schedule] [View Invoice]                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ □ Coastal Plumbing              Due: Feb 5      $8,900          │ │
│ │   Multiple jobs (3 invoices)                                    │ │
│ │   Lien waiver: Received                                         │ │
│ │   [Pay Now] [Schedule] [View Invoices]                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Selected: $0 | [Pay Selected] | This week total: $45,350           │
│ 2 invoices need lien waivers before payment                        │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
