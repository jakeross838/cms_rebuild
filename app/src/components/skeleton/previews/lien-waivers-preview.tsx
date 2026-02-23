'use client'

import { useState } from 'react'

import {
  Download,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Building2,
  Sparkles,
  MoreHorizontal,
  Send,
  FileCheck,
  ClipboardList,
  Shield,
  FileSignature,
  Users,
  Bell,
  Layers,
  MapPin,
  Ban,
  FileText,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

type WaiverStatus = 'draft' | 'requested' | 'submitted' | 'approved' | 'rejected' | 'void' | 'missing'
type WaiverType = 'conditional_progress' | 'unconditional_progress' | 'conditional_final' | 'unconditional_final'
type SignatureType = 'electronic' | 'wet' | 'notarized' | 'pending'
type WaiverTier = 'prime' | 'sub_tier'
type EnforcementLevel = 'strict' | 'warn' | 'none'
type SubmissionMethod = 'portal' | 'email' | 'manual' | 'pending'

interface LienWaiver {
  id: string
  vendorName: string
  waiverType: WaiverType
  amount: number
  drawNumber: number
  throughDate: string
  dateRequested: string
  dateReceived?: string
  status: WaiverStatus
  jobName: string
  aiNote?: string
  invoiceNumber?: string
  paymentId?: string
  signatureType: SignatureType
  tier: WaiverTier
  parentVendor?: string
  stateCode: string
  isStatutoryForm: boolean
  remindersSent: number
  nextReminderDate?: string
  submissionMethod: SubmissionMethod
  complianceRisk: 'low' | 'medium' | 'high'
  paymentHold: boolean
  aiConfidence?: number
  preliminaryNoticeStatus?: 'sent' | 'confirmed' | 'expired' | 'not_required'
  lienDeadlineDays?: number
}

const mockLienWaivers: LienWaiver[] = [
  {
    id: '1',
    vendorName: 'ABC Lumber Supply',
    waiverType: 'conditional_progress',
    amount: 24500,
    drawNumber: 3,
    throughDate: '2026-01-31',
    dateRequested: '2026-01-25',
    status: 'approved',
    dateReceived: '2026-01-28',
    jobName: 'Smith Residence',
    invoiceNumber: 'INV-2024-0892',
    signatureType: 'electronic',
    tier: 'prime',
    stateCode: 'FL',
    isStatutoryForm: true,
    remindersSent: 0,
    submissionMethod: 'portal',
    complianceRisk: 'low',
    paymentHold: false,
    aiConfidence: 0.97,
    preliminaryNoticeStatus: 'confirmed',
  },
  {
    id: '2',
    vendorName: 'PGT Industries',
    waiverType: 'unconditional_progress',
    amount: 45800,
    drawNumber: 2,
    throughDate: '2025-12-31',
    dateRequested: '2026-01-05',
    status: 'approved',
    dateReceived: '2026-01-10',
    jobName: 'Smith Residence',
    invoiceNumber: 'INV-2024-0875',
    signatureType: 'wet',
    tier: 'prime',
    stateCode: 'FL',
    isStatutoryForm: true,
    remindersSent: 0,
    submissionMethod: 'manual',
    complianceRisk: 'low',
    paymentHold: false,
    aiConfidence: 0.95,
    preliminaryNoticeStatus: 'confirmed',
  },
  {
    id: '3',
    vendorName: 'Jones Plumbing',
    waiverType: 'conditional_progress',
    amount: 12750,
    drawNumber: 3,
    throughDate: '2026-01-31',
    dateRequested: '2026-01-25',
    status: 'submitted',
    jobName: 'Smith Residence',
    invoiceNumber: 'INV-2024-0880',
    aiNote: 'Vendor typically responds in 3-5 days. Follow-up in 2 days.',
    signatureType: 'electronic',
    tier: 'prime',
    stateCode: 'FL',
    isStatutoryForm: true,
    remindersSent: 1,
    nextReminderDate: '2026-02-14',
    submissionMethod: 'portal',
    complianceRisk: 'medium',
    paymentHold: true,
    aiConfidence: 0.88,
    preliminaryNoticeStatus: 'confirmed',
  },
  {
    id: '4',
    vendorName: 'Smith Electric',
    waiverType: 'conditional_progress',
    amount: 18200,
    drawNumber: 3,
    throughDate: '2026-01-31',
    dateRequested: '2026-01-25',
    status: 'requested',
    jobName: 'Johnson Beach House',
    signatureType: 'pending',
    tier: 'prime',
    stateCode: 'FL',
    isStatutoryForm: true,
    remindersSent: 2,
    nextReminderDate: '2026-02-13',
    submissionMethod: 'pending',
    complianceRisk: 'medium',
    paymentHold: true,
    preliminaryNoticeStatus: 'sent',
  },
  {
    id: '5',
    vendorName: 'Cool Air HVAC',
    waiverType: 'unconditional_progress',
    amount: 28000,
    drawNumber: 2,
    throughDate: '2025-12-31',
    dateRequested: '2026-01-10',
    status: 'missing',
    jobName: 'Smith Residence',
    aiNote: 'Waiver overdue by 15 days. Blocking Draw #3 release. Contact vendor immediately.',
    signatureType: 'pending',
    tier: 'prime',
    stateCode: 'FL',
    isStatutoryForm: true,
    remindersSent: 4,
    submissionMethod: 'pending',
    complianceRisk: 'high',
    paymentHold: true,
    preliminaryNoticeStatus: 'confirmed',
    lienDeadlineDays: 45,
  },
  {
    id: '6',
    vendorName: 'Custom Cabinet Co',
    waiverType: 'conditional_progress',
    amount: 32400,
    drawNumber: 3,
    throughDate: '2026-01-31',
    dateRequested: '2026-01-28',
    status: 'requested',
    jobName: 'Johnson Beach House',
    signatureType: 'pending',
    tier: 'prime',
    stateCode: 'FL',
    isStatutoryForm: true,
    remindersSent: 0,
    nextReminderDate: '2026-02-15',
    submissionMethod: 'pending',
    complianceRisk: 'low',
    paymentHold: false,
    preliminaryNoticeStatus: 'not_required',
  },
  {
    id: '7',
    vendorName: 'Sherwin-Williams',
    waiverType: 'unconditional_final',
    amount: 4200,
    drawNumber: 1,
    throughDate: '2025-10-31',
    dateRequested: '2025-11-01',
    status: 'approved',
    dateReceived: '2025-11-05',
    jobName: 'Miller Addition',
    signatureType: 'electronic',
    tier: 'prime',
    stateCode: 'FL',
    isStatutoryForm: true,
    remindersSent: 0,
    submissionMethod: 'portal',
    complianceRisk: 'low',
    paymentHold: false,
    aiConfidence: 0.99,
    preliminaryNoticeStatus: 'confirmed',
  },
  {
    id: '8',
    vendorName: 'ABC Framing',
    waiverType: 'conditional_progress',
    amount: 38500,
    drawNumber: 3,
    throughDate: '2026-01-31',
    dateRequested: '2026-01-25',
    status: 'draft',
    jobName: 'Wilson Custom',
    signatureType: 'pending',
    tier: 'prime',
    stateCode: 'CA',
    isStatutoryForm: true,
    remindersSent: 0,
    submissionMethod: 'pending',
    complianceRisk: 'medium',
    paymentHold: true,
    preliminaryNoticeStatus: 'sent',
    lienDeadlineDays: 70,
  },
  {
    id: '9',
    vendorName: 'Coastal Concrete',
    waiverType: 'conditional_final',
    amount: 22000,
    drawNumber: 4,
    throughDate: '2026-01-15',
    dateRequested: '2026-01-20',
    status: 'missing',
    jobName: 'Davis Coastal Home',
    aiNote: 'Critical: Final waiver blocking project closeout. Escalate to project manager.',
    signatureType: 'pending',
    tier: 'prime',
    stateCode: 'FL',
    isStatutoryForm: true,
    remindersSent: 5,
    submissionMethod: 'pending',
    complianceRisk: 'high',
    paymentHold: true,
    preliminaryNoticeStatus: 'confirmed',
    lienDeadlineDays: 30,
  },
  {
    id: '10',
    vendorName: 'Tampa Electrical Supply',
    waiverType: 'conditional_progress',
    amount: 8500,
    drawNumber: 3,
    throughDate: '2026-01-31',
    dateRequested: '2026-01-28',
    status: 'submitted',
    jobName: 'Smith Residence',
    signatureType: 'electronic',
    tier: 'sub_tier',
    parentVendor: 'Smith Electric',
    stateCode: 'FL',
    isStatutoryForm: true,
    remindersSent: 0,
    submissionMethod: 'portal',
    complianceRisk: 'low',
    paymentHold: false,
    preliminaryNoticeStatus: 'not_required',
  },
]

const statusConfig: Record<WaiverStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  draft: { label: 'Draft', color: 'text-warm-700', bgColor: 'bg-warm-100', icon: FileText },
  requested: { label: 'Requested', color: 'text-stone-700', bgColor: 'bg-stone-100', icon: Send },
  submitted: { label: 'Submitted', color: 'text-stone-700', bgColor: 'bg-stone-100', icon: FileCheck },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
  void: { label: 'Void', color: 'text-warm-500', bgColor: 'bg-warm-100', icon: Ban },
  missing: { label: 'Missing', color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertTriangle },
}

