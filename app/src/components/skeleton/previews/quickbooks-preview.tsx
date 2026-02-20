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
  Zap,
  Shield,
  Database,
  RotateCcw,
  Ban,
  Eye,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

type ConnectionHealth = 'healthy' | 'warning' | 'error' | 'disconnected'
type ConflictStrategy = 'last_write_wins' | 'platform_wins' | 'qbo_wins' | 'manual_review'

interface SyncStatus {
  entity: string
  direction: 'push' | 'pull' | 'bidirectional'
  lastSync: string
  status: 'success' | 'warning' | 'error'
  count: number
  errorCount: number
  errorMessage?: string
  syncMode: 'auto' | 'manual' | 'real_time'
}

interface AccountMapping {
  costCode: string
  costCodeName: string
  qboAccount: string
  qboAccountId: string
  mappingType: 'expense' | 'revenue' | 'asset' | 'liability'
  isMapped: boolean
}

interface SyncLogEntry {
  id: string
  action: string
  entity: string
  status: 'success' | 'warning' | 'error'
  timestamp: string
  details?: string
  direction: 'push' | 'pull'
  retryCount?: number
}

interface ConflictEntry {
  id: string
  entity: string
  entityId: string
  platformValue: string
  qboValue: string
  field: string
  detectedAt: string
  strategy: ConflictStrategy
}

const connectionHealth: ConnectionHealth = 'healthy'
const tokenExpiresIn = 28
const syncSuccessRate = 99.2
const totalRecordsSynced = 1247

const syncStatuses: SyncStatus[] = [
  {
    entity: 'Customers',
    direction: 'bidirectional',
    lastSync: '5 minutes ago',
    status: 'success',
    count: 47,
    errorCount: 0,
    syncMode: 'auto',
  },
  {
    entity: 'Vendors',
    direction: 'bidirectional',
    lastSync: '5 minutes ago',
    status: 'warning',
    count: 32,
    errorCount: 1,
    errorMessage: '1 duplicate detected',
    syncMode: 'auto',
  },
  {
    entity: 'Bills (AP)',
    direction: 'push',
    lastSync: '5 minutes ago',
    status: 'success',
    count: 156,
    errorCount: 0,
    syncMode: 'real_time',
  },
  {
    entity: 'Invoices (AR)',
    direction: 'push',
    lastSync: '5 minutes ago',
    status: 'success',
    count: 89,
    errorCount: 0,
    syncMode: 'real_time',
  },
  {
    entity: 'Payments Received',
    direction: 'pull',
    lastSync: '5 minutes ago',
    status: 'success',
    count: 234,
    errorCount: 0,
    syncMode: 'auto',
  },
  {
    entity: 'Bill Payments',
    direction: 'pull',
    lastSync: '10 minutes ago',
    status: 'success',
    count: 178,
    errorCount: 0,
    syncMode: 'auto',
  },
  {
    entity: 'Journal Entries',
    direction: 'push',
    lastSync: '1 hour ago',
    status: 'error',
    count: 12,
    errorCount: 2,
    errorMessage: '2 entries failed: unmapped accounts',
    syncMode: 'manual',
  },
]

