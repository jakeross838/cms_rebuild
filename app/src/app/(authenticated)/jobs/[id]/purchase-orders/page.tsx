import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, ShoppingCart, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface PurchaseOrder {
  id: string
  po_number: string | null
  title: string | null
  status: string | null
  total_amount: number | null
  delivery_date: string | null
  created_at: string | null
  vendor_id: string | null
}

export default async function PurchaseOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, name')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (jobError || !job) {
    notFound()
  }

  let poQuery = supabase
    .from('purchase_orders')
    .select('*')
    .eq('job_id', id)
    .is('deleted_at', null)

  if (sp.search) {
    poQuery = poQuery.or(`po_number.ilike.%${sp.search}%,title.ilike.%${sp.search}%`)
  }

  const { data: poData } = await poQuery.order('created_at', { ascending: false })

  const purchaseOrders = (poData || []) as PurchaseOrder[]

  const totalValue = purchaseOrders.reduce((sum, po) => sum + (po.total_amount ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Purchase Orders</h2>
          <p className="text-sm text-muted-foreground">{purchaseOrders.length} purchase orders</p>
        </div>
        <Link href={`/jobs/${id}/purchase-orders/new`}><Button>
          <Plus className="h-4 w-4 mr-2" />
          New PO
        </Button></Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search purchase orders..." defaultValue={sp.search} className="pl-10" /></form>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Total POs</p>
            <p className="text-lg font-bold">{purchaseOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* PO list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            All Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchaseOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {purchaseOrders.map((po) => (
                <Link key={po.id} href={`/jobs/${id}/purchase-orders/${po.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {po.po_number && (
                          <span className="text-sm font-mono text-muted-foreground">{po.po_number}</span>
                        )}
                        <span className="font-medium">{po.title ?? 'Untitled'}</span>
                        <Badge className={getStatusColor(po.status ?? 'draft')}>
                          {(po.status ?? 'draft').replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {po.vendor_id && <span>Vendor assigned</span>}
                        {po.delivery_date && <span>Delivery: {formatDate(po.delivery_date)}</span>}
                        {po.created_at && <span>Created {formatDate(po.created_at)}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono">{formatCurrency(po.total_amount)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No purchase orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
