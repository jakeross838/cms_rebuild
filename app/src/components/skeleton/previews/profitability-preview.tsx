'use client'

import { useState } from 'react'

import {
  ChevronDown,
  ChevronRight,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  DollarSign,
  BarChart3,
  Target,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

interface JobProfitability {
  id: string
  name: string
  pm: string
  status: 'active' | 'completed'
  contractAmount: number
  changeOrders: number
  revisedContract: number
  estimatedCost: number
  actualCost: number
  committedCost: number
  projectedCost: number
  revenueRecognized: number
  grossProfit: number
  grossMargin: number
  netProfit: number
  overheadAllocation: number
  overheadMethod: 'pct_direct_cost' | 'fixed' | 'pro_rata'
  variance: number
  completionPct: number
  targetMargin: number
  costPerSqFt?: number
  sqFt?: number
  costBreakdown?: CostCodeVariance[]
  aiNote?: string
  marginTrend: 'improving' | 'declining' | 'stable'
}

interface CostCodeVariance {
  code: string
  name: string
  budget: number
  committed: number
  actual: number
  projected: number
  variance: number
  isOver: boolean
  earnedValue?: number
}

const mockJobs: JobProfitability[] = [
  {
    id: '1',
    name: 'Smith Residence',
    pm: 'Mike Torres',
    status: 'active',
    contractAmount: 2400000,
    changeOrders: 150000,
    revisedContract: 2550000,
    estimatedCost: 1970000,
    actualCost: 985000,
    committedCost: 245000,
    projectedCost: 2188000,
    revenueRecognized: 1275000,
    grossProfit: 362000,
    grossMargin: 14.2,
    netProfit: 143200,
    overheadAllocation: 218800,
    overheadMethod: 'pct_direct_cost',
    variance: -68000,
    completionPct: 50,
    targetMargin: 18,
    sqFt: 4800,
    costPerSqFt: 456,
    marginTrend: 'declining',
    aiNote: 'Margin dropped from 18% to 14.2%. Primary driver: Framing labor 40% over budget due to tray ceiling complexity.',
    costBreakdown: [
      { code: '06', name: 'Framing Labor', budget: 85000, committed: 0, actual: 119000, projected: 119000, variance: -34000, isOver: true, earnedValue: 85000 },
      { code: '06', name: 'Framing Material', budget: 124000, committed: 8500, actual: 131000, projected: 139500, variance: -15500, isOver: true },
      { code: '16', name: 'Electrical', budget: 95000, committed: 48000, actual: 44000, projected: 92000, variance: 3000, isOver: false, earnedValue: 47500 },
      { code: '15', name: 'Plumbing', budget: 78000, committed: 38000, actual: 38500, projected: 76500, variance: 1500, isOver: false },
      { code: '03', name: 'Concrete', budget: 125000, committed: 0, actual: 128000, projected: 128000, variance: -3000, isOver: true },
    ],
  },
  {
    id: '2',
    name: 'Johnson Beach House',
    pm: 'Sarah Chen',
    status: 'active',
    contractAmount: 1800000,
    changeOrders: 45000,
    revisedContract: 1845000,
    estimatedCost: 1470000,
    actualCost: 420000,
    committedCost: 185000,
    projectedCost: 1503000,
    revenueRecognized: 516600,
    grossProfit: 342000,
    grossMargin: 18.5,
    netProfit: 191700,
    overheadAllocation: 150300,
    overheadMethod: 'pct_direct_cost',
    variance: 33000,
    completionPct: 28,
    targetMargin: 18,
    sqFt: 3200,
    costPerSqFt: 470,
    marginTrend: 'stable',
  },
  {
    id: '3',
    name: 'Williams Remodel',
    pm: 'Mike Torres',
    status: 'active',
    contractAmount: 450000,
    changeOrders: 25000,
    revisedContract: 475000,
    estimatedCost: 360000,
    actualCost: 290000,
    committedCost: 35000,
    projectedCost: 381000,
    revenueRecognized: 361000,
    grossProfit: 94000,
    netProfit: 55900,
    overheadAllocation: 38100,
    overheadMethod: 'pct_direct_cost',
    grossMargin: 19.8,
    variance: -21000,
    completionPct: 76,
    targetMargin: 18,
    sqFt: 1800,
    costPerSqFt: 212,
    marginTrend: 'stable',
  },
  {
    id: '4',
    name: 'Miller Addition',
    pm: 'Mike Torres',
    status: 'active',
    contractAmount: 425000,
    changeOrders: 0,
    revisedContract: 425000,
    estimatedCost: 340000,
    actualCost: 285000,
    committedCost: 42000,
    projectedCost: 382500,
    revenueRecognized: 318750,
    grossProfit: 42500,
    grossMargin: 10.0,
    netProfit: 4250,
    overheadAllocation: 38250,
    overheadMethod: 'pct_direct_cost',
    variance: -42500,
    completionPct: 75,
    targetMargin: 18,
    sqFt: 800,
    costPerSqFt: 478,
    marginTrend: 'declining',
    aiNote: 'Cabinet installation delay increased labor costs. Consider change order for scope creep in custom shelving.',
  },
  {
    id: '5',
    name: 'Davis Coastal Home',
    pm: 'Sarah Chen',
    status: 'active',
    contractAmount: 1850000,
    changeOrders: 95000,
    revisedContract: 1945000,
    estimatedCost: 1620000,
    actualCost: 1580000,
    committedCost: 85000,
    projectedCost: 1810000,
    revenueRecognized: 1789400,
    grossProfit: 135000,
    grossMargin: 6.9,
    netProfit: -46000,
    overheadAllocation: 181000,
    overheadMethod: 'pct_direct_cost',
    variance: -190000,
    completionPct: 92,
    targetMargin: 18,
    sqFt: 5200,
    costPerSqFt: 348,
    marginTrend: 'declining',
    aiNote: 'Over budget primarily due to foundation complications (elevated coastal). Recommend adjusting future coastal estimates +12%.',
  },
  {
    id: '6',
    name: 'Thompson Renovation',
    pm: 'Mike Torres',
    status: 'completed',
    contractAmount: 320000,
    changeOrders: 28000,
    revisedContract: 348000,
    estimatedCost: 268000,
    actualCost: 279000,
    committedCost: 0,
    projectedCost: 279000,
    revenueRecognized: 348000,
    grossProfit: 69000,
    grossMargin: 19.8,
    netProfit: 41100,
    overheadAllocation: 27900,
    overheadMethod: 'pct_direct_cost',
    variance: -11000,
    completionPct: 100,
    targetMargin: 18,
    sqFt: 1200,
    costPerSqFt: 233,
    marginTrend: 'stable',
  },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function MarginIndicator({ margin, target }: { margin: number; target: number }) {
  const diff = margin - target

  if (margin >= target) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-green-600 font-semibold">{margin.toFixed(1)}%</span>
        <CheckCircle className="h-4 w-4 text-green-500" />
      </div>
    )
  }

  if (margin >= target - 5) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-amber-600 font-semibold">{margin.toFixed(1)}%</span>
        <TrendingDown className="h-4 w-4 text-amber-500" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-red-600 font-semibold">{margin.toFixed(1)}%</span>
      <AlertTriangle className="h-4 w-4 text-red-500" />
    </div>
  )
}

