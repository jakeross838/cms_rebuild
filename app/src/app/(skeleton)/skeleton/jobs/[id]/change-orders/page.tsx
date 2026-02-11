'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function JobChangeOrdersPage() {
  return (
    <PageSpec
      title="Change Orders"
      phase="Phase 1 - Project Management"
      planFile="views/jobs/CHANGE_ORDERS.md"
      description="Track all change orders for this job. Document scope changes, calculate cost impacts, get client approval, and maintain a clear record of all modifications to the original contract."
      workflow={['Identify Change', 'Document Scope', 'Price Change', 'Client Approval', 'Execute']}
      features={[
        'Change order list',
        'Scope documentation',
        'Cost breakdown',
        'Markup calculation',
        'Client approval workflow',
        'E-signature',
        'Schedule impact',
        'Photo documentation',
        'Related RFIs',
        'Budget integration',
        'Running total',
        'Contract modification',
        'Change order log',
        'Pending vs approved',
      ]}
      connections={[
        { name: 'Budget', type: 'bidirectional', description: 'Cost impact' },
        { name: 'Schedule', type: 'bidirectional', description: 'Schedule impact' },
        { name: 'RFIs', type: 'input', description: 'Related RFIs' },
        { name: 'Selections', type: 'input', description: 'Selection changes' },
        { name: 'Contract', type: 'bidirectional', description: 'Contract value' },
        { name: 'Client Portal', type: 'output', description: 'Approval' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'co_number', type: 'integer', required: true, description: 'Sequential number' },
        { name: 'title', type: 'string', required: true, description: 'Brief title' },
        { name: 'description', type: 'text', required: true, description: 'Detailed scope' },
        { name: 'reason', type: 'string', description: 'Client request, Field condition, Design change' },
        { name: 'cost', type: 'decimal', required: true, description: 'Direct cost' },
        { name: 'markup', type: 'decimal', description: 'Markup amount' },
        { name: 'total', type: 'decimal', description: 'Total to client' },
        { name: 'schedule_impact', type: 'integer', description: 'Days added' },
        { name: 'status', type: 'string', required: true, description: 'Draft, Submitted, Approved, Rejected' },
        { name: 'submitted_at', type: 'timestamp', description: 'Submission date' },
        { name: 'approved_at', type: 'timestamp', description: 'Approval date' },
        { name: 'signed_document', type: 'string', description: 'Signed CO URL' },
      ]}
      aiFeatures={[
        {
          name: 'Cost Estimation',
          description: 'Helps price changes. "Similar tray ceiling change on Johnson project cost $4,200. Recommend: $4,500 with current lumber prices."',
          trigger: 'On CO creation'
        },
        {
          name: 'Impact Analysis',
          description: 'Calculates full impact. "This CO adds 3 days to framing. Cascading impact: 2 days to total schedule."',
          trigger: 'On scope entry'
        },
        {
          name: 'Documentation',
          description: 'Ensures completeness. "CO missing: reason code, related photos. Required for client approval."',
          trigger: 'Before submission'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Change Orders - Smith Residence                 Net Change: +$45,000│
├─────────────────────────────────────────────────────────────────────┤
│ SUMMARY                                                             │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐      │
│ │ Approved     │ Pending      │ Schedule     │ New Contract │      │
│ │ +$38,000     │ +$7,000      │ +8 days      │ $2,438,000   │      │
│ │ 4 COs        │ 1 CO         │              │              │      │
│ └──────────────┴──────────────┴──────────────┴──────────────┘      │
├─────────────────────────────────────────────────────────────────────┤
│ PENDING APPROVAL                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CO #5 - Add Tray Ceiling in Master                              │ │
│ │ Requested by: Client | Created: Jan 25                          │ │
│ │ Cost: $5,500 + $1,500 markup = $7,000                           │ │
│ │ Schedule Impact: +3 days                                        │ │
│ │ Status: Submitted to client Jan 26                              │ │
│ │ [View Details] [Send Reminder] [Edit]                           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ APPROVED CHANGE ORDERS                                              │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CO #4  Upgrade to impact windows     +$18,000   ✓ Approved 1/15│ │
│ │ CO #3  Add outdoor shower            +$8,500    ✓ Approved 1/10│ │
│ │ CO #2  Relocate HVAC return          +$2,500    ✓ Approved 12/5│ │
│ │ CO #1  Additional electrical outlets +$9,000    ✓ Approved 11/20│ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Original Contract: $2,400,000 | Changes: +$45,000 | New: $2,445,000│
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