const accountMappings: AccountMapping[] = [
  { costCode: '01', costCodeName: 'General Conditions', qboAccount: '5000 - Cost of Goods Sold', qboAccountId: '5000', mappingType: 'expense', isMapped: true },
  { costCode: '02', costCodeName: 'Site Work', qboAccount: '5100 - Site Work', qboAccountId: '5100', mappingType: 'expense', isMapped: true },
  { costCode: '03', costCodeName: 'Concrete', qboAccount: '5200 - Concrete', qboAccountId: '5200', mappingType: 'expense', isMapped: true },
  { costCode: '04', costCodeName: 'Masonry', qboAccount: '5300 - Masonry', qboAccountId: '5300', mappingType: 'expense', isMapped: true },
  { costCode: '05', costCodeName: 'Metals', qboAccount: '5400 - Metals & Steel', qboAccountId: '5400', mappingType: 'expense', isMapped: true },
  { costCode: '06', costCodeName: 'Wood & Plastics', qboAccount: '5500 - Lumber & Framing', qboAccountId: '5500', mappingType: 'expense', isMapped: true },
  { costCode: '07', costCodeName: 'Thermal & Moisture', qboAccount: '5600 - Insulation & Roofing', qboAccountId: '5600', mappingType: 'expense', isMapped: true },
  { costCode: '08', costCodeName: 'Doors & Windows', qboAccount: '5700 - Doors & Windows', qboAccountId: '5700', mappingType: 'expense', isMapped: true },
  { costCode: '09', costCodeName: 'Finishes', qboAccount: '', qboAccountId: '', mappingType: 'expense', isMapped: false },
  { costCode: '10', costCodeName: 'Specialties', qboAccount: '', qboAccountId: '', mappingType: 'expense', isMapped: false },
  { costCode: 'RET', costCodeName: 'Retainage Payable', qboAccount: '2100 - Retainage Payable', qboAccountId: '2100', mappingType: 'liability', isMapped: true },
  { costCode: 'SM', costCodeName: 'Stored Materials', qboAccount: '1500 - Stored Materials', qboAccountId: '1500', mappingType: 'asset', isMapped: true },
]

const recentSyncLog: SyncLogEntry[] = [
  {
    id: '1',
    action: 'Invoice INV-1234 synced to QBO Bill',
    entity: 'Bills',
    status: 'success',
    timestamp: '5 minutes ago',
    details: 'ABC Electric - $12,500.00',
    direction: 'push',
  },
  {
    id: '2',
    action: 'Vendor sync conflict detected',
    entity: 'Vendors',
    status: 'warning',
    timestamp: '5 minutes ago',
    details: 'ABC Lumber exists in both systems with different addresses. Using platform-wins strategy.',
    direction: 'push',
  },
  {
    id: '3',
    action: 'Draw #4 synced to QBO Invoice',
    entity: 'Invoices',
    status: 'success',
    timestamp: '10 minutes ago',
    details: 'Smith Residence - $125,000.00',
    direction: 'push',
  },
  {
    id: '4',
    action: 'Journal entry failed',
    entity: 'Journal Entries',
    status: 'error',
    timestamp: '1 hour ago',
    details: 'Retainage adjustment - cost code 09 (Finishes) not mapped to any QBO account',
    direction: 'push',
    retryCount: 3,
  },
  {
    id: '5',
    action: 'Payment received synced',
    entity: 'Payments',
    status: 'success',
    timestamp: '15 minutes ago',
    details: 'Johnson - Draw #3 - $85,000.00',
    direction: 'pull',
  },
  {
    id: '6',
    action: 'Customer updated',
    entity: 'Customers',
    status: 'success',
    timestamp: '20 minutes ago',
    details: 'Miller family - Address updated from QBO',
    direction: 'pull',
  },
  {
    id: '7',
    action: 'Bill payment synced',
    entity: 'Bill Payments',
    status: 'success',
    timestamp: '25 minutes ago',
    details: 'PGT Windows - Check #4521 - $34,500.00',
    direction: 'pull',
  },
]

const conflicts: ConflictEntry[] = [
  {
    id: '1',
    entity: 'Vendor',
    entityId: 'ABC Lumber',
    platformValue: '123 Oak Street, Tampa, FL 33601',
    qboValue: '123 Oak St, Tampa, FL 33601',
    field: 'address',
    detectedAt: '5 minutes ago',
    strategy: 'platform_wins',
  },
]

