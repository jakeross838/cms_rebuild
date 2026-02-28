import type { Metadata } from 'next'

import { TrendingUp, TrendingDown, DollarSign, ArrowRightLeft, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatCurrency, formatRelativeDate, getStatusColor } from '@/lib/utils'

export const metadata: Metadata = { title: 'Cash Flow' }

export default async function CashFlowPage() {
  const { companyId, supabase } = await getServerAuth()

  // ── Query receivables (AR) and payables (AP) in parallel ────────
  const [
    { data: paidInvoices },
    { data: pendingInvoices },
    { data: paidBills },
    { data: pendingBills },
    { count: overdueAR },
    { count: overdueAP },
    { data: recentPaidInvoices },
  ] = await Promise.all([
    // AR paid
    supabase
      .from('ar_invoices')
      .select('amount')
      .is('deleted_at', null)
      .eq('company_id', companyId)
      .eq('status', 'paid'),
    // AR pending (everything not paid)
    supabase
      .from('ar_invoices')
      .select('amount')
      .is('deleted_at', null)
      .eq('company_id', companyId)
      .neq('status', 'paid'),
    // AP paid
    supabase
      .from('ap_bills')
      .select('balance_due')
      .is('deleted_at', null)
      .eq('company_id', companyId)
      .eq('status', 'paid'),
    // AP pending (everything not paid)
    supabase
      .from('ap_bills')
      .select('balance_due')
      .is('deleted_at', null)
      .eq('company_id', companyId)
      .neq('status', 'paid'),
    // Overdue AR count
    supabase
      .from('ar_invoices')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('company_id', companyId)
      .neq('status', 'paid')
      .lt('due_date', new Date().toISOString().split('T')[0]),
    // Overdue AP count
    supabase
      .from('ap_bills')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('company_id', companyId)
      .neq('status', 'paid')
      .lt('due_date', new Date().toISOString().split('T')[0]),
    // Recent cash movements: last 10 invoices marked paid
    supabase
      .from('ar_invoices')
      .select('id, invoice_number, amount, updated_at, status')
      .is('deleted_at', null)
      .eq('company_id', companyId)
      .eq('status', 'paid')
      .order('updated_at', { ascending: false })
      .limit(10),
  ])

  // ── Compute totals ─────────────────────────────────────────────
  const totalReceivable = (pendingInvoices || []).reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const totalCollected = (paidInvoices || []).reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const totalPayable = (pendingBills || []).reduce((sum, p) => sum + Number(p.balance_due || 0), 0)
  const totalPaidOut = (paidBills || []).reduce((sum, p) => sum + Number(p.balance_due || 0), 0)
  const cashPosition = totalReceivable - totalPayable

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cash Flow</h1>
        <p className="text-muted-foreground">Receivables vs. payables overview</p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Total Receivable</p>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalReceivable)}</p>
            {(overdueAR ?? 0) > 0 && (
              <p className="text-xs text-amber-600">{overdueAR} overdue</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-sm text-muted-foreground">Total Payable</p>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalPayable)}</p>
            {(overdueAP ?? 0) > 0 && (
              <p className="text-xs text-amber-600">{overdueAP} overdue</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              <p className="text-sm text-muted-foreground">Cash Position</p>
            </div>
            <p className={`text-2xl font-bold mt-1 ${cashPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(cashPosition)}
            </p>
            <p className="text-xs text-muted-foreground">Receivable - Payable</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-muted-foreground">Total Collected</p>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalCollected)}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalPaidOut)} paid out</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Cash Movements ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Cash Movements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(recentPaidInvoices || []).length > 0 ? (
            <div className="space-y-3">
              {(recentPaidInvoices || []).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-green-50 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Invoice {inv.invoice_number || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(inv.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      +{formatCurrency(Number(inv.amount))}
                    </p>
                    <Badge className={`${getStatusColor('paid')} rounded text-xs`}>Paid</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No paid invoices yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Recent payment activity will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
