'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function JobSubmittalsPage() {
  return (
    <PageSpec
      title="Submittals"
      phase="Phase 1 - Project Management"
      planFile="views/jobs/SUBMITTALS.md"
      description="Track product submittals for architect/engineer approval. Manage the submittal workflow from vendor to design team and back. Ensure all products are approved before ordering."
      workflow={['Request from Vendor', 'Review Internally', 'Submit for Approval', 'Revise if Needed', 'Approved']}
      features={[
        'Submittal log',
        'Submittal schedule',
        'Vendor submittal requests',
        'Internal review',
        'Route to design team',
        'Approval status tracking',
        'Revision management',
        'Due date tracking',
        'Spec section reference',
        'Related POs (hold until approved)',
        'Bulk approval',
        'Digital stamps',
        'Submittal packages',
        'Export submittal log',
      ]}
      connections={[
        { name: 'Vendors', type: 'input', description: 'Request submittals' },
        { name: 'Specifications', type: 'input', description: 'Spec requirements' },
        { name: 'Purchase Orders', type: 'bidirectional', description: 'Hold PO until approved' },
        { name: 'Schedule', type: 'bidirectional', description: 'Lead time planning' },
        { name: 'Architect/Engineer', type: 'bidirectional', description: 'Route for approval' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'submittal_number', type: 'string', required: true, description: 'Submittal ID' },
        { name: 'spec_section', type: 'string', description: 'Specification section' },
        { name: 'description', type: 'string', required: true, description: 'Item description' },
        { name: 'vendor_id', type: 'uuid', description: 'Providing vendor' },
        { name: 'submitted_date', type: 'date', description: 'When submitted' },
        { name: 'required_date', type: 'date', description: 'Need approval by' },
        { name: 'lead_time', type: 'integer', description: 'Days after approval' },
        { name: 'status', type: 'string', required: true, description: 'Pending, Submitted, Approved, Revise & Resubmit, Rejected' },
        { name: 'revision', type: 'integer', description: 'Revision number' },
        { name: 'reviewer', type: 'string', description: 'Who reviews' },
        { name: 'review_date', type: 'date', description: 'When reviewed' },
        { name: 'comments', type: 'text', description: 'Review comments' },
        { name: 'documents', type: 'jsonb', description: 'Attached files' },
      ]}
      aiFeatures={[
        {
          name: 'Schedule Integration',
          description: 'Manages timing. "Window submittal needed by Feb 1 for 8-week lead time. Installation scheduled Apr 15."',
          trigger: 'On schedule update'
        },
        {
          name: 'Vendor Follow-up',
          description: 'Tracks requests. "Requested cabinet submittals from ABC Cabinets 10 days ago. Auto-reminder sent."',
          trigger: 'Daily check'
        },
        {
          name: 'Approval Prediction',
          description: 'Estimates timelines. "Based on architect response history, expect 5-day review. May need to expedite."',
          trigger: 'On submission'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Submittals - Smith Residence                    Total: 28 Items     │
├─────────────────────────────────────────────────────────────────────┤
│ Status: [All ▾]    Spec Section: [All ▾]         [+ New Submittal] │
├─────────────────────────────────────────────────────────────────────┤
│ AWAITING VENDOR (3)                                                 │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 08-001  Windows - PGT Impact               Need by: Feb 1       │ │
│ │         Requested from: ABC Glass Jan 15 (13 days ago)          │ │
│ │         Lead time: 8 weeks | [Send Reminder] [View Request]     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ SUBMITTED - UNDER REVIEW (4)                                        │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 06-100  Cabinets - Kitchen              Submitted: Jan 20       │ │
│ │         Reviewer: Architect | Due: Jan 30                       │ │
│ │         Status: Under Review | [View Submittal]                 │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 09-250  Countertops - Quartz            Submitted: Jan 22       │ │
│ │         Reviewer: Architect | Due: Feb 1                        │ │
│ │         Status: Under Review | [View Submittal]                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ RECENTLY APPROVED                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 03-300  Concrete Mix Design        ✓ Approved Jan 18            │ │
│ │ 07-200  Roofing - Metal Standing   ✓ Approved Jan 15            │ │
│ │ 04-200  CMU Block                  ✓ Approved Jan 12            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Approved: 18 | Pending: 4 | Awaiting Vendor: 3 | Revise: 3         │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
