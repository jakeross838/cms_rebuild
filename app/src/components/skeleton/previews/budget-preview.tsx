'use client'

import { useState } from 'react'

import {
  ChevronDown,
  ChevronRight,
  Download,
  Lock,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  FileText,
  ShoppingCart,
  ClipboardList,
  Eye,
  Shield,
  Clock,
  Target,
  Layers,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

interface BudgetLine {
  id: string
  code: string
  name: string
  lineType: 'standard' | 'allowance' | 'contingency' | 'alternate'
  originalBudget: number
  approvedChanges: number
  revisedBudget: number
  committed: number
  actual: number
  projected: number
  costToComplete: number
  percentComplete: number
  alertLevel: 'none' | 'warning' | 'critical' | 'over'
  linkedPOs: number
  linkedInvoices: number
  linkedCOs: number
  vendor?: string
  aiNote?: string
  aiConfidence?: number
}

const mockBudgetLines: BudgetLine[] = [
  {
    id: '1',
    code: '01',
    name: 'General Conditions',
    lineType: 'standard',
    originalBudget: 45000,
    approvedChanges: 5000,
    revisedBudget: 50000,
    committed: 48000,
    actual: 42000,
    projected: 52000,
    costToComplete: 10000,
    percentComplete: 84,
    alertLevel: 'warning',
    linkedPOs: 3,
    linkedInvoices: 8,
    linkedCOs: 1,
    aiNote: 'Extended schedule adding $2K to general conditions. CPI: 0.92 indicates slight cost overrun trend.',
    aiConfidence: 0.87,
  },
  {
    id: '2',
    code: '02',
    name: 'Site Work',
    lineType: 'standard',
    originalBudget: 85000,
    approvedChanges: 12000,
    revisedBudget: 97000,
    committed: 95000,
    actual: 95000,
    projected: 98000,
    costToComplete: 3000,
    percentComplete: 97,
    alertLevel: 'critical',
    linkedPOs: 2,
    linkedInvoices: 5,
    linkedCOs: 2,
    vendor: 'Gulf Coast Earthworks',
  },
  {
    id: '3',
    code: '03',
    name: 'Concrete',
    lineType: 'standard',
    originalBudget: 125000,
    approvedChanges: 8000,
    revisedBudget: 133000,
    committed: 130000,
    actual: 128000,
    projected: 135000,
    costToComplete: 7000,
    percentComplete: 96,
    alertLevel: 'warning',
    linkedPOs: 4,
    linkedInvoices: 6,
    linkedCOs: 1,
    vendor: 'Gulf Coast Concrete',
  },
  {
    id: '4',
    code: '04',
    name: 'Masonry',
    lineType: 'standard',
    originalBudget: 35000,
    approvedChanges: 0,
    revisedBudget: 35000,
    committed: 32000,
    actual: 28000,
    projected: 34000,
    costToComplete: 6000,
    percentComplete: 80,
    alertLevel: 'none',
    linkedPOs: 1,
    linkedInvoices: 3,
    linkedCOs: 0,
    vendor: 'Emerald Coast Masonry',
  },
  {
    id: '5',
    code: '05',
    name: 'Steel',
    lineType: 'standard',
    originalBudget: 28000,
    approvedChanges: 0,
    revisedBudget: 28000,
    committed: 28000,
    actual: 28000,
    projected: 28000,
    costToComplete: 0,
    percentComplete: 100,
    alertLevel: 'none',
    linkedPOs: 1,
    linkedInvoices: 2,
    linkedCOs: 0,
    vendor: 'Southern Steel Fab',
  },
  {
    id: '6',
    code: '06',
    name: 'Carpentry',
    lineType: 'standard',
    originalBudget: 185000,
    approvedChanges: 15000,
    revisedBudget: 200000,
    committed: 195000,
    actual: 165000,
    projected: 215000,
    costToComplete: 50000,
    percentComplete: 77,
    alertLevel: 'over',
    linkedPOs: 6,
    linkedInvoices: 12,
    linkedCOs: 3,
    vendor: 'ABC Framing Co.',
    aiNote: 'Complex roof + lumber prices trending $15K over. Recommend CO for owner-approved roof complexity ($12K). Based on 14 similar coastal elevated homes.',
    aiConfidence: 0.91,
  },
  {
    id: '7',
    code: '07',
    name: 'Thermal & Moisture',
    lineType: 'standard',
    originalBudget: 45000,
    approvedChanges: 0,
    revisedBudget: 45000,
    committed: 0,
    actual: 0,
    projected: 45000,
    costToComplete: 45000,
    percentComplete: 0,
    alertLevel: 'none',
    linkedPOs: 0,
    linkedInvoices: 0,
    linkedCOs: 0,
  },
  {
    id: '8',
    code: '08',
    name: 'Doors & Windows',
    lineType: 'allowance',
    originalBudget: 95000,
    approvedChanges: 0,
    revisedBudget: 95000,
    committed: 92000,
    actual: 0,
    projected: 95000,
    costToComplete: 95000,
    percentComplete: 0,
    alertLevel: 'none',
    linkedPOs: 2,
    linkedInvoices: 0,
    linkedCOs: 0,
    vendor: 'PGT Industries',
    aiNote: 'Allowance line. Client selected impact windows — PGT quote $92K vs $95K allowance. $3K credit pending.',
    aiConfidence: 0.95,
  },
  {
    id: '9',
    code: '09',
    name: 'Finishes',
    lineType: 'standard',
    originalBudget: 165000,
    approvedChanges: 22000,
    revisedBudget: 187000,
    committed: 145000,
    actual: 82000,
    projected: 190000,
    costToComplete: 108000,
    percentComplete: 44,
    alertLevel: 'none',
    linkedPOs: 8,
    linkedInvoices: 7,
    linkedCOs: 2,
    vendor: 'Multiple',
  },
  {
    id: '10',
    code: 'CTG',
    name: 'Contingency',
    lineType: 'contingency',
    originalBudget: 75000,
    approvedChanges: -18000,
    revisedBudget: 57000,
    committed: 0,
    actual: 18000,
    projected: 32000,
    costToComplete: 14000,
    percentComplete: 32,
    alertLevel: 'none',
    linkedPOs: 0,
    linkedInvoices: 2,
    linkedCOs: 0,
    aiNote: '3 contingency draws totaling $18K (plumbing reroute, soil issue, electrical upgrade). $39K remaining. Typical usage at this stage: 28% — you are slightly above average.',
    aiConfidence: 0.82,
  },
]

type ContractType = 'fixed_price' | 'cost_plus' | 'gmp'
type AudienceView = 'pm' | 'owner' | 'bank'

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (Math.abs(value) >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function formatVariance(value: number): string {
  const formatted = formatCurrency(Math.abs(value))
  return value >= 0 ? '+' + formatted : '-' + formatted
}

function VarianceIndicator({ variance, revised }: { variance: number; revised: number }) {
  const percent = revised > 0 ? (variance / revised) * 100 : 0

  if (variance > 0) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <TrendingUp className="h-4 w-4" />
        <span className="font-medium">{formatVariance(variance)}</span>
      </div>
    )
  }

  if (variance < 0 && percent < -5) {
    return (
      <div className="flex items-center gap-1 text-red-600">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">{formatVariance(variance)}</span>
      </div>
    )
  }

  if (variance < 0) {
    return (
      <div className="flex items-center gap-1 text-amber-600">
        <TrendingDown className="h-4 w-4" />
        <span className="font-medium">{formatVariance(variance)}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-warm-500">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span className="font-medium">$0</span>
    </div>
  )
}

function LineTypeBadge({ type }: { type: BudgetLine['lineType'] }) {
  const config = {
    standard: null,
    allowance: { label: 'Allowance', color: 'bg-warm-50 text-warm-700' },
    contingency: { label: 'Contingency', color: 'bg-sand-50 text-sand-700' },
    alternate: { label: 'Alternate', color: 'bg-stone-50 text-stone-700' },
  }
  const badge = config[type]
  if (!badge) return null
  return (
    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', badge.color)}>
      {badge.label}
    </span>
  )
}

function AlertBadge({ level }: { level: BudgetLine['alertLevel'] }) {
  if (level === 'none') return null
  const config = {
    warning: { color: 'bg-amber-100 text-amber-700', label: '80%+' },
    critical: { color: 'bg-red-100 text-red-700', label: '95%+' },
    over: { color: 'bg-red-200 text-red-800', label: 'Over' },
  }
  const badge = config[level]
  return (
    <span className={cn('text-[10px] px-1 py-0.5 rounded font-medium', badge.color)}>
      {badge.label}
    </span>
  )
}

function BudgetRow({ line, expanded, onToggle }: { line: BudgetLine; expanded: boolean; onToggle: () => void }) {
  const variance = line.revisedBudget - line.projected

  return (
    <>
      <tr
        className={cn(
          "hover:bg-warm-50 cursor-pointer",
          expanded && "bg-stone-50",
          line.alertLevel === 'over' && "bg-red-50/50"
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
            <span className="font-mono text-warm-500">{line.code}</span>
            <span className="font-medium text-warm-900">{line.name}</span>
            <LineTypeBadge type={line.lineType} />
            <AlertBadge level={line.alertLevel} />
            {line.aiNote ? <Sparkles className="h-4 w-4 text-amber-500" /> : null}
          </div>
        </td>
        <td className="py-3 px-3 text-right text-warm-600">{formatCurrency(line.originalBudget)}</td>
        <td className="py-3 px-3 text-right text-warm-600">
          {line.approvedChanges !== 0 ? (
            <span className={line.approvedChanges < 0 ? 'text-red-600' : ''}>
              {formatCurrency(line.approvedChanges)}
            </span>
          ) : '-'}
        </td>
        <td className="py-3 px-3 text-right font-medium text-warm-900">{formatCurrency(line.revisedBudget)}</td>
        <td className="py-3 px-3 text-right text-warm-600">{formatCurrency(line.committed)}</td>
        <td className="py-3 px-3 text-right text-warm-600">{formatCurrency(line.actual)}</td>
        <td className="py-3 px-3 text-right font-medium text-warm-900">{formatCurrency(line.projected)}</td>
        <td className="py-3 px-3 text-right">
          <VarianceIndicator variance={variance} revised={line.revisedBudget} />
        </td>
        <td className="py-3 px-3">
          <div className="flex items-center gap-2">
            <div className="w-16 bg-warm-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full",
                  line.percentComplete === 100 ? "bg-green-500" :
                  line.alertLevel === 'over' ? "bg-red-500" : "bg-stone-600"
                )}
                style={{ width: `${Math.min(line.percentComplete, 100)}%` }}
              />
            </div>
            <span className="text-xs text-warm-500 w-8">{line.percentComplete}%</span>
          </div>
        </td>
      </tr>
      {expanded ? <tr className={cn(expanded && "bg-stone-50")}>
          <td colSpan={9} className="py-2 px-12">
            <div className="space-y-2">
              {/* Cross-module connections */}
              <div className="flex items-center gap-3 text-xs">
                {line.linkedPOs > 0 && (
                  <span className="flex items-center gap-1 bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">
                    <ShoppingCart className="h-3 w-3" />
                    {line.linkedPOs} PO{line.linkedPOs > 1 ? 's' : ''}
                  </span>
                )}
                {line.linkedInvoices > 0 && (
                  <span className="flex items-center gap-1 bg-green-50 text-green-600 px-1.5 py-0.5 rounded">
                    <FileText className="h-3 w-3" />
                    {line.linkedInvoices} Invoice{line.linkedInvoices > 1 ? 's' : ''}
                  </span>
                )}
                {line.linkedCOs > 0 && (
                  <span className="flex items-center gap-1 bg-sand-50 text-sand-600 px-1.5 py-0.5 rounded">
                    <ClipboardList className="h-3 w-3" />
                    {line.linkedCOs} CO{line.linkedCOs > 1 ? 's' : ''}
                  </span>
                )}
                {line.vendor ? <span className="text-warm-500">
                    Vendor: <span className="font-medium text-warm-700">{line.vendor}</span>
                  </span> : null}
                <span className="text-warm-500">
                  Cost to Complete: <span className="font-medium text-warm-700">{formatCurrency(line.costToComplete)}</span>
                </span>
                {line.aiConfidence !== undefined && (
                  <span className="flex items-center gap-1 text-warm-400">
                    <Target className="h-3 w-3" />
                    AI conf: {Math.round(line.aiConfidence * 100)}%
                  </span>
                )}
              </div>
              {/* AI Note */}
              {line.aiNote ? <div className="flex items-start gap-2 text-sm text-amber-700">
                  <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                  <span>{line.aiNote}</span>
                </div> : null}
            </div>
          </td>
        </tr> : null}
    </>
  )
}

export function BudgetPreview() {
  const { search, setSearch, activeSort, setActiveSort, sortDirection, toggleSortDirection, activeTab, setActiveTab } = useFilterState({ defaultTab: 'all' })
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['6', '10']))
  const [contractType] = useState<ContractType>('fixed_price')
  const [audienceView, setAudienceView] = useState<AudienceView>('pm')

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredBudgetLines = sortItems(
    mockBudgetLines.filter(line => {
      if (!matchesSearch(line, search, ['name', 'code'])) return false
      if (activeTab === 'alerts' && line.alertLevel === 'none') return false
      if (activeTab === 'allowances' && line.lineType !== 'allowance' && line.lineType !== 'contingency') return false
      return true
    }),
    activeSort as keyof BudgetLine | '',
    sortDirection,
  )

  const totals = mockBudgetLines.reduce((acc, line) => ({
    originalBudget: acc.originalBudget + line.originalBudget,
    approvedChanges: acc.approvedChanges + line.approvedChanges,
    revisedBudget: acc.revisedBudget + line.revisedBudget,
    committed: acc.committed + line.committed,
    actual: acc.actual + line.actual,
    projected: acc.projected + line.projected,
    costToComplete: acc.costToComplete + line.costToComplete,
  }), { originalBudget: 0, approvedChanges: 0, revisedBudget: 0, committed: 0, actual: 0, projected: 0, costToComplete: 0 })

  const totalVariance = totals.revisedBudget - totals.projected
  const contractAmount = 2450000
  const projectedMargin = ((contractAmount - totals.projected) / contractAmount) * 100
  const alertCount = mockBudgetLines.filter(l => l.alertLevel !== 'none').length
  const contingencyLine = mockBudgetLines.find(l => l.lineType === 'contingency')
  const contingencyRemaining = contingencyLine ? contingencyLine.revisedBudget - contingencyLine.actual : 0

  // Earned value metrics
  const cpi = totals.actual > 0 ? (totals.revisedBudget * (totals.actual / totals.projected)) / totals.actual : 1
  const spi = 0.94 // Mock: slightly behind schedule

  const contractTypeLabels: Record<ContractType, string> = {
    fixed_price: 'Fixed Price',
    cost_plus: 'Cost Plus',
    gmp: 'GMP',
  }

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-warm-900">Budget - Smith Residence</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
            <span className="text-xs bg-stone-50 text-stone-600 px-2 py-0.5 rounded">{contractTypeLabels[contractType]}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Multi-Audience View Toggle */}
            <div className="flex border border-warm-200 rounded-lg overflow-hidden">
              {(['pm', 'owner', 'bank'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setAudienceView(view)}
                  className={cn(
                    "px-2.5 py-1.5 text-xs font-medium",
                    audienceView === view ? "bg-stone-50 text-stone-700" : "text-warm-500 hover:bg-warm-50"
                  )}
                >
                  {view === 'pm' ? 'PM Detail' : view === 'owner' ? 'Owner' : 'Lender'}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Lock className="h-4 w-4" />
              Lock Budget
            </button>
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search cost codes..."
          tabs={[
            { key: 'all', label: 'All Lines', count: mockBudgetLines.length },
            { key: 'alerts', label: 'At Risk', count: alertCount },
            { key: 'allowances', label: 'Allowances / Contingency', count: mockBudgetLines.filter(l => l.lineType === 'allowance' || l.lineType === 'contingency').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'code', label: 'Cost Code' },
            { value: 'name', label: 'Name' },
            { value: 'revisedBudget', label: 'Revised Budget' },
            { value: 'projected', label: 'Projected' },
            { value: 'percentComplete', label: 'Completion' },
            { value: 'costToComplete', label: 'Cost to Complete' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredBudgetLines.length}
          totalCount={mockBudgetLines.length}
        />
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-xs">
              <DollarSign className="h-3.5 w-3.5" />
              Contract
            </div>
            <div className="text-lg font-bold text-warm-900 mt-1">$2.45M</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              Projected Cost
            </div>
            <div className="text-lg font-bold text-warm-900 mt-1">{formatCurrency(totals.projected)}</div>
            <div className="text-[10px] text-warm-400 mt-0.5">CTC: {formatCurrency(totals.costToComplete)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            totalVariance >= 0 ? "bg-green-50" : "bg-red-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-xs",
              totalVariance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {totalVariance >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              Variance
            </div>
            <div className={cn(
              "text-lg font-bold mt-1",
              totalVariance >= 0 ? "text-green-700" : "text-red-700"
            )}>
              {formatVariance(totalVariance)}
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            projectedMargin >= 15 ? "bg-green-50" : projectedMargin >= 10 ? "bg-amber-50" : "bg-red-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-xs",
              projectedMargin >= 15 ? "text-green-600" : projectedMargin >= 10 ? "text-amber-600" : "text-red-600"
            )}>
              Margin
              {projectedMargin < 15 && <TrendingDown className="h-3.5 w-3.5" />}
            </div>
            <div className={cn(
              "text-lg font-bold mt-1",
              projectedMargin >= 15 ? "text-green-700" : projectedMargin >= 10 ? "text-amber-700" : "text-red-700"
            )}>
              {projectedMargin.toFixed(1)}%
            </div>
          </div>
          {/* Contingency Tracker */}
          <div className="bg-sand-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sand-600 text-xs">
              <Shield className="h-3.5 w-3.5" />
              Contingency
            </div>
            <div className="text-lg font-bold text-sand-700 mt-1">{formatCurrency(contingencyRemaining)}</div>
            <div className="w-full bg-orange-200 rounded-full h-1.5 mt-1">
              <div
                className="bg-sand-500 h-1.5 rounded-full"
                style={{ width: `${contingencyLine ? (contingencyLine.actual / contingencyLine.originalBudget) * 100 : 0}%` }}
              />
            </div>
            <div className="text-[10px] text-sand-600 mt-0.5">
              {contingencyLine ? Math.round((contingencyLine.actual / contingencyLine.originalBudget) * 100) : 0}% used of {formatCurrency(contingencyLine?.originalBudget ?? 0)}
            </div>
          </div>
          {/* Earned Value Indicators */}
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-xs">
              <Layers className="h-3.5 w-3.5" />
              Earned Value
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div>
                <div className={cn("text-sm font-bold", cpi >= 1 ? "text-green-700" : "text-red-700")}>
                  CPI {cpi.toFixed(2)}
                </div>
              </div>
              <div>
                <div className={cn("text-sm font-bold", spi >= 1 ? "text-green-700" : "text-amber-700")}>
                  SPI {spi.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-warm-400 mt-0.5">
              {cpi >= 1 ? 'Under budget pace' : 'Over budget pace'} / {spi >= 1 ? 'On schedule' : 'Behind schedule'}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Alerts Banner */}
      {alertCount > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-800">
            <span className="font-medium">{alertCount} cost code{alertCount > 1 ? 's' : ''}</span> approaching or exceeding budget thresholds
          </span>
          <span className="text-xs text-amber-600 ml-auto flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Thresholds: Warning 80% / Critical 95%
          </span>
        </div>
      )}

      {/* Budget Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-warm-100 border-b border-warm-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-warm-600">Cost Code</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Original</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Changes</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Revised</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Committed</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Actual</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Projected</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Variance</th>
              <th className="py-3 px-3 font-medium text-warm-600 w-32">Progress</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-warm-100">
            {filteredBudgetLines.map(line => (
              <BudgetRow
                key={line.id}
                line={line}
                expanded={expandedRows.has(line.id)}
                onToggle={() => toggleRow(line.id)}
              />
            ))}
          </tbody>
          <tfoot className="bg-warm-50 border-t-2 border-warm-300">
            <tr className="font-semibold">
              <td className="py-3 px-4 text-warm-900">TOTALS</td>
              <td className="py-3 px-3 text-right text-warm-900">{formatCurrency(totals.originalBudget)}</td>
              <td className="py-3 px-3 text-right text-warm-900">{formatCurrency(totals.approvedChanges)}</td>
              <td className="py-3 px-3 text-right text-warm-900">{formatCurrency(totals.revisedBudget)}</td>
              <td className="py-3 px-3 text-right text-warm-900">{formatCurrency(totals.committed)}</td>
              <td className="py-3 px-3 text-right text-warm-900">{formatCurrency(totals.actual)}</td>
              <td className="py-3 px-3 text-right text-warm-900">{formatCurrency(totals.projected)}</td>
              <td className="py-3 px-3 text-right">
                <VarianceIndicator variance={totalVariance} revised={totals.revisedBudget} />
              </td>
              <td className="py-3 px-3" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Change Order Impact Summary */}
      <div className="bg-white border-t border-warm-200 px-4 py-3">
        <div className="flex items-center gap-6 text-xs text-warm-500">
          <span className="font-medium text-warm-700">Budget Composition:</span>
          <span>Original Budget: {formatCurrency(totals.originalBudget)}</span>
          <span className="text-warm-300">+</span>
          <span className="text-sand-600">Approved COs: {formatCurrency(totals.approvedChanges)}</span>
          <span className="text-warm-300">=</span>
          <span className="font-medium text-warm-900">Current Budget: {formatCurrency(totals.revisedBudget)}</span>
          <span className="ml-auto flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Viewing: {audienceView === 'pm' ? 'PM Detail View' : audienceView === 'owner' ? 'Owner Summary' : 'AIA G702/G703'}
          </span>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Budget Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            Carpentry trending $15K over revised budget. CPI 0.92 suggests cost overrun trend. Your framing costs on elevated coastal homes are typically 8% over estimate (based on 14 similar jobs).
            Recommend CO for owner-approved roof complexity ($12K). Contingency at 24% draw-down is slightly above average for 77% completion.
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Budget Forecasting',
            insight: 'Predicts budget trends and variances',
          },
          {
            feature: 'Cost Code Analysis',
            insight: 'Identifies over/under budget categories',
          },
          {
            feature: 'Change Order Impact',
            insight: 'Shows CO effect on budget',
          },
          {
            feature: 'Contingency Tracking',
            insight: 'Monitors contingency utilization',
          },
          {
            feature: 'Vendor Cost Trends',
            insight: 'Tracks vendor pricing patterns',
          },
        ]}
      />
    </div>
  )
}
