'use client'

import { useState } from 'react'
import {
  Bell,
  AlertTriangle,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'alert' | 'reminder' | 'ai_insight' | 'update'
  priority: 'urgent' | 'high' | 'normal' | 'low'
  title: string
  message: string
  source: string
  job?: string
  time: string
  isRead: boolean
  actionLabel?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    priority: 'urgent',
    title: 'Draw #5 payment overdue',
    message: 'Payment of $185,000 was due yesterday. Client notified.',
    source: 'Draws',
    job: 'Smith Residence',
    time: '2 hrs ago',
    isRead: false,
    actionLabel: 'View Draw',
  },
  {
    id: '2',
    type: 'reminder',
    priority: 'high',
    title: 'Invoice needs approval',
    message: '$12,450 for electrical rough-in from ABC Electric',
    source: 'Invoices',
    job: 'Smith Residence',
    time: '4 hrs ago',
    isRead: false,
    actionLabel: 'Approve',
  },
  {
    id: '3',
    type: 'reminder',
    priority: 'high',
    title: 'Selection deadline approaching',
    message: 'Tile selection due in 3 days. Client hasn\'t logged in.',
    source: 'Selections',
    job: 'Johnson Beach House',
    time: '5 hrs ago',
    isRead: false,
    actionLabel: 'Send Reminder',
  },
  {
    id: '4',
    type: 'ai_insight',
    priority: 'normal',
    title: 'Cost trend detected',
    message: 'Lumber costs trending 8% higher than estimates this month.',
    source: 'Cost Intelligence',
    time: 'Yesterday',
    isRead: true,
    actionLabel: 'View Analysis',
  },
  {
    id: '5',
    type: 'update',
    priority: 'normal',
    title: 'Window delivery confirmed',
    message: '18 impact windows scheduled for delivery tomorrow 2pm.',
    source: 'Deliveries',
    job: 'Smith Residence',
    time: 'Yesterday',
    isRead: true,
  },
  {
    id: '6',
    type: 'update',
    priority: 'low',
    title: 'Daily log submitted',
    message: 'Mike submitted daily log for Johnson Beach House.',
    source: 'Daily Logs',
    job: 'Johnson Beach House',
    time: '2 days ago',
    isRead: true,
  },
]

const priorityConfig = {
  urgent: { color: 'bg-red-500', label: 'Urgent', bgColor: 'bg-red-50' },
  high: { color: 'bg-amber-500', label: 'High', bgColor: 'bg-amber-50' },
  normal: { color: 'bg-blue-500', label: 'Normal', bgColor: 'bg-white' },
  low: { color: 'bg-gray-400', label: 'Low', bgColor: 'bg-white' },
}

const typeConfig = {
  alert: { icon: AlertTriangle, color: 'text-red-500' },
  reminder: { icon: Clock, color: 'text-amber-500' },
  ai_insight: { icon: Sparkles, color: 'text-purple-500' },
  update: { icon: Bell, color: 'text-blue-500' },
}

function NotificationCard({ notification }: { notification: Notification }) {
  const priority = priorityConfig[notification.priority]
  const type = typeConfig[notification.type]
  const TypeIcon = type.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer",
      !notification.isRead && "border-l-4 border-l-blue-500"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", priority.color)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon className={cn("h-4 w-4", type.color)} />
            <h4 className={cn(
              "font-medium text-gray-900",
              !notification.isRead && "font-semibold"
            )}>
              {notification.title}
            </h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{notification.source}</span>
            {notification.job && (
              <>
                <span className="text-gray-300">|</span>
                <span>{notification.job}</span>
              </>
            )}
            <span className="text-gray-300">|</span>
            <span>{notification.time}</span>
          </div>
          {notification.actionLabel && (
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                {notification.actionLabel}
              </button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Dismiss
              </button>
            </div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>
    </div>
  )
}

export function NotificationsPreview() {
  const [priorityFilter, setPriorityFilter] = useState('all')

  const unreadCount = mockNotifications.filter(n => !n.isRead).length
  const urgentCount = mockNotifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length

  const filteredNotifications = priorityFilter === 'all'
    ? mockNotifications
    : mockNotifications.filter(n => n.priority === priorityFilter)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {unreadCount} unread
              </span>
            )}
            {urgentCount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                {urgentCount} urgent
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Mark All Read
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <Settings className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">Unread: {unreadCount}</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Today: {mockNotifications.filter(n => n.time.includes('hrs')).length}</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">This Week: {mockNotifications.length}</span>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
        {['all', 'urgent', 'high', 'normal', 'low'].map(priority => (
          <button
            key={priority}
            onClick={() => setPriorityFilter(priority)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors capitalize",
              priorityFilter === priority
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {priority === 'all' ? 'All' : priority}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications.map(notification => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No notifications found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Email digest: Daily at 7am | Push: Urgent only
          </span>
          <button className="text-blue-600 hover:text-blue-700">
            Notification Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