const waiverTypeConfig: Record<WaiverType, { label: string; shortLabel: string; color: string }> = {
  conditional_progress: { label: 'Conditional Progress', shortLabel: 'Cond. Progress', color: 'bg-warm-50 text-warm-700' },
  unconditional_progress: { label: 'Unconditional Progress', shortLabel: 'Uncond. Progress', color: 'bg-stone-50 text-stone-700' },
  conditional_final: { label: 'Conditional Final', shortLabel: 'Cond. Final', color: 'bg-sand-50 text-sand-700' },
  unconditional_final: { label: 'Unconditional Final', shortLabel: 'Uncond. Final', color: 'bg-emerald-50 text-emerald-700' },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(2)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDaysSinceRequested(dateRequested: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const requested = new Date(dateRequested)
  requested.setHours(0, 0, 0, 0)
  const diffTime = today.getTime() - requested.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function ComplianceRiskBadge({ risk }: { risk: LienWaiver['complianceRisk'] }) {
  const config = {
    low: { label: 'Low Risk', color: 'text-green-600 bg-green-50' },
    medium: { label: 'Med Risk', color: 'text-amber-600 bg-amber-50' },
    high: { label: 'High Risk', color: 'text-red-600 bg-red-50' },
  }
  const cfg = config[risk]
  return (
    <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1', cfg.color)}>
      <Shield className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

function SignatureBadge({ type }: { type: SignatureType }) {
  if (type === 'pending') return null
  const config = {
    electronic: { label: 'E-Signed', color: 'text-stone-600 bg-stone-50' },
    wet: { label: 'Wet Signature', color: 'text-warm-600 bg-warm-100' },
    notarized: { label: 'Notarized', color: 'text-stone-600 bg-warm-50' },
    pending: { label: '', color: '' },
  }
  const cfg = config[type]
  return (
    <span className={cn('text-xs px-1.5 py-0.5 rounded flex items-center gap-1', cfg.color)}>
      <FileSignature className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

function WaiverRow({ waiver }: { waiver: LienWaiver }) {
  const status = statusConfig[waiver.status]
  const waiverType = waiverTypeConfig[waiver.waiverType]
  const StatusIcon = status.icon
  const daysSinceRequested = getDaysSinceRequested(waiver.dateRequested)

  return (
    <div className={cn(
      "bg-white border rounded-lg p-4 hover:shadow-md transition-shadow",
      "border-warm-200",
      waiver.complianceRisk === 'high' && "border-l-4 border-l-red-500",
      waiver.paymentHold && waiver.complianceRisk !== 'high' && "border-l-4 border-l-amber-500"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-medium text-warm-900">{waiver.vendorName}</span>
            {waiver.tier === 'sub_tier' && (
              <span className="text-xs bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Sub-tier of {waiver.parentVendor}
              </span>
            )}
            <span className={cn("text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1", status.bgColor, status.color)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
            <span className={cn("text-xs px-2 py-0.5 rounded font-medium", waiverType.color)}>
              {waiverType.shortLabel}
            </span>
            <ComplianceRiskBadge risk={waiver.complianceRisk} />
            {waiver.paymentHold ? <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium flex items-center gap-1">
                <Ban className="h-3 w-3" />
                Payment Hold
              </span> : null}
          </div>

          <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-sm">
            <div className="flex items-center gap-2 text-warm-600">
              <DollarSign className="h-4 w-4 text-warm-400" />
              <span className="font-semibold">{formatCurrency(waiver.amount)}</span>
            </div>
            <div className="flex items-center gap-2 text-warm-600">
              <ClipboardList className="h-4 w-4 text-warm-400" />
              <span>Draw #{waiver.drawNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-warm-600">
              <Building2 className="h-4 w-4 text-warm-400" />
              <span>{waiver.jobName}</span>
            </div>
            <div className="flex items-center gap-2 text-warm-600">
              <MapPin className="h-4 w-4 text-warm-400" />
              <span>{waiver.stateCode}</span>
              {waiver.isStatutoryForm ? <span className="text-xs text-warm-400">(Statutory)</span> : null}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3 text-sm flex-wrap">
            <span className="text-xs text-warm-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Through: {formatDate(waiver.throughDate)}
            </span>
            {waiver.invoiceNumber ? <span className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded">
                {waiver.invoiceNumber}
              </span> : null}
            <SignatureBadge type={waiver.signatureType} />
            {waiver.remindersSent > 0 && (
              <span className="text-xs text-warm-400 flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {waiver.remindersSent} reminder{waiver.remindersSent !== 1 ? 's' : ''} sent
              </span>
            )}
            {waiver.lienDeadlineDays !== undefined && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded font-medium",
                waiver.lienDeadlineDays <= 30 ? "bg-red-100 text-red-700" :
                waiver.lienDeadlineDays <= 60 ? "bg-amber-100 text-amber-700" :
                "bg-warm-100 text-warm-600"
              )}>
                Lien deadline: {waiver.lienDeadlineDays}d
              </span>
            )}
            {waiver.preliminaryNoticeStatus && waiver.preliminaryNoticeStatus !== 'not_required' ? <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                waiver.preliminaryNoticeStatus === 'confirmed' ? "bg-green-50 text-green-600" :
                waiver.preliminaryNoticeStatus === 'sent' ? "bg-stone-50 text-stone-600" :
                "bg-red-50 text-red-600"
              )}>
                Prelim: {waiver.preliminaryNoticeStatus}
              </span> : null}
          </div>

          {waiver.aiNote ? <div className={cn(
              "mt-3 p-2 rounded-md flex items-start gap-2 text-sm",
              waiver.complianceRisk === 'high' ? "bg-red-50" : "bg-amber-50"
            )}>
              <Sparkles className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                waiver.complianceRisk === 'high' ? "text-red-500" : "text-amber-500"
              )} />
              <span className={waiver.complianceRisk === 'high' ? "text-red-700" : "text-amber-700"}>
                {waiver.aiNote}
              </span>
            </div> : null}
        </div>

        <div className="flex items-start gap-4 ml-4">
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-warm-400" />
              <span className="text-warm-500">Requested {formatDate(waiver.dateRequested)}</span>
            </div>
            {waiver.status === 'approved' && waiver.dateReceived ? <div className="text-xs text-green-600 mt-1">
                Received {formatDate(waiver.dateReceived)}
              </div> : null}
            {(waiver.status === 'requested' || waiver.status === 'missing') && (
              <div className={cn(
                "text-xs mt-1",
                daysSinceRequested > 14 ? "text-red-600" :
                daysSinceRequested > 7 ? "text-amber-600" :
                "text-warm-500"
              )}>
                {daysSinceRequested} days ago
              </div>
            )}
            {waiver.nextReminderDate && (waiver.status === 'requested' || waiver.status === 'submitted') ? <div className="text-xs text-warm-400 mt-1">
                Next reminder: {formatDate(waiver.nextReminderDate)}
              </div> : null}
          </div>
          <button className="p-1.5 hover:bg-warm-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-warm-400" />
          </button>
        </div>
      </div>

      {(waiver.status === 'requested' || waiver.status === 'missing' || waiver.status === 'draft') && (
        <div className="mt-3 pt-3 border-t border-warm-100 flex items-center justify-end gap-2">
          {(waiver.status === 'requested' || waiver.status === 'missing') && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50">
              <Bell className="h-3.5 w-3.5" />
              Send Reminder
            </button>
          )}
          {waiver.status === 'draft' && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50">
              <Send className="h-3.5 w-3.5" />
              Send Request
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
            <FileCheck className="h-3.5 w-3.5" />
            Mark Received
          </button>
        </div>
      )}
    </div>
  )
}

export function LienWaiversPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [jobFilter, setJobFilter] = useState<string>('all')
  const [drawFilter, setDrawFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const jobs = [...new Set(mockLienWaivers.map(w => w.jobName))]
  const draws = [...new Set(mockLienWaivers.map(w => w.drawNumber))].sort((a, b) => a - b)

  const filteredWaivers = sortItems(
    mockLienWaivers.filter(w => {
      if (!matchesSearch(w, search, ['vendorName', 'jobName', 'invoiceNumber'])) return false
      if (activeTab !== 'all' && w.status !== activeTab) return false
      if (jobFilter !== 'all' && w.jobName !== jobFilter) return false
      if (drawFilter !== 'all' && w.drawNumber !== parseInt(drawFilter)) return false
      if (typeFilter !== 'all' && w.waiverType !== typeFilter) return false
      return true
    }),
    activeSort as keyof LienWaiver | '',
    sortDirection,
  )

  // Calculate quick stats
  const approvedCount = mockLienWaivers.filter(w => w.status === 'approved').length
  const approvedAmount = mockLienWaivers
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0)

  const pendingCount = mockLienWaivers.filter(w => ['draft', 'requested', 'submitted'].includes(w.status)).length
  const pendingAmount = mockLienWaivers
    .filter(w => ['draft', 'requested', 'submitted'].includes(w.status))
    .reduce((sum, w) => sum + w.amount, 0)

  const missingCount = mockLienWaivers.filter(w => w.status === 'missing').length
  const missingAmount = mockLienWaivers
    .filter(w => w.status === 'missing')
    .reduce((sum, w) => sum + w.amount, 0)

  const paymentHoldCount = mockLienWaivers.filter(w => w.paymentHold).length
  const highRiskCount = mockLienWaivers.filter(w => w.complianceRisk === 'high').length
  const subTierCount = mockLienWaivers.filter(w => w.tier === 'sub_tier').length

  // Calculate collection progress
  const totalWaivers = mockLienWaivers.length
  const collectionProgress = Math.round((approvedCount / totalWaivers) * 100)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Lien Waivers</h3>
              <span className="text-sm text-warm-500">{mockLienWaivers.length} waivers | {formatCurrency(mockLienWaivers.reduce((sum, w) => sum + w.amount, 0))} total</span>
              {highRiskCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {highRiskCount} high risk
                </span>
              )}
              {subTierCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-warm-100 text-warm-600 font-medium flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {subTierCount} sub-tier
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Users className="h-4 w-4" />
              Bulk Request
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <Plus className="h-4 w-4" />
              Request Waiver
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Approved ({approvedCount})
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{formatCurrency(approvedAmount)}</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <Clock className="h-4 w-4" />
              Pending ({pendingCount})
            </div>
            <div className="text-xl font-bold text-stone-700 mt-1">{formatCurrency(pendingAmount)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            missingCount > 0 ? "bg-red-50" : "bg-warm-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              missingCount > 0 ? "text-red-600" : "text-warm-600"
            )}>
              {missingCount > 0 ? <AlertTriangle className="h-4 w-4" /> : <FileCheck className="h-4 w-4" />}
              Missing ({missingCount})
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              missingCount > 0 ? "text-red-700" : "text-warm-700"
            )}>
              {missingCount > 0 ? formatCurrency(missingAmount) : '$0'}
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            paymentHoldCount > 0 ? "bg-amber-50" : "bg-warm-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              paymentHoldCount > 0 ? "text-amber-600" : "text-warm-600"
            )}>
              <Ban className="h-4 w-4" />
              Payment Holds
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              paymentHoldCount > 0 ? "text-amber-700" : "text-warm-700"
            )}>
              {paymentHoldCount} invoice{paymentHoldCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Enforcement Level Banner */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-warm-500">Enforcement:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">
              Strict - Payments blocked without waiver
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-warm-500">State:</span>
            <span className="text-xs text-warm-600">FL (Statutory forms required)</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search waivers, vendors, invoices..."
          tabs={[
            { key: 'all', label: 'All', count: mockLienWaivers.length },
            { key: 'draft', label: 'Draft', count: mockLienWaivers.filter(w => w.status === 'draft').length },
            { key: 'requested', label: 'Requested', count: mockLienWaivers.filter(w => w.status === 'requested').length },
            { key: 'submitted', label: 'Submitted', count: mockLienWaivers.filter(w => w.status === 'submitted').length },
            { key: 'approved', label: 'Approved', count: mockLienWaivers.filter(w => w.status === 'approved').length },
            { key: 'missing', label: 'Missing', count: mockLienWaivers.filter(w => w.status === 'missing').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Draws',
              value: drawFilter,
              options: draws.map(d => ({ value: String(d), label: `Draw #${d}` })),
              onChange: setDrawFilter,
            },
            {
              label: 'All Jobs',
              value: jobFilter,
              options: jobs.map(j => ({ value: j, label: j })),
              onChange: setJobFilter,
            },
            {
              label: 'All Types',
              value: typeFilter,
              options: [
                { value: 'conditional_progress', label: 'Conditional Progress' },
                { value: 'unconditional_progress', label: 'Unconditional Progress' },
                { value: 'conditional_final', label: 'Conditional Final' },
                { value: 'unconditional_final', label: 'Unconditional Final' },
              ],
              onChange: setTypeFilter,
            },
          ]}
          sortOptions={[
            { value: 'vendorName', label: 'Vendor' },
            { value: 'amount', label: 'Amount' },
            { value: 'dateRequested', label: 'Date Requested' },
            { value: 'drawNumber', label: 'Draw #' },
            { value: 'complianceRisk', label: 'Risk Level' },
            { value: 'status', label: 'Status' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredWaivers.length}
          totalCount={mockLienWaivers.length}
        />
      </div>

      {/* Waiver List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredWaivers.map(waiver => (
          <WaiverRow key={waiver.id} waiver={waiver} />
        ))}
        {filteredWaivers.length === 0 && (
          <div className="text-center py-8 text-warm-400 text-sm border-2 border-dashed border-warm-200 rounded-lg">
            No lien waivers match your filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Collection Progress:</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex-1 bg-amber-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all"
                  style={{ width: `${collectionProgress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-amber-800">{collectionProgress}%</span>
            </div>
            <p className="text-sm text-amber-700">
              {missingCount > 0 && (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 inline" />
                  {missingCount} missing waiver{missingCount > 1 ? 's' : ''} blocking draw releases.
                  {highRiskCount > 0 && ` ${highRiskCount} at high compliance risk - escalate immediately.`}
                  {' '}Lien filing deadlines approaching for 2 vendors.
                </span>
              )}
              {missingCount === 0 && pendingCount > 0 && (
                <span>All waivers on track. {pendingCount} pending - expected within 5 business days.</span>
              )}
              {missingCount === 0 && pendingCount === 0 && (
                <span>All lien waivers collected! Ready for draw processing.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI-Powered Lien Waiver Management"
          columns={2}
          features={[
            {
              feature: 'Auto-Request',
              trigger: 'On change',
              insight: 'Generates waiver requests tied to payments',
              detail: 'Automatically creates and sends waiver requests when payments are scheduled or invoices are approved, ensuring timely collection.',
              severity: 'info',
            },
            {
              feature: 'Compliance Check',
              trigger: 'On submission',
              insight: 'Validates waiver completeness and accuracy',
              detail: 'Reviews submitted waivers for required fields, proper signatures, correct amounts, and matching payment records.',
              severity: 'success',
            },
            {
              feature: 'Deadline Tracking',
              trigger: 'Real-time',
              insight: 'Alerts for approaching statutory deadlines',
              detail: 'Monitors lien filing deadlines by state and sends proactive alerts before critical dates to prevent compliance issues.',
              severity: 'warning',
            },
            {
              feature: 'Chain Verification',
              trigger: 'On change',
              insight: 'Ensures full lien waiver chain for each vendor',
              detail: 'Tracks waiver collection across all tiers (prime, sub-tier) to verify complete protection before releasing payments.',
              severity: 'info',
            },
            {
              feature: 'Form Matching',
              trigger: 'On submission',
              insight: 'Validates correct form type for jurisdiction',
              detail: 'Automatically verifies that the waiver form used matches state statutory requirements and project specifications.',
              severity: 'success',
            },
          ]}
        />
      </div>
    </div>
  )
}
