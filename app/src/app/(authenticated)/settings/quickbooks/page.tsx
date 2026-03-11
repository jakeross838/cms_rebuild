'use client'

import { useEffect, useState } from 'react'

import {
  Link2,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Clock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type ConnectionStatus = 'not_connected' | 'connected' | 'error' | 'loading'

interface QBConnection {
  status: ConnectionStatus
  companyName: string | null
  connectedAt: string | null
  lastSyncAt: string | null
  realmId: string | null
}

interface SyncSummary {
  entityType: string
  label: string
  cmsCount: number
  qbCount: number
  syncedCount: number
  errorCount: number
  lastSyncAt: string | null
}

export default function QuickBooksSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [connection, setConnection] = useState<QBConnection>({
    status: 'not_connected',
    companyName: null,
    connectedAt: null,
    lastSyncAt: null,
    realmId: null,
  })
  const [featureEnabled, setFeatureEnabled] = useState(false)

  useEffect(() => {
    async function checkStatus() {
      try {
        // Check feature flag
        const flagRes = await fetch('/api/v1/settings/feature-flags')
        if (flagRes.ok) {
          const flagData = await flagRes.json()
          const qbFlag = flagData.flags?.find(
            (f: { key: string }) => f.key === 'quickbooks_integration'
          )
          setFeatureEnabled(qbFlag?.enabled ?? false)
        }

        // Check QB connection status
        const res = await fetch('/api/v2/integrations/quickbooks/status')
        if (res.ok) {
          const data = await res.json()
          setConnection(data.data ?? { status: 'not_connected', companyName: null, connectedAt: null, lastSyncAt: null, realmId: null })
        }
      } catch {
        // If API doesn't exist yet, show not connected
      } finally {
        setLoading(false)
      }
    }
    checkStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QuickBooks Integration</h1>
          <p className="text-muted-foreground">
            Connect to QuickBooks Online for two-way sync
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">QuickBooks Integration</h1>
        <p className="text-muted-foreground">
          Connect to QuickBooks Online for two-way sync of vendors, clients, invoices, and payments
        </p>
      </div>

      {!featureEnabled && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                QuickBooks integration is not enabled
              </p>
              <p className="text-sm text-amber-700">
                Enable the QuickBooks integration feature flag in{' '}
                <a href="/settings/features" className="underline font-medium">
                  Settings &gt; Features
                </a>{' '}
                to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Manage your QuickBooks Online connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connection.status === 'not_connected' ? (
            <NotConnectedView featureEnabled={featureEnabled} />
          ) : connection.status === 'connected' ? (
            <ConnectedView connection={connection} />
          ) : connection.status === 'error' ? (
            <ErrorView connection={connection} />
          ) : null}
        </CardContent>
      </Card>

      {/* Sync Settings — only show when connected */}
      {connection.status === 'connected' && (
        <>
          <SyncSettingsCard />
          <AccountMappingCard />
        </>
      )}
    </div>
  )
}

function NotConnectedView({ featureEnabled }: { featureEnabled: boolean }) {
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/v2/integrations/quickbooks/connect')
      if (res.ok) {
        const data = await res.json()
        if (data.authUrl) {
          window.location.href = data.authUrl
          return
        }
      }
      toast.error('Unable to start QuickBooks connection. The integration API is not yet configured.')
    } catch {
      toast.error('Unable to start QuickBooks connection. The integration API is not yet configured.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="flex flex-col items-center text-center py-8 space-y-4">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
        <Link2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Connect to QuickBooks Online</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Sync your vendors, customers, invoices, and payments with QuickBooks Online.
          Eliminate double-entry and keep both systems in sync automatically.
        </p>
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        <p className="font-medium">What you&apos;ll need:</p>
        <ul className="list-disc list-inside text-left">
          <li>QuickBooks Online account (Plus or Advanced)</li>
          <li>Admin access to authorize the connection</li>
        </ul>
      </div>
      <Button
        size="lg"
        onClick={handleConnect}
        disabled={!featureEnabled || connecting}
        className="mt-4"
      >
        {connecting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4 mr-2" />
        )}
        Connect to QuickBooks
      </Button>
    </div>
  )
}

