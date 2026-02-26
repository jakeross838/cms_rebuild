import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, FileCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface PermitRow {
  id: string
  permit_number: string | null
  permit_type: string | null
  jurisdiction: string | null
  status: string | null
  applied_date: string | null
  issued_date: string | null
  expiration_date: string | null
  created_at: string | null
}

export default async function PermitsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('permits')
    .select('id, permit_number, permit_type, jurisdiction, status, applied_date, issued_date, expiration_date, created_at')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (params.search) {
    query = query.ilike('permit_number', `%${params.search}%`)
  }

  const { data: permitsData } = await query
  const permits = (permitsData || []) as PermitRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Permits</h1>
          <p className="text-muted-foreground">Track building permits and approvals</p>
        </div>
        <Link href="/permits/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Permit
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
              placeholder="Search by permit number..."
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {permits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Permit #</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Jurisdiction</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Applied</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Issued</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {permits.map((permit) => (
                  <tr key={permit.id} className="hover:bg-accent transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/permits/${permit.id}`} className="font-medium text-foreground hover:underline">
                        {permit.permit_number || 'No number'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{permit.permit_type || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{permit.jurisdiction || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${getStatusColor(permit.status ?? 'draft')} rounded`}>
                        {permit.status || 'Applied'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(permit.applied_date)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(permit.issued_date)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(permit.expiration_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No permits found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search
                ? 'Try adjusting your search'
                : 'Get started by adding your first permit'}
            </p>
            <Link href="/permits/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Permit
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
