import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Compass, Briefcase } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface Job {
  id: string
  name: string
  job_number: string | null
  status: string | null
  address: string | null
  city: string | null
  state: string | null
  created_at: string | null
}

export default async function FeasibilityPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: jobsData } = await supabase
    .from('jobs')
    .select('id, name, job_number, status, address, city, state, created_at')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .eq('status', 'pre_construction')
    .order('created_at', { ascending: false })

  const jobs = (jobsData || []) as Job[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pre-Construction Feasibility</h1>
        <p className="text-muted-foreground">Lot analysis, zoning, and site due diligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Pre-Con Jobs</p>
            <p className="text-2xl font-bold">{jobs.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Jobs in Pre-Construction
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length > 0 ? (
            <div className="divide-y divide-border">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        {job.job_number && <span className="text-sm font-mono text-muted-foreground">{job.job_number}</span>}
                        <span className="font-medium">{job.name}</span>
                        {job.status && <Badge className={getStatusColor(job.status)}>{job.status.replace('_', ' ')}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 ml-6">
                        {[job.address, job.city, job.state].filter(Boolean).join(', ') || 'No address'}
                        {job.created_at && ` — Created ${formatDate(job.created_at)}`}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Compass className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No jobs in pre-construction phase</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
