'use client'

import {
  Puzzle,
  CheckCircle2,
  Circle,
  Search,
  Settings,
  Key,
  Webhook,
  ExternalLink,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Clock,
  Zap,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const integrations = [
  { name: 'QuickBooks Online', category: 'Accounting', status: 'connected', lastSync: '2 min ago', icon: '📊', description: 'Two-way sync for invoices, vendors, chart of accounts' },
  { name: 'Stripe', category: 'Payments', status: 'connected', lastSync: '5 min ago', icon: '💳', description: 'Online payments, ACH transfers, payment links' },
  { name: 'Google Calendar', category: 'Calendar', status: 'connected', lastSync: '1 hr ago', icon: '📅', description: 'Sync schedule milestones and meetings' },
  { name: 'Reolink Cameras', category: 'Jobsite', status: 'connected', lastSync: '15 min ago', icon: '📷', description: 'Live jobsite camera feeds and timelapse' },
  { name: 'OpenWeather', category: 'Weather', status: 'connected', lastSync: 'Real-time', icon: '🌤️', description: 'Weather data for daily logs and scheduling' },
  { name: 'DocuSign', category: 'Documents', status: 'available', lastSync: null, icon: '✍️', description: 'Electronic signatures for contracts and COs' },
  { name: 'Xero', category: 'Accounting', status: 'available', lastSync: null, icon: '📒', description: 'Alternative accounting integration' },
  { name: 'Zapier', category: 'Automation', status: 'available', lastSync: null, icon: '⚡', description: 'Connect to 5,000+ apps with workflow automation' },
  { name: 'EagleView', category: 'Estimation', status: 'available', lastSync: null, icon: '🛩️', description: 'Aerial measurements and roof reports' },
  { name: 'CompanyCam', category: 'Photos', status: 'available', lastSync: null, icon: '📸', description: 'Jobsite photo management with GPS tagging' },
]

const apiKeys = [
  { name: 'Production Key', prefix: 'ross_live_****4f2a', created: 'Jan 15, 2026', lastUsed: 'Today', status: 'active' },
  { name: 'Development Key', prefix: 'ross_test_****8b1c', created: 'Dec 1, 2025', lastUsed: '3 days ago', status: 'active' },
  { name: 'Old Integration Key', prefix: 'ross_live_****2d9e', created: 'Aug 10, 2025', lastUsed: '45 days ago', status: 'expired' },
]

const webhooks = [
  { event: 'invoice.created', url: 'https://hooks.zapier.com/...', status: 'active', fires: 142 },
  { event: 'job.status_changed', url: 'https://hooks.zapier.com/...', status: 'active', fires: 28 },
  { event: 'draw.approved', url: 'https://api.internal.com/...', status: 'active', fires: 15 },
]

export default function ApiMarketplacePage() {
  const connected = integrations.filter(i => i.status === 'connected').length
  const available = integrations.filter(i => i.status === 'available').length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Puzzle className="h-6 w-6 text-orange-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">API & Integration Marketplace</h1>
            <p className="text-sm text-muted-foreground">Module 45 -- Connect your tools, manage API keys, configure webhooks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search integrations..." className="pl-8 pr-3 py-1.5 text-sm border rounded-lg w-48" />
          </div>
          <button className="px-3 py-1.5 text-sm border rounded-lg text-muted-foreground hover:bg-accent flex items-center gap-1.5">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-green-600" />Connected</div>
          <div className="text-2xl font-bold mt-1">{connected}</div>
          <div className="text-xs text-green-600 mt-1">Active integrations</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Puzzle className="h-4 w-4 text-stone-600" />Available</div>
          <div className="text-2xl font-bold mt-1">{available}</div>
          <div className="text-xs text-muted-foreground mt-1">Ready to connect</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Zap className="h-4 w-4 text-amber-600" />API Calls Today</div>
          <div className="text-2xl font-bold mt-1">1,284</div>
          <div className="text-xs text-muted-foreground mt-1">Across all integrations</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Webhook className="h-4 w-4 text-purple-600" />Active Webhooks</div>
          <div className="text-2xl font-bold mt-1">{webhooks.length}</div>
          <div className="text-xs text-muted-foreground mt-1">{webhooks.reduce((s, w) => s + w.fires, 0)} events fired</div>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Integrations</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Connect your favorite tools to streamline operations</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y">
          {integrations.map((integ, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integ.icon}</span>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {integ.name}
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{integ.category}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{integ.description}</div>
                  {integ.lastSync && (
                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />Last sync: {integ.lastSync}
                    </div>
                  )}
                </div>
              </div>
              {integ.status === 'connected' ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />Connected
                  </span>
                  <button className="p-1.5 hover:bg-muted rounded"><Settings className="h-4 w-4 text-muted-foreground" /></button>
                </div>
              ) : (
                <button className="px-3 py-1.5 text-sm border rounded-lg text-orange-600 border-orange-200 hover:bg-orange-50">Connect</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* API Keys */}
        <div className="bg-card border rounded-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Key className="h-4 w-4 text-orange-600" />API Keys</h3>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">+ Generate Key</button>
          </div>
          <div className="divide-y">
            {apiKeys.map((key, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{key.name}</div>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">{key.prefix}</div>
                  <div className="text-xs text-muted-foreground mt-1">Created {key.created} -- Last used {key.lastUsed}</div>
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded', key.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                  {key.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-card border rounded-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Webhook className="h-4 w-4 text-purple-600" />Webhooks</h3>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">+ Add Webhook</button>
          </div>
          <div className="divide-y">
            {webhooks.map((wh, i) => (
              <div key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-mono font-medium">{wh.event}</div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{wh.url}</div>
                <div className="text-xs text-muted-foreground mt-1">{wh.fires} events fired</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <div className="font-medium text-orange-800">Integration Insight</div>
            <p className="text-sm text-orange-700 mt-1">Your QuickBooks sync is running smoothly with 99.8% success rate. Consider connecting DocuSign to eliminate paper signatures -- builders who use e-signatures close contracts 4 days faster on average. Your Zapier webhook has fired 142 times this month with zero failures.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
