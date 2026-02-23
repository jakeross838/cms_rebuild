'use client'

import {
  CreditCard,
  CheckCircle2,
  Users,
  HardDrive,
  Zap,
  Building2,
  Receipt,
  Shield,
  Sparkles,
  Star,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const currentPlan = {
  name: 'Pro',
  price: 349,
  interval: 'month',
  renewDate: 'Mar 1, 2026',
  status: 'active',
}

const usageMetrics = [
  { label: 'Active Users', current: 8, limit: 15, unit: 'users', icon: Users },
  { label: 'Active Jobs', current: 12, limit: 25, unit: 'jobs', icon: Building2 },
  { label: 'Storage Used', current: 18.4, limit: 50, unit: 'GB', icon: HardDrive },
  { label: 'AI Requests', current: 342, limit: 1000, unit: '/month', icon: Zap },
]

const billingHistory = [
  { date: 'Feb 1, 2026', description: 'Pro Plan - Monthly', amount: 349.00, status: 'paid', method: 'Visa ...4242' },
  { date: 'Jan 1, 2026', description: 'Pro Plan - Monthly', amount: 349.00, status: 'paid', method: 'Visa ...4242' },
  { date: 'Dec 1, 2025', description: 'Pro Plan - Monthly', amount: 349.00, status: 'paid', method: 'Visa ...4242' },
]

const plans = [
  { name: 'Starter', price: 149, users: 5, jobs: 10, storage: '10 GB', ai: '200/mo', features: ['Core modules', 'Email support', 'Client portal'] },
  { name: 'Pro', price: 349, users: 15, jobs: 25, storage: '50 GB', ai: '1,000/mo', features: ['All modules', 'Priority support', 'API access', 'Custom reports'], current: true },
  { name: 'Enterprise', price: 699, users: 50, jobs: 'Unlimited', storage: '250 GB', ai: 'Unlimited', features: ['Everything in Pro', 'White label', 'Dedicated CSM', 'SLA guarantee', 'SSO/SAML'] },
]

export default function SubscriptionBillingPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warm-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-warm-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Subscription & Billing</h1>
            <p className="text-sm text-muted-foreground">Module 43 -- Manage your plan, usage, and payment methods</p>
          </div>
        </div>
      </div>

      {/* Current Plan */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-100 rounded-xl">
              <Star className="h-8 w-8 text-stone-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{currentPlan.name} Plan</h2>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Active</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="text-2xl font-bold text-foreground">${currentPlan.price}</span>/month -- Renews {currentPlan.renewDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm border rounded-lg text-muted-foreground hover:bg-accent">Change Plan</button>
            <button className="px-4 py-2 text-sm bg-stone-700 text-white rounded-lg hover:bg-stone-600">Upgrade to Enterprise</button>
          </div>
        </div>
      </div>

      {/* Usage Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {usageMetrics.map((m, i) => {
          const Icon = m.icon
          const pct = Math.round((m.current / m.limit) * 100)
          return (
            <div key={i} className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Icon className="h-4 w-4" />
                {m.label}
              </div>
              <div className="text-2xl font-bold">{m.current}<span className="text-sm font-normal text-muted-foreground"> / {m.limit} {m.unit}</span></div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <div className={cn('h-full rounded-full', pct > 80 ? 'bg-amber-500' : 'bg-warm-500')} style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{pct}% used</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Plan Comparison */}
        <div className="col-span-2 bg-card border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Plan Comparison</h3>
          </div>
          <div className="grid grid-cols-3 divide-x">
            {plans.map((plan, i) => (
              <div key={i} className={cn('p-4', plan.current && 'bg-warm-50/50')}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{plan.name}</h4>
                  {plan.current ? <span className="text-xs bg-warm-100 text-warm-700 px-2 py-0.5 rounded-full">Current</span> : null}
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Users</span><span className="font-medium">{plan.users}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Jobs</span><span className="font-medium">{plan.jobs}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Storage</span><span className="font-medium">{plan.storage}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">AI Requests</span><span className="font-medium">{plan.ai}</span></div>
                </div>
                <div className="mt-4 pt-3 border-t space-y-1.5">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payment Method */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-green-600" />Payment Method</h3>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Visa ending in 4242</div>
                <div className="text-xs text-muted-foreground">Expires 08/2028</div>
              </div>
            </div>
            <button className="w-full mt-3 text-sm text-stone-600 hover:text-warm-700 font-medium">Update Payment Method</button>
          </div>

          {/* Billing History */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Receipt className="h-4 w-4 text-muted-foreground" />Billing History</h3>
            <div className="space-y-2">
              {billingHistory.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">${b.amount.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{b.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Paid</span>
                    <button className="text-xs text-stone-600 hover:text-warm-700">PDF</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground">View All Invoices</button>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-warm-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-stone-600 mt-0.5" />
          <div>
            <div className="font-medium text-violet-800">Usage Insight</div>
            <p className="text-sm text-warm-700 mt-1">You are using 53% of your user seats and 48% of active jobs. At your current growth rate, you will hit the Pro plan job limit in approximately 4 months. Consider annual billing to save 20% ($838/year).</p>
          </div>
        </div>
      </div>
    </div>
  )
}
