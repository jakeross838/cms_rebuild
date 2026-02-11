'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Search,
  Building2,
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  X,
} from 'lucide-react'

interface Job {
  id: string
  name: string
  address: string
  status: 'active' | 'completed' | 'on-hold' | 'pre-construction'
  phase: string
  percentComplete: number
  clientName: string
}

// Mock jobs for the skeleton preview
const mockJobs: Job[] = [
  {
    id: '1',
    name: 'Smith Residence',
    address: '123 Ocean Blvd, Anna Maria',
    status: 'active',
    phase: 'Framing',
    percentComplete: 45,
    clientName: 'John & Sarah Smith',
  },
  {
    id: '2',
    name: 'Johnson Beach House',
    address: '456 Gulf Dr, Holmes Beach',
    status: 'active',
    phase: 'Foundation',
    percentComplete: 15,
    clientName: 'Mike Johnson',
  },
  {
    id: '3',
    name: 'Davis Coastal Home',
    address: '789 Bay View, Bradenton',
    status: 'active',
    phase: 'Interior Rough',
    percentComplete: 62,
    clientName: 'Tom & Lisa Davis',
  },
  {
    id: '4',
    name: 'Wilson Renovation',
    address: '321 Pine St, Bradenton',
    status: 'on-hold',
    phase: 'Permitting',
    percentComplete: 5,
    clientName: 'Sarah Wilson',
  },
  {
    id: '5',
    name: 'Miller Estate',
    address: '555 Waterfront Dr, Longboat Key',
    status: 'pre-construction',
    phase: 'Design',
    percentComplete: 0,
    clientName: 'Robert Miller',
  },
  {
    id: '6',
    name: 'Anderson Home',
    address: '888 Sunset Way, Anna Maria',
    status: 'completed',
    phase: 'Complete',
    percentComplete: 100,
    clientName: 'James Anderson',
  },
  {
    id: '7',
    name: 'Thompson Rebuild',
    address: '444 Canal Rd, Holmes Beach',
    status: 'active',
    phase: 'Drywall',
    percentComplete: 78,
    clientName: 'Carol Thompson',
  },
]

const statusConfig = {
  active: { label: 'Active', icon: Circle, color: 'text-green-500', bgColor: 'bg-green-50' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  'on-hold': { label: 'On Hold', icon: AlertCircle, color: 'text-amber-500', bgColor: 'bg-amber-50' },
  'pre-construction': { label: 'Pre-Con', icon: Clock, color: 'text-purple-500', bgColor: 'bg-purple-50' },
}

export function SkeletonJobFilter() {
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string[]>(['active', 'pre-construction', 'on-hold'])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.name.toLowerCase().includes(search.toLowerCase()) ||
      job.address.toLowerCase().includes(search.toLowerCase()) ||
      job.clientName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(job.status)
    return matchesSearch && matchesStatus
  })

  const groupedJobs = {
    active: filteredJobs.filter((j) => j.status === 'active'),
    'pre-construction': filteredJobs.filter((j) => j.status === 'pre-construction'),
    'on-hold': filteredJobs.filter((j) => j.status === 'on-hold'),
    completed: filteredJobs.filter((j) => j.status === 'completed'),
  }

  const toggleStatus = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Expand job filter"
        >
          <Building2 className="h-5 w-5 text-gray-500" />
        </button>
        <div className="mt-4 space-y-2">
          {mockJobs.filter(j => j.status === 'active').slice(0, 5).map((job) => (
            <button
              key={job.id}
              onClick={() => setSelectedJob(job.id)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                selectedJob === job.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
              title={job.name}
            >
              {job.name.charAt(0)}
            </button>
          ))}
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            Jobs
          </h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Collapse sidebar"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="mt-2 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Filter className="h-3.5 w-3.5" />
          Filter by status
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isFilterOpen && 'rotate-180')} />
        </button>

        {isFilterOpen && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                  statusFilter.includes(status)
                    ? `${config.bgColor} ${config.color}`
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                <config.icon className="h-3 w-3" />
                {config.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* All Jobs option */}
      <div className="px-2 py-2 border-b border-gray-100">
        <button
          onClick={() => setSelectedJob(null)}
          className={cn(
            'w-full px-3 py-2 rounded-lg text-sm text-left transition-colors flex items-center gap-2',
            selectedJob === null
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          All Jobs
          <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
            {mockJobs.length}
          </span>
        </button>
      </div>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedJobs).map(([status, jobs]) => {
          if (jobs.length === 0) return null
          const config = statusConfig[status as keyof typeof statusConfig]

          return (
            <div key={status} className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">
                <config.icon className={cn('h-3 w-3', config.color)} />
                {config.label}
                <span className="ml-auto">{jobs.length}</span>
              </div>
              <div className="space-y-0.5">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job.id)}
                    className={cn(
                      'w-full px-3 py-2.5 rounded-lg text-left transition-colors',
                      selectedJob === job.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className={cn(
                          'font-medium text-sm truncate',
                          selectedJob === job.id ? 'text-blue-700' : 'text-gray-900'
                        )}>
                          {job.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{job.address}</div>
                      </div>
                      {job.status === 'active' && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {job.percentComplete}%
                        </span>
                      )}
                    </div>
                    {job.status === 'active' && (
                      <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${job.percentComplete}%` }}
                        />
                      </div>
                    )}
                    <div className="mt-1 text-xs text-gray-400">
                      {job.phase}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Active: {groupedJobs.active.length}</span>
          <span>Pre-Con: {groupedJobs['pre-construction'].length}</span>
          <span>Completed: {groupedJobs.completed.length}</span>
        </div>
      </div>
    </aside>
  )
}
