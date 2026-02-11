'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Job', 'Schedule', 'Tasks', 'Daily Logs', 'Photos', 'Client Updates'
]

export default function ScheduleSkeleton() {
  return (
    <PageSpec
      title="Schedule"
      phase="Phase 0 - Foundation"
      planFile="views/field/SCHEDULE_LOGS_PHOTOS.md"
      description="Construction schedule with AI-powered duration learning, weather integration, and vendor reliability factoring. The schedule gets smarter with every job—learning actual durations by trade, vendor, and project type to improve future predictions."
      workflow={constructionWorkflow}
      features={[
        'Gantt chart with drag-and-drop task management',
        'Task dependencies (Finish-to-Start, Start-to-Start, lag time)',
        'Milestones for key dates (permits, inspections, client decisions)',
        'Resource assignment per task (vendors, crew, equipment)',
        'Progress tracking with % complete (auto-updates from daily logs)',
        'Critical path highlighting with float calculation',
        'Baseline comparison (planned vs actual with variance)',
        'Weather integration with automatic outdoor task flagging',
        'Tide chart integration for coastal waterfront work',
        'Calendar sync for team members',
        'Client-facing schedule view (simplified milestones)',
        'Vendor portal schedule view (their tasks only)',
        'Lead time tracking for long-lead items',
      ]}
      connections={[
        { name: 'Jobs', type: 'input', description: 'Schedule scoped to job' },
        { name: 'Tasks/Todos', type: 'bidirectional', description: 'Tasks can link to schedule items' },
        { name: 'Daily Logs', type: 'bidirectional', description: 'Logs auto-update task progress and actuals' },
        { name: 'Users', type: 'input', description: 'Resources assigned to tasks' },
        { name: 'Vendors', type: 'input', description: 'Vendor assignments with reliability data' },
        { name: 'Client Portal', type: 'output', description: 'Simplified schedule visible to client' },
        { name: 'Weather API', type: 'input', description: 'Weather data for planning and alerts' },
        { name: 'Tide API', type: 'input', description: 'Tide charts for waterfront scheduling' },
        { name: 'Notifications', type: 'output', description: 'Task reminders and delay alerts' },
        { name: 'Schedule Intelligence', type: 'bidirectional', description: 'Learns from actuals, predicts future durations' },
        { name: 'Selections', type: 'input', description: 'Selection deadlines trigger schedule constraints' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'name', type: 'string', required: true, description: 'Task name' },
        { name: 'phase', type: 'string', description: 'Phase grouping' },
        { name: 'start_date', type: 'date', required: true, description: 'Planned start' },
        { name: 'end_date', type: 'date', required: true, description: 'Planned end' },
        { name: 'actual_start', type: 'date', description: 'Actual start date' },
        { name: 'actual_end', type: 'date', description: 'Actual end date' },
        { name: 'percent_complete', type: 'decimal', description: 'Progress 0-100' },
        { name: 'is_milestone', type: 'boolean', description: 'Is this a milestone?' },
        { name: 'predecessor_id', type: 'uuid', description: 'Task dependency' },
        { name: 'lag_days', type: 'integer', description: 'Lag after predecessor' },
        { name: 'assigned_vendor_id', type: 'uuid', description: 'Assigned vendor' },
        { name: 'assigned_to', type: 'uuid[]', description: 'Assigned users' },
        { name: 'cost_code_id', type: 'uuid', description: 'Linked cost code' },
        { name: 'is_outdoor', type: 'boolean', description: 'Weather-sensitive task' },
        { name: 'is_tide_sensitive', type: 'boolean', description: 'Requires tide coordination' },
        { name: 'ai_predicted_duration', type: 'integer', description: 'AI-predicted days' },
        { name: 'notes', type: 'text', description: 'Task notes' },
      ]}
      aiFeatures={[
        {
          name: 'Duration Learning',
          description: 'Learns actual durations from daily logs and completed tasks. "Framing on 3,500 SF elevated homes with ABC Framing averages 18 days (your template shows 14). Adjusting future schedules." Factors: SF, complexity, vendor, season.',
          trigger: 'On task completion, continuous learning'
        },
        {
          name: 'Vendor Reliability Adjustment',
          description: 'Factors vendor historical performance into scheduling: "XYZ Plumbing typically starts 2 days late on rough-ins. Schedule adjusted to match reality." Shows reliability score per vendor/task type.',
          trigger: 'On vendor assignment'
        },
        {
          name: 'Weather Integration',
          description: 'Auto-flags outdoor tasks when weather threatens: "Rain forecast Thursday-Friday. Exterior stucco task at risk—consider rescheduling or prepping for weather protection." Logs weather delays automatically.',
          trigger: 'Daily weather check'
        },
        {
          name: 'Tide Chart Integration',
          description: 'For coastal waterfront jobs, integrates tide schedules: "Concrete pour for seawall requires low tide. Next suitable windows: Dec 15 (6am-10am), Dec 16 (7am-11am), Dec 29 (5am-9am)."',
          trigger: 'On tide-sensitive task scheduling'
        },
        {
          name: 'Completion Prediction',
          description: 'Predicts project completion with confidence intervals: "85% likely to complete by March 15, 95% by April 1. Critical path: Windows (lead time) → Drywall → Trim." Updates daily based on progress.',
          trigger: 'Daily recalculation'
        },
        {
          name: 'Critical Path Optimization',
          description: 'Identifies schedule float and suggests task reordering: "Moving HVAC rough before electrical rough saves 3 days on critical path. No resource conflicts detected."',
          trigger: 'On schedule analysis'
        },
        {
          name: 'Selection Deadline Enforcement',
          description: 'Auto-calculates selection deadlines from construction schedule: "Client must select tile by Jan 15 or drywall phase delays. Current lead time: 6 weeks. Selection request sent Dec 1—no response in 14 days."',
          trigger: 'On schedule creation and selection changes'
        },
        {
          name: 'Cascade Impact Analysis',
          description: 'When a task slips, shows full downstream impact: "Framing delay of 5 days cascades to: MEP Rough (+5), Insulation (+5), Drywall (+5), final completion pushed from Mar 15 to Mar 20."',
          trigger: 'On task date change'
        },
        {
          name: 'Resource Conflict Detection',
          description: 'Identifies when same vendor/crew is double-booked across jobs: "ABC Electric assigned to Smith (rough-in Dec 15-20) and Johnson (service upgrade Dec 18-19). Conflict detected."',
          trigger: 'On assignment'
        },
        {
          name: 'Daily Log Auto-Update',
          description: 'Automatically marks tasks in-progress or complete from daily log entries: "Daily log mentions \'Started framing walls today\'—marking Wall Framing as started (Dec 18)." Suggests updates for review.',
          trigger: 'On daily log save'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Schedule - Smith Residence        [+ Task] [Baseline] [Export]      │
├─────────────────────────────────────────────────────────────────────┤
│ Predicted Completion: Mar 15 (85% conf) | Weather: ⚠ Rain Thu-Fri   │
│ View: Gantt | List | Calendar                    Nov | Dec | Jan    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ TASK                   │ Nov        │ Dec           │ Jan           │
│ ──────────────────────┼────────────┼───────────────┼───────────────│
│ Foundation            │ ████████   │               │               │
│   Excavation          │ ████       │               │               │
│   Pilings (Tides!)    │   ▓▓▓▓     │               │ ← Low tide req│
│   Grade Beams         │       ████ │               │               │
│ ◆ Foundation Complete │         ◆  │               │               │
│ Framing               │            │ ██████████████│               │
│   Floor System        │            │ ███           │               │
│   Walls               │            │    ████       │ ← ABC: +2 days│
│   Roof (Complex)      │            │        ██████ │ ← AI: 18d typ │
│ ◆ Dried In            │            │              ◆│               │
│ Impact Windows        │ ░░░░░░░░░░░│░░░░░░░░░░░░░░░│██ ← 16wk lead │
│ Rough MEP             │            │              █│████           │
│   ⚠ Rain Risk Thu-Fri │            │            ⚠⚠│               │
│                                                                     │
│ ◆ Milestone | █ Actual | ░ Lead Time | ⚠ Weather Risk | ▓ Tide Req │
│ Red = Critical Path | AI suggests: "Move HVAC before Elec = -3 days"│
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
