import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  DollarSign,
  FileText,
  TrendingDown,
  TrendingUp,
  Receipt,
  Landmark,
  ArrowRight,
  BarChart3,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

// ── Helpers ──────────────────────────────────────────────────────────

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function fmtCurrency(value: number): string {
  return currencyFmt.format(value)
}

// ── Page ─────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Financial Overview' }

export default async function FinancialDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id, name').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  // ── Parallel data fetching ──
  const [
    contractsRes,
    invoicedRes,
    paidRes,
    outstandingArRes,
    apBalanceRes,
    budgetLinesRes,
    recentBillsRes,
    recentDrawsRes,
  ] = await Promise.all([
    // Total contract value (from contracts table, exclude voided)
    supabase.from('contracts').select('contract_value')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .neq('status', 'voided'),

    // Total invoiced (all non-deleted invoices)
    supabase.from('invoices').select('amount')
      .eq('company_id', companyId),

    // Total paid
    supabase.from('invoices').select('amount')
      .eq('company_id', companyId)
      .eq('status', 'paid'),

    // Outstanding AR (draft + pending statuses)
    supabase.from('invoices').select('amount')
      .eq('company_id', companyId)
      .in('status', ['draft', 'pm_pending', 'accountant_pending', 'owner_pending', 'approved', 'in_draw']),

    // AP balance (unpaid, non-voided bills)
    supabase.from('ap_bills').select('balance_due')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .not('status', 'in', '("paid","voided")'),

    // Budget lines (estimated vs actual)
    supabase.from('budget_lines').select('estimated_amount, actual_amount, variance_amount')
      .eq('company_id', companyId),

    // Recent AP bills (last 5)
    supabase.from('ap_bills').select('id, bill_number, amount, balance_due, status, due_date, vendor_id, vendors(name)')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),

    // Recent draw requests (last 5)
    supabase.from('draw_requests').select('id, draw_number, current_due, total_earned, status, application_date, job_id, jobs(name)')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // ── Compute KPIs ──
  const totalContractValue = (contractsRes.data || []).reduce(
    (sum: number, c: { contract_value: number | null }) => sum + (c.contract_value || 0), 0
  )

  const totalInvoiced = (invoicedRes.data || []).reduce(
    (sum: number, inv: { amount: number }) => sum + inv.amount, 0
  )

  const totalPaid = (paidRes.data || []).reduce(
    (sum: number, inv: { amount: number }) => sum + inv.amount, 0
  )

  const outstandingAr = (outstandingArRes.data || []).reduce(
    (sum: number, inv: { amount: number }) => sum + inv.amount, 0
  )

  const apBalance = (apBalanceRes.data || []).reduce(
    (sum: number, bill: { balance_due: number }) => sum + bill.balance_due, 0
  )

  // ── Budget aggregation ──
  const budgetLines = budgetLinesRes.data || []
  const budgetLineCount = budgetLines.length
  const totalEstimated = budgetLines.reduce(
    (sum: number, bl: { estimated_amount: number }) => sum + bl.estimated_amount, 0
  )
  const totalActual = budgetLines.reduce(
    (sum: number, bl: { actual_amount: number }) => sum + bl.actual_amount, 0
  )
  const totalVariance = totalEstimated - totalActual

  // ── Type recent data ──
  const recentBills = (recentBillsRes.data || []) as {
    id: string
    bill_number: string
    amount: number
    balance_due: number
    status: string
    due_date: string
    vendor_id: string
    vendors: { name: string } | null
  }[]

  const recentDraws = (recentDrawsRes.data || []) as {
    id: string
    draw_number: number
    current_due: number
    total_earned: number
    status: string
    application_date: string
    job_id: string
    jobs: { name: string } | null
  }[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financial Dashboard</h1>
        <p className="text-muted-foreground">Company-wide financial overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Contract Value</p>
                <p className="text-2xl font-bold">{fmtCurrency(totalContractValue)}</p>
                <p className="text-xs text-muted-foreground">all active contracts</p>
              </div>
              <Landmark className="h-8 w-8 text-blue-500/70" />
            </div>
          </CardContent>
        </Card>

        <Link href="/invoices">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Invoiced</p>
                  <p className="text-2xl font-bold">{fmtCurrency(totalInvoiced)}</p>
                  <p className="text-xs text-muted-foreground">{fmtCurrency(totalPaid)} paid</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/invoices?status=pending">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Outstanding AR</p>
                  <p className="text-2xl font-bold">{fmtCurrency(outstandingAr)}</p>
                  <p className="text-xs text-muted-foreground">awaiting payment</p>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">AP Balance</p>
                <p className="text-2xl font-bold">{fmtCurrency(apBalance)}</p>
                <p className="text-xs text-muted-foreground">bills outstanding</p>
              </div>
              <Receipt className="h-8 w-8 text-red-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgetLineCount > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Budget Lines</p>
                <p className="text-xl font-bold">{budgetLineCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Estimated</p>
                <p className="text-xl font-bold">{fmtCurrency(totalEstimated)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Actual</p>
                <p className="text-xl font-bold">{fmtCurrency(totalActual)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Variance</p>
                <div className="flex items-center gap-2">
                  <p className={`text-xl font-bold ${totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmtCurrency(totalVariance)}
                  </p>
                  {totalVariance >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalVariance >= 0 ? 'under budget' : 'over budget'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No budget lines yet</p>
          )}
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent AP Bills */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Recent AP Bills
              </CardTitle>
              <Link href="/accounting/ap" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentBills.length > 0 ? (
              <div className="divide-y divide-border">
                {recentBills.map((bill) => (
                  <div key={bill.id} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{bill.bill_number}</span>
                          <span className="text-sm font-medium">{bill.vendors?.name ?? 'Unknown vendor'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Due {formatDate(bill.due_date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{fmtCurrency(bill.balance_due)}</span>
                        <Badge className={getStatusColor(bill.status)}>
                          {bill.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No AP bills yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Draw Requests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Recent Draw Requests
              </CardTitle>
              <Link href="/draw-requests" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentDraws.length > 0 ? (
              <div className="divide-y divide-border">
                {recentDraws.map((draw) => (
                  <div key={draw.id} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">Draw #{draw.draw_number}</span>
                          <span className="text-sm font-medium">{draw.jobs?.name ?? 'Unknown job'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(draw.application_date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{fmtCurrency(draw.current_due)}</span>
                        <Badge className={getStatusColor(draw.status)}>
                          {draw.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No draw requests yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