function ConnectedView({ connection }: { connection: QBConnection }) {
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/v2/integrations/quickbooks/sync', {
        method: 'POST',
      })
      if (res.ok) {
        toast.success('Sync started successfully')
      } else {
        toast.error('Failed to start sync')
      }
    } catch {
      toast.error('Failed to start sync')
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect QuickBooks? Pending syncs will be cancelled.')) {
      return
    }
    setDisconnecting(true)
    try {
      const res = await fetch('/api/v2/integrations/quickbooks/disconnect', {
        method: 'POST',
      })
      if (res.ok) {
        toast.success('QuickBooks disconnected')
        window.location.reload()
      } else {
        toast.error('Failed to disconnect')
      }
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium">Connected to QuickBooks Online</p>
          {connection.companyName && (
            <p className="text-sm text-muted-foreground">{connection.companyName}</p>
          )}
        </div>
        <Badge variant="outline" className="ml-auto border-green-200 text-green-700 bg-green-50">
          Connected
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Connected Since</p>
          <p className="font-medium">
            {connection.connectedAt
              ? new Date(connection.connectedAt).toLocaleDateString()
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Last Sync</p>
          <p className="font-medium">
            {connection.lastSyncAt
              ? new Date(connection.lastSyncAt).toLocaleString()
              : 'Never'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
          {syncing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync Now
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={handleDisconnect}
          disabled={disconnecting}
        >
          Disconnect
        </Button>
      </div>
    </div>
  )
}

function ErrorView({ connection }: { connection: QBConnection }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-red-700">Connection Error</p>
          <p className="text-sm text-muted-foreground">
            The QuickBooks connection needs to be re-authorized.
          </p>
        </div>
        <Badge variant="outline" className="ml-auto border-red-200 text-red-700 bg-red-50">
          Error
        </Badge>
      </div>
      <Button size="sm">
        <ArrowRight className="h-4 w-4 mr-2" />
        Reconnect QuickBooks
      </Button>
    </div>
  )
}

function SyncSettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Sync Settings
        </CardTitle>
        <CardDescription>
          Configure what data syncs between RossOS and QuickBooks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <SyncEntityRow
            label="Vendors"
            description="Sync vendor records between systems"
            direction="Two-way"
          />
          <SyncEntityRow
            label="Clients / Customers"
            description="Sync client records as QuickBooks customers"
            direction="Two-way"
          />
          <SyncEntityRow
            label="Bills (Vendor Invoices)"
            description="Push approved invoices as QuickBooks bills"
            direction="Push to QB"
          />
          <SyncEntityRow
            label="Customer Invoices (Draws)"
            description="Push approved draws as QuickBooks invoices"
            direction="Push to QB"
          />
          <SyncEntityRow
            label="Chart of Accounts"
            description="Pull QuickBooks accounts to map to cost codes"
            direction="Pull from QB"
          />
          <SyncEntityRow
            label="Jobs / Projects"
            description="Create QuickBooks jobs for each project"
            direction="Push to QB"
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Automatic Sync</p>
              <p className="text-xs text-muted-foreground">
                Sync runs automatically on a schedule
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Every 15 minutes
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SyncEntityRow({
  label,
  description,
  direction,
}: {
  label: string
  description: string
  direction: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Badge variant="secondary" className="text-xs">
        {direction}
      </Badge>
    </div>
  )
}

function AccountMappingCard() {
  const mappings = [
    { category: 'Labor', account: 'Job Labor Expense' },
    { category: 'Materials', account: 'Job Materials Expense' },
    { category: 'Subcontractors', account: 'Subcontractor Expense' },
    { category: 'Equipment', account: 'Equipment Expense' },
    { category: 'Other', account: 'Other Job Costs' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Mapping</CardTitle>
        <CardDescription>
          Map cost code categories to QuickBooks accounts. This controls where
          transactions are posted in QuickBooks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
            <span>Cost Code Category</span>
            <span>QuickBooks Account</span>
          </div>
          {mappings.map((m) => (
            <div key={m.category} className="grid grid-cols-2 gap-4 py-2 border-b last:border-0">
              <span className="text-sm font-medium">{m.category}</span>
              <span className="text-sm text-muted-foreground">{m.account}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Account mappings can be customized after connecting to QuickBooks.
        </p>
      </CardContent>
    </Card>
  )
}
