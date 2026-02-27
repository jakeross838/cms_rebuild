import type { Metadata } from 'next'

import { Building2, Calendar } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatDate, getStatusColor , formatStatus } from '@/lib/utils'

interface FinancialPeriod {
  id: string
  period_name: string
  fiscal_year: number
  fiscal_quarter: number | null
  period_start: string
  period_end: string
  status: string
  closed_at: string | null
  created_at: string | null
}

export const metadata: Metadata = { title: 'Business Management' }

export default async function BusinessManagementPage() {
  const { companyId, supabase } = await getServerAuth()

  const [
    { data: periodsData },
    { count: jobCount },
    { count: activeJobCount },
    { count: accountCount },
  ] = await Promise.all([
    supabase.from('financial_periods').select('*').eq('company_id', companyId).order('period_start', { ascending: false }).limit(12),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('company_id', companyId),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('company_id', companyId).eq('status', 'active'),
    supabase.from('gl_accounts').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('company_id', companyId),
  ])

  const periods = (periodsData || []) as FinancialPeriod[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Business Management</h1>
        <p className="text-muted-foreground">Company P&L, overhead, and capacity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Total Jobs</p>
            <p className="text-2xl font-bold">{jobCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Active Jobs</p>
            <p className="text-2xl font-bold text-green-600">{activeJobCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">GL Accounts</p>
            <p className="text-2xl font-bold">{accountCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Financial Periods</p>
            <p className="text-2xl font-bold">{periods.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Financial Periods
          </CardTitle>
        </CardHeader>
        <CardContent>
          {periods.length > 0 ? (
            <div className="divide-y divide-border">
              {periods.map((period) => (
                <div key={period.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{period.period_name}</span>
                        <Badge className={getStatusColor(period.status)}>{formatStatus(period.status)}</Badge>
                        {period.fiscal_quarter && <Badge variant="outline" className="text-xs">Q{period.fiscal_quarter}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        FY {period.fiscal_year} &bull; {formatDate(period.period_start)} — {formatDate(period.period_end)}
                      </p>
                    </div>
                    {period.closed_at && <span className="text-xs text-muted-foreground">Closed {formatDate(period.closed_at)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No financial periods configured yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
