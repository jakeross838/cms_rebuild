'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Clock In', 'Work Entry', 'Job Assignment', 'Clock Out', 'Timesheet Review', 'Payroll Export'
]

export default function TimeClockSkeleton() {
  return (
    <PageSpec
      title="Time Clock"
      phase="Phase 4 - Time & Payments"
      planFile="views/time-clock/TIME_CLOCK.md"
      description="GPS-enabled time tracking for field workers. Clock in/out, track time per job and cost code, with supervisor review and payroll export."
      workflow={constructionWorkflow}
      features={[
        'Mobile-first clock in/out with GPS location',
        'Job and cost code assignment per time entry',
        'Photo capture at clock in/out (optional)',
        'Break tracking with configurable rules',
        'Overtime calculation with state-specific rules',
        'Supervisor timesheet review and approval',
        'Daily/weekly/pay period views',
        'Bulk time entry for office workers',
        'Integration with payroll systems',
        'Geofencing for job site verification',
      ]}
      connections={[
        { name: 'Users', type: 'input', description: 'Time tracked per employee' },
        { name: 'Jobs', type: 'input', description: 'Time assigned to jobs' },
        { name: 'Cost Codes', type: 'input', description: 'Time categorized by cost code' },
        { name: 'Daily Logs', type: 'output', description: 'Time data feeds daily logs' },
        { name: 'Budget', type: 'output', description: 'Labor costs update budget actuals' },
        { name: 'Payroll', type: 'output', description: 'Export to payroll systems' },
        { name: 'Reports', type: 'output', description: 'Labor reports and analysis' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'user_id', type: 'uuid', required: true, description: 'FK to users' },
        { name: 'job_id', type: 'uuid', description: 'FK to jobs' },
        { name: 'cost_code_id', type: 'uuid', description: 'FK to cost codes' },
        { name: 'clock_in', type: 'timestamp', required: true, description: 'Clock in time' },
        { name: 'clock_out', type: 'timestamp', description: 'Clock out time' },
        { name: 'clock_in_location', type: 'point', description: 'GPS coordinates at clock in' },
        { name: 'clock_out_location', type: 'point', description: 'GPS coordinates at clock out' },
        { name: 'clock_in_photo', type: 'string', description: 'Photo URL at clock in' },
        { name: 'break_minutes', type: 'integer', description: 'Total break time' },
        { name: 'total_hours', type: 'decimal', description: 'Calculated work hours' },
        { name: 'hourly_rate', type: 'decimal', description: 'Employee hourly rate' },
        { name: 'status', type: 'string', required: true, description: 'Active, Pending Review, Approved, Rejected' },
        { name: 'notes', type: 'text', description: 'Work notes' },
      ]}
      aiFeatures={[
        { name: 'Location Verification', description: 'Verifies clock in location matches job site address', trigger: 'On clock in' },
        { name: 'Anomaly Detection', description: 'Flags unusual time entries (too long, wrong location, patterns)', trigger: 'On timesheet review' },
        { name: 'Break Reminders', description: 'Reminds workers to take required breaks per state law', trigger: 'During shift' },
        { name: 'Cost Code Suggestion', description: 'Suggests cost code based on job phase and worker role', trigger: 'On clock in' },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Time Clock                          Week of Dec 16, 2024  [< >]     │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: My Time | Team (Supervisor) | Pending Approval               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  CLOCK STATUS: Not Clocked In                              │     │
│  │  [ CLOCK IN ]                                              │     │
│  │  Job: [Select Job ▾]  Cost Code: [Select ▾]                │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  THIS WEEK                                                          │
│  ┌────────┬──────────────┬────────────┬─────────┬─────────────────┐ │
│  │ Day    │ Job          │ In - Out   │ Hours   │ Status          │ │
│  ├────────┼──────────────┼────────────┼─────────┼─────────────────┤ │
│  │ Mon    │ Smith Home   │ 7am - 4pm  │ 8.0     │ ● Approved      │ │
│  │ Tue    │ Smith Home   │ 7am - 5pm  │ 9.0     │ ● Approved      │ │
│  │ Wed    │ Johnson Res  │ 6:30a-3:30p│ 8.0     │ ● Pending       │ │
│  │ Thu    │ ---          │ ---        │ ---     │ (Today)         │ │
│  └────────┴──────────────┴────────────┴─────────┴─────────────────┘ │
│                                                                     │
│  Week Total: 25.0 hrs  |  Overtime: 1.0 hrs                         │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
