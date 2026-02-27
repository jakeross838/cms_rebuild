import type { Metadata } from 'next'

import { TrendingUp, Briefcase } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatCurrency } from '@/lib/utils'

interface JobSummary {
  id: string
  name: string
  job_number: string | null
  status: string | null
  contract_amount: number | null
}

export const metadata: Metadata = { title: 'Profitability' }

export default async function ProfitabilityPage() {
  const { companyId, supabase } = await getServerAuth()

  const { data: jobsData, error } = await supabase
    .from('jobs')
    .select('id, name, job_number, status, contract_amount')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw error
  const jobs = (jobsData || []) as JobSummary[]

  const totalContract = jobs.reduce((sum, j) => sum + (j.contract_amount || 0), 0)
  const activeJobs = jobs.filter((j) => j.status === 'active' || j.status === 'in_progress')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profitability</h1>
        <p className="text-muted-foreground">Margin analysis across all jobs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Total Contract Value</p>
            <p className="text-2xl font-bold">{formatCurrency(totalContract)}</p>
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
            <p className="text-sm text-muted-foreground">Total Jobs</p>
            <p className="text-2xl font-bold">{jobs.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Profitability
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length > 0 ? (
            <div className="divide-y divide-border">
              {jobs.map((job) => (
                <div key={job.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {job.job_number && <span className="text-sm font-mono text-muted-foreground">{job.job_number}</span>}
                      <span className="font-medium">{job.name}</span>
                      {job.status && <Badge variant="outline" className="text-xs">{job.status}</Badge>}
                    </div>
                    <span className="font-medium">
                      {job.contract_amount ? formatCurrency(job.contract_amount) : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No jobs to analyze</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
