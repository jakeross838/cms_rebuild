import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, Receipt } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface Invoice {
  id: string
  invoice_number: string | null
  amount: number | null
  status: string | null
  invoice_date: string | null
  due_date: string | null
  notes: string | null
  jobs: { name: string } | null
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
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


  let query = supabase
    .from('invoices')
    .select('*, jobs(name)', { count: 'exact' })
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status as 'draft' | 'approved' | 'pm_pending' | 'accountant_pending' | 'owner_pending' | 'in_draw' | 'paid' | 'denied')
  }

  if (params.search) {
    query = query.ilike('invoice_number', `%${params.search}%`)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data: invoicesData, count } = await query
  const invoices = (invoicesData || []) as Invoice[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  const totalPending = invoices
    .filter((inv) => inv.status !== 'paid' && inv.status !== 'void')
    .reduce((sum, inv) => sum + (inv.amount ?? 0), 0)

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'paid', label: 'Paid' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">{count || 0} total invoices • {formatCurrency(totalPending)} outstanding</p>
        </div>
        <Link href="/invoices/new"><Button><Plus className="h-4 w-4 mr-2" />New Invoice</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form><Input type="search" name="search" placeholder="Search invoices..." defaultValue={params.search} className="pl-10" /></form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => (
            <Link key={filter.value} href={filter.value ? `/invoices?status=${filter.value}` : '/invoices'}>
              <Button variant={params.status === filter.value || (!params.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {invoices.length > 0 ? (
          <div className="divide-y divide-border">
            {invoices.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="block p-4 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {inv.invoice_number && <span className="text-sm font-mono text-muted-foreground">{inv.invoice_number}</span>}
                      <Badge className={getStatusColor(inv.status ?? 'draft')}>{(inv.status ?? 'draft').replace('_', ' ')}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {inv.jobs?.name || 'No job'}
                      {inv.due_date ? ` • Due ${formatDate(inv.due_date)}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono">{formatCurrency(inv.amount)}</div>
                    <div className="text-xs text-muted-foreground">{inv.invoice_date ? formatDate(inv.invoice_date) : ''}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No invoices found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status ? 'Try adjusting your filters' : 'No invoices yet'}
            </p>
            <Link href="/invoices/new" className="text-sm font-medium text-primary hover:underline">Create your first invoice</Link>
          </div>
        )}
      </div>
      <ListPagination currentPage={page} totalPages={totalPages} basePath="/invoices" searchParams={params as Record<string, string | undefined>} />
    </div>
  )
}
