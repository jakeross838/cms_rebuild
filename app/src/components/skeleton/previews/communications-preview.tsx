'use client'

import { useState } from 'react'
import {
  Plus,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  User,
  ChevronRight,
  Sparkles,
  Star,
  Paperclip,
  Reply,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  BellOff,
  Send,
  Eye,
  Zap,
  Shield,
  AlertTriangle,
  XCircle,
  Wifi,
  Globe,
  Settings,
  Volume2,
  VolumeX,
  Timer,
  BarChart3,
  Inbox,
  ArrowRightLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

type CommunicationType = 'email' | 'call' | 'meeting' | 'note' | 'sms' | 'push' | 'in_app'
type CommunicationDirection = 'inbound' | 'outbound'
type UrgencyLevel = 'low' | 'normal' | 'high' | 'critical'
type DeliveryStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced'
type NotificationCategory = 'financial' | 'schedule' | 'documents' | 'field_ops' | 'approvals' | 'system'

interface Communication {
  id: string
  type: CommunicationType
  direction: CommunicationDirection
  from: string
  fromRole: string
  to: string[]
  subject: string
  preview: string
  timestamp: string
  timeAgo: string
  isImportant: boolean
  hasAttachment: boolean
  hasDecision?: boolean
  decisionText?: string
  actionItem?: string
  urgency: UrgencyLevel
  deliveryStatus: DeliveryStatus
  deliveryChannel: CommunicationType[]
  category: NotificationCategory
  eventType?: string
  entityType?: string
  entityId?: string
  isRead: boolean
  isSnoozed?: boolean
  snoozeUntil?: string
  isMuted?: boolean
  digestBatched?: boolean
  batchCount?: number
  relatedModule?: string
}

const mockCommunications: Communication[] = [
  {
    id: '1',
    type: 'email',
    direction: 'inbound',
    from: 'John Smith',
    fromRole: 'Client',
    to: ['Jake Mitchell'],
    subject: 'RE: Selection Decisions - Kitchen Cabinets',
    preview: "We've decided to go with the upgraded shaker-style cabinets in the white oak finish. Sarah and I looked at the samples you sent over and...",
    timestamp: 'Feb 12, 2026 10:30 AM',
    timeAgo: '2 hours ago',
    isImportant: true,
    hasAttachment: false,
    hasDecision: true,
    decisionText: 'Client approved upgraded white oak shaker cabinets (+$4,200)',
    urgency: 'high',
    deliveryStatus: 'delivered',
    deliveryChannel: ['email', 'in_app'],
    category: 'approvals',
    eventType: 'selection.approved',
    entityType: 'selection',
    isRead: true,
    relatedModule: 'Selections (21)',
  },
  {
    id: '2',
    type: 'call',
    direction: 'outbound',
    from: 'Jake Mitchell',
    fromRole: 'PM',
    to: ['ABC Lumber Supply'],
    subject: 'Delivery Confirmation - Framing Materials',
    preview: 'Confirmed lumber delivery for Thursday 7am-9am. Driver will call 30 minutes before arrival. Discussed staging area at north side of lot.',
    timestamp: 'Feb 12, 2026 9:15 AM',
    timeAgo: '3 hours ago',
    isImportant: false,
    hasAttachment: false,
    actionItem: 'Prepare staging area by Wednesday EOD',
    urgency: 'normal',
    deliveryStatus: 'delivered',
    deliveryChannel: ['in_app'],
    category: 'schedule',
    eventType: 'delivery.confirmed',
    entityType: 'purchase_order',
    isRead: true,
    relatedModule: 'POs (18)',
  },
  {
    id: '3',
    type: 'meeting',
    direction: 'outbound',
    from: 'Jake Mitchell',
    fromRole: 'PM',
    to: ['John Smith', 'Sarah Smith', 'Mike Thompson'],
    subject: 'Site Visit - Progress Review',
    preview: 'Discussed kitchen layout change request. Client wants to move island 18" east. Need to verify with architect for structural implications. Client to confirm by Friday.',
    timestamp: 'Feb 11, 2026 2:00 PM',
    timeAgo: 'Yesterday',
    isImportant: true,
    hasAttachment: true,
    actionItem: 'Send revised layout to architect for review',
    hasDecision: true,
    decisionText: 'Client to confirm island relocation by Friday Feb 14',
    urgency: 'high',
    deliveryStatus: 'delivered',
    deliveryChannel: ['email', 'in_app', 'push'],
    category: 'approvals',
    eventType: 'meeting.completed',
    entityType: 'project',
    isRead: true,
    relatedModule: 'Change Orders (17)',
  },
  {
    id: '4',
    type: 'email',
    direction: 'outbound',
    from: 'Jake Mitchell',
    fromRole: 'PM',
    to: ['XYZ Electric'],
    subject: 'RE: Rough-in Schedule Confirmation',
    preview: 'Please confirm availability for Feb 19 start date for electrical rough-in. We need 2 electricians for 4 days per our scope discussion.',
    timestamp: 'Feb 11, 2026 11:30 AM',
    timeAgo: 'Yesterday',
    isImportant: false,
    hasAttachment: true,
    urgency: 'normal',
    deliveryStatus: 'sent',
    deliveryChannel: ['email'],
    category: 'schedule',
    eventType: 'schedule.confirmation_request',
    entityType: 'schedule_task',
    isRead: true,
    relatedModule: 'Scheduling (7)',
  },
  {
    id: '5',
    type: 'sms',
    direction: 'inbound',
    from: 'Mike Thompson',
    fromRole: 'Superintendent',
    to: ['Jake Mitchell'],
    subject: 'Quick Update',
    preview: 'Framing crew finished early. Starting on roof trusses tomorrow instead of Thursday. Should gain us 2 days on schedule.',
    timestamp: 'Feb 10, 2026 4:45 PM',
    timeAgo: '2 days ago',
    isImportant: false,
    hasAttachment: false,
    urgency: 'normal',
    deliveryStatus: 'delivered',
    deliveryChannel: ['sms', 'in_app'],
    category: 'schedule',
    eventType: 'schedule.ahead_of_plan',
    entityType: 'schedule_task',
    isRead: true,
    relatedModule: 'Daily Logs (8)',
  },
  {
    id: '6',
    type: 'note',
    direction: 'outbound',
    from: 'Jake Mitchell',
    fromRole: 'PM',
    to: [],
    subject: 'Internal Note - Budget Concern',
    preview: 'Framing costs tracking $8K over budget due to roof complexity. Need to discuss with client about potential CO for structural changes they requested.',
    timestamp: 'Feb 10, 2026 10:00 AM',
    timeAgo: '2 days ago',
    isImportant: true,
    hasAttachment: false,
    actionItem: 'Prepare CO documentation for client meeting',
    urgency: 'high',
    deliveryStatus: 'delivered',
    deliveryChannel: ['in_app'],
    category: 'financial',
    eventType: 'budget.variance_alert',
    entityType: 'budget',
    isRead: true,
    relatedModule: 'Budget (9)',
  },
  {
    id: '7',
    type: 'in_app',
    direction: 'inbound',
    from: 'System',
    fromRole: 'Notification Engine',
    to: ['Jake Mitchell'],
    subject: 'Invoice #INV-2026-089 Approved for Payment',
    preview: 'Invoice from ABC Lumber Supply for $12,450 has been approved by Sarah Ross. Payment scheduled for Feb 14. Cost code: 06-100 Framing Lumber.',
    timestamp: 'Feb 12, 2026 8:00 AM',
    timeAgo: '4 hours ago',
    isImportant: false,
    hasAttachment: false,
    urgency: 'normal',
    deliveryStatus: 'delivered',
    deliveryChannel: ['email', 'in_app'],
    category: 'financial',
    eventType: 'invoice.approved',
    entityType: 'invoice',
    isRead: false,
    relatedModule: 'Invoicing (11)',
  },
  {
    id: '8',
    type: 'push',
    direction: 'inbound',
    from: 'System',
    fromRole: 'Safety Alert',
    to: ['All Project Team'],
    subject: 'CRITICAL: Severe Weather Alert - Hurricane Watch',
    preview: 'NWS Hurricane Watch issued for Charleston County. Secure site materials and equipment. All outdoor work suspended starting Feb 13 6:00 AM.',
    timestamp: 'Feb 12, 2026 7:30 AM',
    timeAgo: '5 hours ago',
    isImportant: true,
    hasAttachment: false,
    urgency: 'critical',
    deliveryStatus: 'delivered',
    deliveryChannel: ['push', 'sms', 'email', 'in_app'],
    category: 'system',
    eventType: 'weather.severe_alert',
    entityType: 'project',
    isRead: true,
    relatedModule: 'Safety (33)',
  },
  {
    id: '9',
    type: 'in_app',
    direction: 'inbound',
    from: 'System',
    fromRole: 'Digest',
    to: ['Jake Mitchell'],
    subject: 'Daily Digest: 7 Notifications Batched',
    preview: '3 vendor invoice submissions, 2 schedule updates, 1 lien waiver received, 1 inspection passed. Click to expand details.',
    timestamp: 'Feb 11, 2026 8:00 AM',
    timeAgo: 'Yesterday',
    isImportant: false,
    hasAttachment: false,
    urgency: 'low',
    deliveryStatus: 'delivered',
    deliveryChannel: ['email', 'in_app'],
    category: 'system',
    eventType: 'digest.daily',
    entityType: 'digest',
    isRead: true,
    digestBatched: true,
    batchCount: 7,
    relatedModule: 'Notifications (5)',
  },
  {
    id: '10',
    type: 'email',
    direction: 'inbound',
    from: 'Coastal Insurance Co.',
    fromRole: 'Vendor',
    to: ['Jake Mitchell'],
    subject: 'COI Renewal - ABC Plumbing Expired',
    preview: 'Certificate of Insurance for ABC Plumbing has expired as of Feb 10, 2026. Updated COI required before work can continue per your subcontract terms.',
    timestamp: 'Feb 10, 2026 3:00 PM',
    timeAgo: '2 days ago',
    isImportant: true,
    hasAttachment: true,
    urgency: 'high',
    deliveryStatus: 'delivered',
    deliveryChannel: ['email', 'in_app', 'push'],
    category: 'documents',
    eventType: 'insurance.expired',
    entityType: 'vendor',
    isRead: false,
    actionItem: 'Contact ABC Plumbing for updated COI before next scheduled work',
    relatedModule: 'Vendors (10)',
  },
]

const typeConfig: Record<CommunicationType, { icon: typeof Mail; label: string; color: string; bgColor: string }> = {
  email: { icon: Mail, label: 'Email', color: 'text-stone-600', bgColor: 'bg-stone-100' },
  call: { icon: Phone, label: 'Call', color: 'text-green-600', bgColor: 'bg-green-100' },
  meeting: { icon: Calendar, label: 'Meeting', color: 'text-stone-600', bgColor: 'bg-warm-100' },
  note: { icon: FileText, label: 'Note', color: 'text-warm-600', bgColor: 'bg-warm-100' },
  sms: { icon: MessageSquare, label: 'SMS', color: 'text-stone-600', bgColor: 'bg-stone-100' },
  push: { icon: Bell, label: 'Push', color: 'text-red-600', bgColor: 'bg-red-100' },
  in_app: { icon: Inbox, label: 'In-App', color: 'text-stone-600', bgColor: 'bg-stone-100' },
}

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-warm-500', bgColor: 'bg-warm-100' },
  normal: { label: 'Normal', color: 'text-stone-600', bgColor: 'bg-stone-50' },
  high: { label: 'High', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  critical: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50' },
}

const deliveryStatusConfig: Record<DeliveryStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  queued: { label: 'Queued', icon: Clock, color: 'text-warm-400' },
  sent: { label: 'Sent', icon: Send, color: 'text-stone-500' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-500' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-red-500' },
  bounced: { label: 'Bounced', icon: AlertTriangle, color: 'text-amber-500' },
}

