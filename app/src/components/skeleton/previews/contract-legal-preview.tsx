'use client'

import {
  Scale,
  FileText,
  Copy,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Brain,
  Shield,
  Eye,
  Pen,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  ClipboardCheck,
  Plus,
  Search,
  Layers,
  BookOpen,
  Gavel,
  FilePlus,
  GitCompare,
  Timer,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ─────────────────────────────────────────────────────────────

interface ContractTemplate {
  id: string
  name: string
  description: string
  state: string
  lastUsed: string
  usageCount: number
  icon: React.ElementType
}

interface ComparisonChange {
  id: string
  clause: string
  yourVersion: string
  theirVersion: string
  riskLevel: 'high' | 'medium' | 'low'
  riskLabel: string
  riskColor: string
  riskBgColor: string
}

interface LienDeadlineJob {
  id: string
  jobName: string
  ntoDeadline: string
  ntoStatus: 'sent' | 'due-soon' | 'overdue'
  claimDeadline: string
  daysRemaining: number
  statusColor: string
  statusLabel: string
}

interface ContractMilestone {
  id: string
  milestone: string
  date: string
  status: 'on-track' | 'at-risk' | 'overdue'
  statusLabel: string
  statusColor: string
  statusBgColor: string
  notes: string
}

// ── Mock Data ─────────────────────────────────────────────────────────

const templates: ContractTemplate[] = [
  {
    id: '1',
    name: 'Cost-Plus',
    description: 'Cost of work plus fixed fee or percentage markup. Best for complex or evolving scopes.',
    state: 'FL',
    lastUsed: '2026-02-10',
    usageCount: 14,
    icon: DollarSign,
  },
  {
    id: '2',
    name: 'Fixed-Price',
    description: 'Lump sum for defined scope. Ideal for straightforward projects with clear plans.',
    state: 'FL',
    lastUsed: '2026-01-28',
    usageCount: 22,
    icon: Target,
  },
  {
    id: '3',
    name: 'GMP (Guaranteed Max)',
    description: 'Cost-plus with a ceiling. Protects owner while allowing open-book accounting.',
    state: 'FL',
    lastUsed: '2026-02-05',
    usageCount: 6,
    icon: Shield,
  },
  {
    id: '4',
    name: 'Time & Materials',
    description: 'Hourly rates plus materials at cost. Common for service work and small additions.',
    state: 'FL',
    lastUsed: '2026-01-15',
    usageCount: 9,
    icon: Clock,
  },
  {
    id: '5',
    name: 'Subcontract Agreement',
    description: 'Standard sub agreement with scope, insurance, schedule, and payment terms.',
    state: 'FL',
    lastUsed: '2026-02-18',
    usageCount: 31,
    icon: Users,
  },
  {
    id: '6',
    name: 'Change Order',
    description: 'Scope change document with pricing, schedule impact, and owner approval.',
    state: 'FL',
    lastUsed: '2026-02-20',
    usageCount: 18,
    icon: FilePlus,
  },
]

const comparisonChanges: ComparisonChange[] = [
  {
    id: '1',
    clause: 'Section 12.3 — Dispute Resolution',
    yourVersion: 'All disputes shall be resolved through binding arbitration per AAA Construction Rules.',
    theirVersion: 'DELETED — Attorney removed entire arbitration clause, defaulting to litigation.',
    riskLevel: 'high',
    riskLabel: 'HIGH RISK',
    riskColor: 'text-red-700',
    riskBgColor: 'bg-red-50 border-red-200',
  },
  {
    id: '2',
    clause: 'Section 8.1 — Payment Terms',
    yourVersion: 'Payment due within 10 days of invoice (Net 10).',
    theirVersion: 'Payment due within 30 days of invoice (Net 30).',
    riskLevel: 'medium',
    riskLabel: 'MEDIUM',
    riskColor: 'text-amber-700',
    riskBgColor: 'bg-amber-50 border-amber-200',
  },
  {
    id: '3',
    clause: 'Section 14.1 — Force Majeure',
    yourVersion: 'No force majeure clause in original.',
    theirVersion: 'Added: Neither party liable for delays caused by acts of God, government action, pandemic, or supply chain disruption.',
    riskLevel: 'low',
    riskLabel: 'LOW',
    riskColor: 'text-emerald-700',
    riskBgColor: 'bg-emerald-50 border-emerald-200',
  },
]

const lienDeadlineJobs: LienDeadlineJob[] = [
  {
    id: '1',
    jobName: 'Henderson Residence',
    ntoDeadline: '2026-03-01',
    ntoStatus: 'sent',
    claimDeadline: '2026-06-15',
    daysRemaining: 112,
    statusColor: 'bg-emerald-100 text-emerald-700',
    statusLabel: 'NTO Sent',
  },
  {
    id: '2',
    jobName: 'Chen Waterfront',
    ntoDeadline: '2026-02-28',
    ntoStatus: 'due-soon',
    claimDeadline: '2026-06-10',
    daysRemaining: 5,
    statusColor: 'bg-amber-100 text-amber-700',
    statusLabel: 'NTO Due Soon',
  },
  {
    id: '3',
    jobName: 'Davis Coastal Home',
    ntoDeadline: '2026-02-20',
    ntoStatus: 'overdue',
    claimDeadline: '2026-05-25',
    daysRemaining: -3,
    statusColor: 'bg-red-100 text-red-700',
    statusLabel: 'NTO Overdue',
  },
]

const contractMilestones: ContractMilestone[] = [
  {
    id: '1',
    milestone: 'Substantial Completion',
    date: '2026-06-15',
    status: 'on-track',
    statusLabel: 'On Track',
    statusColor: 'text-emerald-700',
    statusBgColor: 'bg-emerald-100 text-emerald-700',
    notes: '112 days remaining, schedule is current',
  },
  {
    id: '2',
    milestone: 'Liquidated Damages Trigger',
    date: '2026-06-30',
    status: 'on-track',
    statusLabel: 'On Track',
    statusColor: 'text-emerald-700',
    statusBgColor: 'bg-emerald-100 text-emerald-700',
    notes: '$500/day after this date, 15 days buffer',
  },
  {
    id: '3',
    milestone: 'Selection Deadline',
    date: '2026-03-10',
    status: 'at-risk',
    statusLabel: 'At Risk',
    statusColor: 'text-amber-700',
    statusBgColor: 'bg-amber-100 text-amber-700',
    notes: '4 selections pending from homeowner',
  },
  {
    id: '4',
    milestone: 'Draw #3 Submission',
    date: '2026-03-01',
    status: 'on-track',
    statusLabel: 'On Track',
    statusColor: 'text-emerald-700',
    statusBgColor: 'bg-emerald-100 text-emerald-700',
    notes: '$85,000 — framing + rough mechanical',
  },
  {
    id: '5',
    milestone: 'Final Payment',
    date: '2026-07-15',
    status: 'on-track',
    statusLabel: 'On Track',
    statusColor: 'text-emerald-700',
    statusBgColor: 'bg-emerald-100 text-emerald-700',
    notes: 'Retainage release after punch list',
  },
]

const builderFlowSteps = [
  { step: 1, label: 'Select Template', detail: 'Cost-Plus (FL) selected', color: 'bg-blue-500' },
  { step: 2, label: 'AI Auto-Fill', detail: 'Client, job, line items, schedule populated', color: 'bg-purple-500' },
  { step: 3, label: 'PM Review', detail: 'Edit terms, add special conditions', color: 'bg-amber-500' },
  { step: 4, label: 'Clause Library', detail: 'Add/swap optional clauses from sidebar', color: 'bg-emerald-500' },
  { step: 5, label: 'Generate', detail: 'PDF ready for e-signature', color: 'bg-stone-700' },
]

// ── Component ──────────────────────────────────────────────────────────

export function ContractLegalPreview(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* ── Section 1: Dark Header ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Scale className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Contract &amp; Legal Management</h1>
            <p className="text-sm text-slate-300">
              AI-assisted contract generation, clause library, comparison tools, and full lien law compliance
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'Active Contracts', value: '12' },
            { label: 'Templates', value: '8' },
            { label: 'Pending Signatures', value: '3' },
            { label: 'Compliance Score', value: '96%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Contract Template Library ───────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">Contract Template Library</h2>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            New Template
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((tmpl) => {
            const Icon = tmpl.icon
            return (
              <div
                key={tmpl.id}
                className="rounded-lg border border-stone-200 p-4 hover:border-amber-300 hover:bg-amber-50/30 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-stone-100 rounded">
                    <Icon className="h-4 w-4 text-stone-600" />
                  </div>
                  <span className="text-sm font-medium text-stone-900">{tmpl.name}</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">{tmpl.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-stone-400">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                    <MapPin className="h-2.5 w-2.5" />
                    {tmpl.state}
                  </span>
                  <span>Used {tmpl.usageCount} times</span>
                  <span className="ml-auto">Last: {tmpl.lastUsed}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 3: AI Contract Builder Demo ────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-semibold text-stone-900">AI Contract Builder</h2>
        </div>

        {/* Flow steps */}
        <div className="flex flex-wrap items-center gap-2">
          {builderFlowSteps.map((step, i) => (
            <div key={step.step} className="flex items-center gap-2">
              {i > 0 && <ArrowRight className="h-4 w-4 text-stone-300 flex-shrink-0" />}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-50 border border-stone-200">
                <span
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0',
                    step.color
                  )}
                >
                  {step.step}
                </span>
                <div>
                  <div className="text-xs font-medium text-stone-800">{step.label}</div>
                  <div className="text-[10px] text-stone-500">{step.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mock contract preview */}
        <div className="bg-stone-50 rounded-lg border border-stone-200 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-stone-600" />
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Contract Preview</span>
            <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">AI Generated</span>
          </div>
          <div className="bg-white rounded border border-stone-200 p-4 space-y-2 text-xs text-stone-700">
            <div className="text-center font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
              RESIDENTIAL CONSTRUCTION CONTRACT (COST-PLUS)
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="font-medium text-stone-500">Owner:</span> Sarah &amp; David Chen</div>
              <div><span className="font-medium text-stone-500">Contractor:</span> Ross Construction LLC</div>
              <div><span className="font-medium text-stone-500">Project:</span> Chen Waterfront Renovation</div>
              <div><span className="font-medium text-stone-500">Address:</span> 412 Harbor View Dr, FL 33480</div>
              <div><span className="font-medium text-stone-500">Contract Sum:</span> Cost + 18% Fee</div>
              <div><span className="font-medium text-stone-500">Est. Total:</span> $485,000</div>
              <div><span className="font-medium text-stone-500">Start Date:</span> 2026-03-01</div>
              <div><span className="font-medium text-stone-500">Est. Completion:</span> 2026-08-15</div>
            </div>
            <div className="border-t border-stone-100 pt-2 mt-2">
              <div className="font-medium text-stone-600 mb-1">Payment Schedule (AI-generated from estimate):</div>
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between"><span>1. Upon signing</span><span className="font-medium">$48,500 (10%)</span></div>
                <div className="flex justify-between"><span>2. Foundation complete</span><span className="font-medium">$72,750 (15%)</span></div>
                <div className="flex justify-between"><span>3. Framing &amp; dry-in</span><span className="font-medium">$97,000 (20%)</span></div>
                <div className="flex justify-between"><span>4. Rough mechanical</span><span className="font-medium">$97,000 (20%)</span></div>
                <div className="flex justify-between"><span>5. Finishes</span><span className="font-medium">$121,250 (25%)</span></div>
                <div className="flex justify-between"><span>6. Final / CO</span><span className="font-medium">$48,500 (10%)</span></div>
              </div>
            </div>
          </div>

          {/* Clause library sidebar mock */}
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Clause Library</span>
              <span className="text-[10px] text-amber-600 ml-1">24 clauses available</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Arbitration',
                'Force Majeure',
                'Allowances',
                'Change Order Process',
                'Warranty (1yr)',
                'Retainage (10%)',
                'Insurance Requirements',
                'Lien Waiver',
              ].map((clause) => (
                <span
                  key={clause}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 cursor-pointer transition-colors"
                >
                  <Plus className="h-2.5 w-2.5" />
                  {clause}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Contract Comparison Tool ────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Contract Comparison Tool</h2>
          <span className="text-xs text-stone-500">Your Version vs Attorney Redline</span>
        </div>

        <div className="space-y-3">
          {comparisonChanges.map((change) => (
            <div
              key={change.id}
              className={cn('rounded-lg border p-4 space-y-3', change.riskBgColor)}
            >
              <div className="flex items-center gap-2">
                {change.riskLevel === 'high' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                {change.riskLevel === 'medium' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                {change.riskLevel === 'low' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                <span className="text-xs font-semibold text-stone-900">{change.clause}</span>
                <span
                  className={cn(
                    'ml-auto px-2 py-0.5 rounded text-[10px] font-bold',
                    change.riskLevel === 'high' && 'bg-red-200 text-red-800',
                    change.riskLevel === 'medium' && 'bg-amber-200 text-amber-800',
                    change.riskLevel === 'low' && 'bg-emerald-200 text-emerald-800'
                  )}
                >
                  {change.riskLabel}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white/70 rounded border border-stone-200 p-3">
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Your Version
                  </div>
                  <p className="text-xs text-stone-700">{change.yourVersion}</p>
                </div>
                <div className="bg-white/70 rounded border border-stone-200 p-3">
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Attorney Redline
                  </div>
                  <p className="text-xs text-stone-700">{change.theirVersion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 5: Subcontract Generator ───────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Pen className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Subcontract Generator</h2>
          <span className="text-xs text-stone-500">Auto-generated from bid award</span>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Bid award source */}
          <div className="flex-1 bg-blue-50 rounded-lg border border-blue-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Bid Award</span>
            </div>
            <div className="text-xs text-stone-700 space-y-1">
              <div><span className="font-medium">Awarded to:</span> ABC Framing LLC</div>
              <div><span className="font-medium">Trade:</span> Framing</div>
              <div><span className="font-medium">Bid Amount:</span> $44,500</div>
              <div><span className="font-medium">Job:</span> Henderson Residence</div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="hidden md:block">
              <ArrowRight className="h-5 w-5 text-stone-300" />
            </div>
            <div className="md:hidden">
              <ArrowDown className="h-5 w-5 text-stone-300" />
            </div>
          </div>

          {/* Generated sub agreement */}
          <div className="flex-1 bg-stone-50 rounded-lg border border-stone-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-stone-600" />
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Generated Agreement</span>
              <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                AI Draft
              </span>
            </div>
            <div className="bg-white rounded border border-stone-200 p-3 text-xs text-stone-700 space-y-1.5">
              <div className="font-bold text-stone-900 text-center border-b border-stone-100 pb-1">
                SUBCONTRACT AGREEMENT
              </div>
              <div><span className="font-medium text-stone-500">Subcontractor:</span> ABC Framing LLC</div>
              <div><span className="font-medium text-stone-500">Scope:</span> Framing per plans, specs, and structural drawings</div>
              <div><span className="font-medium text-stone-500">Contract Amount:</span> $44,500</div>
              <div><span className="font-medium text-stone-500">Insurance:</span> GL $1M required (cert on file)</div>
              <div><span className="font-medium text-stone-500">Schedule:</span> Feb 10 - Feb 24, 2026</div>
              <div><span className="font-medium text-stone-500">Retainage:</span> 10%</div>
              <div><span className="font-medium text-stone-500">Payment:</span> Net 10 after approved invoice</div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors">
                Send for Signature
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                Edit Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 6: Lien Law Dashboard ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">Lien Law Dashboard</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
            <MapPin className="h-3 w-3" />
            Florida
          </span>
        </div>

        {/* State rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3 space-y-1">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Notice to Owner</div>
            <div className="text-lg font-bold text-stone-900">45 Days</div>
            <p className="text-[10px] text-stone-500">From first furnishing of labor/materials</p>
          </div>
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3 space-y-1">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Claim of Lien</div>
            <div className="text-lg font-bold text-stone-900">120 Days</div>
            <p className="text-[10px] text-stone-500">From last furnishing or completion</p>
          </div>
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-3 space-y-1">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Retainage Cap</div>
            <div className="text-lg font-bold text-stone-900">10% &rarr; 5%</div>
            <p className="text-[10px] text-stone-500">Reduces to 5% after 50% complete</p>
          </div>
        </div>

        {/* Active project lien deadlines */}
        <div>
          <div className="text-xs font-semibold text-stone-600 mb-2">Active Project Deadlines</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200">
                  <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">Job</th>
                  <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">NTO Deadline</th>
                  <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">Claim Deadline</th>
                  <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">Days Left</th>
                  <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {lienDeadlineJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-medium text-stone-900">{job.jobName}</td>
                    <td className="py-2 px-3 text-stone-600">{job.ntoDeadline}</td>
                    <td className="py-2 px-3 text-stone-600">{job.claimDeadline}</td>
                    <td className="py-2 px-3">
                      <span
                        className={cn(
                          'font-medium',
                          job.daysRemaining > 30 && 'text-emerald-700',
                          job.daysRemaining > 0 && job.daysRemaining <= 30 && 'text-amber-700',
                          job.daysRemaining <= 0 && 'text-red-700'
                        )}
                      >
                        {job.daysRemaining > 0 ? job.daysRemaining : job.daysRemaining}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', job.statusColor)}>
                        {job.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual timeline */}
        <div className="bg-stone-50 rounded-lg border border-stone-200 p-3">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-3">NTO Timeline</div>
          <div className="space-y-2">
            {lienDeadlineJobs.map((job) => {
              const maxDays = 120
              const elapsed = maxDays - Math.max(job.daysRemaining, 0)
              const pct = Math.min((elapsed / maxDays) * 100, 100)
              return (
                <div key={job.id} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-stone-700 font-medium truncate">{job.jobName}</div>
                  <div className="flex-1 h-3 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        job.ntoStatus === 'sent' && 'bg-emerald-500',
                        job.ntoStatus === 'due-soon' && 'bg-amber-500',
                        job.ntoStatus === 'overdue' && 'bg-red-500'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={cn('text-[10px] font-medium w-16 text-right', job.statusColor)}>
                    {job.statusLabel}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Section 7: Contract Milestone Tracker ──────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Contract Milestone Tracker</h2>
          <span className="text-xs text-stone-500">Henderson Residence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">Milestone</th>
                <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">Date</th>
                <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">Status</th>
                <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {contractMilestones.map((ms) => (
                <tr key={ms.id} className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-medium text-stone-900">{ms.milestone}</td>
                  <td className="py-2 px-3 text-stone-600">{ms.date}</td>
                  <td className="py-2 px-3">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', ms.statusBgColor)}>
                      {ms.statusLabel}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-stone-500">{ms.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 8: AI Insights Bar ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">Contract Intelligence</span>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          12 active contracts analyzed. 3 pending signatures require follow-up. 1 NTO deadline overdue for Davis
          Coastal Home — send immediately. Attorney redline contains 1 high-risk clause deletion (arbitration)
          that needs resolution. Selection deadline for Chen Waterfront is at risk with 4 pending items.
          Compliance score: 96% across all active projects.
        </p>
      </div>

      {/* ── Section 9: AI Features Panel ───────────────────────────── */}
      <AIFeaturesPanel
        title="Contract & Legal AI Features"
        columns={2}
        features={[
          {
            feature: 'AI Contract Drafting',
            insight: 'Generates complete contracts from estimate data, auto-filling client info, project details, line items, and payment schedule.',
            confidence: 95,
            severity: 'success',
          },
          {
            feature: 'Clause Risk Analysis',
            insight: 'Scans attorney redlines and flags high-risk deletions, payment term changes, and liability shifts with severity ratings.',
            confidence: 92,
            severity: 'warning',
          },
          {
            feature: 'Redline Comparison',
            insight: 'Side-by-side diff of contract versions highlighting every change with risk assessment and recommended responses.',
            severity: 'info',
          },
          {
            feature: 'Lien Deadline Tracking',
            insight: 'State-specific lien law compliance with automatic NTO and claim deadline calculations. Alerts at 30, 14, and 7 days.',
            confidence: 98,
            severity: 'success',
          },
          {
            feature: 'Scope Completeness Check',
            insight: 'Compares contract scope against estimate line items to identify missing items, ambiguous language, or gaps.',
            confidence: 89,
            severity: 'success',
          },
          {
            feature: 'Amendment Management',
            insight: 'Tracks all change orders, amendments, and addenda with cumulative impact on contract value and timeline.',
            severity: 'info',
          },
        ]}
      />
    </div>
  )
}
