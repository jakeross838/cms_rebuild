'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function IntegrationsPage() {
  return (
    <PageSpec
      title="Integrations"
      phase="Phase 1 - Integrations"
      planFile="views/company/INTEGRATIONS.md"
      description="Connect RossOS to your other business tools. QuickBooks, email, calendar, and more. Manage connections, sync settings, and monitor integration health."
      workflow={['Browse Available', 'Connect', 'Configure', 'Monitor']}
      features={[
        'QuickBooks Online sync',
        'QuickBooks Desktop sync',
        'Google Calendar',
        'Outlook Calendar',
        'Gmail integration',
        'Outlook email',
        'Stripe payments',
        'DocuSign e-signature',
        'Dropbox/Google Drive',
        'SMS (Twilio)',
        'Zapier webhooks',
        'API access',
        'Sync status monitoring',
        'Error logging',
      ]}
      connections={[
        { name: 'QuickBooks', type: 'bidirectional', description: 'Accounting sync' },
        { name: 'Calendar', type: 'bidirectional', description: 'Schedule sync' },
        { name: 'Email', type: 'bidirectional', description: 'Email capture' },
        { name: 'Storage', type: 'bidirectional', description: 'File sync' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'integration_type', type: 'string', required: true, description: 'Type of integration' },
        { name: 'status', type: 'string', required: true, description: 'Connected, Disconnected, Error' },
        { name: 'connected_at', type: 'timestamp', description: 'When connected' },
        { name: 'last_sync', type: 'timestamp', description: 'Last successful sync' },
        { name: 'sync_frequency', type: 'string', description: 'How often to sync' },
        { name: 'settings', type: 'jsonb', description: 'Integration settings' },
        { name: 'error_log', type: 'jsonb', description: 'Recent errors' },
      ]}
      aiFeatures={[
        {
          name: 'Sync Monitoring',
          description: 'Watches integrations. "QuickBooks sync failed 3 times. Issue: Duplicate customer record. Auto-resolution available."',
          trigger: 'On sync error'
        },
        {
          name: 'Integration Recommendations',
          description: 'Suggests connections. "You manually enter calendar events. Connect Google Calendar to auto-sync from schedule?"',
          trigger: 'On usage pattern'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Integrations                                                        │
├─────────────────────────────────────────────────────────────────────┤
│ CONNECTED                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📗 QuickBooks Online                      ✓ Connected           │ │
│ │    Last sync: 5 minutes ago | Next: 25 min                      │ │
│ │    Syncing: Customers, Vendors, Invoices, Bills                 │ │
│ │    [Configure] [Sync Now] [View Log] [Disconnect]               │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 📅 Google Calendar                        ✓ Connected           │ │
│ │    Last sync: 2 minutes ago | Real-time                         │ │
│ │    Syncing: Inspections, Deliveries, Meetings                   │ │
│ │    [Configure] [View Log] [Disconnect]                          │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ✉️ Gmail                                   ✓ Connected           │ │
│ │    Auto-capturing job-related emails                            │ │
│ │    [Configure Rules] [View Log] [Disconnect]                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ AVAILABLE                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📝 DocuSign                               [Connect]             │ │
│ │    E-signatures for contracts and change orders                 │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 💳 Stripe                                 [Connect]             │ │
│ │    Accept online payments from clients                          │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 📁 Dropbox                                [Connect]             │ │
│ │    Sync project documents and photos                            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Connected: 3 | Available: 8 | Last error: None                     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
