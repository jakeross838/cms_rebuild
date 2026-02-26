import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, Shield } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface Warranty {
  id: string
  title: string | null
  warranty_type: string | null
  status: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  created_at: string | null
  job_id: string | null
}

export const metadata: Metadata = { title: 'Warranties' }

export default async function WarrantiesPage({
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
    .from('warranties')
    .select('*')
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.ilike('title', `%${params.search}%`)
  }

  const { data: warrantiesData } = await query
  const warranties = (warrantiesData || []) as Warranty[]

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'expiring_soon', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' },
    { value: 'claimed', label: 'Claimed' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warranties</h1>
          <p className="text-muted-foreground">Track warranties and coverage</p>
        </div>
        <Link href="/warranties/new"><Button><Plus className="h-4 w-4 mr-2" />Add Warranty</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search warranties..." aria-label="Search warranties" defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => (
            <Link key={filter.value} href={filter.value ? `/warranties?status=${filter.value}` : '/warranties'}>
              <Button variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {warranties.length > 0 ? (
          <div className="divide-y divide-border">
            {warranties.map((warranty) => (
              <Link key={warranty.id} href={`/warranties/${warranty.id}`} className="block p-4 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{warranty.title ?? 'Untitled'}</span>
                      <Badge className={getStatusColor(warranty.status ?? 'active')}>{(warranty.status ?? 'active').replace('_', ' ')}</Badge>
                      {warranty.warranty_type && <Badge variant="outline" className="text-xs">{warranty.warranty_type.replace('_', ' ')}</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {warranty.job_id ? 'Job assigned' : 'No job'}
                      {warranty.start_date && warranty.end_date ? ` • ${formatDate(warranty.start_date)} — ${formatDate(warranty.end_date)}` : ''}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No warranties found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status ? 'Try adjusting your filters' : 'Add warranties for your projects'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
