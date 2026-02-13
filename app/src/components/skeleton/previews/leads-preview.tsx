'use client'

import {
  User,
  DollarSign,
  Sparkles,
  AlertTriangle,
  MoreHorizontal,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch } from '@/hooks/use-filter-state'

const mockLeads = [
  {
    id: '1',
    name: 'Smith Residence',
    contact: 'John & Sarah Smith',
    projectType: 'New Construction',
    estimatedSf: 3500,
    estimatedValue: 850000,
    stage: 'new',
    aiScore: 87,
    winProbability: 78,
    assignedTo: 'Jake',
  },
  {
    id: '2',
    name: 'Johnson Beach House',
    contact: 'Robert Johnson',
    projectType: 'Renovation',
    estimatedSf: 2200,
    estimatedValue: 320000,
    stage: 'qualified',
    aiScore: 72,
    winProbability: 45,
    assignedTo: 'Mike',
  },
  {
    id: '3',
    name: 'Miller Addition',
    contact: 'David Miller',
    projectType: 'Addition',
    estimatedSf: 800,
    estimatedValue: 250000,
    stage: 'proposal',
    aiScore: 91,
    winProbability: 82,
    assignedTo: 'Jake',
    alert: 'Waiting 8 days - follow up recommended',
  },
  {
    id: '4',
    name: 'Wilson Custom',
    contact: 'Thomas Wilson',
    projectType: 'New Construction',
    estimatedSf: 4200,
    estimatedValue: 1200000,
    stage: 'new',
    aiScore: 94,
    winProbability: 85,
    assignedTo: 'Jake',
  },
  {
    id: '5',
    name: 'Davis Coastal Home',
    contact: 'Michael Davis',
    projectType: 'New Construction',
    estimatedSf: 3800,
    estimatedValue: 920000,
    stage: 'won',
    aiScore: 95,
    winProbability: 100,
    assignedTo: 'Sarah',
  },
]

const stages = [
  { id: 'new', label: 'New', color: 'bg-blue-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-amber-500' },
  { id: 'proposal', label: 'Proposal Sent', color: 'bg-purple-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M'
  return '$' + (value / 1000).toFixed(0) + 'K'
}

interface Lead {
  id: string
  name: string
  contact: string
  projectType: string
  estimatedSf: number
  estimatedValue: number
  stage: string
  aiScore: number
  winProbability: number
  assignedTo: string
  alert?: string
}

function LeadCard({ lead }: { lead: Lead }) {
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
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-700">{lead.assignedTo[0]}</span>
          </div>
          <span className="text-xs text-gray-500">{lead.assignedTo}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 rounded text-xs">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="font-medium text-amber-700">{lead.aiScore}</span>
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

      {lead.alert && (
        <div className="mt-2 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{lead.alert}</span>
        </div>
      )}
    </div>
  )
}

export function LeadsPipelinePreview() {
  const { search, setSearch, activeTab, setActiveTab, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })

  const searchedLeads = mockLeads.filter(lead =>
    matchesSearch(lead, search, ['name', 'contact', 'projectType', 'assignedTo'])
  )

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Leads Pipeline</h3>
          <span className="text-sm text-gray-500">5 leads | $3.54M pipeline</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search leads..."
          tabs={[
            { key: 'all', label: 'All', count: mockLeads.length },
            ...stages.map(s => ({
              key: s.id,
              label: s.label,
              count: mockLeads.filter(l => l.stage === s.id).length,
            })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[{ icon: Plus, label: 'Add Lead', onClick: () => {}, variant: 'primary' }]}
          resultCount={searchedLeads.length}
          totalCount={mockLeads.length}
        />
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

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <p className="text-sm text-amber-700">
            Miller Addition has been in Proposal stage for 8 days. Similar leads that convert typically respond within 5 days. Consider following up today.
          </p>
        </div>
      </div>
    </div>
  )
}
