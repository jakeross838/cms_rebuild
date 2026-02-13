'use client'

import {
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface Job {
  id: string
  name: string
  client: string
  address: string
  status: 'pre-con' | 'active' | 'closeout' | 'complete'
  progress: number
  contractValue: number
  pmAssigned: string
  startDate: string
  expectedCompletion: string
  alert?: string
}

const mockJobs: Job[] = [
  {
    id: '1',
    name: 'Smith Residence',
    client: 'John & Sarah Smith',
    address: '1234 Ocean Dr, Wilmington, NC',
    status: 'active',
    progress: 65,
    contractValue: 850000,
    pmAssigned: 'Jake',
    startDate: '2024-01-15',
    expectedCompletion: '2024-08-30',
  },
  {
    id: '2',
    name: 'Johnson Beach House',
    client: 'Robert Johnson',
    address: '567 Coastal Way, Wrightsville Beach, NC',
    status: 'pre-con',
    progress: 12,
    contractValue: 1200000,
    pmAssigned: 'Mike',
    startDate: '2024-03-01',
    expectedCompletion: '2024-12-15',
    alert: 'Permit approval pending - expected 3 days',
  },
  {
    id: '3',
    name: 'Miller Addition',
    client: 'David Miller',
    address: '892 Pine Valley Rd, Leland, NC',
    status: 'closeout',
    progress: 95,
    contractValue: 250000,
    pmAssigned: 'Jake',
    startDate: '2023-09-10',
    expectedCompletion: '2024-02-28',
    alert: 'Final inspection scheduled for tomorrow',
  },
  {
    id: '4',
    name: 'Wilson Custom Home',
    client: 'Thomas Wilson',
    address: '445 Harbor View Ln, Southport, NC',
    status: 'active',
    progress: 38,
    contractValue: 1450000,
    pmAssigned: 'Sarah',
    startDate: '2024-02-01',
    expectedCompletion: '2024-11-30',
  },
  {
    id: '5',
    name: 'Davis Coastal Renovation',
    client: 'Michael Davis',
    address: '221 Marsh Landing, Carolina Beach, NC',
    status: 'complete',
    progress: 100,
    contractValue: 320000,
    pmAssigned: 'Jake',
    startDate: '2023-06-15',
    expectedCompletion: '2023-12-20',
  },
  {
    id: '6',
    name: 'Anderson Pool House',
    client: 'Karen Anderson',
    address: '778 Sunset Blvd, Kure Beach, NC',
    status: 'active',
    progress: 52,
    contractValue: 185000,
    pmAssigned: 'Mike',
    startDate: '2024-01-20',
    expectedCompletion: '2024-05-15',
  },
]

const statuses = [
  { id: 'pre-con', label: 'Pre-Con', color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
  { id: 'active', label: 'Active', color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'closeout', label: 'Closeout', color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
  { id: 'complete', label: 'Complete', color: 'bg-gray-500', bgLight: 'bg-gray-100', textColor: 'text-gray-700' },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  return '$' + (value / 1000).toFixed(0) + 'K'
}

function getStatusConfig(status: Job['status']) {
  return statuses.find(s => s.id === status) || statuses[0]
}

function JobCard({ job }: { job: Job }) {
  const statusConfig = getStatusConfig(job.status)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", statusConfig.bgLight)}>
            <Building2 className={cn("h-5 w-5", statusConfig.textColor)} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{job.name}</h4>
            <p className="text-sm text-gray-500">{job.client}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="truncate">{job.address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{formatCurrency(job.contractValue)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className={cn("text-xs font-medium", statusConfig.textColor)}>{job.progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", statusConfig.color)}
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-700">{job.pmAssigned[0]}</span>
          </div>
          <span className="text-sm text-gray-600">{job.pmAssigned}</span>
        </div>
        <span className={cn(
          "text-xs px-2 py-1 rounded font-medium",
          statusConfig.bgLight,
          statusConfig.textColor
        )}>
          {statusConfig.label}
        </span>
      </div>

      {job.alert && (
        <div className="mt-3 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{job.alert}</span>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  iconColor,
  iconBg,
}: {
  icon: typeof Building2
  label: string
  value: string
  subValue?: string
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

export function JobsListPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })

  const filtered = sortItems(
    mockJobs.filter(job => {
      if (!matchesSearch(job, search, ['name', 'client', 'address', 'pmAssigned'])) return false
      if (activeTab !== 'all' && job.status !== activeTab) return false
      return true
    }),
    activeSort as keyof Job | '',
    sortDirection,
  )

  // Calculate stats
  const totalJobs = mockJobs.length
  const totalContractValue = mockJobs.reduce((sum, job) => sum + job.contractValue, 0)
  const activeJobs = mockJobs.filter(job => job.status === 'active').length
  const preConJobs = mockJobs.filter(job => job.status === 'pre-con').length
  const closeoutJobs = mockJobs.filter(job => job.status === 'closeout').length
  const completeJobs = mockJobs.filter(job => job.status === 'complete').length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Jobs</h3>
          <span className="text-sm text-gray-500">{totalJobs} jobs | {formatCurrency(totalContractValue)} total value</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search jobs..."
          tabs={[
            { key: 'all', label: 'All Jobs', count: mockJobs.length },
            ...statuses.map(s => ({
              key: s.id,
              label: s.label,
              count: mockJobs.filter(j => j.status === s.id).length,
            })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'contractValue', label: 'Contract Value' },
            { value: 'progress', label: 'Progress' },
            { value: 'startDate', label: 'Start Date' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[{ icon: Plus, label: 'New Job', onClick: () => {}, variant: 'primary' }]}
          resultCount={filtered.length}
          totalCount={mockJobs.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-5 gap-4">
          <StatCard
            icon={Building2}
            label="Total Jobs"
            value={totalJobs.toString()}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={DollarSign}
            label="Total Contract Value"
            value={formatCurrency(totalContractValue)}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            icon={Clock}
            label="Pre-Construction"
            value={preConJobs.toString()}
            subValue="jobs"
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={TrendingUp}
            label="Active"
            value={activeJobs.toString()}
            subValue="in progress"
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            icon={CheckCircle2}
            label="Closeout / Complete"
            value={`${closeoutJobs} / ${completeJobs}`}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No jobs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span>Johnson Beach House permit likely approved by Thursday based on county patterns</span>
            <span>|</span>
            <span>Miller Addition on track for early completion - consider scheduling final walkthrough</span>
          </div>
        </div>
      </div>
    </div>
  )
}
