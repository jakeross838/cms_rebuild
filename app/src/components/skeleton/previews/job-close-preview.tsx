'use client'

import {
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Building2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Calculator,
  Shield,
  BarChart3,
  FileText,
  Calendar,
  ArrowRight,
  Brain,
  CircleDot,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ─────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string
  label: string
  complete: boolean
  detail?: string
}

interface CostLineItem {
  costCode: string
  description: string
  estimated: number
  actual: number
  variance: number
  note: string
}

interface POCQuarter {
  period: string
  revenueRecognized: number
  cumulative: number
}

interface WarrantyHistoryItem {
  job: string
  contractValue: number
  warrantyCost: number
  pct: number
}

interface ExportItem {
  label: string
  checked: boolean
}

// ── Mock Data ─────────────────────────────────────────────────────────

const checklistItems: ChecklistItem[] = [
  { id: '1', label: 'All invoices received', complete: true },
  { id: '2', label: 'All invoices paid', complete: true },
  { id: '3', label: 'All lien waivers collected', complete: true },
  { id: '4', label: 'Retainage released', complete: true },
  { id: '5', label: 'Final draw collected', complete: true },
  { id: '6', label: 'All POs closed', complete: true },
  { id: '7', label: 'No open commitments', complete: false, detail: '1 pending: $4,200 final clean' },
  { id: '8', label: 'Warranty reserve booked', complete: true },
]

const costLineItems: CostLineItem[] = [
  { costCode: '03-100', description: 'Framing', estimated: 42000, actual: 44500, variance: 2500, note: 'CO #3 — scope addition' },
  { costCode: '06-200', description: 'Electrical', estimated: 38000, actual: 36200, variance: -1800, note: 'Competitive bid savings' },
  { costCode: '06-300', description: 'Plumbing', estimated: 28000, actual: 28000, variance: 0, note: 'On budget' },
  { costCode: '07-100', description: 'Tile', estimated: 13000, actual: 14500, variance: 1500, note: 'Floor leveling required' },
  { costCode: '04-100', description: 'HVAC', estimated: 34000, actual: 33800, variance: -200, note: 'Minor savings' },
  { costCode: '08-100', description: 'Painting', estimated: 18000, actual: 18200, variance: 200, note: 'Touch-up scope' },
  { costCode: '09-100', description: 'Cabinets & Millwork', estimated: 52000, actual: 51500, variance: -500, note: 'Negotiated discount' },
  { costCode: '10-100', description: 'Flooring', estimated: 24000, actual: 24800, variance: 800, note: 'Material upgrade' },
]

const pocQuarters: POCQuarter[] = [
  { period: 'Q1 2025', revenueRecognized: 127050, cumulative: 127050 },
  { period: 'Q2 2025', revenueRecognized: 254100, cumulative: 381150 },
  { period: 'Q3 2025', revenueRecognized: 296450, cumulative: 677600 },
  { period: 'Q4 2025', revenueRecognized: 152400, cumulative: 830000 },
]

const warrantyHistory: WarrantyHistoryItem[] = [
  { job: 'Henderson Residence', contractValue: 920000, warrantyCost: 7360, pct: 0.8 },
  { job: 'Miller Addition', contractValue: 340000, warrantyCost: 4080, pct: 1.2 },
  { job: 'Chen Kitchen Remodel', contractValue: 180000, warrantyCost: 1440, pct: 0.8 },
  { job: 'Davis Coastal Home', contractValue: 560000, warrantyCost: 3920, pct: 0.7 },
  { job: 'Wilson Custom', contractValue: 1100000, warrantyCost: 11000, pct: 1.0 },
]

const exportItems: ExportItem[] = [
  { label: 'Job Cost Report', checked: true },
  { label: 'WIP Schedule', checked: true },
  { label: '1099 Data', checked: true },
  { label: 'Equipment Depreciation', checked: true },
  { label: 'Overhead Allocation', checked: true },
  { label: 'P&L by Job', checked: true },
]

// ── Helper Functions ──────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(0)
}

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

// ── Component ──────────────────────────────────────────────────────────