function VarianceDisplay({ variance }: { variance: number }) {
  if (variance >= 0) {
    return (
      <span className="text-green-600 font-medium">+{formatCurrency(variance)}</span>
    )
  }
  return (
    <span className="text-red-600 font-medium">{formatCurrency(variance)}</span>
  )
}

function JobRow({ job, expanded, onToggle }: { job: JobProfitability; expanded: boolean; onToggle: () => void }) {
  const marginStatus = job.grossMargin >= job.targetMargin ? 'on-track' :
    job.grossMargin >= job.targetMargin - 5 ? 'at-risk' : 'over-budget'

  return (
    <>
      <tr
        className={cn(
          "hover:bg-warm-50 cursor-pointer",
          expanded && "bg-stone-50",
          marginStatus === 'at-risk' && "bg-amber-50/30",
          marginStatus === 'over-budget' && "bg-red-50/30"
        )}
        onClick={onToggle}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-warm-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-warm-400" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-warm-900">{job.name}</span>
                {job.aiNote ? <Sparkles className="h-3 w-3 text-amber-500" /> : null}
                {job.marginTrend === 'declining' && <TrendingDown className="h-3 w-3 text-red-500" />}
                {job.marginTrend === 'improving' && <TrendingUp className="h-3 w-3 text-green-500" />}
              </div>
              <span className="text-xs text-warm-500">PM: {job.pm}</span>
            </div>
          </div>
        </td>
        <td className="py-3 px-3 text-right text-warm-600">{formatCurrency(job.revisedContract)}</td>
        <td className="py-3 px-3 text-right text-warm-600">{formatCurrency(job.estimatedCost)}</td>
        <td className="py-3 px-3 text-right text-warm-600">{formatCurrency(job.actualCost)}</td>
        <td className="py-3 px-3 text-right text-warm-500">{formatCurrency(job.committedCost)}</td>
        <td className="py-3 px-3 text-right font-medium text-warm-900">{formatCurrency(job.projectedCost)}</td>
        <td className="py-3 px-3 text-right">
          <VarianceDisplay variance={job.variance} />
        </td>
        <td className="py-3 px-3 text-right">
          <MarginIndicator margin={job.grossMargin} target={job.targetMargin} />
        </td>
        <td className="py-3 px-3">
          <div className="w-full bg-warm-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full",
                marginStatus === 'on-track' ? "bg-green-500" :
                marginStatus === 'at-risk' ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${job.completionPct}%` }}
            />
          </div>
          <span className="text-xs text-warm-500">{job.completionPct}%</span>
        </td>
      </tr>
      {expanded ? <tr className="bg-stone-50/50">
          <td colSpan={9} className="py-4 px-8">
            {/* Overhead + Net Profit Summary */}
            <div className="mb-4 grid grid-cols-5 gap-3">
              <div className="bg-white rounded-lg border border-warm-200 p-2.5">
                <div className="text-xs text-warm-500">Revenue Recognized</div>
                <div className="text-sm font-semibold text-warm-900">{formatCurrency(job.revenueRecognized)}</div>
              </div>
              <div className="bg-white rounded-lg border border-warm-200 p-2.5">
                <div className="text-xs text-warm-500">Gross Profit</div>
                <div className={cn("text-sm font-semibold", job.grossProfit >= 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(job.grossProfit)}</div>
              </div>
              <div className="bg-white rounded-lg border border-warm-200 p-2.5">
                <div className="text-xs text-warm-500">Overhead (10% direct)</div>
                <div className="text-sm font-semibold text-warm-700">{formatCurrency(job.overheadAllocation)}</div>
              </div>
              <div className="bg-white rounded-lg border border-warm-200 p-2.5">
                <div className="text-xs text-warm-500">Net Profit</div>
                <div className={cn("text-sm font-semibold", job.netProfit >= 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(job.netProfit)}</div>
              </div>
              {job.costPerSqFt ? <div className="bg-white rounded-lg border border-warm-200 p-2.5">
                  <div className="text-xs text-warm-500">Cost/SF ({job.sqFt?.toLocaleString()} SF)</div>
                  <div className="text-sm font-semibold text-warm-900">${job.costPerSqFt}/SF</div>
                </div> : null}
            </div>

            {job.costBreakdown ? <div className="mb-4">
                <h5 className="text-sm font-medium text-warm-700 mb-2">Variance by Cost Code</h5>
                <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-warm-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-warm-600">Cost Code</th>
                        <th className="text-right py-2 px-3 font-medium text-warm-600">Budget</th>
                        <th className="text-right py-2 px-3 font-medium text-warm-600">Committed</th>
                        <th className="text-right py-2 px-3 font-medium text-warm-600">Actual</th>
                        <th className="text-right py-2 px-3 font-medium text-warm-600">Projected</th>
                        <th className="text-right py-2 px-3 font-medium text-warm-600">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-100">
                      {job.costBreakdown.map((item, idx) => (
                        <tr key={idx} className={item.isOver ? "bg-red-50/50" : ""}>
                          <td className="py-2 px-3">
                            <span className="font-mono text-warm-500 mr-2">{item.code}</span>
                            {item.name}
                          </td>
                          <td className="py-2 px-3 text-right text-warm-600">{formatCurrency(item.budget)}</td>
                          <td className="py-2 px-3 text-right text-warm-500">{formatCurrency(item.committed)}</td>
                          <td className="py-2 px-3 text-right text-warm-600">{formatCurrency(item.actual)}</td>
                          <td className="py-2 px-3 text-right text-warm-900 font-medium">{formatCurrency(item.projected)}</td>
                          <td className={cn(
                            "py-2 px-3 text-right font-medium",
                            item.isOver ? "text-red-600" : "text-green-600"
                          )}>
                            {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                            {item.isOver ? <AlertTriangle className="h-3 w-3 inline ml-1" /> : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div> : null}
            {job.aiNote ? <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-amber-700">{job.aiNote}</span>
              </div> : null}
          </td>
        </tr> : null}
    </>
  )
}

export function ProfitabilityPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set(['1']))

  const toggleJob = (id: string) => {
    setExpandedJobs(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredJobs = sortItems(
    mockJobs.filter(job => {
      if (!matchesSearch(job, search, ['name'])) return false
      if (activeTab !== 'all' && job.status !== activeTab) return false
      return true
    }),
    activeSort as keyof JobProfitability | '',
    sortDirection,
  )

  // Calculate totals
  const activeJobs = mockJobs.filter(j => j.status === 'active')
  const totalRevenue = activeJobs.reduce((sum, j) => sum + j.revisedContract, 0)
  const totalProjectedCost = activeJobs.reduce((sum, j) => sum + j.projectedCost, 0)
  const totalProfit = totalRevenue - totalProjectedCost
  const avgMargin = activeJobs.reduce((sum, j) => sum + j.grossMargin, 0) / activeJobs.length
  const atRiskCount = activeJobs.filter(j => j.grossMargin < j.targetMargin).length

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Job Profitability</h3>
              <span className="text-sm text-warm-500">{activeJobs.length} active jobs</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Contract Value
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs text-warm-500 mt-0.5">Active jobs</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <BarChart3 className="h-4 w-4" />
              Projected Cost
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{formatCurrency(totalProjectedCost)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            totalProfit >= 0 ? "bg-green-50" : "bg-red-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              totalProfit >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {totalProfit >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              Projected Profit
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              totalProfit >= 0 ? "text-green-700" : "text-red-700"
            )}>
              {formatCurrency(totalProfit)}
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            avgMargin >= 15 ? "bg-green-50" : avgMargin >= 10 ? "bg-amber-50" : "bg-red-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              avgMargin >= 15 ? "text-green-600" : avgMargin >= 10 ? "text-amber-600" : "text-red-600"
            )}>
              <Target className="h-4 w-4" />
              Average Margin
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              avgMargin >= 15 ? "text-green-700" : avgMargin >= 10 ? "text-amber-700" : "text-red-700"
            )}>
              {avgMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-warm-500 mt-0.5">Target: 18%</div>
          </div>
        </div>
      </div>

      {/* At Risk Alert */}
      {atRiskCount > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">
              {atRiskCount} job{atRiskCount > 1 ? 's' : ''} below target margin
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search jobs..."
          tabs={[
            { key: 'all', label: 'All Jobs', count: mockJobs.length },
            { key: 'active', label: 'Active', count: mockJobs.filter(j => j.status === 'active').length },
            { key: 'completed', label: 'Completed', count: mockJobs.filter(j => j.status === 'completed').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'pm', label: 'Project Manager' },
            { value: 'grossMargin', label: 'Margin' },
            { value: 'revisedContract', label: 'Contract Value' },
            { value: 'variance', label: 'Variance' },
            { value: 'completionPct', label: 'Completion' },
            { value: 'netProfit', label: 'Net Profit' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredJobs.length}
          totalCount={mockJobs.length}
        />
      </div>

      {/* Profitability Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-warm-100 border-b border-warm-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-warm-600">Job / PM</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Contract</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Est. Cost</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Actual</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Committed</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Projected</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Variance</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Margin</th>
              <th className="py-3 px-3 font-medium text-warm-600 w-24">Complete</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-warm-100">
            {filteredJobs.map(job => (
              <JobRow
                key={job.id}
                job={job}
                expanded={expandedJobs.has(job.id)}
                onToggle={() => toggleJob(job.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Profitability Heat Map */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-warm-200 p-4">
          <h4 className="font-medium text-warm-900 text-sm mb-3">Margin Health Map</h4>
          <div className="flex items-center gap-2">
            {mockJobs.filter(j => j.status === 'active').map(job => (
              <div
                key={job.id}
                className={cn(
                  "flex-1 rounded-lg p-3 text-center cursor-pointer hover:ring-2 hover:ring-stone-300 transition-all",
                  job.grossMargin >= job.targetMargin ? "bg-green-100" :
                  job.grossMargin >= job.targetMargin - 5 ? "bg-amber-100" : "bg-red-100"
                )}
                title={`${job.name}: ${job.grossMargin}% margin`}
              >
                <div className="text-xs font-medium text-warm-700 truncate">{job.name.split(' ')[0]}</div>
                <div className={cn(
                  "text-lg font-bold",
                  job.grossMargin >= job.targetMargin ? "text-green-700" :
                  job.grossMargin >= job.targetMargin - 5 ? "text-amber-700" : "text-red-700"
                )}>
                  {job.grossMargin.toFixed(1)}%
                </div>
                <div className="text-xs text-warm-500">{job.completionPct}% done</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-4 mt-2 text-xs text-warm-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded" /> Above target</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-100 rounded" /> At risk</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded" /> Below target</span>
          </div>
        </div>
      </div>

      {/* YTD Summary */}
      <div className="bg-warm-100 border-t border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-warm-700">YTD Summary:</span>
          <div className="flex items-center gap-6">
            <span className="text-warm-600">
              Revenue: <span className="font-semibold text-warm-900">{formatCurrency(8400000)}</span>
            </span>
            <span className="text-warm-600">
              Cost: <span className="font-semibold text-warm-900">{formatCurrency(6900000)}</span>
            </span>
            <span className="text-warm-600">
              Overhead: <span className="font-semibold text-warm-700">{formatCurrency(690000)}</span>
            </span>
            <span className="text-warm-600">
              Net Profit: <span className="font-semibold text-green-600">{formatCurrency(810000)}</span>
            </span>
            <span className="text-warm-600">
              Net Margin: <span className="font-semibold text-green-600">9.6%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Benchmarking Bar */}
      <div className="bg-stone-50 border-t border-stone-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-stone-500" />
            <span className="text-stone-700 font-medium">Benchmarking:</span>
          </div>
          <div className="flex items-center gap-6 text-stone-600">
            <span>Avg cost/SF: <span className="font-semibold">$385</span> (industry: $410)</span>
            <span>Avg margin: <span className="font-semibold">14.8%</span> (industry: 16%)</span>
            <span>CO rate: <span className="font-semibold">5.2%</span> of contract</span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Profitability Insights:</span>
          </div>
          <p className="text-sm text-amber-700">
            Smith Residence margin erosion identified - framing labor overrun due to complex tray ceilings.
            Recommend change order for $18K additional scope. Davis Coastal Home foundation costs 12% over estimate -
            consider adjusting coastal foundation estimates for future bids. Jobs using ABC Framing average 3% higher margins
            than XYZ Framing based on last 8 projects.
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="px-4 py-4 bg-white border-t border-warm-200">
        <AIFeaturesPanel
          title="AI-Powered Profitability Features"
          columns={2}
          features={[
            {
              feature: 'Margin Analysis',
              trigger: 'Real-time',
              insight: 'Tracks profit margins by job/category',
              detail: 'Monitors gross and net margins across all active jobs, alerting when margins fall below target thresholds. Currently tracking 5 active jobs with average margin of 13.9%.',
              severity: 'info',
              confidence: 92,
            },
            {
              feature: 'Cost Driver Detection',
              trigger: 'On change',
              insight: 'Identifies factors affecting profit',
              detail: 'Analyzes cost code variances to pinpoint specific line items driving margin erosion. Currently flagging framing labor on Smith Residence as primary cost driver.',
              severity: 'warning',
              confidence: 87,
            },
            {
              feature: 'Forecast Accuracy',
              trigger: 'Weekly',
              insight: 'Compares projected vs actual',
              detail: 'Evaluates the accuracy of cost projections against actual costs as jobs progress. Current forecast accuracy across portfolio: 94.2%.',
              severity: 'success',
              confidence: 94,
            },
            {
              feature: 'Benchmark Comparison',
              trigger: 'Daily',
              insight: 'Compares to industry standards',
              detail: 'Compares your cost per square foot, margins, and change order rates against industry benchmarks. Your avg cost/SF of $385 is 6% below industry average.',
              severity: 'success',
              confidence: 88,
            },
            {
              feature: 'Improvement Suggestions',
              trigger: 'On change',
              insight: 'Recommends profit improvements',
              detail: 'Provides actionable recommendations to improve profitability based on historical data and current trends. Top suggestion: Submit change order for tray ceiling scope on Smith Residence.',
              severity: 'warning',
              confidence: 85,
            },
          ]}
        />
      </div>
    </div>
  )
}
