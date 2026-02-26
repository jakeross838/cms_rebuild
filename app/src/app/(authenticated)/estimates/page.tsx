import Link from 'next/link'

import { Plus, Search, Calculator } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface Estimate {
  id: string
  name: string
  description: string | null
  status: string | null
  estimate_type: string | null
  contract_type: string | null
  subtotal: number | null
  total: number | null
  version: number | null
  valid_until: string | null
  created_at: string | null
  jobs: { name: string } | null
}

export default async function EstimatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('estimates')
    .select('*, jobs(name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  const { data: estimatesData } = await query
  const estimates = (estimatesData || []) as Estimate[]

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estimates</h1>
          <p className="text-muted-foreground">Create and manage project estimates</p>
        </div>
        <Link href="/estimates/new"><Button><Plus className="h-4 w-4 mr-2" />New Estimate</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search estimates..." defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => (
            <Link key={filter.value} href={filter.value ? `/estimates?status=${filter.value}` : '/estimates'}>
              <Button variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {estimates.length > 0 ? (
          <div className="divide-y divide-border">
            {estimates.map((est) => (
              <Link key={est.id} href={`/estimates/${est.id}`} className="block p-4 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{est.name}</span>
                      <Badge className={getStatusColor(est.status ?? 'draft')}>{(est.status ?? 'draft').replace('_', ' ')}</Badge>
                      {est.version && est.version > 1 && (
                        <span className="text-xs text-muted-foreground">v{est.version}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {est.jobs?.name || 'No job'} {est.estimate_type ? `• ${est.estimate_type.replace('_', ' ')}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(est.total)}</div>
                    <div className="text-xs text-muted-foreground">
                      {est.valid_until ? `Valid until ${formatDate(est.valid_until)}` : est.created_at ? formatDate(est.created_at) : ''}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No estimates found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status ? 'Try adjusting your filters' : 'Create your first estimate'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