function ConnectionStatus() {
  return (
    <div className={cn(
      "border rounded-lg p-4",
      connectionHealth === 'healthy' ? "bg-green-50 border-green-200" :
      connectionHealth === 'warning' ? "bg-amber-50 border-amber-200" :
      "bg-red-50 border-red-200"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-lg",
            connectionHealth === 'healthy' ? "bg-green-100" :
            connectionHealth === 'warning' ? "bg-amber-100" :
            "bg-red-100"
          )}>
            <CheckCircle2 className={cn(
              "h-8 w-8",
              connectionHealth === 'healthy' ? "text-green-600" :
              connectionHealth === 'warning' ? "text-amber-600" :
              "text-red-600"
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-warm-900">Connected to QuickBooks Online</h4>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                connectionHealth === 'healthy' ? "bg-green-100 text-green-700" :
                connectionHealth === 'warning' ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              )}>
                {connectionHealth === 'healthy' ? 'Healthy' : connectionHealth === 'warning' ? 'Warning' : 'Error'}
              </span>
            </div>
            <p className="text-sm text-warm-600">Ross Built Construction LLC</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-warm-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last sync: 5 minutes ago
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Auto-sync: Every 30 minutes
              </span>
              <span className={cn(
                "flex items-center gap-1",
                tokenExpiresIn <= 7 ? "text-red-600 font-medium" :
                tokenExpiresIn <= 14 ? "text-amber-600" :
                "text-warm-500"
              )}>
                <Shield className="h-3 w-3" />
                Token expires: {tokenExpiresIn} days
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-white">
            <RefreshCw className="h-4 w-4" />
            Sync Now
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-white">
            <Settings className="h-4 w-4" />
            Configure
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-warm-200 rounded-lg hover:bg-red-50">
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
    realTimePush: true,
    journalEntries: true,
  })

  return (
    <div className="bg-white rounded-lg border border-warm-200 p-4">
      <h4 className="font-medium text-warm-900 mb-4">Sync Settings</h4>
      <div className="space-y-4">
        {[
          { key: 'autoSyncInvoices', label: 'Auto-sync approved invoices to QBO bills', description: 'Approved invoices automatically create bills in QuickBooks' },
          { key: 'autoSyncDraws', label: 'Auto-sync submitted draws to QBO invoices', description: 'Draw requests automatically create customer invoices' },
          { key: 'twoWayVendorSync', label: 'Two-way vendor sync', description: 'Keep vendor information synchronized between systems' },
          { key: 'autoSyncPayments', label: 'Auto-sync payments (requires confirmation)', description: 'Automatically record payments from QuickBooks' },
          { key: 'realTimePush', label: 'Real-time push on record creation', description: 'Push records immediately on creation instead of waiting for scheduled sync' },
          { key: 'journalEntries', label: 'Sync journal entries (retainage, WIP)', description: 'Push retainage and WIP adjustment journal entries' },
        ].map(item => (
          <div key={item.key} className="flex items-start justify-between py-2">
            <div>
              <div className="text-sm font-medium text-warm-900">{item.label}</div>
              <div className="text-xs text-warm-500">{item.description}</div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof settings] }))}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors",
                settings[item.key as keyof typeof settings] ? "bg-stone-600" : "bg-warm-200"
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
      "border-warm-200"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-warm-900 text-sm">{sync.entity}</span>
          {sync.direction === 'push' && <ArrowRight className="h-3 w-3 text-warm-400" />}
          {sync.direction === 'pull' && <ArrowRight className="h-3 w-3 text-warm-400 rotate-180" />}
          {sync.direction === 'bidirectional' && <ArrowLeftRight className="h-3 w-3 text-warm-400" />}
        </div>
        <div className="flex items-center gap-1">
          {sync.syncMode === 'real_time' && (
            <span title="Real-time sync"><Zap className="h-3 w-3 text-purple-500" /></span>
          )}
          {sync.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {sync.status === 'warning' && <AlertCircle className="h-4 w-4 text-amber-500" />}
          {sync.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-warm-500">
        <span>{sync.lastSync}</span>
        <span>{sync.count} records</span>
      </div>
      {sync.errorCount > 0 && (
        <div className={cn(
          "mt-2 text-xs p-2 rounded flex items-center justify-between",
          sync.status === 'warning' ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
        )}>
          <span>{sync.errorMessage}</span>
          <button className="text-xs font-medium underline ml-2">Fix</button>
        </div>
      )}
    </div>
  )
}

