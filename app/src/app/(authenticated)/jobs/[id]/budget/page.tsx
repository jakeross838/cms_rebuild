import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, DollarSign, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatCurrency } from '@/lib/utils'
import type { Metadata } from 'next'

interface BudgetLine {
  id: string
  description: string | null
  phase: string | null
  estimated_amount: number | null
  committed_amount: number | null
  actual_amount: number | null
  projected_amount: number | null
  variance_amount: number | null
  sort_order: number | null
  cost_codes: { code: string; name: string } | null
}

export const metadata: Metadata = { title: 'Budget' }

export default async function BudgetPage({
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

  // Verify job exists and belongs to company
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, name')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (jobError || !job) {
    notFound()
  }

  let linesQuery = supabase
    .from('budget_lines')
    .select('*, cost_codes(code, name)', { count: 'exact' })
    .eq('job_id', id)
    .is('deleted_at', null)

  if (sp.search) {
    linesQuery = linesQuery.ilike('description', `%${escapeLike(sp.search)}%`)
  }

  const { data: linesData, count } = await linesQuery
    .order('sort_order', { ascending: true })
    .range(offset, offset + pageSize - 1)

  const lines = (linesData || []) as BudgetLine[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  // Compute totals
  const totals = lines.reduce(
    (acc, line) => ({
      estimated: acc.estimated + (line.estimated_amount ?? 0),
      committed: acc.committed + (line.committed_amount ?? 0),
      actual: acc.actual + (line.actual_amount ?? 0),
      projected: acc.projected + (line.projected_amount ?? 0),
      variance: acc.variance + (line.variance_amount ?? 0),
    }),
    { estimated: 0, committed: 0, actual: 0, projected: 0, variance: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Budget</h2>
          <p className="text-sm text-muted-foreground">{lines.length} line items</p>
        </div>
        <Link href={`/jobs/${id}/budget/new`}><Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Line
        </Button></Link>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search budget lines..." aria-label="Search budget lines" defaultValue={sp.search} className="pl-10" /></form>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Estimated', value: totals.estimated, color: 'text-foreground' },
          { label: 'Committed', value: totals.committed, color: 'text-blue-600' },
          { label: 'Actual', value: totals.actual, color: 'text-foreground' },
          { label: 'Projected', value: totals.projected, color: 'text-foreground' },
          { label: 'Variance', value: totals.variance, color: totals.variance >= 0 ? 'text-green-600' : 'text-red-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{formatCurrency(stat.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Lines
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lines.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Cost Code</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Description</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Estimated</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Committed</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Actual</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lines.map((line) => {
                    const variance = line.variance_amount ?? 0
                    return (
                      <tr key={line.id} className="hover:bg-accent/50">

                        <td className="py-2 pr-4">
                          <span className="font-mono text-xs">
                            {line.cost_codes?.code ?? '—'}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          <Link href={`/jobs/${id}/budget/${line.id}`} className="hover:underline">
                            <div className="font-medium">{line.description ?? line.cost_codes?.name ?? '—'}</div>
                          </Link>
                          {line.phase && (
                            <Badge variant="outline" className="mt-0.5 text-xs">{line.phase}</Badge>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono">
                          {formatCurrency(line.estimated_amount)}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono">
                          {formatCurrency(line.committed_amount)}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono">
                          {formatCurrency(line.actual_amount)}
                        </td>
                        <td className={`py-2 pr-4 text-right font-mono font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(variance)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border font-bold">
                    <td className="py-2 pr-4" colSpan={2}>Totals</td>
                    <td className="py-2 pr-4 text-right font-mono">{formatCurrency(totals.estimated)}</td>
                    <td className="py-2 pr-4 text-right font-mono">{formatCurrency(totals.committed)}</td>
                    <td className="py-2 pr-4 text-right font-mono">{formatCurrency(totals.actual)}</td>
                    <td className={`py-2 pr-4 text-right font-mono ${totals.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totals.variance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No budget lines yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add budget lines to track costs for this job</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${id}/budget`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
