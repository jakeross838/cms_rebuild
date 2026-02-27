import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Plus, Package, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { safeOrIlike, formatCurrency } from '@/lib/utils'

import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Inventory' }

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
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { id: jobId } = await params
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
  if (!jobCheck) { notFound() }

  // Get inventory transactions for this job to find which items are used
  const { data: transactionsData, error: txError } = await supabase
    .from('inventory_transactions')
    .select('item_id, quantity, transaction_type')
    .eq('job_id', jobId)
    .is('deleted_at', null)

  if (txError) throw txError
  const transactions = transactionsData || []
  const itemIds = [...new Set(transactions.map((t) => t.item_id))]

  let items: InventoryItem[] = []
  let totalPages = 0
  if (itemIds.length > 0) {
    let itemsQuery = supabase
      .from('inventory_items')
      .select('id, name, sku, category, unit_of_measure, unit_cost, is_active', { count: 'exact' })
      .in('id', itemIds)
      .is('deleted_at', null)

    if (sp.search) {
      const searchTerm = safeOrIlike(sp.search)
      itemsQuery = itemsQuery.or(`name.ilike.${searchTerm},sku.ilike.${searchTerm}`)
    }

    const { data: itemsData, count, error: itemsError } = await itemsQuery
      .order('name', { ascending: true })
      .range(offset, offset + pageSize - 1)
    if (itemsError) throw itemsError
    items = (itemsData || []) as InventoryItem[]
    totalPages = Math.ceil((count || 0) / pageSize)
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
        <form><Input type="search" name="search" placeholder="Search materials..." aria-label="Search materials" defaultValue={sp.search} className="pl-10" /></form>
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

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${jobId}/inventory`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
