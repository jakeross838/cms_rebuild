import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, Truck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { escapeLike } from '@/lib/utils'

interface VendorRow {
  id: string
  name: string
  email: string | null
  phone: string | null
  trade: string | null
  is_active: boolean | null
}

export const metadata: Metadata = { title: 'Vendors' }

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; trade?: string; page?: string; sort?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    name: { column: 'name', ascending: true },
    trade: { column: 'trade', ascending: true },
    created_at: { column: 'created_at', ascending: false },
  }
  const sort = sortMap[params.sort || ''] || { column: 'created_at', ascending: false }

  let query = supabase
    .from('vendors')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order(sort.column, { ascending: sort.ascending })

  if (params.search) {
    query = query.or(`name.ilike.%${escapeLike(params.search)}%`)
  }

  if (params.trade) {
    query = query.eq('trade', params.trade)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: vendorsData, count, error } = await query
  if (error) throw error
  const vendors = (vendorsData || []) as VendorRow[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
          <p className="text-muted-foreground">{count || 0} total vendors</p>
        </div>
        <Link href="/vendors/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Vendor
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
              placeholder="Search vendors..."
              aria-label="Search vendors"
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground self-center">Sort:</span>
        {[
          { value: '', label: 'Newest' },
          { value: 'name', label: 'Name' },
          { value: 'trade', label: 'Trade' },
        ].map((s) => {
          const sp = new URLSearchParams()
          if (params.search) sp.set('search', params.search)
          if (params.trade) sp.set('trade', params.trade)
          if (s.value) sp.set('sort', s.value)
          if (params.page) sp.set('page', params.page)
          const qs = sp.toString()
          return (
            <Link key={s.value} href={`/vendors${qs ? `?${qs}` : ''}`}>
              <Button variant={(params.sort || '') === s.value ? 'default' : 'outline'} size="sm">
                {s.label}
              </Button>
            </Link>
          )
        })}
      </div>

      {/* Vendors list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {vendors.length > 0 ? (
          <div className="divide-y divide-border">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="block p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {vendor.name}
                          </span>
                          {!vendor.is_active && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {vendor.trade || 'No trade'} {vendor.email ? `• ${vendor.email}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">No vendors found</p>
            <p className="text-muted-foreground mb-4">
              {params.search
                ? 'Try adjusting your search'
                : 'Get started by adding your first vendor'}
            </p>
            <Link href="/vendors/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </Link>
          </div>
        )}
      </div>
      <ListPagination currentPage={page} totalPages={totalPages} basePath="/vendors" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
