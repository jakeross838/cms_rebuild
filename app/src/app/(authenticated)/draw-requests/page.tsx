import Link from 'next/link'

import { FileText, Plus, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { escapeLike, formatDate } from '@/lib/utils'
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
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '$0.00'
  return currencyFmt.format(value)
}

function statusVariant(
  status: string | null
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'default'
    case 'submitted':
    case 'pending':
      return 'secondary'
    case 'rejected':
      return 'destructive'
    default:
      return 'outline'
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DrawRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; sort?: string }>
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

  let query = supabase
    .from('draw_requests')
    .select(
      'id, draw_number, application_date, period_to, status, contract_amount, current_due, balance_to_finish, lender_reference, created_at',
      { count: 'exact' }
    )
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order(sort.column, { ascending: sort.ascending })

  if (params.search) {
    query = query.ilike('lender_reference', `%${escapeLike(params.search)}%`)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: drawsData, count, error } = await query
  if (error) throw error
  const draws = (drawsData || []) as DrawRequest[]
  const totalPages = Math.ceil((count || 0) / pageSize)

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

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search draw requests..."
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
        ].map((s) => {
          const sp = new URLSearchParams()
          if (params.search) sp.set('search', params.search)
          if (s.value) sp.set('sort', s.value)
          if (params.page) sp.set('page', params.page)
          const qs = sp.toString()
          return (
            <Link key={s.value} href={`/draw-requests${qs ? `?${qs}` : ''}`}>
              <Button variant={(params.sort || '') === s.value ? 'default' : 'outline'} size="sm">
                {s.label}
              </Button>
            </Link>
          )
        })}
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
                      {formatDate(draw.application_date)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(draw.period_to)}
                    </td>
                    <td className="p-3">
                      <Badge variant={statusVariant(draw.status)}>
                        {draw.status || 'Draft'}
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
              {params.search
                ? 'Try adjusting your search'
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
