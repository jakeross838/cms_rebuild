'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  User,
  Building2,
  ChevronRight,
  Sparkles,
  Star,
  Paperclip,
  Reply,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type CommunicationType = 'email' | 'call' | 'meeting' | 'note' | 'sms'
type CommunicationDirection = 'inbound' | 'outbound'

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
  },
]

const typeConfig: Record<CommunicationType, { icon: typeof Mail; label: string; color: string; bgColor: string }> = {
  email: { icon: Mail, label: 'Email', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  call: { icon: Phone, label: 'Call', color: 'text-green-600', bgColor: 'bg-green-100' },
  meeting: { icon: Calendar, label: 'Meeting', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  note: { icon: FileText, label: 'Note', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  sms: { icon: MessageSquare, label: 'SMS', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
}

function CommunicationRow({ communication }: { communication: Communication }) {
  const config = typeConfig[communication.type]
  const Icon = config.icon

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start gap-4">
        {/* Type Icon */}
        <div className={cn("p-2.5 rounded-lg flex-shrink-0", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 truncate">{communication.subject}</span>
                {communication.isImportant && (
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                )}
                {communication.hasAttachment && (
                  <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  {communication.direction === 'inbound' ? (
                    <>
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium">{communication.from}</span>
                      <span className="text-gray-400">({communication.fromRole})</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-400">To:</span>
                      <span>{communication.to.join(', ')}</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{communication.preview}</p>

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
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{communication.timeAgo}</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                  <Reply className="h-4 w-4" />
                </button>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CommunicationsPreview() {
  const [typeFilter, setTypeFilter] = useState<CommunicationType | 'all'>('all')
  const [personFilter, setPersonFilter] = useState<string>('all')

  const people = [...new Set([
    ...mockCommunications.map(c => c.from),
    ...mockCommunications.flatMap(c => c.to)
  ])].filter(Boolean)

  const filteredCommunications = mockCommunications.filter(c => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false
    if (personFilter !== 'all' && c.from !== personFilter && !c.to.includes(personFilter)) return false
    return true
  })

  // Calculate stats
  const emailCount = mockCommunications.filter(c => c.type === 'email').length
  const callCount = mockCommunications.filter(c => c.type === 'call').length
  const meetingCount = mockCommunications.filter(c => c.type === 'meeting').length
  const decisionsCount = mockCommunications.filter(c => c.hasDecision).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Communications - Smith Residence</h3>
              <span className="text-sm text-gray-500">47 this month</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Message
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
            <Mail className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-lg font-semibold text-blue-700">{emailCount}</div>
              <div className="text-xs text-blue-600">Emails</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
            <Phone className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-lg font-semibold text-green-700">{callCount}</div>
              <div className="text-xs text-green-600">Calls</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
            <Calendar className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-lg font-semibold text-purple-700">{meetingCount}</div>
              <div className="text-xs text-purple-600">Meetings</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-amber-500" />
            <div>
              <div className="text-lg font-semibold text-amber-700">{decisionsCount}</div>
              <div className="text-xs text-amber-600">Decisions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Type:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTypeFilter('all')}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-lg transition-colors",
                  typeFilter === 'all'
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                All
              </button>
              {Object.entries(typeConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key as CommunicationType)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg transition-colors flex items-center gap-1",
                    typeFilter === key
                      ? cn(config.bgColor, config.color, "font-medium")
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              className="appearance-none px-3 py-1.5 pr-8 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All People</option>
              {people.map(person => (
                <option key={person} value={person}>{person}</option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search communications..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Communication List */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {filteredCommunications.map(communication => (
          <CommunicationRow key={communication.id} communication={communication} />
        ))}
        {filteredCommunications.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No communications match your filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Summary:</span>
          </div>
          <div className="flex-1 text-sm text-amber-700">
            <p>This week: 12 emails, 5 calls, 2 meetings with client. Key topics: cabinet selections, kitchen layout change. 2 decisions logged, 3 action items pending.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
