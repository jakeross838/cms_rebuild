'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleDot,
  Sparkles,
  MoreHorizontal,
  Zap,
  Building2,
  Users,
  Calendar,
  Pause,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
type Priority = 'high' | 'medium' | 'low'
type TaskCategory = 'job-related' | 'admin' | 'follow-ups'

interface Task {
  id: string
  title: string
  description?: string
  category: TaskCategory
  assignedTo: string
  priority: Priority
  status: TaskStatus
  dueDate?: string
  linkedJob?: string
  linkedVendor?: string
  linkedClient?: string
  completedAt?: string
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review electrical rough inspection report',
    description: 'Check inspector comments on electrical panel installation',
    category: 'job-related',
    assignedTo: 'Jake R.',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2024-02-12',
    linkedJob: 'Smith Residence - Phase 2',
  },
  {
    id: '2',
    title: 'Order cabinet hardware from supplier',
    category: 'job-related',
    assignedTo: 'Sarah M.',
    priority: 'high',
    status: 'todo',
    dueDate: '2024-02-12',
    linkedJob: 'Johnson Commercial',
    linkedVendor: 'Premier Hardware Co.',
  },
  {
    id: '3',
    title: 'Schedule HVAC inspection with city',
    category: 'job-related',
    assignedTo: 'Mike B.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2024-02-14',
    linkedJob: 'Smith Residence - Phase 2',
    linkedClient: 'John Smith',
  },
  {
    id: '4',
    title: 'Follow up on outstanding invoices',
    category: 'admin',
    assignedTo: 'Sarah M.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2024-02-15',
  },
  {
    id: '5',
    title: 'Client walkthrough - Smith Residence',
    category: 'job-related',
    assignedTo: 'Jake R.',
    priority: 'high',
    status: 'todo',
    dueDate: '2024-02-13',
    linkedJob: 'Smith Residence - Phase 2',
    linkedClient: 'John Smith',
  },
  {
    id: '6',
    title: 'Update project budget spreadsheet',
    category: 'admin',
    assignedTo: 'Mike B.',
    priority: 'low',
    status: 'todo',
    dueDate: '2024-02-20',
  },
  {
    id: '7',
    title: 'Follow up with framing contractor',
    category: 'follow-ups',
    assignedTo: 'Jake R.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2024-02-16',
    linkedVendor: 'BuildRight Framing',
  },
  {
    id: '8',
    title: 'Prepare permit application documents',
    category: 'job-related',
    assignedTo: 'Sarah M.',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2024-02-14',
    linkedJob: 'Downtown Plaza Development',
  },
  {
    id: '9',
    title: 'Review subcontractor quotes',
    category: 'admin',
    assignedTo: 'Mike B.',
    priority: 'medium',
    status: 'in_progress',
    dueDate: '2024-02-17',
  },
  {
    id: '10',
    title: 'Send final invoice to Johnson Commercial',
    category: 'admin',
    assignedTo: 'Sarah M.',
    priority: 'low',
    status: 'done',
    completedAt: '2024-02-11',
  },
]

