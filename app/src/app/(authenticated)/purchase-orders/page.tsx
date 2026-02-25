import Link from 'next/link'

import { ShoppingCart, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface PurchaseOrderRow {
  id: string
  po_number: string | null
  title: string | null
  status: string | null
  total_amount: number | null
  delivery_date: string | null
  job_id: string | null
  vendor_id: string | null
  created_at: string | null
}

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('purchase_orders')
    .select('id, po_number, title, status, total_amount, delivery_date, job_id, vendor_id, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (params.search) {
    query = query.or(`po_number.ilike.%${params.search}%,title.ilike.%${params.search}%`)
  }

  const { data: posData, error } = await query
  const purchaseOrders = error ? [] : ((posData || []) as PurchaseOrderRow[])

  // Fetch related jobs and vendors for display
  const jobIds = [...new Set(purchaseOrders.map((po) => po.job_id).filter(Boolean))] as string[]
  const vendorIds = [...new Set(purchaseOrders.map((po) => po.vendor_id).filter(Boolean))] as string[]

  const jobsMap = new Map<string, { name: string; job_number: string | null }>()
  const vendorsMap = new Map<string, { name: string }>()

  if (jobIds.length > 0) {
    const { data: jobsData } = await supabase
      .from('jobs')
      .select('id, name, job_number')
      .in('id', jobIds)
    for (const job of jobsData || []) {
      jobsMap.set(job.id, { name: job.name, job_number: job.job_number })
    }
  }

  if (vendorIds.length > 0) {
    const { data: vendorsData } = await supabase
      .from('vendors')
      .select('id, name')
      .in('id', vendorIds)
    for (const vendor of vendorsData || []) {
      vendorsMap.set(vendor.id, { name: vendor.name })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
        <p className="text-muted-foreground">Manage purchase orders across all jobs</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search purchase orders..."
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      {/* Purchase orders list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {purchaseOrders.length > 0 ? (
          <div className="divide-y divide-border">
            {purchaseOrders.map((po) => {
              const job = po.job_id ? jobsMap.get(po.job_id) : null
              const vendor = po.vendor_id ? vendorsMap.get(po.vendor_id) : null
              return (
                <Link
                  key={po.id}
                  href={po.job_id ? `/jobs/${po.job_id}/purchase-orders` : `/purchase-orders/${po.id}`}
                  className="block p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {po.po_number && (
                              <span className="text-sm text-muted-foreground">
                                {po.po_number}
                              </span>
                            )}
                            <span className="font-medium text-foreground">
                              {po.title || 'Untitled PO'}
                            </span>
                            {po.status && (
                              <Badge className={getStatusColor(po.status)}>
                                {po.status.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {vendor?.name || 'No vendor'}
                            {job ? ` | ${job.job_number ? `${job.job_number} - ` : ''}${job.name}` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="font-medium text-foreground">
                        {formatCurrency(po.total_amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {po.delivery_date
                          ? `Delivery ${formatDate(po.delivery_date)}`
                          : formatDate(po.created_at)}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No purchase orders found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search
                ? 'Try adjusting your search'
                : 'Create purchase orders from within a job'}
            </p>
            <Link
              href="/jobs"
              className="text-sm font-medium text-primary hover:underline"
            >
              Go to Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
