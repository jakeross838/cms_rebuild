import Link from 'next/link'

import { Plus, Search, ArrowDownRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface ARInvoice {
  id: string
  invoice_number: string
  client_id: string
  amount: number
  balance_due: number
  status: string
  invoice_date: string
  due_date: string
  notes: string | null
}

export default async function ReceivablesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('ar_invoices')
    .select('*')
    .order('due_date', { ascending: true })

  if (params.search) {
    query = query.ilike('invoice_number', `%${params.search}%`)
  }

  const { data: invoicesData } = await query
  const invoices = (invoicesData || []) as ARInvoice[]

  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.balance_due ?? 0), 0)
  const overdue = invoices.filter((inv) => inv.due_date && new Date(inv.due_date) < new Date() && (inv.balance_due ?? 0) > 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounts Receivable</h1>
          <p className="text-muted-foreground">{formatCurrency(totalOutstanding)} outstanding {overdue > 0 ? `• ${overdue} overdue` : ''}</p>
        </div>
        <Link href="/financial/receivables/new"><Button><Plus className="h-4 w-4 mr-2" />New Invoice</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search receivables..." defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownRight className="h-5 w-5" />
            Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="divide-y divide-border">
              {invoices.map((inv) => (
                <div key={inv.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground">{inv.invoice_number}</span>
                        <Badge className={getStatusColor(inv.status)}>{inv.status.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Issued: {formatDate(inv.invoice_date)}</span>
                        <span>Due: {formatDate(inv.due_date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono">{formatCurrency(inv.balance_due)}</div>
                      <div className="text-xs text-muted-foreground">of {formatCurrency(inv.amount)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ArrowDownRight className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No receivables yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
