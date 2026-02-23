'use client'

import {
  Shield,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Ruler,
  GitCompare,
  FileSearch,
  History,
  FileCheck,
  Keyboard,
  ArrowDown,
  ArrowRight,
  ChevronRight,
  BarChart3,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Info,
  Zap,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ───────────────────────────────────────────────────────────────

interface ValidationSystem {
  id: number
  name: string
  tagline: string
  icon: typeof Shield
  iconBg: string
  iconColor: string
  description: string
  example: {
    title: string
    detail: string
  }
  catchRate: number
  checksPerDay: number
}

interface ErrorType {
  type: string
  count: number
  color: string
  bg: string
}

interface ReasonablenessBound {
  item: string
  unit: string
  low: string
  typical: string
  high: string
  extreme: string
}

interface FlagType {
  level: string
  color: string
  bg: string
  border: string
  icon: typeof Shield
  description: string
  example: string
  autoAction: string
}

// ── Mock Data ───────────────────────────────────────────────────────────

const validationSystems: ValidationSystem[] = [
  {
    id: 1,
    name: 'Reasonableness Bounds',
    tagline: 'Does this number make sense?',
    icon: Ruler,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    description: 'Every cost item has learned bounds from your historical data. When a number falls outside the expected range, it gets flagged before anyone sees it.',
    example: {
      title: 'Fireplace entered at 200 SF',
      detail: 'Typical fireplace: 80-150 SF. 200 SF is borderline — flags as "Suggestion" for review. Could be a 2-story fireplace or a typo.',
    },
    catchRate: 34,
    checksPerDay: 148,
  },
  {
    id: 2,
    name: 'Cross-Reference Validation',
    tagline: 'Do the numbers agree with each other?',
    icon: GitCompare,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    description: 'Compares related data points across your estimate, plan, and contract to find contradictions. If one document says X and another says Y, you hear about it.',
    example: {
      title: 'Plans show 484 SF fireplace, estimate says 200 SF',
      detail: 'Floor-to-ceiling 2-story stone fireplace spec calls for 484 SF of stone veneer. Estimate only has 200 SF. Discrepancy: 284 SF ($37K).',
    },
    catchRate: 28,
    checksPerDay: 92,
  },
  {
    id: 3,
    name: 'Plan-to-Data Reconciliation',
    tagline: 'Does paperwork match plans?',
    icon: FileSearch,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    description: 'AI reads your plans and compares against your estimate line items. Finds missing rooms, missing fixtures, and scope that got forgotten.',
    example: {
      title: 'Plans show 4 bathrooms, estimate has 3',
      detail: 'Powder room on Sheet A2.3 not reflected in estimate. Missing: vanity, toilet, tile, plumbing rough-in. Estimated cost: $22K.',
    },
    catchRate: 18,
    checksPerDay: 24,
  },
  {
    id: 4,
    name: 'Historical Pattern Matching',
    tagline: 'Is this normal for you?',
    icon: History,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    description: 'Compares your current project against your completed projects. Shows $/SF benchmarks and flags significant deviations from your norms.',
    example: {
      title: '$/SF comparison table',
      detail: 'Current: $285/SF. Your avg (coastal, 3000+ SF): $310/SF. Delta: -$25/SF ($75K below typical). Systems flagging: Framing, Electrical, Appliances.',
    },
    catchRate: 12,
    checksPerDay: 36,
  },
  {
    id: 5,
    name: 'Contract vs Estimate Reconciliation',
    tagline: 'Does contract match pricing?',
    icon: FileCheck,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    description: 'Checks that your signed contract matches your approved estimate. Catches scope gaps, allowance mismatches, and pricing discrepancies before work begins.',
    example: {
      title: 'Contract allowance vs estimate mismatch',
      detail: 'Contract: Flooring allowance $15/SF. Estimate: Porcelain tile at $22/SF. Client will owe $7/SF overage on 2,100 SF = $14,700. Flag before selection meeting.',
    },
    catchRate: 8,
    checksPerDay: 18,
  },
  {
    id: 6,
    name: 'Live Data Entry Guardrails',
    tagline: 'Catching errors as you type',
    icon: Keyboard,
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-600',
    description: 'Real-time validation during data entry. Catches magnitude errors (extra zeros), decimal point mistakes, duplicate entries, and unit mismatches instantly.',
    example: {
      title: 'Magnitude & decimal checks',
      detail: 'User types $45,000 for a light fixture — flagged (typical: $450-$4,500). User types 20000 SF for a bathroom — flagged (typical: 50-200 SF). Duplicate PO # detected.',
    },
    catchRate: 22,
    checksPerDay: 310,
  },
]

const errorTypes: ErrorType[] = [
  { type: 'Quantity Errors', count: 8, color: 'bg-blue-500', bg: 'bg-blue-100' },
  { type: 'Pricing Errors', count: 4, color: 'bg-purple-500', bg: 'bg-purple-100' },
  { type: 'Scope Gaps', count: 3, color: 'bg-emerald-500', bg: 'bg-emerald-100' },
  { type: 'Unit Mismatches', count: 2, color: 'bg-amber-500', bg: 'bg-amber-100' },
]

const monthlyTrend = [
  { month: 'Sep', errors: 31, caught: 24 },
  { month: 'Oct', errors: 27, caught: 23 },
  { month: 'Nov', errors: 22, caught: 20 },
  { month: 'Dec', errors: 19, caught: 18 },
  { month: 'Jan', errors: 18, caught: 17 },
  { month: 'Feb', errors: 17, caught: 17 },
]

const flagTypes: FlagType[] = [
  {
    level: 'Safety Block',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircle,
    description: 'Prevents saving. Obvious error that would cause real damage.',
    example: 'Invoice total $450,000 but line items sum to $45,000',
    autoAction: 'Entry blocked until corrected',
  },
  {
    level: 'Strong Recommendation',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: AlertTriangle,
    description: 'High confidence something is wrong. Requires acknowledgment.',
    example: 'Fireplace stone: 200 SF entered, plans show 484 SF',
    autoAction: 'Must click "Confirm Override" to proceed',
  },
  {
    level: 'Suggestion',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: Eye,
    description: 'Moderate confidence. Worth checking but might be intentional.',
    example: 'Drywall $/SF is 15% above your 6-month average',
    autoAction: 'Yellow highlight, dismissible',
  },
  {
    level: 'Learning Nudge',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Brain,
    description: 'AI is learning your patterns. Asks if this is intentional.',
    example: 'First time using this vendor for electrical — add to approved list?',
    autoAction: 'Subtle prompt, auto-dismisses',
  },
  {
    level: 'Informational',
    color: 'text-stone-600',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    icon: Info,
    description: 'Context for awareness. No action required.',
    example: 'This cost code has been trending up 3% per quarter',
    autoAction: 'Tooltip on hover',
  },
]

const reasonablenessBounds: ReasonablenessBound[] = [
  { item: 'Fireplace (stone veneer)', unit: 'SF', low: '60', typical: '80-150', high: '200-350', extreme: '400+' },
  { item: 'Countertop (granite)', unit: 'SF', low: '20', typical: '40-80', high: '100-150', extreme: '200+' },
  { item: 'Bathroom (full)', unit: '$', low: '$8K', typical: '$15-25K', high: '$30-45K', extreme: '$60K+' },
  { item: 'Garage (2-car)', unit: '$', low: '$18K', typical: '$25-40K', high: '$45-65K', extreme: '$80K+' },
  { item: 'Roofing (tile)', unit: '$/SF', low: '$3.50', typical: '$5-8', high: '$10-14', extreme: '$18+' },
  { item: 'Windows (impact)', unit: 'each', low: '$350', typical: '$600-1,200', high: '$1,500-2,500', extreme: '$3,500+' },
  { item: 'Cabinets (kitchen)', unit: 'LF', low: '$150', typical: '$250-500', high: '$600-900', extreme: '$1,200+' },
  { item: 'Drywall (finish)', unit: '$/SF', low: '$1.50', typical: '$2.50-4', high: '$5-7', extreme: '$9+' },
  { item: 'Concrete (slab)', unit: '$/SF', low: '$4', typical: '$6-10', high: '$12-18', extreme: '$22+' },
  { item: 'Labor (framing)', unit: '$/SF', low: '$3', typical: '$5-9', high: '$11-16', extreme: '$20+' },
]

// ── Component ───────────────────────────────────────────────────────────

export function AccuracyEnginePreview(): React.ReactElement {
  const totalErrors = errorTypes.reduce((sum, e) => sum + e.count, 0)
  const maxBarCount = Math.max(...errorTypes.map((e) => e.count))

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* ── Dark Header ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Shield className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Accuracy Engine</h2>
            <p className="text-sm text-slate-300">
              6 systems checking from 6 different angles catches virtually all errors
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Errors Caught</div>
            <div className="text-xl font-bold text-white">17</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingDown className="h-3 w-3" /> Down from 31
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Estimated Savings</div>
            <div className="text-xl font-bold text-white">$142K</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
              <DollarSign className="h-3 w-3" /> This quarter
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">AI Accuracy</div>
            <div className="text-xl font-bold text-white">94.2%</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingUp className="h-3 w-3" /> +1.8% this month
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">False Positive Rate</div>
            <div className="text-xl font-bold text-white">18%</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingDown className="h-3 w-3" /> Down from 32%
            </div>
          </div>
        </div>
      </div>

      {/* ── The 6 Validation Systems ─────────────────────────────── */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-stone-500" />
          <h3 className="font-medium text-warm-900 text-sm">The 6 Validation Systems</h3>
          <span className="text-xs text-warm-400">Layered defense against errors</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {validationSystems.map((system) => {
            const Icon = system.icon
            return (
              <div
                key={system.id}
                className="bg-white rounded-lg border border-warm-200 p-4 hover:border-warm-300 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn('p-2 rounded-lg', system.iconBg)}>
                    <Icon className={cn('h-4 w-4', system.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-warm-400">#{system.id}</span>
                      <span className="font-medium text-warm-900 text-sm">{system.name}</span>
                    </div>
                    <p className="text-xs text-stone-500 italic mt-0.5">&quot;{system.tagline}&quot;</p>
                  </div>
                </div>
                <p className="text-xs text-warm-600 mb-3 leading-relaxed">{system.description}</p>
                <div className="bg-stone-50 rounded-lg p-2.5 border border-stone-100 mb-3">
                  <div className="text-xs font-medium text-warm-700 mb-1">{system.example.title}</div>
                  <p className="text-xs text-warm-500 leading-relaxed">{system.example.detail}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-warm-400">
                  <span>{system.catchRate}% of catches</span>
                  <span>{system.checksPerDay} checks/day</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Live Demo: Fireplace Error Flow ──────────────────────── */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-warm-200 bg-gradient-to-r from-stone-50 to-warm-50">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="font-medium text-warm-900 text-sm">Live Demo: The $37K Fireplace Catch</h3>
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
              Multi-Layer
            </span>
          </div>
          <div className="p-4">
            <p className="text-xs text-warm-500 mb-4">
              Watch how multiple systems work together to catch a single error from different angles:
            </p>

            {/* Step 1 */}
            <div className="flex items-start gap-3 mb-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
                  1
                </div>
                <div className="w-0.5 h-8 bg-warm-200 mt-1" />
              </div>
              <div className="flex-1 bg-amber-50 rounded-lg p-3 border border-amber-100">
                <div className="flex items-center gap-2 mb-1">
                  <Keyboard className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Live Guardrail</span>
                  <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">Suggestion</span>
                </div>
                <p className="text-xs text-amber-700">
                  Estimator enters &quot;Stone Veneer — 200 SF&quot;. Reasonableness bounds: 80-150 SF typical.
                  200 SF is borderline high but possible for a large fireplace. Flags as yellow suggestion.
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center mb-2">
              <ArrowDown className="h-4 w-4 text-warm-300" />
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 mb-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold">
                  2
                </div>
                <div className="w-0.5 h-8 bg-warm-200 mt-1" />
              </div>
              <div className="flex-1 bg-orange-50 rounded-lg p-3 border border-orange-100">
                <div className="flex items-center gap-2 mb-1">
                  <GitCompare className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Cross-Reference Catches It</span>
                  <span className="text-xs bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded">Strong Recommendation</span>
                </div>
                <p className="text-xs text-orange-700">
                  Plans specify &quot;floor-to-ceiling 2-story stone fireplace&quot; on Sheet A3.2. AI calculates
                  required coverage: 22&apos; height x 8&apos; width x 2 sides + chimney = 484 SF.
                  Estimate only has 200 SF. <span className="font-semibold">Discrepancy: 284 SF = $37,120.</span>
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center mb-2">
              <ArrowDown className="h-4 w-4 text-warm-300" />
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                  3
                </div>
              </div>
              <div className="flex-1 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <History className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Historical Confirms</span>
                  <span className="text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">Confirmed</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Last similar job (Johnson Beach House — 2-story stone fireplace) used 410 SF of stone veneer.
                  Current entry of 200 SF is less than half. <span className="font-semibold">Historical data confirms the cross-reference flag.</span>
                </p>
              </div>
            </div>

            {/* Result */}
            <div className="mt-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">Result: $37K error caught before estimate sent to client</span>
              </div>
              <p className="text-xs text-emerald-600 mt-1 ml-6">
                Estimator corrected to 484 SF. Total cost adjusted from $26,200 to $63,320. Without this catch, the company would have absorbed the difference.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Accuracy Dashboard ───────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-stone-500" />
              <h3 className="font-medium text-warm-900 text-sm">Accuracy Dashboard</h3>
              <span className="text-xs text-warm-400">February 2026</span>
            </div>
            <button className="text-xs text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
              Full Report <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Error Types Breakdown */}
              <div>
                <div className="text-xs font-medium text-warm-500 mb-3">Error Types This Month</div>
                <div className="space-y-2.5">
                  {errorTypes.map((error) => (
                    <div key={error.type} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-warm-600 flex-shrink-0">{error.type}</div>
                      <div className="flex-1 h-5 bg-warm-100 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', error.color)}
                          style={{ width: `${(error.count / maxBarCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-warm-700 w-6 text-right">{error.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-warm-100 flex items-center justify-between">
                  <span className="text-xs text-warm-500">Total Errors Caught</span>
                  <span className="text-sm font-bold text-warm-800">{totalErrors}</span>
                </div>
              </div>

              {/* Catch Rate Trend */}
              <div>
                <div className="text-xs font-medium text-warm-500 mb-3">Monthly Error Trend (6 months)</div>
                <div className="space-y-2">
                  {monthlyTrend.map((month) => (
                    <div key={month.month} className="flex items-center gap-3">
                      <span className="w-8 text-xs text-warm-500">{month.month}</span>
                      <div className="flex-1 flex items-center gap-1">
                        <div className="flex-1 h-4 bg-warm-100 rounded overflow-hidden relative">
                          <div
                            className="h-full bg-blue-400 rounded"
                            style={{ width: `${(month.errors / 35) * 100}%` }}
                          />
                          <div
                            className="absolute top-0 left-0 h-full bg-emerald-500 rounded opacity-80"
                            style={{ width: `${(month.caught / 35) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-warm-600 w-12 text-right">
                        {month.caught}/{month.errors}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-warm-400">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-2 bg-emerald-500 rounded" />
                    Caught
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-2 bg-blue-400 rounded" />
                    Total Errors
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <div className="text-xs text-emerald-600 mb-1">Biggest Save This Month</div>
                <div className="text-lg font-bold text-emerald-700">$22K</div>
                <div className="text-xs text-emerald-500">Missing bathroom caught by Plan Reconciliation</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="text-xs text-blue-600 mb-1">AI Accuracy Trend</div>
                <div className="text-lg font-bold text-blue-700">94.2%</div>
                <div className="text-xs text-blue-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Up from 87.1% (6 months ago)
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <div className="text-xs text-amber-600 mb-1">Avg Time to Catch</div>
                <div className="text-lg font-bold text-amber-700">2.3 sec</div>
                <div className="text-xs text-amber-500">Real-time checks: instant. Batch: &lt;30 sec</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confidence & Feedback Loop ───────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-stone-500" />
              <h3 className="font-medium text-warm-900 text-sm">Confidence Levels &amp; Feedback Loop</h3>
            </div>
            <span className="text-xs text-warm-400">5 flag types, ranked by severity</span>
          </div>
          <div className="p-4 space-y-3">
            {flagTypes.map((flag) => {
              const Icon = flag.icon
              return (
                <div
                  key={flag.level}
                  className={cn('rounded-lg border p-3', flag.bg, flag.border)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', flag.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-sm font-semibold', flag.color)}>{flag.level}</span>
                        <ArrowRight className="h-3 w-3 text-warm-300" />
                        <span className="text-xs text-warm-500">{flag.autoAction}</span>
                      </div>
                      <p className="text-xs text-warm-600 mb-1.5">{flag.description}</p>
                      <div className="bg-white/60 rounded p-2 text-xs text-warm-500 italic">
                        Example: {flag.example}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Override Feedback */}
            <div className="bg-gradient-to-r from-stone-50 to-warm-50 rounded-lg p-3 border border-warm-200 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-warm-800">Override = Training Data</span>
              </div>
              <p className="text-xs text-warm-600 mb-2">
                When you override an AI flag, the system learns from your decision:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-warm-100">
                  <ThumbsUp className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-warm-700">Confirm Flag</div>
                    <div className="text-xs text-warm-500">AI was right, error fixed. Reinforces the pattern.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-warm-100">
                  <ThumbsDown className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-warm-700">Override Flag</div>
                    <div className="text-xs text-warm-500">AI was wrong, value is correct. Adjusts bounds for next time.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reasonableness Bounds Table ───────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-stone-500" />
              <h3 className="font-medium text-warm-900 text-sm">Reasonableness Bounds</h3>
              <span className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium">
                Learned from your data
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-warm-50 text-xs text-warm-500 border-b border-warm-200">
                  <th className="text-left px-4 py-2.5 font-medium">Item Type</th>
                  <th className="text-left px-4 py-2.5 font-medium">Unit</th>
                  <th className="text-center px-4 py-2.5 font-medium">
                    <span className="text-emerald-600">Low</span>
                  </th>
                  <th className="text-center px-4 py-2.5 font-medium">
                    <span className="text-blue-600">Typical</span>
                  </th>
                  <th className="text-center px-4 py-2.5 font-medium">
                    <span className="text-amber-600">High</span>
                  </th>
                  <th className="text-center px-4 py-2.5 font-medium">
                    <span className="text-red-600">Extreme</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {reasonablenessBounds.map((bound, idx) => (
                  <tr key={bound.item} className={cn('hover:bg-warm-50 transition-colors', idx === 0 && 'bg-amber-50/50')}>
                    <td className="px-4 py-2.5 text-warm-800 text-xs font-medium">{bound.item}</td>
                    <td className="px-4 py-2.5 text-warm-500 text-xs">{bound.unit}</td>
                    <td className="px-4 py-2.5 text-center text-xs">
                      <span className="text-emerald-600 font-medium">{bound.low}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">{bound.typical}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs">
                      <span className="text-amber-600 font-medium">{bound.high}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs">
                      <span className="text-red-600 font-medium">{bound.extreme}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-warm-50 border-t border-warm-200">
            <p className="text-xs text-warm-500">
              <Sparkles className="h-3 w-3 text-amber-500 inline mr-1" />
              Bounds update automatically as you complete projects. Based on 23 completed jobs in your history.
              First row highlighted — the fireplace bounds that caught the $37K error.
            </p>
          </div>
        </div>
      </div>

      {/* ── AI Insights Bar ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Accuracy Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            17 errors caught this month saving an estimated $142K. Catch rate improved to 94.2% as the
            model learns from 23 completed projects. False positive rate dropped from 32% to 18% —
            meaning fewer interruptions for your team. Biggest pattern learned this month: coastal
            projects average 12% more stone veneer than inland due to wind-load requirements.
          </p>
        </div>
      </div>

      {/* ── AI Features Panel ────────────────────────────────────── */}
      <div className="px-4 py-4 bg-white border-t border-warm-200">
        <AIFeaturesPanel
          title="AI Accuracy Engine Features"
          columns={2}
          features={[
            {
              feature: 'Reasonableness Bounds',
              trigger: 'Real-time',
              insight: 'Every number checked against learned ranges from your history',
              detail: 'Maintains per-item, per-unit bounds that update with every completed project. Flags entries outside typical range with graduated severity based on how far outside bounds.',
              severity: 'info',
              confidence: 92,
            },
            {
              feature: 'Cross-Reference Validation',
              trigger: 'On change',
              insight: 'Compares related data points across documents for contradictions',
              detail: 'Checks estimate vs plans, contract vs estimate, PO vs budget, and invoice vs PO. Caught 284 SF discrepancy on stone veneer this month — a $37K save.',
              severity: 'warning',
              confidence: 94,
            },
            {
              feature: 'Plan Reconciliation',
              trigger: 'On submission',
              insight: 'AI reads plans and finds missing scope in your estimate',
              detail: 'Extracts rooms, fixtures, and features from architectural plans. Compares against estimate line items to find gaps. Found missing powder room worth $22K last week.',
              severity: 'success',
              confidence: 88,
            },
            {
              feature: 'Historical Pattern Matching',
              trigger: 'Daily',
              insight: 'Compares current project against your completed project database',
              detail: 'Builds $/SF benchmarks by project type, size, and location. Flags significant deviations. Currently tracking 23 completed projects for pattern matching.',
              severity: 'info',
              confidence: 91,
            },
            {
              feature: 'Contract Reconciliation',
              trigger: 'On change',
              insight: 'Ensures contract and estimate stay in sync through changes',
              detail: 'Monitors allowance amounts, scope inclusions/exclusions, and pricing. Flags when change orders create drift between contract and current estimate.',
              severity: 'warning',
              confidence: 89,
            },
            {
              feature: 'Live Entry Guardrails',
              trigger: 'Real-time',
              insight: 'Catches typos, magnitude errors, and duplicates as you type',
              detail: 'Instant validation during data entry. Detects extra zeros, decimal shifts, duplicate entries, and unit mismatches. 310 checks per day with sub-second response.',
              severity: 'info',
              confidence: 96,
            },
          ]}
        />
      </div>
    </div>
  )
}
