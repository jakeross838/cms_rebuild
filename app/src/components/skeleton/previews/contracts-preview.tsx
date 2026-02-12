'use client'

import { useState } from 'react'
import {
  FileText,
  Send,
  CheckCircle,
  Clock,
  PenTool,
  DollarSign,
  Sparkles,
  AlertTriangle,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  FileSignature,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contract {
  id: string
  clientName: string
  projectName: string
  contractValue: number
  date: string
  status: 'draft' | 'sent' | 'signed' | 'active' | 'complete'
  signatureStatus: 'pending' | 'client_signed' | 'fully_signed' | 'not_required'
  type: 'fixed_price' | 'cost_plus'
  daysSinceSent?: number
  aiNote?: string
}

const mockContracts: Contract[] = [
  {
    id: '1',
    clientName: 'John & Sarah Smith',
    projectName: 'Smith Residence',
    contractValue: 2450000,
    date: '2024-01-15',
    status: 'active',
    signatureStatus: 'fully_signed',
    type: 'fixed_price',
  },
  {
    id: '2',
    clientName: 'Robert Johnson',
    projectName: 'Johnson Beach House',
    contractValue: 320000,
    date: '2024-02-01',
    status: 'sent',
    signatureStatus: 'pending',
    type: 'cost_plus',
    daysSinceSent: 5,
    aiNote: 'Client typically signs within 3 days. Consider follow-up.',
  },
  {
    id: '3',
    clientName: 'David Miller',
    projectName: 'Miller Addition',
    contractValue: 250000,
    date: '2024-02-08',
    status: 'sent',
    signatureStatus: 'client_signed',
    type: 'fixed_price',
    daysSinceSent: 2,
  },
  {
    id: '4',
    clientName: 'Thomas Wilson',
    projectName: 'Wilson Custom Home',
    contractValue: 1200000,
    date: '2024-02-10',
    status: 'draft',
    signatureStatus: 'not_required',
    type: 'fixed_price',
    aiNote: 'High-value contract. Review terms before sending.',
  },
  {
    id: '5',
    clientName: 'Michael Davis',
    projectName: 'Davis Coastal Home',
    contractValue: 920000,
    date: '2024-01-20',
    status: 'complete',
    signatureStatus: 'fully_signed',
    type: 'cost_plus',
  },
  {
    id: '6',
    clientName: 'Emily Chen',
    projectName: 'Chen Renovation',
    contractValue: 185000,
    date: '2024-02-05',
    status: 'signed',
    signatureStatus: 'fully_signed',
    type: 'fixed_price',
  },
]

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
  signed: { label: 'Signed', color: 'bg-purple-100 text-purple-700', icon: PenTool },
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  complete: { label: 'Complete', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
}

const signatureConfig = {
  pending: { label: 'Awaiting Signature', color: 'text-amber-600', icon: Clock },
  client_signed: { label: 'Client Signed', color: 'text-blue-600', icon: PenTool },
  fully_signed: { label: 'Fully Executed', color: 'text-green-600', icon: CheckCircle },
  not_required: { label: 'Not Sent', color: 'text-gray-400', icon: FileText },
}

const typeConfig = {
  fixed_price: { label: 'Fixed Price', color: 'bg-indigo-50 text-indigo-700' },
  cost_plus: { label: 'Cost Plus', color: 'bg-teal-50 text-teal-700' },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ContractCard({ contract }: { contract: Contract }) {
  const status = statusConfig[contract.status]
  const signature = signatureConfig[contract.signatureStatus]
  const contractType = typeConfig[contract.type]
  const StatusIcon = status.icon
  const SignatureIcon = signature.icon

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{contract.projectName}</h4>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
            <User className="h-3.5 w-3.5" />
            <span>{contract.clientName}</span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={cn("text-xs px-2 py-1 rounded font-medium flex items-center gap-1", status.color)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
        <span className={cn("text-xs px-2 py-1 rounded font-medium", contractType.color)}>
          {contractType.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Contract Value</span>
          </div>
          <span className="font-semibold text-gray-900">{formatCurrency(contract.contractValue)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>Date</span>
          </div>
          <span className="text-gray-700">{formatDate(contract.date)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className={cn("flex items-center gap-1.5 text-sm", signature.color)}>
          <FileSignature className="h-4 w-4" />
          <SignatureIcon className="h-3.5 w-3.5" />
          <span>{signature.label}</span>
        </div>
        {contract.daysSinceSent && contract.status === 'sent' && (
          <span className="text-xs text-gray-500">
            {contract.daysSinceSent}d ago
          </span>
        )}
      </div>

      {contract.aiNote && (
        <div className="mt-3 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{contract.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function ContractsPreview() {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const statuses = ['all', 'draft', 'sent', 'signed', 'active', 'complete']
  const filteredContracts = statusFilter === 'all'
    ? mockContracts
    : mockContracts.filter(c => c.status === statusFilter)

  // Calculate quick stats
  const pendingSignature = mockContracts.filter(c =>
    c.signatureStatus === 'pending' || c.signatureStatus === 'client_signed'
  ).length

  const totalContractValue = mockContracts.reduce((sum, c) => sum + c.contractValue, 0)

  const sentContracts = mockContracts.filter(c => c.daysSinceSent !== undefined)
  const avgDaysToSign = sentContracts.length > 0
    ? Math.round(sentContracts.reduce((sum, c) => sum + (c.daysSinceSent || 0), 0) / sentContracts.length)
    : 0

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Contracts</h3>
            <span className="text-sm text-gray-500">{mockContracts.length} contracts | {formatCurrency(totalContractValue)} total value</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Contract
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Clock className="h-4 w-4" />
              Pending Signature
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{pendingSignature}</div>
            <div className="text-xs text-amber-600 mt-0.5">contracts awaiting signature</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Contract Value
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalContractValue)}</div>
            <div className="text-xs text-green-600 mt-0.5">across all contracts</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              Avg Days to Sign
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{avgDaysToSign} days</div>
            <div className="text-xs text-blue-600 mt-0.5">from sent to signed</div>
          </div>
        </div>
      </div>

      {/* E-Signature Indicator */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSignature className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">E-Signature Enabled</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">DocuSign Connected</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              3 fully executed
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              1 client signed
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              1 pending
            </span>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors capitalize",
              statusFilter === status
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {status}
            {status !== 'all' && (
              <span className="ml-1.5 text-xs text-gray-400">
                ({mockContracts.filter(c => c.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contract Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredContracts.map(contract => (
          <ContractCard key={contract.id} contract={contract} />
        ))}
        {filteredContracts.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No contracts found
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
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              1 contract pending 5+ days
            </span>
            <span>|</span>
            <span>Johnson Beach House typically signs within 3 days - follow up recommended</span>
            <span>|</span>
            <span>Wilson Custom: review high-value terms before sending</span>
          </div>
        </div>
      </div>
    </div>
  )
}
