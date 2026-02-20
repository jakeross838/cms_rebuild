'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
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
  LayoutGrid,
  List,
  Repeat,
  MessageSquare,
  Link2,
  ClipboardList,
  FileText,
  CheckSquare,
  Layers,
  ArrowRight,
  Trash2,
  UserPlus,
  CalendarDays,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked' | 'cancelled'
type Priority = 'urgent' | 'high' | 'medium' | 'low'
type TaskCategory = 'job-related' | 'admin' | 'follow-ups' | 'inspections' | 'procurement'
type SourceModule = 'manual' | 'schedule' | 'daily-log' | 'rfi' | 'inspection' | 'ai-suggested' | 'punch-list' | 'change-order'
type ViewMode = 'list' | 'kanban'

interface Subtask {
  id: string
  title: string
  done: boolean
}

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
  linkedJobId?: string
  linkedVendor?: string
  linkedClient?: string
  linkedScheduleTask?: string
  linkedDailyLog?: string
  completedAt?: string
  sourceModule: SourceModule
  isRecurring?: boolean
  recurringSchedule?: string
  commentCount?: number
  subtasks?: Subtask[]
  createdAt: string
  tags?: string[]
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockTasks: Task[] = [
  {
    id: 'TSK-001',
    title: 'Review electrical rough inspection report',
    description: 'Check inspector comments on electrical panel installation. Verify all corrections from last failed inspection are addressed.',
    category: 'inspections',
    assignedTo: 'Jake R.',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2024-02-12',
    linkedJob: 'Smith Residence',
    linkedJobId: 'JOB-2024-015',
    linkedScheduleTask: 'SCH-0892',
    sourceModule: 'inspection',
    commentCount: 3,
    subtasks: [
      { id: 's1', title: 'Download inspection report PDF', done: true },
      { id: 's2', title: 'Review panel wiring corrections', done: false },
      { id: 's3', title: 'Schedule re-inspection with city', done: false },
    ],
    createdAt: '2024-02-10',
    tags: ['electrical', 'inspection'],
  },
  {
    id: 'TSK-002',
    title: 'Order cabinet hardware from supplier',
    description: 'Place order for 47 pulls and 23 knobs per selection sheet. Confirm lead time with vendor.',
    category: 'procurement',
    assignedTo: 'Sarah M.',
    priority: 'high',
    status: 'todo',
    dueDate: '2024-02-12',
    linkedJob: 'Johnson Commercial',
    linkedJobId: 'JOB-2024-022',
    linkedVendor: 'Premier Hardware Co.',
    sourceModule: 'schedule',
    commentCount: 1,
    createdAt: '2024-02-08',
    tags: ['cabinets', 'procurement'],
  },
  {
    id: 'TSK-003',
    title: 'Schedule HVAC inspection with city',
    description: 'Call building department to schedule final HVAC inspection. Need permit #BLD-2024-1847.',
    category: 'inspections',
    assignedTo: 'Mike B.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2024-02-14',
    linkedJob: 'Smith Residence',
    linkedJobId: 'JOB-2024-015',
    linkedClient: 'John Smith',
    linkedScheduleTask: 'SCH-0901',
    sourceModule: 'schedule',
    createdAt: '2024-02-09',
    tags: ['hvac', 'inspection', 'permit'],
  },
  {
    id: 'TSK-004',
    title: 'Process outstanding vendor invoices',
    description: 'Review and code 6 pending invoices from last week. Match to POs where applicable.',
    category: 'admin',
    assignedTo: 'Sarah M.',
    priority: 'high',
    status: 'todo',
    dueDate: '2024-02-13',
    sourceModule: 'ai-suggested',
    commentCount: 2,
    subtasks: [
      { id: 's4', title: 'ABC Electric - INV-4521 ($3,200)', done: true },
      { id: 's5', title: 'Premier Plumbing - INV-4522 ($8,750)', done: true },
      { id: 's6', title: 'BuildRight Framing - INV-4530 ($12,400)', done: false },
      { id: 's7', title: 'Davis Concrete - INV-4535 ($6,100)', done: false },
      { id: 's8', title: 'Summit Roofing - INV-4538 ($15,200)', done: false },
      { id: 's9', title: 'Coastal Glass - INV-4541 ($4,800)', done: false },
    ],
    createdAt: '2024-02-11',
    tags: ['invoices', 'ap'],
  },
  {
    id: 'TSK-005',
    title: 'Client walkthrough - Smith Residence',
    description: 'Walk through drywall progress with homeowner. Confirm selection placement locations for fixtures.',
    category: 'job-related',
    assignedTo: 'Jake R.',
    priority: 'high',
    status: 'todo',
    dueDate: '2024-02-13',
    linkedJob: 'Smith Residence',
    linkedJobId: 'JOB-2024-015',
    linkedClient: 'John Smith',
    sourceModule: 'manual',
    createdAt: '2024-02-08',
    tags: ['walkthrough', 'client'],
  },
  {
    id: 'TSK-006',
    title: 'Weekly safety meeting',
    description: 'Conduct weekly toolbox talk. This week: ladder safety and fall prevention.',
    category: 'job-related',
    assignedTo: 'Mike B.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2024-02-14',
    linkedJob: 'Smith Residence',
    linkedJobId: 'JOB-2024-015',
    sourceModule: 'manual',
    isRecurring: true,
    recurringSchedule: 'Every Wednesday',
    createdAt: '2024-02-07',
    tags: ['safety', 'recurring'],
  },
  {
    id: 'TSK-007',
    title: 'Follow up with framing contractor on punch list',
    description: 'BuildRight has 4 open punch items from framing inspection. Need completion by Friday.',
    category: 'follow-ups',
    assignedTo: 'Jake R.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2024-02-16',
    linkedJob: 'Smith Residence',
    linkedJobId: 'JOB-2024-015',
    linkedVendor: 'BuildRight Framing',
    sourceModule: 'punch-list',
    commentCount: 5,
    createdAt: '2024-02-10',
    tags: ['framing', 'punch-list'],
  },
  {
    id: 'TSK-008',
    title: 'Prepare permit application - Downtown Plaza',
    description: 'Complete commercial building permit application. Attach site plan, structural drawings, and energy calcs.',
    category: 'job-related',
    assignedTo: 'Sarah M.',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2024-02-14',
    linkedJob: 'Downtown Plaza Development',
    linkedJobId: 'JOB-2024-031',
    sourceModule: 'manual',
    subtasks: [
      { id: 's10', title: 'Compile site plan documents', done: true },
      { id: 's11', title: 'Get structural engineer sign-off', done: true },
      { id: 's12', title: 'Complete energy calculations', done: false },
      { id: 's13', title: 'Submit to building department', done: false },
    ],
    commentCount: 4,
    createdAt: '2024-02-05',
    tags: ['permit', 'commercial'],
  },
  {
    id: 'TSK-009',
    title: 'Review subcontractor bid packages',
    description: 'Compare bids for painting scope on Johnson Commercial. 3 bids received, need selection by Thursday.',
    category: 'admin',
    assignedTo: 'Mike B.',
    priority: 'medium',
    status: 'in_progress',
    dueDate: '2024-02-15',
    linkedJob: 'Johnson Commercial',
    linkedJobId: 'JOB-2024-022',
    sourceModule: 'manual',
    commentCount: 2,
    createdAt: '2024-02-09',
    tags: ['bids', 'painting'],
  },
  {
    id: 'TSK-010',
    title: 'Submit draw request #4 - Smith Residence',
    description: 'Prepare and submit draw request for framing and rough mechanical milestones.',
    category: 'admin',
    assignedTo: 'Sarah M.',
    priority: 'high',
    status: 'blocked',
    dueDate: '2024-02-14',
    linkedJob: 'Smith Residence',
    linkedJobId: 'JOB-2024-015',
    sourceModule: 'ai-suggested',
    createdAt: '2024-02-10',
    tags: ['draw-request', 'financial'],
  },
  {
    id: 'TSK-011',
    title: 'Update daily log - Smith Residence',
    description: 'Log today\'s work performed, crew hours, and deliveries received.',
    category: 'job-related',
    assignedTo: 'Mike B.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2024-02-12',
    linkedJob: 'Smith Residence',
    linkedJobId: 'JOB-2024-015',
    linkedDailyLog: 'LOG-2024-0212',
    sourceModule: 'schedule',
    isRecurring: true,
    recurringSchedule: 'Every workday',
    createdAt: '2024-02-12',
    tags: ['daily-log', 'recurring'],
  },
  {
    id: 'TSK-012',
    title: 'Send final invoice to Johnson Commercial',
    description: 'Invoice for final 10% retainage release. Project complete and accepted.',
    category: 'admin',
    assignedTo: 'Sarah M.',
    priority: 'low',
    status: 'done',
    completedAt: '2024-02-11',
    linkedJob: 'Johnson Commercial',
    linkedJobId: 'JOB-2024-022',
    sourceModule: 'manual',
    createdAt: '2024-02-08',
    tags: ['invoice', 'retainage'],
  },
  {
    id: 'TSK-013',
    title: 'Verify insurance certificates - active vendors',
    description: 'Check expiration dates on COIs for all active subcontractors. Flag any expiring within 30 days.',
    category: 'admin',
    assignedTo: 'Sarah M.',
    priority: 'medium',
    status: 'done',
    completedAt: '2024-02-11',
    sourceModule: 'ai-suggested',
    isRecurring: true,
    recurringSchedule: 'Monthly',
    createdAt: '2024-02-01',
    tags: ['insurance', 'compliance'],
  },
  {
    id: 'TSK-014',
    title: 'Respond to RFI #12 - foundation waterproofing',
    description: 'Architect needs clarification on waterproofing spec for below-grade walls. Review drawings and respond.',
    category: 'follow-ups',
    assignedTo: 'Jake R.',
    priority: 'high',
    status: 'todo',
    dueDate: '2024-02-13',
    linkedJob: 'Downtown Plaza Development',
    linkedJobId: 'JOB-2024-031',
    sourceModule: 'rfi',
    commentCount: 3,
    createdAt: '2024-02-10',
    tags: ['rfi', 'foundation'],
  },
  {
    id: 'TSK-015',
    title: 'Review change order #3 - Smith kitchen upgrade',
    description: 'Client requested upgraded countertop material. Calculate cost delta and prepare CO document.',
    category: 'job-related',
    assignedTo: 'Jake R.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2024-02-15',
    linkedJob: 'Smith Residence',
    linkedJobId: 'JOB-2024-015',
    linkedClient: 'John Smith',
    sourceModule: 'change-order',
    createdAt: '2024-02-11',
    tags: ['change-order', 'kitchen'],
  },
]

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const categoryConfig: Record<TaskCategory, { label: string; color: string; icon: typeof CircleDot }> = {
  'job-related': { label: 'Job Related', color: 'bg-stone-100 text-stone-700', icon: Building2 },
  admin: { label: 'Admin / Financial', color: 'bg-purple-100 text-purple-700', icon: FileText },
  'follow-ups': { label: 'Follow-ups', color: 'bg-orange-100 text-orange-700', icon: Clock },
  inspections: { label: 'Inspections', color: 'bg-teal-100 text-teal-700', icon: ClipboardList },
  procurement: { label: 'Procurement', color: 'bg-indigo-100 text-indigo-700', icon: Hash },
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string; textColor: string; icon: typeof CircleDot }> = {
  todo: { label: 'Todo', color: 'bg-warm-400', bgColor: 'bg-warm-50', textColor: 'text-warm-700', icon: CircleDot },
  in_progress: { label: 'In Progress', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: Clock },
  blocked: { label: 'Blocked', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: AlertCircle },
  done: { label: 'Done', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-warm-300', bgColor: 'bg-warm-50', textColor: 'text-warm-500', icon: CircleDot },
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; textColor: string; sortOrder: number }> = {
  urgent: { label: 'Urgent', color: 'bg-red-600', bgColor: 'bg-red-100', textColor: 'text-red-800', sortOrder: 0 },
  high: { label: 'High', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', sortOrder: 1 },
  medium: { label: 'Medium', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', sortOrder: 2 },
  low: { label: 'Low', color: 'bg-warm-400', bgColor: 'bg-warm-100', textColor: 'text-warm-600', sortOrder: 3 },
}

const sourceModuleConfig: Record<SourceModule, { label: string; color: string }> = {
  manual: { label: 'Manual', color: 'bg-warm-50 text-warm-500' },
  schedule: { label: 'Schedule', color: 'bg-stone-50 text-stone-600' },
  'daily-log': { label: 'Daily Log', color: 'bg-green-50 text-green-600' },
  rfi: { label: 'RFI', color: 'bg-purple-50 text-purple-600' },
  inspection: { label: 'Inspection', color: 'bg-teal-50 text-teal-600' },
  'ai-suggested': { label: 'AI Suggested', color: 'bg-amber-50 text-amber-600' },
  'punch-list': { label: 'Punch List', color: 'bg-pink-50 text-pink-600' },
  'change-order': { label: 'Change Order', color: 'bg-orange-50 text-orange-600' },
}

// ---------------------------------------------------------------------------
// Helper: days overdue
// ---------------------------------------------------------------------------

function getDaysOverdue(dueDate: string | undefined, status: TaskStatus): number {
  if (!dueDate || status === 'done' || status === 'cancelled') return 0
  const now = new Date('2024-02-12') // mock "today"
  const due = new Date(dueDate)
  const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function SubtaskList({ subtasks }: { subtasks: Subtask[] }) {
  const done = subtasks.filter(s => s.done).length
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-2 text-xs text-warm-500">
        <Layers className="h-3 w-3" />
        <span>Subtasks: {done}/{subtasks.length}</span>
        <div className="flex-1 h-1.5 bg-warm-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-stone-500 rounded-full transition-all"
            style={{ width: `${(done / subtasks.length) * 100}%` }}
          />
        </div>
      </div>
      {subtasks.map(st => (
        <div key={st.id} className="flex items-center gap-2 pl-5 text-xs">
          <input type="checkbox" className="rounded border-warm-300 text-stone-600 cursor-pointer h-3 w-3" checked={st.done} readOnly />
          <span className={cn(st.done ? 'text-warm-400 line-through' : 'text-warm-600')}>{st.title}</span>
        </div>
      ))}
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  const priority = priorityConfig[task.priority]
  const status = statusConfig[task.status]
  const category = categoryConfig[task.category]
  const source = sourceModuleConfig[task.sourceModule]
  const StatusIcon = status.icon
  const CategoryIcon = category.icon
  const daysOverdue = getDaysOverdue(task.dueDate, task.status)

  return (
    <div className={cn(
      "bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow",
      task.status === 'blocked' ? 'border-red-200 bg-red-50/30' : 'border-warm-200'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">
            <input type="checkbox" className="rounded border-warm-300 text-stone-600 cursor-pointer" checked={task.status === 'done'} readOnly />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs text-warm-400 font-mono">{task.id}</span>
              {task.isRecurring && (
                <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5" title={task.recurringSchedule}>
                  <Repeat className="h-3 w-3" />
                  {task.recurringSchedule}
                </span>
              )}
              {task.sourceModule !== 'manual' && (
                <span className={cn("text-xs px-1.5 py-0.5 rounded", source.color)}>
                  {task.sourceModule === 'ai-suggested' && <Sparkles className="h-3 w-3 inline mr-0.5" />}
                  {source.label}
                </span>
              )}
            </div>
            <p className={cn(
              "font-medium text-sm",
              task.status === 'done' ? 'text-warm-400 line-through' : 'text-warm-900'
            )}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-warm-500 mt-1 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={cn("text-xs px-2 py-0.5 rounded inline-flex items-center gap-1", category.color)}>
                <CategoryIcon className="h-3 w-3" />
                {category.label}
              </span>
              {task.linkedJob && (
                <span className="text-xs px-2 py-0.5 rounded bg-stone-50 text-stone-600 inline-flex items-center gap-1 cursor-pointer hover:bg-stone-100">
                  <Building2 className="h-3 w-3" />
                  {task.linkedJob}
                  {task.linkedJobId && <span className="text-stone-400 font-mono text-[10px]">{task.linkedJobId}</span>}
                </span>
              )}
              {task.linkedVendor && (
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 inline-flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {task.linkedVendor}
                </span>
              )}
              {task.linkedClient && (
                <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-600 inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {task.linkedClient}
                </span>
              )}
              {task.linkedScheduleTask && (
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-50 text-cyan-600 inline-flex items-center gap-1 cursor-pointer hover:bg-cyan-100">
                  <Link2 className="h-3 w-3" />
                  {task.linkedScheduleTask}
                </span>
              )}
              {task.linkedDailyLog && (
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 inline-flex items-center gap-1 cursor-pointer hover:bg-emerald-100">
                  <ClipboardList className="h-3 w-3" />
                  {task.linkedDailyLog}
                </span>
              )}
            </div>

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <SubtaskList subtasks={task.subtasks} />
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {task.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-warm-100 text-warm-500">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-warm-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-stone-100 flex items-center justify-center">
              <span className="text-xs font-medium text-stone-700">{task.assignedTo[0]}</span>
            </div>
            <span className="text-xs text-warm-500">{task.assignedTo}</span>
          </div>
          {task.commentCount && task.commentCount > 0 && (
            <span className="text-xs text-warm-400 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {task.commentCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded flex items-center gap-1 font-medium",
              daysOverdue > 0 ? "bg-red-50 text-red-600" : "bg-warm-100 text-warm-600"
            )}>
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {daysOverdue > 0 && (
                <span className="text-red-500 font-semibold">({daysOverdue}d overdue)</span>
              )}
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

function KanbanCard({ task }: { task: Task }) {
  const priority = priorityConfig[task.priority]
  const daysOverdue = getDaysOverdue(task.dueDate, task.status)

  return (
    <div className={cn(
      "bg-white rounded-lg border p-2.5 shadow-sm hover:shadow-md transition-shadow cursor-grab",
      task.status === 'blocked' ? 'border-red-200' : 'border-warm-200'
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-warm-400 font-mono">{task.id}</span>
        <span className={cn("text-[10px] px-1 py-0.5 rounded font-medium", priority.bgColor, priority.textColor)}>
          {priority.label}
        </span>
      </div>
      <p className="text-xs font-medium text-warm-900 mb-1.5 line-clamp-2">{task.title}</p>
      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
        {task.linkedJob && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-50 text-stone-600">
            {task.linkedJob}
          </span>
        )}
        {task.isRecurring && (
          <Repeat className="h-3 w-3 text-stone-500" />
        )}
        {task.sourceModule === 'ai-suggested' && (
          <Sparkles className="h-3 w-3 text-amber-500" />
        )}
      </div>
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="flex items-center gap-1 mb-1.5">
          <CheckSquare className="h-3 w-3 text-warm-400" />
          <span className="text-[10px] text-warm-500">
            {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
          </span>
          <div className="flex-1 h-1 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-500 rounded-full"
              style={{ width: `${(task.subtasks.filter(s => s.done).length / task.subtasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded-full bg-stone-100 flex items-center justify-center">
            <span className="text-[10px] font-medium text-stone-700">{task.assignedTo[0]}</span>
          </div>
          {task.commentCount && task.commentCount > 0 && (
            <span className="text-[10px] text-warm-400 flex items-center gap-0.5">
              <MessageSquare className="h-2.5 w-2.5" />
              {task.commentCount}
            </span>
          )}
        </div>
        {task.dueDate && (
          <span className={cn(
            "text-[10px] px-1 py-0.5 rounded",
            daysOverdue > 0 ? "bg-red-50 text-red-600 font-semibold" : "text-warm-500"
          )}>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {daysOverdue > 0 && ` (${daysOverdue}d)`}
          </span>
        )}
      </div>
    </div>
  )
}

function KanbanColumn({ title, status, tasks, color }: { title: string; status: TaskStatus; tasks: Task[]; color: string }) {
  return (
    <div className="flex-1 min-w-[220px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
          <span className="text-xs font-semibold text-warm-700">{title}</span>
          <span className="text-xs text-warm-400 bg-warm-100 px-1.5 py-0.5 rounded">{tasks.length}</span>
        </div>
        <button className="p-0.5 hover:bg-warm-100 rounded">
          <Plus className="h-3 w-3 text-warm-400" />
        </button>
      </div>
      <div className="space-y-2 min-h-[100px] bg-warm-50/50 rounded-lg p-2">
        {tasks.map(task => (
          <KanbanCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-6 text-warm-400">
            <p className="text-xs">No tasks</p>
          </div>
        )}
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
  trend,
}: {
  label: string
  value: string | number
  subValue?: string
  iconColor: string
  iconBg: string
  icon: typeof CircleDot
  trend?: 'up' | 'down' | 'flat'
}) {
  return (
    <div className="bg-white rounded-lg border border-warm-200 p-3">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <div>
          <p className="text-xs text-warm-500">{label}</p>
          <div className="flex items-center gap-1">
            <p className="text-lg font-semibold text-warm-900">{value}</p>
            {trend === 'down' && <span className="text-green-500 text-xs">-2</span>}
            {trend === 'up' && <span className="text-red-500 text-xs">+3</span>}
          </div>
          {subValue && <p className="text-xs text-warm-400">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

function BulkActionBar({ selectedCount }: { selectedCount: number }) {
  if (selectedCount === 0) return null
  return (
    <div className="bg-stone-600 text-white px-4 py-2 flex items-center justify-between rounded-lg mx-4 mb-2">
      <span className="text-sm font-medium">{selectedCount} tasks selected</span>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1 px-2 py-1 text-xs bg-stone-500 hover:bg-stone-400 rounded">
          <UserPlus className="h-3 w-3" />
          Reassign
        </button>
        <button className="flex items-center gap-1 px-2 py-1 text-xs bg-stone-500 hover:bg-stone-400 rounded">
          <CalendarDays className="h-3 w-3" />
          Reschedule
        </button>
        <button className="flex items-center gap-1 px-2 py-1 text-xs bg-stone-500 hover:bg-stone-400 rounded">
          <ArrowRight className="h-3 w-3" />
          Move Status
        </button>
        <button className="flex items-center gap-1 px-2 py-1 text-xs bg-stone-500 hover:bg-stone-400 rounded">
          <Trash2 className="h-3 w-3" />
          Archive
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function TodosPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all')
  const [filterAssignee, setFilterAssignee] = useState<string | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [filterSource, setFilterSource] = useState<SourceModule | 'all'>('all')
  const [filterJob, setFilterJob] = useState<string | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['inspections', 'job-related', 'admin', 'follow-ups', 'procurement']))
  const [selectedTasks] = useState<Set<string>>(new Set())

  // Get unique values for filters
  const categories = Object.keys(categoryConfig) as TaskCategory[]
  const assignees = [...new Set(mockTasks.map(task => task.assignedTo))]
  const jobs = [...new Set(mockTasks.filter(t => t.linkedJob).map(t => t.linkedJob!))]
  const sources = Object.keys(sourceModuleConfig) as SourceModule[]

  // Filter tasks
  const filteredTasks = sortItems(
    mockTasks.filter(task => {
      if (!matchesSearch(task, search, ['title', 'description', 'assignedTo', 'linkedJob', 'linkedVendor', 'id'])) return false
      if (activeTab !== 'all' && task.status !== activeTab) return false
      if (filterCategory !== 'all' && task.category !== filterCategory) return false
      if (filterAssignee !== 'all' && task.assignedTo !== filterAssignee) return false
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false
      if (filterSource !== 'all' && task.sourceModule !== filterSource) return false
      if (filterJob !== 'all' && task.linkedJob !== filterJob) return false
      return true
    }),
    activeSort as keyof Task | '',
    sortDirection,
  )

  // Group tasks by category (for list view)
  const tasksByCategory = filteredTasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = []
    acc[task.category].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Group by status (for kanban view)
  const tasksByStatus = filteredTasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = []
    acc[task.status].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Calculate stats
  const totalTasks = mockTasks.length
  const completedTasks = mockTasks.filter(task => task.status === 'done').length
  const completedPercent = Math.round((completedTasks / totalTasks) * 100)
  const todoTasks = mockTasks.filter(task => task.status === 'todo').length
  const inProgressTasks = mockTasks.filter(task => task.status === 'in_progress').length
  const blockedTasks = mockTasks.filter(task => task.status === 'blocked').length
  const highPriorityTasks = mockTasks.filter(task => (task.priority === 'high' || task.priority === 'urgent') && task.status !== 'done').length
  const overdueTasks = mockTasks.filter(task => getDaysOverdue(task.dueDate, task.status) > 0).length
  const recurringTasks = mockTasks.filter(task => task.isRecurring).length
  const aiSuggestedTasks = mockTasks.filter(task => task.sourceModule === 'ai-suggested').length

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
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Tasks & Todos</h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded font-medium",
                completedPercent >= 70 ? "bg-green-100 text-green-700" :
                completedPercent >= 40 ? "bg-amber-100 text-amber-700" :
                "bg-orange-100 text-orange-700"
              )}>
                {completedPercent}% Complete
              </span>
              {aiSuggestedTasks > 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {aiSuggestedTasks} AI-suggested
                </span>
              )}
            </div>
            <div className="text-sm text-warm-500 mt-0.5">
              {totalTasks} total | {todoTasks} to do | {inProgressTasks} in progress | {blockedTasks} blocked | {overdueTasks} overdue
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-warm-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 transition-colors",
                  viewMode === 'list' ? 'bg-stone-50 text-stone-600' : 'text-warm-400 hover:bg-warm-50'
                )}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "p-1.5 transition-colors",
                  viewMode === 'kanban' ? 'bg-stone-50 text-stone-600' : 'text-warm-400 hover:bg-warm-50'
                )}
                title="Kanban board"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 bg-white border-b border-warm-200">
        <div className="grid grid-cols-7 gap-3">
          <StatCard
            icon={CircleDot}
            label="Total Tasks"
            value={totalTasks}
            iconColor="text-stone-600"
            iconBg="bg-stone-50"
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
            iconColor="text-warm-600"
            iconBg="bg-warm-100"
            trend="up"
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
            label="Blocked"
            value={blockedTasks}
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
          <StatCard
            icon={Repeat}
            label="Recurring"
            value={recurringTasks}
            iconColor="text-stone-600"
            iconBg="bg-stone-50"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search tasks by title, description, job, vendor, ID..."
          tabs={[
            { key: 'all', label: 'All', count: mockTasks.length },
            { key: 'todo', label: 'Todo', count: mockTasks.filter(t => t.status === 'todo').length },
            { key: 'in_progress', label: 'In Progress', count: mockTasks.filter(t => t.status === 'in_progress').length },
            { key: 'blocked', label: 'Blocked', count: mockTasks.filter(t => t.status === 'blocked').length },
            { key: 'done', label: 'Done', count: mockTasks.filter(t => t.status === 'done').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Categories',
              value: filterCategory,
              options: categories.map(cat => ({ value: cat, label: categoryConfig[cat].label })),
              onChange: (v) => setFilterCategory(v as TaskCategory | 'all'),
            },
            {
              label: 'All Priorities',
              value: filterPriority,
              options: Object.entries(priorityConfig).map(([key, config]) => ({ value: key, label: config.label })),
              onChange: (v) => setFilterPriority(v as Priority | 'all'),
            },
            {
              label: 'All Assignees',
              value: filterAssignee,
              options: assignees.map(a => ({ value: a, label: a })),
              onChange: (v) => setFilterAssignee(v),
            },
            {
              label: 'All Jobs',
              value: filterJob,
              options: jobs.map(j => ({ value: j, label: j })),
              onChange: (v) => setFilterJob(v),
            },
            {
              label: 'All Sources',
              value: filterSource,
              options: sources.map(s => ({ value: s, label: sourceModuleConfig[s].label })),
              onChange: (v) => setFilterSource(v as SourceModule | 'all'),
            },
          ]}
          sortOptions={[
            { value: 'title', label: 'Title' },
            { value: 'priority', label: 'Priority' },
            { value: 'dueDate', label: 'Due Date' },
            { value: 'assignedTo', label: 'Assignee' },
            { value: 'status', label: 'Status' },
            { value: 'category', label: 'Category' },
            { value: 'createdAt', label: 'Created' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredTasks.length}
          totalCount={mockTasks.length}
        />
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar selectedCount={selectedTasks.size} />

      {/* Content: List View */}
      {viewMode === 'list' && (
        <div className="max-h-[600px] overflow-y-auto">
          {categories.map((category) => {
            const categoryTasks = tasksByCategory[category] || []
            const isExpanded = expandedCategories.has(category)
            const categoryConfig_local = categoryConfig[category]
            const completedCount = categoryTasks.filter(t => t.status === 'done').length
            const overdueCount = categoryTasks.filter(t => getDaysOverdue(t.dueDate, t.status) > 0).length

            if (categoryTasks.length === 0 && filterCategory !== 'all') return null

            return (
              <div key={category} className="border-b border-warm-100 last:border-b-0">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-warm-50 hover:bg-warm-100"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-warm-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-warm-400" />
                    )}
                    <span className={cn("text-xs px-2 py-0.5 rounded font-medium", categoryConfig_local.color)}>
                      {categoryConfig_local.label}
                    </span>
                    <span className="text-xs text-warm-400 bg-warm-200 px-1.5 py-0.5 rounded">
                      {categoryTasks.length}
                    </span>
                    {overdueCount > 0 && (
                      <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium">
                        {overdueCount} overdue
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-warm-500">{completedCount}/{categoryTasks.length} complete</span>
                    <div className="w-24 h-2 bg-warm-200 rounded-full overflow-hidden">
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
                      <div className="text-center py-8 text-warm-400">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tasks in this category</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-warm-400">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tasks found matching your criteria</p>
              <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      )}

      {/* Content: Kanban View */}
      {viewMode === 'kanban' && (
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-4 min-w-[900px]">
            <KanbanColumn
              title="Todo"
              status="todo"
              tasks={tasksByStatus['todo'] || []}
              color="bg-warm-400"
            />
            <KanbanColumn
              title="In Progress"
              status="in_progress"
              tasks={tasksByStatus['in_progress'] || []}
              color="bg-amber-500"
            />
            <KanbanColumn
              title="Blocked"
              status="blocked"
              tasks={tasksByStatus['blocked'] || []}
              color="bg-red-500"
            />
            <KanbanColumn
              title="Done"
              status="done"
              tasks={tasksByStatus['done'] || []}
              color="bg-green-500"
            />
          </div>
        </div>
      )}

      {/* AI Suggestions Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Task Intelligence:</span>
          </div>
          <div className="text-sm text-amber-700 flex-1">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0 mt-0.5">Workload</span>
                <p>Sarah M. has 5 open tasks including 3 high-priority items due this week. Consider delegating the cabinet hardware order (TSK-002) or rescheduling the vendor invoice batch.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0 mt-0.5">Blocked</span>
                <p>TSK-010 (Draw Request #4) is blocked -- the framing milestone inspection needs to pass first. Link: inspection task TSK-001 is the prerequisite.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0 mt-0.5">Suggestion</span>
                <p>Based on the Smith Residence schedule, you should create a task for "Order countertop material" by Feb 20 to meet the cabinet install date. Lead time is typically 3-4 weeks.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 rounded">
                <Plus className="h-3 w-3" />
                Create Suggested Task
              </button>
              <button className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 rounded">
                <Send className="h-3 w-3" />
                Delegate to Team
              </button>
              <button className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 rounded">
                <Pause className="h-3 w-3" />
                Snooze Suggestions
              </button>
              <button className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 rounded">
                <CheckCircle2 className="h-3 w-3" />
                Dismiss All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Priority Scoring',
            insight: 'AI ranks tasks by urgency and impact',
          },
          {
            feature: 'Due Date Suggestions',
            insight: 'Recommends realistic due dates',
          },
          {
            feature: 'Assignment Optimization',
            insight: 'Suggests best person for each task',
          },
          {
            feature: 'Dependency Detection',
            insight: 'Identifies task dependencies',
          },
          {
            feature: 'Overdue Prediction',
            insight: 'Predicts tasks likely to miss deadlines',
          },
        ]}
      />

      {/* Footer Stats */}
      <div className="bg-white border-t border-warm-200 px-4 py-2 flex items-center justify-between text-xs text-warm-500">
        <div className="flex items-center gap-4">
          <span>Showing {filteredTasks.length} of {totalTasks} tasks</span>
          <span>|</span>
          <span>{recurringTasks} recurring tasks active</span>
          <span>|</span>
          <span>{mockTasks.reduce((sum, t) => sum + (t.subtasks?.length || 0), 0)} subtasks across all tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-warm-400">Last synced: just now</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
