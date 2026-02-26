import Link from 'next/link'

import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Landmark,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function FinancialDashboardPage() {
  const supabase = await createClient()

  const [
    { count: accountCount },
    { count: arCount },
    { count: apCount },
    { count: jeCount },
  ] = await Promise.all([
    supabase.from('gl_accounts').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('ar_invoices').select('*', { count: 'exact', head: true }).is('deleted_at', null).neq('status', 'paid'),
    supabase.from('ap_bills').select('*', { count: 'exact', head: true }).is('deleted_at', null).neq('status', 'paid'),
    supabase.from('gl_journal_entries').select('*', { count: 'exact', head: true }).is('deleted_at', null),
  ])

  const quickLinks = [
    { name: 'Chart of Accounts', href: '/financial/chart-of-accounts', icon: Landmark, count: accountCount || 0 },
    { name: 'Receivables', href: '/financial/receivables', icon: ArrowDownRight, count: arCount || 0, label: 'outstanding' },
    { name: 'Payables', href: '/financial/payables', icon: ArrowUpRight, count: apCount || 0, label: 'outstanding' },
    { name: 'Journal Entries', href: '/financial/journal-entries', icon: DollarSign, count: jeCount || 0, label: 'total' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financial Dashboard</h1>
        <p className="text-muted-foreground">Overview of your company finances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.name} href={link.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{link.name}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{link.count}</p>
                    {link.label && <p className="text-xs text-muted-foreground">{link.label}</p>}
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <link.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: 'Chart of Accounts', href: '/financial/chart-of-accounts' },
                { name: 'Accounts Receivable', href: '/financial/receivables' },
                { name: 'Accounts Payable', href: '/financial/payables' },
                { name: 'Journal Entries', href: '/financial/journal-entries' },
                { name: 'Invoices', href: '/invoices' },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <span className="font-medium">{link.name}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