const categoryConfig: Record<TaskCategory, { label: string; color: string; icon: typeof CircleDot }> = {
  'job-related': { label: 'Job Related', color: 'bg-blue-100 text-blue-700', icon: Building2 },
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700', icon: CircleDot },
  'follow-ups': { label: 'Follow-ups', color: 'bg-orange-100 text-orange-700', icon: Clock },
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string; textColor: string; icon: typeof CircleDot }> = {
  todo: { label: 'Todo', color: 'bg-gray-400', bgColor: 'bg-gray-50', textColor: 'text-gray-700', icon: CircleDot },
  in_progress: { label: 'In Progress', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: Clock },
  done: { label: 'Done', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: CircleDot },
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; textColor: string }> = {
  high: { label: 'High', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  medium: { label: 'Medium', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  low: { label: 'Low', color: 'bg-gray-400', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
}

function TaskCard({ task }: { task: Task }) {
  const priority = priorityConfig[task.priority]
  const status = statusConfig[task.status]
  const category = categoryConfig[task.category]
  const StatusIcon = status.icon
  const CategoryIcon = category.icon

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 cursor-pointer" checked={task.status === 'done'} readOnly />
          </div>
          <div className="flex-1">
            <p className={cn(
              "font-medium text-sm",
              task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'
            )}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-gray-500 mt-1">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={cn("text-xs px-2 py-0.5 rounded inline-flex items-center gap-1", category.color)}>
                <CategoryIcon className="h-3 w-3" />
                {category.label}
              </span>
              {task.linkedJob && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                  <Building2 className="h-3 w-3 inline mr-1" />
                  {task.linkedJob}
                </span>
              )}
              {task.linkedVendor && (
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                  {task.linkedVendor}
                </span>
              )}
              {task.linkedClient && (
                <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-600">
                  <Users className="h-3 w-3 inline mr-1" />
                  {task.linkedClient}
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-700">{task.assignedTo[0]}</span>
          </div>
          <span className="text-xs text-gray-500">{task.assignedTo}</span>
        </div>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded flex items-center gap-1 font-medium",
              isOverdue ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
            )}>
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium",
            priority.bgColor,
            priority.textColor
          )}>
            {priority.label}
          </span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1",
            status.bgColor,
            status.textColor
          )}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  subValue,
  iconColor,
  iconBg,
  icon: Icon,
}: {
  label: string
  value: string | number
  subValue?: string
  iconColor: string
  iconBg: string
  icon: typeof CircleDot
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

export function TodosPreview() {
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterAssignee, setFilterAssignee] = useState<string | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['job-related', 'admin']))

  // Get unique values for filters
  const categories = Object.keys(categoryConfig) as TaskCategory[]
  const assignees = [...new Set(mockTasks.map(task => task.assignedTo))]

  // Filter tasks
  const filteredTasks = mockTasks.filter(task => {
    if (filterCategory !== 'all' && task.category !== filterCategory) return false
    if (filterStatus !== 'all' && task.status !== filterStatus) return false
    if (filterAssignee !== 'all' && task.assignedTo !== filterAssignee) return false
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    return true
  })

  // Group tasks by category
  const tasksByCategory = filteredTasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = []
    acc[task.category].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Calculate stats
  const totalTasks = mockTasks.length
  const completedTasks = mockTasks.filter(task => task.status === 'done').length
  const completedPercent = Math.round((completedTasks / totalTasks) * 100)
  const todoTasks = mockTasks.filter(task => task.status === 'todo').length
  const inProgressTasks = mockTasks.filter(task => task.status === 'in_progress').length
  const highPriorityTasks = mockTasks.filter(task => task.priority === 'high' && task.status !== 'done').length
  const mediumPriorityTasks = mockTasks.filter(task => task.priority === 'medium' && task.status !== 'done').length
  const overdueTasks = mockTasks.filter(task => {
    if (task.status === 'done') return false
    return task.dueDate && new Date(task.dueDate) < new Date()
  }).length

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Tasks & Todo Lists</h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded font-medium",
                completedPercent >= 70 ? "bg-green-100 text-green-700" :
                completedPercent >= 40 ? "bg-amber-100 text-amber-700" :
                "bg-orange-100 text-orange-700"
              )}>
                {completedPercent}% Complete
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {totalTasks} total tasks | {todoTasks} to do | {inProgressTasks} in progress
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="grid grid-cols-6 gap-3">
          <StatCard
            icon={CircleDot}
            label="Total Tasks"
            value={totalTasks}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={`${completedPercent}%`}
            subValue={`${completedTasks} of ${totalTasks}`}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            icon={CircleDot}
            label="To Do"
            value={todoTasks}
            iconColor="text-gray-600"
            iconBg="bg-gray-100"
          />
          <StatCard
            icon={Clock}
            label="In Progress"
            value={inProgressTasks}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            icon={AlertCircle}
            label="High Priority"
            value={highPriorityTasks}
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
          <StatCard
            icon={Zap}
            label="Overdue"
            value={overdueTasks}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Assignee:</span>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Assignees</option>
              {assignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Tasks by Category */}
      <div className="max-h-96 overflow-y-auto">
        {categories.map((category) => {
          const categoryTasks = tasksByCategory[category] || []
          const isExpanded = expandedCategories.has(category)
          const categoryConfig_local = categoryConfig[category]
          const completedCount = categoryTasks.filter(t => t.status === 'done').length

          return (
            <div key={category} className="border-b border-gray-100 last:border-b-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={cn("text-xs px-2 py-0.5 rounded font-medium", categoryConfig_local.color)}>
                    {categoryConfig_local.label}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                    {categoryTasks.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{completedCount}/{categoryTasks.length} complete</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${categoryTasks.length > 0 ? (completedCount / categoryTasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Category Tasks */}
              {isExpanded && (
                <div className="p-4 space-y-3 bg-white">
                  {categoryTasks.length > 0 ? (
                    categoryTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks in this category</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filteredTasks.length === 0 && categories.every(cat => !tasksByCategory[cat] || tasksByCategory[cat].length === 0) && (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No tasks found matching your criteria</p>
          </div>
        )}
      </div>

      {/* AI Suggestions Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm text-blue-800">AI Suggestions:</span>
          </div>
          <div className="text-sm text-blue-700 flex-1">
            <p className="mb-2">
              Based on current workload and priorities: Consider delegating the cabinet hardware order to a team member to free up Sarah's schedule. She has 3 high-priority tasks due today.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded">
                <Pause className="h-3 w-3" />
                Snooze
              </button>
              <button className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded">
                <Send className="h-3 w-3" />
                Delegate
              </button>
              <button className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded">
                <CheckCircle2 className="h-3 w-3" />
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
