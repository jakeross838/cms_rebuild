import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, Receipt, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

interface DrawRequest {
  id: string
  draw_number: number | null
  status: string | null
  contract_amount: number | null
  total_earned: number | null
  total_completed: number | null
  current_due: number | null
  retainage_amount: number | null
  application_date: string | null
  submitted_at: string | null
  approved_at: string | null
}

export const metadata: Metadata = { title: 'Draws' }

export default async function DrawsPage({
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

  let drawQuery = supabase
    .from('draw_requests')
    .select('*', { count: 'exact' })
    .eq('job_id', id)
    .is('deleted_at', null)

  if (sp.search) {
    drawQuery = drawQuery.or(`draw_number::text.ilike.%${sp.search}%,title.ilike.%${sp.search}%`)
  }

  const { data: drawData, count } = await drawQuery
    .order('application_date', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const draws = (drawData || []) as DrawRequest[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const totalEarned = draws.reduce((sum, d) => sum + (d.total_earned ?? 0), 0)
  const totalDue = draws.reduce((sum, d) => sum + (d.current_due ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Draw Requests</h2>
          <p className="text-sm text-muted-foreground">{draws.length} draws</p>
        </div>
        <Link href={`/jobs/${id}/draws/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Draw
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search draws..." aria-label="Search draws" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Total Draws</p><p className="text-lg font-bold">{draws.length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Total Earned</p><p className="text-lg font-bold">{formatCurrency(totalEarned)}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Current Due</p><p className="text-lg font-bold text-green-600">{formatCurrency(totalDue)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            All Draws
          </CardTitle>
        </CardHeader>
        <CardContent>
          {draws.length > 0 ? (
            <div className="divide-y divide-border">
              {draws.map((draw) => (
                <Link key={draw.id} href={`/jobs/${id}/draws/${draw.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {draw.draw_number && <span className="text-sm font-mono text-muted-foreground">#{draw.draw_number}</span>}
                        <Badge className={getStatusColor(draw.status ?? 'draft')}>{(draw.status ?? 'draft').replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {draw.application_date && <span>Application: {formatDate(draw.application_date)}</span>}
                        {draw.submitted_at && <span>Submitted: {formatDate(draw.submitted_at)}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-mono">{formatCurrency(draw.current_due)}</p>
                      <p className="text-xs text-muted-foreground">of {formatCurrency(draw.total_earned)} earned</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No draw requests yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${id}/draws`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