function CommunicationRow({ communication }: { communication: Communication }) {
  const config = typeConfig[communication.type]
  const Icon = config.icon
  const urgency = urgencyConfig[communication.urgency]
  const delivery = deliveryStatusConfig[communication.deliveryStatus]
  const DeliveryIcon = delivery.icon

  return (
    <div className={cn(
      "bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer",
      !communication.isRead ? "border-stone-200 bg-stone-50/30" : "border-warm-200",
      communication.urgency === 'critical' ? "border-l-4 border-l-red-500" : "",
      communication.urgency === 'high' ? "border-l-4 border-l-amber-400" : "",
    )}>
      <div className="flex items-start gap-4">
        {/* Type Icon */}
        <div className={cn("p-2.5 rounded-lg flex-shrink-0", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={cn("font-medium truncate", !communication.isRead ? "text-warm-900" : "text-warm-700")}>
                  {communication.subject}
                </span>
                {!communication.isRead && (
                  <span className="w-2 h-2 rounded-full bg-stone-500 flex-shrink-0" />
                )}
                {communication.isImportant && (
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                )}
                {communication.hasAttachment && (
                  <Paperclip className="h-4 w-4 text-warm-400 flex-shrink-0" />
                )}
                {communication.urgency !== 'normal' && communication.urgency !== 'low' && (
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", urgency.bgColor, urgency.color)}>
                    {urgency.label}
                  </span>
                )}
                {communication.digestBatched && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-50 text-stone-600 flex items-center gap-0.5">
                    <Timer className="h-2.5 w-2.5" />
                    Digest ({communication.batchCount})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-warm-600 mb-2">
                <span className="flex items-center gap-1">
                  {communication.direction === 'inbound' ? (
                    <>
                      <User className="h-3.5 w-3.5 text-warm-400" />
                      <span className="font-medium">{communication.from}</span>
                      <span className="text-warm-400">({communication.fromRole})</span>
                    </>
                  ) : (
                    <>
                      <span className="text-warm-400">To:</span>
                      <span>{communication.to.join(', ')}</span>
                    </>
                  )}
                </span>
                {communication.relatedModule && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-warm-100 text-warm-500 rounded">
                    {communication.relatedModule}
                  </span>
                )}
              </div>
              <p className="text-sm text-warm-600 line-clamp-2">{communication.preview}</p>

              {/* Delivery Channels */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-warm-400">Delivered via:</span>
                {communication.deliveryChannel.map(ch => {
                  const chConfig = typeConfig[ch]
                  const ChIcon = chConfig.icon
                  return (
                    <span key={ch} className="flex items-center gap-0.5 text-[10px] text-warm-500" title={chConfig.label}>
                      <ChIcon className="h-3 w-3" />
                    </span>
                  )
                })}
                <span title={delivery.label}><DeliveryIcon className={cn("h-3 w-3 ml-1", delivery.color)} /></span>
              </div>

              {/* Decision Badge */}
              {communication.hasDecision && communication.decisionText && (
                <div className="mt-2 p-2 bg-green-50 rounded-md flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-700">{communication.decisionText}</span>
                </div>
              )}

              {/* Action Item */}
              {communication.actionItem && !communication.hasDecision && (
                <div className="mt-2 p-2 bg-amber-50 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-amber-700">{communication.actionItem}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 text-xs text-warm-400">
                <Clock className="h-3 w-3" />
                <span>{communication.timeAgo}</span>
              </div>
              {communication.eventType && (
                <span className="text-[10px] text-warm-400 font-mono">{communication.eventType}</span>
              )}
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-warm-100 rounded text-warm-400 hover:text-warm-600" title="Reply">
                  <Reply className="h-4 w-4" />
                </button>
                <button className="p-1.5 hover:bg-warm-100 rounded text-warm-400 hover:text-warm-600" title="Snooze">
                  <BellOff className="h-4 w-4" />
                </button>
                <ChevronRight className="h-4 w-4 text-warm-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CommunicationsPreview() {
  const [personFilter, setPersonFilter] = useState<string>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()

  const people = [...new Set([
    ...mockCommunications.map(c => c.from),
    ...mockCommunications.flatMap(c => c.to)
  ])].filter(Boolean)

  const filteredCommunications = sortItems(
    mockCommunications.filter(c => {
      if (!matchesSearch(c, search, ['subject', 'preview', 'from', 'eventType', 'relatedModule'])) return false
      if (activeTab !== 'all' && c.type !== activeTab) return false
      if (personFilter !== 'all' && c.from !== personFilter && !c.to.includes(personFilter)) return false
      if (urgencyFilter !== 'all' && c.urgency !== urgencyFilter) return false
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false
      return true
    }),
    activeSort as keyof Communication | '',
    sortDirection,
  )

  // Calculate stats
  const unreadCount = mockCommunications.filter(c => !c.isRead).length
  const emailCount = mockCommunications.filter(c => c.type === 'email').length
  const criticalCount = mockCommunications.filter(c => c.urgency === 'critical').length
  const highCount = mockCommunications.filter(c => c.urgency === 'high').length
  const decisionsCount = mockCommunications.filter(c => c.hasDecision).length
  const actionItems = mockCommunications.filter(c => c.actionItem).length
  const deliveredCount = mockCommunications.filter(c => c.deliveryStatus === 'delivered').length
  const failedCount = mockCommunications.filter(c => c.deliveryStatus === 'failed' || c.deliveryStatus === 'bounced').length

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-warm-900">Communications - Smith Residence</h3>
          {unreadCount > 0 && (
            <span className="flex items-center gap-1 text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
              <Bell className="h-3 w-3" />
              {unreadCount} unread
            </span>
          )}
          <span className="text-sm text-warm-500">47 this month</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-green-600" title="SSE Connected">
              <Wifi className="h-3 w-3" />
              Live
            </span>
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search communications, event types..."
          tabs={[
            { key: 'all', label: 'All', count: mockCommunications.length },
            { key: 'email', label: 'Email', count: emailCount },
            { key: 'call', label: 'Call', count: mockCommunications.filter(c => c.type === 'call').length },
            { key: 'meeting', label: 'Meeting', count: mockCommunications.filter(c => c.type === 'meeting').length },
            { key: 'sms', label: 'SMS', count: mockCommunications.filter(c => c.type === 'sms').length },
            { key: 'push', label: 'Push', count: mockCommunications.filter(c => c.type === 'push').length },
            { key: 'in_app', label: 'In-App', count: mockCommunications.filter(c => c.type === 'in_app').length },
            { key: 'note', label: 'Note', count: mockCommunications.filter(c => c.type === 'note').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All People',
              value: personFilter,
              options: people.map(p => ({ value: p, label: p })),
              onChange: setPersonFilter,
            },
            {
              label: 'All Urgency',
              value: urgencyFilter,
              options: [
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'normal', label: 'Normal' },
                { value: 'low', label: 'Low' },
              ],
              onChange: setUrgencyFilter,
            },
            {
              label: 'All Categories',
              value: categoryFilter,
              options: [
                { value: 'financial', label: 'Financial' },
                { value: 'schedule', label: 'Schedule' },
                { value: 'documents', label: 'Documents' },
                { value: 'field_ops', label: 'Field Ops' },
                { value: 'approvals', label: 'Approvals' },
                { value: 'system', label: 'System' },
              ],
              onChange: setCategoryFilter,
            },
          ]}
          sortOptions={[
            { value: 'timestamp', label: 'Date' },
            { value: 'urgency', label: 'Urgency' },
            { value: 'subject', label: 'Subject' },
            { value: 'from', label: 'From' },
            { value: 'type', label: 'Type' },
            { value: 'category', label: 'Category' },
            { value: 'deliveryStatus', label: 'Delivery Status' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Plus, label: 'New Message', onClick: () => {}, variant: 'primary' },
            { icon: Settings, label: 'Preferences', onClick: () => {} },
          ]}
          resultCount={filteredCommunications.length}
          totalCount={mockCommunications.length}
        />
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-6 gap-3">
          <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
            <Bell className="h-5 w-5 text-stone-500" />
            <div>
              <div className="text-lg font-semibold text-stone-700">{unreadCount}</div>
              <div className="text-xs text-stone-600">Unread</div>
            </div>
          </div>
          <div className={cn("flex items-center gap-3 p-2 rounded-lg", criticalCount > 0 ? "bg-red-50" : "bg-warm-50")}>
            <AlertTriangle className={cn("h-5 w-5", criticalCount > 0 ? "text-red-500" : "text-warm-400")} />
            <div>
              <div className={cn("text-lg font-semibold", criticalCount > 0 ? "text-red-700" : "text-warm-700")}>{criticalCount}</div>
              <div className={cn("text-xs", criticalCount > 0 ? "text-red-600" : "text-warm-500")}>Critical</div>
            </div>
          </div>
          <div className={cn("flex items-center gap-3 p-2 rounded-lg", highCount > 0 ? "bg-amber-50" : "bg-warm-50")}>
            <Shield className={cn("h-5 w-5", highCount > 0 ? "text-amber-500" : "text-warm-400")} />
            <div>
              <div className={cn("text-lg font-semibold", highCount > 0 ? "text-amber-700" : "text-warm-700")}>{highCount}</div>
              <div className={cn("text-xs", highCount > 0 ? "text-amber-600" : "text-warm-500")}>High Priority</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-lg font-semibold text-green-700">{decisionsCount}</div>
              <div className="text-xs text-green-600">Decisions</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-sand-50 rounded-lg">
            <Zap className="h-5 w-5 text-sand-600" />
            <div>
              <div className="text-lg font-semibold text-sand-700">{actionItems}</div>
              <div className="text-xs text-sand-600">Action Items</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-warm-50 rounded-lg">
            <BarChart3 className="h-5 w-5 text-warm-500" />
            <div>
              <div className="text-lg font-semibold text-warm-700">{deliveredCount}/{mockCommunications.length}</div>
              <div className="text-xs text-warm-500">Delivered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences Summary Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-warm-500 font-medium">Preferences:</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded" title="In-app notifications active">
            <Inbox className="h-3 w-3" />
            In-App: On
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-stone-50 text-stone-700 rounded" title="Email delivery active">
            <Mail className="h-3 w-3" />
            Email: On
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-stone-50 text-stone-700 rounded" title="SMS delivery active">
            <MessageSquare className="h-3 w-3" />
            SMS: On
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-warm-50 text-warm-700 rounded" title="Push notifications active">
            <Bell className="h-3 w-3" />
            Push: On
          </span>
          <span className="text-warm-300">|</span>
          <span className="flex items-center gap-1 text-warm-500" title="Quiet hours active">
            <VolumeX className="h-3 w-3" />
            Quiet: 10pm-7am
          </span>
          <span className="flex items-center gap-1 text-warm-500" title="Digest mode">
            <Timer className="h-3 w-3" />
            Digest: Daily 8am
          </span>
          <span className="flex items-center gap-1 text-warm-500" title="Critical alerts bypass quiet hours">
            <Volume2 className="h-3 w-3 text-red-400" />
            Critical bypass: On
          </span>
        </div>
      </div>

      {/* Cross-Module Connections */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-warm-500 font-medium">Connections:</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-stone-50 text-stone-700 rounded">
            <Globe className="h-3 w-3" />
            All Modules (event emitters)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-warm-50 text-warm-700 rounded">
            <ArrowRightLeft className="h-3 w-3" />
            Auth & Roles (1)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded">
            <Eye className="h-3 w-3" />
            Dashboard (4)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
            <Mail className="h-3 w-3" />
            SendGrid/Twilio
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded">
            <Wifi className="h-3 w-3" />
            SSE Real-Time
          </span>
        </div>
      </div>

      {/* Communication List */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {filteredCommunications.map(communication => (
          <CommunicationRow key={communication.id} communication={communication} />
        ))}
        {filteredCommunications.length === 0 && (
          <div className="text-center py-8 text-warm-400 text-sm border-2 border-dashed border-warm-200 rounded-lg">
            No communications match your filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Summary:</span>
          </div>
          <div className="flex-1 text-sm text-amber-700 space-y-1">
            <p>This week: 12 emails, 5 calls, 2 meetings with client. Key topics: cabinet selections, kitchen layout change. 2 decisions logged, 3 action items pending.</p>
            <p>CRITICAL: Hurricane watch active. All-channel notification sent to project team. Critical alerts bypassed quiet hours for 4 team members.</p>
            <p>Digest efficiency: 7 low-priority notifications batched yesterday, reducing notification volume by 58% for this project.</p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI Features for Communications"
          features={[
            {
              feature: 'Response Time Tracking',
              trigger: 'Real-time',
              insight: 'Monitors communication response patterns. Average response time: 4.2 hours. Client emails responded within 2 hours on average.',
              detail: 'Tracks response times across all channels and identifies patterns. Alerts when responses exceed typical thresholds for priority communications.',
              confidence: 92,
              severity: 'info' as const,
              action: { label: 'View Analytics', onClick: () => {} },
            },
            {
              feature: 'Sentiment Analysis',
              trigger: 'Real-time',
              insight: 'Detects tone and urgency in messages. 2 messages flagged as frustrated tone requiring immediate attention.',
              detail: 'NLP analysis identifies emotional tone, urgency indicators, and potential issues before they escalate. Supports proactive client relationship management.',
              confidence: 88,
              severity: 'warning' as const,
              action: { label: 'Review Flagged', onClick: () => {} },
            },
            {
              feature: 'Thread Summarization',
              trigger: 'On-change',
              insight: 'AI-generated summaries of long threads. 3 email threads summarized with key decisions and action items extracted.',
              detail: 'Automatically generates concise summaries for threads with 5+ messages. Extracts key decisions, commitments, and follow-up items.',
              confidence: 91,
              severity: 'success' as const,
              action: { label: 'View Summaries', onClick: () => {} },
            },
            {
              feature: 'Follow-up Reminders',
              trigger: 'Daily',
              insight: 'Suggests when to follow up. 2 conversations flagged for follow-up: electrical rough-in confirmation and COI renewal.',
              detail: 'Analyzes conversation context and commitment dates to suggest optimal follow-up timing. Prevents important items from falling through the cracks.',
              confidence: 85,
              severity: 'warning' as const,
              action: { label: 'Set Reminders', onClick: () => {} },
            },
            {
              feature: 'Important Detection',
              trigger: 'Real-time',
              insight: 'Highlights critical communications. Auto-flagged 4 messages containing budget approvals, schedule changes, or safety alerts.',
              detail: 'Machine learning model trained on construction communications to identify high-priority messages requiring immediate attention.',
              confidence: 94,
              severity: 'critical' as const,
              action: { label: 'Review Critical', onClick: () => {} },
            },
          ]}
          columns={2}
        />
      </div>
    </div>
  )
}
