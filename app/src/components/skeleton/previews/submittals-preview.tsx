'use client'

import { useState } from 'react'
import {
  Plus,
  Download,
  MoreHorizontal,
  FileText,
  Clock,
  Calendar,
  Building2,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  ClipboardList,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

type SubmittalStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected'

interface Submittal {
  id: string
  number: string
  description: string
  specSection: string
  vendor: string
  dateSubmitted: string
  daysInReview: number
  status: SubmittalStatus
  aiNote?: string
}

const mockSubmittals: Submittal[] = [
  {
    id: '1',
    number: 'SUB-001',
    description: 'Impact-rated aluminum storefront system',
    specSection: '08 41 13 - Aluminum Storefronts',
    vendor: 'PGT Industries',
    dateSubmitted: '2024-11-28',
    daysInReview: 14,
    status: 'under_review',
    aiNote: 'Review exceeds typical 10-day cycle - follow up recommended',
  },
  {
    id: '2',
    number: 'SUB-002',
    description: 'Structural steel shop drawings',
    specSection: '05 12 00 - Structural Steel',
    vendor: 'Gulf Coast Steel',
    dateSubmitted: '2024-11-25',
    daysInReview: 17,
    status: 'approved',
  },
  {
    id: '3',
    number: 'SUB-003',
    description: 'Kitchen cabinet elevations and materials',
    specSection: '06 41 00 - Custom Casework',
    vendor: 'Custom Cabinet Co',
    dateSubmitted: '2024-12-02',
    daysInReview: 10,
    status: 'under_review',
    aiNote: 'Vendor historically requires 2 revision cycles',
  },
  {
    id: '4',
    number: 'SUB-004',
    description: 'HVAC equipment cut sheets and specs',
    specSection: '23 05 00 - HVAC',
    vendor: 'Cool Air HVAC',
    dateSubmitted: '2024-12-05',
    daysInReview: 7,
    status: 'submitted',
  },
  {
    id: '5',
    number: 'SUB-005',
    description: 'Roofing system and underlayment details',
    specSection: '07 31 00 - Shingles',
    vendor: 'ABC Roofing Supply',
    dateSubmitted: '2024-12-08',
    daysInReview: 4,
    status: 'approved',
  },
  {
    id: '6',
    number: 'SUB-006',
    description: 'Plumbing fixtures and trim selections',
    specSection: '22 40 00 - Plumbing Fixtures',
    vendor: 'Jones Plumbing Supply',
    dateSubmitted: '2024-12-10',
    daysInReview: 2,
    status: 'pending',
    aiNote: 'Owner selection meeting scheduled for Dec 15',
  },
  {
    id: '7',
    number: 'SUB-007',
    description: 'Exterior paint colors and finish schedule',
    specSection: '09 91 00 - Painting',
    vendor: 'Sherwin-Williams',
    dateSubmitted: '2024-11-20',
    daysInReview: 22,
    status: 'rejected',
    aiNote: 'Rejected: Colors do not match HOA requirements',
  },
  {
    id: '8',
    number: 'SUB-008',
    description: 'Electrical panel schedules',
    specSection: '26 24 00 - Switchboards',
    vendor: 'Smith Electric',
    dateSubmitted: '2024-12-01',
    daysInReview: 11,
    status: 'under_review',
  },
]

const statusConfig: Record<SubmittalStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: FileText },
  submitted: { label: 'Submitted', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Send },
  under_review: { label: 'Under Review', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Eye },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
}

