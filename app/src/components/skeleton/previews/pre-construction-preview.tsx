'use client'

import {
  Compass,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  MapPin,
  FileText,
  Users,
  ChevronRight,
  ArrowRight,
  Building2,
  Ruler,
  HardHat,
  Hammer,
  Shield,
  Zap,
  Layers,
  Droplets,
  ClipboardCheck,
  Eye,
  Upload,
  MessageSquare,
  GitBranch,
  Target,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ───────────────────────────────────────────────────────────────

interface TimelineStage {
  name: string
  status: 'complete' | 'active' | 'upcoming'
  icon: typeof Compass
  days?: number
}

interface MockProject {
  name: string
  stage: string
  stageIndex: number
  daysInStage: number
  pm: string
}

interface PermitRow {
  type: string
  status: 'approved' | 'under_review' | 'not_submitted' | 'calculated'
  statusLabel: string
  timeline: string
  fee: string
  notes: string
}

interface EngineeringCard {
  discipline: string
  firm: string
  cost: string
  status: 'complete' | 'in_progress' | 'scheduled'
  statusLabel: string
  deliverables: string[]
}

interface ChecklistItem {
  label: string
  done: boolean
  category: 'permits' | 'site' | 'admin' | 'planning'
}

interface DesignBudgetRow {
  category: string
  budgeted: string
  paid: string
  remaining: string
  status: 'paid' | 'partial' | 'unpaid'
}

interface DesignReviewer {
  name: string
  role: string
  status: 'reviewed' | 'pending' | 'in_progress'
  comments: number
}

// ── Mock Data ───────────────────────────────────────────────────────────

const timelineStages: TimelineStage[] = [
  { name: 'Contract Signed', status: 'complete', icon: FileText },
  { name: 'Architect Design', status: 'complete', icon: Ruler },
  { name: 'Engineering', status: 'active', icon: Building2 },
  { name: 'HOA/ARB', status: 'active', icon: Shield },
  { name: 'Permits', status: 'upcoming', icon: ClipboardCheck },
  { name: 'Pre-Con Meeting', status: 'upcoming', icon: Users },
  { name: 'Ground Breaking', status: 'upcoming', icon: Hammer },
]

const mockProjects: MockProject[] = [
  { name: 'Martinez Custom Home', stage: 'Engineering', stageIndex: 2, daysInStage: 12, pm: 'Mike Torres' },
  { name: 'Chen Beach House', stage: 'Permits', stageIndex: 4, daysInStage: 28, pm: 'Sarah Chen' },
  { name: 'Patel Residence', stage: 'HOA/ARB', stageIndex: 3, daysInStage: 8, pm: 'Mike Torres' },
]

const permits: PermitRow[] = [
  { type: 'Building Permit', status: 'under_review', statusLabel: 'Under Review', timeline: '4 weeks est.', fee: '$8,400', notes: 'Submitted 2026-01-28' },
  { type: 'Pool Permit', status: 'approved', statusLabel: 'Approved', timeline: 'Complete', fee: '$2,200', notes: 'Approved 2026-02-10' },
  { type: 'Electrical Permit', status: 'not_submitted', statusLabel: 'Not Submitted', timeline: 'Pending building', fee: '$1,400', notes: 'Requires building permit first' },
  { type: 'Impact Fees', status: 'calculated', statusLabel: 'Calculated', timeline: 'Due at permit', fee: '$23,400', notes: 'School + transportation + parks' },
]

const designReviewers: DesignReviewer[] = [
  { name: 'Mike Torres', role: 'Project Manager', status: 'reviewed', comments: 8 },
  { name: 'Jim Rawlings', role: 'Superintendent', status: 'reviewed', comments: 12 },
  { name: 'Lisa Park', role: 'Estimator', status: 'in_progress', comments: 3 },
]

const engineering: EngineeringCard[] = [
  {
    discipline: 'Structural',
    firm: 'Gulf Coast Engineering',
    cost: '$4,500',
    status: 'complete',
    statusLabel: 'Complete',
    deliverables: ['Foundation plan', 'Framing details', 'Wind load calcs'],
  },
  {
    discipline: 'Truss',
    firm: 'Southern Truss Co.',
    cost: '$2,200',
    status: 'in_progress',
    statusLabel: 'In Progress',
    deliverables: ['Roof truss layout', 'Bearing point schedule'],
  },
  {
    discipline: 'Energy Rater',
    firm: 'EcoRate FL',
    cost: '$1,800',
    status: 'scheduled',
    statusLabel: 'Scheduled',
    deliverables: ['Manual J calc', 'Duct design', 'REScheck'],
  },
  {
    discipline: 'Geotech',
    firm: 'Terra Testing',
    cost: '$3,200',
    status: 'complete',
    statusLabel: 'Complete',
    deliverables: ['Soil boring report', 'Foundation recommendations'],
  },
]

const checklist: ChecklistItem[] = [
  { label: 'Permit in hand', done: false, category: 'permits' },
  { label: 'Survey staked', done: true, category: 'site' },
  { label: 'Tree protection installed', done: false, category: 'site' },
  { label: 'Silt fence installed', done: false, category: 'site' },
  { label: 'Temp power ordered', done: true, category: 'site' },
  { label: 'Port-a-john scheduled', done: false, category: 'site' },
  { label: 'Dumpster ordered', done: true, category: 'site' },
  { label: "Builder's risk active", done: true, category: 'admin' },
  { label: 'All contracts signed', done: true, category: 'admin' },
  { label: 'Utility connections started', done: true, category: 'admin' },
  { label: 'Selections timeline set', done: false, category: 'planning' },
  { label: 'Pre-con meeting completed', done: false, category: 'planning' },
]

const designBudget: DesignBudgetRow[] = [
  { category: 'Architect', budgeted: '$35,000', paid: '$28,000', remaining: '$7,000', status: 'partial' },
  { category: 'Engineering', budgeted: '$11,700', paid: '$7,700', remaining: '$4,000', status: 'partial' },
  { category: 'Survey', budgeted: '$4,500', paid: '$4,500', remaining: '$0', status: 'paid' },
  { category: 'Geotech', budgeted: '$3,200', paid: '$3,200', remaining: '$0', status: 'paid' },
  { category: 'Permit Fees', budgeted: '$23,400', paid: '$10,600', remaining: '$12,800', status: 'partial' },
  { category: 'HOA Fees', budgeted: '$2,500', paid: '$0', remaining: '$2,500', status: 'unpaid' },
]

// ── Helpers ─────────────────────────────────────────────────────────────

function permitStatusBadge(status: PermitRow['status']): { bg: string; text: string } {
  switch (status) {
    case 'approved':
      return { bg: 'bg-green-100', text: 'text-green-700' }
    case 'under_review':
      return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'not_submitted':
      return { bg: 'bg-warm-100', text: 'text-warm-600' }
    case 'calculated':
      return { bg: 'bg-amber-100', text: 'text-amber-700' }
  }
}

function engineeringStatusBadge(status: EngineeringCard['status']): { bg: string; text: string } {
  switch (status) {
    case 'complete':
      return { bg: 'bg-green-100', text: 'text-green-700' }
    case 'in_progress':
      return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'scheduled':
      return { bg: 'bg-amber-100', text: 'text-amber-700' }
  }
}

function budgetStatusBadge(status: DesignBudgetRow['status']): { bg: string; text: string } {
  switch (status) {
    case 'paid':
      return { bg: 'bg-green-100', text: 'text-green-700' }
    case 'partial':
      return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'unpaid':
      return { bg: 'bg-warm-100', text: 'text-warm-600' }
  }
}

// ── Component ───────────────────────────────────────────────────────────

export function PreConstructionPreview(): React.ReactElement {
  const doneCount = checklist.filter((c) => c.done).length
  const totalCount = checklist.length
  const progressPct = Math.round((doneCount / totalCount) * 100)

  const budgetTotal = 80300
  const paidTotal = 54000
  const remainingTotal = budgetTotal - paidTotal

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* ── Dark Header ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Compass className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Pre-Construction Management</h2>
            <p className="text-sm text-slate-300">
              From contract signing to breaking ground — the critical 3-6 months most software skips
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Active Pre-Con Jobs</div>
            <div className="text-xl font-bold text-white">3</div>
            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Building2 className="h-3 w-3" /> All residential
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Permits Pending</div>
            <div className="text-xl font-bold text-amber-400">5</div>
            <div className="text-xs text-amber-400/80 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" /> 2 under review
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Design Cycles</div>
            <div className="text-xl font-bold text-white">2</div>
            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <GitBranch className="h-3 w-3" /> Rev B in progress
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Days to Ground Break</div>
            <div className="text-xl font-bold text-emerald-400">47</div>
            <div className="text-xs text-emerald-400/80 flex items-center gap-1 mt-0.5">
              <TrendingUp className="h-3 w-3" /> On track (Martinez)
            </div>
          </div>
        </div>
      </div>

      {/* ── Pre-Con Timeline ─────────────────────────────────────── */}
      <div className="p-4">
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-stone-500" />
              <h3 className="font-medium text-warm-900 text-sm">Pre-Construction Timeline</h3>
            </div>
            <span className="text-xs text-warm-400">7 milestone stages</span>
          </div>
          <div className="p-4">
            {/* Timeline bar */}
            <div className="flex items-center gap-0 mb-6 overflow-x-auto">
              {timelineStages.map((stage, idx) => {
                const Icon = stage.icon
                return (
                  <div key={stage.name} className="flex items-center flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center border-2',
                          stage.status === 'complete' && 'bg-emerald-100 border-emerald-500',
                          stage.status === 'active' && 'bg-blue-100 border-blue-500',
                          stage.status === 'upcoming' && 'bg-warm-100 border-warm-300',
                        )}
                      >
                        {stage.status === 'complete' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Icon
                            className={cn(
                              'h-4 w-4',
                              stage.status === 'active' && 'text-blue-600',
                              stage.status === 'upcoming' && 'text-warm-400',
                            )}
                          />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] mt-1.5 text-center w-16 leading-tight',
                          stage.status === 'complete' && 'text-emerald-600 font-medium',
                          stage.status === 'active' && 'text-blue-600 font-medium',
                          stage.status === 'upcoming' && 'text-warm-400',
                        )}
                      >
                        {stage.name}
                      </span>
                    </div>
                    {idx < timelineStages.length - 1 && (
                      <div
                        className={cn(
                          'w-8 h-0.5 mx-1 mt-[-18px]',
                          idx < 2 ? 'bg-emerald-400' : idx < 4 ? 'bg-blue-300' : 'bg-warm-200',
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Projects at different stages */}
            <div className="space-y-2">
              {mockProjects.map((project) => (
                <div
                  key={project.name}
                  className="flex items-center justify-between bg-warm-50 rounded-lg px-3 py-2.5 border border-warm-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <span className="text-sm font-medium text-warm-800">{project.name}</span>
                      <span className="text-xs text-warm-400 ml-2">PM: {project.pm}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                      {project.stage}
                    </span>
                    <span className="text-xs text-warm-400">{project.daysInStage} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lot Feasibility Card ─────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200 bg-gradient-to-r from-stone-50 to-warm-50">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-stone-500" />
              <h3 className="font-medium text-warm-900 text-sm">Lot Feasibility Analysis</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                AI Generated
              </span>
            </div>
            <span className="text-xs text-warm-400">Martinez Custom Home</span>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-warm-800 mb-1">123 Gulf Dr, Anna Maria Island</div>
                <div className="text-xs text-warm-500">Manatee County, FL 34216</div>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">
                Feasible
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-stone-50 rounded-lg p-3 border border-stone-100">
                <div className="text-xs text-warm-500 mb-1">Zoning</div>
                <div className="text-sm font-bold text-warm-800">R-2</div>
                <div className="text-xs text-warm-400 mt-0.5">Residential, single-family</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 border border-stone-100">
                <div className="text-xs text-warm-500 mb-1">Max Height</div>
                <div className="text-sm font-bold text-warm-800">35&apos;</div>
                <div className="text-xs text-warm-400 mt-0.5">2-story allowed</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 border border-stone-100">
                <div className="text-xs text-warm-500 mb-1">Lot Coverage</div>
                <div className="text-sm font-bold text-warm-800">40%</div>
                <div className="text-xs text-warm-400 mt-0.5">Max impervious</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 border border-stone-100">
                <div className="text-xs text-warm-500 mb-1">Flood Zone</div>
                <div className="text-sm font-bold text-amber-700">AE</div>
                <div className="text-xs text-amber-500 mt-0.5">Elevated construction req.</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 border border-stone-100">
                <div className="text-xs text-warm-500 mb-1">Buildable Area</div>
                <div className="text-sm font-bold text-warm-800">2,400 SF</div>
                <div className="text-xs text-warm-400 mt-0.5">Footprint max</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 border border-stone-100">
                <div className="text-xs text-warm-500 mb-1">Setbacks</div>
                <div className="text-sm font-bold text-warm-800">F:25&apos; R:10&apos;</div>
                <div className="text-xs text-warm-400 mt-0.5">S: 7.5&apos; each side</div>
              </div>
            </div>
            <div className="mt-3 bg-amber-50 rounded-lg p-2.5 border border-amber-100">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Flood Zone AE requires elevated foundation. Base flood elevation: 11&apos;. Recommend pile foundation with
                  minimum 12&apos; elevation. Additional foundation cost estimate: $35K-$45K above slab-on-grade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Permit Tracker ───────────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-stone-500" />
              <h3 className="font-medium text-warm-900 text-sm">Permit Tracker</h3>
              <span className="text-xs text-warm-400">Martinez Custom Home</span>
            </div>
            <button className="text-xs text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
              All Permits <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-warm-50 text-xs text-warm-500 border-b border-warm-200">
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">Permit Type</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">Status</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">Timeline</th>
                  <th scope="col" className="text-right px-4 py-2.5 font-medium">Fee</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {permits.map((permit) => {
                  const badge = permitStatusBadge(permit.status)
                  return (
                    <tr key={permit.type} className="hover:bg-warm-50 transition-colors">
                      <td className="px-4 py-2.5 text-warm-800 text-xs font-medium">{permit.type}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('text-xs px-2 py-0.5 rounded font-medium', badge.bg, badge.text)}>
                          {permit.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-warm-600">{permit.timeline}</td>
                      <td className="px-4 py-2.5 text-xs text-warm-800 font-medium text-right">{permit.fee}</td>
                      <td className="px-4 py-2.5 text-xs text-warm-500">{permit.notes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-warm-50 border-t border-warm-200 flex items-center justify-between">
            <span className="text-xs text-warm-500">
              <Sparkles className="h-3 w-3 text-amber-500 inline mr-1" />
              AI: Building permit typically takes 3-5 weeks in Manatee County. Current wait is 4 weeks — on track.
            </span>
            <span className="text-xs font-semibold text-warm-700">Total Fees: $35,400</span>
          </div>
        </div>
      </div>

      {/* ── Design Review Workflow ───────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-stone-500" />
              <h3 className="font-medium text-warm-900 text-sm">Design Review Workflow</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                Rev A &rarr; Rev B
              </span>
            </div>
          </div>
          <div className="p-4">
            {/* Workflow Steps */}
            <div className="flex items-start gap-3 mb-4 overflow-x-auto">
              {/* Step 1: Upload */}
              <div className="flex-shrink-0 w-36">
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 text-center">
                  <Upload className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
                  <div className="text-xs font-medium text-emerald-700">Rev A Uploaded</div>
                  <div className="text-[10px] text-emerald-500 mt-0.5">Feb 3, 2026</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-warm-300 mt-5 flex-shrink-0" />

              {/* Step 2: Reviewers */}
              <div className="flex-shrink-0 w-52">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-xs font-medium text-blue-700 mb-2 text-center">3 Reviewers Markup</div>
                  <div className="space-y-1.5">
                    {designReviewers.map((reviewer) => (
                      <div key={reviewer.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {reviewer.status === 'reviewed' ? (
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Clock className="h-3 w-3 text-blue-400" />
                          )}
                          <span className="text-[10px] text-warm-700">{reviewer.name}</span>
                        </div>
                        <span className="text-[10px] text-warm-400">{reviewer.comments} notes</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-warm-300 mt-5 flex-shrink-0" />

              {/* Step 3: AI Compiles */}
              <div className="flex-shrink-0 w-40">
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-center">
                  <Sparkles className="h-5 w-5 text-amber-500 mx-auto mb-1.5" />
                  <div className="text-xs font-medium text-amber-700">AI Compiles Feedback</div>
                  <div className="text-[10px] text-amber-500 mt-0.5">23 notes &rarr; 14 items</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-warm-300 mt-5 flex-shrink-0" />

              {/* Step 4: Response */}
              <div className="flex-shrink-0 w-40">
                <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 text-center">
                  <MessageSquare className="h-5 w-5 text-stone-500 mx-auto mb-1.5" />
                  <div className="text-xs font-medium text-warm-700">Sent to Architect</div>
                  <div className="text-[10px] text-warm-400 mt-0.5">Coordinated markup</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-warm-300 mt-5 flex-shrink-0" />

              {/* Step 5: Rev B */}
              <div className="flex-shrink-0 w-36">
                <div className="bg-warm-100 rounded-lg p-3 border border-warm-200 text-center border-dashed">
                  <FileText className="h-5 w-5 text-warm-400 mx-auto mb-1.5" />
                  <div className="text-xs font-medium text-warm-500">Rev B Pending</div>
                  <div className="text-[10px] text-warm-400 mt-0.5">Est. Feb 28</div>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 rounded-lg p-2.5 border border-stone-100">
              <p className="text-xs text-warm-500">
                <Sparkles className="h-3 w-3 text-amber-500 inline mr-1" />
                AI deduplicated 23 reviewer comments into 14 unique action items. Flagged 3 comments as
                conflicting — superintendent wants wider hallway, estimator notes budget impact of +$4,200.
                Architect notified of priority items.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Engineering Tracker ───────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-stone-500" />
              <h3 className="font-medium text-warm-900 text-sm">Engineering Tracker</h3>
            </div>
            <span className="text-xs text-warm-400">Martinez Custom Home</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {engineering.map((eng) => {
                const badge = engineeringStatusBadge(eng.status)
                return (
                  <div
                    key={eng.discipline}
                    className="bg-warm-50 rounded-lg p-3 border border-warm-100 hover:border-warm-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-warm-800">{eng.discipline}</span>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', badge.bg, badge.text)}>
                        {eng.statusLabel}
                      </span>
                    </div>
                    <div className="text-xs text-warm-500 mb-1">{eng.firm}</div>
                    <div className="text-sm font-bold text-warm-800 mb-2">{eng.cost}</div>
                    <div className="space-y-1">
                      {eng.deliverables.map((d) => (
                        <div key={d} className="flex items-center gap-1.5 text-xs text-warm-500">
                          {eng.status === 'complete' ? (
                            <CheckCircle className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                          ) : eng.status === 'in_progress' ? (
                            <Clock className="h-3 w-3 text-blue-400 flex-shrink-0" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-warm-300 flex-shrink-0" />
                          )}
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Pre-Con Checklist ─────────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-stone-500" />
              <h3 className="font-medium text-warm-900 text-sm">Pre-Construction Checklist</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                {doneCount}/{totalCount}
              </span>
            </div>
            <span className="text-xs text-warm-400">{progressPct}% complete</span>
          </div>
          <div className="p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2.5 bg-warm-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-warm-400">{doneCount} completed</span>
                <span className="text-xs text-warm-400">{totalCount - doneCount} remaining</span>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {checklist.map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors',
                    item.done
                      ? 'bg-emerald-50/50 border-emerald-100'
                      : 'bg-white border-warm-100 hover:border-warm-200',
                  )}
                >
                  {item.done ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-warm-300 flex-shrink-0" />
                  )}
                  <span
                    className={cn(
                      'text-xs',
                      item.done ? 'text-emerald-700' : 'text-warm-700',
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      'ml-auto text-[10px] px-1.5 py-0.5 rounded',
                      item.category === 'permits' && 'bg-blue-50 text-blue-500',
                      item.category === 'site' && 'bg-amber-50 text-amber-500',
                      item.category === 'admin' && 'bg-stone-50 text-stone-500',
                      item.category === 'planning' && 'bg-purple-50 text-purple-500',
                    )}
                  >
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Design Budget Tracker ────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-stone-500" />
              <h3 className="font-medium text-warm-900 text-sm">Pre-Construction Budget</h3>
            </div>
            <span className="text-xs text-warm-400">Martinez Custom Home</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-warm-50 text-xs text-warm-500 border-b border-warm-200">
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">Category</th>
                  <th scope="col" className="text-right px-4 py-2.5 font-medium">Budgeted</th>
                  <th scope="col" className="text-right px-4 py-2.5 font-medium">Paid</th>
                  <th scope="col" className="text-right px-4 py-2.5 font-medium">Remaining</th>
                  <th scope="col" className="text-center px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {designBudget.map((row) => {
                  const badge = budgetStatusBadge(row.status)
                  return (
                    <tr key={row.category} className="hover:bg-warm-50 transition-colors">
                      <td className="px-4 py-2.5 text-warm-800 text-xs font-medium">{row.category}</td>
                      <td className="px-4 py-2.5 text-xs text-warm-600 text-right">{row.budgeted}</td>
                      <td className="px-4 py-2.5 text-xs text-warm-800 font-medium text-right">{row.paid}</td>
                      <td className="px-4 py-2.5 text-xs text-warm-600 text-right">{row.remaining}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', badge.bg, badge.text)}>
                          {row.status === 'paid' ? 'Paid' : row.status === 'partial' ? 'Partial' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-warm-50 border-t border-warm-200 font-semibold">
                  <td className="px-4 py-2.5 text-warm-800 text-xs">Total</td>
                  <td className="px-4 py-2.5 text-xs text-warm-800 text-right">${budgetTotal.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-xs text-warm-800 text-right">${paidTotal.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-xs text-warm-800 text-right">${remainingTotal.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                      67% paid
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ── AI Insights Bar ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Pre-Con Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            Martinez building permit is tracking to 4-week approval — normal for Manatee County. Truss
            engineering is 3 days behind schedule; recommend following up with Southern Truss Co. by Friday.
            HOA/ARB for Patel Residence has 2 outstanding items (roof color and mailbox style). Based on
            similar coastal projects, plan an extra $8K contingency for pile foundation inspections.
          </p>
        </div>
      </div>

      {/* ── AI Features Panel ────────────────────────────────────── */}
      <div className="px-4 py-4 bg-white border-t border-warm-200">
        <AIFeaturesPanel
          title="Pre-Construction AI Features"
          columns={2}
          features={[
            {
              feature: 'Lot Feasibility Analysis',
              trigger: 'On creation',
              insight: 'AI analyzes zoning, flood zone, setbacks, and buildable area from address',
              detail: 'Pulls county records, FEMA flood maps, and zoning data to generate a buildability report. Flags elevation requirements, lot coverage limits, and setback constraints automatically.',
              severity: 'info',
              confidence: 91,
            },
            {
              feature: 'Permit Timeline Prediction',
              trigger: 'On submission',
              insight: 'Predicts permit approval timeline based on jurisdiction history',
              detail: 'Tracks historical permit processing times by jurisdiction and permit type. Currently predicting Manatee County building permits at 3-5 weeks with 88% accuracy.',
              severity: 'success',
              confidence: 88,
            },
            {
              feature: 'Design Review Coordinator',
              trigger: 'On change',
              insight: 'Deduplicates and prioritizes reviewer comments across markups',
              detail: 'Compiles feedback from multiple reviewers, removes duplicates, flags conflicts, and generates a coordinated response document for the architect. Reduced review cycles by 40%.',
              severity: 'info',
              confidence: 86,
            },
            {
              feature: 'Engineering Schedule Monitor',
              trigger: 'Daily',
              insight: 'Tracks engineering deliverables and flags delays before they cascade',
              detail: 'Monitors engineering consultant timelines and alerts when deliverables are late. Truss engineering delay detected 3 days ago — notified PM to follow up before it impacts permit submission.',
              severity: 'warning',
              confidence: 90,
            },
            {
              feature: 'Pre-Con Readiness Score',
              trigger: 'Real-time',
              insight: 'Composite score showing how ready a project is to break ground',
              detail: 'Weights checklist completion, permit status, engineering progress, budget paid, and contract status into a single readiness percentage. Martinez: 58% — permits are the gating item.',
              severity: 'info',
              confidence: 93,
            },
            {
              feature: 'Cost Benchmarking',
              trigger: 'On change',
              insight: 'Compares pre-con costs against similar completed projects',
              detail: 'Pre-con budget of $80,300 is within normal range for coastal custom homes ($65K-$95K). Permit fees are 29% of pre-con budget — typical for flood zone projects.',
              severity: 'success',
              confidence: 87,
            },
          ]}
        />
      </div>
    </div>
  )
}
