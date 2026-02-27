import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Plus, ClipboardCheck, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { escapeLike, formatDate, getStatusColor } from '@/lib/utils'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Inspections' }

interface PermitInspection {
  id: string
  inspection_type: string
  status: string
  scheduled_date: string | null
  scheduled_time: string | null
  inspector_name: string | null
  inspector_phone: string | null
  is_reinspection: boolean
  completed_at: string | null
  notes: string | null
  permit_id: string
  created_at: string
}

export default async function JobInspectionsPage({
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
  const { companyId, supabase } = await getServerAuth()

  const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
  if (!jobCheck) { notFound() }

  let query = supabase
    .from('permit_inspections')
    .select('*', { count: 'exact' })
    .eq('job_id', jobId)
    .is('deleted_at', null)

  if (sp.search) {
    const searchTerm = `%${escapeLike(sp.search)}%`
    query = query.or(`inspection_type.ilike.${searchTerm},inspector_name.ilike.${searchTerm}`)
  }

  const { data: inspectionsData, count, error: inspError } = await query
    .order('scheduled_date', { ascending: true })
    .range(offset, offset + pageSize - 1)

  if (inspError) throw inspError
  const inspections = (inspectionsData || []) as PermitInspection[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const scheduled = inspections.filter((i) => i.status === 'scheduled').length
  const passed = inspections.filter((i) => i.status === 'passed').length
  const failed = inspections.filter((i) => i.status === 'failed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inspections</h1>
          <p className="text-muted-foreground">
            {inspections.length} inspections &bull; {scheduled} scheduled &bull; {passed} passed &bull; {failed} failed
          </p>
        </div>
        <Link href={`/jobs/${jobId}/inspections/new`}><Button><Plus className="h-4 w-4 mr-2" />Schedule Inspection</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search inspections..." aria-label="Search inspections" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            All Inspections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inspections.length > 0 ? (
            <div className="divide-y divide-border">
              {inspections.map((insp) => (
                <Link key={insp.id} href={`/jobs/${jobId}/inspections/${insp.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{insp.inspection_type}</span>
                        <Badge className={getStatusColor(insp.status)}>{insp.status}</Badge>
                        {insp.is_reinspection && <Badge className="text-amber-700 bg-amber-100">Re-inspection</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {insp.scheduled_date && `Scheduled ${formatDate(insp.scheduled_date)}`}
                        {insp.scheduled_time && ` at ${insp.scheduled_time}`}
                        {insp.inspector_name && ` • Inspector: ${insp.inspector_name}`}
                        {insp.completed_at && ` • Completed ${formatDate(insp.completed_at)}`}
                      </div>
                      {insp.notes && <p className="text-sm text-muted-foreground mt-1">{insp.notes}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No inspections scheduled for this job</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${jobId}/inspections`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
