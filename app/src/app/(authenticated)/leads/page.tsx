import type { Metadata } from 'next'
import Link from 'next/link'

import { Plus, Search, Target } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { escapeLike, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface Lead {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  status: string | null
  source: string | null
  score: number | null
  expected_contract_value: number | null
  project_type: string | null
  created_at: string | null
}

export const metadata: Metadata = { title: 'Leads' }

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string; sort?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    name: { column: 'last_name', ascending: true },
    expected_contract_value: { column: 'expected_contract_value', ascending: false },
    created_at: { column: 'created_at', ascending: false },
    status: { column: 'status', ascending: true },
  }
  const sort = sortMap[params.sort || ''] || { column: 'created_at', ascending: false }

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order(sort.column, { ascending: sort.ascending })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.or(`first_name.ilike.%${escapeLike(params.search)}%,last_name.ilike.%${escapeLike(params.search)}%,email.ilike.%${escapeLike(params.search)}%`)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: leadsData, count, error } = await query
  if (error) throw error
  const leads = (leadsData || []) as Lead[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">{count || 0} total leads</p>
        </div>
        <Link href="/leads/new"><Button><Plus className="h-4 w-4 mr-2" />New Lead</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search leads..." aria-label="Search leads" defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => {
            const sp = new URLSearchParams()
            if (filter.value) sp.set('status', filter.value)
            if (params.search) sp.set('search', params.search)
            if (params.sort) sp.set('sort', params.sort)
            const qs = sp.toString()
            return (
              <Link key={filter.value} href={`/leads${qs ? `?${qs}` : ''}`}>
                <Button variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground self-center">Sort:</span>
        {[
          { value: '', label: 'Newest' },
          { value: 'name', label: 'Name' },
          { value: 'expected_contract_value', label: 'Value' },
          { value: 'status', label: 'Status' },
        ].map((s) => {
          const sp = new URLSearchParams()
          if (params.search) sp.set('search', params.search)
          if (params.status) sp.set('status', params.status)
          if (s.value) sp.set('sort', s.value)
          if (params.page) sp.set('page', params.page)
          const qs = sp.toString()
          return (
            <Link key={s.value} href={`/leads${qs ? `?${qs}` : ''}`}>
              <Button variant={(params.sort || '') === s.value ? 'default' : 'outline'} size="sm">
                {s.label}
              </Button>
            </Link>
          )
        })}
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {leads.length > 0 ? (
          <div className="divide-y divide-border">
            {leads.map((lead) => (
              <Link key={lead.id} href={`/leads/${lead.id}`} className="block p-4 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lead.first_name} {lead.last_name}</span>
                      <Badge className={getStatusColor(lead.status ?? 'new')}>{(lead.status ?? 'new').replace('_', ' ')}</Badge>
                      {lead.score != null && (
                        <span className="text-xs text-muted-foreground">Score: {lead.score}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {lead.email || 'No email'} {lead.source ? `• ${lead.source}` : ''} {lead.project_type ? `• ${lead.project_type.replace('_', ' ')}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    {lead.expected_contract_value && (
                      <div className="font-medium">{formatCurrency(lead.expected_contract_value)}</div>
                    )}
                    <div className="text-xs text-muted-foreground">{lead.created_at ? formatDate(lead.created_at) : ''}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">No leads found</p>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status ? 'Try adjusting your filters' : 'Add your first lead to start tracking'}
            </p>
            {!params.search && !params.status && (
              <Link href="/leads/new">
                <Button><Plus className="h-4 w-4 mr-2" />Add Lead</Button>
              </Link>
            )}
          </div>
        )}
      </div>
      <ListPagination currentPage={page} totalPages={totalPages} basePath="/leads" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
