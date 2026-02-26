import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  FileText,
  Receipt,
  PieChart,
  Users,
  Gift,
  Calculator,
  ArrowRight,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function RevenuePage() {
  const supabase = await createClient()

  // ── Resolve tenant ──────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user!.id)
    .single()
  const companyId = profile?.company_id

  // ── Query revenue data in parallel ──────────────────────────────
  const [
    { data: paidInvoices },
    { data: acceptedEstimates },
    { count: invoiceCount },
  ] = await Promise.all([
    // Total revenue: paid AR invoices
    supabase
      .from('ar_invoices')
      .select('amount')
      .is('deleted_at', null)
      .eq('company_id', companyId!)
      .eq('status', 'paid'),
    // Pipeline value: accepted estimates
    supabase
      .from('estimates')
      .select('total')
      .is('deleted_at', null)
      .eq('company_id', companyId!)
      .eq('status', 'accepted'),
    // Total invoice count
    supabase
      .from('ar_invoices')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('company_id', companyId!),
  ])

  // ── Compute KPIs ────────────────────────────────────────────────
  const totalRevenue = (paidInvoices || []).reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const pipelineValue = (acceptedEstimates || []).reduce((sum, e) => sum + Number(e.total || 0), 0)
  const totalInvoices = invoiceCount ?? 0
  const avgInvoice = totalInvoices > 0 ? totalRevenue / (paidInvoices || []).length : 0

  // ── Sub-page navigation ─────────────────────────────────────────
  const subPages = [
    {
      title: 'Revenue Attribution',
      description: 'Revenue breakdown by job',
      href: '/revenue/attribution',
      icon: PieChart,
    },
    {
      title: 'Employee Revenue',
      description: 'Team performance and labor hours',
      href: '/revenue/employee',
      icon: Users,
    },
    {
      title: 'Bonuses',
      description: 'Performance bonuses and incentives',
      href: '/revenue/bonuses',
      icon: Gift,
    },
    {
      title: 'Revenue Formulas',
      description: 'Cost code calculations and formulas',
      href: '/revenue/formulas',
      icon: Calculator,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Revenue</h1>
        <p className="text-muted-foreground">Revenue tracking and analysis</p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">From paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Pipeline Value</p>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(pipelineValue)}</p>
            <p className="text-xs text-muted-foreground">From accepted estimates</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-foreground" />
              <p className="text-sm text-muted-foreground">Average Invoice</p>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(avgInvoice)}</p>
            <p className="text-xs text-muted-foreground">Per paid invoice</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-foreground" />
              <p className="text-sm text-muted-foreground">Invoice Count</p>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{totalInvoices}</p>
            <p className="text-xs text-muted-foreground">Total invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Sub-Page Navigation Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subPages.map((page) => (
          <Link key={page.href} href={page.href}>
            <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <page.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{page.title}</p>
                  <p className="text-xs text-muted-foreground">{page.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
