import type { Metadata } from 'next'
import Link from 'next/link'

import { Plus, Search, FileText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { safeOrIlike, formatCurrency, formatDate, getStatusColor , formatStatus } from '@/lib/utils'

interface Estimate {
  id: string
  name: string
  status: string
  version: number
  estimate_type: string
  total: number | null
  created_at: string
  jobs: { name: string } | null
}

export const metadata: Metadata = { title: 'Proposals' }

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  let query = supabase
    .from('estimates')
    .select('id, name, status, version, estimate_type, total, created_at, jobs(name)', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.ilike('name', `${safeOrIlike(params.search)}`)
  }

  const { data: estimatesData, count, error } = await query
  if (error) throw error
  const estimates = (estimatesData || []) as Estimate[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const sent = estimates.filter((e) => e.status === 'sent' || e.status === 'presented').length
  const totalValue = estimates.reduce((s, e) => s + (e.total || 0), 0)

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
          <p className="text-muted-foreground">{count || 0} proposals &bull; {formatCurrency(totalValue)} total value</p>
        </div>
        <Link href="/estimates/new"><Button><Plus className="h-4 w-4 mr-2" />New Proposal</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search proposals..." aria-label="Search proposals" defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => {
            const sp = new URLSearchParams()
            if (filter.value) sp.set('status', filter.value)
            if (params.search) sp.set('search', params.search)
            const qs = sp.toString()
            return (
              <Link key={filter.value} href={`/proposals${qs ? `?${qs}` : ''}`}>
                <Button variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
              </Link>
            )
          })}
        </div>
      </div>

      {estimates.length > 0 ? (
        <div className="space-y-2">
          {estimates.map((est) => (
            <Link key={est.id} href={`/estimates/${est.id}`} className="block hover:ring-1 hover:ring-ring rounded-lg transition-all">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{est.name}</span>
                        <Badge className={getStatusColor(est.status)}>{formatStatus(est.status)}</Badge>
                        <Badge variant="outline" className="text-xs">v{est.version}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 ml-6">
                        {est.jobs?.name && <span>{est.jobs.name} &bull; </span>}
                        {formatDate(est.created_at)}
                      </div>
                    </div>
                    {est.total != null && (
                      <span className="font-bold text-lg">{formatCurrency(est.total)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground mb-1">No proposals found</p>
          <p className="text-muted-foreground">{params.search || params.status ? 'Try adjusting your filters' : 'Create your first proposal from an estimate'}</p>
        </div>
      )}

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/proposals" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
