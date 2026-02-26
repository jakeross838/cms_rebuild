import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, MessageSquare, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'RFIs' }

interface RFI {
  id: string
  rfi_number: string | null
  subject: string | null
  question: string | null
  status: string | null
  priority: string | null
  category: string | null
  due_date: string | null
  created_at: string | null
  answered_at: string | null
}

export default async function RFIsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { id } = await params
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

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, name')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (jobError || !job) {
    notFound()
  }

  let rfiQuery = supabase
    .from('rfis')
    .select('*', { count: 'exact' })
    .eq('job_id', id)
    .is('deleted_at', null)

  if (sp.search) {
    rfiQuery = rfiQuery.or(`rfi_number.ilike.%${sp.search}%,subject.ilike.%${sp.search}%`)
  }

  const { data: rfiData, count } = await rfiQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const rfis = (rfiData || []) as RFI[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const open = rfis.filter((r) => r.status === 'open' || r.status === 'draft').length
  const answered = rfis.filter((r) => r.status === 'answered' || r.status === 'closed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">RFIs</h2>
          <p className="text-sm text-muted-foreground">{rfis.length} requests for information</p>
        </div>
        <Link href={`/jobs/${id}/rfis/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New RFI
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search RFIs..." defaultValue={sp.search} className="pl-10" /></form>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Total</p><p className="text-lg font-bold">{rfis.length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Open</p><p className="text-lg font-bold text-amber-600">{open}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Answered</p><p className="text-lg font-bold text-green-600">{answered}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            All RFIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rfis.length > 0 ? (
            <div className="divide-y divide-border">
              {rfis.map((rfi) => (
                <Link key={rfi.id} href={`/jobs/${id}/rfis/${rfi.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {rfi.rfi_number && <span className="text-sm font-mono text-muted-foreground">{rfi.rfi_number}</span>}
                        <span className="font-medium">{rfi.subject ?? 'Untitled'}</span>
                        <Badge className={getStatusColor(rfi.status ?? 'draft')}>{(rfi.status ?? 'draft').replace('_', ' ')}</Badge>
                        {rfi.priority && <Badge variant="outline" className="text-xs">{rfi.priority}</Badge>}
                      </div>
                      {rfi.question && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{rfi.question}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {rfi.category && <span>{rfi.category}</span>}
                        {rfi.due_date && <span>Due: {formatDate(rfi.due_date)}</span>}
                        {rfi.created_at && <span>Created {formatDate(rfi.created_at)}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No RFIs yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${id}/rfis`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
