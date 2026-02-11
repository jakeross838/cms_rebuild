'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Job', 'Schedule', 'RFIs', 'Submittals', 'Documents', 'Communication'
]

export default function RFIsSkeleton() {
  return (
    <PageSpec
      title="RFIs"
      phase="Phase 3 - Advanced PM"
      planFile="views/bids/BIDS_RFIS_SUBMITTALS.md"
      description="Request for Information management with AI-powered similar RFI search and response drafting. The system learns from past RFIs to suggest answers, predict cost/schedule impact, and reduce response time. Every RFI feeds the project knowledge base."
      workflow={constructionWorkflow}
      features={[
        'RFI list with status filtering',
        'Create RFI with question and attachments',
        'Route to architect, engineer, owner, or consultant',
        'Track response time and SLA compliance',
        'Attach drawings, photos, specs, or markups',
        'Response with official answer and attachments',
        'Impact tracking (cost and schedule)',
        'Auto-generated RFI numbering system',
        'Email notifications to all parties',
        'Ball-in-court tracking (who owes response)',
        'Export RFI log for records',
        'Link to change orders when applicable',
        'Response deadline management',
      ]}
      connections={[
        { name: 'Jobs', type: 'input', description: 'RFI scoped to job' },
        { name: 'Documents', type: 'bidirectional', description: 'Attach drawings/specs, link to plan sheets' },
        { name: 'Schedule', type: 'output', description: 'RFI may cause delay' },
        { name: 'Change Orders', type: 'output', description: 'Answer may trigger CO' },
        { name: 'Email', type: 'output', description: 'Notifications to all parties' },
        { name: 'Communication', type: 'bidirectional', description: 'Discussion thread on RFI' },
        { name: 'Vendors', type: 'input', description: 'RFI may involve vendor input' },
        { name: 'Cost Intelligence', type: 'output', description: 'RFI impacts feed future estimates' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'rfi_number', type: 'integer', required: true, description: 'Sequential number' },
        { name: 'subject', type: 'string', required: true, description: 'RFI title' },
        { name: 'question', type: 'text', required: true, description: 'Detailed question' },
        { name: 'status', type: 'string', required: true, description: 'Draft, Submitted, Answered, Closed' },
        { name: 'assigned_to', type: 'string', description: 'Party responsible for answer' },
        { name: 'submitted_date', type: 'date', description: 'Date submitted' },
        { name: 'due_date', type: 'date', description: 'Answer due date' },
        { name: 'answered_date', type: 'date', description: 'Date answered' },
        { name: 'answer', type: 'text', description: 'Official response' },
        { name: 'cost_impact', type: 'decimal', description: 'Cost impact if any' },
        { name: 'schedule_impact', type: 'integer', description: 'Days of delay if any' },
        { name: 'change_order_id', type: 'uuid', description: 'Linked CO if applicable' },
        { name: 'attachments', type: 'jsonb', description: 'Question attachments' },
        { name: 'response_attachments', type: 'jsonb', description: 'Answer attachments' },
        { name: 'ai_similar_rfis', type: 'jsonb', description: 'AI-found similar RFIs' },
      ]}
      aiFeatures={[
        {
          name: 'Similar RFI Search',
          description: 'Instantly finds similar RFIs from past projects that may have relevant answers: "Found 3 similar RFIs about window header specifications. Smith Project RFI #8 had same question—architect responded with ASI #3 detail. View answer?"',
          trigger: 'On RFI creation'
        },
        {
          name: 'Response Drafting',
          description: 'AI drafts potential response based on specs, past answers, and project context: "Based on project specs (Section 08 14 00) and similar RFI responses, suggested answer: \'Use LVL header per structural drawing S-12, detail 3A.\' Review and edit before sending."',
          trigger: 'For answering party, on RFI receipt'
        },
        {
          name: 'Impact Assessment',
          description: 'Estimates potential cost and schedule impact based on RFI subject: "RFIs about structural changes historically result in: Avg cost impact: $4,200. Avg schedule impact: 3 days. This RFI involves window headers—moderate impact expected."',
          trigger: 'On RFI creation and review'
        },
        {
          name: 'Response Time Tracking',
          description: 'Monitors response times by party: "Architect avg response: 4.2 days. Engineer avg: 6.1 days. This RFI to architect, due in 3 days. Based on history, 68% chance of on-time response."',
          trigger: 'Real-time tracking'
        },
        {
          name: 'Change Order Prediction',
          description: 'Predicts if RFI will result in change order: "Based on subject matter and past patterns, this RFI has 75% likelihood of resulting in a change order. Avg CO from similar RFIs: $3,800."',
          trigger: 'On RFI creation'
        },
        {
          name: 'Escalation Alerts',
          description: 'Proactive alerts when RFIs are overdue: "RFI #12 overdue by 5 days. Work on window install blocked. Estimated delay cost: $850/day. Recommend escalation to architect principal."',
          trigger: 'When due date passes'
        },
        {
          name: 'Knowledge Base Building',
          description: 'Builds searchable knowledge base from all RFI answers: "Your RFI database contains 156 answered RFIs across 12 projects. Most common topics: Structural details (23%), MEP coordination (18%), Finish specifications (15%)."',
          trigger: 'Continuous learning'
        },
        {
          name: 'Specification Reference',
          description: 'Links RFI to relevant specification sections: "This RFI about window flashing relates to: Spec 07 62 00 (Sheet Waterproofing), Detail 8/A-6 (Window Head), and Drawing A-5.2. Attached to RFI for reference."',
          trigger: 'On RFI creation based on subject'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ RFIs - Smith Residence                   [+ New RFI] [Export Log]    │
├─────────────────────────────────────────────────────────────────────┤
│ Open: 4 | Avg Response: 4.2 days | Overdue: 1                       │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: All | Open | Pending Response | Closed                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌──────┬──────────────────────────┬──────────┬─────────┬──────────┐ │
│ │ RFI# │ Subject                  │ To       │ Due     │ Status   │ │
│ ├──────┼──────────────────────────┼──────────┼─────────┼──────────┤ │
│ │ 012  │ Window header spec       │ Architect│ Dec 20  │ ● Open   │ │
│ │      │ AI: "Found 3 similar—view answers?"            │ CO: 75% │ │
│ ├──────┼──────────────────────────┼──────────┼─────────┼──────────┤ │
│ │ 011  │ Foundation drain detail  │ Engineer │ Dec 15  │ ⚠ Overdue│ │
│ │      │ AI: "5 days late. Escalate?"                   │ $850/day│ │
│ ├──────┼──────────────────────────┼──────────┼─────────┼──────────┤ │
│ │ 010  │ HVAC duct routing        │ MEP Eng  │ Dec 10  │ ✓ Closed │ │
│ │      │ Impact: $2,400 cost, 2 days schedule          │ → CO #8 │ │
│ ├──────┼──────────────────────────┼──────────┼─────────┼──────────┤ │
│ │ 009  │ Cabinet finish selection │ Owner    │ Dec 8   │ ✓ Closed │ │
│ │      │ No impact                                      │          │ │
│ └──────┴──────────────────────────┴──────────┴─────────┴──────────┘ │
│                                                                     │
│ AI Summary: 1 RFI overdue (blocking work) | 1 likely to trigger CO  │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
