'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { SettingsPreview } from '@/components/skeleton/previews/settings-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Company Setup', 'Settings', 'Users', 'Integrations', 'Templates'
]

export default function SettingsSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? <SettingsPreview /> : <PageSpec
      title="Global Settings"
      phase="Phase 1 - Foundation"
      planFile="docs/modules/02-configuration-engine.md"
      description="Company-wide settings hub organized by category. 4-level config hierarchy (Platform > Company > Project > User). Covers 19 categories: company profile, users/roles, cost codes, workflows, phases, terminology, numbering, custom fields, notifications, portals, templates, feature flags, integrations, billing, data management, security, AI settings, config versioning, and regional/jurisdiction configuration."
      workflow={constructionWorkflow}
      features={[
        'Company profile: name, legal name, logo, license, EIN, address',
        'Users & teams: 7 system roles, custom roles, Permission Wizard, permissions mode (open/standard/strict)',
        'Cost code management: CSI/custom/hybrid tree, import/export CSV, mid-project remapping (GAP-017, GAP-027)',
        'Approval workflows: configurable state machines per entity type with dollar thresholds (GAP-016, GAP-022)',
        'Project phases: ordered structure with colors, durations, templates (GAP-018)',
        'Terminology engine: ~50 customizable display terms, propagates to UI/portals/docs (GAP-019)',
        'Numbering sequences: pattern syntax with tokens, global or per-project scope (GAP-021)',
        'Custom fields: EAV on any entity, conditional visibility/required, dropdowns (GAP-023, GAP-024, GAP-029, GAP-030)',
        'Notification preferences: event routing per role per channel, template overrides',
        'Client & vendor portal configuration: feature toggles, branding, access levels',
        'Document & email templates: customizable with merge fields',
        'Feature flags: per-tenant module toggles tied to subscription plan (GAP-003)',
        'Integration management: QuickBooks, Calendar, Email, DocuSign, Stripe sync status',
        'Subscription & billing: plan, payment method, usage metrics (owner-only)',
        'Data management: backup config, CSV import, full export, retention policy, API keys',
        'Security & audit: MFA policy, session limits, IP restrictions, audit log viewer',
        'AI settings: confidence thresholds, auto-match, cost code suggestion, risk detection',
        'Config versioning: snapshots with diffs, rollback within 50 versions (GAP-031)',
        'Regional & jurisdiction: tax, lien law, building codes, work hours, holidays per location (GAP-036 to GAP-050)',
        'Config templates: industry starting templates for quick onboarding (GAP-032, GAP-033)',
        'Progressive disclosure: setup completeness score, complexity monitoring (GAP-034)',
      ]}
      connections={[
        { name: 'Module 1 (Auth)', type: 'bidirectional', description: 'Users, roles, RBAC, permissions, sessions' },
        { name: 'Module 2 (Config)', type: 'bidirectional', description: 'Central config store, all settings' },
        { name: 'Module 3 (Core Data)', type: 'bidirectional', description: 'Import/export, audit trail, backup' },
        { name: 'Module 5 (Notifications)', type: 'output', description: 'Event routing, channel config' },
        { name: 'Module 9 (Budget)', type: 'output', description: 'Cost codes, approval thresholds' },
        { name: 'Module 16 (QuickBooks)', type: 'bidirectional', description: 'Integration sync status' },
        { name: 'Module 43 (Billing)', type: 'bidirectional', description: 'Subscription plan, Stripe' },
        { name: 'Client Portal', type: 'output', description: 'Branding, feature toggles' },
        { name: 'Vendor Portal', type: 'output', description: 'Access configuration' },
        { name: 'AI Processing', type: 'output', description: 'Confidence thresholds, auto-route rules' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Company (builder) ID' },
        { name: 'name', type: 'string', required: true, description: 'Company display name' },
        { name: 'legal_name', type: 'string', description: 'Legal entity name' },
        { name: 'logo_url', type: 'string', description: 'Company logo' },
        { name: 'primary_color', type: 'string', description: 'Brand primary color (hex)' },
        { name: 'address', type: 'jsonb', description: 'Company address' },
        { name: 'phone', type: 'string', description: 'Company phone' },
        { name: 'email', type: 'string', description: 'Company email' },
        { name: 'license_number', type: 'string', description: 'Contractor license' },
        { name: 'ein', type: 'string', description: 'Employer ID' },
        { name: 'timezone', type: 'string', description: 'Company timezone (IANA)' },
        { name: 'subscription_plan', type: 'string', description: 'Current plan tier' },
        { name: 'subscription_status', type: 'string', description: 'trial | active | lapsed | cancelled' },
        { name: 'permissions_mode', type: 'string', description: 'open | standard | strict' },
        { name: 'tenant_configs', type: 'jsonb', description: 'Key-value config by section' },
        { name: 'workflow_definitions', type: 'jsonb', description: 'State machines per entity type' },
        { name: 'cost_codes', type: 'tree', description: 'Hierarchical cost code structure' },
        { name: 'phase_templates', type: 'jsonb', description: 'Ordered phase list' },
        { name: 'terminology_overrides', type: 'jsonb', description: 'Display term mappings' },
        { name: 'numbering_patterns', type: 'jsonb', description: 'Pattern + scope per entity' },
        { name: 'custom_field_definitions', type: 'jsonb', description: 'EAV field definitions' },
        { name: 'feature_flags', type: 'jsonb', description: 'Enabled features per plan' },
        { name: 'jurisdiction_configs', type: 'jsonb', description: 'Location-based config values' },
        { name: 'config_versions', type: 'jsonb', description: 'Versioned snapshots with diffs' },
      ]}
      aiFeatures={[
        { name: 'Settings Recommendations', description: 'AI suggests optimal settings based on company size, usage patterns, and industry benchmarks', trigger: 'On settings view' },
        { name: 'Usage Analytics', description: 'Shows which features are used most and suggests optimization opportunities', trigger: 'Dashboard' },
        { name: 'Workflow Validation', description: 'Detects cycles, dead ends, and unreachable states in approval workflow definitions', trigger: 'On workflow save' },
        { name: 'Complexity Monitoring', description: 'Tracks custom fields, workflow steps, conditional rules and warns if thresholds exceeded', trigger: 'On config change' },
        { name: 'Jurisdiction Data Freshness', description: 'Flags jurisdiction data older than 12 months for review, integrates with authoritative sources', trigger: 'Daily check' },
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
    />}
    </div>
  )
}
