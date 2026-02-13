'use client'

import { useState } from 'react'
import {
  Plus,
  Download,
  MoreHorizontal,
  FileText,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Timer,
  ChevronRight,
  DollarSign,
  Building2,
  CalendarClock,
  Link2,
  Upload,
  Shield,
  Zap,
  Droplets,
  Flame,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PermitStatus = 'not_applied' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'issued' | 'expired' | 'on_hold'

interface Permit {
  id: string
  permitType: string
  jurisdiction: string
  jurisdictionContact?: string
  onlinePortalUrl?: string
  applicationDate: string | null
  approvalDate: string | null
  issuedDate: string | null
  expirationDate: string | null
  status: PermitStatus
  permitNumber?: string
  inspector?: string
  inspectorPhone?: string
  feeEstimated: number
  feeActual?: number
  conditions?: string[]
  requiredDocuments?: { name: string; status: 'uploaded' | 'missing' | 'pending_review' }[]
  scheduleDependencies?: string[]
  codeEdition?: string
  notes?: string
  aiNote?: string
}

interface COTracking {
  id: string
  type: 'final_co' | 'temp_co'
  status: 'prerequisites_pending' | 'applied' | 'issued' | 'expired'
  prerequisitesMet: number
  prerequisitesTotal: number
  appliedDate?: string
  issuedDate?: string
  expirationDate?: string
  conditions?: string[]
}

interface UtilityConnection {
  id: string
  utilityType: 'electric' | 'water' | 'sewer' | 'gas' | 'cable_internet' | 'irrigation'
  provider: string
  applicationDate?: string
  scheduledDate?: string
  completedDate?: string
  accountNumber?: string
  transferConfirmed: boolean
  status: 'not_started' | 'applied' | 'scheduled' | 'completed' | 'transferred'
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockPermits: Permit[] = [
  {
    id: '1',
    permitType: 'Building Permit',
    jurisdiction: 'City of Charleston',
    jurisdictionContact: 'Building Dept: (843) 724-3780',
    onlinePortalUrl: 'https://permits.charleston-sc.gov',
    applicationDate: '2025-11-08',
    approvalDate: '2025-12-20',
    issuedDate: '2025-12-22',
    expirationDate: '2026-12-22',
    status: 'issued',
    permitNumber: 'BP-2025-0842',
    inspector: 'John Mitchell',
    inspectorPhone: '(843) 724-3785',
    feeEstimated: 4200,
    feeActual: 4350,
    codeEdition: 'IRC 2021 w/ SC Amendments',
    requiredDocuments: [
      { name: 'Site Plan', status: 'uploaded' },
      { name: 'Construction Drawings', status: 'uploaded' },
      { name: 'Structural Calculations', status: 'uploaded' },
      { name: 'Energy Compliance (IECC)', status: 'uploaded' },
    ],
    scheduleDependencies: ['Foundation inspection required before framing'],
  },
  {
    id: '2',
    permitType: 'Electrical Permit',
    jurisdiction: 'City of Charleston',
    applicationDate: '2026-01-15',
    approvalDate: null,
    issuedDate: null,
    expirationDate: null,
    status: 'under_review',
    inspector: 'Sarah Johnson',
    inspectorPhone: '(843) 724-3786',
    feeEstimated: 850,
    codeEdition: 'NEC 2023',
    requiredDocuments: [
      { name: 'Electrical Plans', status: 'uploaded' },
      { name: 'Load Calculations', status: 'uploaded' },
      { name: 'Panel Schedule', status: 'pending_review' },
    ],
    scheduleDependencies: ['Blocks: Electrical rough-in cannot start'],
    aiNote: 'Similar permits averaging 28 days. Panel schedule under review - expect approval by Feb 14. Electrical rough-in scheduled for Feb 17.',
  },
  {
    id: '3',
    permitType: 'Plumbing Permit',
    jurisdiction: 'City of Charleston',
    applicationDate: '2026-01-15',
    approvalDate: '2026-02-05',
    issuedDate: '2026-02-06',
    expirationDate: '2027-02-06',
    status: 'issued',
    permitNumber: 'PL-2026-1102',
    inspector: 'Mike Roberts',
    inspectorPhone: '(843) 724-3787',
    feeEstimated: 650,
    feeActual: 650,
    codeEdition: 'IPC 2021',
    requiredDocuments: [
      { name: 'Plumbing Plans', status: 'uploaded' },
      { name: 'Riser Diagrams', status: 'uploaded' },
    ],
  },
  {
    id: '4',
    permitType: 'HVAC/Mechanical Permit',
    jurisdiction: 'City of Charleston',
    applicationDate: null,
    approvalDate: null,
    issuedDate: null,
    expirationDate: null,
    status: 'not_applied',
    feeEstimated: 750,
    codeEdition: 'IMC 2021',
    requiredDocuments: [
      { name: 'Mechanical Plans', status: 'missing' },
      { name: 'Manual J Calc', status: 'missing' },
      { name: 'Manual D Calc', status: 'missing' },
    ],
    scheduleDependencies: ['Blocks: HVAC rough-in (18 days out)'],
    aiNote: 'HVAC rough-in scheduled in 18 days. Average approval takes 21 days for this jurisdiction. Apply immediately to avoid schedule impact.',
  },
  {
    id: '5',
    permitType: 'Coastal Construction (OCRM)',
    jurisdiction: 'SC DHEC-OCRM',
    jurisdictionContact: 'OCRM Regional: (843) 953-0200',
    applicationDate: '2025-09-15',
    approvalDate: '2025-11-20',
    issuedDate: '2025-11-22',
    expirationDate: '2026-11-22',
    status: 'issued',
    permitNumber: 'OCRM-2025-5621',
    inspector: 'Regional Office',
    feeEstimated: 2800,
    feeActual: 3100,
    conditions: ['No work seaward of OCRM setback line', 'Stormwater BMP required during construction', 'Beach-compatible fill only'],
  },
  {
    id: '6',
    permitType: 'Septic System',
    jurisdiction: 'SC DHEC',
    jurisdictionContact: 'DHEC Environmental: (843) 953-0100',
    applicationDate: '2025-10-01',
    approvalDate: '2025-11-15',
    issuedDate: '2025-11-18',
    expirationDate: '2026-01-18',
    status: 'expired',
    permitNumber: 'SEP-2025-1847',
    feeEstimated: 500,
    feeActual: 500,
    notes: 'Expired - requires renewal before final inspection',
    aiNote: 'Expired 25 days ago. Renewal typically takes 5-7 business days for DHEC. Final inspection blocked until renewed.',
  },
  {
    id: '7',
    permitType: 'Fire Sprinkler',
    jurisdiction: 'Charleston Fire Dept',
    jurisdictionContact: 'Fire Marshal: (843) 724-7400',
    applicationDate: null,
    approvalDate: null,
    issuedDate: null,
    expirationDate: null,
    status: 'draft',
    feeEstimated: 1200,
    requiredDocuments: [
      { name: 'Sprinkler Layout', status: 'missing' },
      { name: 'Hydraulic Calculations', status: 'missing' },
    ],
    scheduleDependencies: ['Blocks: Fire sprinkler rough-in'],
  },
  {
    id: '8',
    permitType: 'Driveway/ROW Encroachment',
    jurisdiction: 'Charleston County',
    jurisdictionContact: 'Public Works: (843) 202-7600',
    applicationDate: '2026-02-01',
    approvalDate: null,
    issuedDate: null,
    expirationDate: null,
    status: 'submitted',
    feeEstimated: 350,
    requiredDocuments: [
      { name: 'Site Plan', status: 'uploaded' },
      { name: 'Traffic Study', status: 'uploaded' },
    ],
    aiNote: 'County backlogged - may take 35-40 days vs typical 21. Monitor status weekly.',
  },
  {
    id: '9',
    permitType: 'Grading Permit',
    jurisdiction: 'City of Charleston',
    applicationDate: '2025-10-20',
    approvalDate: '2025-11-05',
    issuedDate: '2025-11-06',
    expirationDate: '2026-05-06',
    status: 'issued',
    permitNumber: 'GR-2025-0331',
    feeEstimated: 600,
    feeActual: 600,
    conditions: ['Silt fence required around perimeter', 'Erosion control inspection within 48hr of grading'],
  },
]

const mockCO: COTracking = {
  id: '1',
  type: 'final_co',
  status: 'prerequisites_pending',
  prerequisitesMet: 4,
  prerequisitesTotal: 9,
  conditions: ['All permits must be current', 'All inspections passed', 'Final utility connections complete', 'As-built survey submitted'],
}

const mockUtilities: UtilityConnection[] = [
  { id: '1', utilityType: 'electric', provider: 'Dominion Energy', applicationDate: '2026-01-20', scheduledDate: '2026-03-01', status: 'scheduled', accountNumber: undefined, transferConfirmed: false },
  { id: '2', utilityType: 'water', provider: 'Charleston Water System', applicationDate: '2026-01-20', scheduledDate: '2026-03-01', status: 'scheduled', accountNumber: undefined, transferConfirmed: false },
  { id: '3', utilityType: 'sewer', provider: 'Charleston Water System', completedDate: '2025-12-15', status: 'completed', accountNumber: 'CWS-88221', transferConfirmed: false },
  { id: '4', utilityType: 'gas', provider: 'Piedmont Natural Gas', status: 'applied', applicationDate: '2026-02-01', accountNumber: undefined, transferConfirmed: false },
  { id: '5', utilityType: 'cable_internet', provider: 'Comcast Xfinity', status: 'not_started', accountNumber: undefined, transferConfirmed: false },
  { id: '6', utilityType: 'irrigation', provider: 'Self (well)', completedDate: '2026-01-10', status: 'completed', accountNumber: 'N/A', transferConfirmed: false },
]

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const statusConfig: Record<PermitStatus, { label: string; color: string; icon: typeof FileText }> = {
  not_applied: { label: 'Not Applied', color: 'bg-gray-100 text-gray-700', icon: FileText },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: FileText },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  issued: { label: 'Issued', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: XCircle },
  on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
}

const utilityIcons: Record<UtilityConnection['utilityType'], typeof Zap> = {
  electric: Zap,
  water: Droplets,
  sewer: Droplets,
  gas: Flame,
  cable_internet: Home,
  irrigation: Droplets,
}

const utilityLabels: Record<UtilityConnection['utilityType'], string> = {
  electric: 'Electric',
  water: 'Water',
  sewer: 'Sewer',
  gas: 'Gas',
  cable_internet: 'Cable/Internet',
  irrigation: 'Irrigation',
}

const timelineSteps = [
  { id: 'apply', label: 'Apply', status: 'completed' as const },
  { id: 'review', label: 'Under Review', status: 'completed' as const },
  { id: 'corrections', label: 'Corrections', status: 'current' as const },
  { id: 'approved', label: 'Approved', status: 'pending' as const },
  { id: 'issued', label: 'Issued', status: 'pending' as const },
  { id: 'inspections', label: 'Inspections', status: 'pending' as const },
  { id: 'final', label: 'Final/CO', status: 'pending' as const },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const today = new Date()
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function PermitCard({ permit }: { permit: Permit }) {
  const statusInfo = statusConfig[permit.status]
  const StatusIcon = statusInfo.icon
  const daysUntilExpiration = permit.expirationDate ? getDaysUntil(permit.expirationDate) : null

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      permit.status === 'expired' ? 'border-red-200' :
      permit.status === 'on_hold' ? 'border-orange-200' :
      permit.scheduleDependencies?.length ? 'border-l-4 border-l-amber-400' : 'border-gray-200'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">{permit.permitType}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1", statusInfo.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{permit.jurisdiction}</span>
          {permit.onlinePortalUrl && (
            <a className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-0.5">
              Portal <ChevronRight className="h-3 w-3" />
            </a>
          )}
        </div>
        {permit.permitNumber && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="font-mono">{permit.permitNumber}</span>
          </div>
        )}
        {permit.codeEdition && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="h-3.5 w-3.5 text-gray-400" />
            <span>{permit.codeEdition}</span>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 pt-3 border-t border-gray-100">
        <div>
          <span className="text-gray-400">Applied</span>
          <p className="font-medium text-gray-700">{formatDate(permit.applicationDate)}</p>
        </div>
        <div>
          <span className="text-gray-400">Issued</span>
          <p className="font-medium text-gray-700">{formatDate(permit.issuedDate)}</p>
        </div>
        <div>
          <span className="text-gray-400">Expiration</span>
          <p className={cn(
            "font-medium",
            permit.status === 'expired' ? "text-red-600" :
            daysUntilExpiration !== null && daysUntilExpiration <= 30 ? "text-amber-600" : "text-gray-700"
          )}>
            {formatDate(permit.expirationDate)}
            {daysUntilExpiration !== null && daysUntilExpiration > 0 && daysUntilExpiration <= 60 && (
              <span className="text-amber-500 ml-1">({daysUntilExpiration}d)</span>
            )}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Fee</span>
          <p className="font-medium text-gray-700">
            {permit.feeActual ? formatCurrency(permit.feeActual) : formatCurrency(permit.feeEstimated)}
            {permit.feeActual && permit.feeActual !== permit.feeEstimated && (
              <span className={cn('ml-1 text-xs', permit.feeActual > permit.feeEstimated ? 'text-red-500' : 'text-green-500')}>
                (est: {formatCurrency(permit.feeEstimated)})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Inspector */}
      {permit.inspector && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <Building2 className="h-3.5 w-3.5" />
          <span>{permit.inspector}</span>
          {permit.inspectorPhone && <span className="text-gray-400">{permit.inspectorPhone}</span>}
        </div>
      )}

      {/* Conditions */}
      {permit.conditions && permit.conditions.length > 0 && (
        <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-700">
          <span className="font-medium">Conditions:</span> {permit.conditions.join(' | ')}
        </div>
      )}

      {/* Required Documents */}
      {permit.requiredDocuments && (
        <div className="mt-2">
          <div className="flex items-center gap-3 flex-wrap">
            {permit.requiredDocuments.map((doc, idx) => (
              <span key={idx} className={cn(
                'text-xs px-1.5 py-0.5 rounded flex items-center gap-1',
                doc.status === 'uploaded' ? 'bg-green-50 text-green-700' :
                doc.status === 'pending_review' ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-700'
              )}>
                {doc.status === 'uploaded' ? <CheckCircle className="h-3 w-3" /> :
                 doc.status === 'pending_review' ? <Clock className="h-3 w-3" /> :
                 <Upload className="h-3 w-3" />}
                {doc.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Dependencies */}
      {permit.scheduleDependencies && permit.scheduleDependencies.length > 0 && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
          <Link2 className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-700">
            {permit.scheduleDependencies.map((dep, idx) => (
              <p key={idx}>{dep}</p>
            ))}
          </div>
        </div>
      )}

      {/* AI Note */}
      {permit.aiNote && (
        <div className="mt-2 p-2 bg-indigo-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-indigo-700">{permit.aiNote}</span>
        </div>
      )}

      {permit.status === 'expired' && (
        <div className="mt-2 p-2 bg-red-50 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-red-700">Permit expired -- renewal required before dependent work can proceed</span>
        </div>
      )}
    </div>
  )
}

function TimelineStep({ step, isLast }: { step: typeof timelineSteps[0]; isLast: boolean }) {
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          step.status === 'completed' ? "bg-green-500 text-white" :
          step.status === 'current' ? "bg-blue-500 text-white" :
          "bg-gray-200 text-gray-400"
        )}>
          {step.status === 'completed' ? (
            <CheckCircle className="h-5 w-5" />
          ) : step.status === 'current' ? (
            <Clock className="h-5 w-5" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-gray-400" />
          )}
        </div>
        <span className={cn(
          "text-xs mt-1 whitespace-nowrap",
          step.status === 'completed' ? "text-green-600 font-medium" :
          step.status === 'current' ? "text-blue-600 font-medium" :
          "text-gray-400"
        )}>
          {step.label}
        </span>
      </div>
      {!isLast && (
        <div className={cn(
          "w-12 h-0.5 mx-1 -mt-5",
          step.status === 'completed' ? "bg-green-500" : "bg-gray-200"
        )} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PermitsPreview() {
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })

  const filteredPermits = sortItems(
    mockPermits.filter(permit => {
      if (!matchesSearch(permit, search, ['permitType', 'jurisdiction', 'permitNumber', 'inspector'])) return false
      if (activeTab !== 'all' && permit.status !== activeTab) return false
      if (jurisdictionFilter !== 'all' && permit.jurisdiction !== jurisdictionFilter) return false
      return true
    }),
    activeSort as keyof Permit | '',
    sortDirection,
  )

  // Stats
  const permitsNeeded = mockPermits.filter(p => p.status === 'not_applied' || p.status === 'draft').length
  const pendingApproval = mockPermits.filter(p => p.status === 'submitted' || p.status === 'under_review').length
  const issuedCount = mockPermits.filter(p => p.status === 'issued' || p.status === 'approved').length
  const expiredCount = mockPermits.filter(p => p.status === 'expired').length
  const onHoldCount = mockPermits.filter(p => p.status === 'on_hold').length
  const totalPermits = mockPermits.length
  const totalFeeEstimated = mockPermits.reduce((sum, p) => sum + p.feeEstimated, 0)
  const totalFeeActual = mockPermits.reduce((sum, p) => sum + (p.feeActual ?? 0), 0)
  const schedulingRisks = mockPermits.filter(p => p.scheduleDependencies && p.scheduleDependencies.length > 0 && p.status !== 'issued' && p.status !== 'approved').length

  const jurisdictions = [...new Set(mockPermits.map(p => p.jurisdiction))]
  const utilitiesComplete = mockUtilities.filter(u => u.status === 'completed' || u.status === 'transferred').length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Permits - Smith Residence</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{totalPermits} Total</span>
              {schedulingRisks > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {schedulingRisks} schedule risk{schedulingRisks > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {issuedCount} issued | {pendingApproval} pending | {permitsNeeded} not yet applied | CO: {mockCO.prerequisitesMet}/{mockCO.prerequisitesTotal} prerequisites met
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FileText className="h-4 w-4" />
              Needs Action
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {permitsNeeded}
              <span className="text-sm font-normal text-gray-500 ml-1">to apply</span>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Clock className="h-4 w-4" />
              Pending
            </div>
            <div className="text-xl font-bold text-amber-700 mt-1">{pendingApproval}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Issued
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{issuedCount}</div>
          </div>
          <div className={cn("rounded-lg p-3", expiredCount > 0 ? "bg-red-50" : "bg-gray-50")}>
            <div className={cn("flex items-center gap-2 text-sm", expiredCount > 0 ? "text-red-600" : "text-gray-500")}>
              <AlertTriangle className="h-4 w-4" />
              Expired
            </div>
            <div className={cn("text-xl font-bold mt-1", expiredCount > 0 ? "text-red-700" : "text-gray-900")}>{expiredCount}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Permit Fees
            </div>
            <div className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(totalFeeActual || totalFeeEstimated)}</div>
            <div className="text-xs text-blue-600">Est: {formatCurrency(totalFeeEstimated)}</div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Timer className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Electrical Permit Timeline</span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-blue-600">Under review - panel schedule pending</span>
        </div>
        <div className="flex items-start justify-between px-4">
          {timelineSteps.map((step, index) => (
            <TimelineStep key={step.id} step={step} isLast={index === timelineSteps.length - 1} />
          ))}
        </div>
      </div>

      {/* CO Tracking */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Certificate of Occupancy Progress</span>
          </div>
          <span className={cn(
            'text-xs px-2 py-1 rounded font-medium',
            mockCO.status === 'issued' ? 'bg-green-100 text-green-700' :
            mockCO.status === 'applied' ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          )}>
            {mockCO.prerequisitesMet}/{mockCO.prerequisitesTotal} Prerequisites Met
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(mockCO.prerequisitesMet / mockCO.prerequisitesTotal) * 100}%` }} />
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          {mockCO.conditions?.map((c, idx) => (
            <span key={idx} className="flex items-center gap-1">
              {idx < mockCO.prerequisitesMet ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Clock className="h-3 w-3 text-gray-400" />}
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Utility Connections */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Utility Final Connections</span>
          </div>
          <span className="text-xs text-gray-500">{utilitiesComplete}/{mockUtilities.length} complete</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {mockUtilities.map(util => {
            const UtilIcon = utilityIcons[util.utilityType]
            return (
              <div key={util.id} className={cn(
                'rounded-lg p-2 border text-center',
                util.status === 'completed' || util.status === 'transferred' ? 'bg-green-50 border-green-200' :
                util.status === 'scheduled' ? 'bg-blue-50 border-blue-200' :
                util.status === 'applied' ? 'bg-amber-50 border-amber-200' :
                'bg-gray-50 border-gray-200'
              )}>
                <UtilIcon className={cn(
                  'h-4 w-4 mx-auto mb-1',
                  util.status === 'completed' || util.status === 'transferred' ? 'text-green-600' :
                  util.status === 'scheduled' ? 'text-blue-600' :
                  util.status === 'applied' ? 'text-amber-600' : 'text-gray-400'
                )} />
                <p className="text-xs font-medium text-gray-700">{utilityLabels[util.utilityType]}</p>
                <p className="text-[10px] text-gray-500">{util.provider}</p>
                <p className={cn(
                  'text-[10px] font-medium mt-0.5',
                  util.status === 'completed' || util.status === 'transferred' ? 'text-green-600' :
                  util.status === 'scheduled' ? 'text-blue-600' :
                  util.status === 'applied' ? 'text-amber-600' : 'text-gray-400'
                )}>
                  {util.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search permits, jurisdictions, numbers..."
          tabs={[
            { key: 'all', label: 'All', count: mockPermits.length },
            { key: 'not_applied', label: 'Not Applied', count: mockPermits.filter(p => p.status === 'not_applied').length },
            { key: 'draft', label: 'Draft', count: mockPermits.filter(p => p.status === 'draft').length },
            { key: 'submitted', label: 'Submitted', count: mockPermits.filter(p => p.status === 'submitted').length },
            { key: 'under_review', label: 'Under Review', count: mockPermits.filter(p => p.status === 'under_review').length },
            { key: 'issued', label: 'Issued', count: mockPermits.filter(p => p.status === 'issued' || p.status === 'approved').length },
            { key: 'expired', label: 'Expired', count: expiredCount },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Jurisdictions',
              value: jurisdictionFilter,
              options: jurisdictions.map(j => ({ value: j, label: j })),
              onChange: (v) => setJurisdictionFilter(v),
            },
          ]}
          sortOptions={[
            { value: 'permitType', label: 'Permit Type' },
            { value: 'jurisdiction', label: 'Jurisdiction' },
            { value: 'applicationDate', label: 'Application Date' },
            { value: 'expirationDate', label: 'Expiration' },
            { value: 'status', label: 'Status' },
            { value: 'feeEstimated', label: 'Fee' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {} },
            { icon: Plus, label: 'Add Permit', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredPermits.length}
          totalCount={mockPermits.length}
        />
      </div>

      {/* Permits Grid */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredPermits.map(permit => (
              <PermitCard key={permit.id} permit={permit} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPermits.map(permit => (
              <PermitCard key={permit.id} permit={permit} />
            ))}
          </div>
        )}
        {filteredPermits.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No permits match the selected filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Permit Intelligence:</span>
          </div>
          <div className="space-y-1 text-sm text-amber-700">
            <p>&#x2022; HVAC permit needed in 18 days but avg approval is 21 days -- apply immediately to avoid schedule impact</p>
            <p>&#x2022; Electrical permit under review -- panel schedule needs revision. 85% likely approved by Feb 14</p>
            <p>&#x2022; Septic permit expired 25 days ago -- renewal blocks final inspection. DHEC renewal takes 5-7 business days</p>
            <p>&#x2022; County ROW permit backlogged. Recommend weekly status check with Public Works (843) 202-7600</p>
            <p>&#x2022; CO prerequisites: 4 of 9 met. Critical path items: expired septic renewal, pending electrical/HVAC permits</p>
          </div>
        </div>
      </div>
    </div>
  )
}
