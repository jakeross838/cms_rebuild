import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, Shield, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Lien Waivers' }

interface LienWaiver {
  id: string
  waiver_type: string | null
  claimant_name: string | null
  amount: number | null
  status: string | null
  through_date: string | null
  received_at: string | null
  created_at: string | null
}

export default async function LienWaiversPage({
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

  let waiverQuery = supabase
    .from('lien_waivers')
    .select('*', { count: 'exact' })
    .eq('job_id', id)
    .is('deleted_at', null)

  if (sp.search) {
    waiverQuery = waiverQuery.or(`claimant_name.ilike.%${sp.search}%,waiver_type.ilike.%${sp.search}%`)
  }

  const { data: waiverData, count } = await waiverQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const waivers = (waiverData || []) as LienWaiver[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const received = waivers.filter((w) => w.status === 'received' || w.status === 'approved').length
  const pending = waivers.filter((w) => w.status === 'requested' || w.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Lien Waivers</h2>
          <p className="text-sm text-muted-foreground">{waivers.length} waivers</p>
        </div>
        <Link href={`/jobs/${id}/lien-waivers/new`}><Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Waiver
        </Button></Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search waivers..." defaultValue={sp.search} className="pl-10" /></form>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Total</p><p className="text-lg font-bold">{waivers.length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Received</p><p className="text-lg font-bold text-green-600">{received}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-sm text-muted-foreground">Pending</p><p className="text-lg font-bold text-amber-600">{pending}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            All Waivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {waivers.length > 0 ? (
            <div className="divide-y divide-border">
              {waivers.map((waiver) => (
                <Link key={waiver.id} href={`/jobs/${id}/lien-waivers/${waiver.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{waiver.claimant_name ?? 'Unknown'}</span>
                        <Badge className={getStatusColor(waiver.status ?? 'pending')}>{(waiver.status ?? 'pending').replace('_', ' ')}</Badge>
                        {waiver.waiver_type && <Badge variant="outline" className="text-xs">{waiver.waiver_type.replace('_', ' ')}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {waiver.through_date && <span>Through: {formatDate(waiver.through_date)}</span>}
                        {waiver.received_at && <span>Received: {formatDate(waiver.received_at)}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono">{formatCurrency(waiver.amount)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No lien waivers yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${id}/lien-waivers`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
