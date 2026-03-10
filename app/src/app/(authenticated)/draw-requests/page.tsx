import Link from 'next/link'

import { FileText, Plus, Search, Clock, CheckCircle2, Banknote } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { safeOrIlike, formatCurrency, formatDate, formatStatus } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Draw Requests' }

// ── Types ────────────────────────────────────────────────────────────────────

interface DrawRequest {
  id: string
  draw_number: number | null
  application_date: string | null
  period_to: string | null
  status: string | null
  contract_amount: number | null
  current_due: number | null
  balance_to_finish: number | null
  lender_reference: string | null
  created_at: string | null
  jobs?: { name: string } | null
}

interface DrawStats {
  status: string | null
  current_due: number | null
}

const DRAW_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-stone-100 text-stone-700',
  pending_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  submitted_to_lender: 'bg-blue-100 text-blue-700',
  funded: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DrawRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string; sort?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    created_at: { column: 'created_at', ascending: false },
    status: { column: 'status', ascending: true },
    current_due: { column: 'current_due', ascending: false },
  }
  const sort = sortMap[params.sort || ''] || { column: 'draw_number', ascending: false }

  let query = (supabase as any)
    .from('draw_requests')
    .select(
      '*, jobs(name)',
      { count: 'exact' }
    )
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order(sort.column, { ascending: sort.ascending })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.or(`lender_reference.ilike.${safeOrIlike(params.search)}`)
  }

  query = query.range(offset, offset + pageSize - 1)

  // Stats query in parallel
  const statsQuery = (supabase as any)
    .from('draw_requests')
    .select('status, current_due')
    .eq('company_id', companyId)
    .is('deleted_at', null)

  const [mainResult, statsResult] = await Promise.all([query, statsQuery])

  if (mainResult.error) throw mainResult.error
  const draws = (mainResult.data || []) as DrawRequest[]
  const count = mainResult.count || 0
  const totalPages = Math.ceil(count / pageSize)

  // Compute stats
  const allDraws = (statsResult.data || []) as DrawStats[]
  const draftCount = allDraws.filter((d) => d.status === 'draft').length
  const draftAmount = allDraws.filter((d) => d.status === 'draft').reduce((sum, d) => sum + (d.current_due ?? 0), 0)
  const pendingCount = allDraws.filter((d) => d.status === 'pending_review').length
  const pendingAmount = allDraws.filter((d) => d.status === 'pending_review').reduce((sum, d) => sum + (d.current_due ?? 0), 0)
  const fundedAmount = allDraws.filter((d) => d.status === 'funded').reduce((sum, d) => sum + (d.current_due ?? 0), 0)

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'funded', label: 'Funded' },
  ]

  function buildHref(overrides: Record<string, string | undefined>): string {
    const sp = new URLSearchParams()
    const status = overrides.status !== undefined ? overrides.status : params.status
    const search = overrides.search !== undefined ? overrides.search : params.search
    const sortVal = overrides.sort !== undefined ? overrides.sort : params.sort
    const pageVal = overrides.page !== undefined ? overrides.page : params.page
    if (status) sp.set('status', status)
    if (search) sp.set('search', search)
    if (sortVal) sp.set('sort', sortVal)
    if (pageVal) sp.set('page', pageVal)
    const qs = sp.toString()
    return `/draw-requests${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Draw Requests</h1>
          <p className="text-muted-foreground">{count || 0} total draw requests</p>
        </div>
        <Link href="/draw-requests/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Draw Request
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Clock className="h-4 w-4" />
            <span>Drafts</span>
          </div>
          <p className="text-xl font-bold text-foreground">{draftCount}</p>
          <p className="text-sm text-muted-foreground">{formatCurrency(draftAmount)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>Pending Review</span>
          </div>
          <p className="text-xl font-bold text-foreground">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">{formatCurrency(pendingAmount)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Banknote className="h-4 w-4" />
            <span>Total Funded</span>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(fundedAmount)}</p>
        </div>
      </div>

      {/* Status Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <Link key={f.value} href={buildHref({ status: f.value, page: undefined })}>
              <Button variant={(params.status || '') === f.value ? 'default' : 'outline'} size="sm">
                {f.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search by lender reference..."
              aria-label="Search draw requests"
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground self-center">Sort:</span>
        {[
          { value: '', label: 'Draw #' },
          { value: 'created_at', label: 'Newest' },
          { value: 'status', label: 'Status' },
          { value: 'current_due', label: 'Current Due' },
        ].map((s) => (
          <Link key={s.value} href={buildHref({ sort: s.value || undefined, page: undefined })}>
            <Button variant={(params.sort || '') === s.value ? 'default' : 'outline'} size="sm">
              {s.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {draws.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th scope="col" className="text-left p-3 font-medium text-muted-foreground">
                    Draw #
                  </th>
                  <th scope="col" className="text-left p-3 font-medium text-muted-foreground">
                    Job
                  </th>
                  <th scope="col" className="text-left p-3 font-medium text-muted-foreground">
                    Application Date
                  </th>
                  <th scope="col" className="text-left p-3 font-medium text-muted-foreground">
                    Period To
                  </th>
                  <th scope="col" className="text-left p-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th scope="col" className="text-right p-3 font-medium text-muted-foreground">
                    Current Due
                  </th>
                  <th scope="col" className="text-right p-3 font-medium text-muted-foreground">
                    Balance to Finish
                  </th>
                  <th scope="col" className="text-left p-3 font-medium text-muted-foreground">
                    Lender Ref
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {draws.map((draw) => (
                  <tr
                    key={draw.id}
                    className="hover:bg-accent transition-colors"
                  >
                    <td className="p-3">
                      <Link
                        href={`/draw-requests/${draw.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        #{draw.draw_number ?? '--'}
                      </Link>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {draw.jobs?.name || '--'}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(draw.application_date)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(draw.period_to)}
                    </td>
                    <td className="p-3">
                      <Badge className={DRAW_STATUS_COLORS[draw.status || 'draft'] || 'bg-stone-100 text-stone-700'}>
                        {formatStatus(draw.status || 'draft')}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-medium text-foreground">
                      {formatCurrency(draw.current_due)}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {formatCurrency(draw.balance_to_finish)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {draw.lender_reference || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">
              No draw requests yet
            </p>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status
                ? 'Try adjusting your filters'
                : 'Get started by creating your first draw request'}
            </p>
            <Link href="/draw-requests/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Draw Request
              </Button>
            </Link>
          </div>
        )}
      </div>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/draw-requests" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
