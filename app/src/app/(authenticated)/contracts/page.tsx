import type { Metadata } from 'next'
import Link from 'next/link'

import { Plus, Search, FileCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { safeOrIlike, formatCurrency, formatDate, getStatusColor, formatStatus} from '@/lib/utils'

interface Contract {
  id: string
  title: string | null
  contract_number: string | null
  contract_type: string | null
  contract_value: number | null
  status: string | null
  start_date: string | null
  end_date: string | null
  executed_at: string | null
  created_at: string | null
  jobs: { name: string } | null
}

export const metadata: Metadata = { title: 'Contracts' }

export default async function ContractsPage({
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
    contract_value: { column: 'contract_value', ascending: false },
    status: { column: 'status', ascending: true },
    title: { column: 'title', ascending: true },
  }
  const sort = sortMap[params.sort || ''] || { column: 'created_at', ascending: false }

  let query = supabase
    .from('contracts')
    .select('*, jobs(name)', { count: 'exact' })
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order(sort.column, { ascending: sort.ascending })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.or(`title.ilike.${safeOrIlike(params.search)},contract_number.ilike.${safeOrIlike(params.search)}`)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: contractsData, count, error } = await query
  if (error) throw error
  const contracts = (contractsData || []) as Contract[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'executed', label: 'Executed' },
    { value: 'expired', label: 'Expired' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contracts</h1>
          <p className="text-muted-foreground">{count || 0} total contracts</p>
        </div>
        <Link href="/contracts/new"><Button><Plus className="h-4 w-4 mr-2" />New Contract</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search contracts..." aria-label="Search contracts" defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => {
            const sp = new URLSearchParams()
            if (filter.value) sp.set('status', filter.value)
            if (params.search) sp.set('search', params.search)
            if (params.sort) sp.set('sort', params.sort)
            const qs = sp.toString()
            return (
              <Link key={filter.value} href={`/contracts${qs ? `?${qs}` : ''}`}>
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
          { value: 'contract_value', label: 'Value' },
          { value: 'status', label: 'Status' },
          { value: 'title', label: 'Title' },
        ].map((s) => {
          const sp = new URLSearchParams()
          if (params.search) sp.set('search', params.search)
          if (params.status) sp.set('status', params.status)
          if (s.value) sp.set('sort', s.value)
          if (params.page) sp.set('page', params.page)
          const qs = sp.toString()
          return (
            <Link key={s.value} href={`/contracts${qs ? `?${qs}` : ''}`}>
              <Button variant={(params.sort || '') === s.value ? 'default' : 'outline'} size="sm">
                {s.label}
              </Button>
            </Link>
          )
        })}
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {contracts.length > 0 ? (
          <div className="divide-y divide-border">
            {contracts.map((contract) => (
              <Link key={contract.id} href={`/contracts/${contract.id}`} className="block p-4 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {contract.contract_number && <span className="text-sm font-mono text-muted-foreground">{contract.contract_number}</span>}
                      <span className="font-medium">{contract.title ?? 'Untitled'}</span>
                      <Badge className={getStatusColor(contract.status ?? 'draft')}>{formatStatus((contract.status ?? 'draft'))}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {contract.jobs?.name || 'No job'} {contract.contract_type ? `• ${formatStatus(contract.contract_type)}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(contract.contract_value)}</div>
                    <div className="text-xs text-muted-foreground">
                      {contract.executed_at ? `Executed ${formatDate(contract.executed_at)}` : contract.created_at ? formatDate(contract.created_at) : ''}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">No contracts found</p>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status ? 'Try adjusting your filters' : 'Create your first contract'}
            </p>
            {!params.search && !params.status && (
              <Link href="/contracts/new"><Button><Plus className="h-4 w-4 mr-2" />New Contract</Button></Link>
            )}
          </div>
        )}
      </div>
      <ListPagination currentPage={page} totalPages={totalPages} basePath="/contracts" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
