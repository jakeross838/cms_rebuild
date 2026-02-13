'use client'

import {
  User,
  DollarSign,
  Sparkles,
  AlertTriangle,
  MoreHorizontal,
  Plus,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Building2,
  Landmark,
  Users,
  FileText,
  Briefcase,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface Lead {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  projectType: 'New Construction' | 'Renovation' | 'Addition' | 'Remodel'
  preconType: 'design_build' | 'plan_bid_build'
  estimatedSf: number
  estimatedValue: number
  stage: string
  source: string
  sourceDetail?: string
  aiScore: number
  winProbability: number
  budgetRealismScore: number
  assignedTo: string
  lotStatus: 'owned' | 'under_contract' | 'looking' | 'unknown'
  financingStatus: 'pre_approved' | 'cash' | 'needs_approval' | 'unknown'
  timeline: string
  daysInStage: number
  lastActivityDate: string
  lastActivityType: string
  competitor?: string
  competitivePosition?: 'strong' | 'neutral' | 'weak'
  scopeIteration?: string
  designMilestone?: string
  alert?: string
  status: 'active' | 'won' | 'lost' | 'archived'
  lostReason?: string
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Smith Residence',
    contact: 'John & Sarah Smith',
    email: 'john@smithfamily.com',
    phone: '(843) 555-0142',
    projectType: 'New Construction',
    preconType: 'design_build',
    estimatedSf: 3500,
    estimatedValue: 850000,
    stage: 'consultation',
    source: 'Referral',
    sourceDetail: 'Davis family (past client)',
    aiScore: 87,
    winProbability: 78,
    budgetRealismScore: 82,
    assignedTo: 'Jake',
    lotStatus: 'owned',
    financingStatus: 'pre_approved',
    timeline: '3-6 months',
    daysInStage: 4,
    lastActivityDate: 'Feb 10, 2026',
    lastActivityType: 'Site Visit',
    designMilestone: 'Schematic Design',
    status: 'active',
  },
  {
    id: '2',
    name: 'Johnson Beach House',
    contact: 'Robert Johnson',
    email: 'rjohnson@gmail.com',
    phone: '(843) 555-0298',
    projectType: 'Renovation',
    preconType: 'plan_bid_build',
    estimatedSf: 2200,
    estimatedValue: 320000,
    stage: 'qualified',
    source: 'Houzz',
    aiScore: 72,
    winProbability: 45,
    budgetRealismScore: 58,
    assignedTo: 'Mike',
    lotStatus: 'owned',
    financingStatus: 'needs_approval',
    timeline: '6+ months',
    daysInStage: 12,
    lastActivityDate: 'Feb 5, 2026',
    lastActivityType: 'Email',
    competitor: 'Coastal Builders Inc',
    competitivePosition: 'neutral',
    status: 'active',
    alert: 'Budget realism score low (58) - client expectations may exceed budget',
  },
  {
    id: '3',
    name: 'Miller Addition',
    contact: 'David Miller',
    email: 'dmiller@outlook.com',
    phone: '(843) 555-0415',
    projectType: 'Addition',
    preconType: 'design_build',
    estimatedSf: 800,
    estimatedValue: 250000,
    stage: 'proposal',
    source: 'Website',
    sourceDetail: 'UTM: google_ads/custom_builder',
    aiScore: 91,
    winProbability: 82,
    budgetRealismScore: 90,
    assignedTo: 'Jake',
    lotStatus: 'owned',
    financingStatus: 'cash',
    timeline: '1-3 months',
    daysInStage: 8,
    lastActivityDate: 'Feb 4, 2026',
    lastActivityType: 'Proposal Sent',
    scopeIteration: 'V2 - Revised scope',
    status: 'active',
    alert: 'Waiting 8 days - follow up recommended. Similar leads convert within 5 days.',
  },
  {
    id: '4',
    name: 'Wilson Custom Home',
    contact: 'Thomas & Lisa Wilson',
    email: 'twilson@wilsonlaw.com',
    phone: '(843) 555-0631',
    projectType: 'New Construction',
    preconType: 'design_build',
    estimatedSf: 4200,
    estimatedValue: 1200000,
    stage: 'new',
    source: 'Parade of Homes',
    aiScore: 94,
    winProbability: 85,
    budgetRealismScore: 95,
    assignedTo: 'Jake',
    lotStatus: 'under_contract',
    financingStatus: 'pre_approved',
    timeline: '3-6 months',
    daysInStage: 1,
    lastActivityDate: 'Feb 11, 2026',
    lastActivityType: 'Phone Call',
    status: 'active',
  },
  {
    id: '5',
    name: 'Davis Coastal Home',
    contact: 'Michael Davis',
    email: 'mdavis@coastalins.com',
    phone: '(843) 555-0877',
    projectType: 'New Construction',
    preconType: 'design_build',
    estimatedSf: 3800,
    estimatedValue: 920000,
    stage: 'won',
    source: 'Referral',
    sourceDetail: 'Architect referral - Bay Design Group',
    aiScore: 95,
    winProbability: 100,
    budgetRealismScore: 88,
    assignedTo: 'Sarah',
    lotStatus: 'owned',
    financingStatus: 'pre_approved',
    timeline: 'Ready to start',
    daysInStage: 3,
    lastActivityDate: 'Feb 9, 2026',
    lastActivityType: 'Contract Signed',
    designMilestone: 'Construction Documents',
    status: 'won',
  },
  {
    id: '6',
    name: 'Taylor Kitchen Remodel',
    contact: 'Amanda Taylor',
    email: 'ataylor@gmail.com',
    phone: '(843) 555-0523',
    projectType: 'Remodel',
    preconType: 'plan_bid_build',
    estimatedSf: 400,
    estimatedValue: 95000,
    stage: 'lost',
    source: 'Angi',
    aiScore: 45,
    winProbability: 0,
    budgetRealismScore: 35,
    assignedTo: 'Mike',
    lotStatus: 'owned',
    financingStatus: 'unknown',
    timeline: 'Just exploring',
    daysInStage: 0,
    lastActivityDate: 'Jan 28, 2026',
    lastActivityType: 'Email',
    competitor: 'Quick Reno LLC',
    competitivePosition: 'weak',
    status: 'lost',
    lostReason: 'Went with competitor - price',
  },
  {
    id: '7',
    name: 'Nguyen Waterfront Estate',
    contact: 'David & Mai Nguyen',
    email: 'dnguyen@techcorp.com',
    phone: '(843) 555-0719',
    projectType: 'New Construction',
    preconType: 'design_build',
    estimatedSf: 5200,
    estimatedValue: 1850000,
    stage: 'negotiation',
    source: 'Referral',
    sourceDetail: 'Past client - Williams family',
    aiScore: 88,
    winProbability: 70,
    budgetRealismScore: 75,
    assignedTo: 'Jake',
    lotStatus: 'owned',
    financingStatus: 'pre_approved',
    timeline: '3-6 months',
    daysInStage: 6,
    lastActivityDate: 'Feb 8, 2026',
    lastActivityType: 'Meeting',
    competitor: 'Luxury Living Builders',
    competitivePosition: 'strong',
    scopeIteration: 'V3 - Final revision',
    designMilestone: 'Design Development',
    status: 'active',
  },
]

