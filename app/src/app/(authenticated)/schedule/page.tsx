import type { Metadata } from 'next'
import Link from 'next/link'

import { Calendar, Building2, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatDate, getStatusColor } from '@/lib/utils'

interface JobScheduleRow {
  id: string
  name: string
  job_number: string | null
  status: string | null
  start_date: string | null
  target_completion: string | null
}

export const metadata: Metadata = { title: 'Schedule' }

export default async function SchedulePage() {
  const { companyId, supabase } = await getServerAuth()

  const { data: jobsData, error } = await supabase
    .from('jobs')
    .select('id, name, job_number, status, start_date, target_completion')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('start_date', { ascending: true, nullsFirst: false })
  if (error) throw error

  const jobs = (jobsData || []) as JobScheduleRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground">Company-wide project timeline</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Jobs schedule list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {jobs.length > 0 ? (
          <div className="divide-y divide-border">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}/schedule`}
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
                          {job.job_number && (
                            <span className="text-sm text-muted-foreground">
                              {job.job_number}
                            </span>
                          )}
                          <span className="font-medium text-foreground">
                            {job.name}
                          </span>
                          <Badge className={getStatusColor(job.status ?? 'active')}>
                            {(job.status ?? 'active').replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-foreground">
                      {job.start_date ? formatDate(job.start_date) : 'No start date'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {job.target_completion
                        ? `to ${formatDate(job.target_completion)}`
                        : 'No end date'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">No jobs scheduled</p>
            <p className="text-muted-foreground mb-4">
              Create jobs with start and end dates to see them here
            </p>
            <Link
              href="/jobs"
              className="text-sm font-medium text-primary hover:underline"
            >
              Go to Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
