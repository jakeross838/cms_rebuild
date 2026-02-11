'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function JobInvoicesPage() {
  return (
    <PageSpec
      title="Job Invoices"
      phase="Phase 0 - Foundation"
      planFile="views/jobs/INVOICES.md"
      description="Manage all invoices received for this job. Review, approve, code to budget, and track payment status. Match invoices to POs and ensure accurate job costing."
      workflow={['Receive', 'Review', 'Code', 'Approve', 'Pay', 'Reconcile']}
      features={[
        'Invoice list by job',
        'PO matching',
        'Cost code assignment',
        'Budget impact',
        'Approval workflow',
        'Multi-line invoices',
        'Retainage tracking',
        'Dispute management',
        'Payment status',
        'Lien waiver link',
        'Document attachment',
        'Quick approve',
      ]}
      connections={[
        { name: 'Purchase Orders', type: 'input', description: 'Match to POs' },
        { name: 'Budget', type: 'bidirectional', description: 'Cost tracking' },
        { name: 'Accounts Payable', type: 'output', description: 'Payment queue' },
        { name: 'Lien Waivers', type: 'bidirectional', description: 'Waiver status' },
        { name: 'Vendors', type: 'input', description: 'Vendor info' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'vendor_id', type: 'uuid', required: true, description: 'Vendor' },
        { name: 'invoice_number', type: 'string', required: true, description: 'Vendor invoice #' },
        { name: 'invoice_date', type: 'date', required: true, description: 'Invoice date' },
        { name: 'due_date', type: 'date', description: 'Payment due' },
        { name: 'amount', type: 'decimal', required: true, description: 'Total amount' },
        { name: 'retainage', type: 'decimal', description: 'Retainage held' },
        { name: 'net_amount', type: 'decimal', description: 'Amount payable' },
        { name: 'po_id', type: 'uuid', description: 'Matched PO' },
        { name: 'cost_code', type: 'string', description: 'Budget code' },
        { name: 'status', type: 'string', required: true, description: 'Pending, Approved, Paid, Disputed' },
        { name: 'approved_by', type: 'uuid', description: 'Approver' },
        { name: 'lien_waiver_status', type: 'string', description: 'Waiver status' },
      ]}
      aiFeatures={[
        {
          name: 'PO Matching',
          description: 'Auto-matches to POs. "Invoice matches PO-089 for ABC Lumber. Amount: $24,500 (exact match)."',
          trigger: 'On invoice entry'
        },
        {
          name: 'Anomaly Detection',
          description: 'Flags unusual invoices. "XYZ Electric invoice 35% higher than PO estimate. Review recommended."',
          trigger: 'On invoice entry'
        },
        {
          name: 'Cost Coding',
          description: 'Suggests cost codes. "Based on vendor and description, recommend: 03-Framing-Materials."',
          trigger: 'On invoice entry'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Invoices - Smith Residence                     Job Total: $892,000  │
├─────────────────────────────────────────────────────────────────────┤
│ Status: [All ▾]    Vendor: [All ▾]              [+ Enter Invoice]  │
├─────────────────────────────────────────────────────────────────────┤
│ NEEDS REVIEW (3)                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ABC Lumber #45678            $24,500         Received: Jan 27   │ │
│ │ Framing package - 2nd floor                                     │ │
│ │ ✓ Matches PO-089 | ✓ Lien waiver received                      │ │
│ │ AI Suggested: 03-Framing-Materials                              │ │
│ │ [Approve] [Review] [Dispute]                                    │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ XYZ Electric #E-2024-156     $14,200         Received: Jan 26   │ │
│ │ Rough-in electrical                                             │ │
│ │ ⚠ 14% over PO estimate ($12,450)                               │ │
│ │ ⚠ Lien waiver pending                                          │ │
│ │ [Approve] [Review] [Dispute]                                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ APPROVED - AWAITING PAYMENT                                         │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Coastal Concrete #CC-890     $18,000         Due: Feb 5         │ │
│ │ Coastal Plumbing #1234       $8,900          Due: Feb 8         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ This Month: $65,600 invoiced | $42,000 approved | $18,000 paid     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
