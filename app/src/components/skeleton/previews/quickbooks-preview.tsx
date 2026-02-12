'use client'

import { useState } from 'react'
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Settings,
  Link,
  Unplug,
  Clock,
  Activity,
  ChevronRight,
  Sparkles,
  DollarSign,
  Users,
  FileText,
  Building2,
  ArrowRight,
  ArrowLeftRight,
  History,
  AlertTriangle,
  CheckSquare,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SyncStatus {
  entity: string
  direction: 'push' | 'pull' | 'bidirectional'
  lastSync: string
  status: 'success' | 'warning' | 'error'
  count?: number
  errorMessage?: string
}

interface AccountMapping {
  costCode: string
  costCodeName: string
  qboAccount: string
  qboAccountId: string
}

interface SyncLogEntry {
  id: string
  action: string
  entity: string
  status: 'success' | 'warning' | 'error'
  timestamp: string
  details?: string
}

const syncStatuses: SyncStatus[] = [
  {
    entity: 'Customers',
    direction: 'bidirectional',
    lastSync: '5 minutes ago',
    status: 'success',
    count: 47,
  },
  {
    entity: 'Vendors',
    direction: 'bidirectional',
    lastSync: '5 minutes ago',
    status: 'warning',
    count: 32,
    errorMessage: '1 duplicate detected',
  },
  {
    entity: 'Invoices to Bills',
    direction: 'push',
    lastSync: '5 minutes ago',
    status: 'success',
    count: 156,
  },
  {
    entity: 'Draws to Invoices',
    direction: 'push',
    lastSync: '5 minutes ago',
    status: 'success',
    count: 89,
  },
  {
    entity: 'Payments',
    direction: 'pull',
    lastSync: '5 minutes ago',
    status: 'success',
    count: 234,
  },
]

const accountMappings: AccountMapping[] = [
  { costCode: '01', costCodeName: 'General Conditions', qboAccount: '5000 - Cost of Goods Sold', qboAccountId: '5000' },
  { costCode: '02', costCodeName: 'Site Work', qboAccount: '5100 - Site Work', qboAccountId: '5100' },
  { costCode: '03', costCodeName: 'Concrete', qboAccount: '5200 - Concrete', qboAccountId: '5200' },
  { costCode: '04', costCodeName: 'Masonry', qboAccount: '5300 - Masonry', qboAccountId: '5300' },
  { costCode: '05', costCodeName: 'Metals', qboAccount: '5400 - Metals & Steel', qboAccountId: '5400' },
  { costCode: '06', costCodeName: 'Wood & Plastics', qboAccount: '5500 - Lumber & Framing', qboAccountId: '5500' },
  { costCode: '07', costCodeName: 'Thermal & Moisture', qboAccount: '5600 - Insulation & Roofing', qboAccountId: '5600' },
  { costCode: '08', costCodeName: 'Doors & Windows', qboAccount: '5700 - Doors & Windows', qboAccountId: '5700' },
]

const recentSyncLog: SyncLogEntry[] = [
  {
    id: '1',
    action: 'Invoice INV-1234 synced to QBO Bill',
    entity: 'Invoices',
    status: 'success',
    timestamp: '5 minutes ago',
    details: 'ABC Electric - $12,500.00',
  },
  {
    id: '2',
    action: 'Vendor sync warning',
    entity: 'Vendors',
    status: 'warning',
    timestamp: '5 minutes ago',
    details: 'ABC Lumber exists in both systems with different IDs',
  },
  {
    id: '3',
    action: 'Draw #4 synced to QBO Invoice',
    entity: 'Draws',
    status: 'success',
    timestamp: '10 minutes ago',
    details: 'Smith Residence - $125,000.00',
  },
  {
    id: '4',
    action: 'Payment received synced',
    entity: 'Payments',
    status: 'success',
    timestamp: '15 minutes ago',
    details: 'Johnson - $85,000.00',
  },
  {
    id: '5',
    action: 'Customer updated',
    entity: 'Customers',
    status: 'success',
    timestamp: '20 minutes ago',
    details: 'Miller family - Address updated',
  },
]

function ConnectionStatus() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">Connected to QuickBooks Online</h4>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-600">Ross Built Construction LLC</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last sync: 5 minutes ago
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Auto-sync: Every 30 minutes
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-white">
            <RefreshCw className="h-4 w-4" />
            Sync Now
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-white">
            <Settings className="h-4 w-4" />
            Configure
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-gray-200 rounded-lg hover:bg-red-50">
            <Unplug className="h-4 w-4" />
            Disconnect
          </button>
        </div>
      </div>
    </div>
  )
}

