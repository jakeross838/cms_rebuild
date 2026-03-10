'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'

import {
  Search,
  ChevronRight,
  MapPin,
  Circle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Job {
  id: string
  name: string
  job_number: string | null
  status: string
  address: string | null
}

const statusColor: Record<string, string> = {
  active: 'text-emerald-500',
  pre_construction: 'text-blue-500',
  on_hold: 'text-amber-500',
  completed: 'text-stone-400',
  cancelled: 'text-red-400',
}

export function JobSelectorSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const currentJobId = params?.id as string | undefined
  const [search, setSearch] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchJobs() {
      const { data } = await supabase
        .from('jobs')
        .select('id, name, job_number, status, address')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(50)

      if (data) {
        setJobs(data as Job[])
      }
      setLoading(false)
    }

    fetchJobs()
  }, [])

  const filtered = jobs.filter((job) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      job.name.toLowerCase().includes(q) ||
      (job.job_number?.toLowerCase().includes(q)) ||
      (job.address?.toLowerCase().includes(q))
    )
  })

  return (
    <aside className="w-72 bg-card border-r border-border/40 flex flex-col overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-md bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
          />
        </div>
      </div>

      {/* Job list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading jobs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No jobs found</div>
        ) : (
          <div className="py-1">
            {filtered.map((job) => {
              const isActive = job.id === currentJobId
              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className={cn(
                    'flex items-start gap-2 px-3 py-2.5 transition-colors border-l-2',
                    isActive
                      ? 'bg-accent border-l-primary'
                      : 'border-l-transparent hover:bg-accent/50'
                  )}
                >
                  <Circle className={cn('h-2 w-2 mt-1.5 flex-shrink-0 fill-current', statusColor[job.status] || 'text-stone-400')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      {job.job_number && (
                        <span className="text-xs font-mono text-muted-foreground">{job.job_number}</span>
                      )}
                    </div>
                    <div className={cn(
                      'text-sm truncate',
                      isActive ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                    )}>
                      {job.name}
                    </div>
                    {job.address && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{job.address}</span>
                      </div>
                    )}
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
