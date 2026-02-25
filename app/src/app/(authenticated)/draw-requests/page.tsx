import Link from 'next/link'

import { FileText, Plus, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

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
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('draw_requests')
    .select(
      'id, draw_number, application_date, period_to, status, contract_amount, current_due, balance_to_finish, lender_reference, created_at'
    )
    .is('deleted_at', null)
    .order('draw_number', { ascending: false })
    .limit(50)

  if (params.search) {
    query = query.ilike('lender_reference', `%${params.search}%`)
  }

  const { data: drawsData } = await query
  const draws = (drawsData || []) as DrawRequest[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Draw Requests</h1>
          <p className="text-muted-foreground">
            Manage AIA-format draw requests and lender submissions
          </p>
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
              placeholder="Search by lender reference..."
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {draws.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    Draw #
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    Application Date
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    Period To
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right p-3 font-medium text-muted-foreground">
                    Current Due
                  </th>
                  <th className="text-right p-3 font-medium text-muted-foreground">
                    Balance to Finish
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
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
            <h3 className="text-lg font-medium text-foreground mb-1">
              No draw requests yet
            </h3>
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
    </div>
  )
}
