'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { TodosPreview } from '@/components/skeleton/previews/todos-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Task Creation', 'Todo Lists', 'Task Board', 'Assignments', 'Notifications', 'Reports'
]

export default function TodoListsSkeleton() {
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
      {activeTab === 'preview' ? <TodosPreview /> : <PageSpec
        title="Tasks & Todos"
        phase="Phase 1 - Foundation"
        planFile="views/tasks/TODO_LISTS.md"
        description="Cross-project task management for construction teams. Create, assign, and track tasks with subtasks, recurring schedules, and cross-module linking. Integrates with My Day view (GAP-528/1028) for priority-sorted daily action queue. Tasks originate from manual creation, schedule items, inspections, RFIs, punch lists, change orders, daily logs, and AI suggestions."
        workflow={constructionWorkflow}
        features={[
          'List view and Kanban board view toggle (GAP-876)',
          'Task creation with title, description, due date, priority, category',
          'Assign tasks to team members with workload visibility',
          'Link tasks to jobs, vendors, clients, schedule tasks, daily logs, cost codes (cross-module refs)',
          'Subtask support with progress bars and inline checklist (GAP-876)',
          'Recurring task templates with configurable schedules (daily, weekly, monthly)',
          'Source module tracking: manual, schedule, daily-log, RFI, inspection, AI-suggested, punch-list, change-order',
          'Task comments and activity feed with comment count badges',
          'Due date reminders, overdue aging display (days overdue), and proactive alerts',
          'Filter by category, priority, assignee, job, source module, status',
          'Sort by title, priority, due date, assignee, status, category, created date',
          'Bulk task operations: reassign, reschedule, move status, archive (soft delete)',
          'Task ID system (TSK-001) for cross-module reference',
          'Tags for flexible categorization (user-controlled taxonomy)',
          'AI task intelligence: workload balancing, blocked task analysis, proactive suggestions',
          'Export task lists with filtered results',
          'Real-time sync indicator',
        ]}
        connections={[
          { name: 'Jobs', type: 'bidirectional', description: 'Tasks linked to jobs with job ID badges' },
          { name: 'Users', type: 'input', description: 'Tasks assigned to team members with workload tracking' },
          { name: 'Schedule', type: 'bidirectional', description: 'Tasks link to schedule items via SCH-IDs' },
          { name: 'Daily Logs', type: 'bidirectional', description: 'Tasks link to daily log entries via LOG-IDs' },
          { name: 'RFIs', type: 'input', description: 'RFI-originated tasks with RFI reference' },
          { name: 'Inspections', type: 'input', description: 'Inspection-originated tasks with inspection reference' },
          { name: 'Punch Lists', type: 'input', description: 'Punch list items generate follow-up tasks' },
          { name: 'Change Orders', type: 'input', description: 'Change orders generate review/action tasks' },
          { name: 'Vendors', type: 'input', description: 'Tasks linked to vendor follow-ups' },
          { name: 'Clients', type: 'input', description: 'Tasks linked to client communications' },
          { name: 'Notifications', type: 'output', description: 'Due date, assignment, and overdue notifications' },
          { name: 'Dashboard / My Day', type: 'output', description: 'Task metrics feed into dashboard and My Day view (GAP-528/1028)' },
          { name: 'AI Engine', type: 'input', description: 'AI suggests tasks based on project data and schedule' },
        ]}
        dataFields={[
          { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
          { name: 'task_number', type: 'string', required: true, description: 'Human-readable task ID (TSK-001)' },
          { name: 'title', type: 'string', required: true, description: 'Task title' },
          { name: 'description', type: 'text', description: 'Detailed task description' },
          { name: 'status', type: 'string', required: true, description: 'Todo, In Progress, Blocked, Done, Cancelled' },
          { name: 'priority', type: 'string', description: 'Urgent, High, Medium, Low' },
          { name: 'category', type: 'string', description: 'Job-related, Admin, Follow-ups, Inspections, Procurement' },
          { name: 'due_date', type: 'date', description: 'Task due date' },
          { name: 'assigned_to', type: 'uuid', description: 'Assigned user ID' },
          { name: 'job_id', type: 'uuid', description: 'Linked job' },
          { name: 'vendor_id', type: 'uuid', description: 'Linked vendor' },
          { name: 'client_id', type: 'uuid', description: 'Linked client' },
          { name: 'parent_id', type: 'uuid', description: 'Parent task for subtasks' },
          { name: 'source_module', type: 'string', description: 'Origin: manual, schedule, rfi, inspection, ai-suggested, etc.' },
          { name: 'source_ref_id', type: 'string', description: 'Reference ID from source module (SCH-0892, RFI-012, etc.)' },
          { name: 'is_recurring', type: 'boolean', description: 'Whether task recurs on a schedule' },
          { name: 'recurring_schedule', type: 'string', description: 'Cron or human-readable recurrence pattern' },
          { name: 'comment_count', type: 'integer', description: 'Number of comments on task' },
          { name: 'tags', type: 'text[]', description: 'User-defined tags for flexible categorization' },
          { name: 'position', type: 'integer', description: 'Order in list or Kanban column' },
          { name: 'completed_at', type: 'timestamp', description: 'When task was completed' },
          { name: 'created_by', type: 'uuid', required: true, description: 'User who created task' },
          { name: 'created_at', type: 'timestamp', required: true, description: 'When task was created' },
          { name: 'archived_at', type: 'timestamp', description: 'Soft delete timestamp' },
        ]}
        aiFeatures={[
          { name: 'Task Suggestions', description: 'AI suggests tasks based on project phase, schedule milestones, and upcoming deadlines. Example: "Based on the Smith Residence schedule, you should create a task for ordering countertop material by Feb 20 to meet the cabinet install date."', trigger: 'On new job phase or milestone approach' },
          { name: 'Workload Balancing', description: 'AI detects team member overload and suggests delegation. Example: "Sarah M. has 5 open tasks including 3 high-priority items due this week. Consider delegating TSK-002."', trigger: 'Daily analysis' },
          { name: 'Blocked Task Analysis', description: 'AI identifies task dependencies and explains blockages. Example: "TSK-010 (Draw Request #4) is blocked -- the framing milestone inspection needs to pass first."', trigger: 'On status change to blocked' },
          { name: 'Due Date Optimization', description: 'Suggests optimal due dates based on team workload, task dependencies, and vendor lead times.', trigger: 'On task creation' },
          { name: 'Smart Assignment', description: 'Recommends assignees based on task type, team availability, and historical task completion data.', trigger: 'On task creation' },
          { name: 'Overdue Risk Alerts', description: 'Proactive notifications about tasks at risk of becoming overdue based on progress rate and remaining work.', trigger: 'Daily analysis' },
        ]}
        mockupAscii={`
┌──────────────────────────────────────────────────────────────────────┐
│ Tasks & Todos           [List|Board]  [Export]  [+ New Task]         │
│ 15 total | 8 to do | 3 in progress | 1 blocked | 1 overdue          │
├──────────────────────────────────────────────────────────────────────┤
│ Stats: [15 Total] [13% Done] [8 Todo] [3 Active] [1 Blocked] [1 OD] │
├──────────────────────────────────────────────────────────────────────┤
│ Search: [___________] | All|Todo|Progress|Blocked|Done               │
│ Category ▾ | Priority ▾ | Assignee ▾ | Job ▾ | Source ▾ | Sort ▾    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ v INSPECTIONS (2)                              0/2 complete    1 OD  │
│ ┌────────────────────────────────────────────────────────────────┐   │
│ │ TSK-001 [Inspection] [Recurring: -]                            │   │
│ │ [x] Review electrical rough inspection report                  │   │
│ │ Subtasks: 1/3 [====----]  Comments: 3                          │   │
│ │ Smith Residence JOB-2024-015 | SCH-0892 | #electrical          │   │
│ │ Jake R. | Feb 12 (today!) | Urgent | In Progress               │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ v JOB RELATED (4)                              0/4 complete          │
│ v ADMIN / FINANCIAL (4)                        1/4 complete          │
│ v FOLLOW-UPS (2)                               0/2 complete          │
│ v PROCUREMENT (1)                              0/1 complete          │
├──────────────────────────────────────────────────────────────────────┤
│ AI: [Workload] Sarah has 5 tasks, 3 high-priority this week.        │
│     [Blocked]  TSK-010 needs inspection to pass first.              │
│     [Suggest]  Create "Order countertop" by Feb 20 for cabinet date │
│     [+ Create Suggested] [Delegate] [Snooze] [Dismiss]             │
├──────────────────────────────────────────────────────────────────────┤
│ 15 of 15 tasks | 3 recurring | 14 subtasks total | Synced: just now │
└──────────────────────────────────────────────────────────────────────┘
`}
      />}
    </div>
  )
}
