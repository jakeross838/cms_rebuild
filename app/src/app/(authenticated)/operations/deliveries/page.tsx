import { redirect } from 'next/navigation'
import { Package, Truck } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

interface POReceipt {
  id: string
  po_id: string
  received_date: string
  received_by: string | null
  notes: string | null
  document_id: string | null
  created_at: string
}

export default async function DeliveriesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: receiptsData } = await supabase
    .from('po_receipts')
    .select('*')
    .eq('company_id', companyId)
    .order('received_date', { ascending: false })
    .limit(100)

  const receipts = (receiptsData || []) as POReceipt[]

  const today = new Date().toISOString().split('T')[0]
  const todayCount = receipts.filter((r) => r.received_date === today).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Deliveries</h1>
        <p className="text-muted-foreground">{receipts.length} recent deliveries &bull; {todayCount} today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Total Deliveries</p>
            <p className="text-2xl font-bold">{receipts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-2xl font-bold text-green-600">{todayCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">With Documents</p>
            <p className="text-2xl font-bold">{receipts.filter((r) => r.document_id).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Recent Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {receipts.length > 0 ? (
            <div className="divide-y divide-border">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">PO Receipt</span>
                        <span className="text-xs font-mono text-muted-foreground">{receipt.po_id.slice(0, 8)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Received {formatDate(receipt.received_date)}
                        {receipt.notes && ` — ${receipt.notes}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No deliveries recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
