import Link from 'next/link'

import {
  Target,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { formatCurrency } from '@/lib/utils'
import type { Metadata } from 'next'

// ── Page ─────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Accuracy Engine' }

export default async function AccuracyEnginePage() {
  const { companyId, supabase } = await getServerAuth()

  // ── Parallel data fetching ──
  const [
    totalEstimatesRes,
    draftEstimatesRes,
    approvedEstimatesRes,
    sentEstimatesRes,
    budgetLinesRes,
    recentEstimatesRes,
  ] = await Promise.all([
    supabase.from('estimates').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('estimates').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null).eq('status', 'draft'),
    supabase.from('estimates').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null).eq('status', 'approved'),
    supabase.from('estimates').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null).eq('status', 'sent'),
    supabase.from('budget_lines').select('estimated_amount, actual_amount')
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('estimates').select('id, name, status, total, updated_at')
      .eq('company_id', companyId).is('deleted_at', null)
      .order('updated_at', { ascending: false }).limit(5),
  ])

  const totalEstimates = totalEstimatesRes.count || 0
  const draftCount = draftEstimatesRes.count || 0
  const approvedCount = approvedEstimatesRes.count || 0
  const sentCount = sentEstimatesRes.count || 0

  // ── Budget accuracy calculation ──
  const budgetLines = (budgetLinesRes.data || []) as {
    estimated_amount: number; actual_amount: number
  }[]
  const totalEstimated = budgetLines.reduce((sum, bl) => sum + (bl.estimated_amount || 0), 0)
  const totalActual = budgetLines.reduce((sum, bl) => sum + (bl.actual_amount || 0), 0)
  const variancePercent = totalEstimated > 0
    ? ((totalActual - totalEstimated) / totalEstimated * 100)
    : 0

  const recentEstimates = (recentEstimatesRes.data || []) as {
    id: string; name: string; status: string; total: number | null; updated_at: string
  }[]

  function getEstimateStatusIcon(status: string) {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'draft': return <Clock className="h-4 w-4 text-muted-foreground" />
      case 'sent': return <ArrowRight className="h-4 w-4 text-blue-600" />
      default: return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Target className="h-6 w-6" />
          Accuracy Engine
        </h1>
        <p className="text-muted-foreground mt-1">Track and improve estimate accuracy over time</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Estimates</p>
                <p className="text-2xl font-bold">{totalEstimates}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{draftCount}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{sentCount}</p>
              </div>
              <ArrowRight className="h-8 w-8 text-blue-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimate vs Actual Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Estimated vs Actual Comparison
          </CardTitle>
          <CardDescription>
            Aggregated from all budget lines across jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgetLines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <p className="text-xs text-muted-foreground mb-1">Total Estimated</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(totalEstimated)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <p className="text-xs text-muted-foreground mb-1">Total Actual</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(totalActual)}</p>
              </div>
              <div className={`text-center p-4 rounded-lg ${variancePercent > 5 ? 'bg-red-50' : variancePercent > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                <p className="text-xs text-muted-foreground mb-1">Variance</p>
                <div className="flex items-center justify-center gap-1">
                  {variancePercent > 5 && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  <p className={`text-xl font-bold ${variancePercent > 5 ? 'text-red-700' : variancePercent > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                    {variancePercent >= 0 ? '+' : ''}{variancePercent.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No budget line data available yet. Create budgets on your jobs to track accuracy.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Estimates */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent Estimates
            </CardTitle>
            <Link href="/estimates" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentEstimates.length > 0 ? (
            <div className="divide-y divide-border">
              {recentEstimates.map((est) => (
                <Link key={est.id} href={`/estimates/${est.id}`} className="block py-2 first:pt-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEstimateStatusIcon(est.status)}
                      <span className="text-sm font-medium">{est.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {est.total != null && (
                        <span className="text-sm font-medium">{formatCurrency(est.total)}</span>
                      )}
                      <Badge className="bg-slate-100 text-slate-700">
                        {est.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No estimates yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
