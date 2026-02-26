import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  Brain,
  Target,
  Gavel,
  ShoppingCart,
  Factory,
  MessageSquare,
  TrendingUp,
  FileSearch,
  FileText,
  ArrowRight,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

// ── Hub Links ────────────────────────────────────────────────────────

const intelligenceModules = [
  {
    href: '/intelligence/accuracy-engine',
    icon: Target,
    title: 'Accuracy Engine',
    description: 'Track and improve estimate accuracy with AI-powered variance analysis',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    href: '/intelligence/bidding',
    icon: Gavel,
    title: 'Bid Intelligence',
    description: 'AI-powered bid analysis, scoring, and optimization',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  {
    href: '/intelligence/procurement',
    icon: ShoppingCart,
    title: 'Procurement Intelligence',
    description: 'Smart purchasing recommendations and vendor selection',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    href: '/intelligence/plan-analysis',
    icon: FileSearch,
    title: 'Plan Analysis',
    description: 'AI document classification, extraction, and routing',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  {
    href: '/intelligence/production',
    icon: Factory,
    title: 'Production Intelligence',
    description: 'AI-driven daily log analysis and labor optimization',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  {
    href: '/intelligence/communication-hub',
    icon: MessageSquare,
    title: 'Communication Hub',
    description: 'AI-managed notifications, follow-ups, and team communication',
    color: 'text-red-600',
    bg: 'bg-red-100',
  },
  {
    href: '/intelligence/learning-metrics',
    icon: TrendingUp,
    title: 'Learning Metrics',
    description: 'Track AI learning curves and training progress',
    color: 'text-teal-600',
    bg: 'bg-teal-100',
  },
]

// ── Page ─────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'AI Hub' }

export default async function AIHubPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  // ── Parallel counts ──
  const [invoicesRes, documentsRes, rfisRes] = await Promise.all([
    supabase.from('invoices').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('documents').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('rfis').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
  ])

  const totalInvoices = invoicesRes.count || 0
  const totalDocuments = documentsRes.count || 0
  const totalRfis = rfisRes.count || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-6 w-6" />
          AI Command Center
        </h1>
        <p className="text-muted-foreground mt-1">Intelligence overview, health scores, and AI insights</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/invoices">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Invoices Processed</p>
                  <p className="text-2xl font-bold">{totalInvoices}</p>
                  <p className="text-xs text-muted-foreground">total invoices in system</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/files">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold">{totalDocuments}</p>
                  <p className="text-xs text-muted-foreground">uploaded and classified</p>
                </div>
                <FileSearch className="h-8 w-8 text-green-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/rfis">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">RFIs Tracked</p>
                  <p className="text-2xl font-bold">{totalRfis}</p>
                  <p className="text-xs text-muted-foreground">requests for information</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-500/70" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Intelligence Modules Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Intelligence Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intelligenceModules.map((mod) => (
            <Link key={mod.href} href={mod.href}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${mod.bg}`}>
                      <mod.icon className={`h-5 w-5 ${mod.color}`} />
                    </div>
                    <CardTitle className="text-base">{mod.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{mod.description}</CardDescription>
                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground hover:text-foreground">
                    Explore <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
