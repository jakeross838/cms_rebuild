import Link from 'next/link'
import { redirect } from 'next/navigation'

import { FileText, Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatCurrency, formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Lien Waivers' }

interface LienWaiver {
  id: string
  waiver_type: string | null
  status: string | null
  amount: number | null
  claimant_name: string | null
  through_date: string | null
  check_number: string | null
  created_at: string | null
}

// ── Status Badge Colors ──────────────────────────────────────────
function statusBadge(status: string | null) {
  const s = (status || 'draft').toLowerCase()
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    requested: 'bg-blue-100 text-blue-700',
    received: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colors[s] || colors.draft}`}>
      {status || 'Draft'}
    </span>
  )
}

export default async function LienWaiversPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('lien_waivers')
    .select('id, waiver_type, status, amount, claimant_name, through_date, check_number, created_at', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (params.search) {
    query = query.ilike('claimant_name', `%${escapeLike(params.search)}%`)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: waiversData, count } = await query
  const waivers = (waiversData || []) as LienWaiver[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lien Waivers</h1>
          <p className="text-muted-foreground">{count || 0} total lien waivers</p>
        </div>
        <Link href="/lien-waivers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Lien Waiver
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
              placeholder="Search by claimant name..."
              aria-label="Search lien waivers"
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      {/* Waivers table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {waivers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Claimant</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Through Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Check #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {waivers.map((waiver) => (
                  <tr key={waiver.id} className="hover:bg-accent transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/lien-waivers/${waiver.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {waiver.claimant_name || 'Unknown'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {waiver.waiver_type || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {waiver.amount != null ? formatCurrency(waiver.amount) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {statusBadge(waiver.status)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {waiver.through_date ? formatDate(waiver.through_date) : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {waiver.check_number || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No lien waivers yet</h3>
            <p className="text-muted-foreground mb-4">
              {params.search
                ? 'Try adjusting your search'
                : 'Get started by adding your first lien waiver'}
            </p>
            <Link href="/lien-waivers/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lien Waiver
              </Button>
            </Link>
          </div>
        )}
      </div>

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/lien-waivers" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
