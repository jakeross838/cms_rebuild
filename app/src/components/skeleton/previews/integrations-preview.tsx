'use client'

import { useState } from 'react'
import {
  Link,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Settings,
  Eye,
  Unplug,
  Sparkles,
  Clock,
  Calendar,
  Mail,
  CreditCard,
  FileText,
  Cloud,
  MessageSquare,
  Webhook,
  Key,
  Activity,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
  nextSync?: string
  syncItems?: string[]
  errorMessage?: string
}

interface SyncLogEntry {
  id: string
  integration: string
  action: string
  status: 'success' | 'warning' | 'error'
  timestamp: string
  details?: string
}

const connectedIntegrations: Integration[] = [
  {
    id: '1',
    name: 'QuickBooks Online',
    description: 'Accounting sync for invoices, bills, and payments',
    icon: CreditCard,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    status: 'connected',
    lastSync: '5 minutes ago',
    nextSync: '25 minutes',
    syncItems: ['Customers', 'Vendors', 'Invoices', 'Bills', 'Payments'],
  },
  {
    id: '2',
    name: 'Google Calendar',
    description: 'Two-way calendar sync for inspections and meetings',
    icon: Calendar,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    status: 'connected',
    lastSync: '2 minutes ago',
    nextSync: 'Real-time',
    syncItems: ['Inspections', 'Deliveries', 'Meetings', 'Milestones'],
  },
  {
    id: '3',
    name: 'Gmail',
    description: 'Auto-capture job-related emails to project files',
    icon: Mail,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    status: 'connected',
    lastSync: '1 minute ago',
    nextSync: 'Real-time',
    syncItems: ['Client emails', 'Vendor emails', 'Attachments'],
  },
]

const availableIntegrations: Integration[] = [
  {
    id: '4',
    name: 'DocuSign',
    description: 'E-signatures for contracts and change orders',
    icon: FileText,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    status: 'disconnected',
  },
  {
    id: '5',
    name: 'Stripe',
    description: 'Accept online payments from clients',
    icon: CreditCard,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    status: 'disconnected',
  },
  {
    id: '6',
    name: 'Dropbox',
    description: 'Sync project documents and photos',
    icon: Cloud,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    status: 'disconnected',
  },
  {
    id: '7',
    name: 'Google Drive',
    description: 'Cloud storage for project files',
    icon: Cloud,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-100',
    status: 'disconnected',
  },
  {
    id: '8',
    name: 'Twilio SMS',
    description: 'Send SMS notifications to clients and team',
    icon: MessageSquare,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    status: 'disconnected',
  },
  {
    id: '9',
    name: 'Zapier',
    description: 'Connect to 5,000+ apps via webhooks',
    icon: Webhook,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    status: 'disconnected',
  },
  {
    id: '10',
    name: 'Outlook Calendar',
    description: 'Microsoft calendar integration',
    icon: Calendar,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    status: 'disconnected',
  },
  {
    id: '11',
    name: 'Outlook Email',
    description: 'Microsoft email capture',
    icon: Mail,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    status: 'disconnected',
  },
]

const recentSyncLog: SyncLogEntry[] = [
  {
    id: '1',
    integration: 'QuickBooks Online',
    action: 'Synced 3 invoices to QBO bills',
    status: 'success',
    timestamp: '5 minutes ago',
  },
  {
    id: '2',
    integration: 'Google Calendar',
    action: 'Created inspection event: Framing - Smith Residence',
    status: 'success',
    timestamp: '15 minutes ago',
  },
  {
    id: '3',
    integration: 'Gmail',
    action: 'Captured email from john@smithfamily.com',
    status: 'success',
    timestamp: '22 minutes ago',
    details: 'Attached to Smith Residence project',
  },
  {
    id: '4',
    integration: 'QuickBooks Online',
    action: 'Vendor sync warning: Duplicate detected',
    status: 'warning',
    timestamp: '1 hour ago',
    details: 'ABC Lumber exists in both systems with different IDs',
  },
  {
    id: '5',
    integration: 'QuickBooks Online',
    action: 'Payment received: Invoice #1234',
    status: 'success',
    timestamp: '2 hours ago',
  },
]

