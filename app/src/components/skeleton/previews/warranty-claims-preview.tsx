'use client'

import { useState } from 'react'
import {
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Sparkles,
  AlertTriangle,
  Calendar,
  MapPin,
  Wrench,
  Camera,
  User,
  TrendingUp,
  Badge,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

type ClaimStatus = 'submitted' | 'evaluating' | 'in_progress' | 'resolved' | 'closed'
type Priority = 'emergency' | 'high' | 'normal' | 'low'
type IssueCategory = 'structural' | 'mep' | 'finish' | 'appliance' | 'exterior'

interface WarrantyClaim {
  id: string
  claimNumber: string
  clientName: string
  issueTitle: string
  category: IssueCategory
  priority: Priority
  status: ClaimStatus
  reportedAt: string
  location: string
  assignedVendor?: string
  photos: number
  satisfactionScore?: number
}

const mockClaims: WarrantyClaim[] = [
  {
    id: '1',
    claimNumber: 'CLM-2024-089',
    clientName: 'Smith Residence',
    issueTitle: 'Water leak in master bath ceiling',
    category: 'structural',
    priority: 'emergency',
    status: 'submitted',
    reportedAt: '2 hours ago',
    location: 'Master Bathroom',
    photos: 3,
  },
  {
    id: '2',
    claimNumber: 'CLM-2024-085',
    clientName: 'Johnson Family',
    issueTitle: 'HVAC not cooling properly',
    category: 'mep',
    priority: 'high',
    status: 'in_progress',
    reportedAt: '3 days ago',
    location: 'Main Floor',
    assignedVendor: 'ABC HVAC Services',
    photos: 2,
  },
  {
    id: '3',
    claimNumber: 'CLM-2024-082',
    clientName: 'Davis Home',
    issueTitle: 'Cabinet door alignment issue',
    category: 'finish',
    priority: 'normal',
    status: 'resolved',
    reportedAt: '6 days ago',
    location: 'Kitchen',
    assignedVendor: 'Cabinet Pros LLC',
    photos: 1,
    satisfactionScore: 95,
  },
  {
    id: '4',
    claimNumber: 'CLM-2024-081',
    clientName: 'Miller Property',
    issueTitle: 'Appliance door seal worn out',
    category: 'appliance',
    priority: 'normal',
    status: 'evaluating',
    reportedAt: '4 days ago',
    location: 'Kitchen',
    photos: 4,
  },
  {
    id: '5',
    claimNumber: 'CLM-2024-078',
    clientName: 'Taylor Estate',
    issueTitle: 'Window seal failure on west side',
    category: 'exterior',
    priority: 'high',
    status: 'in_progress',
    reportedAt: '10 days ago',
    location: 'Living Room',
    assignedVendor: 'Window Solutions Inc',
    photos: 5,
  },
  {
    id: '6',
    claimNumber: 'CLM-2024-075',
    clientName: 'Anderson Home',
    issueTitle: 'Electrical outlet not working',
    category: 'mep',
    priority: 'high',
    status: 'closed',
    reportedAt: '14 days ago',
    location: 'Bedroom #2',
    assignedVendor: 'Smith Electric',
    photos: 2,
    satisfactionScore: 88,
  },
]

const statusConfig: Record<ClaimStatus, { label: string; color: string; bgColor: string; textColor: string; icon: typeof AlertCircle }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', icon: Clock },
  evaluating: { label: 'Evaluating', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700', icon: XCircle },
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; textColor: string; icon: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: '🔴' },
  high: { label: 'High', color: 'bg-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-700', icon: '🟠' },
  normal: { label: 'Normal', color: 'bg-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-700', icon: '🔵' },
  low: { label: 'Low', color: 'bg-gray-400', bgColor: 'bg-gray-50', textColor: 'text-gray-600', icon: '⚪' },
}

const categoryConfig: Record<IssueCategory, { label: string; icon: typeof Wrench; color: string }> = {
  structural: { label: 'Structural', icon: AlertTriangle, color: 'text-red-600' },
  mep: { label: 'MEP', icon: Wrench, color: 'text-blue-600' },
  finish: { label: 'Finish', icon: Badge, color: 'text-purple-600' },
  appliance: { label: 'Appliance', icon: Badge, color: 'text-orange-600' },
  exterior: { label: 'Exterior', icon: Badge, color: 'text-green-600' },
}

