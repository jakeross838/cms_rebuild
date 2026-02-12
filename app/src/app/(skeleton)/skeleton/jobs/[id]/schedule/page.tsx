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
          description="Construction schedule with AI-powered duration learning, weather integration, and vendor reliability factoring."
          workflow={constructionWorkflow}
          features={[
            'Gantt chart with drag-and-drop task management',
            'Task dependencies (Finish-to-Start, Start-to-Start, lag time)',
            'Critical path highlighting with float calculation',
            'Weather integration with automatic outdoor task flagging',
            'Tide chart integration for coastal waterfront work',
            'Lead time tracking for long-lead items',
          ]}
          connections={[
            { name: 'Jobs', type: 'input', description: 'Schedule scoped to job' },
            { name: 'Daily Logs', type: 'bidirectional', description: 'Logs auto-update task progress' },
            { name: 'Vendors', type: 'input', description: 'Vendor assignments with reliability data' },
            { name: 'Weather API', type: 'input', description: 'Weather data for planning and alerts' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
            { name: 'name', type: 'string', required: true, description: 'Task name' },
            { name: 'start_date', type: 'date', required: true, description: 'Planned start' },
            { name: 'end_date', type: 'date', required: true, description: 'Planned end' },
            { name: 'percent_complete', type: 'decimal', description: 'Progress 0-100' },
          ]}
          aiFeatures={[
            { name: 'Duration Learning', description: 'Learns actual durations from daily logs and completed tasks.', trigger: 'On task completion' },
            { name: 'Weather Integration', description: 'Auto-flags outdoor tasks when weather threatens.', trigger: 'Daily weather check' },
            { name: 'Completion Prediction', description: 'Predicts project completion with confidence intervals.', trigger: 'Daily recalculation' },
          ]}
        />
      )}
    </div>
  )
}
