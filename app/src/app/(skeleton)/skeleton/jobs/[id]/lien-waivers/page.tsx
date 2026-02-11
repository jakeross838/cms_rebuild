'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function JobLienWaiversPage() {
  return (
    <PageSpec
      title="Lien Waivers"
      phase="Phase 1 - Compliance"
      planFile="views/jobs/LIEN_WAIVERS.md"
      description="Track lien waivers from all vendors and subcontractors for this job. Ensure waivers are collected before payments and maintain proper documentation for project closeout and title insurance."
      workflow={['Payment Due', 'Request Waiver', 'Waiver Received', 'Verify', 'Approve Payment']}
      features={[
        'Waiver tracking by vendor',
        'Conditional vs unconditional',
        'Progress vs final waivers',
        'Auto-request on payment',
        'Template management',
        'E-signature support',
        'Payment linkage',
        'Draw requirements',
        'Compliance dashboard',
        'Missing waiver alerts',
        'Document storage',
        'Title company requirements',
        'Bulk waiver requests',
        'Waiver history',
      ]}
      connections={[
        { name: 'Invoices', type: 'bidirectional', description: 'Payment hold' },
        { name: 'Accounts Payable', type: 'bidirectional', description: 'Block without waiver' },
        { name: 'Vendors', type: 'input', description: 'Vendor contacts' },
        { name: 'Draws', type: 'input', description: 'Draw requirements' },
        { name: 'Document Storage', type: 'output', description: 'Store waivers' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'vendor_id', type: 'uuid', required: true, description: 'Vendor' },
        { name: 'waiver_type', type: 'string', required: true, description: 'Conditional, Unconditional' },
        { name: 'payment_type', type: 'string', description: 'Progress, Final' },
        { name: 'through_date', type: 'date', description: 'Work through date' },
        { name: 'amount', type: 'decimal', description: 'Amount covered' },
        { name: 'invoice_id', type: 'uuid', description: 'Related invoice' },
        { name: 'requested_date', type: 'date', description: 'When requested' },
        { name: 'received_date', type: 'date', description: 'When received' },
        { name: 'status', type: 'string', required: true, description: 'Pending, Received, Verified' },
        { name: 'document_url', type: 'string', description: 'Signed waiver' },
        { name: 'signed_by', type: 'string', description: 'Signatory name' },
        { name: 'notes', type: 'text', description: 'Notes' },
      ]}
      aiFeatures={[
        {
          name: 'Auto-Request',
          description: 'Sends waiver requests. "Invoice approved for ABC Lumber. Conditional lien waiver request sent automatically."',
          trigger: 'On invoice approval'
        },
        {
          name: 'Compliance Check',
          description: 'Validates completeness. "Draw #5 requires waivers from 8 vendors. Received: 6. Missing: ABC Electric, XYZ Plumbing."',
          trigger: 'Before draw submission'
        },
        {
          name: 'Payment Block',
          description: 'Prevents premature payment. "Cannot process payment to ABC Electric. Conditional waiver not received."',
          trigger: 'On payment attempt'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Lien Waivers - Smith Residence                 Compliance: 94%      │
├─────────────────────────────────────────────────────────────────────┤
│ SUMMARY                                                             │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐      │
│ │ Received     │ Pending      │ For Draw #5  │ Total Value  │      │
│ │ 45 waivers   │ 3 waivers    │ 6 of 8 ✓    │ $892,000     │      │
│ └──────────────┴──────────────┴──────────────┴──────────────┘      │
├─────────────────────────────────────────────────────────────────────┤
│ PENDING WAIVERS (Payment Hold)                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ABC Electric                              Requested: Jan 25     │ │
│ │ Conditional Progress Waiver | Amount: $12,450                   │ │
│ │ Invoice: E-2024-156 | Payment: ON HOLD                          │ │
│ │ [Send Reminder] [Mark Received] [Call Vendor]                   │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ XYZ Plumbing                              Requested: Jan 26     │ │
│ │ Conditional Progress Waiver | Amount: $8,900                    │ │
│ │ Invoice: 1234 | Payment: ON HOLD                                │ │
│ │ [Send Reminder] [Mark Received] [Call Vendor]                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ RECENTLY RECEIVED                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✓ ABC Lumber - Conditional - $24,500 - Received Jan 27         │ │
│ │ ✓ Coastal Concrete - Unconditional - $18,000 - Received Jan 26 │ │
│ │ ✓ PGT Windows - Conditional - $45,000 - Received Jan 25        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ ⚠ 2 invoices cannot be paid until waivers received                 │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
