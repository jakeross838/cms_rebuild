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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Jake</h1>
          <p className="text-gray-500">Here&apos;s what&apos;s happening at Ross Built today</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: 5 min ago</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/skeleton/financial/dashboard" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Cash Position</span>
            <DollarSign className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.cashPosition.value)}</div>
          <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>+{formatCurrency(metrics.cashPosition.change)}</span>
          </div>
        </Link>

        <Link href="/skeleton/financial/receivables" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Accounts Receivable</span>
            <FileText className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.accountsReceivable.value)}</div>
          <div className="flex items-center gap-1 mt-1 text-sm text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            <span>{metrics.accountsReceivable.overdue} overdue</span>
          </div>
        </Link>

        <Link href="/skeleton/financial/payables" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Accounts Payable</span>
            <FileText className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.accountsPayable.value)}</div>
          <div className="text-sm text-gray-500 mt-1">{metrics.accountsPayable.dueSoon} due this week</div>
        </Link>

        <Link href="/skeleton/financial/profitability" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Gross Margin</span>
            <TrendingUp className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.grossMargin.value}%</div>
          <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
            <TrendingDown className="h-3 w-3" />
            <span>{metrics.grossMargin.change}% this month</span>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Jobs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Active Jobs</h2>
              <span className="text-sm text-gray-500">({activeJobs.length})</span>
            </div>
            <Link href="/skeleton/jobs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {activeJobs.map((job) => (
              <Link key={job.id} href={`/skeleton/jobs/${job.id}`} className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{job.name}</span>
                    <span className="text-gray-400 mx-2">•</span>
                    <span className="text-sm text-gray-500">{job.client}</span>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                    job.status === 'on-track' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {job.status === 'on-track' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {job.status === 'on-track' ? 'On Track' : 'Attention'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          job.status === 'on-track' ? 'bg-green-500' : 'bg-amber-500'
                        )}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-500">Next: {job.nextMilestone}</div>
                    <div className="text-gray-400 text-xs">{job.nextDate}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Today</h2>
              </div>
              <Link href="/skeleton/operations/calendar" className="text-sm text-blue-600 hover:text-blue-700">
                Calendar
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingToday.map((item, idx) => (
                <div key={idx} className="px-4 py-2 flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-16">{item.time}</span>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    item.type === 'inspection' ? 'bg-blue-500' :
                    item.type === 'meeting' ? 'bg-purple-500' : 'bg-green-500'
                  )} />
                  <span className="text-sm text-gray-700 flex-1">{item.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/skeleton/leads" className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 transition-colors">
                <Target className="h-4 w-4 text-blue-500" />
                New Lead
              </Link>
              <Link href="/skeleton/estimates" className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 transition-colors">
                <FileText className="h-4 w-4 text-green-500" />
                New Estimate
              </Link>
              <Link href="/skeleton/invoices" className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 transition-colors">
                <DollarSign className="h-4 w-4 text-amber-500" />
                Enter Invoice
              </Link>
              <Link href="/skeleton/directory/vendors" className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 transition-colors">
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">Alerts</h2>
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                {alerts.filter(a => a.severity === 'high').length} urgent
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {alerts.map((alert, idx) => (
              <Link key={idx} href={alert.action} className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                    alert.severity === 'high' ? 'bg-red-500' :
                    alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-200/50 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold text-gray-900">AI Insights</h2>
          </div>
          <div className="divide-y divide-amber-200/50">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <insight.icon className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-sm text-gray-900">{insight.title}</span>
                </div>
                <p className="text-sm text-gray-600">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{metrics.activeJobs} Active Jobs</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{formatCurrency(metrics.activeBudget)} Under Contract</span>
            </div>
          </div>
          <Link href="/skeleton/overview" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
            System Overview <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
