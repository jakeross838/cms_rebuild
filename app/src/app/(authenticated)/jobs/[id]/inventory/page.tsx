import Link from 'next/link'

import { Plus, Package, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

interface InventoryItem {
  id: string
  name: string
  sku: string | null
  category: string | null
  unit_of_measure: string
  unit_cost: number | null
  is_active: boolean
}

export default async function JobInventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string }>
}) {
  const { id: jobId } = await params
  const sp = await searchParams
  const supabase = await createClient()

  // Get inventory transactions for this job to find which items are used
  const { data: transactionsData } = await supabase
    .from('inventory_transactions')
    .select('item_id, quantity, transaction_type')
    .eq('job_id', jobId)

  const transactions = transactionsData || []
  const itemIds = [...new Set(transactions.map((t) => t.item_id))]

  let items: InventoryItem[] = []
  if (itemIds.length > 0) {
    let itemsQuery = supabase
      .from('inventory_items')
      .select('id, name, sku, category, unit_of_measure, unit_cost, is_active')
      .in('id', itemIds)
      .order('name', { ascending: true })

    if (sp.search) {
      itemsQuery = itemsQuery.or(`name.ilike.%${sp.search}%,sku.ilike.%${sp.search}%`)
    }

    const { data: itemsData } = await itemsQuery
    items = (itemsData || []) as InventoryItem[]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Inventory</h1>
          <p className="text-muted-foreground">{items.length} items &bull; {transactions.length} transactions</p>
        </div>
        <Link href={`/jobs/${jobId}/inventory/new`}><Button><Plus className="h-4 w-4 mr-2" />Add Material</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search materials..." defaultValue={sp.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Materials Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <Link key={item.id} href={`/inventory/${item.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        {item.sku && <span className="text-xs font-mono text-muted-foreground">{item.sku}</span>}
                        {item.category && <Badge variant="outline" className="text-xs">{item.category}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.unit_of_measure}</p>
                    </div>
                    {item.unit_cost != null && (
                      <span className="font-medium">{formatCurrency(item.unit_cost)}/{item.unit_of_measure}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No materials tracked for this job yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
