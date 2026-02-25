import { notFound } from 'next/navigation'

import { Plus, ShoppingCart } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, name')
    .eq('id', id)
    .single()

  if (jobError || !job) {
    notFound()
  }

  const { data: poData } = await supabase
    .from('purchase_orders')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New PO
        </Button>
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
                <div key={po.id} className="py-3 first:pt-0 last:pb-0">
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
                </div>
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