function SyncSettings() {
  const [settings, setSettings] = useState({
    autoSyncInvoices: true,
    autoSyncDraws: true,
    twoWayVendorSync: true,
    autoSyncPayments: false,
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-4">Sync Settings</h4>
      <div className="space-y-4">
        {[
          { key: 'autoSyncInvoices', label: 'Auto-sync approved invoices to QBO bills', description: 'Approved invoices automatically create bills in QuickBooks' },
          { key: 'autoSyncDraws', label: 'Auto-sync submitted draws to QBO invoices', description: 'Draw requests automatically create customer invoices' },
          { key: 'twoWayVendorSync', label: 'Two-way vendor sync', description: 'Keep vendor information synchronized between systems' },
          { key: 'autoSyncPayments', label: 'Auto-sync payments (requires confirmation)', description: 'Automatically record payments from QuickBooks' },
        ].map(item => (
          <div key={item.key} className="flex items-start justify-between py-2">
            <div>
              <div className="text-sm font-medium text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof settings] }))}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors",
                settings[item.key as keyof typeof settings] ? "bg-blue-600" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                  settings[item.key as keyof typeof settings] && "translate-x-5"
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function SyncStatusCard({ sync }: { sync: SyncStatus }) {
  return (
    <div className={cn(
      "bg-white rounded-lg border p-3",
      sync.status === 'error' ? "border-red-200" :
      sync.status === 'warning' ? "border-amber-200" :
      "border-gray-200"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">{sync.entity}</span>
          {sync.direction === 'push' && <ArrowRight className="h-3 w-3 text-gray-400" />}
          {sync.direction === 'pull' && <ArrowRight className="h-3 w-3 text-gray-400 rotate-180" />}
          {sync.direction === 'bidirectional' && <ArrowLeftRight className="h-3 w-3 text-gray-400" />}
        </div>
        {sync.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        {sync.status === 'warning' && <AlertCircle className="h-4 w-4 text-amber-500" />}
        {sync.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{sync.lastSync}</span>
        {sync.count && <span>{sync.count} records</span>}
      </div>
      {sync.errorMessage && (
        <div className={cn(
          "mt-2 text-xs p-2 rounded",
          sync.status === 'warning' ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
        )}>
          {sync.errorMessage}
        </div>
      )}
    </div>
  )
}

function AccountMappingTable() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Account Mapping</h4>
          <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Auto-suggest Mappings
          </button>
        </div>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cost Code</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">QuickBooks Account</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {accountMappings.map((mapping, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm font-mono text-gray-700">{mapping.costCode}</td>
              <td className="px-4 py-2 text-sm text-gray-900">{mapping.costCodeName}</td>
              <td className="px-4 py-2">
                <select className="text-sm border border-gray-200 rounded px-2 py-1 w-full">
                  <option>{mapping.qboAccount}</option>
                </select>
              </td>
              <td className="px-4 py-2 text-right">
                <button className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SyncLogPanel() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-gray-900">Sync History</h4>
          </div>
          <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View Full Log
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
        {recentSyncLog.map(entry => (
          <div key={entry.id} className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-start gap-3">
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
                  <span className="text-sm font-medium text-gray-900">{entry.action}</span>
                  <span className="text-xs text-gray-400">{entry.timestamp}</span>
                </div>
                {entry.details && (
                  <p className="text-xs text-gray-500 mt-0.5">{entry.details}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function QuickbooksPreview() {
  const [activeTab, setActiveTab] = useState<'overview' | 'mapping' | 'settings'>('overview')

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">QuickBooks Integration</h3>
            <p className="text-sm text-gray-500">Sync data with QuickBooks Online</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <History className="h-4 w-4" />
              History
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <RefreshCw className="h-4 w-4" />
              Sync Now
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center gap-4">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'mapping', label: 'Account Mapping', icon: Link },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon
            return (
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
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <ConnectionStatus />

            {/* Sync Status Grid */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">SYNC STATUS</h4>
              <div className="grid grid-cols-5 gap-3">
                {syncStatuses.map((sync, i) => (
                  <SyncStatusCard key={i} sync={sync} />
                ))}
              </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">1 sync issue needs attention</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Duplicate vendor detected: "ABC Lumber" exists in both systems with different IDs.
                </p>
              </div>
              <button className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Resolve
              </button>
            </div>

            {/* Sync Log */}
            <SyncLogPanel />
          </div>
        )}

        {activeTab === 'mapping' && (
          <div className="space-y-4">
            <AccountMappingTable />

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-4">Class & Location Mapping</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Map Jobs To:</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option>QuickBooks Classes</option>
                    <option>QuickBooks Locations</option>
                    <option>QuickBooks Projects</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Default Class/Location:</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option>None (Create per Job)</option>
                    <option>Construction</option>
                    <option>Service</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <SyncSettings />

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-4">Sync Frequency</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Auto-sync Interval:</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option>Every 15 minutes</option>
                    <option>Every 30 minutes</option>
                    <option>Every hour</option>
                    <option>Manual only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Sync Window:</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option>24/7</option>
                    <option>Business hours only (8am-6pm)</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-4">Error Handling</h4>
              <div className="space-y-3">
                {[
                  { label: 'Retry failed syncs automatically', checked: true },
                  { label: 'Email alerts on sync failures', checked: true },
                  { label: 'Pause sync on repeated errors', checked: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <button
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors",
                        item.checked ? "bg-blue-600" : "bg-gray-200"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                          item.checked && "translate-x-5"
                        )}
                      />
                    </button>
                  </div>
                ))}
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
            <span className="font-medium text-sm text-amber-800">QuickBooks Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            Duplicate vendor "ABC Lumber" detected - suggest merging QBO record ID 123 with RossOS ID 456.
            3 cost codes are unmapped - auto-mapping available based on account name matching.
            Sync history shows 99.2% success rate this month - 2 retried items now resolved.
          </p>
        </div>
      </div>
    </div>
  )
}
