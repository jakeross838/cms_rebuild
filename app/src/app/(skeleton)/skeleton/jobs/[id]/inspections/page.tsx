'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function JobInspectionsPage() {
  return (
    <PageSpec
      title="Inspections"
      phase="Phase 1 - Compliance"
      planFile="views/jobs/INSPECTIONS.md"
      description="Manage all inspections for this job. Schedule inspections, prepare for them, track results, and address any failures. Critical for maintaining schedule and ensuring quality."
      workflow={['Work Complete', 'Request Inspection', 'Scheduled', 'Inspector On-Site', 'Pass/Fail', 'Re-inspect if Needed']}
      features={[
        'Inspection checklist by permit',
        'Request scheduling',
        'Pre-inspection checklists',
        'Inspector availability',
        'Result tracking',
        'Failure documentation',
        'Re-inspection scheduling',
        'Inspection history',
        'Photo documentation',
        'Notes and comments',
        'Schedule integration',
        'Notification to team',
        'Inspector contact info',
        'Compliance calendar',
      ]}
      connections={[
        { name: 'Permits', type: 'input', description: 'Required inspections' },
        { name: 'Schedule', type: 'bidirectional', description: 'Work timing' },
        { name: 'Daily Logs', type: 'output', description: 'Log results' },
        { name: 'Photos', type: 'bidirectional', description: 'Documentation' },
        { name: 'Building Department', type: 'bidirectional', description: 'Schedule requests' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'permit_id', type: 'uuid', description: 'Related permit' },
        { name: 'inspection_type', type: 'string', required: true, description: 'Type of inspection' },
        { name: 'requested_date', type: 'date', description: 'Preferred date' },
        { name: 'scheduled_date', type: 'date', description: 'Confirmed date' },
        { name: 'scheduled_time', type: 'string', description: 'Time window' },
        { name: 'inspector', type: 'string', description: 'Inspector name' },
        { name: 'status', type: 'string', required: true, description: 'Pending, Scheduled, Passed, Failed, Cancelled' },
        { name: 'result', type: 'string', description: 'Pass, Fail, Partial' },
        { name: 'comments', type: 'text', description: 'Inspector comments' },
        { name: 'corrections_needed', type: 'text', description: 'Required fixes' },
        { name: 'reinspection_date', type: 'date', description: 'Re-inspect date' },
        { name: 'photos', type: 'jsonb', description: 'Photos taken' },
      ]}
      aiFeatures={[
        {
          name: 'Pre-Inspection Check',
          description: 'Ensures readiness. "Foundation inspection tomorrow. Checklist: Rebar spacing ✓, Tie-downs ✓, Setback markers needed."',
          trigger: 'Day before inspection'
        },
        {
          name: 'Scheduling Optimization',
          description: 'Plans inspection timing. "Request framing inspection by Tuesday for Thursday slot. Inspector typically available Tue/Thu."',
          trigger: 'On work completion'
        },
        {
          name: 'Failure Resolution',
          description: 'Addresses failures. "Electrical inspection failed: Missing GFCI at exterior outlet. Quick fix - schedule reinspect same day."',
          trigger: 'On failure'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Inspections - Smith Residence                   Pass Rate: 92%      │
├─────────────────────────────────────────────────────────────────────┤
│ UPCOMING                                                            │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Framing - Rough                           Tomorrow 9am-12pm     │ │
│ │ Inspector: John Smith                                           │ │
│ │ Pre-inspection: ✓ Nailing patterns ✓ Headers ✓ Hold-downs      │ │
│ │ AI: "All prep items complete. Ready for inspection."           │ │
│ │ [View Checklist] [Reschedule] [Cancel]                         │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Electrical - Rough                        Requested: Jan 30     │ │
│ │ Status: Awaiting confirmation                                   │ │
│ │ [Check Status]                                                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ NEEDS RE-INSPECTION                                                 │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⚠ Plumbing - Rough                       Failed: Jan 25        │ │
│ │ Issue: Missing cleanout at kitchen stack                        │ │
│ │ Correction: Cleanout installed Jan 26                           │ │
│ │ Re-inspection: Scheduled Jan 28                                 │ │
│ │ [View Details] [Update Status]                                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ COMPLETED                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Foundation        ✓ Passed Jan 10  | Slab Pre-Pour ✓ Passed    │ │
│ │ Slab Post-Pour    ✓ Passed Jan 15  | Termite Pre-Treat ✓ Pass  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Completed: 12 | Passed: 11 | Failed: 1 | Pending: 3                │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
