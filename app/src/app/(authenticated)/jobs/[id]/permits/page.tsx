import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Plus, FileCheck, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { safeOrIlike, formatDate, getStatusColor } from '@/lib/utils'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Permits' }

interface Permit {
  id: string
  permit_number: string | null
  permit_type: string
  status: string
  jurisdiction: string | null
  applied_date: string | null
  issued_date: string | null
  expiration_date: string | null
  conditions: string | null
  notes: string | null
  created_at: string
}

export default async function JobPermitsPage({
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

  let permitsQuery = supabase
    .from('permits')
    .select('*', { count: 'exact' })
    .eq('job_id', jobId)
    .is('deleted_at', null)

  if (sp.search) {
    permitsQuery = permitsQuery.or(`permit_number.ilike.${safeOrIlike(sp.search)},permit_type.ilike.${safeOrIlike(sp.search)}`)
  }

  const { data: permitsData, count, error } = await permitsQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (error) throw error

  const permits = (permitsData || []) as Permit[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const active = permits.filter((p) => p.status === 'active' || p.status === 'issued').length
  const pending = permits.filter((p) => p.status === 'pending' || p.status === 'applied').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Permits</h1>
          <p className="text-muted-foreground">{permits.length} permits &bull; {active} active &bull; {pending} pending</p>
        </div>
        <Link href={`/jobs/${jobId}/permits/new`}><Button><Plus className="h-4 w-4 mr-2" />Add Permit</Button></Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search permits..." aria-label="Search permits" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            All Permits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {permits.length > 0 ? (
            <div className="divide-y divide-border">
              {permits.map((permit) => (
                <Link key={permit.id} href={`/jobs/${jobId}/permits/${permit.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {permit.permit_number && <span className="text-sm font-mono text-muted-foreground">#{permit.permit_number}</span>}
                        <span className="font-medium">{permit.permit_type}</span>
                        <Badge className={getStatusColor(permit.status)}>{permit.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {permit.jurisdiction && <span>{permit.jurisdiction}</span>}
                        {permit.applied_date && <span> &bull; Applied {formatDate(permit.applied_date)}</span>}
                        {permit.issued_date && <span> &bull; Issued {formatDate(permit.issued_date)}</span>}
                        {permit.expiration_date && <span> &bull; Expires {formatDate(permit.expiration_date)}</span>}
                      </div>
                      {permit.conditions && <p className="text-sm text-muted-foreground mt-1">{permit.conditions}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No permits tracked for this job</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${jobId}/permits`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
