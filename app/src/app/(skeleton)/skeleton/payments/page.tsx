'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Draws', 'Client Approval', 'Payment Link', 'Payment', 'Reconciliation'
]

export default function PaymentsSkeleton() {
  return (
    <PageSpec
      title="Payments"
      phase="Phase 4 - Time & Payments"
      planFile="views/financial/PAYMENTS.md"
      description="Online payment processing for draw requests and invoices via Stripe integration. Generate payment links, track payment status, process credit cards and ACH transfers, and automatically reconcile with draws and budgets."
      workflow={constructionWorkflow}
      features={[
        'Payment list with status tracking',
        'Generate payment links for draws',
        'Credit card processing via Stripe',
        'ACH bank transfer support',
        'Partial payment tracking',
        'Payment reminders (automated)',
        'Late payment notifications',
        'Payment receipt generation',
        'Automatic draw status update on payment',
        'Payment history by client',
        'Refund processing',
        'Payment plan setup for large amounts',
        'Processing fee options (absorb or pass-through)',
        'Export for accounting reconciliation',
        'Mobile-friendly payment page',
      ]}
      connections={[
        { name: 'Draws', type: 'bidirectional', description: 'Payments applied to draws' },
        { name: 'Client Portal', type: 'output', description: 'Payment links in portal' },
        { name: 'Clients', type: 'input', description: 'Payment info linked to client' },
        { name: 'QuickBooks', type: 'output', description: 'Payment sync to accounting' },
        { name: 'Email', type: 'output', description: 'Payment receipts and reminders' },
        { name: 'Budget', type: 'output', description: 'Payments update cash received' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'draw_id', type: 'uuid', description: 'FK to draws' },
        { name: 'client_id', type: 'uuid', required: true, description: 'FK to clients' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'amount', type: 'decimal', required: true, description: 'Payment amount' },
        { name: 'processing_fee', type: 'decimal', description: 'Processing fee amount' },
        { name: 'net_amount', type: 'decimal', description: 'Net amount after fees' },
        { name: 'method', type: 'string', required: true, description: 'Credit Card, ACH, Check, Wire' },
        { name: 'status', type: 'string', required: true, description: 'Pending, Processing, Completed, Failed, Refunded' },
        { name: 'stripe_payment_id', type: 'string', description: 'Stripe payment intent ID' },
        { name: 'payment_link', type: 'string', description: 'Payment URL' },
        { name: 'link_expires_at', type: 'timestamp', description: 'Link expiration' },
        { name: 'paid_at', type: 'timestamp', description: 'When payment completed' },
        { name: 'receipt_url', type: 'string', description: 'Receipt URL' },
        { name: 'notes', type: 'text', description: 'Payment notes' },
        { name: 'qb_synced', type: 'boolean', description: 'Synced to QuickBooks' },
      ]}
      aiFeatures={[
        {
          name: 'Payment Prediction',
          description: 'Predicts payment timing based on client history: "Client typically pays within 5 days of draw approval. Expected payment date: Feb 5."',
          trigger: 'On draw approval'
        },
        {
          name: 'Late Payment Risk',
          description: 'Identifies potential late payments: "Draw #5 approved 10 days ago, client average is 5 days. Sending reminder recommended."',
          trigger: 'Based on client patterns'
        },
        {
          name: 'Fee Optimization',
          description: 'Suggests payment method to minimize fees: "For $185K draw: ACH fee $15 vs Credit Card fee $5,365. Recommend ACH with 2-day processing."',
          trigger: 'On payment link generation'
        },
        {
          name: 'Cash Flow Integration',
          description: 'Updates cash flow projections: "Payment received. Updated cash flow: Next 30 days positive. Vendor payments covered."',
          trigger: 'On payment completion'
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
    />
  )
}
