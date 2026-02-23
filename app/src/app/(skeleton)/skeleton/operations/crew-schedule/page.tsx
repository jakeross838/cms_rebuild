'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { CrewSchedulePreview } from '@/components/skeleton/previews/crew-schedule-preview'
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
      description="Multi-project resource allocation with drag-and-drop scheduling, conflict detection, and capacity optimization. Shows who is working where and when across all active projects. Tracks utilization, overtime, labor costs, certifications, and weather impacts. AI suggests optimal assignments and resolves conflicts."
      workflow={workflow}
      features={[
        'Weekly and monthly views with drag-and-drop assignment',
        'Rows by person, columns by day — color-coded by job',
        'FilterBar: search, role/trade filter, conflict/available/all tabs',
        'Utilization percentage per crew member with color thresholds (80%+/50-79%/<50%/>100%)',
        'Scheduled hours vs weekly hours with overtime tracking',
        'Labor cost column: rate x scheduled hours per crew member',
        'Conflict highlighting: double-booked crew members flagged with details',
        'PTO and light-duty status indicators',
        'Critical path task indicators on assignments',
        'Weather overlay: rain/wind days highlighted, outdoor work affected',
        'Certification tracking per crew member (OSHA, First Aid, trade-specific)',
        'Expired certification alerts (blocks job site access)',
        'Construction phase labels on assignments (Framing, Rough-In, MEP, etc.)',
        'Cross-project active jobs bar with phase indicators',
        'Two-week look-ahead view for resource planning',
        'Drag-and-drop reassignment with automatic conflict check',
        'Subcontractor scheduling alongside internal crew',
        'Vendor availability integration for multi-job coordination',
        'Template schedules for recurring work patterns',
        'Mobile access for field updates and confirmations',
        'Push notifications for schedule changes to affected crew',
        'Export schedule to PDF/Excel for field distribution',
      ]}
      connections={[
        { name: 'Team/HR', type: 'input', description: 'Available team members, roles, certifications, cost rates' },
        { name: 'Jobs', type: 'bidirectional', description: 'Job assignments with phase and task context' },
        { name: 'Job Schedules', type: 'input', description: 'Scheduled tasks requiring crew assignment' },
        { name: 'Daily Logs', type: 'output', description: 'Planned vs actual hours comparison' },
        { name: 'Time Clock', type: 'bidirectional', description: 'Actual hours worked feeds utilization' },
        { name: 'Vendors', type: 'input', description: 'Subcontractor availability for multi-job coordination' },
        { name: 'Weather API', type: 'input', description: 'Forecast impacts on outdoor work assignments' },
        { name: 'Safety/Compliance', type: 'input', description: 'Certification requirements for job site access' },
        { name: 'Budget', type: 'output', description: 'Labor costs per job per crew member' },
        { name: 'Notifications', type: 'output', description: 'Schedule change alerts to affected crew and vendors' },
        { name: 'Operations Calendar', type: 'bidirectional', description: 'Unified calendar view of all assignments' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'employee_id', type: 'uuid', required: true, description: 'FK to team member' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to job' },
        { name: 'date', type: 'date', required: true, description: 'Work date' },
        { name: 'start_time', type: 'time', description: 'Scheduled start time' },
        { name: 'end_time', type: 'time', description: 'Scheduled end time' },
        { name: 'scheduled_hours', type: 'decimal', description: 'Planned hours' },
        { name: 'actual_hours', type: 'decimal', description: 'Actual hours worked' },
        { name: 'overtime_hours', type: 'decimal', description: 'Hours exceeding weekly limit' },
        { name: 'task', type: 'string', description: 'Specific task description' },
        { name: 'phase', type: 'string', description: 'Construction phase (Framing, Rough-In, etc.)' },
        { name: 'is_critical_path', type: 'boolean', description: 'Task is on critical path' },
        { name: 'cost_rate', type: 'decimal', description: 'Hourly cost rate for this assignment' },
        { name: 'status', type: 'enum', description: 'scheduled, confirmed, in_progress, completed, cancelled' },
        { name: 'weather_blocked', type: 'boolean', description: 'Blocked by weather conditions' },
        { name: 'notes', type: 'text', description: 'Assignment notes' },
      ]}
      aiFeatures={[
        {
          name: 'Auto-Schedule & Optimization',
          description: 'Suggests optimal assignments based on skills, availability, proximity, and cost. "For framing next week: Assign Mike (most experience, $55/hr) and train Tom (needs hours, $45/hr). Labor cost: $3,200 vs $3,600 if using overtime."',
          trigger: 'On demand and on new task creation'
        },
        {
          name: 'Conflict Detection & Resolution',
          description: 'Identifies double-bookings and suggests resolutions with cost impact. "Sarah booked on Smith + Harbor View Tuesday. Recommend: Move Smith budget review to Tom (available, saves $20/hr rate differential)."',
          trigger: 'On assignment change'
        },
        {
          name: 'Capacity Planning',
          description: 'Forecasts resource needs based on upcoming schedule. "Next month: 3 jobs in framing phase simultaneously. Current capacity: 2 framing crews. Options: (1) hire temp crew $4K/week, (2) stagger starts 1 week apart."',
          trigger: 'Weekly forecast'
        },
        {
          name: 'Utilization Analysis',
          description: 'Tracks efficiency with cost implications. "Mike: 80% utilized, 0h overtime. Tom: 60% (16h available) — recommend additional Davis demo assignments. Luis: 40% light-duty, assign cleanup tasks only."',
          trigger: 'Real-time dashboard'
        },
        {
          name: 'Certification Compliance',
          description: 'Monitors crew certifications and flags expirations. "Tom Williams First Aid cert expired Feb 1. Required for foreman role on active sites. Next available class: Feb 20. Interim: reassign to office tasks."',
          trigger: 'Daily check + on assignment'
        },
        {
          name: 'Weather-Aware Scheduling',
          description: 'Adjusts recommendations based on forecast. "Rain Wednesday: Carlos Harbor View concrete blocked. Redirect to Johnson interior support. Mike outdoor framing at risk — prepare indoor fallback tasks."',
          trigger: 'On weather forecast update'
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
