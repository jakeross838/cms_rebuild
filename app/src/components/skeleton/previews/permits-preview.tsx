'use client'

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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface Permit {
  id: string
  permitType: string
  jurisdiction: string
  applicationDate: string | null
  expectedApproval: string | null
  expirationDate: string | null
  status: 'not_applied' | 'pending' | 'approved' | 'expired'
  permitNumber?: string
  inspector?: string
  notes?: string
  aiNote?: string
}

const mockPermits: Permit[] = [
  {
    id: '1',
    permitType: 'Building Permit',
    jurisdiction: 'City of Charleston',
    applicationDate: '2024-01-08',
    expectedApproval: '2024-02-15',
    expirationDate: '2025-02-15',
    status: 'approved',
    permitNumber: 'BP-2024-0842',
    inspector: 'John Mitchell',
  },
  {
    id: '2',
    permitType: 'Electrical Permit',
    jurisdiction: 'City of Charleston',
    applicationDate: '2024-01-15',
    expectedApproval: '2024-02-20',
    expirationDate: null,
    status: 'pending',
    inspector: 'Sarah Johnson',
    aiNote: 'Similar permits averaging 28 days - expect approval by Feb 12',
  },
  {
    id: '3',
    permitType: 'Plumbing Permit',
    jurisdiction: 'City of Charleston',
    applicationDate: '2024-01-15',
    expectedApproval: '2024-02-18',
    expirationDate: null,
    status: 'pending',
    inspector: 'Mike Roberts',
  },
  {
    id: '4',
    permitType: 'HVAC Permit',
    jurisdiction: 'City of Charleston',
    applicationDate: null,
    expectedApproval: null,
    expirationDate: null,
    status: 'not_applied',
    aiNote: 'Recommend applying now - avg 21 day approval, framing complete in 18 days',
  },
  {
    id: '5',
    permitType: 'Coastal Construction',
    jurisdiction: 'SC DHEC-OCRM',
    applicationDate: '2023-11-15',
    expectedApproval: '2024-01-20',
    expirationDate: '2025-01-20',
    status: 'approved',
    permitNumber: 'OCRM-2023-5621',
    inspector: 'Regional Office',
  },
  {
    id: '6',
    permitType: 'Septic System',
    jurisdiction: 'SC DHEC',
    applicationDate: '2023-12-01',
    expectedApproval: '2024-01-15',
    expirationDate: '2024-07-15',
    status: 'expired',
    permitNumber: 'SEP-2023-1847',
    notes: 'Requires renewal before final inspection',
    aiNote: 'Expired 30 days ago - renewal typically takes 5-7 business days',
  },
  {
    id: '7',
    permitType: 'Fire Sprinkler',
    jurisdiction: 'Charleston Fire Dept',
    applicationDate: null,
    expectedApproval: null,
    expirationDate: null,
    status: 'not_applied',
  },
  {
    id: '8',
    permitType: 'Driveway/ROW',
    jurisdiction: 'Charleston County',
    applicationDate: '2024-02-01',
    expectedApproval: '2024-03-01',
    expirationDate: null,
    status: 'pending',
    aiNote: 'County backlogged - may take 35-40 days vs typical 21',
  },
]

