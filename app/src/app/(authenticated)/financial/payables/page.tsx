import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, ArrowUpRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface APBill {
  id: string
  bill_number: string
  vendor_id: string
  amount: number
  balance_due: number
  status: string
  bill_date: string
  due_date: string
  description: string | null
}

export default async function PayablesPage({
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
    .from('ap_bills')
    .select('*')
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order('due_date', { ascending: true })

  if (params.search) {
    query = query.ilike('bill_number', `%${params.search}%`)
  }

  const { data: billsData } = await query
  const bills = (billsData || []) as APBill[]

  const totalOutstanding = bills.reduce((sum, b) => sum + (b.balance_due ?? 0), 0)
  const overdue = bills.filter((b) => new Date(b.due_date) < new Date() && b.balance_due > 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounts Payable</h1>
          <p className="text-muted-foreground">{formatCurrency(totalOutstanding)} outstanding {overdue > 0 ? `• ${overdue} overdue` : ''}</p>
        </div>
        <Link href="/financial/payables/new"><Button><Plus className="h-4 w-4 mr-2" />New Bill</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search bills..." defaultValue={params.search} className="pl-10" /></form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5" />
            Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bills.length > 0 ? (
            <div className="divide-y divide-border">
              {bills.map((bill) => (
                <Link key={bill.id} href={`/financial/payables/${bill.id}`} className="block py-3 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground">{bill.bill_number}</span>
                        <Badge className={getStatusColor(bill.status)}>{bill.status.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {bill.description && <span className="truncate max-w-[200px]">{bill.description}</span>}
                        <span>Billed: {formatDate(bill.bill_date)}</span>
                        <span>Due: {formatDate(bill.due_date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono">{formatCurrency(bill.balance_due)}</div>
                      <div className="text-xs text-muted-foreground">of {formatCurrency(bill.amount)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ArrowUpRight className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No bills yet</p>
              <Link href="/financial/payables/new" className="text-sm font-medium text-primary hover:underline">Create your first bill</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
