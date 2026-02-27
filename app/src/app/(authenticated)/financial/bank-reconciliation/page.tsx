import type { Metadata } from 'next'

import { Landmark } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatDate, getStatusColor } from '@/lib/utils'

export const metadata: Metadata = { title: 'Bank Reconciliation' }

interface FinancialPeriod {
  id: string
  period_name: string
  fiscal_year: number
  fiscal_quarter: number | null
  period_start: string
  period_end: string
  status: string
  closed_at: string | null
  closed_by: string | null
  created_at: string | null
}

export default async function BankReconciliationPage() {
  const { companyId, supabase } = await getServerAuth()

  const { data: periodsData, error } = await supabase
    .from('financial_periods')
    .select('*')
    .eq('company_id', companyId)
    .order('period_start', { ascending: false })
  if (error) throw error

  const periods = (periodsData || []) as FinancialPeriod[]

  const open = periods.filter((p) => p.status === 'open').length
  const closed = periods.filter((p) => p.status === 'closed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bank Reconciliation</h1>
        <p className="text-muted-foreground">
          {periods.length} periods &bull; {open} open &bull; {closed} closed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Total Periods</p>
            <p className="text-2xl font-bold">{periods.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Open Periods</p>
            <p className="text-2xl font-bold text-amber-600">{open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Closed Periods</p>
            <p className="text-2xl font-bold text-green-600">{closed}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Financial Periods
          </CardTitle>
        </CardHeader>
        <CardContent>
          {periods.length > 0 ? (
            <div className="divide-y divide-border">
              {periods.map((period) => (
                <div key={period.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{period.period_name}</span>
                        <Badge className={getStatusColor(period.status)}>{period.status}</Badge>
                        {period.fiscal_quarter && (
                          <Badge variant="outline" className="text-xs">Q{period.fiscal_quarter}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        FY {period.fiscal_year} &bull; {formatDate(period.period_start)} — {formatDate(period.period_end)}
                      </div>
                    </div>
                    {period.closed_at && (
                      <span className="text-xs text-muted-foreground">Closed {formatDate(period.closed_at)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Landmark className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No financial periods configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
