import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, Wrench } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getStatusColor } from '@/lib/utils'

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

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }


  let query = supabase
    .from('equipment')
    .select('*')
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order('name', { ascending: true })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,serial_number.ilike.%${params.search}%`)
  }

  const { data: equipmentData } = await query
  const equipment = (equipmentData || []) as Equipment[]

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
          <form><Input type="search" name="search" placeholder="Search equipment..." defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => (
            <Link key={filter.value} href={filter.value ? `/equipment?status=${filter.value}` : '/equipment'}>
              <Button variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
            </Link>
          ))}
        </div>
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
            <h3 className="text-lg font-medium text-foreground mb-1">No equipment found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status ? 'Try adjusting your filters' : 'Start tracking your equipment and tools'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
