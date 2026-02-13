'use client'

import { useState } from 'react'
import {
  Bell,
  AlertTriangle,
  Clock,
  Sparkles,
  Settings,
  ChevronRight,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  BellOff,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Zap,
  FileText,
  DollarSign,
  Calendar,
  Shield,
  Inbox,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ---------------------------------------------------------------------------
// Types (aligned to Module 05 - Notification Engine spec)
// ---------------------------------------------------------------------------

interface Notification {
  id: string
  type: 'alert' | 'reminder' | 'ai_insight' | 'update' | 'approval'
  priority: 'critical' | 'urgent' | 'high' | 'normal' | 'low'
  category: 'financial' | 'schedule' | 'documents' | 'field_operations' | 'approvals' | 'system'
  title: string
  message: string
  source: string
  sourceModule: string
  job?: string
  jobId?: string
  entityType?: string
  entityId?: string
  time: string
  isRead: boolean
  snoozedUntil?: string
  actionLabel?: string
  secondaryActionLabel?: string
  channels: Array<'in_app' | 'email' | 'sms' | 'push'>
  deliveryStatus: Record<string, 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced'>
  idempotencyKey: string
}

interface UserChannelPreference {
  category: string
  categoryLabel: string
  inApp: boolean
  email: boolean
  sms: boolean
  push: boolean
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    priority: 'critical',
    category: 'financial',
    title: 'Draw #5 payment overdue',
    message: 'Payment of $185,000 was due yesterday. Client notified via portal. Lender submission may be affected.',
    source: 'Draw Requests',
    sourceModule: 'Module 15',
    job: 'Smith Residence',
    jobId: 'j-2026-003',
    entityType: 'draw_request',
    entityId: 'dr-005',
    time: '2 hrs ago',
    isRead: false,
    actionLabel: 'View Draw',
    secondaryActionLabel: 'Call Client',
    channels: ['in_app', 'email', 'sms'],
    deliveryStatus: { in_app: 'delivered', email: 'delivered', sms: 'delivered' },
    idempotencyKey: 'draw_overdue_dr005_20260212',
  },
  {
    id: '2',
    type: 'approval',
    priority: 'high',
    category: 'approvals',
    title: 'Invoice needs approval',
    message: '$12,450 for electrical rough-in from ABC Electric. AI matched to PO-J2026003-04, within budget. Confidence: 94%.',
    source: 'Invoices',
    sourceModule: 'Module 11',
    job: 'Smith Residence',
    jobId: 'j-2026-003',
    entityType: 'invoice',
    entityId: 'inv-1234',
    time: '4 hrs ago',
    isRead: false,
    actionLabel: 'Approve',
    secondaryActionLabel: 'Review Details',
    channels: ['in_app', 'email'],
    deliveryStatus: { in_app: 'delivered', email: 'delivered' },
    idempotencyKey: 'inv_approval_inv1234_20260212',
  },
  {
    id: '3',
    type: 'reminder',
    priority: 'high',
    category: 'schedule',
    title: 'Selection deadline approaching',
    message: 'Tile selection due in 3 days. Client hasn\'t logged into portal in 10 days. Lead time: 6 weeks.',
    source: 'Selections',
    sourceModule: 'Module 21',
    job: 'Johnson Beach House',
    jobId: 'j-2026-005',
    entityType: 'selection',
    entityId: 'sel-087',
    time: '5 hrs ago',
    isRead: false,
    actionLabel: 'Send Reminder',
    secondaryActionLabel: 'Extend Deadline',
    channels: ['in_app', 'email'],
    deliveryStatus: { in_app: 'delivered', email: 'delivered' },
    idempotencyKey: 'sel_deadline_sel087_20260212',
  },
  {
    id: '4',
    type: 'alert',
    priority: 'high',
    category: 'documents',
    title: 'Insurance certificate expiring',
    message: 'ABC Electric GL policy expires in 14 days. Auto-renewal request sent. Vendor notified.',
    source: 'Compliance',
    sourceModule: 'Module 10',
    entityType: 'insurance_certificate',
    entityId: 'coi-456',
    time: '6 hrs ago',
    isRead: false,
    actionLabel: 'View COI',
    channels: ['in_app', 'email'],
    deliveryStatus: { in_app: 'delivered', email: 'delivered' },
    idempotencyKey: 'coi_expiring_coi456_20260212',
  },
  {
    id: '5',
    type: 'ai_insight',
    priority: 'normal',
    category: 'financial',
    title: 'Cost trend detected',
    message: 'Lumber costs trending 8% higher than estimates this month across 3 active projects. Average: $4.85/bf vs estimate $4.50/bf.',
    source: 'Price Intelligence',
    sourceModule: 'Module 23',
    time: 'Yesterday',
    isRead: true,
    actionLabel: 'View Analysis',
    channels: ['in_app'],
    deliveryStatus: { in_app: 'delivered' },
    idempotencyKey: 'cost_trend_lumber_20260211',
  },
  {
    id: '6',
    type: 'update',
    priority: 'normal',
    category: 'schedule',
    title: 'Window delivery confirmed',
    message: '18 impact windows scheduled for delivery tomorrow 2pm. PO-J2026003-12 from Coastal Glass & Mirror.',
    source: 'Deliveries',
    sourceModule: 'Module 18',
    job: 'Smith Residence',
    jobId: 'j-2026-003',
    entityType: 'purchase_order',
    entityId: 'po-012',
    time: 'Yesterday',
    isRead: true,
    channels: ['in_app', 'email'],
    deliveryStatus: { in_app: 'delivered', email: 'delivered' },
    idempotencyKey: 'delivery_confirm_po012_20260211',
  },
  {
    id: '7',
    type: 'update',
    priority: 'normal',
    category: 'field_operations',
    title: 'Daily log submitted',
    message: 'Mike Rodriguez submitted daily log for Johnson Beach House. 4 vendors on site, framing 85% complete.',
    source: 'Daily Logs',
    sourceModule: 'Module 8',
    job: 'Johnson Beach House',
    jobId: 'j-2026-005',
    entityType: 'daily_log',
    entityId: 'dl-20260211',
    time: 'Yesterday',
    isRead: true,
    channels: ['in_app'],
    deliveryStatus: { in_app: 'delivered' },
    idempotencyKey: 'daily_log_dl20260211_20260211',
  },
  {
    id: '8',
    type: 'approval',
    priority: 'normal',
    category: 'approvals',
    title: 'Change order approved by client',
    message: 'CO-J2026003-004 ($3,200 - kitchen island upgrade) approved via e-signature. Budget updated automatically.',
    source: 'Change Orders',
    sourceModule: 'Module 17',
    job: 'Smith Residence',
    jobId: 'j-2026-003',
    entityType: 'change_order',
    entityId: 'co-004',
    time: '2 days ago',
    isRead: true,
    channels: ['in_app', 'email'],
    deliveryStatus: { in_app: 'delivered', email: 'delivered' },
    idempotencyKey: 'co_approved_co004_20260210',
  },
  {
    id: '9',
    type: 'alert',
    priority: 'low',
    category: 'system',
    title: 'Weekly backup completed',
    message: 'Full data export completed successfully. 2.4 GB, 23,456 records. Download available for 72 hours.',
    source: 'System',
    sourceModule: 'Module 3',
    time: '3 days ago',
    isRead: true,
    channels: ['in_app'],
    deliveryStatus: { in_app: 'delivered' },
    idempotencyKey: 'backup_complete_20260209',
  },
  {
    id: '10',
    type: 'ai_insight',
    priority: 'normal',
    category: 'field_operations',
    title: 'Weather risk for tomorrow',
    message: '70% chance of rain forecast. Concrete pour scheduled for Smith Residence may need to be rescheduled. 2-day delay impact on critical path.',
    source: 'Schedule Intelligence',
    sourceModule: 'Module 25',
    job: 'Smith Residence',
    jobId: 'j-2026-003',
    time: '3 days ago',
    isRead: true,
    actionLabel: 'View Schedule',
    channels: ['in_app', 'push'],
    deliveryStatus: { in_app: 'delivered', push: 'delivered' },
    idempotencyKey: 'weather_risk_j2026003_20260209',
  },
]

