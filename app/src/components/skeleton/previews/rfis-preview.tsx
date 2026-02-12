'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Flag,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RFI {
  id: string
  number: string
  subject: string
  from: {
    name: string
    company: string
  }
  to: {
    name: string
    company: string
  }
  dateSubmitted: string
  daysOpen: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'pending' | 'answered' | 'closed'
  category?: string
  aiNote?: string
}

const mockRFIs: RFI[] = [
  {
    id: '1',
    number: 'RFI-001',
    subject: 'Foundation reinforcement detail at grid line B-4',
    from: { name: 'Mike Johnson', company: 'ABC Framing' },
    to: { name: 'Sarah Chen', company: 'Smith Architects' },
    dateSubmitted: 'Jan 15, 2025',
    daysOpen: 12,
    priority: 'high',
    status: 'open',
    category: 'Structural',
    aiNote: 'Similar RFIs took avg 5 days to resolve. Consider escalating.',
  },
  {
    id: '2',
    number: 'RFI-002',
    subject: 'Exterior paint color clarification - south elevation',
    from: { name: 'Tom Williams', company: 'Premier Painting' },
    to: { name: 'Lisa Anderson', company: 'Owner Rep' },
    dateSubmitted: 'Jan 18, 2025',
    daysOpen: 9,
    priority: 'low',
    status: 'pending',
    category: 'Finishes',
  },
  {
    id: '3',
    number: 'RFI-003',
    subject: 'HVAC ductwork routing conflict with beam at corridor',
    from: { name: 'James Garcia', company: 'Cool Air HVAC' },
    to: { name: 'Sarah Chen', company: 'Smith Architects' },
    dateSubmitted: 'Jan 20, 2025',
    daysOpen: 7,
    priority: 'critical',
    status: 'open',
    category: 'MEP',
    aiNote: 'Blocking framing work. Impacts critical path by 3 days if unresolved.',
  },
  {
    id: '4',
    number: 'RFI-004',
    subject: 'Window header size confirmation for impact windows',
    from: { name: 'Mike Johnson', company: 'ABC Framing' },
    to: { name: 'Sarah Chen', company: 'Smith Architects' },
    dateSubmitted: 'Jan 10, 2025',
    daysOpen: 0,
    priority: 'high',
    status: 'answered',
    category: 'Structural',
  },
  {
    id: '5',
    number: 'RFI-005',
    subject: 'Tile layout pattern for master bathroom',
    from: { name: 'Robert Lee', company: 'Quality Tile Co' },
    to: { name: 'Lisa Anderson', company: 'Owner Rep' },
    dateSubmitted: 'Jan 22, 2025',
    daysOpen: 5,
    priority: 'medium',
    status: 'pending',
    category: 'Finishes',
  },
  {
    id: '6',
    number: 'RFI-006',
    subject: 'Electrical panel location per code requirements',
    from: { name: 'David Park', company: 'Smith Electric' },
    to: { name: 'Sarah Chen', company: 'Smith Architects' },
    dateSubmitted: 'Dec 28, 2024',
    daysOpen: 0,
    priority: 'high',
    status: 'closed',
    category: 'MEP',
  },
]

