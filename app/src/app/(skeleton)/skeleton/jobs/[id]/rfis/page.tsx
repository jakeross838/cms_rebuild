'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function JobRFIsPage() {
  return (
    <PageSpec
      title="RFIs"
      phase="Phase 1 - Project Management"
      planFile="views/jobs/RFIS.md"
      description="Manage Requests for Information for this job. Document questions, track responses from architects/engineers, and ensure all clarifications are captured. Critical for preventing rework and claims."
      workflow={['Identify Question', 'Create RFI', 'Send to Design Team', 'Receive Response', 'Implement']}
      features={[
        'RFI list',
        'Question documentation',
        'Photo/drawing markup',
        'Route to correct party',
        'Response tracking',
        'Due date management',
        'Response impact analysis',
        'Drawing references',
        'Status workflow',
        'Related change orders',
        'Search RFIs',
        'Export RFI log',
        'Response attachments',
        'Ball-in-court tracking',
      ]}
      connections={[
        { name: 'Documents', type: 'input', description: 'Drawing references' },
        { name: 'Change Orders', type: 'output', description: 'May create CO' },
        { name: 'Schedule', type: 'bidirectional', description: 'Impact on schedule' },
        { name: 'Daily Logs', type: 'input', description: 'Field conditions' },
        { name: 'Architect/Engineer', type: 'bidirectional', description: 'Route for response' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'rfi_number', type: 'integer', required: true, description: 'Sequential number' },
        { name: 'subject', type: 'string', required: true, description: 'Brief subject' },
        { name: 'question', type: 'text', required: true, description: 'Detailed question' },
        { name: 'drawing_reference', type: 'string', description: 'Related drawing' },
        { name: 'spec_reference', type: 'string', description: 'Related spec section' },
        { name: 'assigned_to', type: 'string', description: 'Architect, Engineer, Owner' },
        { name: 'due_date', type: 'date', description: 'Response due' },
        { name: 'response', type: 'text', description: 'Answer received' },
        { name: 'response_date', type: 'date', description: 'When answered' },
        { name: 'cost_impact', type: 'boolean', description: 'Has cost impact' },
        { name: 'schedule_impact', type: 'boolean', description: 'Has schedule impact' },
        { name: 'status', type: 'string', required: true, description: 'Open, Answered, Closed' },
        { name: 'created_by', type: 'uuid', description: 'Submitted by' },
      ]}
      aiFeatures={[
        {
          name: 'Similar RFI Search',
          description: 'Finds related answers. "Similar question on Johnson project answered: use 2x6 blocking at 16\" OC."',
          trigger: 'On RFI creation'
        },
        {
          name: 'Impact Assessment',
          description: 'Predicts impact. "Window header detail RFI: Average response time 5 days. May delay framing start."',
          trigger: 'On submission'
        },
        {
          name: 'Follow-up Automation',
          description: 'Manages responses. "RFI #12 overdue by 3 days. Auto-reminder sent to architect."',
          trigger: 'Daily check'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ RFIs - Smith Residence                          Total: 15 RFIs      │
├─────────────────────────────────────────────────────────────────────┤
│ Status: [All ▾]    Assigned: [All ▾]                   [+ New RFI] │
├─────────────────────────────────────────────────────────────────────┤
│ OPEN - AWAITING RESPONSE (3)                                        │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ RFI #15 - Window Header Detail                   Due: Jan 30    │ │
│ │ Question: Clarify header size for 8' slider on east elevation   │ │
│ │ Drawing: A-201 Detail 4 | Assigned to: Architect                │ │
│ │ ⚠ Impact: May delay framing if not answered by Feb 1           │ │
│ │ [View] [Send Reminder]                                          │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ RFI #14 - HVAC Duct Routing                      Due: Feb 2     │ │
│ │ Conflict between duct and beam at grid line C                   │ │
│ │ Assigned to: Engineer | Status: Under Review                    │ │
│ │ [View] [Send Reminder]                                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ RECENTLY ANSWERED                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ RFI #13 - Tile Layout Master Bath              ✓ Answered Jan 25│ │
│ │ Response: Center on window, use bullnose at edges               │ │
│ │ Cost Impact: None | [View Full Response]                        │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ RFI #12 - Electrical Panel Location            ✓ Answered Jan 22│ │
│ │ Response: Relocate to garage west wall per attached sketch      │ │
│ │ Cost Impact: Yes - CO #5 pending | [View Response]              │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Open: 3 | Answered: 12 | Avg Response: 4 days | Overdue: 0         │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
