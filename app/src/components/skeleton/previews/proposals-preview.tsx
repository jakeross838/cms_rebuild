'use client'

import {
  Plus,
  Send,
  Eye,
  Sparkles,
  MoreHorizontal,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Mail,
  User,
  DollarSign,
  Calendar,
  BarChart3,
  FileText,
  FileSignature,
  Timer,
  AlertTriangle,
  Palette,
  Link,
  Download,
  Copy,
  Package,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'
type ContractType = 'nte' | 'gmp' | 'cost_plus' | 'fixed'
type EsignStatus = 'not_sent' | 'sent' | 'viewed' | 'signed' | 'declined'

interface Proposal {
  id: string
  clientName: string
  projectName: string
  projectAddress: string
  estimateRef: string
  version: number
  amount: number
  allowancesTotal: number
  defaultTier: string
  tierComparison: {
    builder: number
    standard: number
    premium: number
    luxury: number
  }
  contractType: ContractType
  templateName: string
  dateSent: string | null
  viewCount: number
  timeSpentMinutes: number
  lastViewed: string | null
  expiresAt: string | null
  daysUntilExpiry: number | null
  status: ProposalStatus
  esignStatus: EsignStatus
  hasPhotos: boolean
  aiNote: string | null
}

const mockProposals: Proposal[] = [
  {
    id: '1',
    clientName: 'John & Sarah Smith',
    projectName: 'Smith Residence - New Construction',
    projectAddress: '1234 Coastal Drive, Charleston SC',
    estimateRef: 'EST-2026-0042 v2',
    version: 2,
    amount: 850000,
    allowancesTotal: 68000,
    defaultTier: 'Premium',
    tierComparison: { builder: 680000, standard: 740000, premium: 850000, luxury: 1050000 },
    contractType: 'gmp',
    templateName: 'Coastal Custom Home',
    dateSent: null,
    viewCount: 0,
    timeSpentMinutes: 0,
    lastViewed: null,
    expiresAt: null,
    daysUntilExpiry: null,
    status: 'draft',
    esignStatus: 'not_sent',
    hasPhotos: true,
    aiNote: null,
  },
  {
    id: '2',
    clientName: 'Robert & Linda Johnson',
    projectName: 'Johnson Beach House Renovation',
    projectAddress: '567 Ocean Blvd, Folly Beach SC',
    estimateRef: 'EST-2026-0038 v1',
    version: 1,
    amount: 320000,
    allowancesTotal: 42000,
    defaultTier: 'Standard',
    tierComparison: { builder: 260000, standard: 320000, premium: 385000, luxury: 0 },
    contractType: 'fixed',
    templateName: 'Renovation Standard',
    dateSent: 'Feb 8, 2026',
    viewCount: 0,
    timeSpentMinutes: 0,
    lastViewed: null,
    expiresAt: 'Mar 10, 2026',
    daysUntilExpiry: 26,
    status: 'sent',
    esignStatus: 'sent',
    hasPhotos: true,
    aiNote: 'No views after 4 days -- consider a follow-up call',
  },
  {
    id: '3',
    clientName: 'David & Amy Miller',
    projectName: 'Miller Addition & Remodel',
    projectAddress: '890 Live Oak Lane, Mt Pleasant SC',
    estimateRef: 'EST-2026-0035 v3',
    version: 3,
    amount: 250000,
    allowancesTotal: 28000,
    defaultTier: 'Premium',
    tierComparison: { builder: 195000, standard: 220000, premium: 250000, luxury: 310000 },
    contractType: 'cost_plus',
    templateName: 'Addition Standard',
    dateSent: 'Feb 5, 2026',
    viewCount: 4,
    timeSpentMinutes: 38,
    lastViewed: '2 hours ago',
    expiresAt: 'Mar 7, 2026',
    daysUntilExpiry: 23,
    status: 'viewed',
    esignStatus: 'viewed',
    hasPhotos: true,
    aiNote: 'Viewed 4 times in 2 days, 38 min total -- high engagement. Client spent 12 min on kitchen. Consider follow-up today.',
  },
  {
    id: '4',
    clientName: 'Thomas & Rachel Wilson',
    projectName: 'Wilson Custom Home',
    projectAddress: '2100 Marsh View Court, Kiawah SC',
    estimateRef: 'EST-2026-0029 v2',
    version: 2,
    amount: 1200000,
    allowancesTotal: 95000,
    defaultTier: 'Premium',
    tierComparison: { builder: 950000, standard: 1050000, premium: 1200000, luxury: 1520000 },
    contractType: 'gmp',
    templateName: 'Luxury Custom Home',
    dateSent: 'Jan 28, 2026',
    viewCount: 6,
    timeSpentMinutes: 52,
    lastViewed: 'Jan 30, 2026',
    expiresAt: null,
    daysUntilExpiry: null,
    status: 'accepted',
    esignStatus: 'signed',
    hasPhotos: true,
    aiNote: null,
  },
  {
    id: '5',
    clientName: 'Michael & Karen Davis',
    projectName: 'Davis Coastal Remodel',
    projectAddress: '345 Palm Row, Sullivan\'s Island SC',
    estimateRef: 'EST-2026-0031 v1',
    version: 1,
    amount: 180000,
    allowancesTotal: 22000,
    defaultTier: 'Standard',
    tierComparison: { builder: 145000, standard: 180000, premium: 215000, luxury: 0 },
    contractType: 'fixed',
    templateName: 'Renovation Standard',
    dateSent: 'Jan 25, 2026',
    viewCount: 2,
    timeSpentMinutes: 8,
    lastViewed: 'Jan 27, 2026',
    expiresAt: 'Feb 24, 2026',
    daysUntilExpiry: -12,
    status: 'declined',
    esignStatus: 'declined',
    hasPhotos: false,
    aiNote: 'Low engagement (8 min). No photos included -- proposals with photos have 40% higher acceptance.',
  },
  {
    id: '6',
    clientName: 'Sarah & James Thompson',
    projectName: 'Thompson Kitchen & Bath',
    projectAddress: '678 Ashley Ave, Charleston SC',
    estimateRef: 'EST-2026-0044 v1',
    version: 1,
    amount: 95000,
    allowancesTotal: 18000,
    defaultTier: 'Premium',
    tierComparison: { builder: 72000, standard: 82000, premium: 95000, luxury: 120000 },
    contractType: 'fixed',
    templateName: 'Kitchen & Bath Reno',
    dateSent: 'Feb 10, 2026',
    viewCount: 1,
    timeSpentMinutes: 15,
    lastViewed: '30 minutes ago',
    expiresAt: 'Mar 12, 2026',
    daysUntilExpiry: 28,
    status: 'viewed',
    esignStatus: 'viewed',
    hasPhotos: true,
    aiNote: 'Client viewing now -- spent 15 min focused on cabinet selections',
  },
  {
    id: '7',
    clientName: 'Mark & Julie Roberts',
    projectName: 'Roberts Pool House',
    projectAddress: '432 Tradd St, Charleston SC',
    estimateRef: 'EST-2026-0025 v2',
    version: 2,
    amount: 145000,
    allowancesTotal: 12000,
    defaultTier: 'Standard',
    tierComparison: { builder: 118000, standard: 145000, premium: 175000, luxury: 0 },
    contractType: 'nte',
    templateName: 'Accessory Structure',
    dateSent: 'Jan 15, 2026',
    viewCount: 3,
    timeSpentMinutes: 22,
    lastViewed: 'Jan 20, 2026',
    expiresAt: 'Feb 14, 2026',
    daysUntilExpiry: -1,
    status: 'expired',
    esignStatus: 'not_sent',
    hasPhotos: true,
    aiNote: 'Expired yesterday. Client viewed 3 times (22 min) but did not respond. Recommend resending with updated pricing.',
  },
]

const statusConfig: Record<ProposalStatus, { label: string; color: string; dotColor: string }> = {
  draft: { label: 'Draft', color: 'bg-warm-100 text-warm-700', dotColor: 'bg-warm-400' },
  sent: { label: 'Sent', color: 'bg-stone-100 text-stone-700', dotColor: 'bg-stone-500' },
  viewed: { label: 'Viewed', color: 'bg-warm-100 text-warm-700', dotColor: 'bg-warm-500' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
  expired: { label: 'Expired', color: 'bg-sand-100 text-sand-700', dotColor: 'bg-sand-500' },
}

const contractTypeLabels: Record<ContractType, string> = {
  nte: 'NTE',
  gmp: 'GMP',
  cost_plus: 'Cost+',
  fixed: 'Fixed',
}

const esignIcons: Record<EsignStatus, { label: string; color: string }> = {
  not_sent: { label: 'Not Sent', color: 'text-warm-400' },
  sent: { label: 'Awaiting Signature', color: 'text-stone-500' },
  viewed: { label: 'Viewed', color: 'text-stone-600' },
  signed: { label: 'Signed', color: 'text-green-500' },
  declined: { label: 'Declined', color: 'text-red-500' },
}

const stages = [
  { id: 'draft', label: 'Draft', color: 'bg-warm-500' },
  { id: 'sent', label: 'Sent', color: 'bg-stone-500' },
  { id: 'viewed', label: 'Viewed', color: 'bg-warm-500' },
  { id: 'accepted', label: 'Accepted', color: 'bg-green-500' },
  { id: 'declined', label: 'Declined', color: 'bg-red-500' },
  { id: 'expired', label: 'Expired', color: 'bg-sand-500' },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const config = statusConfig[proposal.status]
  const esign = esignIcons[proposal.esignStatus]

  return (
    <div className={cn(
      "bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      proposal.status === 'expired' && "border-sand-200",
      proposal.status === 'accepted' && "border-green-200",
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-warm-900 text-sm">{proposal.projectName}</h4>
          <div className="flex items-center gap-1.5 text-xs text-warm-500 mt-0.5">
            <User className="h-3 w-3" />
            <span>{proposal.clientName}</span>
          </div>
          <div className="text-xs text-warm-400 mt-0.5">{proposal.projectAddress}</div>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-warm-600">
            <DollarSign className="h-3 w-3" />
            <span className="font-semibold text-warm-900">{formatCurrency(proposal.amount)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">
              {contractTypeLabels[proposal.contractType]}
            </span>
            <span className="text-xs bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded">
              v{proposal.version}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-warm-500">
          <span className="flex items-center gap-1">
            <Link className="h-3 w-3" />
            {proposal.estimateRef}
          </span>
          <span className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            {proposal.defaultTier}
          </span>
        </div>
        {proposal.allowancesTotal > 0 && (
          <div className="text-xs text-warm-500">
            Allowances: {formatCurrency(proposal.allowancesTotal)}
          </div>
        )}
        {proposal.dateSent && (
          <div className="flex items-center gap-1.5 text-xs text-warm-600">
            <Calendar className="h-3 w-3" />
            <span>Sent {proposal.dateSent}</span>
          </div>
        )}
        {proposal.viewCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-warm-600">
            <Eye className="h-3 w-3" />
            <span>{proposal.viewCount} view{proposal.viewCount !== 1 ? 's' : ''}</span>
            {proposal.timeSpentMinutes > 0 && (
              <>
                <span className="text-warm-300">|</span>
                <Timer className="h-3 w-3" />
                <span>{proposal.timeSpentMinutes} min</span>
              </>
            )}
            {proposal.lastViewed && (
              <>
                <span className="text-warm-300">|</span>
                <span>Last: {proposal.lastViewed}</span>
              </>
            )}
          </div>
        )}
        {proposal.expiresAt && (
          <div className={cn(
            "flex items-center gap-1.5 text-xs",
            proposal.daysUntilExpiry !== null && proposal.daysUntilExpiry <= 0 ? "text-sand-600 font-medium" :
            proposal.daysUntilExpiry !== null && proposal.daysUntilExpiry <= 7 ? "text-amber-600" : "text-warm-500"
          )}>
            <Clock className="h-3 w-3" />
            <span>
              Expires {proposal.expiresAt}
              {proposal.daysUntilExpiry !== null && proposal.daysUntilExpiry > 0 && ` (${proposal.daysUntilExpiry}d)`}
              {proposal.daysUntilExpiry !== null && proposal.daysUntilExpiry <= 0 && ' (expired)'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-warm-100">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs px-2 py-0.5 rounded font-medium", config.color)}>
            {config.label}
          </span>
          <span className={cn("text-xs", esign.color)} title={esign.label}>
            <FileSignature className="h-3.5 w-3.5" />
          </span>
          {!proposal.hasPhotos && (
            <span className="text-xs text-warm-400" title="No photos">
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {proposal.status === 'draft' && (
            <button className="p-1.5 text-stone-600 hover:bg-stone-50 rounded" title="Send">
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
          {proposal.status === 'expired' && (
            <button className="p-1.5 text-sand-600 hover:bg-sand-50 rounded" title="Resend">
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
          <button className="p-1.5 text-warm-400 hover:bg-warm-100 hover:text-warm-600 rounded" title="Preview">
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 text-warm-400 hover:bg-warm-100 hover:text-warm-600 rounded" title="Download PDF">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {proposal.aiNote && (
        <div className={cn(
          "mt-2 p-2 rounded-md flex items-start gap-2",
          proposal.status === 'expired' ? "bg-sand-50" : "bg-stone-50"
        )}>
          <Sparkles className={cn(
            "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
            proposal.status === 'expired' ? "text-sand-600" : "text-stone-500"
          )} />
          <span className={cn(
            "text-xs",
            proposal.status === 'expired' ? "text-sand-700" : "text-stone-700"
          )}>{proposal.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function ProposalsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()

  const filteredProposals = sortItems(
    mockProposals.filter(p => {
      if (!matchesSearch(p, search, ['clientName', 'projectName', 'projectAddress'])) return false
      if (activeTab !== 'all' && p.status !== activeTab) return false
      return true
    }),
    activeSort as keyof Proposal | '',
    sortDirection,
  )

  // Calculate stats
  const proposalsSentThisMonth = mockProposals.filter(
    p => p.status !== 'draft' && p.dateSent?.includes('Feb')
  ).length
  const acceptedCount = mockProposals.filter(p => p.status === 'accepted').length
  const declinedCount = mockProposals.filter(p => p.status === 'declined').length
  const expiredCount = mockProposals.filter(p => p.status === 'expired').length
  const decidedCount = acceptedCount + declinedCount
  const acceptanceRate = decidedCount > 0 ? Math.round((acceptedCount / decidedCount) * 100) : 0

  const totalViews = mockProposals.reduce((sum, p) => sum + p.viewCount, 0)
  const totalTimeSpent = mockProposals.reduce((sum, p) => sum + p.timeSpentMinutes, 0)
  const avgResponseTime = '4.2 days'

  const totalPipeline = mockProposals
    .filter(p => !['declined', 'accepted', 'expired'].includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0)
  const totalAcceptedValue = mockProposals
    .filter(p => p.status === 'accepted')
    .reduce((sum, p) => sum + p.amount, 0)
  const totalAllowances = mockProposals.reduce((sum, p) => sum + p.allowancesTotal, 0)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-warm-900">Proposals</h3>
          <span className="text-sm text-warm-500">
            {mockProposals.length} proposals | {formatCurrency(totalPipeline)} pipeline
          </span>
          {expiredCount > 0 && (
            <span className="text-xs bg-sand-100 text-sand-700 px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {expiredCount} expired
            </span>
          )}
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search proposals, clients, addresses..."
          tabs={[
            { key: 'all', label: 'All', count: mockProposals.length },
            { key: 'draft', label: 'Draft', count: mockProposals.filter(p => p.status === 'draft').length },
            { key: 'sent', label: 'Sent', count: mockProposals.filter(p => p.status === 'sent').length },
            { key: 'viewed', label: 'Viewed', count: mockProposals.filter(p => p.status === 'viewed').length },
            { key: 'accepted', label: 'Accepted', count: mockProposals.filter(p => p.status === 'accepted').length },
            { key: 'declined', label: 'Declined', count: mockProposals.filter(p => p.status === 'declined').length },
            { key: 'expired', label: 'Expired', count: mockProposals.filter(p => p.status === 'expired').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'clientName', label: 'Client' },
            { value: 'amount', label: 'Amount' },
            { value: 'dateSent', label: 'Date Sent' },
            { value: 'viewCount', label: 'Views' },
            { value: 'timeSpentMinutes', label: 'Time Spent' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[{ icon: Plus, label: 'Create New', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredProposals.length}
          totalCount={mockProposals.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-warm-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-warm-500 text-xs">
              <Mail className="h-3.5 w-3.5" />
              Sent (Month)
            </div>
            <div className="text-lg font-bold text-warm-900 mt-0.5">{proposalsSentThisMonth}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-warm-500 text-xs">
              <TrendingUp className="h-3.5 w-3.5" />
              Win Rate
            </div>
            <div className={cn(
              "text-lg font-bold mt-0.5",
              acceptanceRate >= 60 ? "text-green-600" : acceptanceRate >= 40 ? "text-amber-600" : "text-red-600"
            )}>
              {acceptanceRate}%
            </div>
          </div>
          <div className="bg-warm-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-warm-500 text-xs">
              <Clock className="h-3.5 w-3.5" />
              Avg Response
            </div>
            <div className="text-lg font-bold text-warm-900 mt-0.5">{avgResponseTime}</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-stone-600 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              Pipeline
            </div>
            <div className="text-lg font-bold text-stone-700 mt-0.5">{formatCurrency(totalPipeline)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-green-600 text-xs">
              <CheckCircle className="h-3.5 w-3.5" />
              Won Value
            </div>
            <div className="text-lg font-bold text-green-700 mt-0.5">{formatCurrency(totalAcceptedValue)}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-stone-600 text-xs">
              <Eye className="h-3.5 w-3.5" />
              Engagement
            </div>
            <div className="text-lg font-bold text-warm-700 mt-0.5">
              {totalViews} <span className="text-xs font-normal">views</span>
            </div>
            <div className="text-xs text-stone-600">{totalTimeSpent} min total</div>
          </div>
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
                    <span className="font-medium text-warm-700 text-sm">{stage.label}</span>
                    <span className="text-xs text-warm-400 bg-warm-100 px-1.5 py-0.5 rounded">
                      {stageProposals.length}
                    </span>
                  </div>
                  <span className="text-xs text-warm-500">{formatCurrency(stageTotal)}</span>
                </div>
                <div className="space-y-3">
                  {stageProposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                  {stageProposals.length === 0 && (
                    <div className="text-center py-8 text-warm-400 text-sm border-2 border-dashed border-warm-200 rounded-lg">
                      No proposals
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cross-Module Connection Badges */}
      <div className="bg-warm-50 border-t border-warm-200 px-4 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-warm-500 font-medium">Connected:</span>
          <span className="bg-stone-50 text-stone-700 px-2 py-0.5 rounded flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Estimates
          </span>
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Package className="h-3 w-3" />
            Selections Catalog
          </span>
          <span className="bg-warm-50 text-warm-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Contracts
          </span>
          <span className="bg-warm-50 text-sand-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Client Portal
          </span>
          <span className="bg-sand-50 text-sand-700 px-2 py-0.5 rounded flex items-center gap-1">
            <User className="h-3 w-3" />
            Leads / CRM
          </span>
          <span className="bg-stone-50 text-stone-700 px-2 py-0.5 rounded flex items-center gap-1">
            <FileSignature className="h-3 w-3" />
            E-Signature
          </span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="bg-white border-t border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-warm-500">Quick Actions:</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50">
              <Plus className="h-4 w-4" />
              Create New
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Send className="h-4 w-4" />
              Bulk Send
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>{acceptedCount} won</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-600">
              <XCircle className="h-4 w-4" />
              <span>{declinedCount} declined</span>
            </div>
            <div className="flex items-center gap-1.5 text-sand-600">
              <AlertTriangle className="h-4 w-4" />
              <span>{expiredCount} expired</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <p className="text-sm text-amber-700">
            Proposals with photos have 40% higher acceptance. Miller Addition highly engaged (38 min, 4 views) -- follow up today. Roberts Pool House expired -- resend with fresh pricing.
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Win Rate Analysis',
            insight: 'Tracks proposal success patterns',
          },
          {
            feature: 'Competitive Pricing',
            insight: 'Compares pricing to market',
          },
          {
            feature: 'Content Optimization',
            insight: 'Suggests improvements to proposal text',
          },
          {
            feature: 'Follow-up Timing',
            insight: 'Optimal timing for proposal follow-ups',
          },
          {
            feature: 'Scope Clarity',
            insight: 'Identifies ambiguous scope items',
          },
        ]}
      />
    </div>
  )
}
