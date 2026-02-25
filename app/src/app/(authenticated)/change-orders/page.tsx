import Link from 'next/link'

import { FileText, Plus, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface ChangeOrderRow {
  id: string
  job_id: string
  co_number: string | null
  title: string | null
  status: string | null
  amount: number | null
  change_type: string | null
  schedule_impact_days: number | null
  created_at: string | null
}

export default async function ChangeOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('change_orders')
    .select('id, job_id, co_number, title, status, amount, change_type, schedule_impact_days, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (params.search) {
    query = query.or(`co_number.ilike.%${params.search}%,title.ilike.%${params.search}%`)
  }

  const { data: cosData, error } = await query
  const changeOrders = error ? [] : ((cosData || []) as ChangeOrderRow[])

  // Fetch related jobs for display
  const jobIds = [...new Set(changeOrders.map((co) => co.job_id))]
  const jobsMap = new Map<string, { name: string; job_number: string | null }>()

  if (jobIds.length > 0) {
    const { data: jobsData } = await supabase
      .from('jobs')
      .select('id, name, job_number')
      .in('id', jobIds)
    for (const job of jobsData || []) {
      jobsMap.set(job.id, { name: job.name, job_number: job.job_number })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Change Orders</h1>
          <p className="text-muted-foreground">Scope changes and budget adjustments across all jobs</p>
        </div>
        <Link href="/change-orders/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Change Order
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
              placeholder="Search change orders..."
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      {/* Change orders list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {changeOrders.length > 0 ? (
          <div className="divide-y divide-border">
            {changeOrders.map((co) => {
              const job = jobsMap.get(co.job_id)
              return (
                <Link
                  key={co.id}
                  href={`/change-orders/${co.id}`}
                  className="block p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {co.co_number && (
                              <span className="text-sm text-muted-foreground">
                                {co.co_number}
                              </span>
                            )}
                            <span className="font-medium text-foreground">
                              {co.title || 'Untitled Change Order'}
                            </span>
                            {co.status && (
                              <Badge className={getStatusColor(co.status)}>
                                {co.status.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {job?.job_number ? `${job.job_number} - ` : ''}
                            {job?.name || 'Unknown job'}
                            {co.change_type ? ` | ${co.change_type.replace('_', ' ')}` : ''}
                            {co.schedule_impact_days ? ` | ${co.schedule_impact_days} day impact` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="font-medium text-foreground">
                        {formatCurrency(co.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(co.created_at)}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No change orders found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search
                ? 'Try adjusting your search'
                : 'Create a change order to track scope changes'}
            </p>
            <Link
              href="/change-orders/new"
              className="text-sm font-medium text-primary hover:underline"
            >
              Create Change Order
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
