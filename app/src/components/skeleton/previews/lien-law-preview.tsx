'use client'

import {
  Gavel,
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Building2,
  Sparkles,
  MapPin,
  DollarSign,
  Send,
  Users,
  XCircle,
  Eye,
  CircleDot,
  TrendingUp,
  Brain,
  Zap,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ─────────────────────────────────────────────────────────────

interface StateRule {
  rule: string
  detail: string
}

interface LienDeadline {
  id: string
  project: string
  type: string
  dueDate: string
  daysLeft: number
  status: 'on-track' | 'due-soon' | 'overdue'
  assignedTo: string
}

interface NTOEntry {
  id: string
  project: string
  subSupplier: string
  firstWorkDate: string
  ntoDeadline: string
  ntoSent: boolean
  receiptConfirmed: boolean
  overdue: boolean
}

interface WaiverStatusEntry {
  sub: string
  conditionalReceived: boolean
  unconditionalReceived: boolean
  paymentBlocked: boolean
}

interface RetainageProject {
  project: string
  contractAmount: number
  retainagePct: number
  amountHeld: number
  completionPct: number
  fiftyPctDate: string
  reducedPct: number
  releaseCondition: string
}

interface SubLienRisk {
  id: string
  name: string
  unpaidAmount: number
  ntoStatus: string
  riskLevel: 'high' | 'moderate' | 'low'
  riskDetail: string
}

// ── Mock Data ─────────────────────────────────────────────────────────

const stateRules: Record<string, StateRule[]> = {
  FL: [
    { rule: 'Notice to Owner (NTO)', detail: 'Within 45 days of first work' },
    { rule: 'Claim of Lien', detail: 'Within 90 days of last furnishing' },
    { rule: 'Retainage Cap', detail: '10% until 50% completion, then 5%' },
    { rule: 'Bond Threshold', detail: '$1,000,000 for public projects' },
  ],
  NC: [
    { rule: 'Notice to Lien Agent', detail: 'Within 15 days of first furnishing' },
    { rule: 'Claim of Lien on Real Property', detail: 'Within 120 days of last furnishing' },
    { rule: 'Retainage Cap', detail: '5% after 50% completion' },
    { rule: 'Bond Threshold', detail: '$300,000 for public projects' },
  ],
  SC: [
    { rule: 'Notice of Furnishing', detail: 'Not required for subs with direct contract' },
    { rule: 'Mechanic\'s Lien', detail: 'Within 90 days of last furnishing' },
    { rule: 'Retainage Cap', detail: '3.5% of contract value' },
    { rule: 'Bond Threshold', detail: '$50,000 for public projects' },
  ],
}

const lienDeadlines: LienDeadline[] = [
  {
    id: '1',
    project: 'Smith Residence',
    type: 'NTO Deadline',
    dueDate: '2026-03-01',
    daysLeft: 6,
    status: 'due-soon',
    assignedTo: 'ABC Plumbing',
  },
  {
    id: '2',
    project: 'Smith Residence',
    type: 'Waiver Due (Draw #3)',
    dueDate: '2026-03-10',
    daysLeft: 15,
    status: 'on-track',
    assignedTo: 'Prestige Tile',
  },
  {
    id: '3',
    project: 'Johnson Beach House',
    type: 'NTO Deadline',
    dueDate: '2026-02-20',
    daysLeft: -3,
    status: 'overdue',
    assignedTo: 'XYZ Electric',
  },
  {
    id: '4',
    project: 'Johnson Beach House',
    type: 'Retainage Reduction',
    dueDate: '2026-03-15',
    daysLeft: 20,
    status: 'on-track',
    assignedTo: 'Project milestone',
  },
  {
    id: '5',
    project: 'Davis Coastal Home',
    type: 'Waiver Due (Draw #4)',
    dueDate: '2026-02-25',
    daysLeft: 2,
    status: 'due-soon',
    assignedTo: 'Coastal Concrete',
  },
  {
    id: '6',
    project: 'Davis Coastal Home',
    type: 'Claim of Lien Deadline',
    dueDate: '2026-04-10',
    daysLeft: 46,
    status: 'on-track',
    assignedTo: 'All subs',
  },
]

const ntoEntries: NTOEntry[] = [
  {
    id: '1',
    project: 'Smith Residence',
    subSupplier: 'ABC Plumbing',
    firstWorkDate: '2026-01-15',
    ntoDeadline: '2026-03-01',
    ntoSent: true,
    receiptConfirmed: true,
    overdue: false,
  },
  {
    id: '2',
    project: 'Smith Residence',
    subSupplier: 'Prestige Tile',
    firstWorkDate: '2026-02-01',
    ntoDeadline: '2026-03-18',
    ntoSent: true,
    receiptConfirmed: false,
    overdue: false,
  },
  {
    id: '3',
    project: 'Johnson Beach House',
    subSupplier: 'XYZ Electric',
    firstWorkDate: '2026-01-05',
    ntoDeadline: '2026-02-19',
    ntoSent: false,
    receiptConfirmed: false,
    overdue: true,
  },
  {
    id: '4',
    project: 'Johnson Beach House',
    subSupplier: 'Cool Air HVAC',
    firstWorkDate: '2026-02-10',
    ntoDeadline: '2026-03-27',
    ntoSent: true,
    receiptConfirmed: true,
    overdue: false,
  },
  {
    id: '5',
    project: 'Davis Coastal Home',
    subSupplier: 'Coastal Concrete',
    firstWorkDate: '2025-12-20',
    ntoDeadline: '2026-02-03',
    ntoSent: false,
    receiptConfirmed: false,
    overdue: true,
  },
  {
    id: '6',
    project: 'Davis Coastal Home',
    subSupplier: 'ABC Lumber Supply',
    firstWorkDate: '2026-01-25',
    ntoDeadline: '2026-03-11',
    ntoSent: true,
    receiptConfirmed: true,
    overdue: false,
  },
]

const smithWaiverStatus: WaiverStatusEntry[] = [
  { sub: 'ABC Framing', conditionalReceived: true, unconditionalReceived: false, paymentBlocked: false },
  { sub: 'Prestige Tile', conditionalReceived: true, unconditionalReceived: true, paymentBlocked: false },
  { sub: 'XYZ Electric', conditionalReceived: false, unconditionalReceived: false, paymentBlocked: true },
  { sub: 'ABC Plumbing', conditionalReceived: true, unconditionalReceived: true, paymentBlocked: false },
]

const retainageProjects: RetainageProject[] = [
  {
    project: 'Smith Residence',
    contractAmount: 847000,
    retainagePct: 5,
    amountHeld: 21175,
    completionPct: 65,
    fiftyPctDate: '2026-01-20',
    reducedPct: 5,
    releaseCondition: 'Substantial completion + all waivers',
  },
  {
    project: 'Johnson Beach House',
    contractAmount: 1250000,
    retainagePct: 10,
    amountHeld: 18750,
    completionPct: 38,
    fiftyPctDate: '2026-04-15',
    reducedPct: 10,
    releaseCondition: 'Awaiting 50% milestone for reduction to 5%',
  },
  {
    project: 'Davis Coastal Home',
    contractAmount: 560000,
    retainagePct: 5,
    amountHeld: 8575,
    completionPct: 92,
    fiftyPctDate: '2025-11-10',
    reducedPct: 5,
    releaseCondition: 'Final inspection + punch list completion',
  },
]

const subLienRisks: SubLienRisk[] = [
  {
    id: '1',
    name: 'ABC Plumbing',
    unpaidAmount: 34000,
    ntoStatus: 'Valid NTO on file',
    riskLevel: 'high',
    riskDetail: '$34K unpaid, valid NTO — LIEN RISK HIGH',
  },
  {
    id: '2',
    name: 'Prestige Tile',
    unpaidAmount: 0,
    ntoStatus: 'All waivers current',
    riskLevel: 'low',
    riskDetail: '$0 outstanding, all waivers current',
  },
  {
    id: '3',
    name: 'XYZ Electric',
    unpaidAmount: 12000,
    ntoStatus: 'NTO expired',
    riskLevel: 'moderate',
    riskDetail: '$12K unpaid, NTO expired — reduced lien rights',
  },
]

// ── Helper Functions ──────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(0)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Component ──────────────────────────────────────────────────────────

export function LienLawPreview(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* ── Section 1: Dark Header ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Gavel className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Lien Law Compliance Engine</h1>
            <p className="text-sm text-slate-300">
              State-specific deadlines, notices, waivers, and retainage rules — never miss a lien deadline
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'Active Projects', value: '6' },
            { label: 'NTOs Due This Month', value: '2' },
            { label: 'Waivers Pending', value: '8' },
            { label: 'Compliance Score', value: '94%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: State Selector + Rules ──────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">State Lien Law Rules</h2>
        </div>

        {/* State tabs */}
        <div className="flex gap-1">
          {(['FL', 'NC', 'SC'] as const).map((state) => (
            <button
              key={state}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                state === 'FL'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
              )}
            >
              {state}
            </button>
          ))}
        </div>

        {/* Rules table for FL (selected) */}
        <div className="bg-stone-50 rounded-lg border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-100">
                <th className="text-left px-4 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Rule</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Requirement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {stateRules.FL.map((rule) => (
                <tr key={rule.rule} className="hover:bg-stone-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-900">{rule.rule}</td>
                  <td className="px-4 py-3 text-stone-600">{rule.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Shield className="h-3.5 w-3.5" />
          <span>Florida Statutes Chapter 713 — Construction Liens</span>
        </div>
      </div>

      {/* ── Section 3: Lien Deadline Calendar ──────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">Lien Deadline Calendar</h2>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              On Track
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Due in 7 Days
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Overdue
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {lienDeadlines.map((deadline) => (
            <div
              key={deadline.id}
              className={cn(
                'flex items-center gap-4 p-3 rounded-lg border transition-colors',
                deadline.status === 'overdue' && 'bg-red-50 border-red-200',
                deadline.status === 'due-soon' && 'bg-amber-50 border-amber-200',
                deadline.status === 'on-track' && 'bg-emerald-50 border-emerald-200'
              )}
            >
              <div className={cn(
                'w-2.5 h-2.5 rounded-full flex-shrink-0',
                deadline.status === 'overdue' && 'bg-red-500',
                deadline.status === 'due-soon' && 'bg-amber-500',
                deadline.status === 'on-track' && 'bg-emerald-500'
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-stone-900">{deadline.project}</span>
                  <span className="text-xs text-stone-500">—</span>
                  <span className="text-xs text-stone-600">{deadline.type}</span>
                </div>
                <div className="text-xs text-stone-500 mt-0.5">{deadline.assignedTo}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-medium text-stone-900">{formatDate(deadline.dueDate)}</div>
                <div className={cn(
                  'text-xs font-medium',
                  deadline.status === 'overdue' && 'text-red-700',
                  deadline.status === 'due-soon' && 'text-amber-700',
                  deadline.status === 'on-track' && 'text-emerald-700'
                )}>
                  {deadline.daysLeft < 0
                    ? `${Math.abs(deadline.daysLeft)} days overdue`
                    : `${deadline.daysLeft} days left`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Notice to Owner Tracker ─────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">Notice to Owner Tracker</h2>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-stone-700 rounded-lg hover:bg-stone-800 transition-colors">
            <FileText className="h-3.5 w-3.5" />
            Generate NTO
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Project</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Sub/Supplier</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">First Work</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">NTO Deadline</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">NTO Sent?</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Receipt Confirmed?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {ntoEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className={cn(
                    'hover:bg-stone-50 transition-colors',
                    entry.overdue && 'bg-red-50'
                  )}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-stone-400" />
                      <span className="font-medium text-stone-900">{entry.project}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-stone-700">{entry.subSupplier}</td>
                  <td className="px-3 py-2.5 text-stone-600">{formatDate(entry.firstWorkDate)}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded',
                      entry.overdue ? 'bg-red-100 text-red-700' : 'text-stone-600'
                    )}>
                      {formatDate(entry.ntoDeadline)}
                      {entry.overdue && ' (OVERDUE)'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {entry.ntoSent ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {entry.receiptConfirmed ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                    ) : (
                      <Clock className="h-4 w-4 text-stone-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 5: Lien Waiver Status Board ────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Lien Waiver Status Board</h2>
          <span className="text-xs text-stone-500">— Smith Residence (Draw #3)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Subcontractor</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Conditional</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Unconditional</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {smithWaiverStatus.map((entry) => (
                <tr
                  key={entry.sub}
                  className={cn(
                    'hover:bg-stone-50 transition-colors',
                    entry.paymentBlocked && 'bg-red-50'
                  )}
                >
                  <td className="px-3 py-3 font-medium text-stone-900">{entry.sub}</td>
                  <td className="px-3 py-3 text-center">
                    {entry.conditionalReceived ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle className="h-3 w-3" />
                        Received
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                        <XCircle className="h-3 w-3" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {entry.unconditionalReceived ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle className="h-3 w-3" />
                        Received
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {entry.paymentBlocked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                        <AlertTriangle className="h-3 w-3" />
                        PAYMENT BLOCKED
                      </span>
                    ) : entry.conditionalReceived && entry.unconditionalReceived ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle className="h-3 w-3" />
                        Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-600">
                        <Clock className="h-3 w-3" />
                        In Progress
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 6: Retainage Tracker ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Retainage Tracker</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {retainageProjects.map((project) => (
            <div key={project.project} className="bg-stone-50 rounded-lg border border-stone-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-stone-500" />
                <span className="text-sm font-semibold text-stone-900">{project.project}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Contract</span>
                  <span className="font-medium text-stone-900">{formatCurrency(project.contractAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Retainage %</span>
                  <span className="font-medium text-stone-900">{project.retainagePct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Amount Held</span>
                  <span className="font-bold text-amber-700">{formatCurrency(project.amountHeld)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Completion</span>
                  <span className="font-medium text-stone-900">{project.completionPct}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    project.completionPct >= 50 ? 'bg-emerald-500' : 'bg-amber-500'
                  )}
                  style={{ width: `${project.completionPct}%` }}
                />
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                <CircleDot className="h-3 w-3" />
                {project.completionPct >= 50
                  ? `Reduced to ${project.reducedPct}% on ${formatDate(project.fiftyPctDate)}`
                  : `Reduces to 5% at 50% completion (~${formatDate(project.fiftyPctDate)})`}
              </div>

              <div className="bg-amber-50 rounded p-2 text-[10px] text-amber-700">
                <span className="font-medium">Release:</span> {project.releaseCondition}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 7: Sub Lien Rights Dashboard ───────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Sub Lien Rights Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subLienRisks.map((sub) => (
            <div
              key={sub.id}
              className={cn(
                'rounded-lg border p-4 space-y-3',
                sub.riskLevel === 'high' && 'bg-red-50 border-red-200',
                sub.riskLevel === 'moderate' && 'bg-amber-50 border-amber-200',
                sub.riskLevel === 'low' && 'bg-emerald-50 border-emerald-200'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-900">{sub.name}</span>
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider',
                  sub.riskLevel === 'high' && 'bg-red-200 text-red-800',
                  sub.riskLevel === 'moderate' && 'bg-amber-200 text-amber-800',
                  sub.riskLevel === 'low' && 'bg-emerald-200 text-emerald-800'
                )}>
                  {sub.riskLevel === 'high' && 'LIEN RISK HIGH'}
                  {sub.riskLevel === 'moderate' && 'MODERATE'}
                  {sub.riskLevel === 'low' && 'LOW RISK'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <DollarSign className={cn(
                    'h-3.5 w-3.5',
                    sub.unpaidAmount > 0 ? 'text-red-500' : 'text-emerald-500'
                  )} />
                  <span className="text-stone-700">
                    {sub.unpaidAmount > 0 ? `${formatCurrency(sub.unpaidAmount)} unpaid` : '$0 outstanding'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className={cn(
                    'h-3.5 w-3.5',
                    sub.riskLevel === 'high' ? 'text-red-500' :
                    sub.riskLevel === 'moderate' ? 'text-amber-500' :
                    'text-emerald-500'
                  )} />
                  <span className="text-stone-700">{sub.ntoStatus}</span>
                </div>
              </div>

              <p className={cn(
                'text-xs font-medium',
                sub.riskLevel === 'high' && 'text-red-700',
                sub.riskLevel === 'moderate' && 'text-amber-700',
                sub.riskLevel === 'low' && 'text-emerald-700'
              )}>
                {sub.riskDetail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 8: AI Insights Bar ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">Lien Compliance Intelligence</span>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          2 NTOs overdue requiring immediate action — XYZ Electric and Coastal Concrete. ABC Plumbing has
          $34K unpaid with a valid NTO on file, creating high lien risk on Smith Residence. Retainage totals
          $48.5K across 3 projects. Johnson Beach House approaching 50% milestone for retainage reduction.
          Recommend: send NTOs today, collect missing waivers before Draw #3 release.
        </p>
      </div>

      {/* ── Section 9: AI Features Panel ───────────────────────────── */}
      <AIFeaturesPanel
        title="Lien Law AI Features"
        columns={2}
        features={[
          {
            feature: 'Deadline Auto-Calculation',
            insight: 'Automatically calculates NTO, claim of lien, and retainage deadlines based on first work date and state statutes.',
            confidence: 97,
            severity: 'success',
          },
          {
            feature: 'NTO Generation',
            insight: 'Generates state-specific Notice to Owner documents with correct statutory language and required fields.',
            severity: 'info',
          },
          {
            feature: 'Waiver Automation',
            insight: 'Tracks conditional and unconditional waivers per sub per draw, blocks payments when waivers are missing.',
            confidence: 94,
            severity: 'success',
          },
          {
            feature: 'Retainage Compliance',
            insight: 'Monitors retainage percentages against state caps and automatically flags when reduction milestones are reached.',
            severity: 'warning',
          },
          {
            feature: 'Risk Assessment',
            insight: 'Evaluates lien risk per subcontractor based on NTO status, outstanding payments, and waiver collection history.',
            confidence: 91,
            severity: 'success',
          },
          {
            feature: 'Multi-State Support',
            insight: 'Maintains current lien law rules for FL, NC, SC, GA, TX and 45 additional states with automatic statute updates.',
            severity: 'info',
          },
        ]}
      />
    </div>
  )
}