function ClaimCard({ claim }: { claim: WarrantyClaim }) {
  const status = statusConfig[claim.status]
  const priority = priorityConfig[claim.priority]
  const category = categoryConfig[claim.category]
  const StatusIcon = status.icon
  const CategoryIcon = category.icon

  return (
    <div className={cn(
      'bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer',
      claim.priority === 'emergency' ? 'border-red-300 bg-red-50' :
      claim.priority === 'high' ? 'border-orange-200' :
      'border-gray-200'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-gray-600">{priority.icon}</span>
            <span className="font-semibold text-gray-900">{claim.claimNumber}</span>
            <span className="text-sm text-gray-500">— {claim.issueTitle}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
            <span>{claim.clientName}</span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{claim.location}</span>
            </div>
            <span className="text-gray-300">•</span>
            <span>{claim.reportedAt}</span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={cn('text-xs px-2 py-1 rounded font-medium flex items-center gap-1', status.bgColor, status.textColor)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
        <span className={cn('text-xs px-2 py-1 rounded font-medium', priority.bgColor, priority.textColor)}>
          {priority.label} Priority
        </span>
        <span className={cn('text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-700 flex items-center gap-1')}>
          <CategoryIcon className="h-3 w-3" />
          {category.label}
        </span>
        {claim.assignedVendor && (
          <span className={cn('text-xs px-2 py-1 rounded font-medium bg-blue-50 text-blue-700 flex items-center gap-1')}>
            <User className="h-3 w-3" />
            {claim.assignedVendor}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {claim.photos > 0 && (
            <div className="flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" />
              <span>{claim.photos} photo{claim.photos !== 1 ? 's' : ''}</span>
            </div>
          )}
          {claim.assignedVendor && claim.status !== 'submitted' && (
            <div className="flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5" />
              <span>Assigned</span>
            </div>
          )}
        </div>
        {claim.satisfactionScore !== undefined && (
          <span className={cn('text-xs font-medium px-2 py-1 rounded', claim.satisfactionScore >= 90 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>
            {claim.satisfactionScore}% satisfied
          </span>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  subValue,
  iconColor,
  iconBg,
  icon: Icon,
}: {
  label: string
  value: string | number
  subValue?: string
  iconColor: string
  iconBg: string
  icon: typeof AlertCircle
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

export function WarrantyClaimsPreview() {
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({})

  // Filter claims
  const filteredClaims = sortItems(
    mockClaims.filter(claim => {
      if (!matchesSearch(claim, search, ['claimNumber', 'issueTitle', 'clientName'])) return false
      if (activeTab !== 'all' && claim.status !== activeTab) return false
      if (priorityFilter !== 'all' && claim.priority !== priorityFilter) return false
      return true
    }),
    activeSort as keyof WarrantyClaim | '',
    sortDirection,
  )

  // Calculate stats
  const totalClaims = mockClaims.length
  const openClaims = mockClaims.filter(c => c.status === 'submitted' || c.status === 'evaluating').length
  const inProgressClaims = mockClaims.filter(c => c.status === 'in_progress').length
  const resolvedClaims = mockClaims.filter(c => c.status === 'resolved').length
  const emergencyClaims = mockClaims.filter(c => c.priority === 'emergency').length

  const avgResolutionDays = 4.2
  const avgSatisfaction = 92

  const priorities: Priority[] = ['emergency', 'high', 'normal', 'low']

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900">Warranty Claims</h3>
          <p className="text-sm text-gray-500">{totalClaims} claims | {openClaims} open | {inProgressClaims} in progress</p>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search claims..."
          tabs={[
            { key: 'all', label: 'All', count: totalClaims },
            { key: 'submitted', label: 'Submitted', count: mockClaims.filter(c => c.status === 'submitted').length },
            { key: 'evaluating', label: 'Evaluating', count: mockClaims.filter(c => c.status === 'evaluating').length },
            { key: 'in_progress', label: 'In Progress', count: mockClaims.filter(c => c.status === 'in_progress').length },
            { key: 'resolved', label: 'Resolved', count: mockClaims.filter(c => c.status === 'resolved').length },
            { key: 'closed', label: 'Closed', count: mockClaims.filter(c => c.status === 'closed').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Priorities',
              value: priorityFilter,
              options: priorities.map(p => ({ value: p, label: priorityConfig[p].label })),
              onChange: (v) => setPriorityFilter(v as Priority | 'all'),
            },
          ]}
          sortOptions={[
            { value: 'claimNumber', label: 'Claim #' },
            { value: 'clientName', label: 'Client' },
            { value: 'priority', label: 'Priority' },
            { value: 'reportedAt', label: 'Reported' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[{ icon: Plus, label: 'New Claim', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredClaims.length}
          totalCount={mockClaims.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-6 gap-3">
          <StatCard
            icon={AlertCircle}
            label="Open Claims"
            value={openClaims}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={Clock}
            label="In Progress"
            value={inProgressClaims}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
          />
          <StatCard
            icon={CheckCircle2}
            label="Resolved"
            value={resolvedClaims}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Resolution"
            value={`${avgResolutionDays}d`}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <StatCard
            icon={AlertTriangle}
            label="Emergency"
            value={emergencyClaims}
            subValue="requires urgent attention"
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
          <StatCard
            icon={Badge}
            label="Satisfaction"
            value={`${avgSatisfaction}%`}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
        </div>
      </div>

      {/* Claims List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredClaims.length > 0 ? (
          filteredClaims.map(claim => (
            <ClaimCard key={claim.id} claim={claim} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No warranty claims found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Timeline Tracking Section */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900 text-sm">Claim Timeline</h4>
        </div>
        <div className="space-y-2">
          {[
            { phase: 'Reported', date: 'Jan 28', color: 'bg-blue-500' },
            { phase: 'Evaluated', date: 'Jan 29', color: 'bg-amber-500' },
            { phase: 'Assigned', date: 'Jan 30', color: 'bg-orange-500' },
            { phase: 'Resolved', date: 'Feb 02', color: 'bg-green-500' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={cn('h-2 w-2 rounded-full', item.color)} />
              <span className="text-xs text-gray-600">{item.phase}</span>
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Pattern Detection */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-blue-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm text-blue-900">AI Pattern Detection:</span>
          </div>
          <div className="space-y-1 text-sm text-blue-800">
            <p>• 3 window seal failures this quarter (same batch 2023-B) — recommend proactive inspection of all affected units</p>
            <p>• HVAC cooling issues spike in warm months — allocate more vendor capacity April-September</p>
            <p>• Cabinet adjustments resolve 95% of alignment issues — schedule routine adjustments at 6-month mark</p>
          </div>
        </div>
      </div>
    </div>
  )
}
