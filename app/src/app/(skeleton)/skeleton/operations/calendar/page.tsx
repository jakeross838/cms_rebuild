'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function CompanyCalendarPage() {
  return (
    <PageSpec
      title="Company Calendar"
      phase="Phase 1 - Operations"
      planFile="views/operations/CALENDAR.md"
      description="Master calendar showing all important dates across all jobs. View milestones, inspections, deliveries, deadlines, and meetings in one unified calendar. Filter by job, type, or team member."
      workflow={['View Events', 'Filter/Search', 'Click for Details', 'Navigate to Source']}
      features={[
        'Month, week, day, and agenda views',
        'Color-coded by event type',
        'Filter by job',
        'Filter by event type (milestone, inspection, delivery, deadline)',
        'Filter by team member',
        'Click event to see details',
        'Link to source (job schedule, permit, etc.)',
        'Today indicator',
        'Overdue items highlighted',
        'Print/export calendar',
        'Subscribe via iCal',
        'Weather overlay',
        'Holiday awareness',
        'Quick add events',
      ]}
      connections={[
        { name: 'Job Schedules', type: 'input', description: 'Milestones from all jobs' },
        { name: 'Inspections', type: 'input', description: 'Scheduled inspections' },
        { name: 'Deliveries', type: 'input', description: 'Material deliveries' },
        { name: 'Permits', type: 'input', description: 'Permit deadlines' },
        { name: 'Client Selections', type: 'input', description: 'Selection deadlines' },
        { name: 'Insurance', type: 'input', description: 'Expiration dates' },
        { name: 'Meetings', type: 'input', description: 'Scheduled meetings' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'title', type: 'string', required: true, description: 'Event title' },
        { name: 'type', type: 'string', required: true, description: 'Event type' },
        { name: 'start_date', type: 'timestamp', required: true, description: 'Start date/time' },
        { name: 'end_date', type: 'timestamp', description: 'End date/time' },
        { name: 'all_day', type: 'boolean', description: 'All day event' },
        { name: 'job_id', type: 'uuid', description: 'Associated job' },
        { name: 'source_type', type: 'string', description: 'Source module' },
        { name: 'source_id', type: 'uuid', description: 'Source record' },
        { name: 'assigned_to', type: 'uuid[]', description: 'Team members' },
        { name: 'location', type: 'string', description: 'Location' },
        { name: 'notes', type: 'text', description: 'Notes' },
        { name: 'color', type: 'string', description: 'Display color' },
        { name: 'is_overdue', type: 'boolean', description: 'Past due' },
      ]}
      aiFeatures={[
        {
          name: 'Conflict Detection',
          description: 'Identifies scheduling conflicts. "2 inspections scheduled same time at different jobs. Mike assigned to both."',
          trigger: 'On calendar load'
        },
        {
          name: 'Workload View',
          description: 'Shows team workload by day. "Tuesday is heavy: 3 inspections, 2 deliveries, 1 client meeting."',
          trigger: 'On demand'
        },
        {
          name: 'Weather Alerts',
          description: 'Flags outdoor work on bad weather days. "Rain forecasted Thursday. 2 jobs have outdoor work scheduled."',
          trigger: 'Daily forecast check'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Company Calendar                                     January 2025   │
├─────────────────────────────────────────────────────────────────────┤
│ View: [Month] [Week] [Day] [Agenda]    Filter: [All Jobs ▾] [All ▾]│
├─────────────────────────────────────────────────────────────────────┤
│ Sun     Mon      Tue       Wed       Thu       Fri       Sat       │
├─────────────────────────────────────────────────────────────────────┤
│         27       28        29        30        31        1         │
│                  ┌────┐    ┌────┐              ┌────┐              │
│                  │Insp│    │Mile│              │Delv│              │
│                  │Smith    │Smith              │John│              │
│                  │Frame    │Drywall            │Wind│              │
│                  └────┘    └────┘              └────┘              │
├─────────────────────────────────────────────────────────────────────┤
│ 2        3        4         5         6         7        8         │
│ ┌────┐                     ┌────┐    ┌────┐                        │
│ │Dead│                     │Meet│    │Insp│                        │
│ │Tile│                     │John│    │Smith                        │
│ │Sel │                     │Clnt│    │Elect                        │
│ └────┘                     └────┘    └────┘                        │
├─────────────────────────────────────────────────────────────────────┤
│ Legend: 🔵 Milestone  🟢 Inspection  🟡 Delivery  🔴 Deadline      │
│         🟣 Meeting    ⚠️ Overdue                                    │
├─────────────────────────────────────────────────────────────────────┤
│ AI: "Busy week ahead: 8 events across 3 jobs. Thursday has          │
│ potential conflict - 2 inspections need same PM."                   │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
