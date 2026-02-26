import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, Palette, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Selections' }

interface Selection {
  id: string
  status: string
  room: string | null
  selected_at: string | null
  confirmed_at: string | null
  category_id: string
  option_id: string
  created_at: string
}

export default async function JobSelectionsPage({
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

  let selectionsQuery = supabase
    .from('selections')
    .select('*', { count: 'exact' })
    .eq('job_id', jobId)
    .is('deleted_at', null)

  if (sp.search) {
    selectionsQuery = selectionsQuery.ilike('room', `%${escapeLike(sp.search)}%`)
  }

  const { data: selectionsData, count } = await selectionsQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const selections = (selectionsData || []) as Selection[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const confirmed = selections.filter((s) => s.status === 'confirmed').length
  const pending = selections.filter((s) => s.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Selections</h1>
          <p className="text-muted-foreground">{selections.length} selections &bull; {confirmed} confirmed &bull; {pending} pending</p>
        </div>
        <Link href={`/jobs/${jobId}/selections/new`}><Button><Plus className="h-4 w-4 mr-2" />Add Selection</Button></Link>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search selections..." aria-label="Search selections" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Product Selections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selections.length > 0 ? (
            <div className="divide-y divide-border">
              {selections.map((sel) => (
                <Link key={sel.id} href={`/jobs/${jobId}/selections/${sel.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(sel.status)}>{sel.status}</Badge>
                        {sel.room && <Badge variant="outline" className="text-xs">{sel.room}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {sel.selected_at && `Selected ${formatDate(sel.selected_at)}`}
                        {sel.confirmed_at && ` • Confirmed ${formatDate(sel.confirmed_at)}`}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Palette className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No selections made for this job yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${jobId}/selections`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
