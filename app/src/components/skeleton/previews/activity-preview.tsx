'use client'

import { useState } from 'react'

import {
  Activity,
  Clock,
  User,
  FileText,
  DollarSign,
  Edit3,
  Trash2,
  Plus,
  Eye,
  Download,
  Search,
  ChevronRight,
  Undo2,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Building,
} from 'lucide-react'

import { cn } from '@/lib/utils'

// Types
interface ActivityItem {
  id: string
  action: 'create' | 'update' | 'delete' | 'restore' | 'view'
  tableName: string
  recordName: string
  recordId: string
  userId: string
  userName: string
  userAvatar?: string
  changedFields?: string[]
  oldValues?: Record<string, string>
  newValues?: Record<string, string>
  jobName?: string
  timestamp: Date
}

// Mock data
const mockActivity: ActivityItem[] = [
  {
    id: '1',
    action: 'update',
    tableName: 'invoices',
    recordName: 'Invoice #1247',
    recordId: 'inv-1247',
    userId: 'user-1',
    userName: 'Sarah Chen',
    changedFields: ['amount', 'due_date'],
    oldValues: { amount: '$4,200.00', due_date: 'Feb 20, 2026' },
    newValues: { amount: '$4,850.00', due_date: 'Feb 25, 2026' },
    jobName: 'Johnson Kitchen Remodel',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    action: 'create',
    tableName: 'change_orders',
    recordName: 'CO #12 - Cabinet Upgrade',
    recordId: 'co-12',
    userId: 'user-2',
    userName: 'Mike Torres',
    jobName: 'Johnson Kitchen Remodel',
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: '3',
    action: 'delete',
    tableName: 'daily_logs',
    recordName: 'Daily Log - Feb 17',
    recordId: 'dl-217',
    userId: 'user-1',
    userName: 'Sarah Chen',
    jobName: 'Smith Residence',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '4',
    action: 'update',
    tableName: 'jobs',
    recordName: 'Johnson Kitchen Remodel',
    recordId: 'job-1',
    userId: 'user-3',
    userName: 'David Park',
    changedFields: ['status'],
    oldValues: { status: 'In Progress' },
    newValues: { status: 'On Hold' },
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: '5',
    action: 'restore',
    tableName: 'vendors',
    recordName: 'ABC Plumbing',
    recordId: 'vendor-42',
    userId: 'user-1',
    userName: 'Sarah Chen',
    timestamp: new Date(Date.now() - 14400000),
  },
  {
    id: '6',
    action: 'create',
    tableName: 'purchase_orders',
    recordName: 'PO #892 - Electrical Supplies',
    recordId: 'po-892',
    userId: 'user-2',
    userName: 'Mike Torres',
    jobName: 'Smith Residence',
    timestamp: new Date(Date.now() - 21600000),
  },
]

const tableIcons: Record<string, typeof FileText> = {
  invoices: DollarSign,
  change_orders: Edit3,
  daily_logs: FileText,
  jobs: Building,
  vendors: User,
  purchase_orders: FileText,
}

