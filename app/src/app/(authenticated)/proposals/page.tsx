import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, FileText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface Estimate {
  id: string
  name: string
  status: string
  version: number
  estimate_type: string
  total: number | null
  created_at: string
  jobs: { name: string } | null
}

export default async function ProposalsPage({
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
    .from('estimates')
    .select('id, name, status, version, estimate_type, total, created_at, jobs(name)')
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.ilike('name', `%${escapeLike(params.search)}%`)
  }

  const { data: estimatesData } = await query
  const estimates = (estimatesData || []) as Estimate[]

  const sent = estimates.filter((e) => e.status === 'sent' || e.status === 'presented').length
  const totalValue = estimates.reduce((s, e) => s + (e.total || 0), 0)

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
          <p className="text-muted-foreground">{estimates.length} proposals &bull; {formatCurrency(totalValue)} total value</p>
        </div>
        <Link href="/estimates/new"><Button><Plus className="h-4 w-4 mr-2" />New Proposal</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search proposals..." aria-label="Search proposals" defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => (
            <Link key={filter.value} href={filter.value ? `/proposals?status=${filter.value}` : '/proposals'}>
              <Button variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
            </Link>
          ))}
        </div>
      </div>

      {estimates.length > 0 ? (
        <div className="space-y-2">
          {estimates.map((est) => (
            <Link key={est.id} href={`/estimates/${est.id}`} className="block hover:ring-1 hover:ring-ring rounded-lg transition-all">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{est.name}</span>
                        <Badge className={getStatusColor(est.status)}>{est.status}</Badge>
                        <Badge variant="outline" className="text-xs">v{est.version}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 ml-6">
                        {est.jobs?.name && <span>{est.jobs.name} &bull; </span>}
                        {formatDate(est.created_at)}
                      </div>
                    </div>
                    {est.total != null && (
                      <span className="font-bold text-lg">{formatCurrency(est.total)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground mb-1">No proposals found</p>
          <p className="text-muted-foreground">{params.search || params.status ? 'Try adjusting your filters' : 'Create your first proposal from an estimate'}</p>
        </div>
      )}
    </div>
  )
}
