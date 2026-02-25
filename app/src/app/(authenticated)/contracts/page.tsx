import Link from 'next/link'

import { Plus, Search, FileCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

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

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('contracts')
    .select('*, jobs(name)')
    .order('created_at', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,contract_number.ilike.%${params.search}%`)
  }

  const { data: contractsData } = await query
  const contracts = (contractsData || []) as Contract[]

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
          <p className="text-muted-foreground">Manage project contracts and agreements</p>
        </div>
        <Link href="/contracts/new"><Button><Plus className="h-4 w-4 mr-2" />New Contract</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search contracts..." defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => (
            <Link key={filter.value} href={filter.value ? `/contracts?status=${filter.value}` : '/contracts'}>
              <Button variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {contracts.length > 0 ? (
          <div className="divide-y divide-border">
            {contracts.map((contract) => (
              <div key={contract.id} className="p-4 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {contract.contract_number && <span className="text-sm font-mono text-muted-foreground">{contract.contract_number}</span>}
                      <span className="font-medium">{contract.title ?? 'Untitled'}</span>
                      <Badge className={getStatusColor(contract.status ?? 'draft')}>{(contract.status ?? 'draft').replace('_', ' ')}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {contract.jobs?.name || 'No job'} {contract.contract_type ? `• ${contract.contract_type.replace('_', ' ')}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(contract.contract_value)}</div>
                    <div className="text-xs text-muted-foreground">
                      {contract.executed_at ? `Executed ${formatDate(contract.executed_at)}` : contract.created_at ? formatDate(contract.created_at) : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No contracts found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status ? 'Try adjusting your filters' : 'Create your first contract'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