const actionConfig = {
  create: { label: 'Created', color: 'text-success', bg: 'bg-success/10', icon: Plus },
  update: { label: 'Updated', color: 'text-info', bg: 'bg-info/10', icon: Edit3 },
  delete: { label: 'Deleted', color: 'text-error', bg: 'bg-error/10', icon: Trash2 },
  restore: { label: 'Restored', color: 'text-purple-600', bg: 'bg-purple-100', icon: Undo2 },
  view: { label: 'Viewed', color: 'text-warm-500', bg: 'bg-warm-100', icon: Eye },
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function ActivityCard({ item, onUndo }: { item: ActivityItem; onUndo: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const config = actionConfig[item.action]
  const TableIcon = tableIcons[item.tableName] || FileText

  return (
    <div className="bg-warm-0 border border-warm-200 rounded-lg p-4 hover:border-warm-300 transition-colors">
      <div className="flex items-start gap-3">
        {/* Action Icon */}
        <div className={cn('p-2 rounded-lg', config.bg)}>
          <config.icon className={cn('h-4 w-4', config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-warm-800">{item.userName}</span>
            <span className={cn('text-xs px-1.5 py-0.5 rounded', config.bg, config.color)}>
              {config.label}
            </span>
            <span className="text-warm-600 flex items-center gap-1">
              <TableIcon className="h-3.5 w-3.5 text-warm-400" />
              {item.recordName}
            </span>
          </div>

          {item.jobName ? <p className="text-xs text-warm-500 mt-1 flex items-center gap-1">
              <Building className="h-3 w-3" />
              {item.jobName}
            </p> : null}

          {/* Changed fields */}
          {item.changedFields && item.changedFields.length > 0 ? <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-warm-500 hover:text-warm-700"
              >
                <ChevronRight className={cn('h-3 w-3 transition-transform', expanded && 'rotate-90')} />
                {item.changedFields.length} field{item.changedFields.length > 1 ? 's' : ''} changed
              </button>

              {expanded ? <div className="mt-2 space-y-1">
                  {item.changedFields.map((field) => (
                    <div key={field} className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-warm-600 capitalize">{field.replace('_', ' ')}:</span>
                      <span className="text-error line-through">{item.oldValues?.[field]}</span>
                      <ArrowRight className="h-3 w-3 text-warm-400" />
                      <span className="text-success">{item.newValues?.[field]}</span>
                    </div>
                  ))}
                </div> : null}
            </div> : null}

          {/* Timestamp and actions */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-warm-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(item.timestamp)}
            </span>

            {(item.action === 'update' || item.action === 'delete') && (
              <button
                onClick={onUndo}
                className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-800 px-2 py-1 bg-warm-100 hover:bg-warm-200 rounded transition-colors"
              >
                <Undo2 className="h-3 w-3" />
                Undo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ActivityPreview() {
  const [filter, setFilter] = useState<'all' | 'create' | 'update' | 'delete'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('today')

  const filteredActivity = mockActivity.filter((item) => {
    if (filter !== 'all' && item.action !== filter) return false
    if (searchQuery && !item.recordName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-warm-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 font-display flex items-center gap-2">
              <Activity className="h-6 w-6 text-stone-600" />
              Activity Feed
            </h1>
            <p className="text-warm-600 mt-1">Track all changes across your projects</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-warm-0 border border-warm-200 rounded-lg text-sm text-warm-700 hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-warm-0 rounded-xl border border-warm-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400" />
              <input
                type="text"
                placeholder="Search activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>

            {/* Action filter */}
            <div className="flex items-center gap-1 bg-warm-100 rounded-lg p-1">
              {(['all', 'create', 'update', 'delete'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize',
                    filter === f
                      ? 'bg-warm-0 text-warm-800 shadow-sm'
                      : 'text-warm-600 hover:text-warm-800'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-warm-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-warm-200 rounded-lg text-sm bg-warm-0 focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Changes', value: '247', change: '+12 today', color: 'text-warm-800' },
            { label: 'Creates', value: '89', icon: Plus, color: 'text-success' },
            { label: 'Updates', value: '142', icon: Edit3, color: 'text-info' },
            { label: 'Deletes', value: '16', icon: Trash2, color: 'text-error' },
          ].map((stat) => (
            <div key={stat.label} className="bg-warm-0 border border-warm-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-warm-500">{stat.label}</span>
                {stat.icon ? <stat.icon className={cn('h-4 w-4', stat.color)} /> : null}
              </div>
              <p className={cn('text-2xl font-semibold', stat.color)}>{stat.value}</p>
              {stat.change ? <p className="text-xs text-warm-500 mt-1">{stat.change}</p> : null}
            </div>
          ))}
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {filteredActivity.map((item) => (
            <ActivityCard
              key={item.id}
              item={item}
              onUndo={() => console.warn('Undo', item.id)}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-warm-200">
          <p className="text-sm text-warm-500">Showing 1-6 of 247 activities</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-warm-200 rounded-lg text-warm-500 hover:bg-warm-50 disabled:opacity-50">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button className="px-3 py-1.5 bg-stone-700 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1.5 text-warm-600 hover:bg-warm-100 rounded-lg text-sm">2</button>
            <button className="px-3 py-1.5 text-warm-600 hover:bg-warm-100 rounded-lg text-sm">3</button>
            <span className="text-warm-400">...</span>
            <button className="px-3 py-1.5 text-warm-600 hover:bg-warm-100 rounded-lg text-sm">42</button>
            <button className="p-2 border border-warm-200 rounded-lg text-warm-500 hover:bg-warm-50">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