const mockChannelPreferences: UserChannelPreference[] = [
  { category: 'financial', categoryLabel: 'Financial', inApp: true, email: true, sms: false, push: false },
  { category: 'schedule', categoryLabel: 'Schedule', inApp: true, email: true, sms: false, push: true },
  { category: 'documents', categoryLabel: 'Documents', inApp: true, email: false, sms: false, push: false },
  { category: 'field_operations', categoryLabel: 'Field Operations', inApp: true, email: false, sms: false, push: false },
  { category: 'approvals', categoryLabel: 'Approvals', inApp: true, email: true, sms: false, push: true },
  { category: 'system', categoryLabel: 'System', inApp: true, email: false, sms: false, push: false },
]

// ---------------------------------------------------------------------------
// Priority & Type Configs
// ---------------------------------------------------------------------------

const priorityConfig = {
  critical: { color: 'bg-red-600', label: 'Critical', bgColor: 'bg-red-50', textColor: 'text-red-800', borderColor: 'border-l-red-600' },
  urgent: { color: 'bg-red-500', label: 'Urgent', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-l-red-500' },
  high: { color: 'bg-amber-500', label: 'High', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-l-amber-500' },
  normal: { color: 'bg-blue-500', label: 'Normal', bgColor: 'bg-white', textColor: 'text-blue-700', borderColor: 'border-l-blue-500' },
  low: { color: 'bg-gray-400', label: 'Low', bgColor: 'bg-white', textColor: 'text-gray-700', borderColor: 'border-l-gray-400' },
}

const typeConfig = {
  alert: { icon: AlertTriangle, color: 'text-red-500' },
  reminder: { icon: Clock, color: 'text-amber-500' },
  ai_insight: { icon: Sparkles, color: 'text-purple-500' },
  update: { icon: Bell, color: 'text-blue-500' },
  approval: { icon: CheckCircle2, color: 'text-green-500' },
}

const categoryIcons: Record<string, React.ElementType> = {
  financial: DollarSign,
  schedule: Calendar,
  documents: FileText,
  field_operations: AlertTriangle,
  approvals: Shield,
  system: Settings,
}

// ---------------------------------------------------------------------------
// NotificationCard
// ---------------------------------------------------------------------------

function NotificationCard({ notification }: { notification: Notification }) {
  const priority = priorityConfig[notification.priority]
  const type = typeConfig[notification.type]
  const TypeIcon = type.icon
  const CategoryIcon = categoryIcons[notification.category] || Bell

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer",
      !notification.isRead && "border-l-4",
      !notification.isRead && priority.borderColor
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
            {notification.type === 'ai_insight' && (
              <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

          {/* Metadata row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <CategoryIcon className="h-3 w-3" />
              {notification.source}
            </span>
            {notification.sourceModule && (
              <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{notification.sourceModule}</span>
            )}
            {notification.job && (
              <>
                <span className="text-gray-300">|</span>
                <span className="bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded">{notification.job}</span>
              </>
            )}
            {notification.entityType && notification.entityId && (
              <>
                <span className="text-gray-300">|</span>
                <span className="bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded font-mono">{notification.entityId}</span>
              </>
            )}
            <span className="text-gray-300">|</span>
            <span>{notification.time}</span>
          </div>

          {/* Delivery channel indicators */}
          <div className="flex items-center gap-2 mt-2">
            {notification.channels.map(channel => {
              const status = notification.deliveryStatus[channel]
              return (
                <span key={channel} className={cn(
                  "text-xs flex items-center gap-1 px-1.5 py-0.5 rounded",
                  status === 'delivered' ? "bg-green-50 text-green-600" :
                  status === 'sent' ? "bg-blue-50 text-blue-600" :
                  status === 'failed' ? "bg-red-50 text-red-600" :
                  "bg-gray-50 text-gray-500"
                )}>
                  {channel === 'in_app' && <Inbox className="h-3 w-3" />}
                  {channel === 'email' && <Mail className="h-3 w-3" />}
                  {channel === 'sms' && <MessageSquare className="h-3 w-3" />}
                  {channel === 'push' && <Smartphone className="h-3 w-3" />}
                  {channel}
                </span>
              )
            })}
          </div>

          {/* Action buttons */}
          {(notification.actionLabel || notification.secondaryActionLabel) && (
            <div className="flex gap-2 mt-3">
              {notification.actionLabel && (
                <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                  {notification.actionLabel}
                </button>
              )}
              {notification.secondaryActionLabel && (
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  {notification.secondaryActionLabel}
                </button>
              )}
              <button className="px-3 py-1 text-xs text-gray-400 hover:text-gray-600">
                Snooze
              </button>
              <button className="px-3 py-1 text-xs text-gray-400 hover:text-gray-600">
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

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function NotificationsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all')
  const [filterType, setFilterType] = useState<string | 'all'>('all')

  const unreadCount = mockNotifications.filter(n => !n.isRead).length
  const criticalCount = mockNotifications.filter(n => n.priority === 'critical').length
  const urgentCount = mockNotifications.filter(n => n.priority === 'critical' || n.priority === 'urgent').length
  const highCount = mockNotifications.filter(n => n.priority === 'high').length

  const filteredNotifications = sortItems(
    mockNotifications.filter(n => {
      if (!matchesSearch(n, search, ['title', 'message', 'source', 'job', 'entityId'])) return false
      if (activeTab !== 'all') {
        if (activeTab === 'unread' && n.isRead) return false
        if (activeTab !== 'unread' && n.priority !== activeTab) return false
      }
      if (filterCategory !== 'all' && n.category !== filterCategory) return false
      if (filterType !== 'all' && n.type !== filterType) return false
      return true
    }),
    activeSort as keyof Notification | '',
    sortDirection,
  )

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Notification Center</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
              {unreadCount} unread
            </span>
          )}
          {criticalCount > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalCount} critical
            </span>
          )}
          {highCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
              {urgentCount + highCount} urgent/high
            </span>
          )}
          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Module 5</span>
          <div className="flex-1" />
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Mark All Read
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded" title="Notification Preferences">
            <Settings className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search notifications..."
          tabs={[
            { key: 'all', label: 'All', count: mockNotifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'critical', label: 'Critical', count: criticalCount },
            { key: 'urgent', label: 'Urgent', count: mockNotifications.filter(n => n.priority === 'urgent').length },
            { key: 'high', label: 'High', count: mockNotifications.filter(n => n.priority === 'high').length },
            { key: 'normal', label: 'Normal', count: mockNotifications.filter(n => n.priority === 'normal').length },
            { key: 'low', label: 'Low', count: mockNotifications.filter(n => n.priority === 'low').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Categories',
              value: filterCategory,
              options: [
                { value: 'financial', label: 'Financial' },
                { value: 'schedule', label: 'Schedule' },
                { value: 'documents', label: 'Documents' },
                { value: 'field_operations', label: 'Field Operations' },
                { value: 'approvals', label: 'Approvals' },
                { value: 'system', label: 'System' },
              ],
              onChange: (v) => setFilterCategory(v),
            },
            {
              label: 'All Types',
              value: filterType,
              options: [
                { value: 'alert', label: 'Alerts' },
                { value: 'reminder', label: 'Reminders' },
                { value: 'approval', label: 'Approvals' },
                { value: 'ai_insight', label: 'AI Insights' },
                { value: 'update', label: 'Updates' },
              ],
              onChange: (v) => setFilterType(v),
            },
          ]}
          sortOptions={[
            { value: 'time', label: 'Time' },
            { value: 'priority', label: 'Priority' },
            { value: 'source', label: 'Source' },
            { value: 'category', label: 'Category' },
            { value: 'title', label: 'Title' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredNotifications.length}
          totalCount={mockNotifications.length}
        />
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-500">Unread: <span className="font-medium text-gray-900">{unreadCount}</span></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Today: <span className="font-medium text-gray-900">{mockNotifications.filter(n => n.time.includes('hrs') || n.time === 'Now').length}</span></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">This Week: <span className="font-medium text-gray-900">{mockNotifications.length}</span></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            AI Insights: <span className="font-medium text-gray-900">{mockNotifications.filter(n => n.type === 'ai_insight').length}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            Approvals: <span className="font-medium text-gray-900">{mockNotifications.filter(n => n.type === 'approval').length}</span>
          </span>
        </div>
      </div>

      {/* Channel Preference Summary */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="font-medium text-gray-600">Delivery channels:</span>
          <span className="flex items-center gap-1"><Inbox className="h-3 w-3" /> In-App (all)</span>
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email (Financial, Approvals, Schedule)</span>
          <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> Push (Schedule, Approvals)</span>
          <span className="flex items-center gap-1"><VolumeX className="h-3 w-3" /> Quiet: 10pm-7am EST</span>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-500" /> Critical bypasses quiet hours</span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredNotifications.map(notification => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No notifications found
          </div>
        )}
      </div>

      {/* Footer - Digest & Preferences */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email digest: Daily at 7am
            </span>
            <span className="flex items-center gap-1">
              <Smartphone className="h-4 w-4" />
              Push: Urgent + Critical only
            </span>
            <span className="flex items-center gap-1">
              <BellOff className="h-4 w-4" />
              Muted projects: 0
            </span>
          </div>
          <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Notification Preferences <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Priority Scoring',
            insight: 'Ranks notifications by importance',
          },
          {
            feature: 'Smart Grouping',
            insight: 'Groups related notifications',
          },
          {
            feature: 'Delivery Optimization',
            insight: 'Chooses best delivery channel',
          },
          {
            feature: 'Noise Reduction',
            insight: 'Filters low-value notifications',
          },
          {
            feature: 'Action Suggestions',
            insight: 'Recommends next actions',
          },
        ]}
      />
    </div>
  )
}
