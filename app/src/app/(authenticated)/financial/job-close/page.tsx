import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { CheckSquare, Briefcase } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface Job {
  id: string
  name: string
  job_number: string | null
  status: string | null
  contract_amount: number | null
  actual_completion: string | null
  target_completion: string | null
}

export const metadata: Metadata = { title: 'Job Close' }

export default async function JobClosePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: jobsData, error: jobsError } = await supabase
    .from('jobs')
    .select('id, name, job_number, status, contract_amount, actual_completion, target_completion')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .in('status', ['completed', 'warranty'])
    .order('actual_completion', { ascending: false })

  const { data: activeData, error: activeError } = await supabase
    .from('jobs')
    .select('id, name, job_number, status, contract_amount, actual_completion, target_completion')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .not('status', 'in', '("completed","warranty","cancelled")')
    .order('name', { ascending: true })

  if (jobsError) throw jobsError
  if (activeError) throw activeError
  const closedJobs = (jobsData || []) as Job[]
  const activeJobs = (activeData || []) as Job[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Job Close</h1>
        <p className="text-muted-foreground">Final reconciliation & CPA export</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Closed Jobs</p>
            <p className="text-2xl font-bold text-green-600">{closedJobs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Active Jobs</p>
            <p className="text-2xl font-bold">{activeJobs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Closed Contract Value</p>
            <p className="text-2xl font-bold">{formatCurrency(closedJobs.reduce((s, j) => s + (j.contract_amount || 0), 0))}</p>
          </CardContent>
        </Card>
      </div>

      {closedJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Closed Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {closedJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {job.job_number && <span className="text-sm font-mono text-muted-foreground">{job.job_number}</span>}
                      <span className="font-medium">{job.name}</span>
                      {job.status && <Badge className={getStatusColor(job.status)}>{job.status}</Badge>}
                    </div>
                    <div className="text-right">
                      {job.contract_amount && <span className="font-medium">{formatCurrency(job.contract_amount)}</span>}
                      {job.actual_completion && <p className="text-xs text-muted-foreground">Completed {formatDate(job.actual_completion)}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Jobs Pending Closeout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {activeJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {job.job_number && <span className="text-sm font-mono text-muted-foreground">{job.job_number}</span>}
                      <span className="font-medium">{job.name}</span>
                      {job.status && <Badge variant="outline" className="text-xs">{job.status}</Badge>}
                    </div>
                    {job.contract_amount && <span className="font-medium">{formatCurrency(job.contract_amount)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {closedJobs.length === 0 && activeJobs.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground mb-1">No jobs to close</p>
          <p className="text-muted-foreground">Jobs ready for final reconciliation will appear here</p>
        </div>
      )}
    </div>
  )
}