const statusConfig = {
  not_applied: { label: 'Not Applied', color: 'bg-gray-100 text-gray-700', icon: FileText },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const timelineSteps = [
  { id: 'apply', label: 'Apply', status: 'completed' },
  { id: 'review', label: 'Under Review', status: 'completed' },
  { id: 'corrections', label: 'Corrections', status: 'current' },
  { id: 'approved', label: 'Approved', status: 'pending' },
  { id: 'inspections', label: 'Inspections', status: 'pending' },
  { id: 'final', label: 'Final', status: 'pending' },
]

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const today = new Date()
  const diffTime = target.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function PermitCard({ permit }: { permit: Permit }) {
  const statusInfo = statusConfig[permit.status]
  const StatusIcon = statusInfo.icon
  const daysUntilExpiration = permit.expirationDate ? getDaysUntil(permit.expirationDate) : null
  const daysUntilApproval = permit.expectedApproval ? getDaysUntil(permit.expectedApproval) : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
        </div>
        {permit.permitNumber && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="font-mono">{permit.permitNumber}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 pt-3 border-t border-gray-100">
        <div>
          <span className="text-gray-400">Applied</span>
          <p className="font-medium text-gray-700">{formatDate(permit.applicationDate)}</p>
        </div>
        <div>
          <span className="text-gray-400">Expected Approval</span>
          <p className={cn(
            "font-medium",
            permit.status === 'pending' && daysUntilApproval !== null && daysUntilApproval <= 7
              ? "text-amber-600"
              : "text-gray-700"
          )}>
            {formatDate(permit.expectedApproval)}
            {permit.status === 'pending' && daysUntilApproval !== null && (
              <span className="text-gray-400 ml-1">({daysUntilApproval}d)</span>
            )}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Expiration</span>
          <p className={cn(
            "font-medium",
            permit.status === 'expired' ? "text-red-600" :
            daysUntilExpiration !== null && daysUntilExpiration <= 30 ? "text-amber-600" : "text-gray-700"
          )}>
            {formatDate(permit.expirationDate)}
            {daysUntilExpiration !== null && daysUntilExpiration > 0 && daysUntilExpiration <= 30 && (
              <span className="text-amber-500 ml-1">({daysUntilExpiration}d)</span>
            )}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Inspector</span>
          <p className="font-medium text-gray-700">{permit.inspector || '-'}</p>
        </div>
      </div>

      {permit.aiNote && (
        <div className="mt-3 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{permit.aiNote}</span>
        </div>
      )}

      {permit.status === 'expired' && (
        <div className="mt-3 p-2 bg-red-50 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-red-700">Permit expired - renewal required</span>
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

export function PermitsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })

  const filteredPermits = sortItems(
    mockPermits.filter(permit => {
      if (!matchesSearch(permit, search, ['permitType', 'jurisdiction', 'permitNumber', 'inspector'])) return false
      if (activeTab !== 'all' && permit.status !== activeTab) return false
      return true
    }),
    activeSort as keyof Permit | '',
    sortDirection,
  )

  // Calculate quick stats
  const permitsNeeded = mockPermits.filter(p => p.status === 'not_applied').length
  const pendingApproval = mockPermits.filter(p => p.status === 'pending').length
  const approvedCount = mockPermits.filter(p => p.status === 'approved').length
  const expiredCount = mockPermits.filter(p => p.status === 'expired').length
  const totalPermits = mockPermits.length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Permits - Smith Residence</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{totalPermits} Total</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {approvedCount} approved | {pendingApproval} pending | {permitsNeeded} not yet applied
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FileText className="h-4 w-4" />
              Permits Needed
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {permitsNeeded}
              <span className="text-sm font-normal text-gray-500 ml-1">to apply</span>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Clock className="h-4 w-4" />
              Pending Approval
            </div>
            <div className="text-xl font-bold text-amber-700 mt-1">{pendingApproval}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Approved
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{approvedCount}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            expiredCount > 0 ? "bg-red-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              expiredCount > 0 ? "text-red-600" : "text-gray-500"
            )}>
              <AlertTriangle className="h-4 w-4" />
              Expired/Action Needed
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              expiredCount > 0 ? "text-red-700" : "text-gray-900"
            )}>
              {expiredCount}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Timer className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Building Permit Timeline</span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-blue-600">Currently in corrections review</span>
        </div>
        <div className="flex items-start justify-between px-4">
          {timelineSteps.map((step, index) => (
            <TimelineStep
              key={step.id}
              step={step}
              isLast={index === timelineSteps.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search permits..."
          tabs={[
            { key: 'all', label: 'All', count: mockPermits.length },
            { key: 'not_applied', label: 'Not Applied', count: permitsNeeded },
            { key: 'pending', label: 'Pending', count: pendingApproval },
            { key: 'approved', label: 'Approved', count: approvedCount },
            { key: 'expired', label: 'Expired', count: expiredCount },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'permitType', label: 'Permit Type' },
            { value: 'jurisdiction', label: 'Jurisdiction' },
            { value: 'applicationDate', label: 'Application Date' },
            { value: 'status', label: 'Status' },
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
      <div className="p-4 max-h-96 overflow-y-auto">
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
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700 flex-wrap">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              HVAC permit needed in 18 days
            </span>
            <span>|</span>
            <span>Electrical permit 85% likely approved by Feb 12</span>
            <span>|</span>
            <span>Septic renewal urgent - schedule may be impacted</span>
          </div>
        </div>
      </div>
    </div>
  )
}