export function JobClosePreview(): React.ReactElement {
  const completedItems = checklistItems.filter((item) => item.complete).length
  const totalItems = checklistItems.length
  const progressPct = Math.round((completedItems / totalItems) * 100)

  const totalEstimated = costLineItems.reduce((sum, item) => sum + item.estimated, 0)
  const totalActual = costLineItems.reduce((sum, item) => sum + item.actual, 0)
  const totalVariance = totalActual - totalEstimated

  // Grand totals for full job (includes line items not shown individually)
  const grandEstimated = 847000
  const grandActual = 856000
  const grandVariance = grandActual - grandEstimated
  const grandVariancePct = ((grandVariance / grandEstimated) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* ── Section 1: Dark Header ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <FileCheck className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Job Close Accounting</h1>
            <p className="text-sm text-slate-300">
              Final cost reconciliation, percentage of completion, warranty reserves, and CPA export
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'Jobs Ready to Close', value: '2' },
            { label: 'Open Commitments', value: '$4,200' },
            { label: 'Retainage Held', value: '$48,500' },
            { label: 'Warranty Reserve', value: '$19,200' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Job Close Checklist ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">Job Close Checklist</h2>
            <span className="text-xs text-stone-500">— Smith Residence</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-2.5 py-1 rounded text-xs font-bold',
              progressPct === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            )}>
              {completedItems}/{totalItems} ({progressPct}%)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              progressPct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="space-y-2">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                item.complete
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              )}
            >
              {item.complete ? (
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className={cn(
                  'text-sm font-medium',
                  item.complete ? 'text-emerald-800' : 'text-red-800'
                )}>
                  {item.label}
                </span>
                {item.detail && (
                  <p className="text-xs text-red-600 mt-0.5">{item.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Final Cost Reconciliation ───────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Final Cost Reconciliation</h2>
          <span className="text-xs text-stone-500">— Smith Residence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th scope="col" className="text-left px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Code</th>
                <th scope="col" className="text-left px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Description</th>
                <th scope="col" className="text-right px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Estimated</th>
                <th scope="col" className="text-right px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Actual</th>
                <th scope="col" className="text-right px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Variance</th>
                <th scope="col" className="text-left px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {costLineItems.map((item) => (
                <tr key={item.costCode} className="hover:bg-stone-50 transition-colors">
                  <td className="px-3 py-2.5 text-stone-500 font-mono text-xs">{item.costCode}</td>
                  <td className="px-3 py-2.5 font-medium text-stone-900">{item.description}</td>
                  <td className="px-3 py-2.5 text-right text-stone-600">{formatCurrencyFull(item.estimated)}</td>
                  <td className="px-3 py-2.5 text-right text-stone-900 font-medium">{formatCurrencyFull(item.actual)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded',
                      item.variance > 0 && 'bg-red-50 text-red-700',
                      item.variance < 0 && 'bg-emerald-50 text-emerald-700',
                      item.variance === 0 && 'bg-stone-50 text-stone-600'
                    )}>
                      {item.variance > 0 && <TrendingUp className="h-3 w-3" />}
                      {item.variance < 0 && <TrendingDown className="h-3 w-3" />}
                      {item.variance > 0 ? '+' : ''}{formatCurrencyFull(item.variance)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-stone-500">{item.note}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-300 bg-stone-50 font-bold">
                <td className="px-3 py-3" colSpan={2}>
                  <span className="text-stone-900">Grand Total</span>
                </td>
                <td className="px-3 py-3 text-right text-stone-700">{formatCurrencyFull(grandEstimated)}</td>
                <td className="px-3 py-3 text-right text-stone-900">{formatCurrencyFull(grandActual)}</td>
                <td className="px-3 py-3 text-right">
                  <span className={cn(
                    'inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded',
                    grandVariance > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  )}>
                    {grandVariance > 0 ? '+' : ''}{formatCurrencyFull(grandVariance)} ({grandVariancePct}%)
                  </span>
                </td>
                <td className="px-3 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Section 4: Percentage of Completion ────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Percentage of Completion (POC)</h2>
          <span className="text-xs text-stone-500">— Smith Residence</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3">
            <div className="text-xs text-stone-500">Contract Value</div>
            <div className="text-lg font-bold text-stone-900">{formatCurrencyFull(847000)}</div>
          </div>
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3">
            <div className="text-xs text-stone-500">% Complete</div>
            <div className="text-lg font-bold text-stone-900">98%</div>
          </div>
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3">
            <div className="text-xs text-stone-500">Revenue Recognized</div>
            <div className="text-lg font-bold text-emerald-700">{formatCurrencyFull(830000)}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th scope="col" className="text-left px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Period</th>
                <th scope="col" className="text-right px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Revenue Recognized</th>
                <th scope="col" className="text-right px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Cumulative</th>
                <th scope="col" className="text-right px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">% of Contract</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pocQuarters.map((q) => (
                <tr key={q.period} className="hover:bg-stone-50 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-stone-900">{q.period}</td>
                  <td className="px-3 py-2.5 text-right text-stone-700">{formatCurrencyFull(q.revenueRecognized)}</td>
                  <td className="px-3 py-2.5 text-right text-stone-900 font-medium">{formatCurrencyFull(q.cumulative)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs font-medium text-stone-600">
                      {((q.cumulative / 847000) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-300 bg-amber-50">
                <td className="px-3 py-2.5 font-bold text-amber-800">Remaining</td>
                <td className="px-3 py-2.5 text-right font-bold text-amber-700">{formatCurrencyFull(17000)}</td>
                <td className="px-3 py-2.5 text-right font-bold text-amber-700">{formatCurrencyFull(847000)}</td>
                <td className="px-3 py-2.5 text-right text-xs font-bold text-amber-700">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Progress visualization */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-stone-200 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
          </div>
          <span className="text-sm font-bold text-stone-900">98%</span>
        </div>
      </div>

      {/* ── Section 5: Warranty Reserve Calculator ─────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Warranty Reserve Calculator</h2>
        </div>

        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Your average warranty cost is 0.8% of contract value
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="text-center">
              <div className="text-xs text-amber-600">Contract Value</div>
              <div className="text-lg font-bold text-amber-900">{formatCurrencyFull(847000)}</div>
            </div>
            <div className="text-center flex flex-col items-center justify-center">
              <ArrowRight className="h-5 w-5 text-amber-400" />
              <span className="text-xs text-amber-600 mt-0.5">x 0.8%</span>
            </div>
            <div className="text-center">
              <div className="text-xs text-amber-600">Recommended Reserve</div>
              <div className="text-lg font-bold text-amber-900">{formatCurrencyFull(6776)}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Historical Warranty Costs (Last 5 Jobs)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th scope="col" className="text-left px-3 py-2 text-xs font-semibold text-stone-600">Job</th>
                  <th scope="col" className="text-right px-3 py-2 text-xs font-semibold text-stone-600">Contract</th>
                  <th scope="col" className="text-right px-3 py-2 text-xs font-semibold text-stone-600">Warranty Cost</th>
                  <th scope="col" className="text-right px-3 py-2 text-xs font-semibold text-stone-600">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {warrantyHistory.map((item) => (
                  <tr key={item.job} className="hover:bg-stone-50 transition-colors">
                    <td className="px-3 py-2 font-medium text-stone-900">{item.job}</td>
                    <td className="px-3 py-2 text-right text-stone-600">{formatCurrency(item.contractValue)}</td>
                    <td className="px-3 py-2 text-right text-stone-900">{formatCurrency(item.warrantyCost)}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={cn(
                        'text-xs font-medium px-1.5 py-0.5 rounded',
                        item.pct <= 0.8 ? 'bg-emerald-50 text-emerald-700' :
                        item.pct <= 1.0 ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      )}>
                        {item.pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <CircleDot className="h-3.5 w-3.5" />
            <span>Range: $4.1K — $11K | Average: 0.9% | Recommended: 0.8% (conservative)</span>
          </div>
        </div>
      </div>

      {/* ── Section 6: CPA Export Package ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">CPA Export Package</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {exportItems.map((item) => (
            <label key={item.label} className="flex items-center gap-2.5 p-3 rounded-lg border border-stone-200 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors">
              <div className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 bg-white'
              )}>
                {item.checked && <CheckCircle className="h-3.5 w-3.5 text-white" />}
              </div>
              <span className="text-sm text-stone-700">{item.label}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Export Format:</span>
            <div className="flex gap-1">
              {['QuickBooks', 'Excel', 'PDF'].map((format, i) => (
                <button
                  key={format}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    i === 0
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
                  )}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-stone-800 rounded-lg hover:bg-stone-900 transition-colors">
            <Download className="h-4 w-4" />
            Generate CPA Package
          </button>
        </div>
      </div>

      {/* ── Section 7: Post-Job Profit Analysis ────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Post-Job Profit Analysis</h2>
          <span className="text-xs text-stone-500">— Smith Residence</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3">
            <div className="text-xs text-stone-500">Contract</div>
            <div className="text-lg font-bold text-stone-900">{formatCurrency(847000)}</div>
          </div>
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3">
            <div className="text-xs text-stone-500">Change Orders</div>
            <div className="text-lg font-bold text-emerald-700">+{formatCurrency(24000)}</div>
          </div>
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3">
            <div className="text-xs text-stone-500">Total Revenue</div>
            <div className="text-lg font-bold text-stone-900">{formatCurrency(871000)}</div>
          </div>
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3">
            <div className="text-xs text-stone-500">Total Cost</div>
            <div className="text-lg font-bold text-stone-900">{formatCurrency(856000)}</div>
          </div>
        </div>

        {/* Gross Profit Banner */}
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-red-600">Gross Profit</div>
              <div className="text-2xl font-bold text-red-700">{formatCurrencyFull(15000)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-red-600">Margin</div>
              <div className="text-2xl font-bold text-red-700">1.7%</div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-red-200 text-red-800">
                <AlertTriangle className="h-3.5 w-3.5" />
                Below Target (18%)
              </span>
            </div>
          </div>
        </div>

        {/* Margin erosion breakdown */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Where Margin Was Lost</div>
          <div className="space-y-1.5">
            {[
              { category: 'Framing Overrun (CO #3)', amount: 2500, pct: 28 },
              { category: 'Tile — Floor Leveling', amount: 1500, pct: 17 },
              { category: 'Flooring Material Upgrade', amount: 800, pct: 9 },
              { category: 'Painting Touch-ups', amount: 200, pct: 2 },
            ].map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-stone-700">{item.category}</span>
                    <span className="text-xs font-medium text-red-700">+{formatCurrencyFull(item.amount)}</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-sm font-medium text-amber-800">AI Recommendation:</span>
              <p className="text-xs text-amber-700 mt-1">
                Framing and tile overruns caused 80% of margin erosion. Framing overrun was driven by a
                mid-project scope change (CO #3) that was under-priced by $2.5K. Tile required unplanned
                floor leveling. Recommendation: increase framing CO markup to 25% and add floor-prep
                contingency line to future tile estimates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 8: AI Insights Bar ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">Job Close Intelligence</span>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          Smith Residence is 88% ready for close-out. 1 open commitment remaining ($4,200 final clean).
          Margin of 1.7% is significantly below your 18% target — framing and tile overruns account for
          $4K of the $9K total variance. Warranty reserve of $6,776 recommended based on your 0.8% historical
          average. CPA export package ready with 6 reports. Resolve the final clean PO to complete close-out.
        </p>
      </div>

      {/* ── Section 9: AI Features Panel ───────────────────────────── */}
      <AIFeaturesPanel
        title="Job Close AI Features"
        columns={2}
        features={[
          {
            feature: 'Auto-Reconciliation',
            insight: 'Automatically matches invoices to POs and cost codes, flagging discrepancies for review before final close.',
            confidence: 96,
            severity: 'success',
          },
          {
            feature: 'Warranty Reserve Prediction',
            insight: 'Calculates warranty reserves based on historical warranty claim data, job type, and subcontractor quality scores.',
            confidence: 89,
            severity: 'success',
          },
          {
            feature: 'POC Calculation',
            insight: 'Automates percentage-of-completion revenue recognition calculations for accrual-basis builders.',
            severity: 'info',
          },
          {
            feature: 'CPA Package Generation',
            insight: 'One-click export of job cost report, WIP schedule, 1099 data, and P&L in QuickBooks, Excel, or PDF format.',
            severity: 'info',
          },
          {
            feature: 'Margin Analysis',
            insight: 'Identifies specific cost codes driving margin erosion with actionable recommendations for future job pricing.',
            confidence: 92,
            severity: 'warning',
          },
          {
            feature: 'Close-Out Tracking',
            insight: 'Comprehensive checklist engine tracking invoices, waivers, retainage, draws, POs, and warranty reserves.',
            severity: 'info',
          },
        ]}
      />
    </div>
  )
}
