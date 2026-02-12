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
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface JobProfitability {
  id: string
  name: string
  status: 'active' | 'completed'
  contractAmount: number
  changeOrders: number
  revisedContract: number
  estimatedCost: number
  actualCost: number
  projectedCost: number
  grossProfit: number
  grossMargin: number
  variance: number
  completionPct: number
  targetMargin: number
  costBreakdown?: CostCodeVariance[]
  aiNote?: string
}

interface CostCodeVariance {
  code: string
  name: string
  budget: number
  actual: number
  variance: number
  isOver: boolean
}

const mockJobs: JobProfitability[] = [
  {
    id: '1',
    name: 'Smith Residence',
    status: 'active',
    contractAmount: 2400000,
    changeOrders: 150000,
    revisedContract: 2550000,
    estimatedCost: 1970000,
    actualCost: 985000,
    projectedCost: 2188000,
    grossProfit: 362000,
    grossMargin: 14.2,
    variance: -68000,
    completionPct: 50,
    targetMargin: 18,
    aiNote: 'Margin dropped from 18% to 14.2%. Primary driver: Framing labor 40% over budget due to tray ceiling complexity.',
    costBreakdown: [
      { code: '06', name: 'Framing Labor', budget: 85000, actual: 119000, variance: -34000, isOver: true },
      { code: '06', name: 'Framing Material', budget: 124000, actual: 131000, variance: -7000, isOver: true },
      { code: '16', name: 'Electrical', budget: 95000, actual: 92000, variance: 3000, isOver: false },
      { code: '15', name: 'Plumbing', budget: 78000, actual: 76500, variance: 1500, isOver: false },
      { code: '03', name: 'Concrete', budget: 125000, actual: 128000, variance: -3000, isOver: true },
    ],
  },
  {
    id: '2',
    name: 'Johnson Beach House',
    status: 'active',
    contractAmount: 1800000,
    changeOrders: 45000,
    revisedContract: 1845000,
    estimatedCost: 1470000,
    actualCost: 420000,
    projectedCost: 1503000,
    grossProfit: 342000,
    grossMargin: 18.5,
    variance: 33000,
    completionPct: 28,
    targetMargin: 18,
  },
  {
    id: '3',
    name: 'Williams Remodel',
    status: 'active',
    contractAmount: 450000,
    changeOrders: 25000,
    revisedContract: 475000,
    estimatedCost: 360000,
    actualCost: 290000,
    projectedCost: 381000,
    grossProfit: 94000,
    grossMargin: 19.8,
    variance: -21000,
    completionPct: 76,
    targetMargin: 18,
  },
  {
    id: '4',
    name: 'Miller Addition',
    status: 'active',
    contractAmount: 425000,
    changeOrders: 0,
    revisedContract: 425000,
    estimatedCost: 340000,
    actualCost: 285000,
    projectedCost: 382500,
    grossProfit: 42500,
    grossMargin: 10.0,
    variance: -42500,
    completionPct: 75,
    targetMargin: 18,
    aiNote: 'Cabinet installation delay increased labor costs. Consider change order for scope creep in custom shelving.',
  },
  {
    id: '5',
    name: 'Davis Coastal Home',
    status: 'active',
    contractAmount: 1850000,
    changeOrders: 95000,
    revisedContract: 1945000,
    estimatedCost: 1620000,
    actualCost: 1580000,
    projectedCost: 1810000,
    grossProfit: 135000,
    grossMargin: 6.9,
    variance: -190000,
    completionPct: 92,
    targetMargin: 18,
    aiNote: 'Over budget primarily due to foundation complications (elevated coastal). Recommend adjusting future coastal estimates +12%.',
  },
  {
    id: '6',
    name: 'Thompson Renovation',
    status: 'completed',
    contractAmount: 320000,
    changeOrders: 28000,
    revisedContract: 348000,
    estimatedCost: 268000,
    actualCost: 279000,
    projectedCost: 279000,
    grossProfit: 69000,
    grossMargin: 19.8,
    variance: -11000,
    completionPct: 100,
    targetMargin: 18,
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
          "hover:bg-gray-50 cursor-pointer",
          expanded && "bg-blue-50",
          marginStatus === 'at-risk' && "bg-amber-50/30",
          marginStatus === 'over-budget' && "bg-red-50/30"
        )}
        onClick={onToggle}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <div>
              <span className="font-medium text-gray-900">{job.name}</span>
              {job.aiNote && <Sparkles className="h-3 w-3 text-amber-500 inline ml-2" />}
            </div>
          </div>
        </td>
        <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(job.revisedContract)}</td>
        <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(job.estimatedCost)}</td>
        <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(job.actualCost)}</td>
        <td className="py-3 px-3 text-right font-medium text-gray-900">{formatCurrency(job.projectedCost)}</td>
        <td className="py-3 px-3 text-right">
          <VarianceDisplay variance={job.variance} />
        </td>
        <td className="py-3 px-3 text-right">
          <MarginIndicator margin={job.grossMargin} target={job.targetMargin} />
        </td>
        <td className="py-3 px-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full",
                marginStatus === 'on-track' ? "bg-green-500" :
                marginStatus === 'at-risk' ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${job.completionPct}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{job.completionPct}%</span>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-blue-50/50">
          <td colSpan={8} className="py-4 px-8">
            {job.costBreakdown && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Variance by Cost Code</h5>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Cost Code</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">Budget</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">Actual</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {job.costBreakdown.map((item, idx) => (
                        <tr key={idx} className={item.isOver ? "bg-red-50/50" : ""}>
                          <td className="py-2 px-3">
                            <span className="font-mono text-gray-500 mr-2">{item.code}</span>
                            {item.name}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-600">{formatCurrency(item.budget)}</td>
                          <td className="py-2 px-3 text-right text-gray-600">{formatCurrency(item.actual)}</td>
                          <td className={cn(
                            "py-2 px-3 text-right font-medium",
                            item.isOver ? "text-red-600" : "text-green-600"
                          )}>
                            {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                            {item.isOver && <AlertTriangle className="h-3 w-3 inline ml-1" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {job.aiNote && (
              <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-amber-700">{job.aiNote}</span>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export function ProfitabilityPreview() {
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set(['1']))
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')

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

  const filteredJobs = mockJobs.filter(job => {
    if (statusFilter === 'all') return true
    return job.status === statusFilter
  })

  // Calculate totals
  const activeJobs = mockJobs.filter(j => j.status === 'active')
  const totalRevenue = activeJobs.reduce((sum, j) => sum + j.revisedContract, 0)
  const totalProjectedCost = activeJobs.reduce((sum, j) => sum + j.projectedCost, 0)
  const totalProfit = totalRevenue - totalProjectedCost
  const avgMargin = activeJobs.reduce((sum, j) => sum + j.grossMargin, 0) / activeJobs.length
  const atRiskCount = activeJobs.filter(j => j.grossMargin < j.targetMargin).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Job Profitability</h3>
              <span className="text-sm text-gray-500">{activeJobs.length} active jobs</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Contract Value
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Active jobs</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <BarChart3 className="h-4 w-4" />
              Projected Cost
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalProjectedCost)}</div>
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
            <div className="text-xs text-gray-500 mt-0.5">Target: 18%</div>
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
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">View:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                "px-2.5 py-1 text-xs rounded-lg transition-colors",
                statusFilter === 'all'
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              All Jobs
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={cn(
                "px-2.5 py-1 text-xs rounded-lg transition-colors",
                statusFilter === 'active'
                  ? "bg-green-100 text-green-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={cn(
                "px-2.5 py-1 text-xs rounded-lg transition-colors",
                statusFilter === 'completed'
                  ? "bg-gray-200 text-gray-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Profitability Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Job</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Contract</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Est. Cost</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Actual Cost</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Projected</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Variance</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Margin</th>
              <th className="py-3 px-3 font-medium text-gray-600 w-24">Complete</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
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

      {/* YTD Summary */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">YTD Summary:</span>
          <div className="flex items-center gap-6">
            <span className="text-gray-600">
              Revenue: <span className="font-semibold text-gray-900">{formatCurrency(8400000)}</span>
            </span>
            <span className="text-gray-600">
              Cost: <span className="font-semibold text-gray-900">{formatCurrency(6900000)}</span>
            </span>
            <span className="text-gray-600">
              Profit: <span className="font-semibold text-green-600">{formatCurrency(1500000)}</span>
            </span>
            <span className="text-gray-600">
              Margin: <span className="font-semibold text-green-600">17.9%</span>
            </span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
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
    </div>
  )
}
