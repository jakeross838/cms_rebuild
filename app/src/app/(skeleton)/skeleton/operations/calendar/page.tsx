'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { CalendarPreview } from '@/components/skeleton/previews/calendar-preview'
import { cn } from '@/lib/utils'

export default function CompanyCalendarPage() {
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
      {activeTab === 'preview' ? <CalendarPreview /> : <PageSpec
      title="Operations Calendar"
      phase="Phase 1 - Operations"
      planFile="views/operations/CALENDAR.md"
      description="Multi-project operations calendar with weather integration, critical path tracking, and schedule health monitoring. Unified view of work tasks, inspections, deliveries, milestones, deadlines, and meetings across all active jobs. Weather overlay blocks outdoor work automatically based on configurable trade-specific rules."
      workflow={['Morning Review', 'Filter by Job/Type', 'Check Weather Impact', 'Resolve Conflicts', 'End-of-Day Updates', 'Tomorrow Prep']}
      features={[
        'Month, week, day, and agenda views with configurable default',
        'Color-coded by job with event type icons (work, inspection, delivery, milestone, deadline, meeting)',
        'FilterBar: search, job filter, event type tabs, critical path filter',
        'Critical path task highlighting with cascading delay indicator',
        'Milestone and deadline tracking with overdue highlighting',
        'Blocked task visualization (weather, dependency, resource)',
        'Weather overlay: 7-14 day forecast at project location from weather API',
        'Trade-specific weather rules: rain blocks concrete/roofing, wind blocks crane, temp blocks masonry',
        'Weather impact days highlighted on calendar with affected task list',
        'Multi-project schedule health bar: on-track / at-risk / behind per job',
        'Two-week look-ahead report generation (printable, shareable with trades)',
        'Morning schedule dashboard: who goes where today, conflicts, weather',
        'Material delivery calendar with PO links and confirmation workflow',
        'Inspection calendar with inspector contacts and preparation checklists',
        'End-of-day schedule updates with drag-and-drop rescheduling',
        'Tomorrow preparation dashboard with vendor start confirmations',
        'Dependency cascade preview on schedule changes',
        'Holiday awareness with configurable regional calendar',
        'Work hour restrictions per municipality',
        'Subscribe via iCal feed',
        'Print/export calendar',
        'Click event to navigate to source module (schedule, permit, PO, etc.)',
      ]}
      connections={[
        { name: 'Job Schedules', type: 'bidirectional', description: 'All tasks, milestones, dependencies from project schedules' },
        { name: 'Inspections', type: 'input', description: 'Scheduled inspections with inspector contacts' },
        { name: 'Deliveries', type: 'input', description: 'Material deliveries linked to POs and vendors' },
        { name: 'Permits', type: 'input', description: 'Permit deadlines and inspection gates' },
        { name: 'Client Selections', type: 'input', description: 'Selection deadlines that gate downstream work' },
        { name: 'Insurance', type: 'input', description: 'COI expiration dates for scheduled vendors' },
        { name: 'Meetings', type: 'input', description: 'Client meetings, owner walkthroughs, vendor coordination' },
        { name: 'Weather API', type: 'input', description: '7-14 day forecasts with trade-specific impact rules' },
        { name: 'Crew Schedule', type: 'bidirectional', description: 'Resource assignments and availability' },
        { name: 'Daily Logs', type: 'output', description: 'Schedule progress feeds daily log entries' },
        { name: 'Vendor Availability', type: 'input', description: 'Vendor availability windows for conflict detection' },
        { name: 'Notifications', type: 'output', description: 'Schedule change alerts to affected trades and team' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'title', type: 'string', required: true, description: 'Event title' },
        { name: 'type', type: 'enum', required: true, description: 'work, inspection, delivery, meeting, milestone, deadline' },
        { name: 'start_date', type: 'timestamp', required: true, description: 'Start date/time' },
        { name: 'end_date', type: 'timestamp', description: 'End date/time' },
        { name: 'all_day', type: 'boolean', description: 'All day event flag' },
        { name: 'job_id', type: 'uuid', description: 'Associated job' },
        { name: 'source_type', type: 'string', description: 'Source module (schedule, permit, PO, etc.)' },
        { name: 'source_id', type: 'uuid', description: 'Source record FK' },
        { name: 'assigned_to', type: 'uuid[]', description: 'Team members assigned' },
        { name: 'vendor_id', type: 'uuid', description: 'Assigned vendor' },
        { name: 'location', type: 'string', description: 'Event location / job site address' },
        { name: 'phase', type: 'string', description: 'Construction phase' },
        { name: 'is_critical_path', type: 'boolean', description: 'On critical path' },
        { name: 'is_weather_sensitive', type: 'boolean', description: 'Affected by weather conditions' },
        { name: 'status', type: 'enum', description: 'scheduled, in_progress, completed, blocked, overdue' },
        { name: 'dependency_count', type: 'integer', description: 'Number of successor tasks' },
        { name: 'notes', type: 'text', description: 'Event notes' },
        { name: 'color', type: 'string', description: 'Display color (job-based)' },
      ]}
      aiFeatures={[
        {
          name: 'Conflict Detection',
          description: 'Identifies scheduling conflicts across projects. "County Inspector at Smith (9 AM) and Coastal Retreat (11 AM). Mike assigned to both — confirm inspector handles sequentially or reassign."',
          trigger: 'On calendar load and on schedule change'
        },
        {
          name: 'Weather Impact Analysis',
          description: 'Matches 7-day forecast to trade-specific rules. "Rain Thu Feb 13: 1.5 in, 20mph wind. Blocked: Harbor View concrete pour, Coastal Retreat roofing. Unaffected: Smith electrical (interior). Suggest: reschedule concrete to Mon Feb 17."',
          trigger: 'Daily forecast update'
        },
        {
          name: 'Critical Path Monitoring',
          description: 'Tracks critical path tasks across all projects. "Smith electrical rough-in is critical path — any delay shifts completion by equal days. Currently on track. Next critical: plumbing rough-in Feb 18."',
          trigger: 'Real-time on task status change'
        },
        {
          name: 'Schedule Health Scoring',
          description: 'Weekly scorecard across all projects. "Smith: on track (62% complete, 0 days drift). Johnson: at risk (45% complete, 3 days behind baseline). Coastal: behind (15% complete, permit deadline overdue)."',
          trigger: 'Weekly analysis + real-time on drift'
        },
        {
          name: 'Tomorrow Preparation',
          description: 'End-of-day briefing for next day. "Tomorrow: 4 tasks across 3 jobs. Vendor confirmations needed: ABC Electric (Smith), Jones Plumbing (Johnson). Material check: finish lumber delivery at 8 AM."',
          trigger: 'Daily at configurable time'
        },
        {
          name: 'Recovery Suggestions',
          description: 'When schedule slips, suggests recovery options. "Coastal Retreat 5 days behind. Options: (1) overlap framing and rough-in, (2) add Saturday crews, (3) fast-track permit review. Cost impact: $2K-$8K."',
          trigger: 'On schedule drift exceeding threshold'
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
    />}
    </div>
  )
}
