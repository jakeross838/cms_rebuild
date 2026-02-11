'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function JobCommunicationsPage() {
  return (
    <PageSpec
      title="Job Communications"
      phase="Phase 1 - Communication"
      planFile="views/jobs/COMMUNICATIONS.md"
      description="All communications related to this job in one place. Emails, messages, meeting notes, and client updates. Search across all communication history and never lose track of important decisions."
      workflow={['Communicate', 'Document', 'Search', 'Reference']}
      features={[
        'Communication timeline',
        'Email integration',
        'SMS/text log',
        'Meeting notes',
        'Client updates',
        'Decision log',
        'Search across all',
        'Filter by person',
        'Filter by type',
        'Attachment access',
        'Quick compose',
        'Thread view',
        'Important flag',
        'Export history',
      ]}
      connections={[
        { name: 'Clients', type: 'bidirectional', description: 'Client communication' },
        { name: 'Team', type: 'bidirectional', description: 'Team messages' },
        { name: 'Vendors', type: 'bidirectional', description: 'Vendor communication' },
        { name: 'Email', type: 'input', description: 'Auto-capture emails' },
        { name: 'RFIs', type: 'input', description: 'Related discussions' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'type', type: 'string', required: true, description: 'Email, SMS, Meeting, Note, Update' },
        { name: 'direction', type: 'string', description: 'Inbound, Outbound' },
        { name: 'from', type: 'string', description: 'Sender' },
        { name: 'to', type: 'jsonb', description: 'Recipients' },
        { name: 'subject', type: 'string', description: 'Subject line' },
        { name: 'content', type: 'text', required: true, description: 'Message content' },
        { name: 'timestamp', type: 'timestamp', required: true, description: 'When sent/received' },
        { name: 'attachments', type: 'jsonb', description: 'File attachments' },
        { name: 'is_important', type: 'boolean', description: 'Flagged important' },
        { name: 'related_to', type: 'uuid', description: 'Related item' },
        { name: 'related_type', type: 'string', description: 'RFI, CO, etc.' },
      ]}
      aiFeatures={[
        {
          name: 'Smart Search',
          description: 'Finds relevant history. "Search: window delivery. Found: 3 emails discussing delivery date change to Feb 15."',
          trigger: 'On search'
        },
        {
          name: 'Decision Extraction',
          description: 'Identifies key decisions. "Decision logged: Client approved upgraded windows per email Jan 20."',
          trigger: 'On email capture'
        },
        {
          name: 'Communication Summary',
          description: 'Summarizes history. "This week: 12 emails with client, 5 vendor calls, 2 site meetings. Key topic: selections."',
          trigger: 'On request'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Communications - Smith Residence               [+ New Message]      │
├─────────────────────────────────────────────────────────────────────┤
│ 🔍 Search communications...                                         │
│ Filter: [All Types ▾]  [All People ▾]  [This Month ▾]              │
├─────────────────────────────────────────────────────────────────────┤
│ RECENT COMMUNICATIONS                                               │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✉ Email from John Smith (Client)              Today 10:30 AM   │ │
│ │ RE: Selection Decisions                                         │ │
│ │ "We've decided to go with the upgraded impact windows..."       │ │
│ │ ⭐ Decision logged | [View Full] [Reply]                        │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 📞 Call with ABC Lumber                       Today 9:15 AM    │ │
│ │ Delivery confirmation                                           │ │
│ │ "Confirmed lumber delivery for Thursday 7am-9am"               │ │
│ │ [View Notes] [Follow Up]                                       │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 📋 Meeting Notes - Site Visit                 Yesterday         │ │
│ │ Attendees: Jake, Mike, John & Sarah Smith                      │ │
│ │ "Discussed kitchen layout change, client to confirm by Friday" │ │
│ │ [View Full Notes] [Action Items]                               │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ✉ Email to XYZ Electric                       Jan 26           │ │
│ │ RE: Rough-in Schedule                                           │ │
│ │ "Please confirm availability for Feb 5 start..."               │ │
│ │ [View Thread] [Follow Up]                                      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ This Month: 45 emails | 12 calls | 4 meetings | 3 decisions logged │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
