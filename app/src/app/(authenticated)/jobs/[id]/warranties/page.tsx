import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, Shield, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Warranties' }

interface Warranty {
  id: string
  title: string
  status: string
  warranty_type: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  created_at: string | null
}

export default async function JobWarrantiesPage({
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

  let warrantiesQuery = supabase
    .from('warranties')
    .select('*', { count: 'exact' })
    .eq('job_id', jobId)
    .is('deleted_at', null)

  if (sp.search) {
    warrantiesQuery = warrantiesQuery.ilike('title', `%${escapeLike(sp.search)}%`)
  }

  const { data: warrantiesData, count } = await warrantiesQuery
    .order('end_date', { ascending: true })
    .range(offset, offset + pageSize - 1)

  const warranties = (warrantiesData || []) as Warranty[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const active = warranties.filter((w) => w.status === 'active').length
  const expired = warranties.filter((w) => w.status === 'expired').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warranties</h1>
          <p className="text-muted-foreground">{warranties.length} warranties &bull; {active} active &bull; {expired} expired</p>
        </div>
        <Link href={`/jobs/${jobId}/warranties/new`}><Button><Plus className="h-4 w-4 mr-2" />Add Warranty</Button></Link>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search warranties..." aria-label="Search warranties" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            All Warranties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {warranties.length > 0 ? (
            <div className="divide-y divide-border">
              {warranties.map((w) => (
                <Link key={w.id} href={`/jobs/${jobId}/warranties/${w.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{w.title}</span>
                        <Badge className={getStatusColor(w.status)}>{w.status}</Badge>
                        {w.warranty_type && <Badge variant="outline" className="text-xs">{w.warranty_type}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {w.start_date && formatDate(w.start_date)}
                        {w.end_date && ` — ${formatDate(w.end_date)}`}
                        {w.description && ` • ${w.description}`}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No warranties for this job</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${jobId}/warranties`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
