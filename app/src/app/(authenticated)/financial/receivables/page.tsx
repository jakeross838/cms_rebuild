import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, ArrowDownRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Accounts Receivable' }

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  let query = supabase
    .from('ar_invoices')
    .select('*')
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order('due_date', { ascending: true })

  if (params.search) {
    query = query.ilike('invoice_number', `%${escapeLike(params.search)}%`)
  }

  const { data: invoicesData, error } = await query
  if (error) throw error
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
        <form><Input type="search" name="search" placeholder="Search receivables..." aria-label="Search receivables" defaultValue={params.search} className="pl-10" /></form>
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
                <Link key={inv.id} href={`/financial/receivables/${inv.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
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
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ArrowDownRight className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No receivables yet</p>
              <Link href="/financial/receivables/new" className="text-sm font-medium text-primary hover:underline">Create your first receivable</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
