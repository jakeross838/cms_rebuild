'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { CompanySettingsPreview } from '@/components/skeleton/previews/company-settings-preview'
import { cn } from '@/lib/utils'

export default function CompanySettingsPage() {
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
      {activeTab === 'preview' ? <CompanySettingsPreview /> : <PageSpec
      title="Company Settings"
      phase="Phase 1 - Foundation"
      planFile="docs/modules/02-configuration-engine.md"
      description="Configure company-wide settings following a 4-level hierarchy: Platform Defaults > Company > Project > User Preferences. Includes company profile, branding, defaults, approval workflows, cost codes, phases, terminology, numbering, custom fields, feature flags, users/roles, notifications, templates, data management, security, and config versioning."
      workflow={['Quick Start Wizard (5 min)', 'Guided Setup (30 min)', 'Advanced Config (ongoing)', 'Review & Save', 'Config versioned automatically']}
      features={[
        'Company profile: name, legal name, license, EIN, address, contact',
        'Logo and branding: colors, portal theme, email header/footer',
        'Financial defaults: markup, retainage, tax rate, payment terms',
        'Regional settings: timezone, currency, fiscal year, state (lien law / tax)',
        'Approval workflows: configurable state machines per entity type (GAP-016, GAP-022)',
        'Cost code management: CSI/custom/hybrid hierarchy, import from CSV (GAP-017)',
        'Project phases: ordered list with colors and default durations (GAP-018)',
        'Terminology engine: ~50 customizable display terms (GAP-019)',
        'Numbering sequences: configurable patterns with tokens (GAP-021)',
        'Custom fields: EAV on any entity, conditional visibility (GAP-023, GAP-024)',
        'Required fields configuration with conditional logic (GAP-029, GAP-030)',
        'Feature flags: per-tenant module toggles tied to subscription plan (GAP-003)',
        'Users & roles: 7 canonical system roles, custom roles, permissions mode (open/standard/strict)',
        'Permission Wizard for guided user setup',
        'Config versioning with rollback (GAP-031)',
        'Config templates: industry starting templates (GAP-032, GAP-033)',
        'Progressive disclosure: complexity budget, setup completeness score (GAP-034)',
        'Jurisdiction configuration: tax, lien law, building codes by location (GAP-036 to GAP-050)',
        'Data management: backup, import, export, retention',
        'Security: MFA policy, session management, audit log viewer',
      ]}
      connections={[
        { name: 'All Modules', type: 'output', description: 'Every module reads tenant config via resolveConfig()' },
        { name: 'Module 1 (Auth)', type: 'bidirectional', description: 'User management, roles, RBAC, permissions mode' },
        { name: 'Module 2 (Config Engine)', type: 'bidirectional', description: 'Central config store, workflows, custom fields' },
        { name: 'Module 5 (Notifications)', type: 'output', description: 'Event routing, channel config, templates' },
        { name: 'Module 9 (Budget)', type: 'output', description: 'Cost code structure drives budget line items' },
        { name: 'Integrations', type: 'output', description: 'QuickBooks, Calendar, Email connections' },
        { name: 'Client Portal', type: 'output', description: 'Portal branding, feature toggles' },
        { name: 'Vendor Portal', type: 'output', description: 'Vendor access configuration' },
        { name: 'AI Processing', type: 'output', description: 'Confidence thresholds, auto-match settings' },
        { name: 'Billing (Stripe)', type: 'bidirectional', description: 'Subscription plan, feature gating (owner only)' },
      ]}
      dataFields={[
        { name: 'company_name', type: 'string', required: true, description: 'Company display name' },
        { name: 'legal_name', type: 'string', description: 'Legal entity name' },
        { name: 'license_number', type: 'string', description: 'Contractor license number' },
        { name: 'ein', type: 'string', description: 'Employer Identification Number' },
        { name: 'logo_url', type: 'string', description: 'Company logo URL' },
        { name: 'primary_color', type: 'string', description: 'Brand primary color (hex)' },
        { name: 'address', type: 'jsonb', description: 'Company address (line1, city, state, zip)' },
        { name: 'phone', type: 'string', description: 'Main phone number' },
        { name: 'email', type: 'string', description: 'Main email address' },
        { name: 'website', type: 'string', description: 'Company website' },
        { name: 'timezone', type: 'string', description: 'Company timezone (IANA format)' },
        { name: 'subscription_plan', type: 'string', description: 'Current plan tier' },
        { name: 'subscription_status', type: 'string', description: 'trial | active | lapsed | cancelled' },
        { name: 'tenant_configs', type: 'jsonb', description: 'All config key-value pairs by section' },
        { name: 'workflow_definitions', type: 'jsonb', description: 'State machine definitions per entity type' },
        { name: 'cost_codes', type: 'tree', description: 'Hierarchical cost code structure' },
        { name: 'phase_templates', type: 'jsonb', description: 'Ordered phase list with colors and durations' },
        { name: 'terminology_overrides', type: 'jsonb', description: 'Custom display term mappings' },
        { name: 'numbering_patterns', type: 'jsonb', description: 'Pattern + scope per entity type' },
        { name: 'custom_field_definitions', type: 'jsonb', description: 'EAV field definitions per entity type' },
        { name: 'feature_flags', type: 'jsonb', description: 'Enabled features per plan tier' },
        { name: 'config_versions', type: 'jsonb', description: 'Versioned config snapshots with diffs' },
        { name: 'jurisdiction_configs', type: 'jsonb', description: 'State/county/municipality config values' },
        { name: 'permissions_mode', type: 'string', description: 'open | standard | strict' },
      ]}
      aiFeatures={[
        {
          name: 'Setup Assistant',
          description: 'Guides configuration. "Based on your business type, recommend setting default markup to 18% and enabling lien waiver requirements."',
          trigger: 'On initial setup / Quick Start Wizard'
        },
        {
          name: 'Optimization Suggestions',
          description: 'Identifies improvements. "Your approval thresholds are lower than industry average. You approve 40% more items manually than similar companies."',
          trigger: 'Periodic review / settings view'
        },
        {
          name: 'Workflow Validation',
          description: 'Validates workflow definitions for cycles, dead ends, and unreachable states using directed graph analysis.',
          trigger: 'On workflow save'
        },
        {
          name: 'Complexity Monitoring',
          description: 'Tracks configuration complexity (custom fields, workflow steps, conditional rules) and warns if thresholds exceeded.',
          trigger: 'On config change'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Company Settings                                                    │
├─────────────────────────────────────────────────────────────────────┤
│ SECTIONS                                                            │
│ ┌───────────────────┐                                               │
│ │ ▸ Company Profile │ ← Selected                                   │
│ │   Business Info   │                                               │
│ │   Branding        │                                               │
│ │   Defaults        │                                               │
│ │   Notifications   │                                               │
│ │   Templates       │                                               │
│ │   Users & Roles   │                                               │
│ │   Data            │                                               │
│ └───────────────────┘                                               │
├─────────────────────────────────────────────────────────────────────┤
│ COMPANY PROFILE                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Company Name: Ross Built Custom Homes                           │ │
│ │ License #: CGC123456 (Florida)                                  │ │
│ │                                                                 │ │
│ │ Address: 123 Main Street                                        │ │
│ │          Clearwater, FL 33756                                   │ │
│ │                                                                 │ │
│ │ Phone: (727) 555-0100                                          │ │
│ │ Email: info@rossbuilt.com                                      │ │
│ │ Website: www.rossbuilt.com                                     │ │
│ │                                                                 │ │
│ │ Logo: [Ross Built Logo]  [Upload New]                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ [Save Changes]                                                      │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
