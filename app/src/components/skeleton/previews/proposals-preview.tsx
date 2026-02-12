'use client'

import { useState } from 'react'
import {
  Plus,
  Send,
  Eye,
  FileText,
  Sparkles,
  MoreHorizontal,
  Search,
  Filter,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Mail,
  User,
  DollarSign,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Proposal {
  id: string
  clientName: string
  projectName: string
  amount: number
  dateSent: string
  viewCount: number
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined'
  lastViewed?: string
  aiNote?: string
}

const mockProposals: Proposal[] = [
  {
    id: '1',
    clientName: 'John Smith',
    projectName: 'Smith Residence - New Construction',
    amount: 850000,
    dateSent: '',
    viewCount: 0,
    status: 'draft',
  },
  {
    id: '2',
    clientName: 'Robert Johnson',
    projectName: 'Johnson Beach House Renovation',
    amount: 320000,
    dateSent: 'Feb 8, 2024',
    viewCount: 0,
    status: 'sent',
  },
  {
    id: '3',
    clientName: 'David Miller',
    projectName: 'Miller Addition',
    amount: 250000,
    dateSent: 'Feb 5, 2024',
    viewCount: 4,
    status: 'viewed',
    lastViewed: '2 hours ago',
    aiNote: 'Viewed 4 times in 2 days - high engagement suggests interest',
  },
  {
    id: '4',
    clientName: 'Thomas Wilson',
    projectName: 'Wilson Custom Home',
    amount: 1200000,
    dateSent: 'Jan 28, 2024',
    viewCount: 6,
    status: 'accepted',
    lastViewed: 'Jan 30, 2024',
  },
  {
    id: '5',
    clientName: 'Michael Davis',
    projectName: 'Davis Coastal Remodel',
    amount: 180000,
    dateSent: 'Jan 25, 2024',
    viewCount: 2,
    status: 'declined',
    lastViewed: 'Jan 27, 2024',
  },
  {
    id: '6',
    clientName: 'Sarah Thompson',
    projectName: 'Thompson Kitchen & Bath',
    amount: 95000,
    dateSent: 'Feb 10, 2024',
    viewCount: 1,
    status: 'viewed',
    lastViewed: '30 minutes ago',
  },
]

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' },
  viewed: { label: 'Viewed', color: 'bg-purple-100 text-purple-700', dotColor: 'bg-purple-500' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
}

const stages = [
  { id: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { id: 'sent', label: 'Sent', color: 'bg-blue-500' },
  { id: 'viewed', label: 'Viewed', color: 'bg-purple-500' },
  { id: 'accepted', label: 'Accepted', color: 'bg-green-500' },
  { id: 'declined', label: 'Declined', color: 'bg-red-500' },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const config = statusConfig[proposal.status]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{proposal.projectName}</h4>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
            <User className="h-3 w-3" />
            <span>{proposal.clientName}</span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <DollarSign className="h-3 w-3" />
          <span className="font-semibold text-gray-900">{formatCurrency(proposal.amount)}</span>
        </div>
        {proposal.dateSent && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>Sent {proposal.dateSent}</span>
          </div>
        )}
        {proposal.viewCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Eye className="h-3 w-3" />
            <span>{proposal.viewCount} view{proposal.viewCount !== 1 ? 's' : ''}</span>
            {proposal.lastViewed && (
              <>
                <span className="text-gray-400">|</span>
                <span>Last: {proposal.lastViewed}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className={cn("text-xs px-2 py-0.5 rounded font-medium", config.color)}>
          {config.label}
        </span>
        <div className="flex items-center gap-1">
          {proposal.status === 'draft' && (
            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Send">
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
          <button className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded" title="Preview">
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {proposal.aiNote && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-blue-700">{proposal.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function ProposalsPreview() {
  const [selectedStatus, setSelectedStatus] = useState<string | 'all'>('all')

  const filteredProposals = selectedStatus === 'all'
    ? mockProposals
    : mockProposals.filter(p => p.status === selectedStatus)

  // Calculate stats
  const proposalsSentThisMonth = mockProposals.filter(
    p => p.status !== 'draft' && p.dateSent.includes('Feb')
  ).length
  const acceptedCount = mockProposals.filter(p => p.status === 'accepted').length
  const declinedCount = mockProposals.filter(p => p.status === 'declined').length
  const decidedCount = acceptedCount + declinedCount
  const acceptanceRate = decidedCount > 0 ? Math.round((acceptedCount / decidedCount) * 100) : 0
  const avgResponseTime = '4.2 days'

  const totalPipeline = mockProposals
    .filter(p => p.status !== 'declined' && p.status !== 'accepted')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Proposals</h3>
            <span className="text-sm text-gray-500">{mockProposals.length} proposals | {formatCurrency(totalPipeline)} pipeline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search proposals..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Create New
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Mail className="h-4 w-4" />
              Sent This Month
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{proposalsSentThisMonth}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <TrendingUp className="h-4 w-4" />
              Acceptance Rate
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              acceptanceRate >= 60 ? "text-green-600" : acceptanceRate >= 40 ? "text-amber-600" : "text-red-600"
            )}>
              {acceptanceRate}%
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Clock className="h-4 w-4" />
              Avg Response Time
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{avgResponseTime}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <BarChart3 className="h-4 w-4" />
              Pipeline Value
            </div>
            <div className="text-xl font-bold text-blue-600 mt-1">{formatCurrency(totalPipeline)}</div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              selectedStatus === 'all'
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            All ({mockProposals.length})
          </button>
          {stages.map(stage => {
            const count = mockProposals.filter(p => p.status === stage.id).length
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStatus(stage.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors",
                  selectedStatus === stage.id
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <div className={cn("h-2 w-2 rounded-full", stage.color)} />
                {stage.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const stageProposals = mockProposals.filter(p => p.status === stage.id)
            const stageTotal = stageProposals.reduce((sum, p) => sum + p.amount, 0)

            return (
              <div key={stage.id} className="w-72 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", stage.color)} />
                    <span className="font-medium text-gray-700 text-sm">{stage.label}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {stageProposals.length}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatCurrency(stageTotal)}</span>
                </div>
                <div className="space-y-3">
                  {stageProposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                  {stageProposals.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      No proposals
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Quick Actions:</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
              <Plus className="h-4 w-4" />
              Create New
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Send className="h-4 w-4" />
              Send
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>{acceptedCount} accepted</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-600">
              <XCircle className="h-4 w-4" />
              <span>{declinedCount} declined</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <p className="text-sm text-amber-700">
            Proposals with photos have 40% higher acceptance. Miller Addition has been viewed 4 times - consider a follow-up call today.
          </p>
        </div>
      </div>
    </div>
  )
}
