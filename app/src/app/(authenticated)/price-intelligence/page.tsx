import type { Metadata } from 'next'

import { TrendingUp, DollarSign } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

interface PriceHistoryRow {
  id: string
  master_item_id: string
  vendor_id: string | null
  old_price: number | null
  new_price: number
  change_pct: number | null
  recorded_at: string
}

export const metadata: Metadata = { title: 'Price Intelligence' }

export default async function PriceIntelligencePage() {
  const supabase = await createClient()

  const { data: pricesData } = await supabase
    .from('price_history')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(50)

  const prices = (pricesData || []) as PriceHistoryRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Price Intelligence
        </h1>
        <p className="text-muted-foreground">Material and labor price tracking</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Recent Price Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prices.length > 0 ? (
            <div className="divide-y divide-border">
              {prices.map((price) => (
                <div key={price.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-medium">Item {price.master_item_id.slice(0, 8)}</span>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {price.vendor_id && <span>Vendor: {price.vendor_id.slice(0, 8)}</span>}
                        {price.change_pct != null && (
                          <span className={price.change_pct > 0 ? 'text-red-600' : 'text-green-600'}>
                            {price.change_pct > 0 ? '+' : ''}{price.change_pct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-medium">{formatCurrency(price.new_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No price data yet</p>
              <p className="text-sm text-muted-foreground mt-1">Prices are tracked automatically from invoices and purchase orders</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
