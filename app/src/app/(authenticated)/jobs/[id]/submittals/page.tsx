import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, Search, Send } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Submittals' }

interface Submittal {
  id: string
  submittal_number: string | null
  title: string
  description: string | null
  spec_section: string | null
  submitted_to: string | null
  submission_date: string | null
  required_date: string | null
  status: string
  priority: string | null
  notes: string | null
  created_at: string
}

export default async function JobSubmittalsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { id: jobId } = await params
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
  if (!jobCheck) { notFound() }

  let submittalsQuery = supabase
    .from('submittals')
    .select('*', { count: 'exact' })
    .eq('job_id', jobId)
    .is('deleted_at', null)

  if (sp.search) {
    submittalsQuery = submittalsQuery.or(`submittal_number.ilike.%${sp.search}%,title.ilike.%${sp.search}%`)
  }

  const { data: submittalsData, count, error: submError } = await submittalsQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (submError) throw submError
  const submittals = (submittalsData || []) as Submittal[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const pending = submittals.filter((s) => s.status === 'pending' || s.status === 'submitted').length
  const approved = submittals.filter((s) => s.status === 'approved').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Submittals</h1>
          <p className="text-muted-foreground">{submittals.length} submittals &bull; {pending} pending &bull; {approved} approved</p>
        </div>
        <Link href={`/jobs/${jobId}/submittals/new`}><Button><Plus className="h-4 w-4 mr-2" />New Submittal</Button></Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search submittals..." aria-label="Search submittals" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            All Submittals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submittals.length > 0 ? (
            <div className="divide-y divide-border">
              {submittals.map((sub) => (
                <Link key={sub.id} href={`/jobs/${jobId}/submittals/${sub.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {sub.submittal_number && <span className="text-sm font-mono text-muted-foreground">{sub.submittal_number}</span>}
                        <span className="font-medium">{sub.title}</span>
                        <Badge className={getStatusColor(sub.status)}>{sub.status}</Badge>
                        {sub.priority && <Badge variant="outline" className="text-xs">{sub.priority}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {sub.spec_section && <span>Spec {sub.spec_section}</span>}
                        {sub.submitted_to && <span> &bull; To: {sub.submitted_to}</span>}
                        {sub.submission_date && <span> &bull; Submitted {formatDate(sub.submission_date)}</span>}
                        {sub.description && <span> &bull; {sub.description}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Send className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No submittals for this job</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${jobId}/submittals`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