function AccountMappingTable() {
  const unmappedCount = accountMappings.filter(m => !m.isMapped).length
  return (
    <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-warm-900">Account Mapping</h4>
            {unmappedCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                {unmappedCount} unmapped
              </span>
            )}
          </div>
          <button className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Auto-suggest Mappings
          </button>
        </div>
      </div>
      <table className="w-full">
        <thead className="bg-warm-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-warm-500">Code</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-warm-500">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-warm-500">Type</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-warm-500">QuickBooks Account</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-warm-500"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-warm-200">
          {accountMappings.map((mapping, i) => (
            <tr key={i} className={cn("hover:bg-warm-50", !mapping.isMapped && "bg-amber-50")}>
              <td className="px-4 py-2 text-sm font-mono text-warm-700">{mapping.costCode}</td>
              <td className="px-4 py-2 text-sm text-warm-900">{mapping.costCodeName}</td>
              <td className="px-4 py-2">
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  mapping.mappingType === 'expense' ? "bg-stone-50 text-stone-600" :
                  mapping.mappingType === 'revenue' ? "bg-green-50 text-green-600" :
                  mapping.mappingType === 'asset' ? "bg-purple-50 text-purple-600" :
                  "bg-orange-50 text-orange-600"
                )}>
                  {mapping.mappingType}
                </span>
              </td>
              <td className="px-4 py-2">
                {mapping.isMapped ? (
                  <select className="text-sm border border-warm-200 rounded px-2 py-1 w-full">
                    <option>{mapping.qboAccount}</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <select className="text-sm border border-amber-300 rounded px-2 py-1 w-full bg-amber-50">
                      <option value="">-- Select Account --</option>
                    </select>
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  </div>
                )}
              </td>
              <td className="px-4 py-2 text-right">
                <button className="text-xs text-stone-600 hover:text-stone-700">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SyncLogPanel() {
  const errorCount = recentSyncLog.filter(e => e.status === 'error').length
  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-stone-600" />
            <h4 className="font-medium text-warm-900">Sync History</h4>
            {errorCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <button className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                Retry All Failed
              </button>
            )}
            <button className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1">
              View Full Log
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-warm-100 max-h-72 overflow-y-auto">
        {recentSyncLog.map(entry => (
          <div key={entry.id} className={cn(
            "px-4 py-3 hover:bg-warm-50",
            entry.status === 'error' && "bg-red-50"
          )}>
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
                  <span className="text-sm font-medium text-warm-900">{entry.action}</span>
                  <span className="text-xs text-warm-400">{entry.timestamp}</span>
                  {entry.direction === 'push' && <ArrowRight className="h-3 w-3 text-warm-300" />}
                  {entry.direction === 'pull' && <ArrowRight className="h-3 w-3 text-warm-300 rotate-180" />}
                </div>
                {entry.details && (
                  <p className="text-xs text-warm-500 mt-0.5">{entry.details}</p>
                )}
                {entry.retryCount && entry.retryCount > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-red-600">{entry.retryCount} retries failed</span>
                    <button className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1">
                      <RotateCcw className="h-3 w-3" />
                      Retry
                    </button>
                    <button className="text-xs text-warm-400 hover:text-warm-600">
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConflictResolutionPanel() {
  if (conflicts.length === 0) return null
  return (
    <div className="bg-white rounded-lg border border-amber-200">
      <div className="px-4 py-3 border-b border-amber-200 bg-amber-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h4 className="font-medium text-warm-900">Conflicts ({conflicts.length})</h4>
          </div>
          <button className="text-xs text-amber-700 hover:text-amber-800 font-medium">
            Resolve All
          </button>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {conflicts.map(conflict => (
          <div key={conflict.id} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-warm-900">{conflict.entity}: {conflict.entityId}</span>
              <span className="text-xs text-warm-400">Field: {conflict.field}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-warm-100 text-warm-600">
                Strategy: {conflict.strategy.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-stone-50 rounded p-2">
                <div className="text-xs text-stone-600 font-medium mb-0.5">RossOS Value</div>
                <div className="text-warm-700">{conflict.platformValue}</div>
              </div>
              <div className="bg-purple-50 rounded p-2">
                <div className="text-xs text-purple-600 font-medium mb-0.5">QBO Value</div>
                <div className="text-warm-700">{conflict.qboValue}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button className="text-xs px-2 py-1 bg-stone-600 text-white rounded hover:bg-stone-700">
                Keep RossOS
              </button>
              <button className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
                Keep QBO
              </button>
              <button className="text-xs px-2 py-1 text-warm-600 border border-warm-200 rounded hover:bg-warm-50">
                Ignore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function QuickbooksPreview() {
  const [activeTab, setActiveTab] = useState<'overview' | 'mapping' | 'settings'>('overview')

  const errorCount = syncStatuses.reduce((sum, s) => sum + s.errorCount, 0)
  const totalSyncedEntities = syncStatuses.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">QuickBooks Integration</h3>
              <span className="text-sm text-warm-500">Bi-directional sync with QuickBooks Online</span>
              {errorCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errorCount} error{errorCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <History className="h-4 w-4" />
              History
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <RefreshCw className="h-4 w-4" />
              Sync Now
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-2.5">
            <div className="text-xs text-green-600 flex items-center gap-1"><Activity className="h-3 w-3" />Success Rate</div>
            <div className="text-lg font-bold text-green-700">{syncSuccessRate}%</div>
          </div>
          <div className="bg-stone-50 rounded-lg p-2.5">
            <div className="text-xs text-stone-600 flex items-center gap-1"><Database className="h-3 w-3" />Total Synced</div>
            <div className="text-lg font-bold text-stone-700">{totalSyncedEntities.toLocaleString()}</div>
          </div>
          <div className={cn("rounded-lg p-2.5", errorCount > 0 ? "bg-red-50" : "bg-warm-50")}>
            <div className={cn("text-xs flex items-center gap-1", errorCount > 0 ? "text-red-600" : "text-warm-500")}>
              <AlertTriangle className="h-3 w-3" />Errors
            </div>
            <div className={cn("text-lg font-bold", errorCount > 0 ? "text-red-700" : "text-warm-500")}>{errorCount}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-2.5">
            <div className="text-xs text-warm-500 flex items-center gap-1"><Shield className="h-3 w-3" />Token Expires</div>
            <div className={cn("text-lg font-bold", tokenExpiresIn <= 7 ? "text-red-700" : "text-warm-700")}>{tokenExpiresIn} days</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-warm-200 px-4">
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
                    ? "border-stone-600 text-stone-600"
                    : "border-transparent text-warm-500 hover:text-warm-700"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'mapping' && accountMappings.filter(m => !m.isMapped).length > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                    {accountMappings.filter(m => !m.isMapped).length}
                  </span>
                )}
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
              <h4 className="text-sm font-semibold text-warm-700 mb-3">SYNC STATUS BY ENTITY</h4>
              <div className="grid grid-cols-4 gap-3">
                {syncStatuses.map((sync, i) => (
                  <SyncStatusCard key={i} sync={sync} />
                ))}
              </div>
            </div>

            {/* Conflict Resolution */}
            <ConflictResolutionPanel />

            {/* Warning Banner */}
            {accountMappings.filter(m => !m.isMapped).length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    {accountMappings.filter(m => !m.isMapped).length} cost codes are unmapped
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Transactions for unmapped cost codes will be held in the review queue until mapped.
                  </p>
                </div>
                <button className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                  Map Now
                </button>
              </div>
            )}

            {/* Sync Log */}
            <SyncLogPanel />
          </div>
        )}

        {activeTab === 'mapping' && (
          <div className="space-y-4">
            <AccountMappingTable />

            <div className="bg-white rounded-lg border border-warm-200 p-4">
              <h4 className="font-medium text-warm-900 mb-4">Class & Location Mapping</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-warm-700 mb-1">Map Jobs To:</label>
                  <select className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm">
                    <option>QuickBooks Classes</option>
                    <option>QuickBooks Locations</option>
                    <option>QuickBooks Projects</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-warm-700 mb-1">Default Class/Location:</label>
                  <select className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm">
                    <option>None (Create per Job)</option>
                    <option>Construction</option>
                    <option>Service</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-warm-200 p-4">
              <h4 className="font-medium text-warm-900 mb-4">Conflict Resolution Strategy</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { entity: 'Invoices/Bills', strategy: 'platform_wins' },
                  { entity: 'Payments', strategy: 'qbo_wins' },
                  { entity: 'Vendors', strategy: 'platform_wins' },
                  { entity: 'Customers', strategy: 'last_write_wins' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-warm-700">{item.entity}</span>
                    <select className="text-sm border border-warm-200 rounded px-2 py-1">
                      <option value="last_write_wins" selected={item.strategy === 'last_write_wins'}>Last Write Wins</option>
                      <option value="platform_wins" selected={item.strategy === 'platform_wins'}>RossOS Wins</option>
                      <option value="qbo_wins" selected={item.strategy === 'qbo_wins'}>QBO Wins</option>
                      <option value="manual_review">Manual Review</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <SyncSettings />

            <div className="bg-white rounded-lg border border-warm-200 p-4">
              <h4 className="font-medium text-warm-900 mb-4">Sync Frequency</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-warm-700 mb-1">Auto-sync Interval:</label>
                  <select className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm">
                    <option>Every 15 minutes</option>
                    <option selected>Every 30 minutes</option>
                    <option>Every hour</option>
                    <option>Daily</option>
                    <option>Manual only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-warm-700 mb-1">Sync Window:</label>
                  <select className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm">
                    <option selected>24/7</option>
                    <option>Business hours only (8am-6pm)</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-warm-200 p-4">
              <h4 className="font-medium text-warm-900 mb-4">Error Handling & Retry</h4>
              <div className="space-y-3">
                {[
                  { label: 'Retry failed syncs automatically (max 5 retries, exponential backoff)', checked: true },
                  { label: 'Email alerts on sync failures', checked: true },
                  { label: 'Pause sync on repeated errors (3+ consecutive failures)', checked: false },
                  { label: 'Alert on stale sync (no successful sync for 7+ days)', checked: true },
                  { label: 'Dead-letter queue for permanently failed items', checked: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-warm-700">{item.label}</span>
                    <button
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors",
                        item.checked ? "bg-stone-600" : "bg-warm-200"
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

            <div className="bg-white rounded-lg border border-warm-200 p-4">
              <h4 className="font-medium text-warm-900 mb-3">Other Integrations</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-warm-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-warm-700">Xero</div>
                    <div className="text-xs text-warm-400">Alternative accounting system</div>
                  </div>
                  <button className="text-xs px-3 py-1.5 text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50">
                    Connect
                  </button>
                </div>
                <div className="flex-1 bg-warm-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-warm-700">Zapier / Make</div>
                    <div className="text-xs text-warm-400">Webhook-based automation</div>
                  </div>
                  <button className="text-xs px-3 py-1.5 text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50">
                    Configure
                  </button>
                </div>
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
            2 cost codes unmapped (09-Finishes, 10-Specialties) - blocking 2 journal entries. Auto-mapping suggested
            based on account name similarity. Vendor conflict: "ABC Lumber" address differs between systems (resolved
            using platform-wins). Sync health: 99.2% success rate this month. Token renewal needed in {tokenExpiresIn} days.
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="p-4 border-t border-warm-200">
        <AIFeaturesPanel
          title="QuickBooks AI Features"
          columns={2}
          features={[
            {
              feature: 'Sync Health',
              trigger: 'Real-time',
              insight: 'Monitors sync status and errors across all entity types. Currently tracking 7 entity syncs with 99.2% success rate.',
              severity: 'success',
              confidence: 99,
            },
            {
              feature: 'Mapping Validation',
              trigger: 'On change',
              insight: 'Validates account mappings between cost codes and QuickBooks accounts. 2 unmapped cost codes detected requiring attention.',
              severity: 'warning',
              confidence: 95,
            },
            {
              feature: 'Discrepancy Detection',
              trigger: 'Real-time',
              insight: 'Identifies data mismatches between systems. 1 vendor address conflict detected and auto-resolved using platform-wins strategy.',
              severity: 'info',
              confidence: 92,
            },
            {
              feature: 'Reconciliation Assist',
              trigger: 'On submission',
              insight: 'Helps resolve sync issues by suggesting corrections. 2 journal entries pending due to unmapped accounts - auto-mapping available.',
              severity: 'warning',
              confidence: 88,
            },
            {
              feature: 'Performance Metrics',
              trigger: 'Daily',
              insight: 'Tracks sync reliability and performance trends. This month: 1,247 records synced, 99.2% success rate, avg sync time 2.3s.',
              severity: 'success',
              confidence: 97,
            },
          ]}
        />
      </div>
    </div>
  )
}
