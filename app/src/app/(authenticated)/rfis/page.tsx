import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, FileQuestion, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatDate, getStatusColor } from '@/lib/utils'

interface RfiRow {
  id: string
  rfi_number: string | null
  subject: string
  status: string
  priority: string | null
  due_date: string | null
  job_id: string | null
  created_at: string
  jobs: { name: string } | null
}

export const metadata: Metadata = { title: 'RFIs' }

export default async function RfisPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string; sort?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    subject: { column: 'subject', ascending: true },
    status: { column: 'status', ascending: true },
    due_date: { column: 'due_date', ascending: true },
  }
  const sort = sortMap[params.sort || ''] || { column: 'created_at', ascending: false }

  let query = supabase
    .from('rfis')
    .select('*, jobs(name)', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order(sort.column, { ascending: sort.ascending })

  if (params.search) {
    query = query.or(`subject.ilike.%${escapeLike(params.search)}%,rfi_number.ilike.%${escapeLike(params.search)}%`)
  }

  if (params.status) {
    query = query.eq('status', params.status)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: rfisData, count, error } = await query
  if (error) throw error
  const rfis = (rfisData || []) as RfiRow[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">RFIs</h1>
          <p className="text-muted-foreground">{count || 0} total RFIs</p>
        </div>
        <Link href="/rfis/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New RFI
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search RFIs..." aria-label="Search RFIs" defaultValue={params.search} className="pl-10" /></form>
      </div>

      {/* Sort */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground self-center">Sort:</span>
        {[
          { value: '', label: 'Newest' },
          { value: 'subject', label: 'Subject' },
          { value: 'status', label: 'Status' },
          { value: 'due_date', label: 'Due Date' },
        ].map((s) => {
          const sp = new URLSearchParams()
          if (params.search) sp.set('search', params.search)
          if (params.status) sp.set('status', params.status)
          if (s.value) sp.set('sort', s.value)
          if (params.page) sp.set('page', params.page)
          const qs = sp.toString()
          return (
            <Link key={s.value} href={`/rfis${qs ? `?${qs}` : ''}`}>
              <Button variant={(params.sort || '') === s.value ? 'default' : 'outline'} size="sm">
                {s.label}
              </Button>
            </Link>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            Requests for Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rfis.length > 0 ? (
            <div className="divide-y divide-border">
              {rfis.map((rfi) => (
                <Link
                  key={rfi.id}
                  href={`/rfis/${rfi.id}`}
                  className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {rfi.rfi_number && (
                          <span className="text-xs font-mono text-muted-foreground">{rfi.rfi_number}</span>
                        )}
                        <span className="font-medium">{rfi.subject}</span>
                        <Badge className={getStatusColor(rfi.status)}>{rfi.status.replace('_', ' ')}</Badge>
                        {rfi.priority === 'high' && (
                          <Badge className="bg-red-100 text-red-700 rounded">High</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {rfi.jobs?.name && <span>{rfi.jobs.name}</span>}
                        {rfi.due_date && <span>Due: {formatDate(rfi.due_date)}</span>}
                        <span>Created: {formatDate(rfi.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileQuestion className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No RFIs yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create an RFI to track requests for information</p>
              <Link href="/rfis/new" className="text-sm font-medium text-primary hover:underline">Create your first RFI</Link>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/rfis" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
