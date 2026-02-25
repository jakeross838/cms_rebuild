import Link from 'next/link'

import { Plus, Search, FileText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface Invoice {
  id: string
  invoice_number: string | null
  amount: number
  status: string | null
  invoice_date: string | null
  due_date: string | null
  vendor_id: string | null
  notes: string | null
}

export default async function JobInvoicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { id: jobId } = await params
  const sparams = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('invoices')
    .select('*')
    .eq('job_id', jobId)
    .order('invoice_date', { ascending: false })

  if (sparams.status) {
    query = query.eq('status', sparams.status as 'draft' | 'approved' | 'pm_pending' | 'accountant_pending' | 'owner_pending' | 'in_draw' | 'paid' | 'denied')
  }

  const { data: invoicesData } = await query
  const invoices = (invoicesData || []) as Invoice[]

  const total = invoices.reduce((s, i) => s + i.amount, 0)
  const outstanding = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'approved', label: 'Approved' },
    { value: 'paid', label: 'Paid' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">
            {invoices.length} invoices &bull; {formatCurrency(total)} total &bull; {formatCurrency(outstanding)} outstanding
          </p>
        </div>
        <Link href="/invoices/new"><Button><Plus className="h-4 w-4 mr-2" />New Invoice</Button></Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
        {statusFilters.map((filter) => (
          <Link key={filter.value} href={filter.value ? `?status=${filter.value}` : '?'}>
            <Button variant={sparams.status === filter.value || (!sparams.status && !filter.value) ? 'default' : 'outline'} size="sm">{filter.label}</Button>
          </Link>
        ))}
      </div>

      {invoices.length > 0 ? (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {inv.invoice_number && <span className="text-sm font-mono text-muted-foreground">#{inv.invoice_number}</span>}
                      {inv.status && <Badge className={getStatusColor(inv.status)}>{inv.status.replace('_', ' ')}</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 ml-6">
                      {inv.invoice_date && formatDate(inv.invoice_date)}
                      {inv.due_date && ` • Due ${formatDate(inv.due_date)}`}
                      {inv.notes && ` • ${inv.notes}`}
                    </div>
                  </div>
                  <span className="font-bold text-lg">{formatCurrency(inv.amount)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No invoices</h3>
          <p className="text-muted-foreground">{sparams.status ? 'Try a different filter' : 'No invoices for this job yet'}</p>
        </div>
      )}
    </div>
  )
}
