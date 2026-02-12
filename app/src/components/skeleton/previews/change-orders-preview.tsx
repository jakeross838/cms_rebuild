'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  FileText,
  Clock,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  DollarSign,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChangeOrder {
  id: string
  coNumber: string
  description: string
  amount: number
  requestedBy: string
  date: string
  scheduleImpact: number // days
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  type: 'owner_requested' | 'field_condition' | 'design_change' | 'code_compliance' | 'allowance_adjustment'
  costCode?: string
  aiNote?: string
}

const mockChangeOrders: ChangeOrder[] = [
  {
    id: '1',
    coNumber: 'CO-001',
    description: 'Upgraded master bath tile to porcelain slab',
    amount: 4800,
    requestedBy: 'Owner',
    date: '2024-01-15',
    scheduleImpact: 0,
    status: 'approved',
    type: 'owner_requested',
    costCode: '09 - Finishes',
  },
  {
    id: '2',
    coNumber: 'CO-002',
    description: 'Additional piling due to soil conditions',
    amount: 18500,
    requestedBy: 'Field',
    date: '2024-01-22',
    scheduleImpact: 5,
    status: 'approved',
    type: 'field_condition',
    costCode: '03 - Concrete',
    aiNote: 'Similar soil issues on 3 nearby projects - recommend budgeting +10% for coastal sites',
  },
  {
    id: '3',
    coNumber: 'CO-003',
    description: 'Complex hip roof design modification',
    amount: 12000,
    requestedBy: 'Architect',
    date: '2024-02-01',
    scheduleImpact: 3,
    status: 'pending_approval',
    type: 'design_change',
    costCode: '06 - Carpentry',
    aiNote: 'Awaiting owner approval for 8 days - consider follow-up',
  },
  {
    id: '4',
    coNumber: 'CO-004',
    description: 'Kitchen appliance upgrade - Wolf/Sub-Zero package',
    amount: 15200,
    requestedBy: 'Owner',
    date: '2024-02-05',
    scheduleImpact: 2,
    status: 'pending_approval',
    type: 'allowance_adjustment',
    costCode: '11 - Equipment',
  },
  {
    id: '5',
    coNumber: 'CO-005',
    description: 'Hurricane shutters for additional windows',
    amount: 8900,
    requestedBy: 'Code Official',
    date: '2024-02-08',
    scheduleImpact: 0,
    status: 'draft',
    type: 'code_compliance',
    costCode: '08 - Doors & Windows',
  },
  {
    id: '6',
    coNumber: 'CO-006',
    description: 'Delete guest bath upgrade - revert to standard',
    amount: -2400,
    requestedBy: 'Owner',
    date: '2024-02-10',
    scheduleImpact: -1,
    status: 'approved',
    type: 'owner_requested',
    costCode: '09 - Finishes',
  },
  {
    id: '7',
    coNumber: 'CO-007',
    description: 'Relocate HVAC equipment per structural requirements',
    amount: 3200,
    requestedBy: 'Engineer',
    date: '2024-02-12',
    scheduleImpact: 0,
    status: 'rejected',
    type: 'design_change',
    costCode: '23 - HVAC',
  },
]

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const typeConfig = {
  owner_requested: { label: 'Owner Requested', color: 'bg-blue-50 text-blue-700' },
  field_condition: { label: 'Field Condition', color: 'bg-orange-50 text-orange-700' },
  design_change: { label: 'Design Change', color: 'bg-purple-50 text-purple-700' },
  code_compliance: { label: 'Code Compliance', color: 'bg-red-50 text-red-700' },
  allowance_adjustment: { label: 'Allowance Adj.', color: 'bg-teal-50 text-teal-700' },
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  if (absValue >= 1000000) return (value >= 0 ? '+' : '-') + '$' + (absValue / 1000000).toFixed(2) + 'M'
  if (absValue >= 1000) return (value >= 0 ? '+' : '-') + '$' + (absValue / 1000).toFixed(1) + 'K'
  return (value >= 0 ? '+' : '-') + '$' + absValue.toFixed(0)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ChangeOrderCard({ co }: { co: ChangeOrder }) {
  const statusInfo = statusConfig[co.status]
  const typeInfo = typeConfig[co.type]
  const StatusIcon = statusInfo.icon

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold text-gray-900">{co.coNumber}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded font-medium", statusInfo.color)}>
            <StatusIcon className="h-3 w-3 inline mr-1" />
            {statusInfo.label}
          </span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{co.description}</p>

      <div className="flex items-center gap-4 mb-3">
        <div className={cn(
          "text-lg font-bold",
          co.amount >= 0 ? "text-red-600" : "text-green-600"
        )}>
          {formatCurrency(co.amount)}
        </div>
        <span className={cn("text-xs px-2 py-0.5 rounded", typeInfo.color)}>
          {typeInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3" />
          <span>{co.requestedBy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(co.date)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span className={cn(
            co.scheduleImpact > 0 ? "text-amber-600 font-medium" :
            co.scheduleImpact < 0 ? "text-green-600 font-medium" :
            "text-gray-500"
          )}>
            {co.scheduleImpact > 0 ? `+${co.scheduleImpact} days` :
             co.scheduleImpact < 0 ? `${co.scheduleImpact} days` :
             'No impact'}
          </span>
        </div>
      </div>

      {co.aiNote && (
        <div className="mt-3 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{co.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function ChangeOrdersPreview() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredOrders = mockChangeOrders.filter(co => {
    if (statusFilter !== 'all' && co.status !== statusFilter) return false
    if (typeFilter !== 'all' && co.type !== typeFilter) return false
    return true
  })

  // Calculate quick stats
  const totalCOs = mockChangeOrders.length
  const approvedCOs = mockChangeOrders.filter(co => co.status === 'approved')
  const netChangeAmount = approvedCOs.reduce((sum, co) => sum + co.amount, 0)
  const pendingCount = mockChangeOrders.filter(co => co.status === 'pending_approval').length
  const pendingAmount = mockChangeOrders
    .filter(co => co.status === 'pending_approval')
    .reduce((sum, co) => sum + co.amount, 0)
  const totalScheduleImpact = approvedCOs.reduce((sum, co) => sum + co.scheduleImpact, 0)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Change Orders - Smith Residence</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{totalCOs} Total</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              Contract: $2.45M | {approvedCOs.length} approved changes
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New CO
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <ClipboardList className="h-4 w-4" />
              Total COs
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalCOs}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            netChangeAmount >= 0 ? "bg-red-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              netChangeAmount >= 0 ? "text-red-600" : "text-green-600"
            )}>
              {netChangeAmount >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              Net Change
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              netChangeAmount >= 0 ? "text-red-700" : "text-green-700"
            )}>
              {formatCurrency(netChangeAmount)}
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Clock className="h-4 w-4" />
              Pending Approval
            </div>
            <div className="text-xl font-bold text-amber-700 mt-1">
              {pendingCount} <span className="text-sm font-normal">({formatCurrency(pendingAmount)})</span>
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            totalScheduleImpact > 0 ? "bg-amber-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              totalScheduleImpact > 0 ? "text-amber-600" : "text-green-600"
            )}>
              <Calendar className="h-4 w-4" />
              Schedule Impact
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              totalScheduleImpact > 0 ? "text-amber-700" : "text-green-700"
            )}>
              {totalScheduleImpact > 0 ? `+${totalScheduleImpact}` : totalScheduleImpact} days
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="owner_requested">Owner Requested</option>
              <option value="field_condition">Field Condition</option>
              <option value="design_change">Design Change</option>
              <option value="code_compliance">Code Compliance</option>
              <option value="allowance_adjustment">Allowance Adjustment</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search COs..."
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Change Orders Grid */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredOrders.map(co => (
          <ChangeOrderCard key={co.id} co={co} />
        ))}
        {filteredOrders.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-400">
            No change orders match the selected filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700 flex-wrap">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              2 COs pending &gt;7 days
            </span>
            <span>|</span>
            <span>Field conditions 43% of net change (typical: 25%)</span>
            <span>|</span>
            <span>Similar projects avg. 5.2 COs, you have 7</span>
          </div>
        </div>
      </div>
    </div>
  )
}
