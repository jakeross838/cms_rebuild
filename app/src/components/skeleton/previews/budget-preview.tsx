'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Download,
  Lock,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BudgetLine {
  id: string
  code: string
  name: string
  originalBudget: number
  approvedChanges: number
  revisedBudget: number
  committed: number
  actual: number
  projected: number
  percentComplete: number
  aiNote?: string
}

const mockBudgetLines: BudgetLine[] = [
  {
    id: '1',
    code: '01',
    name: 'General Conditions',
    originalBudget: 45000,
    approvedChanges: 5000,
    revisedBudget: 50000,
    committed: 48000,
    actual: 42000,
    projected: 52000,
    percentComplete: 84,
    aiNote: 'Extended schedule adding $2K',
  },
  {
    id: '2',
    code: '02',
    name: 'Site Work',
    originalBudget: 85000,
    approvedChanges: 12000,
    revisedBudget: 97000,
    committed: 95000,
    actual: 95000,
    projected: 98000,
    percentComplete: 97,
  },
  {
    id: '3',
    code: '03',
    name: 'Concrete',
    originalBudget: 125000,
    approvedChanges: 8000,
    revisedBudget: 133000,
    committed: 130000,
    actual: 128000,
    projected: 135000,
    percentComplete: 96,
  },
  {
    id: '4',
    code: '04',
    name: 'Masonry',
    originalBudget: 35000,
    approvedChanges: 0,
    revisedBudget: 35000,
    committed: 32000,
    actual: 28000,
    projected: 34000,
    percentComplete: 80,
  },
  {
    id: '5',
    code: '05',
    name: 'Steel',
    originalBudget: 28000,
    approvedChanges: 0,
    revisedBudget: 28000,
    committed: 28000,
    actual: 28000,
    projected: 28000,
    percentComplete: 100,
  },
  {
    id: '6',
    code: '06',
    name: 'Carpentry',
    originalBudget: 185000,
    approvedChanges: 15000,
    revisedBudget: 200000,
    committed: 195000,
    actual: 165000,
    projected: 215000,
    percentComplete: 77,
    aiNote: 'Complex roof + lumber prices trending $15K over',
  },
  {
    id: '7',
    code: '07',
    name: 'Thermal & Moisture',
    originalBudget: 45000,
    approvedChanges: 0,
    revisedBudget: 45000,
    committed: 0,
    actual: 0,
    projected: 45000,
    percentComplete: 0,
  },
  {
    id: '8',
    code: '08',
    name: 'Doors & Windows',
    originalBudget: 95000,
    approvedChanges: 0,
    revisedBudget: 95000,
    committed: 92000,
    actual: 0,
    projected: 95000,
    percentComplete: 0,
  },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
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
    <div className="flex items-center gap-1 text-gray-500">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span className="font-medium">$0</span>
    </div>
  )
}

function BudgetRow({ line, expanded, onToggle }: { line: BudgetLine; expanded: boolean; onToggle: () => void }) {
  const variance = line.revisedBudget - line.projected

  return (
    <>
      <tr
        className={cn(
          "hover:bg-gray-50 cursor-pointer",
          expanded && "bg-blue-50"
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
            <span className="font-mono text-gray-500">{line.code}</span>
            <span className="font-medium text-gray-900">{line.name}</span>
            {line.aiNote && (
              <Sparkles className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </td>
        <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(line.originalBudget)}</td>
        <td className="py-3 px-3 text-right text-gray-600">
          {line.approvedChanges > 0 ? formatCurrency(line.approvedChanges) : '-'}
        </td>
        <td className="py-3 px-3 text-right font-medium text-gray-900">{formatCurrency(line.revisedBudget)}</td>
        <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(line.committed)}</td>
        <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(line.actual)}</td>
        <td className="py-3 px-3 text-right font-medium text-gray-900">{formatCurrency(line.projected)}</td>
        <td className="py-3 px-3 text-right">
          <VarianceIndicator variance={variance} revised={line.revisedBudget} />
        </td>
        <td className="py-3 px-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${line.percentComplete}%` }}
            />
          </div>
        </td>
      </tr>
      {expanded && line.aiNote && (
        <tr className="bg-blue-50">
          <td colSpan={9} className="py-2 px-12">
            <div className="flex items-start gap-2 text-sm text-amber-700">
              <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <span>{line.aiNote}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function BudgetPreview() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['6']))

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

  const totals = mockBudgetLines.reduce((acc, line) => ({
    originalBudget: acc.originalBudget + line.originalBudget,
    approvedChanges: acc.approvedChanges + line.approvedChanges,
    revisedBudget: acc.revisedBudget + line.revisedBudget,
    committed: acc.committed + line.committed,
    actual: acc.actual + line.actual,
    projected: acc.projected + line.projected,
  }), { originalBudget: 0, approvedChanges: 0, revisedBudget: 0, committed: 0, actual: 0, projected: 0 })

  const totalVariance = totals.revisedBudget - totals.projected
  const contractAmount = 2450000
  const projectedMargin = ((contractAmount - totals.projected) / contractAmount) * 100

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Budget - Smith Residence</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Lock className="h-4 w-4" />
              Lock Budget
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <DollarSign className="h-4 w-4" />
              Contract
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">$2.45M</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <BarChart3 className="h-4 w-4" />
              Projected Cost
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totals.projected)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            totalVariance >= 0 ? "bg-green-50" : "bg-red-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              totalVariance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {totalVariance >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              Variance
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
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
              "flex items-center gap-2 text-sm",
              projectedMargin >= 15 ? "text-green-600" : projectedMargin >= 10 ? "text-amber-600" : "text-red-600"
            )}>
              Margin
              {projectedMargin < 15 && <TrendingDown className="h-4 w-4" />}
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              projectedMargin >= 15 ? "text-green-700" : projectedMargin >= 10 ? "text-amber-700" : "text-red-700"
            )}>
              {projectedMargin.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Budget Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Cost Code</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Original</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Changes</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Revised</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Committed</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Actual</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Projected</th>
              <th className="text-right py-3 px-3 font-medium text-gray-600">Variance</th>
              <th className="py-3 px-3 font-medium text-gray-600 w-24">Progress</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {mockBudgetLines.map(line => (
              <BudgetRow
                key={line.id}
                line={line}
                expanded={expandedRows.has(line.id)}
                onToggle={() => toggleRow(line.id)}
              />
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr className="font-semibold">
              <td className="py-3 px-4 text-gray-900">TOTALS</td>
              <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(totals.originalBudget)}</td>
              <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(totals.approvedChanges)}</td>
              <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(totals.revisedBudget)}</td>
              <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(totals.committed)}</td>
              <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(totals.actual)}</td>
              <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(totals.projected)}</td>
              <td className="py-3 px-3 text-right">
                <VarianceIndicator variance={totalVariance} revised={totals.revisedBudget} />
              </td>
              <td className="py-3 px-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <p className="text-sm text-amber-700">
            Carpentry trending $15K over revised budget. Your framing costs on elevated coastal homes are typically 8% over estimate.
            Recommend change order for owner-approved roof complexity ($12K). Based on 14 similar jobs.
          </p>
        </div>
      </div>
    </div>
  )
}
