import Link from 'next/link'

import { Plus, Search, Building2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import type { JobStatus } from '@/types/database'

interface JobWithClient {
  id: string
  name: string
  job_number: string | null
  status: string | null
  address: string | null
  city: string | null
  state: string | null
  contract_amount: number | null
  start_date: string | null
  clients: { name: string } | null
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select('*, clients(name)')
    .order('updated_at', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status as JobStatus)
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,job_number.ilike.%${params.search}%`)
  }

  const { data: jobsData } = await query
  const jobs = (jobsData || []) as JobWithClient[]

  const statusFilters = [
    { value: '', label: 'All Jobs' },
    { value: 'pre_construction', label: 'Pre-Construction' },
    { value: 'active', label: 'Active' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'warranty', label: 'Warranty' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
          <p className="text-muted-foreground">Manage your construction projects</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search jobs..."
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => (
            <Link
              key={filter.value}
              href={filter.value ? `/jobs?status=${filter.value}` : '/jobs'}
            >
              <Button
                variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'}
                size="sm"

              >
                {filter.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Jobs list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {jobs.length > 0 ? (
          <div className="divide-y divide-border">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {job.job_number ? <span className="text-sm text-muted-foreground">
                              {job.job_number}
                            </span> : null}
                          <span className="font-medium text-foreground">
                            {job.name}
                          </span>
                          <Badge className={getStatusColor(job.status ?? 'active')}>
                            {(job.status ?? 'active').replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {job.clients?.name || 'No client'} • {job.address ? `${job.city}, ${job.state}` : 'No address'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="font-medium text-foreground">
                      {formatCurrency(job.contract_amount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {job.start_date ? `Started ${formatDate(job.start_date)}` : 'Not started'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status
                ? 'Try adjusting your filters'
                : 'Get started by creating your first job'}
            </p>
            <Link href="/jobs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
