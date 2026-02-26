import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function CashFlowPage() {
  const supabase = await createClient()

  const [
    { data: receivables },
    { data: payables },
    { count: overdueAR },
    { count: overdueAP },
  ] = await Promise.all([
    supabase.from('ar_invoices').select('amount').is('deleted_at', null).neq('status', 'paid'),
    supabase.from('ap_bills').select('amount').is('deleted_at', null).neq('status', 'paid'),
    supabase.from('ar_invoices').select('*', { count: 'exact', head: true }).is('deleted_at', null).neq('status', 'paid').lt('due_date', new Date().toISOString().split('T')[0]),
    supabase.from('ap_bills').select('*', { count: 'exact', head: true }).is('deleted_at', null).neq('status', 'paid').lt('due_date', new Date().toISOString().split('T')[0]),
  ])

  const totalAR = (receivables || []).reduce((sum, r) => sum + (r.amount || 0), 0)
  const totalAP = (payables || []).reduce((sum, p) => sum + (p.amount || 0), 0)
  const netPosition = totalAR - totalAP

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cash Flow</h1>
        <p className="text-muted-foreground">Receivables vs. payables overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Incoming (AR)</p>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalAR)}</p>
            {(overdueAR ?? 0) > 0 && <p className="text-xs text-amber-600">{overdueAR} overdue</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-sm text-muted-foreground">Outgoing (AP)</p>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalAP)}</p>
            {(overdueAP ?? 0) > 0 && <p className="text-xs text-amber-600">{overdueAP} overdue</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <p className="text-sm text-muted-foreground">Net Position</p>
            </div>
            <p className={`text-2xl font-bold mt-1 ${netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netPosition)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-muted-foreground">Total Overdue</p>
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-1">{(overdueAR ?? 0) + (overdueAP ?? 0)}</p>
            <p className="text-xs text-muted-foreground">invoices + bills</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">Forecast Coming Soon</h3>
            <p className="text-muted-foreground">
              Cash flow projections based on invoice due dates and bill schedules will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
