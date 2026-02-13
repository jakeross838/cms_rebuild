'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { SchedulePreview } from '@/components/skeleton/previews/schedule-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Job', 'Schedule', 'Tasks', 'Daily Logs', 'Photos', 'Client Updates'
]

export default function ScheduleSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <SchedulePreview />
      ) : (
        <PageSpec
          title="Schedule"
          phase="Phase 0 - Foundation"
          planFile="views/field/SCHEDULE_LOGS_PHOTOS.md"
          description="Production-quality Gantt chart with 3-tier hierarchy (Phase > Group > Items), 8 color-coded task types, dependency arrows, critical path highlighting, baseline vs actual comparison, weather strip, schedule health dashboard, two-week look-ahead, sub confirmation tracking, and extensive filtering."
          workflow={constructionWorkflow}
          features={[
            '3-tier collapsible hierarchy: Phase → Group → Items (tasks + checklists)',
            '8 color-coded task types: Construction, Inspection, Delivery, Deadline, Milestone, Survey, Meeting, Weather Hold',
            'Dependency arrows: FS/SS/FF/SF with lag, SVG overlay with arrowheads',
            'Critical path highlighting: red-tinted bars with connected dependency arrows',
            'Baseline comparison: faded ghost bars showing original plan vs current schedule',
            'Actual dates overlay: thin emerald bar showing real start/end above planned bar',
            'AI predicted end markers: dashed orange vertical line at predicted completion',
            'Weather strip: 14-day forecast icons aligned to timeline columns',
            'Today line: vertical dashed red marker at current date',
            'Zoom controls: Day / Week / Month with dynamic column headers',
            'Schedule health dashboard: overall %, days remaining, behind-baseline count, health indicator',
            'Two-week look-ahead panel: upcoming tasks grouped by week with status badges',
            'Sub confirmation tracking: Not Sent → Pending → Confirmed states with badges',
            'Variance indicators: ±days from baseline with trend arrows on each task',
            'Float display: total float badge on zero-float non-critical tasks',
            'Trade labels: trade/discipline shown per task row',
            'Progress % labels: percentage shown inside Gantt bars',
            'FilterBar: search, phase tabs, task type / status / vendor dropdowns',
            'Toggles: Critical Path Only, Hide Completed, Show Baselines',
            'Checklist items: checkbox rows (no Gantt bar) within groups',
            'Milestone diamonds: zero-duration emerald markers',
            'Aggregate bars: phase and group summary bars with weighted progress',
            'Cross-module links: Inspections, POs, Daily Logs referenced inline with badges',
            'Weekend shading on day-level zoom',
          ]}
          connections={[
            { name: 'Jobs', type: 'input', description: 'Schedule scoped to job' },
            { name: 'Daily Logs', type: 'bidirectional', description: 'Logs auto-update task progress, linked inline' },
            { name: 'Vendors', type: 'input', description: 'Vendor assignments with reliability data and sub confirmation' },
            { name: 'Weather API', type: 'input', description: '14-day forecast for outdoor task flagging and weather strip' },
            { name: 'Inspections', type: 'bidirectional', description: 'Inspection tasks linked to permit records' },
            { name: 'Purchase Orders', type: 'input', description: 'Delivery tasks linked to PO tracking' },
            { name: 'Punch List', type: 'bidirectional', description: 'Quality items linked to schedule tasks' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
            { name: 'phase_id', type: 'uuid', required: true, description: 'FK to schedule_phases' },
            { name: 'group_id', type: 'uuid', required: true, description: 'FK to schedule_groups' },
            { name: 'name', type: 'string', required: true, description: 'Task name' },
            { name: 'kind', type: 'enum', required: true, description: 'task | checklist' },
            { name: 'task_type', type: 'enum', description: '8 task types (construction, inspection, etc.)' },
            { name: 'trade', type: 'string', description: 'Trade/discipline (e.g., Concrete, Framing, Electrical)' },
            { name: 'start_date', type: 'date', description: 'Planned start' },
            { name: 'end_date', type: 'date', description: 'Planned end' },
            { name: 'actual_start_date', type: 'date', description: 'Actual start (from daily logs)' },
            { name: 'actual_end_date', type: 'date', description: 'Actual end (from daily logs)' },
            { name: 'baseline_start_date', type: 'date', description: 'Original planned start' },
            { name: 'baseline_end_date', type: 'date', description: 'Original planned end' },
            { name: 'ai_predicted_end_date', type: 'date', description: 'AI-predicted completion date' },
            { name: 'duration_days', type: 'integer', description: 'Duration in calendar days' },
            { name: 'percent_complete', type: 'decimal', description: 'Progress 0-100' },
            { name: 'total_float', type: 'integer', description: 'Total float in days' },
            { name: 'status', type: 'enum', description: 'not_started | in_progress | complete | blocked' },
            { name: 'is_critical_path', type: 'boolean', description: 'On critical path' },
            { name: 'sub_confirmation', type: 'enum', description: 'not_sent | pending | confirmed' },
            { name: 'vendor_id', type: 'uuid', description: 'FK to vendors' },
            { name: 'is_weather_sensitive', type: 'boolean', description: 'Flagged for weather impact' },
          ]}
          aiFeatures={[
            { name: 'Duration Learning', description: 'Learns actual durations from daily logs and completed tasks. Adjusts future estimates per trade and vendor.', trigger: 'On task completion' },
            { name: 'Weather Integration', description: 'Auto-flags outdoor tasks when weather threatens. Shows 14-day forecast strip with impact assessment.', trigger: 'Daily weather check' },
            { name: 'Completion Prediction', description: 'Predicts project and per-task completion with confidence intervals. Shows AI predicted end markers on Gantt bars.', trigger: 'Daily recalculation' },
            { name: 'Schedule Optimization', description: 'Suggests task reordering to shorten critical path without resource conflicts. Identifies float opportunities.', trigger: 'On dependency change' },
            { name: 'Vendor Reliability', description: 'Factors vendor historical performance into duration estimates. Flags unconfirmed subs approaching start dates.', trigger: 'On vendor assignment' },
            { name: 'Variance Analysis', description: 'Tracks baseline vs actual dates, computes variance trends, and flags tasks falling behind schedule.', trigger: 'On progress update' },
          ]}
        />
      )}
    </div>
  )
}
