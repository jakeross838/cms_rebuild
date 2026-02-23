'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { PayablesPreview } from '@/components/skeleton/previews/payables-preview'
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
        'Aging buckets (current, 1-30, 31-60, 60+)',
        'Invoice approval status pipeline',
        'Payment scheduling with date selection',
        'Early payment discount detection and tracking',
        'Batch payment processing',
        'Payment method management',
        'Lien waiver tracking (received, pending, verified)',
        'Retainage tracking and withholding',
        '1099 preparation',
        'Cash flow impact preview',
        'Vendor payment terms',
        'Export for accounting / QBO sync',
        'AI confidence scoring per invoice',
        'Anomaly detection (amount, duplicate, frequency)',
        'Upload source tracking (web, mobile, email, API)',
        'Credit memo detection and matching',
        'PO number cross-reference badges',
        'Draw number cross-reference badges',
        'Cost code allocation display',
        'DSO (days sales outstanding) metric',
        'Disputed invoice status',
        'Duplicate invoice detection',
      ]}
      connections={[
        { name: 'AI Invoice Processing', type: 'input', description: 'AI-extracted invoices with confidence scores' },
        { name: 'Invoices', type: 'input', description: 'Approved invoices feed payment queue' },
        { name: 'Vendors', type: 'input', description: 'Vendor payment terms and contact info' },
        { name: 'Jobs', type: 'input', description: 'Job-level AP aggregation' },
        { name: 'Purchase Orders', type: 'input', description: 'PO matching for 3-way match' },
        { name: 'Lien Waivers', type: 'bidirectional', description: 'Waiver status gates payment release' },
        { name: 'Draws', type: 'input', description: 'Draw inclusion tracking' },
        { name: 'Cost Codes', type: 'input', description: 'Cost code allocation per line item' },
        { name: 'Financial Dashboard', type: 'output', description: 'AP totals, aging summary' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Push bills, pull payment status' },
        { name: 'Cash Flow', type: 'output', description: 'Payment impact on cash position' },
        { name: 'Budget', type: 'output', description: 'Actual costs column' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'vendor_id', type: 'uuid', required: true, description: 'Vendor' },
        { name: 'job_id', type: 'uuid', description: 'Job if applicable' },
        { name: 'invoice_id', type: 'uuid', required: true, description: 'Source invoice' },
        { name: 'invoice_number', type: 'string', required: true, description: 'Invoice number' },
        { name: 'invoice_type', type: 'string', description: 'standard, credit_memo, debit_memo' },
        { name: 'amount', type: 'decimal', required: true, description: 'Amount owed' },
        { name: 'amount_paid', type: 'decimal', description: 'Amount paid' },
        { name: 'balance', type: 'decimal', description: 'Remaining balance' },
        { name: 'invoice_date', type: 'date', required: true, description: 'Invoice date' },
        { name: 'due_date', type: 'date', required: true, description: 'Payment due' },
        { name: 'payment_terms', type: 'string', description: 'Net 30, etc.' },
        { name: 'early_pay_discount', type: 'decimal', description: 'Discount if paid early' },
        { name: 'discount_deadline', type: 'date', description: 'Discount deadline' },
        { name: 'status', type: 'string', required: true, description: 'Pending, Approved, Scheduled, Paid, Disputed' },
        { name: 'scheduled_date', type: 'date', description: 'Scheduled payment date' },
        { name: 'lien_waiver_status', type: 'string', description: 'received, pending, verified, not_required' },
        { name: 'retainage_held', type: 'decimal', description: 'Retainage amount' },
        { name: 'ai_confidence', type: 'decimal', description: 'AI extraction confidence score 0-1' },
        { name: 'upload_source', type: 'string', description: 'web, mobile, email, api' },
        { name: 'po_number', type: 'string', description: 'Matched PO number' },
        { name: 'cost_codes', type: 'string[]', description: 'Allocated cost codes' },
        { name: 'draw_number', type: 'integer', description: 'Included in draw number' },
        { name: 'qbo_sync_status', type: 'string', description: 'synced, pending, error, not_synced' },
        { name: 'anomaly_type', type: 'string', description: 'amount, duplicate, frequency, new_code' },
        { name: 'duplicate_warning', type: 'boolean', description: 'Possible duplicate detected' },
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
        {
          name: 'Anomaly Detection',
          description: 'Flags unusual invoices. "Invoice amount 42% higher than average for this vendor/scope. Possible duplicate detected."',
          trigger: 'On invoice processing'
        },
        {
          name: 'AI Confidence Scoring',
          description: 'Per-field confidence scores on AI-extracted data. Color-coded badges (green >95%, blue >80%, amber >70%, red <70%).',
          trigger: 'On AI extraction'
        },
        {
          name: 'Duplicate Detection',
          description: 'Identifies potential duplicate invoices by vendor, amount, and date proximity with dismiss/confirm workflow.',
          trigger: 'On invoice ingestion'
        },
        {
          name: 'Extraction Accuracy Tracking',
          description: 'Shows monthly AI accuracy rate and trend. "AI extraction accuracy this month: 94.2% (up 2.1%)."',
          trigger: 'Continuous'
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