const specSections = [...new Set(mockSubmittals.map(s => s.specSection))]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function SubmittalCard({ submittal }: { submittal: Submittal }) {
  const statusInfo = statusConfig[submittal.status]
  const StatusIcon = statusInfo.icon

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold text-gray-900">{submittal.number}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", statusInfo.bgColor, statusInfo.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{submittal.description}</p>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Hash className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs">{submittal.specSection}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Building2 className="h-3.5 w-3.5 text-gray-400" />
          <span>{submittal.vendor}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(submittal.dateSubmitted)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span className={cn(
            submittal.daysInReview > 14 ? "text-red-600 font-medium" :
            submittal.daysInReview > 10 ? "text-amber-600 font-medium" :
            "text-gray-500"
          )}>
            {submittal.daysInReview} days in review
          </span>
        </div>
      </div>

      {submittal.aiNote && (
        <div className={cn(
          "mt-3 p-2 rounded-md flex items-start gap-2",
          submittal.status === 'rejected' ? "bg-red-50" : "bg-amber-50"
        )}>
          <Sparkles className={cn(
            "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
            submittal.status === 'rejected' ? "text-red-500" : "text-amber-500"
          )} />
          <span className={cn(
            "text-xs",
            submittal.status === 'rejected' ? "text-red-700" : "text-amber-700"
          )}>{submittal.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function SubmittalsPreview() {
  const [specFilter, setSpecFilter] = useState<string>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()

  const filteredSubmittals = sortItems(
    mockSubmittals.filter(s => {
      if (!matchesSearch(s, search, ['number', 'description', 'vendor', 'specSection'])) return false
      if (activeTab !== 'all' && s.status !== activeTab) return false
      if (specFilter !== 'all' && s.specSection !== specFilter) return false
      return true
    }),
    activeSort as keyof Submittal | '',
    sortDirection,
  )

  // Calculate quick stats
  const totalSubmittals = mockSubmittals.length
  const pendingReview = mockSubmittals.filter(s =>
    s.status === 'pending' || s.status === 'submitted' || s.status === 'under_review'
  ).length
  const approvedCount = mockSubmittals.filter(s => s.status === 'approved').length
  const avgDaysInReview = Math.round(
    mockSubmittals.reduce((sum, s) => sum + s.daysInReview, 0) / mockSubmittals.length
  )
  const overdueCount = mockSubmittals.filter(s =>
    s.daysInReview > 14 && s.status !== 'approved' && s.status !== 'rejected'
  ).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Submittals - Smith Residence</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{totalSubmittals} Total</span>
          <span className="text-sm text-gray-500">{approvedCount} approved | {pendingReview} pending review</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search submittals..."
          tabs={[
            { key: 'all', label: 'All', count: mockSubmittals.length },
            { key: 'pending', label: 'Pending', count: mockSubmittals.filter(s => s.status === 'pending').length },
            { key: 'submitted', label: 'Submitted', count: mockSubmittals.filter(s => s.status === 'submitted').length },
            { key: 'under_review', label: 'Under Review', count: mockSubmittals.filter(s => s.status === 'under_review').length },
            { key: 'approved', label: 'Approved', count: mockSubmittals.filter(s => s.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: mockSubmittals.filter(s => s.status === 'rejected').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Sections',
              value: specFilter,
              options: specSections.map(s => ({ value: s, label: s.split(' - ')[0] })),
              onChange: setSpecFilter,
            },
          ]}
          sortOptions={[
            { value: 'number', label: 'Submittal #' },
            { value: 'dateSubmitted', label: 'Date Submitted' },
            { value: 'daysInReview', label: 'Days in Review' },
            { value: 'vendor', label: 'Vendor' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {} },
            { icon: Plus, label: 'New Submittal', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredSubmittals.length}
          totalCount={mockSubmittals.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <ClipboardList className="h-4 w-4" />
              Total Submittals
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalSubmittals}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Clock className="h-4 w-4" />
              Pending Review
            </div>
            <div className="text-xl font-bold text-amber-700 mt-1">{pendingReview}</div>
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
            overdueCount > 0 ? "bg-red-50" : "bg-blue-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              overdueCount > 0 ? "text-red-600" : "text-blue-600"
            )}>
              {overdueCount > 0 ? <AlertTriangle className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {overdueCount > 0 ? 'Overdue (>14 days)' : 'Avg Review Time'}
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              overdueCount > 0 ? "text-red-700" : "text-blue-700"
            )}>
              {overdueCount > 0 ? overdueCount : `${avgDaysInReview} days`}
            </div>
          </div>
        </div>
      </div>

      {/* Submittals Grid */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredSubmittals.map(submittal => (
          <SubmittalCard key={submittal.id} submittal={submittal} />
        ))}
        {filteredSubmittals.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-400">
            No submittals match the selected filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Review Patterns:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700 flex-wrap">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {overdueCount} submittal{overdueCount !== 1 ? 's' : ''} exceeding 14-day review cycle
            </span>
            <span>|</span>
            <span>Architect avg response: 8.5 days</span>
            <span>|</span>
            <span>Custom Cabinet Co typically needs 2 revision cycles</span>
          </div>
        </div>
      </div>
    </div>
  )
}
