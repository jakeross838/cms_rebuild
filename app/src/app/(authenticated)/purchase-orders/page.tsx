import type { Metadata } from 'next'
import Link from 'next/link'

import { ShoppingCart, Search, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { escapeLike, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

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
  jobs: { name: string; job_number: string | null } | null
  vendors: { name: string } | null
}

export const metadata: Metadata = { title: 'Purchase Orders' }

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string; sort?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    total_amount: { column: 'total_amount', ascending: false },
    status: { column: 'status', ascending: true },
    delivery_date: { column: 'delivery_date', ascending: true },
  }
  const sort = sortMap[params.sort || ''] || { column: 'created_at', ascending: false }

  let query = supabase
    .from('purchase_orders')
    .select('id, po_number, title, status, total_amount, delivery_date, job_id, vendor_id, created_at, jobs(name, job_number), vendors(name)', { count: 'exact' })
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order(sort.column, { ascending: sort.ascending })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.or(`po_number.ilike.%${escapeLike(params.search)}%,title.ilike.%${escapeLike(params.search)}%`)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: posData, count, error } = await query
  if (error) throw error
  const purchaseOrders = (posData || []) as unknown as PurchaseOrderRow[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'sent', label: 'Sent' },
    { value: 'received', label: 'Received' },
    { value: 'closed', label: 'Closed' },
  ]


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground">{count || 0} total purchase orders</p>
        </div>
        <Link href="/purchase-orders/new"><Button><Plus className="h-4 w-4 mr-2" />New PO</Button></Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search purchase orders..."
              aria-label="Search purchase orders"
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => {
            const sp = new URLSearchParams()
            if (filter.value) sp.set('status', filter.value)
            if (params.search) sp.set('search', params.search)
            if (params.sort) sp.set('sort', params.sort)
            const qs = sp.toString()
            return (
              <Link key={filter.value} href={`/purchase-orders${qs ? `?${qs}` : ''}`}>
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
          { value: 'total_amount', label: 'Amount' },
          { value: 'status', label: 'Status' },
          { value: 'delivery_date', label: 'Delivery Date' },
        ].map((s) => {
          const sp = new URLSearchParams()
          if (params.search) sp.set('search', params.search)
          if (params.status) sp.set('status', params.status)
          if (s.value) sp.set('sort', s.value)
          if (params.page) sp.set('page', params.page)
          const qs = sp.toString()
          return (
            <Link key={s.value} href={`/purchase-orders${qs ? `?${qs}` : ''}`}>
              <Button variant={(params.sort || '') === s.value ? 'default' : 'outline'} size="sm">
                {s.label}
              </Button>
            </Link>
          )
        })}
      </div>

      {/* Purchase orders list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {purchaseOrders.length > 0 ? (
          <div className="divide-y divide-border">
            {purchaseOrders.map((po) => {
              const job = po.jobs
              const vendor = po.vendors
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
            <p className="text-lg font-medium text-foreground mb-1">No purchase orders found</p>
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

      <ListPagination currentPage={page} totalPages={totalPages} basePath="/purchase-orders" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
