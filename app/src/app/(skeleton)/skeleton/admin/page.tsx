'use client'

import {
  ShieldCheck,
  Users,
  Building2,
  Activity,
  TrendingUp,
  DollarSign,
  Server,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Sparkles,
  Database,
  Clock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const platformMetrics = [
  { label: 'Total Tenants', value: '2,847', change: '+124', trend: 'up', icon: Building2, color: 'text-stone-600' },
  { label: 'Monthly Active Users', value: '18,432', change: '+8.2%', trend: 'up', icon: Users, color: 'text-green-600' },
  { label: 'MRR', value: '$486,200', change: '+$32,400', trend: 'up', icon: DollarSign, color: 'text-violet-600' },
  { label: 'ARR', value: '$5.83M', change: '+12.4%', trend: 'up', icon: TrendingUp, color: 'text-amber-600' },
]

const systemHealth = [
  { service: 'API Gateway', status: 'healthy', uptime: '99.98%', latency: '42ms' },
  { service: 'Database (Primary)', status: 'healthy', uptime: '99.99%', latency: '8ms' },
  { service: 'Database (Read Replicas)', status: 'healthy', uptime: '99.97%', latency: '12ms' },
  { service: 'AI Processing', status: 'healthy', uptime: '99.92%', latency: '180ms' },
  { service: 'File Storage', status: 'healthy', uptime: '99.99%', latency: '28ms' },
  { service: 'Email Service', status: 'degraded', uptime: '99.85%', latency: '350ms' },
]

const featureAdoption = [
  { feature: 'Invoice AI Extraction', adoption: 89, trend: 'up' },
  { feature: 'Draw Management', adoption: 76, trend: 'up' },
  { feature: 'Client Portal', adoption: 72, trend: 'up' },
  { feature: 'Custom Reports', adoption: 58, trend: 'up' },
  { feature: 'QuickBooks Sync', adoption: 54, trend: 'stable' },
  { feature: 'Vendor Portal', adoption: 41, trend: 'up' },
  { feature: 'Daily Logs', adoption: 38, trend: 'up' },
  { feature: 'Selections Management', adoption: 32, trend: 'up' },
]

const recentActivity = [
  { event: 'New tenant signup: Coastal Builders LLC', time: '12 min ago', type: 'signup' },
  { event: 'Plan upgrade: Smith Homes (Starter -> Pro)', time: '28 min ago', type: 'upgrade' },
  { event: 'AI processing spike: 2,400 invoices in last hour', time: '45 min ago', type: 'alert' },
  { event: 'New tenant signup: Mountain View Construction', time: '1 hr ago', type: 'signup' },
  { event: 'Churn: Palmer Renovations cancelled subscription', time: '2 hrs ago', type: 'churn' },
]

const tenantDistribution = [
  { plan: 'Starter', count: 1842, percentage: 65, revenue: '$274K' },
  { plan: 'Pro', count: 824, percentage: 29, revenue: '$287K' },
  { plan: 'Enterprise', count: 181, percentage: 6, revenue: '$127K' },
]

export default function PlatformAdminPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-red-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Platform Analytics & Admin</h1>
            <p className="text-sm text-muted-foreground">Module 49 -- Platform-wide metrics, system health, tenant management</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Last updated: 2 minutes ago
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {platformMetrics.map((m, i) => {
          const Icon = m.icon
          return (
            <div key={i} className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className={cn('h-4 w-4', m.color)} />{m.label}</div>
              <div className="text-2xl font-bold mt-1">{m.value}</div>
              <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                {m.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {m.change}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* MRR Chart Placeholder */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Revenue Growth (MRR)</h3>
              <div className="flex items-center gap-2 text-xs">
                <button className="px-2 py-1 bg-muted rounded">6M</button>
                <button className="px-2 py-1 bg-primary text-primary-foreground rounded">12M</button>
                <button className="px-2 py-1 bg-muted rounded">All</button>
              </div>
            </div>
            <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">MRR Chart</div>
                <div className="text-xs">$486K MRR -- $5.83M ARR -- 12.4% growth</div>
              </div>
            </div>
          </div>

          {/* Feature Adoption */}
          <div className="bg-card border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Feature Adoption</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Percentage of active tenants using each feature</p>
            </div>
            <div className="p-4 space-y-3">
              {featureAdoption.map((f, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{f.feature}</span>
                    <span className="text-muted-foreground">{f.adoption}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', f.adoption > 70 ? 'bg-green-500' : f.adoption > 50 ? 'bg-stone-500' : 'bg-amber-500')} style={{ width: `${f.adoption}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* System Health */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-green-600" />System Health</h3>
            <div className="space-y-2">
              {systemHealth.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    {s.status === 'healthy' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    <span className="text-sm">{s.service}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">{s.uptime}</div>
                    <div className="text-xs text-muted-foreground">{s.latency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tenant Distribution */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-stone-600" />Tenant Distribution</h3>
            <div className="space-y-3">
              {tenantDistribution.map((t, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{t.plan}</span>
                    <span>{t.count} ({t.revenue}/mo)</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${t.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                  <div className="mt-0.5">
                    {a.type === 'signup' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : a.type === 'upgrade' ? <ArrowUp className="h-3.5 w-3.5 text-stone-500" /> : a.type === 'alert' ? <Zap className="h-3.5 w-3.5 text-amber-500" /> : <ArrowDown className="h-3.5 w-3.5 text-red-500" />}
                  </div>
                  <div>
                    <div className="text-xs">{a.event}</div>
                    <div className="text-xs text-muted-foreground">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <div className="font-medium text-red-800">Platform Intelligence</div>
            <p className="text-sm text-red-700 mt-1">Churn risk: 12 Starter tenants have not logged in for 14+ days -- trigger re-engagement campaign. Email service latency is elevated (350ms vs 120ms normal) -- investigate provider. Invoice AI is the #1 adoption driver -- tenants who use it in week 1 have 85% 6-month retention vs 52% for those who do not. Consider making it part of onboarding.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
