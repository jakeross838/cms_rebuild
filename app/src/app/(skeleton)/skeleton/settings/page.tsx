'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Company Setup', 'Settings', 'Users', 'Integrations', 'Templates'
]

export default function SettingsSkeleton() {
  return (
    <PageSpec
      title="Global Settings"
      phase="Phase 0 - Foundation"
      planFile="views/global/GLOBAL_SETTINGS.md"
      description="Company-wide settings for the CMS. Configure branding, approval workflows, cost codes, integrations, user management, and system preferences."
      workflow={constructionWorkflow}
      features={[
        'Company profile: Name, logo, address, contact info',
        'User management: Invite, roles, permissions',
        'Cost code library: Default codes, custom codes',
        'Approval thresholds: Invoice, PO amounts requiring approval',
        'Invoice processing settings: AI confidence thresholds',
        'Notification preferences: Email, push, SMS settings',
        'Client portal branding: Logo, colors',
        'Integration connections: QuickBooks, etc.',
        'Data export: Backup and export tools',
        'Subscription and billing',
      ]}
      connections={[
        { name: 'Users', type: 'bidirectional', description: 'User management' },
        { name: 'Cost Codes', type: 'bidirectional', description: 'Cost code configuration' },
        { name: 'Invoices', type: 'output', description: 'Approval thresholds affect workflow' },
        { name: 'Purchase Orders', type: 'output', description: 'Approval thresholds affect workflow' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Integration configuration' },
        { name: 'Client Portal', type: 'output', description: 'Branding settings' },
        { name: 'AI Processing', type: 'output', description: 'Confidence thresholds' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Company ID' },
        { name: 'name', type: 'string', required: true, description: 'Company name' },
        { name: 'logo_url', type: 'string', description: 'Company logo' },
        { name: 'address', type: 'string', description: 'Company address' },
        { name: 'phone', type: 'string', description: 'Company phone' },
        { name: 'email', type: 'string', description: 'Company email' },
        { name: 'settings', type: 'jsonb', description: 'All settings in JSON' },
        { name: 'invoice_approval_threshold', type: 'decimal', description: 'Amount requiring owner approval' },
        { name: 'po_approval_threshold', type: 'decimal', description: 'PO amount requiring approval' },
        { name: 'ai_confidence_threshold', type: 'decimal', description: 'Minimum AI confidence for auto-match' },
        { name: 'timezone', type: 'string', description: 'Company timezone' },
        { name: 'fiscal_year_start', type: 'integer', description: 'Fiscal year start month' },
      ]}
      aiFeatures={[
        { name: 'Settings Recommendations', description: 'AI suggests optimal settings based on company size and usage patterns', trigger: 'On settings view' },
        { name: 'Usage Analytics', description: 'Shows which features are used most for optimization', trigger: 'Dashboard' },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Settings                                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌──────────────────┐                                                │
│ │ Settings Nav     │  COMPANY PROFILE                               │
│ │                  │  ────────────────────────────────────────────  │
│ │ • Company        │                                                │
│ │ • Users          │  Company Name: [Ross Built Construction    ]   │
│ │ • Cost Codes     │  Address:      [123 Builder Ave, Austin TX ]   │
│ │ • Approvals      │  Phone:        [(512) 555-1234            ]   │
│ │ • Notifications  │  Email:        [info@rossbuilt.com        ]   │
│ │ • Portal         │                                                │
│ │ • Integrations   │  Logo: [Upload Logo]  [Current: logo.png]      │
│ │ • Billing        │                                                │
│ │                  │  ────────────────────────────────────────────  │
│ │                  │  APPROVAL THRESHOLDS                           │
│ │                  │                                                │
│ │                  │  Invoices requiring owner approval: [$25,000]  │
│ │                  │  POs requiring approval:            [$10,000]  │
│ │                  │                                                │
│ │                  │                            [Cancel] [Save]     │
│ └──────────────────┘                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
