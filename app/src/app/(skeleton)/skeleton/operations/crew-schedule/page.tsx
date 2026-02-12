'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { CrewSchedulePreview } from '@/components/skeleton/previews/crew-schedule-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const workflow = ['View Assignments', 'Drag to Assign', 'Check Capacity', 'Resolve Conflicts']

export default function CrewSchedulePage() {
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
      {activeTab === 'preview' ? <CrewSchedulePreview /> : <PageSpec
      title="Crew Schedule"
      phase="Phase 2 - Resource Management"
      planFile="views/operations/CREW_SCHEDULE.md"
      description="Resource allocation showing who's working where and when. Schedule team members and crews to jobs, view capacity, identify conflicts, and optimize resource utilization across all active projects."
      workflow={workflow}
      features={[
        'Weekly/monthly view',
        'Rows by person, columns by day',
        'Color-coded by job',
        'Drag and drop assignments',
        'Capacity indicators',
        'Conflict highlighting',
        'Availability tracking',
        'Time off integration',
        'Subcontractor scheduling',
        'Job requirements vs assigned',
        'Utilization reports',
        'Mobile access for field updates',
        'Push notifications for changes',
        'Template schedules',
      ]}
      connections={[
        { name: 'Team', type: 'input', description: 'Available team members' },
        { name: 'Jobs', type: 'bidirectional', description: 'Job assignments' },
        { name: 'Job Schedules', type: 'input', description: 'What work is scheduled' },
        { name: 'Daily Logs', type: 'output', description: 'Actual vs planned' },
        { name: 'Time Clock', type: 'bidirectional', description: 'Hours worked' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'employee_id', type: 'uuid', required: true, description: 'Team member' },
        { name: 'job_id', type: 'uuid', required: true, description: 'Assigned job' },
        { name: 'date', type: 'date', required: true, description: 'Work date' },
        { name: 'start_time', type: 'time', description: 'Start time' },
        { name: 'end_time', type: 'time', description: 'End time' },
        { name: 'hours', type: 'decimal', description: 'Scheduled hours' },
        { name: 'task', type: 'string', description: 'Specific task' },
        { name: 'notes', type: 'text', description: 'Notes' },
        { name: 'status', type: 'string', description: 'Scheduled, Confirmed, Completed' },
        { name: 'actual_hours', type: 'decimal', description: 'Actual hours worked' },
      ]}
      aiFeatures={[
        {
          name: 'Auto-Schedule',
          description: 'Suggests optimal assignments. "For framing next week: Assign Mike (most experience) and train Tom (needs hours)."',
          trigger: 'On demand'
        },
        {
          name: 'Conflict Detection',
          description: 'Identifies double-bookings. "Sarah assigned to 2 jobs on Tuesday. Recommend: Move Smith walkthrough to Wednesday."',
          trigger: 'On assignment'
        },
        {
          name: 'Capacity Planning',
          description: 'Forecasts resource needs. "Next month: 3 jobs in framing phase. May need temporary crew."',
          trigger: 'Weekly forecast'
        },
        {
          name: 'Utilization Analysis',
          description: 'Tracks efficiency. "Mike: 95% utilized. Tom: 65% utilized - has capacity for additional work."',
          trigger: 'On demand'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Crew Schedule                              Week of January 27, 2025 │
├─────────────────────────────────────────────────────────────────────┤
│ [◄ Prev]  [Today]  [Next ►]        View: [Week] [Month]            │
├─────────────────────────────────────────────────────────────────────┤
│ Team Member │ Mon    │ Tue    │ Wed    │ Thu    │ Fri    │ Util   │
├─────────────────────────────────────────────────────────────────────┤
│ Jake Ross   │ Smith  │ Smith  │ Johnson│ Smith  │ Office │ 100%   │
│             │ Site   │ Client │ Site   │ Inspec │        │        │
├─────────────────────────────────────────────────────────────────────┤
│ Sarah       │ Smith  │ ⚠ 2job│ Smith  │ Davis  │ Smith  │ 110%⚠  │
│             │ Budget │ Conflict│ Punch  │ Est    │ Close  │        │
├─────────────────────────────────────────────────────────────────────┤
│ Mike        │ Johnson│ Johnson│ Johnson│ Johnson│ PTO    │ 80%    │
│             │ Frame  │ Frame  │ Frame  │ Frame  │        │        │
├─────────────────────────────────────────────────────────────────────┤
│ Tom         │ Smith  │ Smith  │ ---    │ Davis  │ Davis  │ 60%    │
│             │ Photos │ Logs   │ Avail  │ Demo   │ Demo   │        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Legend: 🏠 Site Visit  📋 Admin  ⚠ Conflict  --- Available         │
├─────────────────────────────────────────────────────────────────────┤
│ AI: "Sarah overbooked Tuesday. Tom has availability - reassign      │
│ Smith punch list walkthrough to Tom?"                               │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