function IntegrationCard({ integration, type }: { integration: Integration; type: 'connected' | 'available' }) {
  const Icon = integration.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 transition-all",
      integration.status === 'error' ? "border-red-200" : "border-gray-200 hover:border-gray-300"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-lg", integration.iconBg)}>
          <Icon className={cn("h-6 w-6", integration.iconColor)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{integration.name}</h4>
            {integration.status === 'connected' && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            )}
            {integration.status === 'error' && (
              <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                <XCircle className="h-3 w-3" />
                Error
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-3">{integration.description}</p>

          {type === 'connected' && integration.syncItems && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Syncing:</p>
              <div className="flex flex-wrap gap-1">
                {integration.syncItems.map((item, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {type === 'connected' && (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last sync: {integration.lastSync}
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Next: {integration.nextSync}
              </span>
            </div>
          )}

          {integration.status === 'error' && integration.errorMessage && (
            <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              {integration.errorMessage}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
        {type === 'connected' ? (
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Settings className="h-4 w-4" />
              Configure
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <RefreshCw className="h-4 w-4" />
              Sync Now
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Eye className="h-4 w-4" />
              View Log
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-gray-200 rounded-lg hover:bg-red-50">
              <Unplug className="h-4 w-4" />
              Disconnect
            </button>
          </>
        ) : (
          <button className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Link className="h-4 w-4" />
            Connect
          </button>
        )}
      </div>
    </div>
  )
}

function SyncLogItem({ entry }: { entry: SyncLogEntry }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className={cn(
        "p-1 rounded-full mt-0.5",
        entry.status === 'success' ? "bg-green-100" :
        entry.status === 'warning' ? "bg-amber-100" :
        "bg-red-100"
      )}>
        {entry.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
        {entry.status === 'warning' && <AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
        {entry.status === 'error' && <XCircle className="h-3.5 w-3.5 text-red-600" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{entry.integration}</span>
          <span className="text-xs text-gray-400">{entry.timestamp}</span>
        </div>
        <p className="text-sm text-gray-600">{entry.action}</p>
        {entry.details && (
          <p className="text-xs text-gray-400 mt-0.5">{entry.details}</p>
        )}
      </div>
    </div>
  )
}

export function IntegrationsPreview() {
  const [activeTab, setActiveTab] = useState<'connected' | 'available' | 'api'>('connected')

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Integrations</h3>
            <p className="text-sm text-gray-500">Connect RossOS to your other business tools</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {connectedIntegrations.length} Connected
            </span>
            <span className="flex items-center gap-2 text-gray-500">
              <Link className="h-4 w-4" />
              {availableIntegrations.length} Available
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center gap-4">
          {[
            { id: 'connected', label: 'Connected', count: connectedIntegrations.length },
            { id: 'available', label: 'Available', count: availableIntegrations.length },
            { id: 'api', label: 'API Access', count: null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-xs",
                  activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'connected' && (
          <div className="grid grid-cols-1 gap-4">
            {connectedIntegrations.map(integration => (
              <IntegrationCard key={integration.id} integration={integration} type="connected" />
            ))}

            {/* Sync Log */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Recent Sync Activity</h4>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View Full Log
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {recentSyncLog.map(entry => (
                  <SyncLogItem key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'available' && (
          <div className="grid grid-cols-2 gap-4">
            {availableIntegrations.map(integration => (
              <IntegrationCard key={integration.id} integration={integration} type="available" />
            ))}
          </div>
        )}

        {activeTab === 'api' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Key className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">API Access</h4>
                <p className="text-sm text-gray-500">Integrate RossOS with your custom applications</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">API Key</span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Regenerate</button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800">
                    sk_live_••••••••••••••••••••••••
                  </code>
                  <button className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
                    Copy
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
                    Show
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">12,847</div>
                  <div className="text-sm text-gray-500">API Calls (This Month)</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">98.7%</div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">142ms</div>
                  <div className="text-sm text-gray-500">Avg Response Time</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FileText className="h-4 w-4" />
                  View API Documentation
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Webhook className="h-4 w-4" />
                  Configure Webhooks
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Integration Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            QuickBooks sync detected duplicate vendor "ABC Lumber" - auto-resolution available.
            Gmail has captured 23 job-related emails this week - 4 still need assignment.
            Consider connecting DocuSign - you've sent 8 contracts manually this month.
          </p>
        </div>
      </div>
    </div>
  )
}
