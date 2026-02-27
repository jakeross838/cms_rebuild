import type { Metadata } from 'next'
import Link from 'next/link'

import { Plus, Search, Wrench } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { safeOrIlike, formatCurrency, getStatusColor } from '@/lib/utils'

interface Equipment {
  id: string
  name: string
  equipment_type: string | null
  make: string | null
  model: string | null
  year: number | null
  serial_number: string | null
  status: string | null
  location: string | null
  ownership_type: string | null
  daily_rate: number | null
  current_value: number | null
}

export const metadata: Metadata = { title: 'Equipment' }

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string; sort?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const { companyId, supabase } = await getServerAuth()

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    name: { column: 'name', ascending: true },
    status: { column: 'status', ascending: true },
    equipment_type: { column: 'equipment_type', ascending: true },
    daily_rate: { column: 'daily_rate', ascending: false },
  }
  const sort = sortMap[params.sort || ''] || { column: 'name', ascending: true }

  let query = supabase
    .from('equipment')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order(sort.column, { ascending: sort.ascending })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.or(`name.ilike.${safeOrIlike(params.search)},serial_number.ilike.${safeOrIlike(params.search)}`)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: equipmentData, count, error } = await query
  if (error) throw error
  const equipment = (equipmentData || []) as Equipment[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'in_use', label: 'In Use' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipment</h1>
          <p className="text-muted-foreground">Track assets, tools, and equipment</p>
        </div>
        <Link href="/equipment/new"><Button><Plus className="h-4 w-4 mr-2" />Add Equipment</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search equipment..." aria-label="Search equipment" defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => {
            const sp = new URLSearchParams()
            if (filter.value) sp.set('status', filter.value)
            if (params.search) sp.set('search', params.search)
            if (params.sort) sp.set('sort', params.sort)
            const qs = sp.toString()
            return (
              <Link key={filter.value} href={`/equipment${qs ? `?${qs}` : ''}`}>
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
          { value: '', label: 'Name' },
          { value: 'status', label: 'Status' },
          { value: 'equipment_type', label: 'Type' },
          { value: 'daily_rate', label: 'Daily Rate' },
        ].map((s) => {
          const sp = new URLSearchParams()
          if (params.search) sp.set('search', params.search)
          if (params.status) sp.set('status', params.status)
          if (s.value) sp.set('sort', s.value)
          if (params.page) sp.set('page', params.page)
          const qs = sp.toString()
          return (
            <Link key={s.value} href={`/equipment${qs ? `?${qs}` : ''}`}>
              <Button variant={(params.sort || '') === s.value ? 'default' : 'outline'} size="sm">
                {s.label}
              </Button>
            </Link>
          )
        })}
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {equipment.length > 0 ? (
          <div className="divide-y divide-border">
            {equipment.map((item) => (
              <Link key={item.id} href={`/equipment/${item.id}`} className="block p-4 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <Badge className={getStatusColor(item.status ?? 'available')}>{(item.status ?? 'available').replace('_', ' ')}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {[item.make, item.model, item.year].filter(Boolean).join(' ')}
                      {item.location ? ` • ${item.location}` : ''}
                      {item.serial_number ? ` • SN: ${item.serial_number}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.daily_rate != null && (
                      <div className="font-medium">{formatCurrency(item.daily_rate)}/day</div>
                    )}
                    {item.current_value != null && (
                      <div className="text-xs text-muted-foreground">Value: {formatCurrency(item.current_value)}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground mb-1">No equipment found</p>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status ? 'Try adjusting your filters' : 'Start tracking your equipment and tools'}
            </p>
            {!params.search && !params.status && (
              <Link href="/equipment/new"><Button><Plus className="h-4 w-4 mr-2" />Add Equipment</Button></Link>
            )}
          </div>
        )}
      </div>
      <ListPagination currentPage={page} totalPages={totalPages} basePath="/equipment" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
