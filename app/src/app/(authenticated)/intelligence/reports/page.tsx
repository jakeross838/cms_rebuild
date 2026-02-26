import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { BarChart3, FileText, LayoutDashboard, TrendingUp } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Intelligence Reports' }

export default async function IntelligenceReportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  // ── Query report counts ──────────────────────────────────────────
  const { count: customReportsCount } = await supabase
    .from('custom_reports')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null)

  const { count: reportDefinitionsCount } = await supabase
    .from('report_definitions')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .is('deleted_at', null)

  const stats = [
    { label: 'Custom Reports', value: customReportsCount ?? 0 },
    { label: 'Report Definitions', value: reportDefinitionsCount ?? 0 },
  ]

  const links = [
    {
      title: 'Custom Dashboards',
      description: 'Build and view custom dashboards with drag-and-drop widgets',
      href: '/dashboards',
      icon: LayoutDashboard,
    },
    {
      title: 'Financial Reports',
      description: 'P&L, cash flow, WIP, and profitability reports',
      href: '/financial/reports',
      icon: TrendingUp,
    },
    {
      title: 'All Reports',
      description: 'Browse all available report types and generate exports',
      href: '/reports',
      icon: FileText,
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Intelligence Reports</h1>
        <p className="text-muted-foreground">AI-generated insights and analytics reports</p>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <BarChart3 className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Navigation Cards ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <link.icon className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{link.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
