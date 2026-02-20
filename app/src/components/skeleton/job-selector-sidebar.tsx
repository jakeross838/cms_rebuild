'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

// ── Mock job data ─────────────────────────────────────────────
// In production, this would come from API/context

interface Job {
  id: string
  name: string
  client: string
  address: string
  status: 'pre-con' | 'active' | 'closeout' | 'complete' | 'warranty'
}

const mockJobs: Job[] = [
  { id: '1', name: 'Smith Residence', client: 'John & Sarah Smith', address: '123 Ocean Blvd', status: 'active' },
  { id: '2', name: 'Johnson Beach House', client: 'Mike Johnson', address: '456 Gulf Dr', status: 'active' },
  { id: '3', name: 'Davis Coastal Home', client: 'Tom & Lisa Davis', address: '789 Bay View', status: 'pre-con' },
  { id: '4', name: 'Wilson Modern Build', client: 'James Wilson', address: '321 Pine St', status: 'active' },
  { id: '5', name: 'Anderson Renovation', client: 'Sarah Anderson', address: '555 Oak Ave', status: 'closeout' },
  { id: '6', name: 'Martinez Custom', client: 'Carlos Martinez', address: '777 Palm Blvd', status: 'warranty' },
  { id: '7', name: 'Thompson Estate', client: 'Robert Thompson', address: '888 Sunset Dr', status: 'complete' },
  { id: '8', name: 'Garcia Addition', client: 'Maria Garcia', address: '999 Beach Rd', status: 'active' },
  { id: '9', name: 'Brown Farmhouse', client: 'David Brown', address: '111 Country Ln', status: 'pre-con' },
  { id: '10', name: 'Lee Contemporary', client: 'Jennifer Lee', address: '222 Modern Way', status: 'active' },
]

// ── Status indicator colors ───────────────────────────────────

const statusColors: Record<Job['status'], string> = {
  'pre-con': 'bg-amber-500',
  'active': 'bg-green-500',
  'closeout': 'bg-sand-500',
  'complete': 'bg-stone-500',
  'warranty': 'bg-red-500',
}

const statusLabels: Record<Job['status'], string> = {
  'pre-con': 'Pre-Construction',
  'active': 'Active',
  'closeout': 'Closeout',
  'complete': 'Complete',
  'warranty': 'Warranty',
}

// ── Job selector sidebar component ────────────────────────────

export function JobSelectorSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const currentJobId = params.id as string

  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)
  const [hoveredJob, setHoveredJob] = useState<string | null>(null)

  // Extract the current page path (everything after /jobs/[id])
  // e.g., /skeleton/jobs/1/schedule -> /schedule
  const currentPagePath = pathname.replace(`/skeleton/jobs/${currentJobId}`, '') || ''

  // Filter jobs based on search
  const filteredJobs = mockJobs.filter(job =>
    job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Build href for a job - navigates to same page type
  const getJobHref = (jobId: string) => {
    return `/skeleton/jobs/${jobId}${currentPagePath}`
  }

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* ── Back to Jobs ── */}
      <div className="p-3 border-b border-border">
        <Link
          href="/skeleton/jobs"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
      </div>

      {/* ── New Job Button ── */}
      <div className="p-3 border-b border-border">
        <Link
          href="/skeleton/jobs/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Job
        </Link>
      </div>

      {/* ── Search ── */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent focus:bg-background"
          />
        </div>
      </div>

      {/* ── Jobs List Header ── */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:bg-muted/50"
      >
        <span>Jobs ({filteredJobs.length})</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* ── Jobs List ── */}
      {isExpanded && (
        <nav className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-0.5">
            {filteredJobs.map((job) => {
              const isCurrentJob = job.id === currentJobId
              const isHovered = hoveredJob === job.id

              return (
                <div key={job.id} className="relative">
                  <Link
                    href={getJobHref(job.id)}
                    onMouseEnter={() => setHoveredJob(job.id)}
                    onMouseLeave={() => setHoveredJob(null)}
                    className={cn(
                      'flex items-start gap-2 px-3 py-2 rounded-lg transition-colors',
                      isCurrentJob
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted/50 text-foreground'
                    )}
                  >
                    {/* Status indicator */}
                    <span
                      className={cn(
                        'mt-1.5 h-2 w-2 rounded-full flex-shrink-0',
                        statusColors[job.status]
                      )}
                      title={statusLabels[job.status]}
                    />

                    {/* Job info */}
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'text-sm font-medium truncate',
                        isCurrentJob && 'font-semibold'
                      )}>
                        {job.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {job.address}
                      </div>
                    </div>
                  </Link>

                  {/* ── Hover card with details ── */}
                  {isHovered && !isCurrentJob && (
                    <div className="absolute left-full top-0 ml-2 w-64 bg-popover border border-border rounded-lg shadow-lg p-3 z-50">
                      <div className="space-y-2">
                        <div>
                          <div className="font-semibold text-sm">{job.name}</div>
                          <div className="text-xs text-muted-foreground">{job.address}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('h-2 w-2 rounded-full', statusColors[job.status])} />
                          <span className="text-xs font-medium">{statusLabels[job.status]}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Client: {job.client}
                        </div>
                        <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                          Click to view {currentPagePath ? currentPagePath.slice(1).replace(/-/g, ' ') : 'overview'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filteredJobs.length === 0 && (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                No jobs found
              </div>
            )}
          </div>
        </nav>
      )}

      {/* ── Status Legend ── */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="text-xs font-medium text-muted-foreground mb-2">Status</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(statusLabels).slice(0, 4).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', statusColors[status as Job['status']])} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