const statusConfig = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' },
  pending: { label: 'Pending Response', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
  answered: { label: 'Answered', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600', dotColor: 'bg-gray-400' },
}

const priorityConfig = {
  low: { label: 'Low', color: 'text-gray-500', bgColor: 'bg-gray-100' },
  medium: { label: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  high: { label: 'High', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  critical: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50' },
}

function RFICard({ rfi }: { rfi: RFI }) {
  const status = statusConfig[rfi.status]
  const priority = priorityConfig[rfi.priority]
  const isOverdue = rfi.daysOpen > 7 && (rfi.status === 'open' || rfi.status === 'pending')

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer",
      isOverdue ? "border-red-200" : "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            priority.bgColor
          )}>
            <MessageSquare className={cn("h-4 w-4", priority.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-gray-500">{rfi.number}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", status.color)}>
                {status.label}
              </span>
            </div>
            <h4 className="font-medium text-gray-900 mt-1 line-clamp-2">{rfi.subject}</h4>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-3.5 w-3.5 text-gray-400" />
          <div className="truncate">
            <span className="text-gray-500">From: </span>
            <span className="text-gray-700">{rfi.from.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
          <div className="truncate">
            <span className="text-gray-500">To: </span>
            <span className="text-gray-700">{rfi.to.name}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{rfi.dateSubmitted}</span>
          </div>
          {(rfi.status === 'open' || rfi.status === 'pending') && (
            <div className={cn(
              "flex items-center gap-1.5",
              isOverdue ? "text-red-600" : "text-gray-500"
            )}>
              <Clock className="h-3.5 w-3.5" />
              <span>{rfi.daysOpen} days</span>
              {isOverdue && <AlertTriangle className="h-3.5 w-3.5" />}
            </div>
          )}
          {rfi.status === 'answered' && (
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Responded</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rfi.category && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
              {rfi.category}
            </span>
          )}
          <div className={cn(
            "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded",
            priority.bgColor, priority.color
          )}>
            <Flag className="h-3 w-3" />
            <span>{priority.label}</span>
          </div>
        </div>
      </div>

      {rfi.aiNote && (
        <div className="mt-3 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{rfi.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function RFIsPreview() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const filteredRFIs = mockRFIs.filter(rfi => {
    if (statusFilter !== 'all' && rfi.status !== statusFilter) return false
    if (priorityFilter !== 'all' && rfi.priority !== priorityFilter) return false
    return true
  })

  // Calculate stats
  const openRFIs = mockRFIs.filter(r => r.status === 'open' || r.status === 'pending').length
  const overdueRFIs = mockRFIs.filter(r => r.daysOpen > 7 && (r.status === 'open' || r.status === 'pending')).length
  const avgResponseTime = Math.round(
    mockRFIs
      .filter(r => r.status === 'answered' || r.status === 'closed')
      .reduce((sum, r) => sum + (r.status === 'closed' ? 5 : 3), 0) /
    Math.max(mockRFIs.filter(r => r.status === 'answered' || r.status === 'closed').length, 1)
  )
  const closedThisMonth = mockRFIs.filter(r => r.status === 'closed').length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">RFIs - Smith Residence</h3>
              <span className="text-sm text-gray-500">{mockRFIs.length} total</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search RFIs..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New RFI
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <MessageSquare className="h-4 w-4" />
              Open RFIs
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{openRFIs}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="h-4 w-4" />
              Avg Response Time
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{avgResponseTime} days</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            overdueRFIs > 0 ? "bg-red-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              overdueRFIs > 0 ? "text-red-600" : "text-green-600"
            )}>
              <AlertTriangle className="h-4 w-4" />
              Overdue (&gt;7 days)
            </div>
            <div className={cn(
              "text-2xl font-bold mt-1",
              overdueRFIs > 0 ? "text-red-700" : "text-green-700"
            )}>
              {overdueRFIs}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Closed This Month
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">{closedThisMonth}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Status:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={cn(
                  "px-2.5 py-1 text-sm rounded-lg transition-colors",
                  statusFilter === 'all'
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                All
              </button>
              {Object.entries(statusConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={cn(
                    "px-2.5 py-1 text-sm rounded-lg transition-colors flex items-center gap-1.5",
                    statusFilter === key
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                  {config.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* RFI List */}
      <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
        {filteredRFIs.length > 0 ? (
          filteredRFIs.map(rfi => (
            <RFICard key={rfi.id} rfi={rfi} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            No RFIs match the selected filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <p className="text-sm text-amber-700">
            RFI-003 (HVAC conflict) is blocking critical path work. Architect responses average 4.2 days on structural RFIs.
            2 RFIs from ABC Framing this week - consider scheduling coordination call.
          </p>
        </div>
      </div>
    </div>
  )
}
