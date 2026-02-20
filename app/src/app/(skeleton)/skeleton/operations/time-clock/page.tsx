'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { TimeClockPreview } from '@/components/skeleton/previews/time-clock-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const timeClockWorkflow = ['Clock In', 'Allocate Time', 'Submit Timesheet', 'Approve', 'Export to Payroll']

export default function TimeClockPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? <TimeClockPreview /> : <PageSpec
      title="Time Tracking & Labor"
      phase="Phase 2 - Construction Core"
      planFile="views/operations/TIME-CLOCK.md"
      description="GPS-geotagged clock in/out, crew time entry, overtime calculation, approval workflows, and payroll export. Track labor hours by job, cost code, and worker with mobile-first design for field crews."
      workflow={timeClockWorkflow}
      features={[
        'GPS-geotagged clock in/out with geofence validation',
        'Per-job, per-cost-code time allocation',
        'Crew time entry by superintendent (bulk mode)',
        'Automatic overtime calculation (daily/weekly/double-time)',
        'State-specific overtime rules configuration',
        'Break tracking with auto-deduct and compliance alerts',
        'Multi-step approval workflow (super → PM → admin)',
        'Timesheet dispute and correction workflow',
        'Payroll export (CSV, ADP, Gusto, QuickBooks)',
        'Certified payroll report generation (prevailing wage)',
        'Labor cost auto-posting to job budgets',
        'Mobile-first clock-in with offline support',
        'Photo verification at clock-in/out',
        'Real-time crew location and status dashboard',
        'Attendance and punctuality tracking',
        'Hours vs budget comparison per job',
        'AI overtime prediction and alerts',
        'AI anomaly detection for buddy punching',
      ]}
      connections={[
        { name: 'Daily Logs', type: 'bidirectional', description: 'Crew hours sync with daily log attendance' },
        { name: 'Budget & Cost Tracking', type: 'output', description: 'Labor costs flow to job budgets by cost code' },
        { name: 'Scheduling', type: 'input', description: 'Scheduled crews populate expected clock-ins' },
        { name: 'Native Accounting', type: 'output', description: 'Labor cost journal entries' },
        { name: 'HR & Workforce', type: 'bidirectional', description: 'Employee records, pay rates, certifications' },
        { name: 'Jobs', type: 'input', description: 'Job assignments and cost code structure' },
        { name: 'Notifications', type: 'output', description: 'Missing clock-out, overtime, approval alerts' },
        { name: 'Mobile App', type: 'bidirectional', description: 'Field clock-in/out and timesheet entry' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'company_id', type: 'uuid', required: true, description: 'Tenant company' },
        { name: 'user_id', type: 'uuid', required: true, description: 'Worker who clocked in' },
        { name: 'job_id', type: 'uuid', description: 'Job site for this entry' },
        { name: 'clock_in', type: 'timestamp', required: true, description: 'Clock-in time' },
        { name: 'clock_out', type: 'timestamp', description: 'Clock-out time (null = still clocked in)' },
        { name: 'clock_in_lat', type: 'decimal', description: 'GPS latitude at clock-in' },
        { name: 'clock_in_lng', type: 'decimal', description: 'GPS longitude at clock-in' },
        { name: 'clock_out_lat', type: 'decimal', description: 'GPS latitude at clock-out' },
        { name: 'clock_out_lng', type: 'decimal', description: 'GPS longitude at clock-out' },
        { name: 'total_hours', type: 'decimal', description: 'Calculated total hours' },
        { name: 'regular_hours', type: 'decimal', description: 'Regular hours (non-OT)' },
        { name: 'overtime_hours', type: 'decimal', description: 'Overtime hours (1.5x)' },
        { name: 'double_time_hours', type: 'decimal', description: 'Double-time hours (2x)' },
        { name: 'break_minutes', type: 'integer', description: 'Total break time in minutes' },
        { name: 'status', type: 'string', required: true, description: 'pending | submitted | approved | rejected | exported' },
        { name: 'approved_by', type: 'uuid', description: 'User who approved this entry' },
        { name: 'notes', type: 'text', description: 'Worker or approver notes' },
        { name: 'created_at', type: 'timestamp', required: true, description: 'Record created' },
        { name: 'updated_at', type: 'timestamp', required: true, description: 'Last updated' },
      ]}
      aiFeatures={[
        {
          name: 'Overtime Prediction',
          description: 'Predicts which workers will hit overtime thresholds based on current week hours and scheduled shifts. "Mike Johnson at 38 hrs — will hit OT by Wednesday."',
          trigger: 'Daily at 6 AM',
        },
        {
          name: 'Anomaly Detection',
          description: 'Flags unusual clock-in patterns that may indicate buddy punching, GPS spoofing, or data entry errors. "Clock-in for John Doe at 6:02 AM is 12 miles from job site."',
          trigger: 'On each clock-in',
        },
        {
          name: 'Labor Cost Forecasting',
          description: 'Projects labor costs for active jobs based on hours worked vs budget. "Harbor View project trending 12% over labor budget at current crew size."',
          trigger: 'Weekly report',
        },
        {
          name: 'Scheduling Optimization',
          description: 'Suggests crew assignments to minimize overtime and maximize productive hours. "Moving crew B from Smith to Harbor on Thursday avoids 16 hrs OT."',
          trigger: 'On schedule change',
        },
      ]}
      mockupAscii={`
+---------------------------------------------------------------------+
| Time Clock                    Week of Feb 16-22, 2026               |
+---------------------------------------------------------------------+
| [Active Now]   [Total Hours]  [Overtime]   [Pending Approval]       |
|     8 workers     342.5 hrs     18.5 hrs       12 entries           |
+---------------------------------------------------------------------+
| Search: [________________]  Status: [All v]  Job: [All v]           |
| [Active] [Submitted] [Approved] [Rejected]                         |
+---------------------------------------------------------------------+
| Worker           Job             In       Out      Hrs    OT  Status|
| Mike Johnson     Harbor View     6:00 AM  2:30 PM  8.5   0.5  Active|
| Sarah Chen       Smith Reno      6:30 AM  3:00 PM  8.5   0.5  Subm  |
| Carlos Rivera    Harbor View     5:45 AM  --:--    --     --   Active|
| Tom Williams     Warehouse       7:00 AM  3:30 PM  8.5   0.5  Appr  |
| Lisa Park        Smith Reno      6:15 AM  2:45 PM  8.5   0.5  Subm  |
+---------------------------------------------------------------------+
| AI: Mike Johnson at 38 hrs this week — will hit OT by Wednesday.    |
| Carlos Rivera clocked in 12 miles from Harbor View site.            |
+---------------------------------------------------------------------+
`}
    />}
    </div>
  )
}
