'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { PaymentsPreview } from '@/components/skeleton/previews/payments-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Draws', 'Client Approval', 'Payment Link', 'Payment', 'Reconciliation'
]

export default function PaymentsSkeleton() {
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
      {activeTab === 'preview' ? <PaymentsPreview /> : <PageSpec
      title="Payments"
      phase="Phase 4 - Time & Payments"
      planFile="views/financial/PAYMENTS.md"
      description="Online payment processing for draw requests and invoices via Stripe integration. Generate payment links, track payment status, process credit cards and ACH transfers, and automatically reconcile with draws and budgets."
      workflow={constructionWorkflow}
      features={[
        'Payment list with full status tracking (pending/processing/completed/failed/refunded/partial)',
        'Generate payment links for draws with expiration dates',
        'Client name display alongside job and draw reference',
        'Credit card processing via Stripe (2.9% + $0.30)',
        'ACH bank transfer support ($15 flat fee)',
        'Wire transfer support ($25 flat fee)',
        'Check payment recording',
        'Partial payment tracking with progress bar and remaining balance',
        'Payment reminders (automated with escalation)',
        'Late payment notifications',
        'Payment receipt generation with download link',
        'Automatic draw status update on payment',
        'Payment history by client with method preferences',
        'Refund processing with reason tracking',
        'Payment plan setup for large amounts',
        'Processing fee options (absorb or pass-through)',
        'QuickBooks sync status per payment with unsync alert',
        'Link view tracking (sent/viewed/expires)',
        'Failed payment retry and new link generation',
        'Fee comparison summary (ACH vs card savings)',
        'Sort by job, client, amount, draw number, status',
        'Export for accounting reconciliation (PDF, Excel)',
        'Mobile-friendly payment page',
      ]}
      connections={[
        { name: 'Draws', type: 'bidirectional', description: 'Payments applied to draws' },
        { name: 'Client Portal', type: 'output', description: 'Payment links in portal' },
        { name: 'Clients', type: 'input', description: 'Payment info and history linked to client' },
        { name: 'Accounts Receivable', type: 'output', description: 'Payments reduce AR balance' },
        { name: 'Cash Flow', type: 'output', description: 'Payments update cash projections' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Payment sync to accounting' },
        { name: 'Email', type: 'output', description: 'Payment receipts, reminders, and failure alerts' },
        { name: 'Budget', type: 'output', description: 'Payments update cash received' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'draw_id', type: 'uuid', description: 'FK to draws' },
        { name: 'client_id', type: 'uuid', required: true, description: 'FK to clients' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'amount', type: 'decimal', required: true, description: 'Payment amount' },
        { name: 'partial_amount', type: 'decimal', description: 'Amount received so far (for partial payments)' },
        { name: 'processing_fee', type: 'decimal', description: 'Processing fee amount' },
        { name: 'net_amount', type: 'decimal', description: 'Net amount after fees' },
        { name: 'method', type: 'string', required: true, description: 'ACH | Credit Card | Wire | Check' },
        { name: 'status', type: 'string', required: true, description: 'pending | processing | completed | failed | refunded | partial' },
        { name: 'stripe_payment_id', type: 'string', description: 'Stripe payment intent ID' },
        { name: 'payment_link', type: 'string', description: 'Payment URL' },
        { name: 'link_expires_at', type: 'timestamp', description: 'Link expiration date' },
        { name: 'link_viewed_at', type: 'timestamp', description: 'When client viewed the link' },
        { name: 'paid_at', type: 'timestamp', description: 'When payment completed' },
        { name: 'receipt_url', type: 'string', description: 'Receipt download URL' },
        { name: 'refund_amount', type: 'decimal', description: 'Amount refunded' },
        { name: 'refund_reason', type: 'text', description: 'Reason for refund' },
        { name: 'notes', type: 'text', description: 'Payment notes' },
        { name: 'qb_synced', type: 'boolean', description: 'Synced to QuickBooks' },
      ]}
      aiFeatures={[
        {
          name: 'Payment Prediction',
          description: 'Predicts payment timing based on client history: "Smith typically pays within 5 days of draw approval. Expected: Feb 5."',
          trigger: 'On draw approval'
        },
        {
          name: 'Late Payment Risk',
          description: 'Identifies potential late payments: "Draw #5 approved 10 days ago, client average is 5 days. Recommend sending reminder."',
          trigger: 'Based on client patterns'
        },
        {
          name: 'Fee Optimization',
          description: 'Suggests payment method to minimize fees: "For $185K draw: ACH fee $15 vs Credit Card fee $5,365. Recommend ACH."',
          trigger: 'On payment link generation'
        },
        {
          name: 'Cash Flow Integration',
          description: 'Updates cash flow projections: "Payment received. Next 30 days positive. Vendor payments covered."',
          trigger: 'On payment completion'
        },
        {
          name: 'Failed Payment Recovery',
          description: 'Suggests recovery actions for failed payments: "Thompson payment declined. Card may be expired. Recommend sending new link with ACH option."',
          trigger: 'On payment failure'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Payments                                [+ New Payment Link]        │
├─────────────────────────────────────────────────────────────────────┤
│ This Month: $485,000 received | Pending: $245,000 | Overdue: $0    │
├─────────────────────────────────────────────────────────────────────┤
│ Filter: [All ▾] Status: [All ▾] Job: [All ▾]                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ⏳ PENDING PAYMENTS                                                  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Smith Residence - Draw #5                           $185,000    │ │
│ │ Link sent: Jan 25 | Viewed: Jan 26 | Not yet paid              │ │
│ │ AI: "Client typically pays in 5 days. Due soon."               │ │
│ │ [Send Reminder] [Resend Link] [View Draw]                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Johnson Beach House - Draw #3                       $60,000     │ │
│ │ Link sent: Today | Expires: Feb 15                              │ │
│ │ Methods: ACH ($15 fee) | Card ($1,740 fee)                      │ │
│ │ [Copy Link] [View Draw]                                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ✓ RECENT PAYMENTS                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Smith Residence - Draw #4              ✓ Paid      $225,000     │ │
│ │ Paid: Jan 20 via ACH | Fee: $15 | Net: $224,985                │ │
│ │ [View Receipt] [View in QuickBooks]                             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ 💳 Stripe Connected | Processing: 2.9% + $0.30 card, $15 flat ACH  │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
