'use client'

import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  DollarSign,
  Sparkles,
  MoreHorizontal,
  Plus,
  User,
  TrendingDown,
  Building2,
  AlertCircle,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface BidRequest {
  id: string
  title: string
  jobName: string
  jobNumber: string
  costCode: string
  budgetAmount: number
  dueDate: string
  status: 'draft' | 'sent' | 'closed' | 'awarded'
  bidsReceived: number
  bidsExpected: number
  lowestBid?: number
  recommendedVendor?: string
  recommendedAmount?: number
  aiNote?: string
}

const mockBids: BidRequest[] = [
  {
    id: '1',
    title: 'Electrical Rough-In',
    jobName: 'Smith Residence',
    jobNumber: '16000',
    costCode: '16-100',
    budgetAmount: 12000,
    dueDate: '2025-02-15',
    status: 'closed',
    bidsReceived: 3,
    bidsExpected: 4,
    lowestBid: 11200,
    recommendedVendor: 'XYZ Electric',
    recommendedAmount: 11200,
    aiNote: 'XYZ Electric lowest at $11,200 (7% under budget). Good reliability (88). Recommend award.',
  },
  {
    id: '2',
    title: 'Plumbing Finish',
    jobName: 'Smith Residence',
    jobNumber: '15000',
    costCode: '15-200',
    budgetAmount: 8500,
    dueDate: '2025-02-18',
    status: 'sent',
    bidsReceived: 2,
    bidsExpected: 3,
    aiNote: 'Awaiting 1 more bid from Jones Plumbing. Due in 3 days.',
  },
  {
    id: '3',
    title: 'HVAC Installation',
    jobName: 'Johnson Beach House',
    jobNumber: '15500',
    costCode: '15-500',
    budgetAmount: 22000,
    dueDate: '2025-02-08',
    status: 'awarded',
    bidsReceived: 4,
    bidsExpected: 4,
    lowestBid: 21500,
    recommendedVendor: 'ABC HVAC',
    recommendedAmount: 21500,
  },
  {
    id: '4',
    title: 'Framing Package',
    jobName: 'Miller Addition',
    jobNumber: '06000',
    costCode: '06-100',
    budgetAmount: 45000,
    dueDate: '2025-02-20',
    status: 'draft',
    bidsReceived: 0,
    bidsExpected: 5,
    aiNote: 'Recommend inviting: ABC Framing (score 96), Smith Framing (score 91), Coastal Carpentry (score 88)',
  },
  {
    id: '5',
    title: 'Windows & Doors',
    jobName: 'Wilson Custom Home',
    jobNumber: '08000',
    costCode: '08-100',
    budgetAmount: 68000,
    dueDate: '2025-02-25',
    status: 'sent',
    bidsReceived: 1,
    bidsExpected: 3,
    aiNote: 'PGT submitted $65,800 (4% under budget). Waiting on 2 more vendors.',
  },
]

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  sent: { label: 'Awaiting', color: 'bg-blue-100 text-blue-700', icon: Send },
  closed: { label: 'Ready', color: 'bg-amber-100 text-amber-700', icon: CheckCircle2 },
  awarded: { label: 'Awarded', color: 'bg-green-100 text-green-700', icon: Award },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function BidCard({ bid }: { bid: BidRequest }) {
  const status = statusConfig[bid.status]
  const StatusIcon = status.icon
  const savings = bid.lowestBid ? bid.budgetAmount - bid.lowestBid : 0
  const savingsPercent = bid.lowestBid ? ((savings / bid.budgetAmount) * 100).toFixed(0) : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{bid.title}</h4>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>{bid.jobName}</span>
            <span className="text-gray-300">|</span>
            <span className="font-mono text-xs">{bid.costCode}</span>
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
        {bid.status !== 'awarded' && (
          <span className="text-xs text-gray-500">
            Due: {formatDate(bid.dueDate)}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Budget</span>
          </div>
          <span className="font-medium text-gray-900">{formatCurrency(bid.budgetAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <User className="h-3.5 w-3.5" />
            <span>Bids Received</span>
          </div>
          <span className={cn(
            "font-medium",
            bid.bidsReceived >= bid.bidsExpected ? "text-green-600" : "text-gray-900"
          )}>
            {bid.bidsReceived} of {bid.bidsExpected}
          </span>
        </div>
        {bid.lowestBid && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>Lowest Bid</span>
            </div>
            <span className="font-medium text-green-600">
              {formatCurrency(bid.lowestBid)}
              <span className="text-xs text-green-500 ml-1">(-{savingsPercent}%)</span>
            </span>
          </div>
        )}
      </div>

      {bid.recommendedVendor && bid.status === 'closed' && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm">
              <Award className="h-4 w-4 text-amber-500" />
              <span className="text-gray-600">Recommended:</span>
              <span className="font-medium text-gray-900">{bid.recommendedVendor}</span>
            </div>
            <button className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
              Award
            </button>
          </div>
        </div>
      )}

      {bid.aiNote && (
        <div className="mt-3 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{bid.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function BidsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })

  const filteredBids = sortItems(
    mockBids.filter(bid => {
      if (!matchesSearch(bid, search, ['title', 'jobName', 'costCode'])) return false
      if (activeTab !== 'all' && bid.status !== activeTab) return false
      return true
    }),
    activeSort as keyof BidRequest | '',
    sortDirection,
  )

  // Calculate quick stats
  const openBids = mockBids.filter(b => b.status === 'sent' || b.status === 'closed').length
  const awaitingValue = mockBids
    .filter(b => b.status === 'sent' || b.status === 'closed')
    .reduce((sum, b) => sum + b.budgetAmount, 0)
  const totalSavings = mockBids
    .filter(b => b.lowestBid)
    .reduce((sum, b) => sum + (b.budgetAmount - (b.lowestBid || 0)), 0)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Bid Requests</h3>
          <span className="text-sm text-gray-500">{mockBids.length} bid packages</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search bids..."
          tabs={[
            { key: 'all', label: 'All', count: mockBids.length },
            { key: 'draft', label: 'Draft', count: mockBids.filter(b => b.status === 'draft').length },
            { key: 'sent', label: 'Awaiting', count: mockBids.filter(b => b.status === 'sent').length },
            { key: 'closed', label: 'Ready', count: mockBids.filter(b => b.status === 'closed').length },
            { key: 'awarded', label: 'Awarded', count: mockBids.filter(b => b.status === 'awarded').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'title', label: 'Title' },
            { value: 'budgetAmount', label: 'Budget' },
            { value: 'dueDate', label: 'Due Date' },
            { value: 'bidsReceived', label: 'Bids Received' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[{ icon: Plus, label: 'New Bid', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredBids.length}
          totalCount={mockBids.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Clock className="h-4 w-4" />
              Open Bids
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{openBids}</div>
            <div className="text-xs text-blue-600 mt-0.5">awaiting responses</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Awaiting Value
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(awaitingValue)}</div>
            <div className="text-xs text-amber-600 mt-0.5">pending award</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <TrendingDown className="h-4 w-4" />
              Savings This Month
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalSavings)}</div>
            <div className="text-xs text-green-600 mt-0.5">vs. budget</div>
          </div>
        </div>
      </div>

      {/* Bid Cards */}
      <div className="p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredBids.map(bid => (
              <BidCard key={bid.id} bid={bid} />
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredBids.map(bid => (
              <BidCard key={bid.id} bid={bid} />
            ))}
          </div>
        )}
        {filteredBids.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No bid requests found
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
              <AlertCircle className="h-3.5 w-3.5" />
              1 bid ready for award
            </span>
            <span>|</span>
            <span>Electrical bid: XYZ Electric lowest at $11,200 - recommend award</span>
            <span>|</span>
            <span>Total savings this month: {formatCurrency(totalSavings)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
