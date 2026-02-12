'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { TodosPreview } from '@/components/skeleton/previews/todos-preview'

const constructionWorkflow = [
  'Task Creation', 'Todo Lists', 'Task Board', 'Assignments', 'Notifications', 'Reports'
]

export default function TodoListsSkeleton() {
  const [activeTab, setActiveTab] = useState<'overview' | 'preview'>('overview')

  return (
    <PageSpec
      title="Todo Lists"
      phase="Phase 1 - Communication"
      planFile="views/tasks/TODO_LISTS.md"
      description="Task management system for construction teams. Create, assign, and track tasks across jobs with due dates, priorities, and completion tracking."
      workflow={constructionWorkflow}
      features={[
        'List view and Kanban board view toggle',
        'Task creation with title, description, due date, priority',
        'Assign tasks to team members',
        'Link tasks to jobs, cost codes, or other entities',
        'Task templates for recurring work',
        'Subtask support for breaking down work',
        'Due date reminders and notifications',
        'Task comments and activity feed',
        'Filter by assignee, job, status, priority',
        'Bulk task operations',
      ]}
      connections={[
        { name: 'Jobs', type: 'bidirectional', description: 'Tasks can be linked to jobs' },
        { name: 'Users', type: 'input', description: 'Tasks assigned to team members' },
        { name: 'Schedule', type: 'bidirectional', description: 'Tasks can link to schedule items' },
        { name: 'Notifications', type: 'output', description: 'Due date and assignment notifications' },
        { name: 'Daily Logs', type: 'bidirectional', description: 'Tasks can be logged in daily reports' },
        { name: 'Comments', type: 'bidirectional', description: 'Discussion threads on tasks' },
        { name: 'Dashboard', type: 'output', description: 'Task metrics on dashboard' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'title', type: 'string', required: true, description: 'Task title' },
        { name: 'description', type: 'text', description: 'Detailed task description' },
        { name: 'status', type: 'string', required: true, description: 'Todo, In Progress, Done, Cancelled' },
        { name: 'priority', type: 'string', description: 'Low, Medium, High, Urgent' },
        { name: 'due_date', type: 'date', description: 'Task due date' },
        { name: 'assigned_to', type: 'uuid', description: 'Assigned user ID' },
        { name: 'job_id', type: 'uuid', description: 'Linked job' },
        { name: 'parent_id', type: 'uuid', description: 'Parent task for subtasks' },
        { name: 'position', type: 'integer', description: 'Order in list' },
        { name: 'completed_at', type: 'timestamp', description: 'When task was completed' },
        { name: 'created_by', type: 'uuid', required: true, description: 'User who created task' },
      ]}
      aiFeatures={[
        { name: 'Task Suggestions', description: 'AI suggests tasks based on project phase and schedule', trigger: 'On new job phase' },
        { name: 'Due Date Optimization', description: 'Suggests optimal due dates based on workload and dependencies', trigger: 'On task creation' },
        { name: 'Smart Assignment', description: 'Recommends assignees based on task type and team availability', trigger: 'On task creation' },
        { name: 'Overdue Alerts', description: 'Proactive notifications about tasks at risk of being overdue', trigger: 'Daily analysis' },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Tasks                           [+ New Task]  List | Board  [Filter] │
├─────────────────────────────────────────────────────────────────────┤
│ Filters: All Jobs ▾ | All Status ▾ | Assigned: All ▾ | Due: All ▾   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ TODAY                                                               │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ □ Review electrical rough inspection              ● Smith Job   │ │
│ │   Assigned: Jake R.  |  Due: Today  |  High Priority            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ □ Order cabinet hardware                          ● Johnson Job │ │
│ │   Assigned: Sarah M.  |  Due: Today  |  Medium Priority         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ THIS WEEK                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ □ Schedule HVAC inspection                        ● Smith Job   │ │
│ │   Assigned: Mike B.  |  Due: Dec 20  |  Medium Priority         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`}
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'preview' && (
        <div className="p-4">
          <TodosPreview />
        </div>
      )}
    </PageSpec>
  )
}
