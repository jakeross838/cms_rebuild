'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function JobPermitsPage() {
  return (
    <PageSpec
      title="Permits"
      phase="Phase 1 - Compliance"
      planFile="views/jobs/PERMITS.md"
      description="Track all permits required for this job. Manage applications, approvals, and ensure compliance. Know permit status before scheduling related work and avoid costly delays."
      workflow={['Identify Required', 'Apply', 'Under Review', 'Approved', 'Posted on Site', 'Closed']}
      features={[
        'Permit checklist by job type',
        'Application tracking',
        'Required documents list',
        'Submission status',
        'Approval tracking',
        'Permit fees',
        'Expiration dates',
        'Renewal reminders',
        'Inspector contacts',
        'Related inspections',
        'Document attachments',
        'Permit card storage',
        'Schedule integration',
        'Compliance reporting',
      ]}
      connections={[
        { name: 'Documents', type: 'bidirectional', description: 'Permit documents' },
        { name: 'Inspections', type: 'output', description: 'Required inspections' },
        { name: 'Schedule', type: 'bidirectional', description: 'Work dependencies' },
        { name: 'Budget', type: 'output', description: 'Permit fees' },
        { name: 'Building Department', type: 'bidirectional', description: 'Submissions' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'permit_type', type: 'string', required: true, description: 'Building, Electrical, Plumbing, etc.' },
        { name: 'permit_number', type: 'string', description: 'Assigned number' },
        { name: 'jurisdiction', type: 'string', required: true, description: 'City/county' },
        { name: 'application_date', type: 'date', description: 'When applied' },
        { name: 'approval_date', type: 'date', description: 'When approved' },
        { name: 'expiration_date', type: 'date', description: 'When expires' },
        { name: 'fee_amount', type: 'decimal', description: 'Permit fee' },
        { name: 'status', type: 'string', required: true, description: 'Draft, Applied, Under Review, Approved, Expired' },
        { name: 'documents', type: 'jsonb', description: 'Required documents' },
        { name: 'notes', type: 'text', description: 'Notes' },
        { name: 'inspector', type: 'string', description: 'Assigned inspector' },
      ]}
      aiFeatures={[
        {
          name: 'Permit Requirements',
          description: 'Identifies needed permits. "Based on scope: Building, Electrical, Plumbing, Mechanical, and HVAC permits required."',
          trigger: 'On job creation'
        },
        {
          name: 'Timeline Management',
          description: 'Plans permit timing. "Building permit typically 3-4 weeks in this jurisdiction. Apply by Feb 1 for March start."',
          trigger: 'On schedule planning'
        },
        {
          name: 'Expiration Alerts',
          description: 'Monitors permit validity. "Building permit expires in 60 days. Work 75% complete. May need extension."',
          trigger: 'Periodic check'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Permits - Smith Residence                       Fees Paid: $8,450   │
├─────────────────────────────────────────────────────────────────────┤
│ PERMIT STATUS                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Permit Type      Number        Status      Expires              │ │
│ │ ────────────────────────────────────────────────────────────── │ │
│ │ Building         BLD-2024-1234 ✓ Approved  Jun 15, 2025        │ │
│ │ Electrical       ELE-2024-5678 ✓ Approved  Jun 15, 2025        │ │
│ │ Plumbing         PLB-2024-9012 ✓ Approved  Jun 15, 2025        │ │
│ │ Mechanical       MEC-2024-3456 ⏳ Review   -                    │ │
│ │ Pool             -             📝 Draft    -                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ PENDING ACTION                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Mechanical Permit                          Under Review         │ │
│ │ Applied: Jan 15 | Typical review: 2 weeks                       │ │
│ │ Status: Plan review - comments expected Jan 30                  │ │
│ │ ⚠ HVAC rough-in scheduled Feb 5 - needs approval               │ │
│ │ [Check Status] [Contact Reviewer]                               │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Pool Permit                                 Draft               │ │
│ │ Required documents: Site plan, pool plans, barrier plan         │ │
│ │ AI: "Submit by Feb 15 for April pool construction start"       │ │
│ │ [Edit Application] [Upload Documents] [Submit]                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Inspector: John Smith (City of Clearwater) | 📞 (727) 555-0123     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
