'use client'

import Link from 'next/link'
import {
  Building2,
  DollarSign,
  Briefcase,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Users,
  Truck,
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Target,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for the dashboard
const metrics = {
  cashPosition: { value: 847500, change: 125000, trend: 'up' },
  accountsReceivable: { value: 485000, overdue: 3 },
  accountsPayable: { value: 312000, dueSoon: 5 },
  grossMargin: { value: 17.5, change: -0.5 },
  activeJobs: 8,
  activeBudget: 8400000,
}

const activeJobs = [
  { id: '1', name: 'Smith Residence', client: 'John & Sarah Smith', progress: 65, status: 'on-track', nextMilestone: 'Framing Complete', nextDate: 'Feb 5' },
  { id: '2', name: 'Johnson Beach House', client: 'Robert Johnson', progress: 32, status: 'attention', nextMilestone: 'Foundation Pour', nextDate: 'Feb 8' },
  { id: '3', name: 'Williams Remodel', client: 'David Williams', progress: 88, status: 'on-track', nextMilestone: 'Final Inspection', nextDate: 'Feb 2' },
  { id: '4', name: 'Davis Custom Home', client: 'Michael Davis', progress: 12, status: 'on-track', nextMilestone: 'Permit Approval', nextDate: 'Feb 10' },
]

const alerts = [
  { type: 'payment', message: 'Draw #4 Smith Residence overdue by 5 days ($185,000)', action: '/skeleton/financial/receivables', severity: 'high' },
  { type: 'insurance', message: 'ABC Electric COI expires in 15 days', action: '/skeleton/compliance/insurance', severity: 'medium' },
  { type: 'selection', message: 'Kitchen cabinets selection overdue - Smith Residence', action: '/skeleton/jobs/1/selections', severity: 'high' },
  { type: 'delivery', message: 'Window delivery tomorrow - Smith Residence (18 units)', action: '/skeleton/operations/deliveries', severity: 'info' },
  { type: 'inspection', message: 'Framing inspection scheduled tomorrow 9am', action: '/skeleton/jobs/1/inspections', severity: 'info' },
]

const upcomingToday = [
  { time: '9:00 AM', event: 'Framing Inspection - Smith Residence', type: 'inspection' },
  { time: '10:30 AM', event: 'Client Meeting - Johnson Beach House', type: 'meeting' },
  { time: '2:00 PM', event: 'Window Delivery - Smith Residence', type: 'delivery' },
]

const aiInsights = [
  { title: 'Cash Flow Alert', message: 'Based on AP due and AR collection rates, cash may be tight in 3 weeks. Consider accelerating Draw #5.', icon: DollarSign },
  { title: 'Schedule Risk', message: 'Johnson Beach House foundation pour depends on permit. Apply pressure or delay 3 days.', icon: Calendar },
  { title: 'Margin Opportunity', message: 'ABC Lumber offering 5% discount for early payment. $1,200 savings available.', icon: TrendingUp },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export default function CompanyDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Good morning, Jake</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening at Ross Built today</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: 5 min ago</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/skeleton/financial/dashboard" className="bg-card rounded-xl border border-border/60 p-5 hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Cash Position</span>
            <DollarSign className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-3xl font-bold text-foreground">{formatCurrency(metrics.cashPosition.value)}</div>
          <div className="flex items-center gap-1 mt-2 text-sm font-medium text-emerald-600">
            <TrendingUp className="h-4 w-4" />
            <span>+{formatCurrency(metrics.cashPosition.change)}</span>
          </div>
        </Link>

        <Link href="/skeleton/financial/receivables" className="bg-card rounded-xl border border-border/60 p-5 hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Accounts Receivable</span>
            <FileText className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-3xl font-bold text-foreground">{formatCurrency(metrics.accountsReceivable.value)}</div>
          <div className="flex items-center gap-1 mt-2 text-sm font-medium text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{metrics.accountsReceivable.overdue} overdue</span>
          </div>
        </Link>

        <Link href="/skeleton/financial/payables" className="bg-card rounded-xl border border-border/60 p-5 hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Accounts Payable</span>
            <FileText className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-3xl font-bold text-foreground">{formatCurrency(metrics.accountsPayable.value)}</div>
          <div className="text-sm font-medium text-muted-foreground mt-2">{metrics.accountsPayable.dueSoon} due this week</div>
        </Link>

        <Link href="/skeleton/financial/profitability" className="bg-card rounded-xl border border-border/60 p-5 hover:border-primary/50 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Gross Margin</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-3xl font-bold text-foreground">{metrics.grossMargin.value}%</div>
          <div className="flex items-center gap-1 mt-2 text-sm font-medium text-destructive">
            <TrendingDown className="h-4 w-4" />
            <span>{metrics.grossMargin.change}% this month</span>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Jobs */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-card">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium text-foreground">Active Jobs</h2>
              <span className="text-sm font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{activeJobs.length}</span>
            </div>
            <Link href="/skeleton/jobs" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border/40 flex-1">
            {activeJobs.map((job) => (
              <Link key={job.id} href={`/skeleton/jobs/${job.id}`} className="block px-5 py-4 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{job.name}</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-sm text-muted-foreground">{job.client}</span>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border',
                    job.status === 'on-track' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-amber-50 text-amber-700 border-amber-200/50'
                  )}>
                    {job.status === 'on-track' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    {job.status === 'on-track' ? 'On Track' : 'Attention'}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          job.status === 'on-track' ? 'bg-primary' : 'bg-amber-500'
                        )}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium text-foreground">{job.nextMilestone}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{job.nextDate}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-medium text-foreground">Today</h2>
              </div>
              <Link href="/skeleton/operations/calendar" className="text-sm font-medium text-primary hover:text-primary/80">
                Calendar
              </Link>
            </div>
            <div className="divide-y divide-border/40 p-2">
              {upcomingToday.map((item, idx) => (
                <div key={idx} className="px-3 py-2.5 flex items-center gap-3 hover:bg-secondary/40 rounded-lg transition-colors cursor-pointer">
                  <span className="text-sm font-medium text-muted-foreground w-16">{item.time}</span>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    item.type === 'inspection' ? 'bg-stone-500' :
                      item.type === 'meeting' ? 'bg-purple-500' : 'bg-emerald-500'
                  )} />
                  <span className="text-sm font-medium text-foreground flex-1">{item.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border border-border/60 shadow-sm p-5">
            <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/skeleton/leads" className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium text-foreground transition-colors border border-border/50">
                <Target className="h-4 w-4 text-stone-500" />
                New Lead
              </Link>
              <Link href="/skeleton/estimates" className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium text-foreground transition-colors border border-border/50">
                <FileText className="h-4 w-4 text-emerald-500" />
                New Estimate
              </Link>
              <Link href="/skeleton/invoices" className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium text-foreground transition-colors border border-border/50">
                <DollarSign className="h-4 w-4 text-amber-500" />
                Enter Invoice
              </Link>
              <Link href="/skeleton/directory/vendors" className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium text-foreground transition-colors border border-border/50">
                <Users className="h-4 w-4 text-purple-500" />
                Add Vendor
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & AI Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-medium text-foreground">Alerts</h2>
              <span className="bg-destructive/10 text-destructive text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                {alerts.filter(a => a.severity === 'high').length} urgent
              </span>
            </div>
          </div>
          <div className="divide-y divide-border/40 max-h-72 overflow-y-auto flex-1">
            {alerts.map((alert, idx) => (
              <Link key={idx} href={alert.action} className="block px-5 py-4 hover:bg-secondary/40 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                    alert.severity === 'high' ? 'bg-destructive' :
                      alert.severity === 'medium' ? 'bg-amber-500' : 'bg-stone-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{alert.message}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-indigo-50/50 to-stone-50/50 dark:from-indigo-950/20 dark:to-stone-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-medium text-foreground">AI Insights</h2>
          </div>
          <div className="divide-y divide-indigo-100/50 dark:divide-indigo-900/30 flex-1 p-2">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="px-3 py-3 rounded-lg hover:bg-white/50 dark:hover:bg-slate-900/50 transition-colors m-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <insight.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-sm text-indigo-950 dark:text-indigo-300">{insight.title}</span>
                </div>
                <p className="text-sm text-indigo-900/80 dark:text-indigo-200/70 leading-relaxed">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-card rounded-xl border border-border/60 p-5 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">{metrics.activeJobs} <span className="text-muted-foreground font-normal">Active Jobs</span></span>
            </div>
            <div className="flex items-center gap-2.5">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">{formatCurrency(metrics.activeBudget)} <span className="text-muted-foreground font-normal">Under Contract</span></span>
            </div>
          </div>
          <Link href="/skeleton/overview" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors">
            System Overview <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
