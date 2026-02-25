import Link from 'next/link'

import { Plus, Search, Package } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

interface InventoryItem {
  id: string
  name: string
  sku: string | null
  category: string | null
  description: string | null
  unit_of_measure: string
  unit_cost: number | null
  reorder_point: number | null
  is_active: boolean
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('inventory_items')
    .select('*')
    .order('name', { ascending: true })

  if (params.category) {
    query = query.eq('category', params.category)
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%`)
  }

  const { data: itemsData } = await query
  const items = (itemsData || []) as InventoryItem[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">{items.length} items tracked</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search inventory..." defaultValue={params.search} className="pl-10" /></form>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {items.length > 0 ? (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="p-4 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      {item.sku && <span className="text-xs font-mono text-muted-foreground">{item.sku}</span>}
                      <Badge variant="outline" className={item.is_active ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {item.category || 'Uncategorized'} • {item.unit_of_measure}
                      {item.description ? ` • ${item.description}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.unit_cost != null && (
                      <div className="font-medium">{formatCurrency(item.unit_cost)}/{item.unit_of_measure}</div>
                    )}
                    {item.reorder_point != null && (
                      <div className="text-xs text-muted-foreground">Reorder at: {item.reorder_point}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No inventory items found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search || params.category ? 'Try adjusting your filters' : 'Start tracking your materials and supplies'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