const stages = [
  { id: 'new', label: 'New', color: 'bg-blue-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-cyan-500' },
  { id: 'consultation', label: 'Consultation', color: 'bg-indigo-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-amber-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500' },
]

const lotStatusLabels: Record<string, { label: string; color: string }> = {
  owned: { label: 'Lot Owned', color: 'text-green-600' },
  under_contract: { label: 'Under Contract', color: 'text-blue-600' },
  looking: { label: 'Lot Shopping', color: 'text-amber-600' },
  unknown: { label: 'Unknown', color: 'text-gray-400' },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M'
  return '$' + (value / 1000).toFixed(0) + 'K'
}

function LeadCard({ lead }: { lead: Lead }) {
  const lotInfo = lotStatusLabels[lead.lotStatus]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
          <p className="text-xs text-gray-500">{lead.projectType}</p>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <User className="h-3 w-3" />
          <span>{lead.contact}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <DollarSign className="h-3 w-3" />
          <span>{formatCurrency(lead.estimatedValue)}</span>
          <span className="text-gray-400">|</span>
          <span>{lead.estimatedSf.toLocaleString()} SF</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <MapPin className="h-3 w-3" />
          <span className={lotInfo.color}>{lotInfo.label}</span>
          {lead.preconType === 'design_build' && (
            <>
              <span className="text-gray-400">|</span>
              <span className="text-indigo-600">Design-Build</span>
            </>
          )}
        </div>
        {lead.source && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Target className="h-3 w-3" />
            <span>{lead.source}</span>
            {lead.sourceDetail && (
              <span className="text-gray-400 truncate max-w-[120px]" title={lead.sourceDetail}>
                - {lead.sourceDetail}
              </span>
            )}
          </div>
        )}
        {lead.competitor && (
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="h-3 w-3 text-gray-400" />
            <span className="text-gray-500">vs {lead.competitor}</span>
            {lead.competitivePosition && (
              <span className={cn(
                "px-1 py-0.5 rounded text-[10px] font-medium",
                lead.competitivePosition === 'strong' ? 'bg-green-50 text-green-700' :
                lead.competitivePosition === 'neutral' ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-700'
              )}>
                {lead.competitivePosition}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stage activity */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <Clock className="h-3 w-3" />
        <span>{lead.daysInStage}d in stage</span>
        <span className="text-gray-300">|</span>
        <span>{lead.lastActivityType} - {lead.lastActivityDate}</span>
      </div>

      {/* Design milestone / Scope iteration */}
      {(lead.designMilestone || lead.scopeIteration) && (
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {lead.designMilestone && (
            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium">
              {lead.designMilestone}
            </span>
          )}
          {lead.scopeIteration && (
            <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-medium">
              {lead.scopeIteration}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-700">{lead.assignedTo[0]}</span>
          </div>
          <span className="text-xs text-gray-500">{lead.assignedTo}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 rounded text-xs" title="AI Lead Score">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="font-medium text-amber-700">{lead.aiScore}</span>
          </div>
          <div className={cn(
            "text-xs px-1.5 py-0.5 rounded font-medium",
            lead.budgetRealismScore >= 75 ? "bg-green-50 text-green-700" :
            lead.budgetRealismScore >= 50 ? "bg-amber-50 text-amber-700" :
            "bg-red-50 text-red-700"
          )} title="Budget Realism Score">
            BR:{lead.budgetRealismScore}
          </div>
          <div className={cn(
            "text-xs px-1.5 py-0.5 rounded",
            lead.winProbability >= 70 ? "bg-green-50 text-green-700" :
            lead.winProbability >= 40 ? "bg-amber-50 text-amber-700" :
            "bg-red-50 text-red-700"
          )}>
            {lead.winProbability}%
          </div>
        </div>
      </div>

      {/* Lost reason */}
      {lead.status === 'lost' && lead.lostReason && (
        <div className="mt-2 p-2 bg-red-50 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-red-700">Lost: {lead.lostReason}</span>
        </div>
      )}

      {lead.alert && lead.status !== 'lost' && (
        <div className="mt-2 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{lead.alert}</span>
        </div>
      )}
    </div>
  )
}

export function LeadsPipelinePreview() {
  const { search, setSearch, activeTab, setActiveTab, viewMode, setViewMode, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultView: 'grid' })

  const activeLeads = mockLeads.filter(l => l.status === 'active' || l.status === 'won' || l.status === 'lost')

  const searchedLeads = sortItems(
    activeLeads.filter(lead =>
      matchesSearch(lead, search, ['name', 'contact', 'projectType', 'assignedTo', 'source', 'competitor'])
    ),
    activeSort as keyof Lead | '',
    sortDirection,
  )

  // Stats
  const pipelineValue = mockLeads.filter(l => l.status === 'active').reduce((sum, l) => sum + l.estimatedValue, 0)
  const weightedValue = mockLeads.filter(l => l.status === 'active').reduce((sum, l) => sum + (l.estimatedValue * l.winProbability / 100), 0)
  const hotLeads = mockLeads.filter(l => l.aiScore >= 85 && l.status === 'active').length
  const staleLeads = mockLeads.filter(l => l.daysInStage > 7 && l.status === 'active').length
  const winRate = Math.round(
    (mockLeads.filter(l => l.status === 'won').length /
    mockLeads.filter(l => l.status === 'won' || l.status === 'lost').length) * 100
  ) || 0

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Leads Pipeline</h3>
          <span className="text-sm text-gray-500">
            {mockLeads.filter(l => l.status === 'active').length} active | {formatCurrency(pipelineValue)} pipeline
          </span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search leads, contacts, sources..."
          tabs={[
            { key: 'all', label: 'All', count: activeLeads.length },
            ...stages.map(s => ({
              key: s.id,
              label: s.label,
              count: activeLeads.filter(l => l.stage === s.id).length,
            })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOptions={[
            { value: 'aiScore', label: 'AI Score' },
            { value: 'estimatedValue', label: 'Value' },
            { value: 'winProbability', label: 'Win %' },
            { value: 'daysInStage', label: 'Days in Stage' },
            { value: 'name', label: 'Name' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[{ icon: Plus, label: 'Add Lead', onClick: () => {}, variant: 'primary' }]}
          resultCount={searchedLeads.length}
          totalCount={activeLeads.length}
        />
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-3">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-semibold text-blue-700">{formatCurrency(pipelineValue)}</div>
              <div className="text-[10px] text-blue-600">Pipeline Value</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm font-semibold text-green-700">{formatCurrency(weightedValue)}</div>
              <div className="text-[10px] text-green-600">Weighted Value</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <div>
              <div className="text-sm font-semibold text-amber-700">{hotLeads}</div>
              <div className="text-[10px] text-amber-600">Hot Leads (85+)</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm font-semibold text-red-700">{staleLeads}</div>
              <div className="text-[10px] text-red-600">Stale (7+ days)</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Target className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm font-semibold text-purple-700">{winRate}%</div>
              <div className="text-[10px] text-purple-600">Win Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Module Connections */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500 font-medium">Connections:</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
            <FileText className="h-3 w-3" />
            Estimating
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
            <Briefcase className="h-3 w-3" />
            Contracts
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded">
            <Building2 className="h-3 w-3" />
            Jobs
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
            <Mail className="h-3 w-3" />
            Nurturing
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
            <Calendar className="h-3 w-3" />
            Scheduling
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const stageLeads = searchedLeads.filter(l => {
              if (activeTab !== 'all' && l.stage !== activeTab) return false
              return l.stage === stage.id
            })
            const stageTotal = stageLeads.reduce((sum, l) => sum + l.estimatedValue, 0)

            // If filtering by tab and this isn't the selected stage, skip rendering
            if (activeTab !== 'all' && activeTab !== stage.id) return null

            return (
              <div key={stage.id} className="w-72 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", stage.color)} />
                    <span className="font-medium text-gray-700 text-sm">{stage.label}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatCurrency(stageTotal)}</span>
                </div>
                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Source ROI Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Lead Source Performance</h4>
        <div className="flex items-center gap-3">
          {[
            { source: 'Referral', leads: 3, won: 1, value: '$2.8M', color: 'bg-green-100 text-green-700' },
            { source: 'Website', leads: 1, won: 0, value: '$250K', color: 'bg-blue-100 text-blue-700' },
            { source: 'Houzz', leads: 1, won: 0, value: '$320K', color: 'bg-orange-100 text-orange-700' },
            { source: 'Parade', leads: 1, won: 0, value: '$1.2M', color: 'bg-purple-100 text-purple-700' },
            { source: 'Angi', leads: 1, won: 0, value: '$95K', color: 'bg-red-100 text-red-700' },
          ].map((s) => (
            <div key={s.source} className={cn("flex items-center gap-2 px-2 py-1.5 rounded text-xs", s.color)}>
              <span className="font-medium">{s.source}</span>
              <span>{s.leads}L / {s.won}W</span>
              <span className="font-semibold">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex-1 text-sm text-amber-700 space-y-1">
            <p>Miller Addition has been in Proposal stage for 8 days. Similar leads that convert respond within 5 days. Follow up today.</p>
            <p>Johnson Beach House: budget realism score is 58 - client's wish list may exceed $320K budget. Recommend feasibility discussion before advancing.</p>
            <p>Nguyen Estate is in negotiation with Luxury Living Builders. Your competitive position is strong - emphasize coastal construction expertise in next meeting.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
